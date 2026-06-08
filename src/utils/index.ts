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
