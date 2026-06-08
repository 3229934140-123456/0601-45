import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import classnames from 'classnames'
import StatCard from '@/components/StatCard'
import BuildCard from '@/components/BuildCard'
import { teams } from '@/data/projects'
import { recentBuilds } from '@/data/builds'
import { getFavoritePipelines } from '@/data/pipelines'
import { getPendingApprovals } from '@/data/approvals'
import { useAppStore } from '@/store/useAppStore'
import { userProfile } from '@/data/notifications'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const currentTeam = useAppStore(state => state.currentTeam)
  const setCurrentTeam = useAppStore(state => state.setCurrentTeam)
  const unreadCount = useAppStore(state => state.unreadCount)
  const [loading, setLoading] = useState(false)
  const [statusBarHeight, setStatusBarHeight] = useState(20)

  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 20)
  }, [])

  useDidShow(() => {
    console.log('[Home] page show')
  })

  usePullDownRefresh(() => {
    console.log('[Home] pull down refresh')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  const handleTeamChange = (teamId: string) => {
    setCurrentTeam(teamId)
  }

  const goToPipeline = () => {
    Taro.switchTab({ url: '/pages/pipeline/index' })
  }

  const goToApproval = () => {
    Taro.switchTab({ url: '/pages/approval/index' })
  }

  const goToNotification = () => {
    Taro.switchTab({ url: '/pages/notification/index' })
  }

  const goToFavorite = () => {
    Taro.switchTab({ url: '/pages/pipeline/index' })
  }

  const favoriteCount = getFavoritePipelines().length
  const pendingCount = getPendingApprovals().length
  const successRate = 91.5
  const weekBuilds = 56

  return (
    <ScrollView scrollY className={styles.page}>
      <View
        className={styles.header}
        style={{ paddingTop: statusBarHeight + 32 + 'rpx' }}
      >
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={userProfile.avatar}
            mode="aspectFill"
          />
          <View className={styles.info}>
            <Text className={styles.name}>{userProfile.name}</Text>
            <Text className={styles.role}>{userProfile.role} · {userProfile.team}</Text>
          </View>
          <View className={styles.teamSelect} onClick={() => {}}>
            <Text>{teams.find(t => t.id === currentTeam)?.name || '全部团队'}</Text>
            <Text>▼</Text>
          </View>
        </View>
        <Text className={styles.greeting}>今天是工作日，加油！</Text>
        <Text className={styles.subtitle}>共有 {weekBuilds} 次构建，成功率 {successRate}%</Text>
      </View>

      <View className={styles.statsGrid}>
        <StatCard
          value={weekBuilds}
          label="本周构建"
          trend="12%"
          trendUp
        />
        <StatCard
          value={`${successRate}%`}
          label="成功率"
          trend="2.3%"
          trendUp
        />
      </View>

      <View className={styles.section}>
        <View className={styles.quickActions}>
          <View className={styles.actionItem} onClick={goToFavorite}>
            <View className={styles.icon}>★</View>
            <Text className={styles.label}>收藏 ({favoriteCount})</Text>
          </View>
          <View className={styles.actionItem} onClick={goToApproval}>
            <View className={classnames(styles.icon, styles.warning)}>
              {pendingCount > 0 && (
                <Text style={{ color: '#ff7d00' }}>📋</Text>
              )}
              {pendingCount === 0 && <Text>📋</Text>}
            </View>
            <Text className={styles.label}>待审批 ({pendingCount})</Text>
          </View>
          <View className={styles.actionItem} onClick={goToNotification}>
            <View className={classnames(styles.icon, styles.info)}>🔔</View>
            <Text className={styles.label}>通知 ({unreadCount})</Text>
          </View>
          <View className={styles.actionItem} onClick={goToPipeline}>
            <View className={classnames(styles.icon, styles.success)}>⚡</View>
            <Text className={styles.label}>流水线</Text>
          </View>
        </View>
      </View>

      <View className={styles.teamFilter}>
        {teams.map(team => (
          <View
            key={team.id}
            className={classnames(styles.filterItem, currentTeam === team.id && styles.active)}
            onClick={() => handleTeamChange(team.id)}
          >
            <Text>{team.name}</Text>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>最近构建</Text>
          <Text className={styles.more} onClick={goToPipeline}>查看全部 →</Text>
        </View>
        <View className={styles.buildList}>
          {recentBuilds.slice(0, 4).map(build => (
            <BuildCard key={build.id} build={build} />
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default HomePage
