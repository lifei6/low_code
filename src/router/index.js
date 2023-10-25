import { createRouter, createWebHashHistory } from 'vue-router'


// 采用这个工具快速生成组件文件和对应路由文件
// 命令行模式
// coderwhy add3page_setup department -d src/views/main/system/department
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/main',
    },
    {
      path: '/main',
      name: 'main',//加名字才能添加路由，用名字添加的，不然路由出口不对
      component: () => import('@/packages/editor.jsx'),
      redirect: '/main/base',
      // 左侧菜单栏路由
      children: [
        {
          path: 'document',
          component: () => import('@/packages/components/editor-left/c-cpns/right-components/document-components/document-components'),
        },
        {
          path: 'base',
          component: () => import('@/packages/components/editor-left/c-cpns/right-components/base-components/base-components'),
        },
        {
          path: 'container',
          component: () => import('@/packages/components/editor-left/c-cpns/right-components/container-components/container-components'),
        }
      ]
    },
    // {
    //   path: '/login',
    //   component: () => import('@/views/login/login.vue')
    // },
    {
      path: '/:pathMatch(.*)',
      component: () => import('@/packages/editor.jsx')
    },
  ]
})
export default router
