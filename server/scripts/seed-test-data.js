const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// 生成随机中文姓名
const generateChineseName = () => {
  const surnames = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'];
  const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平', '刚', '桂英'];
  return surnames[Math.floor(Math.random() * surnames.length)] + names[Math.floor(Math.random() * names.length)];
};

// 生成随机公司名
const generateCompanyName = () => {
  const prefixes = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '重庆', '武汉', '西安'];
  const types = ['科技', '贸易', '实业', '商贸', '电子', '机械', '化工', '建材', '食品', '服装'];
  const suffixes = ['有限公司', '股份有限公司', '集团有限公司', '贸易有限公司'];
  
  return prefixes[Math.floor(Math.random() * prefixes.length)] + 
         generateChineseName() + 
         types[Math.floor(Math.random() * types.length)] + 
         suffixes[Math.floor(Math.random() * suffixes.length)];
};

// 生成随机电话号码
const generatePhone = () => {
  const prefixes = ['130', '131', '132', '133', '135', '136', '137', '138', '139', '150', '151', '152', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
  return prefixes[Math.floor(Math.random() * prefixes.length)] + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
};

// 生成随机地址
const generateAddress = () => {
  const provinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '山东省', '河南省', '四川省', '湖北省', '湖南省'];
  const cities = ['朝阳区', '海淀区', '浦东新区', '黄浦区', '天河区', '越秀区', '玄武区', '秦淮区', '西湖区', '拱墅区'];
  const streets = ['中山路', '人民路', '解放路', '建设路', '光明路', '和平路', '友谊路', '胜利路', '新华路', '文化路'];
  
  return provinces[Math.floor(Math.random() * provinces.length)] + 
         cities[Math.floor(Math.random() * cities.length)] + 
         streets[Math.floor(Math.random() * streets.length)] + 
         Math.floor(Math.random() * 999 + 1) + '号';
};

// 生成随机商品名称
const generateGoodsName = () => {
  const categories = ['手机', '电脑', '平板', '耳机', '音响', '键盘', '鼠标', '显示器', '打印机', '路由器'];
  const brands = ['苹果', '华为', '小米', '联想', '戴尔', '惠普', '三星', '索尼', '佳能', '爱普生'];
  const models = ['Pro', 'Max', 'Plus', 'Air', 'Mini', 'Ultra', 'X', 'S', 'Note', 'Book'];
  
  return brands[Math.floor(Math.random() * brands.length)] + 
         categories[Math.floor(Math.random() * categories.length)] + 
         models[Math.floor(Math.random() * models.length)];
};

// 生成随机规格
const generateSpec = () => {
  const colors = ['黑色', '白色', '银色', '金色', '蓝色', '红色', '绿色', '紫色'];
  const sizes = ['64GB', '128GB', '256GB', '512GB', '1TB', '14英寸', '15.6英寸', '13英寸'];
  
  return colors[Math.floor(Math.random() * colors.length)] + ' ' + 
         sizes[Math.floor(Math.random() * sizes.length)];
};

// 生成随机价格
const generatePrice = (min = 100, max = 10000) => {
  return Math.floor(Math.random() * (max - min) + min);
};

// 创建客户数据
const createCustomers = async (count = 300) => {
  console.log(`开始创建 ${count} 个客户...`);
  
  for (let i = 1; i <= count; i++) {
    try {
      const customerData = {
        name: generateCompanyName(),
        contact: generateChineseName(),
        mobile: generatePhone(),
        email: `customer${i}@example.com`,
        address: generateAddress(),
        creditLimit: generatePrice(10000, 100000),
        taxNumber: `91${Math.floor(Math.random() * 1000000000000000000).toString().padStart(17, '0')}`,
        bankAccount: Math.floor(Math.random() * 10000000000000000000).toString().padStart(19, '0'),
        bankName: '中国工商银行',
        categoryId: Math.floor(Math.random() * 8) + 1, // 随机选择一个客户分类
        isConfirm: Math.random() > 0.3, // 70%确认
        isPrivate: Math.random() > 0.8 // 20%私有
      };

      const response = await axios.post(`${API_BASE}/customer`, customerData);
      
      if (i % 50 === 0) {
        console.log(`已创建 ${i} 个客户`);
      }
    } catch (error) {
      console.error(`创建客户 ${i} 失败:`, error.response?.data || error.message);
    }
  }
  
  console.log(`客户创建完成！`);
};

// 创建商品分类
const createGoodsCategories = async () => {
  const categories = [
    { name: '电子产品', description: '各类电子设备' },
    { name: '办公用品', description: '办公相关用品' },
    { name: '数码配件', description: '数码产品配件' },
    { name: '家用电器', description: '家庭电器产品' },
    { name: '通讯设备', description: '通讯相关设备' }
  ];

  const createdCategories = [];
  
  for (const category of categories) {
    try {
      const response = await axios.post(`${API_BASE}/goods/categories`, category);
      createdCategories.push(response.data);
      console.log(`创建分类: ${category.name}`);
    } catch (error) {
      // 如果创建失败，使用默认ID
      createdCategories.push({ id: createdCategories.length + 1, name: category.name });
      console.log(`分类 ${category.name} 可能已存在，使用默认ID`);
    }
  }
  
  return createdCategories;
};

// 创建商品数据
const createGoods = async (count = 300, categories = []) => {
  console.log(`开始创建 ${count} 个商品...`);
  
  for (let i = 1; i <= count; i++) {
    try {
      const categoryId = categories.length > 0 ? categories[Math.floor(Math.random() * categories.length)].id : 1;
      const costPrice = generatePrice(50, 5000);
      const retailPrice = Math.floor(costPrice * (1.2 + Math.random() * 0.8)); // 20%-100%利润率
      
      const goodsData = {
        name: generateGoodsName(),
        barcode: `${Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0')}`,
        categoryId: categoryId,
        unit: Math.random() > 0.5 ? '台' : '个',
        costPrice: costPrice,
        retailPrice: retailPrice,
        wholesalePrice: Math.floor(costPrice * 1.1),
        purchasePrice: Math.floor(costPrice * 0.9),
        netWeight: Math.floor(Math.random() * 5000) / 1000, // 0-5kg
        grossWeight: Math.floor(Math.random() * 5500) / 1000, // 0-5.5kg
        volume: Math.floor(Math.random() * 1000) / 1000, // 0-1立方米
        isActive: Math.random() > 0.1, // 90%激活
        isConfirm: Math.random() > 0.2, // 80%确认
        isStar: Math.random() > 0.8, // 20%标星
        inventoryAlert: Math.floor(Math.random() * 50) + 10,
        creatorId: 1
      };

      const response = await axios.post(`${API_BASE}/goods`, goodsData);
      
      if (i % 50 === 0) {
        console.log(`已创建 ${i} 个商品`);
      }
    } catch (error) {
      console.error(`创建商品 ${i} 失败:`, error.response?.data || error.message);
    }
  }
  
  console.log(`商品创建完成！`);
};

// 主函数
const main = async () => {
  try {
    console.log('开始创建测试数据...');
    
    // 使用默认分类（假设已经存在一些分类）
    const categories = [
      { id: 1, name: '电子产品' },
      { id: 2, name: '办公用品' },
      { id: 3, name: '数码配件' },
      { id: 4, name: '家用电器' },
      { id: 5, name: '通讯设备' }
    ];
    
    // 创建客户
    await createCustomers(300);
    
    // 创建商品
    await createGoods(300, categories);
    
    console.log('所有测试数据创建完成！');
  } catch (error) {
    console.error('创建测试数据失败:', error);
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  createCustomers,
  createGoods,
  createGoodsCategories
};
