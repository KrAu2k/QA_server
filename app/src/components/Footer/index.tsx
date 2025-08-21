import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      links={[
        {
          key: 'RANCI',
          title: 'RANCI',
          href: 'http://www.rancigames.com',
          blankTarget: true,
        }
      ]}
    />
  );
};

export default Footer;
