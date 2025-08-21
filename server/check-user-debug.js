const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module').AppModule;

async function checkUser() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userService = app.get('UserService');
    
    console.log('正在查找 userid="2" 的用户...');
    
    const user = await userService.findByEmployeeNo('2');
    
    if (user) {
      console.log('找到用户：', {
        id: user.id,
        employeeNo: user.employeeNo,
        username: user.username,
        name: user.name,
        isActive: user.isActive
      });
    } else {
      console.log('未找到 userid="2" 的用户');
      
      // 查找所有用户来调试
      console.log('\n正在查找所有用户...');
      const allUsers = await userService.findAll({ page: 1, pageSize: 100 });
      console.log('用户列表：');
      allUsers.data.forEach(user => {
        console.log(`ID: ${user.id}, EmployeeNo: ${user.employeeNo}, Username: ${user.username}, Name: ${user.name}`);
      });
    }
    
    await app.close();
  } catch (error) {
    console.error('检查用户时发生错误:', error);
  }
}

checkUser();
