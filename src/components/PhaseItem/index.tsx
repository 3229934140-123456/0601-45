import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import type { BuildPhase } from '@/types'
import { formatDuration } from '@/utils'
import styles from './index.module.scss'

interface PhaseItemProps {
  phase: BuildPhase
  defaultExpanded?: boolean
  highlight?: boolean
}

const PhaseItem: React.FC<PhaseItemProps> = ({ phase, defaultExpanded = false, highlight = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const getStatusIcon = () => {
    switch (phase.status) {
      case 'success':
        return '✓'
      case 'failed':
        return '✕'
      case 'running':
        return ''
      default:
        return '○'
    }
  }

  const toggleExpand = () => {
    if (phase.logs.length > 0) {
      setExpanded(!expanded)
    }
  }

  return (
    <View className={classnames(styles.phaseItem, styles[phase.status], highlight && styles.highlight)}>
      <View className={styles.header} onClick={toggleExpand}>
        <View className={styles.statusIcon}>
          <Text>{getStatusIcon()}</Text>
        </View>
        <View className={styles.phaseInfo}>
          <Text className={styles.name}>{phase.name}</Text>
          <Text className={styles.meta}>
            {phase.duration > 0 ? `耗时 ${formatDuration(phase.duration)}` : '等待中'}
          </Text>
        </View>
        {phase.logs.length > 0 && (
          <Text className={classnames(styles.expandIcon, expanded && styles.expanded)}>
            ▼
          </Text>
        )}
      </View>
      {expanded && phase.logs.length > 0 && (
        <ScrollView scrollY className={styles.logs}>
          {phase.logs.map((log, index) => (
            <Text key={index} className={styles.logLine}>{log}</Text>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

export default PhaseItem
