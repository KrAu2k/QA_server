const { createConnection } = require('typeorm');

async function checkUsers() {
  try {
    const connection = await createConnection({
      type: 'sqlite',
      database: 'database.db',
      entities: ['dist/**/*.entity.js'],
      synchronize: false,
    });

    const userRepository = connection.getRepository('User');
    
    // 查找所有用户
    const users = await userRepository.find({
      select: ['id', 'userid', 'username', 'name', 'isActive']
    });
    
    console.log('数据库中的用户列表：');
    users.forEach(user => {
      console.log(`ID: ${user.id}, UserID: ${user.userid}, Username: ${user.username}, Name: ${user.name}, Active: ${user.isActive}`);
    });
    
    // 特别查找 userid='2' 的用户
    const user2 = await userRepository.findOne({ where: { userid: '2' } });
    console.log('\n查找 userid="2" 的用户：', user2);
    
    await connection.close();
  } catch (error) {
    console.error('检查用户时发生错误:', error);
  }
}

checkUsers();
