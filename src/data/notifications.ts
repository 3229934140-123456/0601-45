import type { Notification, UserProfile, ChangeRecord } from '@/types'

export const notifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'build_failed',
    title: '构建失败：订单服务 CI 构建',
    content: '构建 #45 失败，失败阶段：单元测试。请及时处理。',
    time: '2026-06-08 12:16:35',
    isRead: false,
    relatedId: 'build-4',
    relatedType: 'build'
  },
  {
    id: 'notif-2',
    type: 'approval_pending',
    title: '待审批：订单服务 v2.3.0 生产发布',
    content: '王五 提交了发布申请，等待您的审批。',
    time: '2026-06-08 13:30:00',
    isRead: false,
    relatedId: 'appr-1',
    relatedType: 'approval'
  },
  {
    id: 'notif-3',
    type: 'build_success',
    title: '构建成功：电商平台 Web 主分支',
    content: '构建 #256 成功，耗时 3分05秒。',
    time: '2026-06-08 14:28:05',
    isRead: true,
    relatedId: 'build-1',
    relatedType: 'build'
  },
  {
    id: 'notif-4',
    type: 'approval_pending',
    title: '待审批：支付网关灰度部署',
    content: '赵六 提交了灰度部署申请，等待您的审批。',
    time: '2026-06-07 16:00:00',
    isRead: true,
    relatedId: 'appr-3',
    relatedType: 'approval'
  },
  {
    id: 'notif-5',
    type: 'system',
    title: '系统升级通知',
    content: 'CI 平台将于本周五 22:00-24:00 进行系统升级，期间可能影响构建任务。',
    time: '2026-06-07 09:00:00',
    isRead: true,
    relatedId: '',
    relatedType: 'system'
  },
  {
    id: 'notif-6',
    type: 'approval_done',
    title: '审批已通过：电商平台 Web 紧急修复发布',
    content: '您的发布申请已通过审批。',
    time: '2026-06-08 10:45:00',
    isRead: true,
    relatedId: 'appr-2',
    relatedType: 'approval'
  },
  {
    id: 'notif-7',
    type: 'build_failed',
    title: '构建失败：自动化测试平台',
    content: '构建 #34 失败，失败阶段：集成测试。',
    time: '2026-06-07 18:30:00',
    isRead: true,
    relatedId: 'build-test',
    relatedType: 'build'
  },
  {
    id: 'notif-8',
    type: 'build_success',
    title: '构建成功：支付网关部署',
    content: '构建 #44 成功，耗时 3分20秒。',
    time: '2026-06-07 17:30:00',
    isRead: true,
    relatedId: 'build-pay',
    relatedType: 'build'
  }
]

export const userProfile: UserProfile = {
  id: 'user-1',
  name: '张三',
  avatar: 'https://picsum.photos/id/1005/200/200',
  email: 'zhangsan@example.com',
  role: '研发负责人',
  team: '前端团队',
  notificationSettings: {
    buildFailed: true,
    buildSuccess: false,
    approvalPending: true,
    approvalDone: true
  }
}

export const changeRecords: ChangeRecord[] = [
  {
    id: 'cr-1',
    commitHash: 'a1b2c3d4e5f6g7h8i9j0',
    commitMessage: 'feat: 新增商品搜索功能优化\n\n- 优化搜索算法，提升相关度排序\n- 增加搜索建议功能\n- 优化搜索性能，响应时间降低30%',
    author: '张三',
    time: '2026-06-08 14:24:00',
    branch: 'main',
    filesChanged: [
      'src/pages/search/index.tsx',
      'src/components/SearchBar/index.tsx',
      'src/utils/search.ts',
      'src/services/searchApi.ts'
    ],
    relatedBuildId: 'build-1',
    relatedBuildNumber: 256
  },
  {
    id: 'cr-2',
    commitHash: 'b2c3d4e5f6g7h8i9j0a1',
    commitMessage: 'fix: 修复购物车数量显示问题\n\n修复了购物车中商品数量超过99时显示异常的问题',
    author: '李四',
    time: '2026-06-08 14:19:00',
    branch: 'develop',
    filesChanged: [
      'src/components/CartBadge/index.tsx',
      'src/pages/cart/index.tsx'
    ],
    relatedBuildId: 'build-2',
    relatedBuildNumber: 189
  },
  {
    id: 'cr-3',
    commitHash: 'c3d4e5f6g7h8i9j0a1b2',
    commitMessage: 'release: v2.3.0 发布\n\n- 新增订单导出功能\n- 优化接口性能\n- 修复若干bug',
    author: '王五',
    time: '2026-06-08 13:34:00',
    branch: 'main',
    filesChanged: [
      'package.json',
      'CHANGELOG.md',
      'src/controllers/orderController.ts',
      'src/services/exportService.ts',
      'src/middlewares/rateLimiter.ts'
    ],
    relatedBuildId: 'build-3',
    relatedBuildNumber: 78
  },
  {
    id: 'cr-4',
    commitHash: 'd4e5f6g7h8i9j0a1b2c3',
    commitMessage: 'feat: 新增订单导出接口\n\n- 支持按时间范围导出\n- 支持Excel和CSV格式\n- 异步导出，邮件通知',
    author: '赵六',
    time: '2026-06-08 12:14:00',
    branch: 'feature-new-api',
    filesChanged: [
      'src/routes/orderRoutes.ts',
      'src/controllers/exportController.ts',
      'src/services/exportService.ts',
      'src/utils/excelHelper.ts',
      '__tests__/export.test.ts'
    ],
    relatedBuildId: 'build-4',
    relatedBuildNumber: 45
  }
]
