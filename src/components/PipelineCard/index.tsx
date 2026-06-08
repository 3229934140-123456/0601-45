import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import type { Pipeline } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { formatDuration, formatTime } from '@/utils'
import { useAppStore } from '@/store/useAppStore'
import styles from './index.module.scss'

interface PipelineCardProps {
  pipeline: Pipeline
  onFavoriteChange?: (id: string, isFavorite: boolean) => void
}

const PipelineCard: React.FC<PipelineCardProps> = ({ pipeline, onFavoriteChange }) => {
  const toggleFavorite = useAppStore(state => state.toggleFavorite)
  const isFavorite = useAppStore(state => state.isFavorite(pipeline.id))

  const handleCardClick = () => {
    Taro.navigateTo({
      url: `/pages/build-detail/index?buildId=build-1&pipelineId=${pipeline.id}`
    })
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(pipeline.id)
    onFavoriteChange?.(pipeline.id, !isFavorite)
  }

  return (
    <View className={styles.pipelineCard} onClick={handleCardClick}>
      <View className={styles.header}>
        <View className={styles.left}>
          <StatusBadge status={pipeline.lastBuildStatus} showDot />
          <Text className={styles.name}>{pipeline.name}</Text>
        </View>
        <View
          className={classnames(styles.favorite, isFavorite ? styles.active : styles.inactive)}
          onClick={handleFavorite}
        >
          {isFavorite ? '★' : '☆'}
        </View>
      </View>

      <View className={styles.projectInfo}>
        <Text>{pipeline.projectName}</Text>
        <Text className={styles.branch}>{pipeline.branch}</Text>
      </View>

      <View className={styles.stats}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{pipeline.buildCountWeek}</Text>
          <Text className={styles.statLabel}>本周构建</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{pipeline.successRateWeek}%</Text>
          <Text className={styles.statLabel}>成功率</Text>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.leftInfo}>
          <View className={styles.infoItem}>
            <Text>⏱ {formatDuration(pipeline.lastBuildDuration)}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text>{formatTime(pipeline.lastBuildTime)}</Text>
          </View>
        </View>
        <Text className={styles.triggerUser}>{pipeline.lastTriggerUser}</Text>
      </View>
    </View>
  )
}

export default PipelineCard
