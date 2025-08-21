import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, theme } from 'antd';
import React from 'react';



const Welcome: React.FC = () => {
  console.log('welcome');


  
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  return (
    <h1>Hello world</h1>
  );
};

export default Welcome;
