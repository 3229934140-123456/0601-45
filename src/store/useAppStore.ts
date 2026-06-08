import { create } from 'zustand'
import type { Pipeline, Notification, UserProfile, Build, Approval } from '@/types'
import { pipelines as mockPipelines } from '@/data/pipelines'
import { builds as mockBuilds, generatePhases } from '@/data/builds'
import { approvals as mockApprovals } from '@/data/approvals'
import { notifications as mockNotifications } from '@/data/notifications'
import { userProfile as mockProfile } from '@/data/notifications'
import dayjs from 'dayjs'

interface TeamProjectMap {
  [key: string]: string[]
}

const TEAM_PROJECT_MAP: TeamProjectMap = {
  'team-1': ['proj-1', 'proj-7'],
  'team-2': ['proj-2', 'proj-3', 'proj-8'],
  'team-3': ['proj-4'],
  'team-4': ['proj-5'],
  'team-5': ['proj-6']
}

interface AppState {
  currentTeam: string
  favoritePipelines: string[]
  notifications: Notification[]
  unreadCount: number
  userProfile: UserProfile
  pipelines: Pipeline[]
  builds: Build[]
  approvals: Approval[]
  buildRemarks: Record<string, string>
  buildCounter: Record<string, number>

  setCurrentTeam: (teamId: string) => void
  toggleFavorite: (pipelineId: string) => void
  isFavorite: (pipelineId: string) => boolean

  getPipelinesByTeam: (teamId: string) => Pipeline[]
  getFavoritePipelines: () => Pipeline[]
  getBuildsByTeam: (teamId: string) => Build[]
  getBuildsByPipeline: (pipelineId: string) => Build[]
  getLatestBuildByPipeline: (pipelineId: string) => Build | undefined
  getBuildById: (buildId: string) => Build | undefined
  getApprovalsByTeam: (teamId: string) => Approval[]

  retryBuild: (buildId: string) => Build | null
  cancelPendingBuild: (buildId: string) => boolean
  pauseRunningBuild: (buildId: string) => boolean
  setBuildRemark: (buildId: string, remark: string) => void

  markNotificationRead: (id: string) => void
  markAllRead: () => void
  toggleNotificationSetting: (key: keyof UserProfile['notificationSettings']) => void

  getTeamStats: (teamId: string) => {
    weekBuilds: number
    successRate: number
    projectCount: number
    pipelineCount: number
  }
}

let buildIdCounter = 100

export const useAppStore = create<AppState>((set, get) => ({
  currentTeam: 'all',
  favoritePipelines: mockPipelines.filter(p => p.isFavorite).map(p => p.id),
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.isRead).length,
  userProfile: mockProfile,
  pipelines: mockPipelines,
  builds: mockBuilds,
  approvals: mockApprovals,
  buildRemarks: mockBuilds
    .filter(b => b.remark)
    .reduce((acc, b) => {
      acc[b.id] = b.remark!
      return acc
    }, {} as Record<string, string>),
  buildCounter: mockBuilds.reduce((acc, b) => {
    if (!acc[b.pipelineId] || b.buildNumber > acc[b.pipelineId]) {
      acc[b.pipelineId] = b.buildNumber
    }
    return acc
  }, {} as Record<string, number>),

  setCurrentTeam: (teamId: string) => {
    console.log('[Store] setCurrentTeam:', teamId)
    set({ currentTeam: teamId })
  },

  toggleFavorite: (pipelineId: string) => {
    const { favoritePipelines } = get()
    const isFav = favoritePipelines.includes(pipelineId)
    const newFavorites = isFav
      ? favoritePipelines.filter(id => id !== pipelineId)
      : [...favoritePipelines, pipelineId]

    console.log('[Store] toggleFavorite:', pipelineId, '->', !isFav)
    set({ favoritePipelines: newFavorites })
  },

  isFavorite: (pipelineId: string) => {
    return get().favoritePipelines.includes(pipelineId)
  },

  getPipelinesByTeam: (teamId: string) => {
    const { pipelines } = get()
    if (teamId === 'all') return pipelines
    const projectIds = TEAM_PROJECT_MAP[teamId] || []
    return pipelines.filter(p => projectIds.includes(p.projectId))
  },

  getFavoritePipelines: () => {
    const { pipelines, favoritePipelines } = get()
    return pipelines.filter(p => favoritePipelines.includes(p.id))
  },

  getBuildsByTeam: (teamId: string) => {
    const { builds } = get()
    if (teamId === 'all') return builds
    const projectIds = TEAM_PROJECT_MAP[teamId] || []
    return builds.filter(b => projectIds.includes(b.projectId))
  },

  getBuildsByPipeline: (pipelineId: string) => {
    const { builds } = get()
    return builds.filter(b => b.pipelineId === pipelineId)
  },

  getLatestBuildByPipeline: (pipelineId: string) => {
    const builds = get().getBuildsByPipeline(pipelineId)
    if (builds.length === 0) return undefined
    return builds.reduce((latest, current) =>
      current.buildNumber > latest.buildNumber ? current : latest
    )
  },

  getBuildById: (buildId: string) => {
    const { builds, buildRemarks } = get()
    const build = builds.find(b => b.id === buildId)
    if (!build) return undefined
    if (buildRemarks[buildId]) {
      return { ...build, remark: buildRemarks[buildId] }
    }
    return build
  },

  getApprovalsByTeam: (teamId: string) => {
    const { approvals, pipelines } = get()
    if (teamId === 'all') return approvals

    const projectIds = TEAM_PROJECT_MAP[teamId] || []
    const teamPipelineNames = pipelines
      .filter(p => projectIds.includes(p.projectId))
      .map(p => p.name)

    return approvals.filter(a => {
      return teamPipelineNames.includes(a.pipelineName)
    })
  },

  retryBuild: (buildId: string) => {
    const { builds, buildCounter } = get()
    const originalBuild = builds.find(b => b.id === buildId)
    if (!originalBuild) return null

    const newBuildNumber = (buildCounter[originalBuild.pipelineId] || originalBuild.buildNumber) + 1
    const newId = `build-retry-${buildIdCounter++}`
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

    const newBuild: Build = {
      id: newId,
      buildNumber: newBuildNumber,
      pipelineId: originalBuild.pipelineId,
      pipelineName: originalBuild.pipelineName,
      projectId: originalBuild.projectId,
      projectName: originalBuild.projectName,
      status: 'pending',
      branch: originalBuild.branch,
      commitMessage: originalBuild.commitMessage + ' (重试)',
      commitHash: originalBuild.commitHash,
      triggerUser: get().userProfile.name,
      triggerType: 'retry',
      startTime: now,
      duration: 0,
      phases: generatePhases('pending')
    }

    console.log('[Store] retryBuild:', buildId, '-> new:', newId)

    set({
      builds: [newBuild, ...builds],
      buildCounter: {
        ...buildCounter,
        [originalBuild.pipelineId]: newBuildNumber
      }
    })

    return newBuild
  },

  cancelPendingBuild: (buildId: string) => {
    const { builds } = get()
    const build = builds.find(b => b.id === buildId)
    if (!build || (build.status !== 'pending' && build.status !== 'running')) {
      return false
    }

    console.log('[Store] cancelPendingBuild:', buildId)

    const updatedBuilds = builds.map(b => {
      if (b.id !== buildId) return b
      return {
        ...b,
        status: 'cancelled' as const,
        endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        phases: b.phases.map((p, idx) => {
          if (p.status === 'running' || p.status === 'pending') {
            return { ...p, status: 'cancelled' as const }
          }
          return p
        })
      }
    })

    set({ builds: updatedBuilds })
    return true
  },

  pauseRunningBuild: (buildId: string) => {
    return get().cancelPendingBuild(buildId)
  },

  setBuildRemark: (buildId: string, remark: string) => {
    console.log('[Store] setBuildRemark:', buildId, remark)
    const { buildRemarks } = get()
    set({
      buildRemarks: {
        ...buildRemarks,
        [buildId]: remark
      }
    })
  },

  markNotificationRead: (id: string) => {
    const { notifications } = get()
    const updated = notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    )
    set({
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    })
  },

  markAllRead: () => {
    const { notifications } = get()
    const updated = notifications.map(n => ({ ...n, isRead: true }))
    set({
      notifications: updated,
      unreadCount: 0
    })
  },

  toggleNotificationSetting: (key: keyof UserProfile['notificationSettings']) => {
    const { userProfile } = get()
    set({
      userProfile: {
        ...userProfile,
        notificationSettings: {
          ...userProfile.notificationSettings,
          [key]: !userProfile.notificationSettings[key]
        }
      }
    })
  },

  getTeamStats: (teamId: string) => {
    const { builds, pipelines } = get()
    const teamBuilds = teamId === 'all'
      ? builds
      : builds.filter(b => {
          const projectIds = TEAM_PROJECT_MAP[teamId] || []
          return projectIds.includes(b.projectId)
        })

    const teamPipelines = teamId === 'all'
      ? pipelines
      : pipelines.filter(p => {
          const projectIds = TEAM_PROJECT_MAP[teamId] || []
          return projectIds.includes(p.projectId)
        })

    const weekBuilds = teamBuilds.length
    const successCount = teamBuilds.filter(b => b.status === 'success').length
    const successRate = weekBuilds > 0
      ? Math.round((successCount / weekBuilds) * 1000) / 10
      : 100

    const projectIds = new Set(teamPipelines.map(p => p.projectId))

    return {
      weekBuilds,
      successRate,
      projectCount: projectIds.size,
      pipelineCount: teamPipelines.length
    }
  }
}))
