import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { message, notification } from 'antd';
import { v4 as uuidv4 } from 'uuid';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        const { status, data } = error.response;
        
        if (status === 401) {
          // 处理401未授权错误
          if (data?.code === 'USER_DISABLED') {
            message.error(data.message || '用户账号已被禁用，无法访问系统');
          } else if (data?.message?.includes('token') || 
                     data?.message?.includes('过期') ||
                     data?.message?.includes('认证') ||
                     data?.message?.includes('登录')) {
            message.error('登录已过期，请重新登录');
          } else {
            message.error('用户校验失败，请重新登录');
          }
          
          // 清除本地存储的token
          localStorage.removeItem('token');
          
          // 跳转到登录页
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/user/login') {
            setTimeout(() => {
              window.location.href = '/user/login';
            }, 1000); // 延迟1秒，让用户看到错误消息
          }
        } else if (status === 403) {
          // 处理403禁止访问错误
          message.error(data?.message || '权限不足，无法访问该资源');
        } else {
          message.error(`请求失败: ${status}`);
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (url: string, options: RequestConfig) => {
      let tokens: any = { 'Trace-id': uuidv4() };

      if (url !== '/login/account' && url !== '/login/captcha') {
        
        const token = localStorage.getItem('token');
        tokens['Authorization'] = 'Bearer ' + token;
        console.log('sting token 请求拦截器:', tokens['Authorization']);
      }

      return {
        url,
        options: { ...options, interceptors: true, headers: tokens }, // 携带token
      };
    }
  ],


  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;

      // 处理401未授权错误
      if (response.status === 401) {
        const responseData = response.data as any;
        
        // 检查用户被禁用的情况
        if (responseData?.code === 'USER_DISABLED') {
          message.error(responseData.message || '用户账号已被禁用，无法访问系统');
        } 
        // 检查token过期或无效
        else if (responseData?.message?.includes('token') || 
                 responseData?.message?.includes('过期') ||
                 responseData?.message?.includes('认证') ||
                 responseData?.message?.includes('登录')) {
          message.error('登录已过期，请重新登录');
        }
        // 其他401错误
        else {
          message.error('用户校验失败，请重新登录');
        }
        
        // 清除本地存储的token
        localStorage.removeItem('token');
        
        // 跳转到登录页
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/user/login') {
          window.location.href = '/user/login';
        }
        
        return response;
      }

      // 处理403禁止访问错误
      if (response.status === 403) {
        const responseData = response.data as any;
        message.error(responseData?.message || '权限不足，无法访问');
        return response;
      }

      if (data?.success === false) {
        message.error('请求失败！');
      }
      return response;
    },
  ],
};
