import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { changeRecords } from '@/data/notifications'
import { formatFullTime } from '@/utils'
import type { ChangeRecord } from '@/types'
import styles from './index.module.scss'

const ChangeRecordPage: React.FC = () => {
  const router = useRouter()
  const buildId = router.params.buildId
  const [records, setRecords] = useState<ChangeRecord[]>(changeRecords)
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({})

  useEffect(() => {
    console.log('[ChangeRecord] buildId:', buildId)
    if (buildId) {
      const filtered = changeRecords.filter(r => r.relatedBuildId === buildId)
      if (filtered.length > 0) {
        setRecords(filtered)
      }
    }
  }, [buildId])

  const toggleFiles = (id: string) => {
    setExpandedFiles(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const goToBuild = (buildId: string, buildNumber: number) => {
    Taro.redirectTo({
      url: `/pages/build-detail/index?buildId=${buildId}`
    })
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) return '📘'
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return '📒'
    if (fileName.endsWith('.scss') || fileName.endsWith('.css')) return '🎨'
    if (fileName.endsWith('.json')) return '📋'
    if (fileName.endsWith('.md')) return '📝'
    return '📄'
  }

  const displayedRecords = records.slice(0, 5)

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>变更记录</Text>
        <Text className={styles.subtitle}>共 {records.length} 次提交</Text>
      </View>

      {records.length > 0 ? (
        <View className={styles.commitTimeline}>
          {displayedRecords.map(record => (
            <View key={record.id} className={styles.commitItem}>
              <View className={styles.timelineDot} />
              <View className={styles.timelineLine} />
              
              <View className={styles.commitCard}>
                <View className={styles.commitHeader}>
                  <Text className={styles.commitHash}>
                    {record.commitHash.slice(0, 8)}
                  </Text>
                  <Text className={styles.branchTag}>🌿 {record.branch}</Text>
                </View>

                <Text className={styles.commitMessage}>
                  {record.commitMessage}
                </Text>

                <View className={styles.commitMeta}>
                  <View className={styles.metaItem}>
                    <Text>👤 {record.author}</Text>
                  </View>
                  <View className={styles.metaItem}>
                    <Text>⏰ {formatFullTime(record.time)}</Text>
                  </View>
                </View>

                <View className={styles.filesSection}>
                  <View className={styles.filesHeader}>
                    <Text className={styles.filesTitle}>影响文件</Text>
                    <Text className={styles.filesCount}>
                      {record.filesChanged.length} 个文件
                    </Text>
                  </View>

                  {(expandedFiles[record.id] || record.filesChanged.length <= 3) && (
                    <View className={styles.filesList}>
                      {record.filesChanged.map((file, idx) => (
                        <View key={idx} className={styles.fileItem}>
                          <Text className={styles.fileIcon}>{getFileIcon(file)}</Text>
                          <Text className={styles.fileName}>{file}</Text>
                          <Text className={styles.fileChange}>modified</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {record.filesChanged.length > 3 && !expandedFiles[record.id] && (
                    <View
                      className={styles.expandBtn}
                      onClick={() => toggleFiles(record.id)}
                    >
                      <Text>展开全部 {record.filesChanged.length} 个文件 ▼</Text>
                    </View>
                  )}
                  {record.filesChanged.length > 3 && expandedFiles[record.id] && (
                    <View
                      className={styles.expandBtn}
                      onClick={() => toggleFiles(record.id)}
                    >
                      <Text>收起 ▲</Text>
                    </View>
                  )}
                </View>

                {record.relatedBuildId && (
                  <View className={styles.relatedBuild}>
                    <View className={styles.buildInfo}>
                      <Text className={styles.buildLabel}>关联构建：</Text>
                      <Text>#{record.relatedBuildNumber}</Text>
                    </View>
                    <Text
                      className={styles.buildLink}
                      onClick={() => goToBuild(record.relatedBuildId, record.relatedBuildNumber)}
                    >
                      查看详情 →
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.icon}>📜</Text>
          <Text className={styles.text}>暂无变更记录</Text>
        </View>
      )}
    </ScrollView>
  )
}

export default ChangeRecordPage
