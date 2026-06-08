import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Button, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import StatusBadge from '@/components/StatusBadge'
import PhaseItem from '@/components/PhaseItem'
import { getBuildById, recentBuilds } from '@/data/builds'
import { formatDuration, formatFullTime, copyToClipboard, generateBuildUrl } from '@/utils'
import type { Build } from '@/types'
import styles from './index.module.scss'

const BuildDetailPage: React.FC = () => {
  const router = useRouter()
  const buildId = router.params.buildId || 'build-1'

  const [build, setBuild] = useState<Build | undefined>()
  const [remark, setRemark] = useState('')
  const [isEditingRemark, setIsEditingRemark] = useState(false)
  const [showActionSheet, setShowActionSheet] = useState(false)

  useEffect(() => {
    console.log('[BuildDetail] buildId:', buildId)
    const found = getBuildById(buildId) || recentBuilds[0]
    setBuild(found)
    if (found?.remark) {
      setRemark(found.remark)
    }
  }, [buildId])

  if (!build) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    )
  }

  const handleRetry = () => {
    console.log('[BuildDetail] retry build:', build.id)
    Taro.showModal({
      title: '确认重试',
      content: '确定要重新执行这次构建吗？',
      success: res => {
        if (res.confirm) {
          Taro.showToast({ title: '已触发重试', icon: 'success' })
        }
      }
    })
  }

  const handlePause = () => {
    console.log('[BuildDetail] pause build:', build.id)
    Taro.showModal({
      title: '确认暂停',
      content: build.status === 'pending' 
        ? '确定要取消这次排队中的构建吗？' 
        : '确定要暂停这次构建吗？',
      success: res => {
        if (res.confirm) {
          Taro.showToast({ title: '操作成功', icon: 'success' })
        }
      }
    })
  }

  const handleShare = () => {
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
    console.log('[BuildDetail] save remark:', remark)
    setIsEditingRemark(false)
    Taro.showToast({ title: '备注已保存', icon: 'success' })
  }

  const goToChangeRecord = () => {
    Taro.navigateTo({
      url: `/pages/change-record/index?buildId=${build.id}`
    })
  }

  const showPauseButton = build.status === 'running' || build.status === 'pending'
  const showRetryButton = build.status === 'failed' || build.status === 'cancelled'

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
              添加
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
        {showPauseButton && (
          <Button
            className={classnames(styles.btn, styles.danger)}
            onClick={handlePause}
          >
            {build.status === 'pending' ? '取消排队' : '暂停构建'}
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
        {!showPauseButton && !showRetryButton && (
          <Button
            className={classnames(styles.btn, styles.primary)}
            onClick={handleShare}
          >
            转发链接
          </Button>
        )}
        {(showPauseButton || showRetryButton) && (
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
