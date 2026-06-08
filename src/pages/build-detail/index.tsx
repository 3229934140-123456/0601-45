import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Button, Textarea } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import StatusBadge from '@/components/StatusBadge'
import PhaseItem from '@/components/PhaseItem'
import { useAppStore } from '@/store/useAppStore'
import { formatDuration, formatFullTime, copyToClipboard, generateBuildUrl } from '@/utils'
import type { Build } from '@/types'
import styles from './index.module.scss'

const BuildDetailPage: React.FC = () => {
  const router = useRouter()
  const buildId = router.params.buildId || 'build-1'

  const getBuildById = useAppStore(state => state.getBuildById)
  const retryBuild = useAppStore(state => state.retryBuild)
  const cancelPendingBuild = useAppStore(state => state.cancelPendingBuild)
  const getBuildRemark = useAppStore(state => state.getBuildRemark)
  const setBuildRemark = useAppStore(state => state.setBuildRemark)

  const [build, setBuild] = useState<Build | null>(null)
  const [remark, setRemark] = useState('')
  const [isEditingRemark, setIsEditingRemark] = useState(false)
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const loadBuild = useCallback(() => {
    const found = getBuildById(buildId)
    if (found) {
      setBuild(found)
      setNotFound(false)
      const savedRemark = getBuildRemark(buildId)
      if (savedRemark) {
        setRemark(savedRemark)
      } else {
        setRemark('')
      }
    } else {
      setBuild(null)
      setNotFound(true)
    }
  }, [buildId, getBuildById, getBuildRemark])

  useEffect(() => {
    loadBuild()
  }, [loadBuild])

  useDidShow(() => {
    loadBuild()
  })

  const handleRetry = () => {
    if (!build) return
    console.log('[BuildDetail] retry build:', build.id)
    Taro.showModal({
      title: '确认重试',
      content: '确定要重新执行这次构建吗？',
      success: res => {
        if (res.confirm) {
          const newBuild = retryBuild(build.id)
          if (newBuild) {
            Taro.showToast({ title: '已触发重试', icon: 'success' })
            setTimeout(() => {
              Taro.redirectTo({
                url: `/pages/build-detail/index?buildId=${newBuild.id}`
              })
            }, 800)
          } else {
            Taro.showToast({ title: '重试失败', icon: 'none' })
          }
        }
      }
    })
  }

  const handleCancel = () => {
    if (!build) return
    console.log('[BuildDetail] cancel pending build:', build.id)
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消这次排队中的构建吗？',
      success: res => {
        if (res.confirm) {
          const success = cancelPendingBuild(build.id)
          if (success) {
            Taro.showToast({ title: '已取消排队', icon: 'success' })
            loadBuild()
          }
        }
      }
    })
  }

  const handleShare = () => {
    if (!build) return
    console.log('[BuildDetail] share build:', build.id)
    const url = generateBuildUrl(build.id)
    copyToClipboard(url).then(success => {
      if (success) {
        Taro.showToast({ title: '链接已复制', icon: 'success' })
      }
    })
    setShowActionSheet(false)
  }

  const handleMore = () => {
    setShowActionSheet(true)
  }

  const handleSaveRemark = () => {
    if (!build) return
    console.log('[BuildDetail] save remark:', remark)
    setBuildRemark(build.id, remark)
    setIsEditingRemark(false)
    Taro.showToast({ title: '备注已保存', icon: 'success' })
  }

  const goToChangeRecord = () => {
    if (!build) return
    Taro.navigateTo({
      url: `/pages/change-record/index?buildId=${build.id}`
    })
  }

  const goBack = () => {
    Taro.navigateBack()
  }

  const goToAllBuilds = () => {
    Taro.switchTab({
      url: '/pages/pipeline/index'
    })
  }

  if (notFound) {
    return (
      <View className={styles.page}>
        <View className={styles.notFoundPage}>
          <Text className={styles.notFoundIcon}>📭</Text>
          <Text className={styles.notFoundTitle}>构建记录不存在</Text>
          <Text className={styles.notFoundDesc}>这条构建记录可能已被删除或链接无效</Text>
          <View className={styles.notFoundActions}>
            <Button className={classnames(styles.btn, styles.secondary)} onClick={goBack}>
              返回
            </Button>
            <Button className={classnames(styles.btn, styles.primary)} onClick={goToAllBuilds}>
              查看全部构建
            </Button>
          </View>
        </View>
      </View>
    )
  }

  if (!build) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    )
  }

  const showCancelButton = build.status === 'pending'
  const showRetryButton = build.status === 'failed' || build.status === 'cancelled' || build.status === 'success'

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.statusRow}>
          <StatusBadge status={build.status} showDot />
          <Text className={styles.buildNumber}>#{build.buildNumber}</Text>
        </View>
        <Text className={styles.buildTitle}>{build.pipelineName}</Text>
        <Text className={styles.projectInfo}>
          {build.projectName} · {build.branch}
        </Text>
        <View className={styles.metaGrid}>
          <View className={styles.metaItem}>
            <Text className={styles.value}>{formatDuration(build.duration)}</Text>
            <Text className={styles.label}>总耗时</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.value}>{build.triggerUser}</Text>
            <Text className={styles.label}>触发人</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.value}>{build.triggerType}</Text>
            <Text className={styles.label}>触发方式</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>构建阶段</Text>
          <Text className={styles.action}>{build.phases.length} 个阶段</Text>
        </View>
        <View className={styles.phaseList}>
          {build.phases.map(phase => (
            <PhaseItem key={phase.id} phase={phase} />
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>提交信息</Text>
          <Text className={styles.action} onClick={goToChangeRecord}>查看变更 →</Text>
        </View>
        <View className={styles.sectionContent}>
          <View className={styles.commitInfo}>
            <Text className={styles.commitMessage}>{build.commitMessage}</Text>
            <Text className={styles.commitHash}>{build.commitHash.slice(0, 8)}</Text>
            <View className={styles.commitMeta}>
              <Text>{build.triggerUser}</Text>
              <Text>{formatFullTime(build.startTime)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>备注</Text>
          {!isEditingRemark && (
            <Text className={styles.action} onClick={() => setIsEditingRemark(true)}>
              {remark ? '编辑' : '添加'}
            </Text>
          )}
        </View>
        <View className={styles.sectionContent}>
          <View className={styles.remarkSection}>
            {isEditingRemark ? (
              <>
                <Textarea
                  className={styles.remarkInput}
                  placeholder="添加备注信息..."
                  value={remark}
                  onInput={e => setRemark(e.detail.value)}
                  maxlength={200}
                />
                <View className={styles.remarkActions}>
                  <Button
                    className={classnames(styles.btn, styles.cancel)}
                    onClick={() => setIsEditingRemark(false)}
                  >
                    取消
                  </Button>
                  <Button
                    className={classnames(styles.btn, styles.save)}
                    onClick={handleSaveRemark}
                  >
                    保存
                  </Button>
                </View>
              </>
            ) : remark ? (
              <View className={styles.remarkContent} onClick={() => setIsEditingRemark(true)}>
                <Text>{remark}</Text>
              </View>
            ) : (
              <View className={styles.remarkEmpty} onClick={() => setIsEditingRemark(true)}>
                <Text>点击添加备注</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.btn, styles.secondary, styles.btnSmall)}
          onClick={handleMore}
        >
          ...
        </Button>
        {showCancelButton && (
          <Button
            className={classnames(styles.btn, styles.danger)}
            onClick={handleCancel}
          >
            取消排队
          </Button>
        )}
        {showRetryButton && (
          <Button
            className={classnames(styles.btn, styles.primary)}
            onClick={handleRetry}
          >
            ⟳ 重试
          </Button>
        )}
        {!showCancelButton && !showRetryButton && (
          <Button
            className={classnames(styles.btn, styles.primary)}
            onClick={handleShare}
          >
            转发链接
          </Button>
        )}
        {(showCancelButton || showRetryButton) && (
          <Button
            className={classnames(styles.btn, styles.secondary)}
            onClick={handleShare}
          >
            转发
          </Button>
        )}
      </View>

      {showActionSheet && (
        <View className={styles.actionSheet}>
          <View className={styles.actionItem} onClick={handleShare}>
            <Text className={styles.icon}>🔗</Text>
            <Text className={styles.text}>复制链接</Text>
          </View>
          <View className={styles.actionItem}>
            <Text className={styles.icon}>📤</Text>
            <Text className={styles.text}>分享</Text>
          </View>
          <View className={styles.actionItem}>
            <Text className={styles.icon}>📋</Text>
            <Text className={styles.text}>查看日志</Text>
          </View>
          <View
            className={classnames(styles.actionItem, styles.danger)}
            onClick={() => setShowActionSheet(false)}
          >
            <Text className={styles.icon}>✕</Text>
            <Text className={styles.text}>取消</Text>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default BuildDetailPage
