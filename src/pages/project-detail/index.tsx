import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import StatusBadge from '@/components/StatusBadge'
import { useAppStore } from '@/store/useAppStore'
import { formatDuration, formatTime, getApprovalStatusText } from '@/utils'
import styles from './index.module.scss'

const ProjectDetailPage: React.FC = () => {
  const router = useRouter()
  const projectId = router.params.projectId || 'proj-1'

  const pipelines = useAppStore(state => state.pipelines)
  const builds = useAppStore(state => state.builds)
  const approvals = useAppStore(state => state.approvals)
  const favoritePipelines = useAppStore(state => state.favoritePipelines)
  const toggleFavorite = useAppStore(state => state.toggleFavorite)
  const getBuildByPipelineAndNumber = useAppStore(state => state.getBuildByPipelineAndNumber)

  const projectPipelines = useMemo(() => {
    return pipelines.filter(p => p.projectId === projectId)
  }, [projectId, pipelines])

  const projectName = useMemo(() => {
    return projectPipelines.length > 0 ? projectPipelines[0].projectName : '未知项目'
  }, [projectPipelines])

  const projectBuilds = useMemo(() => {
    return builds.filter(b => b.projectId === projectId)
  }, [projectId, builds])

  const projectApprovals = useMemo(() => {
    const pipelineNames = projectPipelines.map(p => p.name)
    return approvals.filter(a => pipelineNames.includes(a.pipelineName))
  }, [projectId, projectPipelines, approvals])

  const stats = useMemo(() => {
    const weekBuilds = projectBuilds.length
    const successCount = projectBuilds.filter(b => b.status === 'success').length
    const failedCount = projectBuilds.filter(b => b.status === 'failed').length
    const successRate = weekBuilds > 0
      ? Math.round((successCount / weekBuilds) * 1000) / 10
      : 100

    const durations = projectBuilds.filter(b => b.duration > 0).map(b => b.duration)
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0

    return {
      weekBuilds,
      successCount,
      failedCount,
      successRate,
      avgDuration,
      pipelineCount: projectPipelines.length,
      approvalCount: projectApprovals.length
    }
  }, [projectBuilds, projectPipelines, projectApprovals])

  const weekTrend = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
      const dayBuilds = projectBuilds.filter(b => {
        const buildDate = new Date(b.startTime)
        return buildDate.toDateString() === date.toDateString()
      })
      days.push({
        date: dateStr,
        total: dayBuilds.length,
        success: dayBuilds.filter(b => b.status === 'success').length,
        failed: dayBuilds.filter(b => b.status === 'failed').length
      })
    }
    return days
  }, [projectBuilds])

  const goToBuildDetail = (buildId: string) => {
    Taro.navigateTo({
      url: `/pages/build-detail/index?buildId=${buildId}&source=project&projectId=${projectId}`
    })
  }

  const goToApproval = (approvalId: string) => {
    Taro.switchTab({
      url: '/pages/approval/index'
    })
  }

  const handleToggleFavorite = (pipelineId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(pipelineId)
  }

  const goBack = () => {
    Taro.navigateBack()
  }

  const maxBuilds = Math.max(...weekTrend.map(d => d.total), 1)

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.backBtn} onClick={goBack}>
          <Text>← 返回</Text>
        </View>
        <Text className={styles.projectName}>{projectName}</Text>
        <Text className={styles.projectDesc}>项目概览</Text>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{stats.weekBuilds}</Text>
          <Text className={styles.statLabel}>本周构建</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statValue, styles.success)}>
            {stats.successRate}%
          </Text>
          <Text className={styles.statLabel}>成功率</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statValue, styles.danger)}>
            {stats.failedCount}
          </Text>
          <Text className={styles.statLabel}>失败次数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{formatDuration(stats.avgDuration)}</Text>
          <Text className={styles.statLabel}>平均耗时</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📊 本周趋势</Text>
        </View>
        <View className={styles.trendChart}>
          <View className={styles.trendBars}>
            {weekTrend.map((day, idx) => (
              <View key={idx} className={styles.trendBarItem}>
                <View className={styles.barWrapper}>
                  <View className={styles.bar}>
                    {day.success > 0 && (
                      <View
                        className={classnames(styles.barFill, styles.successBar)}
                        style={{ height: `${(day.success / maxBuilds) * 100}%` }}
                      />
                    )}
                    {day.failed > 0 && (
                      <View
                        className={classnames(styles.barFill, styles.failedBar)}
                        style={{ height: `${(day.failed / maxBuilds) * 100}%` }}
                      />
                    )}
                  </View>
                </View>
                <Text className={styles.barLabel}>{day.date}</Text>
              </View>
            ))}
          </View>
          <View className={styles.trendLegend}>
            <View className={styles.legendItem}>
              <View className={classnames(styles.legendDot, styles.successDot)} />
              <Text>成功</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={classnames(styles.legendDot, styles.failedDot)} />
              <Text>失败</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>🔧 流水线 ({stats.pipelineCount})</Text>
        </View>
        <View className={styles.pipelineList}>
          {projectPipelines.map(pipeline => (
            <View
              key={pipeline.id}
              className={styles.pipelineCard}
              onClick={() => {
                if (pipeline.lastBuildStatus) {
                  const build = getBuildByPipelineAndNumber(pipeline.name, pipeline.buildCountWeek)
                  if (build) {
                    goToBuildDetail(build.id)
                  }
                }
              }}
            >
              <View className={styles.pipelineInfo}>
                <View className={styles.pipelineHeader}>
                  <Text className={styles.pipelineName}>{pipeline.name}</Text>
                  <View
                    className={styles.favoriteBtn}
                    onClick={e => handleToggleFavorite(pipeline.id, e)}
                  >
                    <Text>
                      {favoritePipelines.includes(pipeline.id) ? '⭐' : '☆'}
                    </Text>
                  </View>
                </View>
                <View className={styles.pipelineMeta}>
                  <Text className={styles.pipelineBranch}>{pipeline.branch}</Text>
                  <StatusBadge status={pipeline.lastBuildStatus} />
                </View>
                <View className={styles.pipelineStats}>
                  <Text className={styles.statsText}>
                    本周 {pipeline.buildCountWeek} 次 · 成功率 {pipeline.successRateWeek}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>⚡ 最近构建</Text>
        </View>
        <View className={styles.recentBuilds}>
          {projectBuilds.slice(0, 5).map(build => (
            <View
              key={build.id}
              className={styles.buildItem}
              onClick={() => goToBuildDetail(build.id)}
            >
              <View className={styles.buildStatus}>
                <StatusBadge status={build.status} size="small" />
              </View>
              <View className={styles.buildInfo}>
                <Text className={styles.buildTitle}>#{build.buildNumber}</Text>
                <Text className={styles.buildDesc}>
                  {build.commitMessage.slice(0, 20)}
                </Text>
              </View>
              <View className={styles.buildMeta}>
                <Text className={styles.buildTime}>{formatTime(build.startTime)}</Text>
                <Text className={styles.buildDuration}>
                  {build.duration > 0 ? formatDuration(build.duration) : '-'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {projectApprovals.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>📋 关联审批 ({projectApprovals.length})</Text>
          </View>
          <View className={styles.approvalList}>
            {projectApprovals.map(approval => (
              <View
                key={approval.id}
                className={styles.approvalItem}
                onClick={() => goToApproval(approval.id)}
              >
                <View className={styles.approvalInfo}>
                  <Text className={styles.approvalTitle}>{approval.title}</Text>
                  <Text className={styles.approvalDesc}>
                    {approval.applicant} · {formatTime(approval.applyTime)}
                  </Text>
                </View>
                <Text className={classnames(styles.approvalStatus, styles[approval.status])}>
                  {getApprovalStatusText(approval.status)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📝 最近变更</Text>
        </View>
        <View className={styles.changeList}>
          {projectBuilds.slice(0, 3).map(build => (
            <View
              key={build.id}
              className={styles.changeItem}
              onClick={() => goToBuildDetail(build.id)}
            >
              <View className={styles.changeIcon}>📎</View>
              <View className={styles.changeInfo}>
                <Text className={styles.changeMessage}>
                  {build.commitMessage.slice(0, 25)}
                </Text>
                <Text className={styles.changeMeta}>
                  {build.triggerUser} · {formatTime(build.startTime)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default ProjectDetailPage
