export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/pipeline/index',
    'pages/approval/index',
    'pages/notification/index',
    'pages/mine/index',
    'pages/build-detail/index',
    'pages/change-record/index',
    'pages/project-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'CI 平台',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f6f7'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/pipeline/index',
        text: '流水线'
      },
      {
        pagePath: 'pages/approval/index',
        text: '审批'
      },
      {
        pagePath: 'pages/notification/index',
        text: '通知'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
