import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatCardProps {
  value: string | number
  label: string
  trend?: string
  trendUp?: boolean
  variant?: 'default' | 'primary'
}

const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  trend,
  trendUp = true,
  variant = 'default'
}) => {
  return (
    <View className={classnames(styles.statCard, variant === 'primary' && styles.primary)}>
      <Text className={styles.value}>{value}</Text>
      <Text className={styles.label}>{label}</Text>
      {trend && (
        <Text className={classnames(styles.trend, !trendUp && styles.down)}>
          {trendUp ? '↑' : '↓'} {trend}
        </Text>
      )}
    </View>
  )
}

export default StatCard
