import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/useAppStore'
import { getRelativeTime, copyToClipboard, generateBuildUrl } from '@/utils'
import type { Notification } from '@/types'
import styles from './index.module.scss'

type FilterType = 'all' | 'build_failed' | 'build_success' | 'approval_pending' | 'approval_done' | 'system'

const NotificationPage: React.FC = () => {
  const notifications = useAppStore(state => state.notifications)
  const markNotificationRead = useAppStore(state => state.markNotificationRead)
  const markAllRead = useAppStore(state => state.markAllRead)
  const unreadCount = useAppStore(state => state.unreadCount)

  const [filterType, setFilterType] = useState<FilterType>('all')
  const [refreshing, setRefreshing] = useState(false)

  usePullDownRefresh(() => {
    console.log('[Notification] pull down refresh')
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  const filteredList = useMemo(() => {
    if (filterType === 'all') return notifications
    return notifications.filter(n => n.type === filterType)
  }, [notifications, filterType])

  const handleItemClick = (notification: Notification) => {
    console.log('[Notification] click:', notification.id)
    if (!notification.isRead) {
      markNotificationRead(notification.id)
    }

    if (notification.relatedType === 'build' && notification.relatedId) {
      Taro.navigateTo({
        url: `/pages/build-detail/index?buildId=${notification.relatedId}&source=notification`
      })
    } else if (notification.relatedType === 'approval' && notification.relatedId) {
      const setNavigateApprovalId = useAppStore.getState().setNavigateApprovalId
      setNavigateApprovalId(notification.relatedId)
      Taro.switchTab({ url: '/pages/approval/index' })
    }
  }

  const handleMarkAllRead = () => {
    console.log('[Notification] mark all read')
    if (unreadCount > 0) {
      markAllRead()
      Taro.showToast({ title: '已全部标记为已读', icon: 'success' })
    }
  }

  const handleForward = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('[Notification] forward:', notification.id)
    const url = generateBuildUrl(notification.relatedId)
    copyToClipboard(url).then(success => {
      if (success) {
        Taro.showToast({ title: '链接已复制', icon: 'success' })
      }
    })
  }

  const getIconEmoji = (type: string) => {
    const map: Record<string, string> = {
      build_failed: '❌',
      build_success: '✅',
      approval_pending: '📋',
      approval_done: '📝',
      system: '🔔'
    }
    return map[type] || '📢'
  }

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'build_failed', label: '构建失败' },
    { key: 'build_success', label: '构建成功' },
    { key: 'approval_pending', label: '待审批' },
    { key: 'approval_done', label: '审批结果' },
    { key: 'system', label: '系统' }
  ]

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>通知中心</Text>
        <Text
          className={styles.markAllRead}
          onClick={handleMarkAllRead}
        >
          全部已读
        </Text>
      </View>

      <View className={styles.typeFilter}>
        {filters.map(filter => (
          <View
            key={filter.key}
            className={classnames(styles.filterItem, filterType === filter.key && styles.active)}
            onClick={() => setFilterType(filter.key)}
          >
            <Text>{filter.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.notificationList}>
        {filteredList.length > 0 ? (
          filteredList.map(notification => (
            <View
              key={notification.id}
              className={classnames(
                styles.notificationItem,
                !notification.isRead && styles.unread
              )}
              onClick={() => handleItemClick(notification)}
            >
              <View className={styles.header}>
                <View className={classnames(styles.icon, styles[notification.type])}>
                  <Text>{getIconEmoji(notification.type)}</Text>
                </View>
                <View className={styles.contentWrapper}>
                  <Text className={styles.title}>{notification.title}</Text>
                  <Text className={styles.content}>{notification.content}</Text>
                </View>
              </View>
              <Text className={styles.time}>{getRelativeTime(notification.time)}</Text>
              {notification.relatedType === 'build' && (
                <View className={styles.actions} onClick={e => e.stopPropagation()}>
                  <Text
                    className={styles.actionBtn}
                    onClick={e => handleForward(notification, e)}
                  >
                    转发链接
                  </Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>🔔</Text>
            <Text className={styles.text}>暂无通知</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default NotificationPage
