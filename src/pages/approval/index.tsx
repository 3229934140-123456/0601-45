import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore, TEAM_PROJECT_MAP } from '@/store/useAppStore'
import { getApprovalStatusText, formatTime } from '@/utils'
import type { ApprovalStatus, Approval } from '@/types'
import styles from './index.module.scss'

type TabType = 'pending' | 'all'

const ApprovalPage: React.FC = () => {
  const currentTeam = useAppStore(state => state.currentTeam)
  const approvals = useAppStore(state => state.approvals)
  const pipelines = useAppStore(state => state.pipelines)
  const getBuildByPipelineAndNumber = useAppStore(state => state.getBuildByPipelineAndNumber)
  const updateApprovalStatus = useAppStore(state => state.updateApprovalStatus)

  const [activeTab, setActiveTab] = useState<TabType>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [approvalList, setApprovalList] = useState<Approval[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const filteredList = useMemo(() => {
    let list = approvals
    if (currentTeam !== 'all') {
      const projectIds = TEAM_PROJECT_MAP[currentTeam] || []
      const teamPipelineNames = pipelines
        .filter(p => projectIds.includes(p.projectId))
        .map(p => p.name)
      list = list.filter(a => teamPipelineNames.includes(a.pipelineName))
    }
    if (activeTab === 'pending') {
      return list.filter(a => a.status === 'pending')
    }
    return list
  }, [currentTeam, activeTab, approvals, pipelines])

  const pendingCount = useMemo(() => {
    let list = approvals
    if (currentTeam !== 'all') {
      const projectIds = TEAM_PROJECT_MAP[currentTeam] || []
      const teamPipelineNames = pipelines
        .filter(p => projectIds.includes(p.projectId))
        .map(p => p.name)
      list = list.filter(a => teamPipelineNames.includes(a.pipelineName))
    }
    return list.filter(a => a.status === 'pending').length
  }, [currentTeam, approvals, pipelines])

  usePullDownRefresh(() => {
    console.log('[Approval] pull down refresh')
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  const handleApprove = (id: string) => {
    console.log('[Approval] approve:', id)
    Taro.showModal({
      title: '确认通过',
      content: '确定要通过该审批吗？',
      confirmText: '通过',
      confirmColor: '#00b42a',
      success: res => {
        if (res.confirm) {
          const success = updateApprovalStatus(id, 'approved')
          if (success) {
            Taro.showToast({ title: '已通过', icon: 'success' })
          }
        }
      }
    })
  }

  const handleReject = (id: string) => {
    console.log('[Approval] reject:', id)
    Taro.showModal({
      title: '确认拒绝',
      content: '确定要拒绝该审批吗？',
      confirmText: '拒绝',
      confirmColor: '#f53f3f',
      success: res => {
        if (res.confirm) {
          const success = updateApprovalStatus(id, 'rejected')
          if (success) {
            Taro.showToast({ title: '已拒绝', icon: 'none' })
          }
        }
      }
    })
  }

  const handleCardClick = (approval: Approval) => {
    setExpandedId(expandedId === approval.id ? null : approval.id)
  }

  const goToBuildDetail = (approval: Approval, e: React.MouseEvent) => {
    e.stopPropagation()
    const build = getBuildByPipelineAndNumber(approval.pipelineName, approval.buildNumber)
    if (build) {
      Taro.navigateTo({
        url: `/pages/build-detail/index?buildId=${build.id}`
      })
    } else {
      Taro.navigateTo({
        url: `/pages/build-detail/index?buildId=not-found-${approval.id}`
      })
    }
  }

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      release: '发布',
      deploy: '部署',
      rollback: '回滚'
    }
    return map[type] || type
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: '待审批', count: pendingCount },
    { key: 'all', label: '全部', count: filteredList.length }
  ]

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.filterTabs}>
          {tabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.tab, activeTab === tab.key && styles.active)}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text>{tab.label}</Text>
              <Text className={styles.count}>{tab.count}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.approvalList}>
        {filteredList.length > 0 ? (
          filteredList.map(approval => (
            <View
              key={approval.id}
              className={styles.approvalCard}
              onClick={() => handleCardClick(approval)}
            >
              <View className={styles.header}>
                <Text className={styles.typeTag}>{getTypeLabel(approval.type)}</Text>
                <Text className={classnames(styles.statusTag, styles[approval.status])}>
                  {getApprovalStatusText(approval.status)}
                </Text>
              </View>

              <Text className={styles.title}>{approval.title}</Text>
              <Text className={styles.projectInfo}>
                {approval.projectName} · #{approval.buildNumber}
              </Text>

              <View className={styles.description}>
                <Text>{approval.description}</Text>
              </View>

              <View className={styles.meta}>
                <View className={styles.metaItem}>
                  <Text>👤 {approval.applicant}</Text>
                </View>
                <View className={styles.metaItem}>
                  <Text>⏰ {formatTime(approval.applyTime)}</Text>
                </View>
              </View>

              {expandedId === approval.id && (
                <View className={styles.expandedSection}>
                  <View className={styles.impactSection}>
                    <Text className={styles.sectionLabel}>影响范围</Text>
                    <Text className={styles.impactText}>{approval.impactScope}</Text>
                  </View>

                  <View
                    className={styles.relatedBuild}
                    onClick={e => goToBuildDetail(approval, e)}
                  >
                    <View className={styles.buildInfo}>
                      <Text className={styles.buildLabel}>关联构建</Text>
                      <Text className={styles.buildLink}>#{approval.buildNumber} 查看详情 →</Text>
                    </View>
                  </View>

                  <View className={styles.approverSection}>
                    <Text className={styles.sectionLabel}>审批流程</Text>
                    <View className={styles.approverFlow}>
                      {approval.approvers.map((name, idx) => {
                        const isCurrent = name === approval.currentApprover && approval.status === 'pending'
                        const isApproved = approval.status === 'approved' || idx < approval.approvers.indexOf(approval.currentApprover)
                        return (
                          <View
                            key={idx}
                            className={classnames(
                              styles.approverNode,
                              isCurrent && styles.current,
                              isApproved && approval.status !== 'pending' && styles.done
                            )}
                          >
                            <View className={styles.approverDot}>
                              <Text>{isApproved && approval.status !== 'pending' ? '✓' : idx + 1}</Text>
                            </View>
                            <Text className={styles.approverName}>{name}</Text>
                            {idx < approval.approvers.length - 1 && (
                              <View className={styles.approverLine} />
                            )}
                          </View>
                        )
                      })}
                    </View>
                  </View>
                </View>
              )}

              {!expandedId && (
                <Text className={styles.expandHint}>点击展开详情 ▼</Text>
              )}

              {approval.status === 'pending' && (
                <View className={styles.actions} onClick={e => e.stopPropagation()}>
                  <Button
                    className={classnames(styles.btn, styles.reject)}
                    onClick={() => handleReject(approval.id)}
                  >
                    拒绝
                  </Button>
                  <Button
                    className={classnames(styles.btn, styles.approve)}
                    onClick={() => handleApprove(approval.id)}
                  >
                    通过
                  </Button>
                </View>
              )}
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>📋</Text>
            <Text className={styles.text}>暂无审批</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default ApprovalPage
