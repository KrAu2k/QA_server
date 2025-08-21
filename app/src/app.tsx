import { Footer, Question, SelectLang, AvatarDropdown, AvatarName } from '@/components';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import React from 'react';
import { App } from 'antd';

// 在开发环境中抑制 findDOMNode 警告
import './suppressWarnings';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

// 在开发环境中抑制 findDOMNode 警告
// 这是由于 Ant Design 和相关组件库仍在使用已弃用的 findDOMNode API
if (isDev) {
  // 抑制 console.warn 中的 findDOMNode 警告
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('findDOMNode is deprecated') ||
        args[0].includes('Warning: findDOMNode is deprecated'))
    ) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  // 抑制 console.error 中的 findDOMNode 警告
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('findDOMNode is deprecated') ||
        args[0].includes('Warning: findDOMNode is deprecated'))
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // 抑制全局错误处理中的相关警告
  const originalWindowError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (
      typeof message === 'string' &&
      (message.includes('findDOMNode is deprecated') ||
        message.includes('Warning: findDOMNode is deprecated'))
    ) {
      return true; // 阻止默认处理
    }
    if (originalWindowError) {
      return originalWindowError(message, source, lineno, colno, error);
    }
    return false;
  };
}

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  // 返回值
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        // 获取当前用户信息

        skipErrorHandler: true, // 跳过错误处理
      });

      console.log(msg);
      return msg.data;
    } catch (error) {
      console.log('error', error);
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const { location } = history; // 获取当前的 location
  console.log('location', location);
  if (location.pathname !== loginPath) {
    // 如果不是登录页面
    const currentUser = await fetchUserInfo(); // 获取当前用户信息
    return {
      fetchUserInfo, // 返回获取用户信息的方法
      currentUser, // 返回当前用户信息
      settings: defaultSettings as Partial<LayoutSettings>, // 返回默认的设置
    };
  }
  return {
    fetchUserInfo, // 返回获取用户信息的方法
    settings: defaultSettings as Partial<LayoutSettings>, // 返回默认的设置
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    actionsRender: () => [<Question key="doc" />, <SelectLang key="SelectLang" />],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.group + ' - ' + 
        initialState?.currentUser?.name
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    // links: isDev
    //   ? [
    //       <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
    //         <LinkOutlined />
    //         <span>OpenAPI 文档</span>
    //       </Link>,
    //     ]
    //   : [],
    menuHeaderRender: undefined,
    // 内容区域相关配置

    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  // 在开发环境使用相对路径，利用 proxy 代理
  // 在生产环境使用完整的 API 地址
  baseURL: process.env.NODE_ENV === 'development' ? '' : 'http://192.168.20.20:3000/',
  withCredentials: true, // 允许发送 cookies
  ...errorConfig,
};
