import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import classnames from 'classnames'
import StatCard from '@/components/StatCard'
import BuildCard from '@/components/BuildCard'
import { teams } from '@/data/projects'
import { useAppStore, TEAM_PROJECT_MAP } from '@/store/useAppStore'
import { userProfile } from '@/data/notifications'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const currentTeam = useAppStore(state => state.currentTeam)
  const setCurrentTeam = useAppStore(state => state.setCurrentTeam)
  const unreadCount = useAppStore(state => state.unreadCount)
  const builds = useAppStore(state => state.builds)
  const pipelines = useAppStore(state => state.pipelines)
  const approvals = useAppStore(state => state.approvals)
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
    const projectIds = currentTeam === 'all'
      ? new Set(pipelines.map(p => p.projectId))
      : new Set(pipelines.filter(p => TEAM_PROJECT_MAP[currentTeam]?.includes(p.projectId)).map(p => p.projectId))

    const teamBuilds = currentTeam === 'all'
      ? builds
      : builds.filter(b => TEAM_PROJECT_MAP[currentTeam]?.includes(b.projectId))

    const teamPipelines = currentTeam === 'all'
      ? pipelines
      : pipelines.filter(p => TEAM_PROJECT_MAP[currentTeam]?.includes(p.projectId))

    const weekBuilds = teamBuilds.length
    const successCount = teamBuilds.filter(b => b.status === 'success').length
    const successRate = weekBuilds > 0
      ? Math.round((successCount / weekBuilds) * 1000) / 10
      : 100

    return {
      weekBuilds,
      successRate,
      projectCount: projectIds.size,
      pipelineCount: teamPipelines.length
    }
  }, [currentTeam, builds, pipelines])

  const recentBuilds = useMemo(() => {
    if (currentTeam === 'all') return builds
    return builds.filter(b => TEAM_PROJECT_MAP[currentTeam]?.includes(b.projectId))
  }, [currentTeam, builds])

  const favoriteCount = useMemo(() => {
    if (currentTeam === 'all') return favoritePipelines.length
    return pipelines.filter(p =>
      favoritePipelines.includes(p.id) && TEAM_PROJECT_MAP[currentTeam]?.includes(p.projectId)
    ).length
  }, [currentTeam, favoritePipelines, pipelines])

  const pendingCount = useMemo(() => {
    if (currentTeam === 'all') {
      return approvals.filter(a => a.status === 'pending').length
    }
    const projectIds = TEAM_PROJECT_MAP[currentTeam] || []
    const teamPipelineNames = pipelines
      .filter(p => projectIds.includes(p.projectId))
      .map(p => p.name)
    return approvals.filter(a =>
      a.status === 'pending' && teamPipelineNames.includes(a.pipelineName)
    ).length
  }, [currentTeam, approvals, pipelines])

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
