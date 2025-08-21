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
  const prefixes = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '重庆', '武汉', '西安', '天津', '苏州', '无锡', '宁波', '青岛'];
  const types = ['科技', '贸易', '实业', '商贸', '电子', '机械', '化工', '建材', '食品', '服装', '医药', '物流', '能源', '环保', '农业'];
  const suffixes = ['有限公司', '股份有限公司', '集团有限公司', '贸易有限公司', '科技有限公司', '实业有限公司'];
  
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
  const provinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '山东省', '河南省', '四川省', '湖北省', '湖南省', '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省'];
  const cities = ['朝阳区', '海淀区', '浦东新区', '黄浦区', '天河区', '越秀区', '玄武区', '秦淮区', '西湖区', '拱墅区', '和平区', '沈河区', '南关区', '道里区', '香坊区'];
  const streets = ['中山路', '人民路', '解放路', '建设路', '光明路', '和平路', '友谊路', '胜利路', '新华路', '文化路', '工业路', '商业路', '科技路', '创新路', '发展路'];
  
  return provinces[Math.floor(Math.random() * provinces.length)] + 
         cities[Math.floor(Math.random() * cities.length)] + 
         streets[Math.floor(Math.random() * streets.length)] + 
         Math.floor(Math.random() * 999 + 1) + '号';
};

// 生成随机邮箱
const generateEmail = (name, index) => {
  const domains = ['gmail.com', 'qq.com', '163.com', '126.com', 'sina.com', 'hotmail.com', 'yahoo.com'];
  return `${name}${index}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

// 创建供应商分类
const createSupplierCategories = async () => {
  const categories = [
    { name: '电子产品供应商', description: '各类电子设备供应商' },
    { name: '办公用品供应商', description: '办公相关用品供应商' },
    { name: '数码配件供应商', description: '数码产品配件供应商' },
    { name: '家用电器供应商', description: '家庭电器产品供应商' },
    { name: '通讯设备供应商', description: '通讯相关设备供应商' },
    { name: '建材供应商', description: '建筑材料供应商' },
    { name: '化工供应商', description: '化工产品供应商' },
    { name: '食品供应商', description: '食品饮料供应商' }
  ];

  const createdCategories = [];
  
  for (const category of categories) {
    try {
      const response = await axios.post(`${API_BASE}/supplier/category`, category);
      createdCategories.push(response.data);
      console.log(`创建供应商分类: ${category.name}`);
    } catch (error) {
      // 如果创建失败，使用默认ID
      const categoryId = createdCategories.length + 1;
      createdCategories.push({ id: categoryId, name: category.name });
      console.log(`供应商分类 ${category.name} 可能已存在，使用默认ID: ${categoryId}`);
    }
  }
  
  return createdCategories;
};

// 创建供应商数据
const createSuppliers = async (count = 100) => {
  console.log(`开始创建 ${count} 个供应商...`);
  
  // 先创建供应商分类
  const categories = await createSupplierCategories();
  
  for (let i = 1; i <= count; i++) {
    try {
      const contactName = generateChineseName();
      const categoryId = categories.length > 0 ? categories[Math.floor(Math.random() * categories.length)].id : 1;
      
      const supplierData = {
        name: generateCompanyName(),
        contact: contactName,
        mobile: generatePhone(),
        tel: `0${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        email: generateEmail(contactName, i),
        address: generateAddress(),
        categoryId: categoryId,
        isConfirm: Math.random() > 0.2, // 80%确认
        isPrivate: Math.random() > 0.8 // 20%私有
      };

      const response = await axios.post(`${API_BASE}/supplier`, supplierData);
      
      if (i % 20 === 0) {
        console.log(`已创建 ${i} 个供应商`);
      }
    } catch (error) {
      console.error(`创建供应商 ${i} 失败:`, error.response?.data || error.message);
    }
  }
  
  console.log(`供应商创建完成！`);
};

// 主函数
const main = async () => {
  try {
    console.log('开始创建供应商测试数据...');
    
    // 创建100个供应商
    await createSuppliers(100);
    
    console.log('供应商测试数据创建完成！');
  } catch (error) {
    console.error('创建供应商测试数据失败:', error);
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { createSuppliers }; 