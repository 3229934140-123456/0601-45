import dayjs from 'dayjs'
import type { BuildStatus, ApprovalStatus } from '@/types'

export const formatDuration = (seconds: number): string => {
  if (seconds <= 0) return '0秒'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}秒`
  if (secs === 0) return `${mins}分钟`
  return `${mins}分${secs}秒`
}

export const formatTime = (timeStr: string): string => {
  return dayjs(timeStr).format('MM-DD HH:mm')
}

export const formatFullTime = (timeStr: string): string => {
  return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss')
}

export const getRelativeTime = (timeStr: string): string => {
  const now = dayjs()
  const target = dayjs(timeStr)
  const diff = now.diff(target, 'minute')
  
  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  const hours = Math.floor(diff / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

export const getStatusText = (status: BuildStatus): string => {
  const map: Record<BuildStatus, string> = {
    success: '成功',
    failed: '失败',
    running: '运行中',
    pending: '排队中',
    cancelled: '已取消',
    skipped: '已跳过'
  }
  return map[status] || status
}

export const getApprovalStatusText = (status: ApprovalStatus): string => {
  const map: Record<ApprovalStatus, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return map[status] || status
}

export const getBuildStatusColor = (status: BuildStatus): string => {
  const map: Record<BuildStatus, string> = {
    success: '#00b42a',
    failed: '#f53f3f',
    running: '#ff7d00',
    pending: '#86909c',
    cancelled: '#86909c',
    skipped: '#c9cdd4'
  }
  return map[status] || '#86909c'
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (process.env.TARO_ENV === 'h5') {
      await navigator.clipboard.writeText(text)
      return true
    }
    if (typeof wx !== 'undefined') {
      wx.setClipboardData({ data: text })
      return true
    }
    return false
  } catch (err) {
    console.error('[Utils] copyToClipboard failed:', err)
    return false
  }
}

export const generateBuildUrl = (buildId: string): string => {
  return `https://ci.example.com/builds/${buildId}`
}

export type RiskLevel = 'high' | 'medium' | 'low'

export interface RiskFactor {
  type: 'build_failed' | 'many_changes' | 'core_module' | 'large_impact' | 'hotfix'
  label: string
  description: string
}

export interface RiskAssessment {
  level: RiskLevel
  score: number
  factors: RiskFactor[]
}

export const assessRisk = (options: {
  buildStatus?: string
  changeCount?: number
  impactScope?: string
  isCoreModule?: boolean
  isHotfix?: boolean
}): RiskAssessment => {
  const factors: RiskFactor[] = []
  let score = 0

  if (options.buildStatus === 'failed') {
    score += 40
    factors.push({
      type: 'build_failed',
      label: '构建失败',
      description: '关联构建执行失败，发布可能存在风险'
    })
  }

  if ((options.changeCount || 0) >= 10) {
    score += 25
    factors.push({
      type: 'many_changes',
      label: '变更文件多',
      description: `本次涉及 ${options.changeCount} 个文件变更，影响面较广`
    })
  } else if ((options.changeCount || 0) >= 5) {
    score += 10
    factors.push({
      type: 'many_changes',
      label: '变更文件较多',
      description: `本次涉及 ${options.changeCount} 个文件变更`
    })
  }

  if (options.isCoreModule) {
    score += 25
    factors.push({
      type: 'core_module',
      label: '核心模块',
      description: '涉及核心业务模块，影响范围大'
    })
  }

  if (options.impactScope && (
    options.impactScope.includes('核心') ||
    options.impactScope.includes('全部') ||
    options.impactScope.includes('所有') ||
    options.impactScope.includes('主链路')
  )) {
    score += 20
    factors.push({
      type: 'large_impact',
      label: '影响范围大',
      description: '影响范围较广，需重点评估'
    })
  }

  if (options.isHotfix) {
    score += 15
    factors.push({
      type: 'hotfix',
      label: '紧急修复',
      description: '紧急修复发布，测试可能不充分'
    })
  }

  let level: RiskLevel = 'low'
  if (score >= 50) {
    level = 'high'
  } else if (score >= 25) {
    level = 'medium'
  }

  return { level, score, factors }
}

export const getRiskLevelText = (level: RiskLevel): string => {
  const map: Record<RiskLevel, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  }
  return map[level]
}

export interface TroubleshootSuggestion {
  phase: string
  reason: string
  suggestedOwner: string
  relatedChanges: string[]
  actions: { label: string; type: 'primary' | 'secondary' }[]
}

export const getTroubleshootSuggestions = (build: {
  status: string
  phases: { name: string; status: string; logs?: string[] }[]
  triggerUser: string
  commitMessage: string
}): TroubleshootSuggestion[] => {
  const suggestions: TroubleshootSuggestion[] = []

  const failedPhase = build.phases.find(p => p.status === 'failed')
  const cancelledPhase = build.phases.find(p => p.status === 'cancelled')
  const runningPhase = build.phases.find(p => p.status === 'running')

  if (build.status === 'failed' && failedPhase) {
    const phaseName = failedPhase.name
    if (phaseName.includes('安装') || phaseName.includes('依赖') || phaseName.includes('install')) {
      suggestions.push({
        phase: phaseName,
        reason: '依赖安装失败，可能是包版本冲突或网络问题',
        suggestedOwner: build.triggerUser,
        relatedChanges: ['package.json', 'package-lock.json', 'yarn.lock'],
        actions: [
          { label: '重试构建', type: 'primary' },
          { label: '查看依赖配置', type: 'secondary' }
        ]
      })
    } else if (phaseName.includes('测试') || phaseName.includes('test')) {
      suggestions.push({
        phase: phaseName,
        reason: '测试用例执行失败，需要检查代码改动是否影响了现有功能',
        suggestedOwner: build.triggerUser,
        relatedChanges: build.commitMessage ? [build.commitMessage.slice(0, 30)] : [],
        actions: [
          { label: '查看测试报告', type: 'primary' },
          { label: '本地复现测试', type: 'secondary' }
        ]
      })
    } else if (phaseName.includes('构建') || phaseName.includes('编译') || phaseName.includes('build')) {
      suggestions.push({
        phase: phaseName,
        reason: '代码编译失败，可能是语法错误或类型不兼容',
        suggestedOwner: build.triggerUser,
        relatedChanges: build.commitMessage ? [build.commitMessage.slice(0, 30)] : [],
        actions: [
          { label: '查看错误日志', type: 'primary' },
          { label: '本地构建验证', type: 'secondary' }
        ]
      })
    } else if (phaseName.includes('部署') || phaseName.includes('deploy')) {
      suggestions.push({
        phase: phaseName,
        reason: '部署失败，可能是环境问题或配置错误',
        suggestedOwner: '运维团队',
        relatedChanges: [],
        actions: [
          { label: '联系运维', type: 'primary' },
          { label: '检查部署配置', type: 'secondary' }
        ]
      })
    } else {
      suggestions.push({
        phase: phaseName,
        reason: '执行失败，需要查看详细日志定位原因',
        suggestedOwner: build.triggerUser,
        relatedChanges: build.commitMessage ? [build.commitMessage.slice(0, 30)] : [],
        actions: [
          { label: '查看完整日志', type: 'primary' },
          { label: '重试构建', type: 'secondary' }
        ]
      })
    }
  }

  if (build.status === 'cancelled') {
    const stoppedPhase = cancelledPhase || runningPhase
    if (stoppedPhase) {
      suggestions.push({
        phase: stoppedPhase.name,
        reason: '构建被手动取消，当前执行到该阶段',
        suggestedOwner: build.triggerUser,
        relatedChanges: [],
        actions: [
          { label: '重新执行', type: 'primary' },
          { label: '查看原因', type: 'secondary' }
        ]
      })
    }
  }

  if (suggestions.length === 0 && build.status === 'success') {
    suggestions.push({
      phase: '全部阶段',
      reason: '构建成功，无异常',
      suggestedOwner: build.triggerUser,
      relatedChanges: [],
      actions: [
        { label: '查看完整日志', type: 'secondary' }
      ]
    })
  }

  return suggestions
}
