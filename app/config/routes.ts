/**
 * @name umi 的路由配置    https://umijs.org/zh-CN/docs/routing
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
      {
        name: 'company-select',
        path: '/user/company-select',
        component: './User/CompanySelect',
      },
    ],
  },
  {
    path: '/workplace',
    name: 'Workplace',
    icon: 'dashboard',
    component: './Workplace',
  },
  // 系统管理模块
  {
    path: '/system',
    name: 'system',
    icon: 'setting',
    access: 'canSystem', // 添加权限控制
    routes: [
      {
        path: '/system',
        redirect: '/system/user/list',
      },
      // 用户管理 - 直接指向用户列表
      {
        path: '/system/user/list',
        name: 'user',
        component: './System/User/List',
      },
      // 用户详情
      {
        path: '/system/user/detail/:id',
        name: 'userDetail',
        component: './System/User/Detail',
        hideInMenu: true,
      },
      // 创建用户
      {
        path: '/system/user/create',
        name: 'userCreate',
        component: './System/User/Create',
        hideInMenu: true,
      },
      // 编辑用户
      {
        path: '/system/user/edit/:id',
        name: 'userEdit',
        component: './System/User/Edit',
        hideInMenu: true,
      },
      // 部门管理
      {
        path: '/system/department',
        name: 'department',
        component: './System/Department',
      },
      // 日志管理
      {
        path: '/system/log',
        name: 'log',
        component: './System/Log',
      },
      // 项目管理
      {
        path: '/system/project/list',
        name: 'project',
        component: './System/Project/List',
      },
      // 项目详情
      {
        path: '/system/project/detail/:id',
        name: 'projectDetail',
        component: './System/Project/Detail',
        hideInMenu: true,
      },
      // 创建项目
      {
        path: '/system/project/create',
        name: 'projectCreate',
        component: './System/Project/Create',
        hideInMenu: true,
      },
      // 编辑项目
      {
        path: '/system/project/edit/:id',
        name: 'projectEdit',
        component: './System/Project/Edit',
        hideInMenu: true,
      },
    ],
  },
   
  {
    path: '/',
    redirect: '/Workplace',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];