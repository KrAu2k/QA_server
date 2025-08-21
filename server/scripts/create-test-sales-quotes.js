const axios = require('axios');

// 测试数据
const testQuotes = [
  {
    title: '电子产品报价单',
    customerName: '北京科技有限公司',
    contactPerson: '张经理',
    contactPhone: '13800138001',
    customerAddress: '北京市朝阳区科技园区',
    discountAmount: 500,
    remarks: '批量采购优惠',
    validUntil: '2024-12-31',
    details: [
      {
        goodsName: '笔记本电脑',
        goodsSpec: 'i7-12700H, 16GB, 512GB SSD',
        goodsUnit: '台',
        quantity: 10,
        unitPrice: 5999,
        discountRate: 5,
        remarks: '高性能商务本'
      },
      {
        goodsName: '无线鼠标',
        goodsSpec: '2.4G无线，静音设计',
        goodsUnit: '个',
        quantity: 20,
        unitPrice: 89,
        discountRate: 10,
        remarks: '办公必备'
      }
    ]
  },
  {
    title: '办公用品报价单',
    customerName: '上海贸易公司',
    contactPerson: '李总',
    contactPhone: '13900139002',
    customerAddress: '上海市浦东新区陆家嘴',
    discountAmount: 200,
    remarks: '长期合作客户',
    validUntil: '2024-11-30',
    details: [
      {
        goodsName: '办公椅',
        goodsSpec: '人体工学设计，可调节',
        goodsUnit: '把',
        quantity: 15,
        unitPrice: 299,
        discountRate: 8,
        remarks: '舒适办公'
      },
      {
        goodsName: '文件柜',
        goodsSpec: '三层抽屉，钢制',
        goodsUnit: '个',
        quantity: 8,
        unitPrice: 450,
        discountRate: 5,
        remarks: '文件整理'
      }
    ]
  },
  {
    title: '建筑材料报价单',
    customerName: '广州建设集团',
    contactPerson: '王工程师',
    contactPhone: '13700137003',
    customerAddress: '广州市天河区珠江新城',
    discountAmount: 1000,
    remarks: '大型项目采购',
    validUntil: '2024-10-31',
    details: [
      {
        goodsName: '水泥',
        goodsSpec: 'P.O 42.5，袋装',
        goodsUnit: '吨',
        quantity: 100,
        unitPrice: 380,
        discountRate: 3,
        remarks: '建筑用水泥'
      },
      {
        goodsName: '钢筋',
        goodsSpec: 'HRB400，Φ12mm',
        goodsUnit: '吨',
        quantity: 50,
        unitPrice: 4200,
        discountRate: 2,
        remarks: '结构用钢筋'
      }
    ]
  }
];

async function createTestQuotes() {
  const baseURL = 'http://localhost:3000/api';
  
  console.log('开始创建测试报价单...');
  
  for (let i = 0; i < testQuotes.length; i++) {
    const quote = testQuotes[i];
    try {
      console.log(`正在创建报价单: ${quote.title}`);
      const response = await axios.post(`${baseURL}/sales-quote`, quote);
      console.log(`✅ 报价单创建成功: ${response.data.quoteNumber}`);
    } catch (error) {
      console.error(`❌ 创建报价单失败: ${quote.title}`, error.response?.data || error.message);
    }
  }
  
  console.log('测试报价单创建完成！');
}

// 运行脚本
createTestQuotes().catch(console.error); 