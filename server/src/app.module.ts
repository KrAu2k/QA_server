import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LogModule } from './log/log.module';
import { GoodsModule } from './goods/goods.module';
import { DepartmentModule } from './department/department.module';
import { BiDatabaseModule } from './bi-database/bi-database.module';
import { ProjectModule } from './project/project.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
        envFilePath: '.env'
      }
    ),
    ScheduleModule.forRoot(), // 添加定时任务支持
    // 静态文件服务配置 - 多个配置
    ServeStaticModule.forRoot(
      // 根目录配置 - 映射 /Users/StingZZ/CODE/QA/h5/dist 目录到 / 路径
      {
        rootPath: '/Users/StingZZ/CODE/QA/dist',
        serveRoot: '/',
        serveStaticOptions: {
          index: ['index.html', 'index.htm'],
          dotfiles: 'ignore',
          etag: false, // Etag 是一种缓存机制，设置为 false 禁用
          extensions: [], 
          fallthrough: true,
          immutable: false,
          lastModified: true,
          maxAge: 0, 
          redirect: true,
          setHeaders: (res, path, stat) => {
            // 设置缓存控制头
            res.set('Cache-Control', 'no-cache');
          },
        },
      },
      // games目录配置 - 映射 /Users/StingZZ/CODE/QA/h5 目录到 /games 路径
      {
        rootPath: '/Users/StingZZ/CODE/QA/h5',
        serveRoot: '/games',
        serveStaticOptions: {
          index: ['index.html', 'index.htm'],
          dotfiles: 'ignore',
          etag: false,
          extensions: [], 
          fallthrough: true,
          immutable: false,
          lastModified: true,
          maxAge: 0, 
          redirect: true,
          setHeaders: (res, path, stat) => {
            // 设置缓存控制头
            res.set('Cache-Control', 'no-cache');
          },
        },
      }
    ),
    // 主数据库配置
    TypeOrmModule.forRoot({
      name: 'default',
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    // 报表数据库配置
    TypeOrmModule.forRoot({
      name: 'report',
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.REPORT_DB_NAME || 'report',
      autoLoadEntities: true,
      synchronize: true,
    }),
    // BI数据库配置 - 使用 mysql_clear_password 认证
    // TypeOrmModule.forRoot({
    //   name: 'bi',
    //   type: 'mysql',
    //   host: process.env.BI_DB_HOST,
    //   port: parseInt(process.env.BI_DB_PORT),
    //   username: process.env.BI_DB_USERNAME,
    //   password: process.env.BI_DB_PASSWORD,
    //   database: process.env.BI_DB_NAME,
    //   autoLoadEntities: true,
    //   synchronize: false, // BI数据库通常设为false，避免意外修改结构
    //   extra: {
    //     authPlugins: {
    //       mysql_clear_password: () => require('mysql2/lib/auth_plugins/mysql_clear_password')
    //     }
    //   },
    //   charset: 'utf8mb4',
    // }),
    UserModule,
    AuthModule,
    LogModule,
    DepartmentModule,
    BiDatabaseModule,
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
