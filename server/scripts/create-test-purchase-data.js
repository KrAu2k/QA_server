const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// 生成随机中文姓名
const generateChineseName = () => {
  const surnames = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'];
  const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平', '刚', '桂英'];
  return surnames[Math.floor(Math.random() * surnames.length)] + names[Math.floor(Math.random() * names.length)];
};

// 生成随机商品名称
const generateGoodsName = () => {
  const categories = ['手机', '电脑', '平板', '耳机', '音响', '键盘', '鼠标', '显示器', '打印机', '路由器', '摄像头', '麦克风', '音箱', '充电器', '数据线'];
  const brands = ['苹果', '华为', '小米', '联想', '戴尔', '惠普', '三星', '索尼', '佳能', '爱普生', '罗技', '雷蛇', '华硕', '宏碁', '技嘉'];
  const models = ['Pro', 'Max', 'Plus', 'Air', 'Mini', 'Ultra', 'X', 'S', 'Note', 'Book', 'Elite', 'Premium', 'Standard', 'Basic'];
  
  return brands[Math.floor(Math.random() * brands.length)] + 
         categories[Math.floor(Math.random() * categories.length)] + 
         models[Math.floor(Math.random() * models.length)];
};

// 生成随机规格
const generateSpec = () => {
  const colors = ['黑色', '白色', '银色', '金色', '蓝色', '红色', '绿色', '紫色', '灰色', '粉色'];
  const sizes = ['64GB', '128GB', '256GB', '512GB', '1TB', '14英寸', '15.6英寸', '13英寸', '16英寸', '17英寸'];
  
  return colors[Math.floor(Math.random() * colors.length)] + ' ' + 
         sizes[Math.floor(Math.random() * sizes.length)];
};

// 生成随机价格
const generatePrice = (min = 100, max = 10000) => {
  return Math.floor(Math.random() * (max - min) + min);
};

// 生成随机日期
const generateDate = (startDate = new Date('2024-01-01'), endDate = new Date()) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
};

// 生成随机数量
const generateQuantity = (min = 1, max = 100) => {
  return Math.floor(Math.random() * (max - min) + min);
};

// 生成随机订单号
const generateOrderNumber = (prefix = 'PO') => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${year}${month}${day}${random}`;
};

// 获取供应商列表
const getSuppliers = async () => {
  try {
    const response = await axios.get(`${API_BASE}/supplier`);
    return response.data.data || [];
  } catch (error) {
    console.error('获取供应商列表失败:', error.message);
    return [];
  }
};

// 获取商品列表
const getGoods = async () => {
  try {
    const response = await axios.get(`${API_BASE}/goods`);
    return response.data.data || [];
  } catch (error) {
    console.error('获取商品列表失败:', error.message);
    return [];
  }
};

// 获取用户列表
const getUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE}/users`);
    return response.data.data || [];
  } catch (error) {
    console.error('获取用户列表失败:', error.message);
    return [];
  }
};

// 创建购货订单
const createPurchaseOrders = async (count = 30) => {
  console.log(`开始创建 ${count} 个购货订单...`);
  
  const suppliers = await getSuppliers();
  const goods = await getGoods();
  const users = await getUsers();
  
  if (suppliers.length === 0) {
    console.error('没有找到供应商，请先创建供应商数据');
    return [];
  }
  
  if (goods.length === 0) {
    console.error('没有找到商品，请先创建商品数据');
    return [];
  }
  
  const createdOrders = [];
  
  for (let i = 1; i <= count; i++) {
    try {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const user = users.length > 0 ? users[Math.floor(Math.random() * users.length)] : { id: 1 };
      
      // 生成订单明细
      const details = [];
      const itemCount = Math.floor(Math.random() * 5) + 1; // 1-5个商品
      
      for (let j = 0; j < itemCount; j++) {
        const good = goods[Math.floor(Math.random() * goods.length)];
        const num = generateQuantity(1, 50);
        const price = generatePrice(good.costPrice || 100, (good.costPrice || 100) * 2);
        
        details.push({
          goodsId: good.id,
          goodsName: good.name,
          goodsSpec: generateSpec(),
          unit: good.unit || '个',
          num: num,
          price: price,
          amount: num * price,
          remark: Math.random() > 0.7 ? '特殊要求' : ''
        });
      }
      
      const amount = details.reduce((sum, item) => sum + item.amount, 0);
      const discount = Math.random() > 0.7 ? Math.floor(amount * 0.1) : 0; // 10%概率有折扣
      const goodsCount = details.reduce((sum, item) => sum + item.num, 0);
      
      const orderData = {
        supplierId: supplier.id,
        warehouse: Math.random() > 0.5 ? '主仓库' : '临时仓库',
        billDate: generateDate(),
        currency: 'CNY',
        exchangeRate: 1,
        amount: amount - discount,
        remark: Math.random() > 0.5 ? '正常采购' : '',
        goodsCount: goodsCount,
        discountPercent: discount ? 10 : 0,
        discount: discount,
        paid: 0,
        payRemark: '',
        debt: amount - discount,
        supplierCost: amount,
        creatorId: user.id,
        isConfirm: Math.random() > 0.3,
        isDraft: false,
        isTrash: false,
        details: details
      };

      const response = await axios.post(`${API_BASE}/purchase-order`, orderData);
      createdOrders.push(response.data);
      
      if (i % 10 === 0) {
        console.log(`已创建 ${i} 个购货订单`);
      }
    } catch (error) {
      console.error(`创建购货订单 ${i} 失败:`, error.response?.data || error.message);
    }
  }
  
  console.log(`购货订单创建完成！`);
  return createdOrders;
};

// 创建购货入库单
const createPurchaseStockIns = async (count = 30) => {
  console.log(`开始创建 ${count} 个购货入库单...`);
  const suppliers = await getSuppliers();
  const goods = await getGoods();
  if (suppliers.length === 0 || goods.length === 0) {
    console.error('请先创建供应商和商品数据');
    return [];
  }
  const createdStockIns = [];
  for (let i = 1; i <= count; i++) {
    try {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      // 随机生成明细
      let totalAmount = 0;
      let totalCount = 0;
      const details = [];
      for (let j = 0; j < 3; j++) {
        const g = goods[Math.floor(Math.random() * goods.length)];
        const num = +(Math.random() * 10 + 1).toFixed(3);
        const price = +(Math.random() * 500 + 50).toFixed(2);
        const amount = +(num * price).toFixed(2);
        totalAmount += amount;
        totalCount += num;
        details.push({
          goodsId: g.id,
          goodsName: g.name,
          price,
          num,
          amount,
          unit: g.unit || '件',
          remark: '测试明细',
        });
      }
      const data = {
        supplierId: supplier.id,
        warehouse: '主仓库',
        billDate: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().slice(0, 10),
        amount: totalAmount.toFixed(2),
        goodsCount: totalCount.toFixed(3),
        remark: '测试入库单',
        creatorId: 1,
        isConfirm: false,
        isDraft: true,
        isTrash: false,
        details,
      };
      const response = await axios.post(`${API_BASE}/purchase-stock-in`, data);
      createdStockIns.push(response.data);
    } catch (error) {
      console.error('创建购货入库单失败:', error.message);
    }
  }
  return createdStockIns;
};

// 创建购货退货单
const createPurchaseReturns = async (count = 30) => {
  console.log(`开始创建 ${count} 个购货退货单...`);
  const suppliers = await getSuppliers();
  const goods = await getGoods();
  if (suppliers.length === 0 || goods.length === 0) {
    console.error('请先创建供应商和商品数据');
    return [];
  }
  const createdReturns = [];
  for (let i = 1; i <= count; i++) {
    try {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      // 随机生成明细
      let totalAmount = 0;
      let totalCount = 0;
      const details = [];
      for (let j = 0; j < 3; j++) {
        const g = goods[Math.floor(Math.random() * goods.length)];
        const num = +(Math.random() * 5 + 1).toFixed(3);
        const price = +(Math.random() * 500 + 50).toFixed(2);
        const amount = +(num * price).toFixed(2);
        totalAmount += amount;
        totalCount += num;
        details.push({
          goodsId: g.id,
          goodsName: g.name,
          price,
          num,
          amount,
          unit: g.unit || '件',
          remark: '测试退货明细',
        });
      }
      const data = {
        supplierId: supplier.id,
        warehouse: '主仓库',
        billDate: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().slice(0, 10),
        amount: totalAmount.toFixed(2),
        goodsCount: totalCount.toFixed(3),
        remark: '测试退货单',
        creatorId: 1,
        isConfirm: false,
        isDraft: true,
        isTrash: false,
        details,
      };
      const response = await axios.post(`${API_BASE}/purchase-return`, data);
      createdReturns.push(response.data);
    } catch (error) {
      console.error('创建购货退货单失败:', error.message);
    }
  }
  return createdReturns;
};

// 主函数
const main = async () => {
  try {
    console.log('开始创建购货测试数据...');
    
    // 创建30个购货订单
    await createPurchaseOrders(30);
    
    // 创建30个购货入库记录
    await createPurchaseStockIns(30);
    
    // 创建30个购货退货记录
    await createPurchaseReturns(30);
    
    console.log('所有购货测试数据创建完成！');
  } catch (error) {
    console.error('创建购货测试数据失败:', error);
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  createPurchaseOrders,
  createPurchaseStockIns,
  createPurchaseReturns
}; 