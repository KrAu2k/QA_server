const axios = require('axios');

async function testEditQuote() {
  const baseURL = 'http://localhost:3000/api';
  
  console.log('开始测试报价单编辑功能...\n');
  
  try {
    // 1. 获取第一个报价单
    console.log('1. 获取报价单列表:');
    const listResponse = await axios.get(`${baseURL}/sales-quote?page=1&limit=1`);
    
    if (listResponse.data.data.length === 0) {
      console.log('❌ 没有找到报价单数据，请先创建一些测试数据');
      return;
    }
    
    const quote = listResponse.data.data[0];
    console.log(`✅ 找到报价单: ${quote.quoteNumber} - ${quote.title}`);
    
    // 2. 获取报价单详情
    console.log('\n2. 获取报价单详情:');
    const detailResponse = await axios.get(`${baseURL}/sales-quote/${quote.id}`);
    console.log(`✅ 获取详情成功，有效期: ${detailResponse.data.validUntil}`);
    
    // 3. 更新报价单
    console.log('\n3. 更新报价单:');
    const updateData = {
      title: `${quote.title} - 已更新`,
      validUntil: '2024-12-31',
      remarks: '测试更新 - ' + new Date().toISOString(),
    };
    
    const updateResponse = await axios.patch(`${baseURL}/sales-quote/${quote.id}`, updateData);
    console.log(`✅ 更新成功: ${updateResponse.data.title}`);
    console.log(`   新有效期: ${updateResponse.data.validUntil}`);
    console.log(`   新备注: ${updateResponse.data.remarks}`);
    
    console.log('\n✅ 编辑功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testEditQuote().catch(console.error); 