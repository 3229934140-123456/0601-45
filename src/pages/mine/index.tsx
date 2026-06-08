import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/useAppStore'
import { userProfile } from '@/data/notifications'
import type { UserProfile } from '@/types'
import styles from './index.module.scss'

const MinePage: React.FC = () => {
  const notificationSettings = useAppStore(state => state.userProfile.notificationSettings)
  const toggleNotificationSetting = useAppStore(state => state.toggleNotificationSetting)
  const getFavoritePipelines = useAppStore(state => state.getFavoritePipelines)
  const getApprovalsByTeam = useAppStore(state => state.getApprovalsByTeam)
  const favoritePipelinesStore = useAppStore(state => state.favoritePipelines)

  const [statusBarHeight, setStatusBarHeight] = useState(20)
  const [profile] = useState<UserProfile>(userProfile)

  const favoritePipelines = useMemo(() => getFavoritePipelines(), [
    getFavoritePipelines,
    favoritePipelinesStore
  ])

  const pendingApprovals = useMemo(
    () => getApprovalsByTeam('all').filter(a => a.status === 'pending'),
    [getApprovalsByTeam]
  )

  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 20)
  }, [])

  const handleToggleSetting = (key: keyof UserProfile['notificationSettings']) => {
    console.log('[Mine] toggle setting:', key)
    toggleNotificationSetting(key)
  }

  const goToChangeRecord = () => {
    Taro.navigateTo({
      url: '/pages/change-record/index'
    })
  }

  const goToFavorites = () => {
    Taro.switchTab({ url: '/pages/pipeline/index' })
  }

  const menuItems = [
    { icon: '🔔', title: '构建失败提醒', desc: '构建失败时发送通知', key: 'buildFailed', type: 'switch' },
    { icon: '✅', title: '构建成功提醒', desc: '构建成功时发送通知', key: 'buildSuccess', type: 'switch' },
    { icon: '📋', title: '待审批提醒', desc: '有新的审批时通知', key: 'approvalPending', type: 'switch' },
    { icon: '📝', title: '审批结果通知', desc: '审批通过/拒绝时通知', key: 'approvalDone', type: 'switch' }
  ] as const

  const stats = [
    { value: favoritePipelines.length, label: '收藏' },
    { value: pendingApprovals.length, label: '待审批' },
    { value: profile.notificationSettings.buildFailed ? '开' : '关', label: '失败提醒' }
  ]

  return (
    <ScrollView scrollY className={styles.page}>
      <View
        className={styles.header}
        style={{ paddingTop: statusBarHeight + 40 + 'rpx' }}
      >
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={profile.avatar}
            mode="aspectFill"
          />
          <View className={styles.info}>
            <Text className={styles.name}>{profile.name}</Text>
            <Text className={styles.role}>{profile.role}</Text>
            <Text className={styles.team}>{profile.team} · {profile.email}</Text>
          </View>
          <View className={styles.settingBtn}>
            <Text>⚙️</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={index} className={styles.statItem}>
            <Text className={styles.value}>{stat.value}</Text>
            <Text className={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>我的收藏</Text>
        <View className={styles.favoriteSection}>
          <View className={styles.favoriteList}>
            {favoritePipelines.length > 0 ? (
              favoritePipelines.slice(0, 6).map(pipe => (
                <Text
                  key={pipe.id}
                  className={styles.favoriteTag}
                  onClick={goToFavorites}
                >
                  ★ {pipe.name}
                </Text>
              ))
            ) : (
              <Text className={styles.favoriteTag}>暂无收藏</Text>
            )}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>通知设置</Text>
        <View className={styles.menuList}>
          {menuItems.map(item => (
            <View key={item.key} className={styles.menuItem}>
              <View className={classnames(styles.icon, styles.info)}>
                <Text>{item.icon}</Text>
              </View>
              <View className={styles.content}>
                <Text className={styles.title}>{item.title}</Text>
                <Text className={styles.desc}>{item.desc}</Text>
              </View>
              <View
                className={classnames(styles.switch, notificationSettings[item.key] && styles.on)}
                onClick={() => handleToggleSetting(item.key)}
              />
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>其他</Text>
        <View className={styles.menuList}>
          <View className={styles.menuItem} onClick={goToChangeRecord}>
            <View className={classnames(styles.icon, styles.success)}>
              <Text>📜</Text>
            </View>
            <View className={styles.content}>
              <Text className={styles.title}>变更记录</Text>
              <Text className={styles.desc}>查看代码提交和构建变更</Text>
            </View>
            <Text className={styles.arrow}>›</Text>
          </View>
          <View className={styles.menuItem}>
            <View className={classnames(styles.icon, styles.warning)}>
              <Text>❓</Text>
            </View>
            <View className={styles.content}>
              <Text className={styles.title}>帮助与反馈</Text>
              <Text className={styles.desc}>常见问题和意见反馈</Text>
            </View>
            <Text className={styles.arrow}>›</Text>
          </View>
          <View className={styles.menuItem}>
            <View className={classnames(styles.icon, styles.error)}>
              <Text>ℹ️</Text>
            </View>
            <View className={styles.content}>
              <Text className={styles.title}>关于</Text>
              <Text className={styles.desc}>版本 v1.0.0</Text>
            </View>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default MinePage
