import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { usePullDownRefresh, useRouter, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore, TEAM_PROJECT_MAP } from '@/store/useAppStore'
import { getApprovalStatusText, formatTime, assessRisk, getRiskLevelText } from '@/utils'
import type { ApprovalStatus, Approval, ApprovalRecord } from '@/types'
import styles from './index.module.scss'

type TabType = 'pending' | 'all' | 'risk'

const ApprovalPage: React.FC = () => {
  const router = useRouter()
  const currentTeam = useAppStore(state => state.currentTeam)
  const approvals = useAppStore(state => state.approvals)
  const pipelines = useAppStore(state => state.pipelines)
  const builds = useAppStore(state => state.builds)
  const getBuildByPipelineAndNumber = useAppStore(state => state.getBuildByPipelineAndNumber)
  const updateApprovalStatus = useAppStore(state => state.updateApprovalStatus)
  const changeRecords = useAppStore(state => state.changeRecords)
  const consumeNavigateApprovalId = useAppStore(state => state.consumeNavigateApprovalId)

  const [activeTab, setActiveTab] = useState<TabType>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const approvalId = router.params.approvalId
    if (approvalId) {
      setExpandedId(approvalId)
      setActiveTab('all')
      setTimeout(() => {
        const el = document.getElementById(`approval-${approvalId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }, [router.params])

  useDidShow(() => {
    const approvalId = consumeNavigateApprovalId()
    if (approvalId) {
      setExpandedId(approvalId)
      setActiveTab('all')
      setTimeout(() => {
        const el = document.getElementById(`approval-${approvalId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  })

  const teamApprovals = useMemo(() => {
    let list = approvals
    if (currentTeam !== 'all') {
      const projectIds = TEAM_PROJECT_MAP[currentTeam] || []
      const teamPipelineNames = pipelines
        .filter(p => projectIds.includes(p.projectId))
        .map(p => p.name)
      list = list.filter(a => teamPipelineNames.includes(a.pipelineName))
    }
    return list
  }, [currentTeam, approvals, pipelines])

  const pendingCount = useMemo(() => {
    return teamApprovals.filter(a => a.status === 'pending').length
  }, [teamApprovals])

  const allCount = useMemo(() => {
    return teamApprovals.length
  }, [teamApprovals])

  const getApprovalRisk = (approval: Approval) => {
    const build = getBuildByPipelineAndNumber(approval.pipelineName, approval.buildNumber)
    const changes = changeRecords.filter(c => c.relatedBuildId === build?.id)
    const changeCount = changes.reduce((sum, c) => sum + c.filesChanged.length, 0)
    const isCoreModule = approval.impactScope.includes('核心') || approval.impactScope.includes('主链路')
    return assessRisk({
      buildStatus: build?.status,
      changeCount,
      impactScope: approval.impactScope,
      isCoreModule
    })
  }

  const riskCount = useMemo(() => {
    return teamApprovals.filter(a => {
      if (a.status !== 'pending') return false
      const risk = getApprovalRisk(a)
      return risk.level === 'high' || risk.level === 'medium'
    }).length
  }, [teamApprovals])

  const filteredList = useMemo(() => {
    if (activeTab === 'pending') {
      return teamApprovals.filter(a => a.status === 'pending')
    }
    if (activeTab === 'risk') {
      return teamApprovals
        .filter(a => a.status === 'pending')
        .map(a => ({ approval: a, risk: getApprovalRisk(a) }))
        .sort((a, b) => b.risk.score - a.risk.score)
        .map(item => item.approval)
    }
    return [...teamApprovals].sort((a, b) =>
      new Date(b.applyTime).getTime() - new Date(a.applyTime).getTime()
    )
  }, [activeTab, teamApprovals])

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
    const buildId = build ? build.id : `not-found-${approval.id}`
    Taro.navigateTo({
      url: `/pages/build-detail/index?buildId=${buildId}&source=approval&approvalId=${approval.id}`
    })
  }

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      release: '发布',
      deploy: '部署',
      rollback: '回滚'
    }
    return map[type] || type
  }

  const getRecordStatusText = (status: ApprovalRecord['status']) => {
    const map: Record<string, string> = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已拒绝'
    }
    return map[status] || status
  }

  const renderTimeline = (approval: Approval) => {
    return (
      <View className={styles.timeline}>
        <View className={styles.timelineItem}>
          <View className={classnames(styles.timelineDot, styles.applyDot)}>
            <Text>📝</Text>
          </View>
          <View className={styles.timelineContent}>
            <View className={styles.timelineHeader}>
              <Text className={styles.timelineTitle}>提交申请</Text>
              <Text className={styles.timelineTime}>{formatTime(approval.applyTime)}</Text>
            </View>
            <Text className={styles.timelineUser}>申请人：{approval.applicant}</Text>
          </View>
          <View className={styles.timelineLine} />
        </View>

        {approval.approvalRecords.map((record, idx) => {
          const isLast = idx === approval.approvalRecords.length - 1
          const isCurrent = approval.status === 'pending' && record.approver === approval.currentApprover

          return (
            <View key={record.id} className={styles.timelineItem}>
              <View className={classnames(
                styles.timelineDot,
                record.status === 'approved' && styles.approvedDot,
                record.status === 'rejected' && styles.rejectedDot,
                record.status === 'pending' && isCurrent && styles.currentDot,
                record.status === 'pending' && !isCurrent && styles.pendingDot
              )}>
                <Text>
                  {record.status === 'approved' ? '✓' : record.status === 'rejected' ? '✗' : idx + 1}
                </Text>
              </View>
              <View className={styles.timelineContent}>
                <View className={styles.timelineHeader}>
                  <Text className={styles.timelineTitle}>{record.approver}</Text>
                  {record.role && <Text className={styles.timelineRole}>{record.role}</Text>}
                  <Text className={classnames(
                    styles.timelineStatus,
                    styles[record.status],
                    isCurrent && styles.current
                  )}>
                    {isCurrent ? '审批中' : getRecordStatusText(record.status)}
                  </Text>
                </View>
                {record.time && (
                  <Text className={styles.timelineTime}>{formatTime(record.time)}</Text>
                )}
                {record.remark && (
                  <Text className={styles.timelineRemark}>「{record.remark}」</Text>
                )}
              </View>
              {!isLast && <View className={classnames(
                styles.timelineLine,
                record.status === 'approved' && styles.lineDone
              )} />}
            </View>
          )
        })}
      </View>
    )
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: '待审批', count: pendingCount },
    { key: 'risk', label: '发布风险', count: riskCount },
    { key: 'all', label: '全部', count: allCount }
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
          filteredList.map(approval => {
            const risk = getApprovalRisk(approval)
            const build = getBuildByPipelineAndNumber(approval.pipelineName, approval.buildNumber)
            const changes = changeRecords.filter(c => c.relatedBuildId === build?.id)
            const changeCount = changes.reduce((sum, c) => sum + c.filesChanged.length, 0)
            const riskLevelCap = risk.level.charAt(0).toUpperCase() + risk.level.slice(1)
            const riskTagClass = styles['risk' + riskLevelCap]
            const riskBadgeClass = styles['riskBadge' + riskLevelCap]

            return (
            <View
              key={approval.id}
              id={`approval-${approval.id}`}
              className={classnames(
                styles.approvalCard,
                expandedId === approval.id && styles.expanded,
                activeTab === 'risk' && risk.level === 'high' && styles.riskHigh
              )}
              onClick={() => handleCardClick(approval)}
            >
              <View className={styles.cardHeader}>
                <View className={styles.headerLeft}>
                  <Text className={styles.typeTag}>{getTypeLabel(approval.type)}</Text>
                  <Text className={classnames(styles.statusTag, styles[approval.status])}>
                    {getApprovalStatusText(approval.status)}
                  </Text>
                  {approval.status === 'pending' && risk.level !== 'low' && (
                    <Text className={classnames(styles.riskTag, riskTagClass)}>
                      {getRiskLevelText(risk.level)}
                    </Text>
                  )}
                </View>
                <Text className={styles.expandIcon}>
                  {expandedId === approval.id ? '▲' : '▼'}
                </Text>
              </View>

              <Text className={styles.title}>{approval.title}</Text>
              <Text className={styles.projectInfo}>
                {approval.projectName} · #{approval.buildNumber}
              </Text>

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
                  <View className={styles.section}>
                    <Text className={styles.sectionLabel}>📋 申请说明</Text>
                    <Text className={styles.sectionText}>{approval.description}</Text>
                  </View>

                  <View className={styles.section}>
                    <Text className={styles.sectionLabel}>🎯 影响范围</Text>
                    <Text className={styles.sectionText}>{approval.impactScope}</Text>
                  </View>

                  {approval.status === 'pending' && (
                    <View className={styles.section}>
                      <View className={styles.riskHeader}>
                        <Text className={styles.sectionLabel}>
                          {risk.level === 'high' ? '⚠️' : risk.level === 'medium' ? '⚡' : '✅'} 发布风险评估
                        </Text>
                        <Text className={classnames(styles.riskBadge, riskBadgeClass)}>
                          {getRiskLevelText(risk.level)} · {risk.score} 分
                        </Text>
                      </View>
                      <View className={styles.riskSummary}>
                        <View className={styles.riskSummaryItem}>
                          <Text className={styles.riskSummaryLabel}>关联构建</Text>
                          <Text className={classnames(
                            styles.riskSummaryValue,
                            build?.status === 'failed' && styles.failed
                          )}>
                            {build ? (build.status === 'failed' ? '❌ 失败' : build.status === 'success' ? '✅ 成功' : '⏳ 进行中') : '未找到'}
                          </Text>
                        </View>
                        <View className={styles.riskSummaryItem}>
                          <Text className={styles.riskSummaryLabel}>变更文件</Text>
                          <Text className={styles.riskSummaryValue}>{changeCount} 个</Text>
                        </View>
                        <View className={styles.riskSummaryItem}>
                          <Text className={styles.riskSummaryLabel}>最近变更</Text>
                          <Text className={styles.riskSummaryValue}>{changes.length} 次</Text>
                        </View>
                      </View>
                      {risk.factors.length > 0 && (
                        <View className={styles.riskFactors}>
                          <Text className={styles.riskFactorsTitle}>风险依据</Text>
                          {risk.factors.map((factor, idx) => (
                            <View key={idx} className={styles.riskFactorItem}>
                              <Text className={styles.riskFactorDot}>•</Text>
                              <View className={styles.riskFactorContent}>
                                <Text className={styles.riskFactorLabel}>{factor.label}</Text>
                                <Text className={styles.riskFactorDesc}>{factor.description}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  <View
                    className={styles.relatedBuild}
                    onClick={e => goToBuildDetail(approval, e)}
                  >
                    <View className={styles.buildInfo}>
                      <Text className={styles.buildLabel}>🔗 关联构建</Text>
                      <Text className={styles.buildLink}>#{approval.buildNumber} 查看详情 →</Text>
                    </View>
                  </View>

                  <View className={styles.section}>
                    <Text className={styles.sectionLabel}>⏳ 审批时间线</Text>
                    {renderTimeline(approval)}
                  </View>
                </View>
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
          )}))
        : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>
              {activeTab === 'pending' ? '暂无待审批' : '暂无审批记录'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default ApprovalPage
