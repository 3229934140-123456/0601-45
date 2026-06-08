export type BuildStatus = 'success' | 'failed' | 'running' | 'pending' | 'cancelled' | 'skipped'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface Team {
  id: string
  name: string
}

export interface Project {
  id: string
  name: string
  teamId: string
  teamName: string
  repoUrl: string
  description: string
  buildCount: number
  successRate: number
  lastBuildTime: string
}

export interface Pipeline {
  id: string
  name: string
  projectId: string
  projectName: string
  branch: string
  lastBuildStatus: BuildStatus
  lastBuildTime: string
  lastBuildDuration: number
  lastTriggerUser: string
  isFavorite: boolean
  buildCountWeek: number
  successRateWeek: number
}

export interface BuildPhase {
  id: string
  name: string
  status: BuildStatus
  duration: number
  startTime: string
  endTime?: string
  logs: string[]
}

export interface Build {
  id: string
  buildNumber: number
  pipelineId: string
  pipelineName: string
  projectId: string
  projectName: string
  status: BuildStatus
  branch: string
  commitMessage: string
  commitHash: string
  triggerUser: string
  triggerType: string
  startTime: string
  endTime?: string
  duration: number
  phases: BuildPhase[]
  remark?: string
}

export interface Approval {
  id: string
  title: string
  type: 'release' | 'deploy' | 'rollback'
  projectName: string
  pipelineName: string
  buildNumber: number
  applicant: string
  applyTime: string
  status: ApprovalStatus
  description: string
  impactScope: string
  approvers: string[]
  currentApprover: string
}

export interface Notification {
  id: string
  type: 'build_failed' | 'build_success' | 'approval_pending' | 'approval_done' | 'system'
  title: string
  content: string
  time: string
  isRead: boolean
  relatedId: string
  relatedType: string
}

export interface ChangeRecord {
  id: string
  commitHash: string
  commitMessage: string
  author: string
  time: string
  branch: string
  filesChanged: string[]
  relatedBuildId: string
  relatedBuildNumber: number
}

export interface UserProfile {
  id: string
  name: string
  avatar: string
  email: string
  role: string
  team: string
  notificationSettings: {
    buildFailed: boolean
    buildSuccess: boolean
    approvalPending: boolean
    approvalDone: boolean
  }
}
