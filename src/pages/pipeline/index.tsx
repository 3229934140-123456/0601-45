import React, { useState, useMemo } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import classnames from 'classnames'
import PipelineCard from '@/components/PipelineCard'
import { teams } from '@/data/projects'
import { useAppStore, TEAM_PROJECT_MAP } from '@/store/useAppStore'
import type { BuildStatus } from '@/types'
import styles from './index.module.scss'

type TabType = 'all' | 'favorite'

const PipelinePage: React.FC = () => {
  const currentTeam = useAppStore(state => state.currentTeam)
  const setCurrentTeam = useAppStore(state => state.setCurrentTeam)
  const pipelines = useAppStore(state => state.pipelines)
  const favoritePipelines = useAppStore(state => state.favoritePipelines)
  const isFavorite = useAppStore(state => state.isFavorite)

  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<BuildStatus | 'all'>('all')
  const [refreshing, setRefreshing] = useState(false)

  usePullDownRefresh(() => {
    console.log('[Pipeline] pull down refresh')
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  const filteredPipelines = useMemo(() => {
    let list = pipelines

    if (currentTeam !== 'all') {
      const projectIds = TEAM_PROJECT_MAP[currentTeam] || []
      list = list.filter(p => projectIds.includes(p.projectId))
    }

    if (activeTab === 'favorite') {
      list = list.filter(p => favoritePipelines.includes(p.id))
    }

    if (searchText) {
      const keyword = searchText.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.projectName.toLowerCase().includes(keyword)
      )
    }

    if (statusFilter !== 'all') {
      list = list.filter(p => p.lastBuildStatus === statusFilter)
    }

    return list
  }, [currentTeam, activeTab, searchText, statusFilter, pipelines, favoritePipelines])

  const handleTeamChange = (teamId: string) => {
    setCurrentTeam(teamId)
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'favorite', label: '收藏' }
  ]

  const statusList: { key: BuildStatus | 'all'; label: string }[] = [
    { key: 'all', label: '全部状态' },
    { key: 'running', label: '运行中' },
    { key: 'success', label: '成功' },
    { key: 'failed', label: '失败' },
    { key: 'pending', label: '排队中' }
  ]

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索流水线/项目"
            placeholderClass={styles.placeholder}
            value={searchText}
            onInput={e => setSearchText(e.detail.value)}
          />
        </View>
        <View className={styles.filterTabs}>
          {tabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.tab, activeTab === tab.key && styles.active)}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text>{tab.label}</Text>
            </View>
          ))}
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

      <View className={styles.statusFilter}>
        {statusList.map(status => (
          <View
            key={status.key}
            className={classnames(styles.statusTag, statusFilter === status.key && styles.active)}
            onClick={() => setStatusFilter(status.key)}
          >
            <Text>{status.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.pipelineList}>
        {filteredPipelines.length > 0 ? (
          filteredPipelines.map(pipeline => (
            <PipelineCard key={pipeline.id} pipeline={pipeline} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.icon}>📦</Text>
            <Text className={styles.text}>暂无流水线</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default PipelinePage
