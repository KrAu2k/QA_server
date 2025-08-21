const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function testCurrentUser() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // 获取用户服务
    const userService = app.get('UserService');
    
    console.log('=== 测试用户数据 ===');
    
    // 查找一个用户来检查isAdmin字段
    const users = await userService.findAll({ current: 1, pageSize: 5 });
    console.log('用户数据示例:');
    
    if (users.data && users.data.length > 0) {
      const user = users.data[0];
      console.log({
        id: user.id,
        username: user.username,
        name: user.name,
        isAdmin: user.isAdmin,
        isActive: user.isActive
      });
    } else {
      console.log('没有找到用户数据');
    }
    
    await app.close();
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testCurrentUser();
