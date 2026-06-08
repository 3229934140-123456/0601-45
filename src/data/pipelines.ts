import type { Pipeline } from '@/types'

export const pipelines: Pipeline[] = [
  {
    id: 'pipe-1',
    name: '主分支构建',
    projectId: 'proj-1',
    projectName: '电商平台 Web',
    branch: 'main',
    lastBuildStatus: 'success',
    lastBuildTime: '2026-06-08 14:30:00',
    lastBuildDuration: 185,
    lastTriggerUser: '张三',
    isFavorite: true,
    buildCountWeek: 12,
    successRateWeek: 91.7
  },
  {
    id: 'pipe-2',
    name: '开发分支构建',
    projectId: 'proj-1',
    projectName: '电商平台 Web',
    branch: 'develop',
    lastBuildStatus: 'running',
    lastBuildTime: '2026-06-08 14:25:00',
    lastBuildDuration: 120,
    lastTriggerUser: '李四',
    isFavorite: false,
    buildCountWeek: 28,
    successRateWeek: 85.7
  },
  {
    id: 'pipe-3',
    name: '生产部署流水线',
    projectId: 'proj-2',
    projectName: '订单服务',
    branch: 'main',
    lastBuildStatus: 'success',
    lastBuildTime: '2026-06-08 13:45:00',
    lastBuildDuration: 320,
    lastTriggerUser: '王五',
    isFavorite: true,
    buildCountWeek: 5,
    successRateWeek: 100
  },
  {
    id: 'pipe-4',
    name: 'CI 构建',
    projectId: 'proj-2',
    projectName: '订单服务',
    branch: 'feature-new-api',
    lastBuildStatus: 'failed',
    lastBuildTime: '2026-06-08 12:30:00',
    lastBuildDuration: 95,
    lastTriggerUser: '赵六',
    isFavorite: false,
    buildCountWeek: 8,
    successRateWeek: 75
  },
  {
    id: 'pipe-5',
    name: '用户服务构建',
    projectId: 'proj-3',
    projectName: '用户服务',
    branch: 'main',
    lastBuildStatus: 'success',
    lastBuildTime: '2026-06-08 12:20:00',
    lastBuildDuration: 150,
    lastTriggerUser: '张三',
    isFavorite: false,
    buildCountWeek: 10,
    successRateWeek: 90
  },
  {
    id: 'pipe-6',
    name: 'App 打包 - iOS',
    projectId: 'proj-4',
    projectName: '电商 App',
    branch: 'main',
    lastBuildStatus: 'pending',
    lastBuildTime: '2026-06-08 11:00:00',
    lastBuildDuration: 0,
    lastTriggerUser: '李四',
    isFavorite: true,
    buildCountWeek: 3,
    successRateWeek: 100
  },
  {
    id: 'pipe-7',
    name: 'App 打包 - Android',
    projectId: 'proj-4',
    projectName: '电商 App',
    branch: 'main',
    lastBuildStatus: 'success',
    lastBuildTime: '2026-06-08 10:45:00',
    lastBuildDuration: 280,
    lastTriggerUser: '李四',
    isFavorite: false,
    buildCountWeek: 3,
    successRateWeek: 100
  },
  {
    id: 'pipe-8',
    name: '测试流水线',
    projectId: 'proj-5',
    projectName: '自动化测试平台',
    branch: 'main',
    lastBuildStatus: 'success',
    lastBuildTime: '2026-06-08 10:30:00',
    lastBuildDuration: 420,
    lastTriggerUser: '测试小王',
    isFavorite: false,
    buildCountWeek: 7,
    successRateWeek: 85.7
  },
  {
    id: 'pipe-9',
    name: '监控系统构建',
    projectId: 'proj-6',
    projectName: '运维监控系统',
    branch: 'main',
    lastBuildStatus: 'success',
    lastBuildTime: '2026-06-08 09:15:00',
    lastBuildDuration: 110,
    lastTriggerUser: '运维小李',
    isFavorite: false,
    buildCountWeek: 4,
    successRateWeek: 100
  },
  {
    id: 'pipe-10',
    name: '商家后台构建',
    projectId: 'proj-7',
    projectName: '商家后台',
    branch: 'main',
    lastBuildStatus: 'cancelled',
    lastBuildTime: '2026-06-07 18:45:00',
    lastBuildDuration: 45,
    lastTriggerUser: '张三',
    isFavorite: false,
    buildCountWeek: 6,
    successRateWeek: 83.3
  },
  {
    id: 'pipe-11',
    name: '支付网关部署',
    projectId: 'proj-8',
    projectName: '支付网关',
    branch: 'main',
    lastBuildStatus: 'success',
    lastBuildTime: '2026-06-07 17:30:00',
    lastBuildDuration: 200,
    lastTriggerUser: '王五',
    isFavorite: true,
    buildCountWeek: 2,
    successRateWeek: 100
  }
]

export const getPipelinesByTeam = (teamId: string): Pipeline[] => {
  if (teamId === 'all') return pipelines
  const teamProjects = ['proj-1', 'proj-2', 'proj-3', 'proj-4', 'proj-5', 'proj-6', 'proj-7', 'proj-8']
  const teamProjectMap: Record<string, string[]> = {
    'team-1': ['proj-1', 'proj-7'],
    'team-2': ['proj-2', 'proj-3', 'proj-8'],
    'team-3': ['proj-4'],
    'team-4': ['proj-5'],
    'team-5': ['proj-6']
  }
  const projectIds = teamProjectMap[teamId] || teamProjects
  return pipelines.filter(p => projectIds.includes(p.projectId))
}

export const getFavoritePipelines = (): Pipeline[] => {
  return pipelines.filter(p => p.isFavorite)
}
