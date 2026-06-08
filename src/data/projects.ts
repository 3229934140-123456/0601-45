import type { Team, Project } from '@/types'

export const teams: Team[] = [
  { id: 'all', name: '全部团队' },
  { id: 'team-1', name: '前端团队' },
  { id: 'team-2', name: '后端团队' },
  { id: 'team-3', name: '移动端团队' },
  { id: 'team-4', name: '测试团队' },
  { id: 'team-5', name: '运维团队' }
]

export const projects: Project[] = [
  {
    id: 'proj-1',
    name: '电商平台 Web',
    teamId: 'team-1',
    teamName: '前端团队',
    repoUrl: 'git@git.example.com:ecommerce/web.git',
    description: '电商主站前端项目',
    buildCount: 256,
    successRate: 92.5,
    lastBuildTime: '2026-06-08 14:30:00'
  },
  {
    id: 'proj-2',
    name: '订单服务',
    teamId: 'team-2',
    teamName: '后端团队',
    repoUrl: 'git@git.example.com:ecommerce/order-service.git',
    description: '订单核心微服务',
    buildCount: 189,
    successRate: 96.8,
    lastBuildTime: '2026-06-08 13:45:00'
  },
  {
    id: 'proj-3',
    name: '用户服务',
    teamId: 'team-2',
    teamName: '后端团队',
    repoUrl: 'git@git.example.com:ecommerce/user-service.git',
    description: '用户中心微服务',
    buildCount: 145,
    successRate: 88.3,
    lastBuildTime: '2026-06-08 12:20:00'
  },
  {
    id: 'proj-4',
    name: '电商 App',
    teamId: 'team-3',
    teamName: '移动端团队',
    repoUrl: 'git@git.example.com:ecommerce/app.git',
    description: '电商移动应用',
    buildCount: 98,
    successRate: 90.2,
    lastBuildTime: '2026-06-08 11:00:00'
  },
  {
    id: 'proj-5',
    name: '自动化测试平台',
    teamId: 'team-4',
    teamName: '测试团队',
    repoUrl: 'git@git.example.com:qa/auto-test.git',
    description: '自动化测试框架',
    buildCount: 67,
    successRate: 85.6,
    lastBuildTime: '2026-06-08 10:30:00'
  },
  {
    id: 'proj-6',
    name: '运维监控系统',
    teamId: 'team-5',
    teamName: '运维团队',
    repoUrl: 'git@git.example.com:ops/monitor.git',
    description: '系统监控与告警平台',
    buildCount: 78,
    successRate: 94.1,
    lastBuildTime: '2026-06-08 09:15:00'
  },
  {
    id: 'proj-7',
    name: '商家后台',
    teamId: 'team-1',
    teamName: '前端团队',
    repoUrl: 'git@git.example.com:merchant/backend.git',
    description: '商家管理后台系统',
    buildCount: 156,
    successRate: 91.8,
    lastBuildTime: '2026-06-07 18:45:00'
  },
  {
    id: 'proj-8',
    name: '支付网关',
    teamId: 'team-2',
    teamName: '后端团队',
    repoUrl: 'git@git.example.com:payment/gateway.git',
    description: '支付网关服务',
    buildCount: 123,
    successRate: 97.5,
    lastBuildTime: '2026-06-07 17:30:00'
  }
]

export const getProjectsByTeam = (teamId: string): Project[] => {
  if (teamId === 'all') return projects
  return projects.filter(p => p.teamId === teamId)
}
