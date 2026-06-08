import type { Approval, ApprovalRecord } from '@/types'

const createRecords = (approvers: string[], currentIdx: number, status: string): ApprovalRecord[] => {
  return approvers.map((name, idx) => {
    let recordStatus: ApprovalRecord['status'] = 'pending'
    let time: string | undefined
    let remark: string | undefined

    if (status === 'approved') {
      recordStatus = 'approved'
      time = `2026-06-08 ${10 + idx}:${15 + idx * 5}:00`
      remark = idx === 0 ? '代码已review，功能正常' : idx === 1 ? '测试通过，可发布' : '同意发布'
    } else if (status === 'rejected') {
      if (idx < currentIdx) {
        recordStatus = 'approved'
        time = `2026-06-07 ${14 + idx}:${30 + idx * 5}:00`
        remark = '初步审核通过'
      } else if (idx === currentIdx) {
        recordStatus = 'rejected'
        time = '2026-06-07 15:10:00'
        remark = '风险评估不足，需补充回滚方案'
      }
    } else {
      if (idx < currentIdx) {
        recordStatus = 'approved'
        time = `2026-06-08 ${10 + idx}:${15 + idx * 5}:00`
        remark = idx === 0 ? '代码已review' : '测试验证通过'
      }
    }

    return {
      id: `rec-${idx}`,
      approver: name,
      status: recordStatus,
      time,
      remark,
      role: idx === approvers.length - 1 ? '终审' : idx === 0 ? '初审' : '复审'
    }
  })
}

export const approvals: Approval[] = [
  {
    id: 'appr-1',
    title: '订单服务 v2.3.0 生产发布',
    type: 'release',
    projectName: '订单服务',
    pipelineName: '生产部署流水线',
    buildNumber: 78,
    applicant: '王五',
    applyTime: '2026-06-08 13:30:00',
    status: 'pending',
    description: '本次发布包含订单导出功能优化和性能提升，预计影响范围较小。',
    impactScope: '订单模块所有接口，预计影响 30% 用户',
    approvers: ['张三', '李四', '技术总监'],
    currentApprover: '技术总监',
    approvalRecords: createRecords(['张三', '李四', '技术总监'], 2, 'pending')
  },
  {
    id: 'appr-2',
    title: '电商平台 Web 紧急修复发布',
    type: 'release',
    projectName: '电商平台 Web',
    pipelineName: '主分支构建',
    buildNumber: 255,
    applicant: '张三',
    applyTime: '2026-06-08 10:15:00',
    status: 'approved',
    description: '修复购物车数量显示不正确的紧急问题。',
    impactScope: '购物车页面，影响所有使用购物车的用户',
    approvers: ['李四', '王五'],
    currentApprover: '王五',
    approvalRecords: createRecords(['李四', '王五'], 1, 'approved')
  },
  {
    id: 'appr-3',
    title: '支付网关灰度部署',
    type: 'deploy',
    projectName: '支付网关',
    pipelineName: '支付网关部署',
    buildNumber: 45,
    applicant: '赵六',
    applyTime: '2026-06-07 16:00:00',
    status: 'pending',
    description: '支付渠道新增，灰度 10% 用户验证。',
    impactScope: '支付模块，灰度比例 10%',
    approvers: ['张三', '技术总监'],
    currentApprover: '张三',
    approvalRecords: createRecords(['张三', '技术总监'], 0, 'pending')
  },
  {
    id: 'appr-4',
    title: '用户服务回滚到 v1.8.2',
    type: 'rollback',
    projectName: '用户服务',
    pipelineName: '用户服务构建',
    buildNumber: 67,
    applicant: '李四',
    applyTime: '2026-06-07 14:30:00',
    status: 'rejected',
    description: '上线后发现登录异常，需要回滚。',
    impactScope: '用户登录、注册模块',
    approvers: ['张三', '王五'],
    currentApprover: '张三',
    approvalRecords: createRecords(['张三', '王五'], 0, 'rejected')
  },
  {
    id: 'appr-5',
    title: '监控系统 v2.0 发布',
    type: 'release',
    projectName: '运维监控系统',
    pipelineName: '监控系统构建',
    buildNumber: 23,
    applicant: '运维小李',
    applyTime: '2026-06-06 11:00:00',
    status: 'approved',
    description: '监控系统大版本升级，新增告警聚合和大屏展示功能。',
    impactScope: '内部运维系统，不影响业务',
    approvers: ['运维主管'],
    currentApprover: '运维主管',
    approvalRecords: createRecords(['运维主管'], 0, 'approved')
  }
]

export const getPendingApprovals = (): Approval[] => {
  return approvals.filter(a => a.status === 'pending')
}

export const getApprovalById = (id: string): Approval | undefined => {
  return approvals.find(a => a.id === id)
}
