// 渠道代码到中文名称的映射
export const channelMapping: { [key: string]: string } = {
  'PA0301': '微信',
  'PA0302': '抖音',
  'PA0303': 'IOS(国服)',
  'PA0305': '淘宝',
  'PA0306': '支付宝',
  'PA0307': '美团',
  'PA0308': '华为(快)',
  'PA0309': '京东',
  'PA0310': 'VIVO',
  'PA0311': '华为(鸿蒙)',
  'PA0312': '华为(安卓)',
  'PA0313': 'OPPO'
};

// 获取渠道中文名称
export const getChannelName = (channelCode: string): string => {
  return channelMapping[channelCode] || channelCode;
};

// 获取渠道选项列表
export const getChannelOptions = (channels: string[]) => {
  return channels.map(channel => ({
    label: getChannelName(channel),
    value: channel
  }));
}; 