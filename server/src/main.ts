import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'], // 全部日志级别
  });

  // 启用全局验证管道，自动转换和验证DTO
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // 启用自动转换
    whitelist: true, // 只允许DTO中定义的属性
    forbidNonWhitelisted: false, // 允许未定义的属性（静默忽略）
    transformOptions: {
      enableImplicitConversion: true, // 启用隐式类型转换
    },
  }));

  // 启用全局序列化拦截器，自动应用 @Exclude() 装饰器
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 启用 CORS
  app.enableCors({
    origin: true, // 允许所有来源
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept',
      'trace-id', // 允许 trace-id 头部
      'X-Requested-With',
      'Origin',
    ],
    credentials: true, // 允许发送 cookies
  });

  // 设置全局日志级别（如果需要全局日志设置，应该在 NestFactory.create 时传递 logger 选项）
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
