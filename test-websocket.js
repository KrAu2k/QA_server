const { io } = require('./app/node_modules/socket.io-client');

const socket = io('http://127.0.0.1:3000/project-updates', {
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('WebSocket连接成功！');
  console.log('Socket ID:', socket.id);
  
  // 测试发送消息
  socket.emit('joinRoom', { projectId: 1 });
});

socket.on('disconnect', () => {
  console.log('WebSocket连接断开');
});

socket.on('connect_error', (error) => {
  console.error('WebSocket连接错误:', error);
});

socket.on('joinedRoom', (data) => {
  console.log('加入房间成功:', data);
});

socket.on('updateOutput', (data) => {
  console.log('更新输出:', data);
});

socket.on('updateError', (data) => {
  console.log('更新错误:', data);
});

socket.on('updateComplete', (data) => {
  console.log('更新完成:', data);
});

// 保持连接几秒钟
setTimeout(() => {
  socket.disconnect();
  process.exit(0);
}, 5000);
