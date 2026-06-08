import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import classnames from 'classnames'
import StatCard from '@/components/StatCard'
import BuildCard from '@/components/BuildCard'
import { teams } from '@/data/projects'
import { useAppStore } from '@/store/useAppStore'
import { userProfile } from '@/data/notifications'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const currentTeam = useAppStore(state => state.currentTeam)
  const setCurrentTeam = useAppStore(state => state.setCurrentTeam)
  const unreadCount = useAppStore(state => state.unreadCount)
  const getBuildsByTeam = useAppStore(state => state.getBuildsByTeam)
  const getFavoritePipelines = useAppStore(state => state.getFavoritePipelines)
  const getTeamStats = useAppStore(state => state.getTeamStats)
  const getApprovalsByTeam = useAppStore(state => state.getApprovalsByTeam)
  const favoritePipelines = useAppStore(state => state.favoritePipelines)

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

  const teamStats = useMemo(() => {
    return getTeamStats(currentTeam)
  }, [currentTeam, getTeamStats])

  const recentBuilds = useMemo(() => {
    return getBuildsByTeam(currentTeam)
  }, [currentTeam, getBuildsByTeam])

  const favoriteCount = useMemo(() => {
    const favPipes = getFavoritePipelines()
    if (currentTeam === 'all') return favPipes.length
    return favPipes.filter(p => {
      const teamProjectMap: Record<string, string[]> = {
        'team-1': ['proj-1', 'proj-7'],
        'team-2': ['proj-2', 'proj-3', 'proj-8'],
        'team-3': ['proj-4'],
        'team-4': ['proj-5'],
        'team-5': ['proj-6']
      }
      const projectIds = teamProjectMap[currentTeam] || []
      return projectIds.includes(p.projectId)
    }).length
  }, [currentTeam, favoritePipelines, getFavoritePipelines])

  const pendingCount = useMemo(() => {
    return getApprovalsByTeam(currentTeam).filter(a => a.status === 'pending').length
  }, [currentTeam, getApprovalsByTeam])

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

  const teamName = teams.find(t => t.id === currentTeam)?.name || '全部团队'

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
            <Text>{teamName}</Text>
            <Text>▼</Text>
          </View>
        </View>
        <Text className={styles.greeting}>今天是工作日，加油！</Text>
        <Text className={styles.subtitle}>
          共 {teamStats.projectCount} 个项目 · {teamStats.pipelineCount} 条流水线
        </Text>
      </View>

      <View className={styles.statsGrid}>
        <StatCard
          value={teamStats.weekBuilds}
          label="本周构建"
          trend="12%"
          trendUp
        />
        <StatCard
          value={`${teamStats.successRate}%`}
          label="成功率"
          trend="2.3%"
          trendUp={teamStats.successRate >= 90}
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
              <Text>📋</Text>
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
          {recentBuilds.length > 0 ? (
            recentBuilds.slice(0, 4).map(build => (
              <BuildCard key={build.id} build={build} />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text>暂无构建记录</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

export default HomePage
