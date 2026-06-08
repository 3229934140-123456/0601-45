import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Build } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { formatDuration, getRelativeTime } from '@/utils'
import styles from './index.module.scss'

interface BuildCardProps {
  build: Build
  onClick?: () => void
}

const BuildCard: React.FC<BuildCardProps> = ({ build, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    Taro.navigateTo({
      url: `/pages/build-detail/index?buildId=${build.id}`
    })
  }

  return (
    <View className={styles.buildCard} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.title}>{build.pipelineName}</Text>
        <StatusBadge status={build.status} showDot />
      </View>
      <Text className={styles.commit}>#{build.buildNumber} {build.commitMessage}</Text>
      <View className={styles.meta}>
        <View className={styles.left}>
          <View className={styles.metaItem}>
            <Text>⏱ {formatDuration(build.duration)}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text>🌿 {build.branch}</Text>
          </View>
        </View>
        <Text>{build.triggerUser} · {getRelativeTime(build.startTime)}</Text>
      </View>
    </View>
  )
}

export default BuildCard
