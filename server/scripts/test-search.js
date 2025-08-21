const axios = require('axios');

async function testSearch() {
  const baseURL = 'http://localhost:3000/api';
  
  console.log('开始测试报价单搜索功能...\n');
  
  // 测试1: 搜索所有报价单
  console.log('1. 测试获取所有报价单:');
  try {
    const response = await axios.get(`${baseURL}/sales-quote`);
    console.log(`✅ 成功获取 ${response.data.total} 条报价单`);
    console.log(`   数据: ${JSON.stringify(response.data.data.map(q => ({ 
      quoteNumber: q.quoteNumber, 
      customerName: q.customerName,
      status: q.status 
    })), null, 2)}`);
  } catch (error) {
    console.error('❌ 获取所有报价单失败:', error.response?.data || error.message);
  }
  
  console.log('\n2. 测试按客户名称搜索:');
  try {
    const response = await axios.get(`${baseURL}/sales-quote?customerName=北京科技`);
    console.log(`✅ 按客户名称搜索成功，找到 ${response.data.total} 条记录`);
    console.log(`   结果: ${JSON.stringify(response.data.data.map(q => ({ 
      quoteNumber: q.quoteNumber, 
      customerName: q.customerName 
    })), null, 2)}`);
  } catch (error) {
    console.error('❌ 按客户名称搜索失败:', error.response?.data || error.message);
  }
  
  console.log('\n3. 测试按状态搜索:');
  try {
    const response = await axios.get(`${baseURL}/sales-quote?status=false`);
    console.log(`✅ 按状态搜索成功，找到 ${response.data.total} 条未审核记录`);
    console.log(`   结果: ${JSON.stringify(response.data.data.map(q => ({ 
      quoteNumber: q.quoteNumber, 
      status: q.status 
    })), null, 2)}`);
  } catch (error) {
    console.error('❌ 按状态搜索失败:', error.response?.data || error.message);
  }
  
  console.log('\n4. 测试按报价单号搜索:');
  try {
    const response = await axios.get(`${baseURL}/sales-quote?quoteNumber=BJ202506220009`);
    console.log(`✅ 按报价单号搜索成功，找到 ${response.data.total} 条记录`);
    console.log(`   结果: ${JSON.stringify(response.data.data.map(q => ({ 
      quoteNumber: q.quoteNumber, 
      customerName: q.customerName 
    })), null, 2)}`);
  } catch (error) {
    console.error('❌ 按报价单号搜索失败:', error.response?.data || error.message);
  }
  
  console.log('\n搜索功能测试完成！');
}

// 运行测试
testSearch().catch(console.error); 