import React, { useState } from 'react';
import { Table, Button, Card } from 'antd';
import { PageContainer } from '@ant-design/pro-components';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

const initialData: DataType[] = [
  { key: '1', name: 'John Brown', age: 32, address: 'New York No. 1 Lake Park' },
  { key: '2', name: 'Jim Green', age: 42, address: 'London No. 1 Lake Park' },
  { key: '3', name: 'Joe Black', age: 32, address: 'Sidney No. 1 Lake Park' },
];

const TableList: React.FC = () => {
  const [data, setData] = useState<DataType[]>(initialData);

  const handleDelete = (key: string) => {
    const newData = data.filter(item => item.key !== key);
    setData(newData);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: DataType) => (
        <Button type="link" onClick={() => handleDelete(record.key)}>
          Delete
        </Button>
      ),
    },
  ];

  return(
     <PageContainer>
      <Card title="Table List">
        <Table columns={columns} dataSource={data} />
      </Card>
      
    </PageContainer>
  )
     
};

export default TableList;