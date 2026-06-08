import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import classnames from 'classnames'
import { approvals } from '@/data/approvals'
import { getApprovalStatusText, formatTime } from '@/utils'
import type { ApprovalStatus } from '@/types'
import styles from './index.module.scss'

type TabType = 'pending' | 'all'

const ApprovalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending')
  const [approvalList, setApprovalList] = useState(approvals)
  const [refreshing, setRefreshing] = useState(false)

  usePullDownRefresh(() => {
    console.log('[Approval] pull down refresh')
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  const filteredList = useMemo(() => {
    if (activeTab === 'pending') {
      return approvalList.filter(a => a.status === 'pending')
    }
    return approvalList
  }, [activeTab, approvalList])

  const pendingCount = approvalList.filter(a => a.status === 'pending').length

  const handleApprove = (id: string) => {
    console.log('[Approval] approve:', id)
    Taro.showModal({
      title: '确认通过',
      content: '确定要通过该审批吗？',
      confirmText: '通过',
      confirmColor: '#00b42a',
      success: res => {
        if (res.confirm) {
          setApprovalList(list =>
            list.map(a => (a.id === id ? { ...a, status: 'approved' as ApprovalStatus } : a))
          )
          Taro.showToast({ title: '已通过', icon: 'success' })
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
          setApprovalList(list =>
            list.map(a => (a.id === id ? { ...a, status: 'rejected' as ApprovalStatus } : a))
          )
          Taro.showToast({ title: '已拒绝', icon: 'none' })
        }
      }
    })
  }

  const handleCardClick = (approval: typeof approvals[0]) => {
    Taro.navigateTo({
      url: `/pages/build-detail/index?buildId=build-3`
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

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: '待审批', count: pendingCount },
    { key: 'all', label: '全部', count: approvalList.length }
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

              <View className={styles.impactScope}>
                <Text className={styles.label}>影响范围：</Text>
                <Text>{approval.impactScope}</Text>
              </View>

              <View className={styles.approvers}>
                <Text className={styles.label}>审批人：</Text>
                <View className={styles.approverList}>
                  {approval.approvers.map((name, idx) => (
                    <Text
                      key={idx}
                      className={classnames(
                        styles.approver,
                        name === approval.currentApprover && approval.status === 'pending' && styles.current
                      )}
                    >
                      {name}
                    </Text>
                  ))}
                </View>
              </View>

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
