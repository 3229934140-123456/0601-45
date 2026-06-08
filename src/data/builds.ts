import type { Build, BuildPhase } from '@/types'

const generatePhases = (status: string): BuildPhase[] => {
  const phaseTemplates = [
    { name: '代码检出', logs: ['Cloning into \'repo\'...', 'Checking connectivity... done.', 'HEAD is now at abc1234...'] },
    { name: '依赖安装', logs: ['npm install', 'added 1234 packages in 45s', 'npm audit: 0 vulnerabilities'] },
    { name: '代码检查', logs: ['ESLint: 0 errors, 2 warnings', 'TypeScript check passed'] },
    { name: '单元测试', logs: ['Test Suites: 45 passed, 45 total', 'Tests: 567 passed, 567 total', 'Snapshots: 23 passed, 23 total'] },
    { name: '构建打包', logs: ['Starting build...', 'Creating an optimized production build...', 'Build completed successfully'] },
    { name: '部署发布', logs: ['Deploying to production...', 'Uploading artifacts...', 'Deployment completed successfully'] }
  ]

  let statusIndex = 6
  if (status === 'failed') statusIndex = 3
  if (status === 'running') statusIndex = 3
  if (status === 'pending') statusIndex = 0
  if (status === 'cancelled') statusIndex = 2
  if (status === 'skipped') statusIndex = 0

  return phaseTemplates.map((phase, index) => {
    let phaseStatus: BuildPhase['status'] = 'success'
    if (index > statusIndex - 1 && status === 'running') phaseStatus = 'pending'
    else if (index >= statusIndex && status !== 'success') phaseStatus = 'skipped'
    else if (index === statusIndex - 1 && status === 'failed') phaseStatus = 'failed'
    else if (index < statusIndex) phaseStatus = 'success'
    else phaseStatus = 'pending'

    if (status === 'running' && index === statusIndex - 1) phaseStatus = 'running'
    if (status === 'cancelled') {
      if (index < statusIndex) phaseStatus = 'success'
      else if (index === statusIndex) phaseStatus = 'cancelled'
      else phaseStatus = 'skipped'
    }

    return {
      id: `phase-${index}`,
      name: phase.name,
      status: phaseStatus,
      duration: phaseStatus === 'success' || phaseStatus === 'failed' ? Math.floor(Math.random() * 120) + 30 : 0,
      startTime: '2026-06-08 14:00:00',
      endTime: phaseStatus === 'success' || phaseStatus === 'failed' ? '2026-06-08 14:30:00' : undefined,
      logs: phaseStatus === 'success' || phaseStatus === 'failed' ? phase.logs : phaseStatus === 'running' ? [phase.logs[0], '正在执行中...'] : []
    }
  })
}

export const builds: Build[] = [
  {
    id: 'build-1',
    buildNumber: 256,
    pipelineId: 'pipe-1',
    pipelineName: '主分支构建',
    projectId: 'proj-1',
    projectName: '电商平台 Web',
    status: 'success',
    branch: 'main',
    commitMessage: 'feat: 新增商品搜索功能优化',
    commitHash: 'a1b2c3d4e5f6g7h8i9j0',
    triggerUser: '张三',
    triggerType: 'push',
    startTime: '2026-06-08 14:25:00',
    endTime: '2026-06-08 14:28:05',
    duration: 185,
    phases: generatePhases('success'),
    remark: '本次构建包含搜索性能优化，预计提升30%搜索速度'
  },
  {
    id: 'build-2',
    buildNumber: 189,
    pipelineId: 'pipe-2',
    pipelineName: '开发分支构建',
    projectId: 'proj-1',
    projectName: '电商平台 Web',
    status: 'running',
    branch: 'develop',
    commitMessage: 'fix: 修复购物车数量显示问题',
    commitHash: 'b2c3d4e5f6g7h8i9j0a1',
    triggerUser: '李四',
    triggerType: 'push',
    startTime: '2026-06-08 14:20:00',
    duration: 120,
    phases: generatePhases('running')
  },
  {
    id: 'build-3',
    buildNumber: 78,
    pipelineId: 'pipe-3',
    pipelineName: '生产部署流水线',
    projectId: 'proj-2',
    projectName: '订单服务',
    status: 'success',
    branch: 'main',
    commitMessage: 'release: v2.3.0 发布',
    commitHash: 'c3d4e5f6g7h8i9j0a1b2',
    triggerUser: '王五',
    triggerType: 'manual',
    startTime: '2026-06-08 13:35:00',
    endTime: '2026-06-08 13:40:20',
    duration: 320,
    phases: generatePhases('success'),
    remark: '生产环境发布，已通知相关负责人'
  },
  {
    id: 'build-4',
    buildNumber: 45,
    pipelineId: 'pipe-4',
    pipelineName: 'CI 构建',
    projectId: 'proj-2',
    projectName: '订单服务',
    status: 'failed',
    branch: 'feature-new-api',
    commitMessage: 'feat: 新增订单导出接口',
    commitHash: 'd4e5f6g7h8i9j0a1b2c3',
    triggerUser: '赵六',
    triggerType: 'push',
    startTime: '2026-06-08 12:15:00',
    endTime: '2026-06-08 12:16:35',
    duration: 95,
    phases: generatePhases('failed')
  },
  {
    id: 'build-5',
    buildNumber: 23,
    pipelineId: 'pipe-6',
    pipelineName: 'App 打包 - iOS',
    projectId: 'proj-4',
    projectName: '电商 App',
    status: 'pending',
    branch: 'main',
    commitMessage: 'chore: 更新版本号到 v3.1.0',
    commitHash: 'e5f6g7h8i9j0a1b2c3d4',
    triggerUser: '李四',
    triggerType: 'tag',
    startTime: '2026-06-08 11:00:00',
    duration: 0,
    phases: generatePhases('pending')
  }
]

export const getBuildById = (id: string): Build | undefined => {
  return builds.find(b => b.id === id)
}

export const getBuildsByPipeline = (pipelineId: string): Build[] => {
  return builds.filter(b => b.pipelineId === pipelineId)
}

export const recentBuilds = builds
