import { ServeStaticModuleOptions } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * 获取项目静态文件服务配置
 */
export function getProjectStaticConfigs(): ServeStaticModuleOptions[] {
  const configs: ServeStaticModuleOptions[] = [];
  
  // 项目 0171 的静态文件配置
  const project0171Path = join(__dirname, '..', '..', 'project_d', '0171', 'build');
  if (existsSync(project0171Path)) {
    configs.push({
      rootPath: project0171Path,
      serveRoot: '/games/0171',
      serveStaticOptions: {
        index: 'index.html',
        fallthrough: false,
      },
    });
  }
  
  // 通用 games 根路径配置
  const gamesRootPath = join(__dirname, '..', '..', 'project_d');
  if (existsSync(gamesRootPath)) {
    configs.push({
      rootPath: gamesRootPath,
      serveRoot: '/games',
      serveStaticOptions: {
        index: false, // 不自动提供目录索引
        fallthrough: true, // 允许继续查找其他路径
      },
    });
  }
  
  return configs;
}

/**
 * 获取项目静态文件访问URL
 */
export function getProjectStaticUrl(projectId: string, baseUrl: string = ''): string {
  return `${baseUrl}/games/${projectId}`;
}
