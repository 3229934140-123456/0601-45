import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import type { BuildStatus } from '@/types'
import { getStatusText } from '@/utils'
import styles from './index.module.scss'

interface StatusBadgeProps {
  status: BuildStatus
  showDot?: boolean
  size?: 'sm' | 'md'
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true }) => {
  return (
    <View className={classnames(styles.statusBadge, styles[status])}>
      {showDot && <View className={styles.dot} />}
      <Text>{getStatusText(status)}</Text>
    </View>
  )
}

export default StatusBadge
