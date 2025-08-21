import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  Row,
  Col,
  Descriptions,
  Tag,
  Typography,
  Avatar,
  Divider,
  Spin,
  Tree,
  TreeSelect,
  Badge,
  Tooltip,
  Select,
  List,
  Table,
  Transfer,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useDebounceFn } from 'ahooks';
import {
  getDepartmentTree,
  getDepartmentDetail,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  updateDepartmentStatus,
  getDepartmentMembers,
  removeDepartmentMember,
  addDepartmentMember,
} from '@/services/system/department';
import { getUserList, SystemUser } from '@/services/system/user';
import type { Department, DepartmentFormData, DepartmentMember } from '@/services/system/department';
import './index.less';

import { OrganizationChart, RCNode } from '@ant-design/graphs';
import React from 'react';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const { OrganizationChartNode } = RCNode;

// 查找部门函数
function findDepartmentById(data: Department[], id: number): Department | null {
  for (const item of data) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findDepartmentById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

// 组织架构图组件 - 提取到外部并使用memo优化
const DemoOrganizationChart = React.memo(({ treeData }: { treeData: Department[] }) => {
  const [data, setData] = React.useState<any>();

  useEffect(() => {
    // 将部门树数据转换为组织架构图格式
    const convertDepartmentToOrganizationData = (departments: Department[]) => {
      const nodes: any[] = [];
      const edges: any[] = [];
      
      const processNode = (dept: Department, parentId?: string) => {
        // 添加节点
        nodes.push({
          id: dept.id.toString(),
          data: {
            email: `${dept.code}@company.com`, // 使用部门编码生成邮箱
            name: dept.name,
            position: dept.managerNames && dept.managerNames.length > 0 
              ? dept.managerNames.join(', ') 
              : '-',
            status: dept.status === 1 ? 'online' : 'offline',
            phone: '555-0100', // 默认电话
            fax: '555-0101', // 默认传真
          }
        });
        
        // 如果有父节点，添加连接边
        if (parentId) {
          edges.push({
            source: parentId,
            target: dept.id.toString()
          });
        }
        
        // 递归处理子部门
        if (dept.children && dept.children.length > 0) {
          dept.children.forEach(child => {
            processNode(child, dept.id.toString());
          });
        }
      };
      
      // 处理所有根部门
      departments.forEach(dept => {
        processNode(dept);
      });
      
      return { nodes, edges };
    };
    
    // 使用本地部门数据转换
    if (treeData && treeData.length > 0) {
      const organizationData = convertDepartmentToOrganizationData(treeData);
      setData(organizationData);
    }
  }, [treeData]);

  const options = React.useMemo(() => ({
    padding: [0, 0, 0, 0], // 这里设置了图表的内边距
    height: 460, 
    autoFit: 'view' as const,
    data,
    node: {
      style: {
        component: (d: any) => {
          const { name, position, status } = d.data || {};
          const isActive = d.states?.includes('active');
          return (
            <OrganizationChartNode
              name={name}
              position={position}
              status={status}
              isActive={isActive}
            />
          );
        },
        size: new Float32Array([180, 75]),
      },
    },
    edge: {
      style: {
        radius: 16,
        lineWidth: 5,
        endArrow: true,
      },
    },
    layout: {
      type: 'antv-dagre',
      nodesep: 24,
      ranksep: 20,
    },
    transforms: (prev: any[]) => [
      ...prev.filter((transform) => transform.type !== 'collapse-expand-react-node'),
      {
        ...prev.find((transform) => transform.type === 'collapse-expand-react-node'),
        enable: true,
        iconOffsetY: 24,
      },
    ],
    behaviors: ['drag-canvas', 'drag-node', 'click-select']
  }), [data]);

  return <OrganizationChart {...options} />;
});

DemoOrganizationChart.displayName = 'DemoOrganizationChart';

export default function DepartmentManagement() {
  const [treeData, setTreeData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [deptDetail, setDeptDetail] = useState<Department | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');

  // 弹窗状态
  const [formVisible, setFormVisible] = useState(false);
  const [memberVisible, setMemberVisible] = useState(false);
  const [batchVisible, setBatchVisible] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // 用户列表状态
  const [userList, setUserList] = useState<SystemUser[]>([]);
  const [userLoading, setUserLoading] = useState(false);

  const [form] = Form.useForm();

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailDept, setDetailDept] = useState<Department | null>(null);

  // 部门成员管理相关状态
  const [memberList, setMemberList] = useState<DepartmentMember[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  // 添加成员弹窗状态
  const [addMemberVisible, setAddMemberVisible] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberUserIds, setAddMemberUserIds] = useState<number[]>([]);
  const [addMemberUserList, setAddMemberUserList] = useState<SystemUser[]>([]);

  // 新增：批量选择成员的状态
  const [selectedMemberRowKeys, setSelectedMemberRowKeys] = useState<number[]>([]);

  // 为表单中的TreeSelect生成简洁的树数据
  const generateTreeSelectData = (data: Department[]): any[] => {
    return data.map((item) => ({
      title: item.name,
      value: item.id,
      key: item.id,
      children:
        item.children && item.children.length > 0
          ? generateTreeSelectData(item.children)
          : undefined,
    }));
  };

  // 获取所有节点的key
  const getAllKeys = (data: Department[]): string[] => {
    let keys: string[] = [];
    data.forEach((item) => {
      keys.push(item.id.toString());
      if (item.children && item.children.length > 0) {
        keys = keys.concat(getAllKeys(item.children));
      }
    });
    return keys;
  };

  // 选择部门
  const handleSelect = (dept: Department) => {
    setSelectedKeys([dept.id.toString()]);
    setSelectedDept(dept);
    if (dept) {
      loadDepartmentDetail(dept.id);
    }
  };

  // 加载部门详情
  const loadDepartmentDetail = async (id: number) => {
    try {
      const response = await getDepartmentDetail(id);
      if (response.success) {
        setDeptDetail(response.data || null);
      } else {
        message.error(response.message || '加载部门详情失败');
      }
    } catch (error) {
      message.error('加载部门详情失败');
      console.error('加载部门详情失败:', error);
    }
  };

  // 加载部门数据
  const loadDepartmentData = async () => {
    setLoading(true);
    try {
      const response = await getDepartmentTree();
      if (response.success) {
        const data = response.data || [];
        setTreeData(data);
        // 默认展开所有节点
        const allKeys = getAllKeys(data);
        setExpandedKeys(allKeys);
        // 默认选中第一个
        if (data.length > 0 && !selectedDept) {
          handleSelect(data[0]);
        }
      } else {
        message.error(response.message || '加载部门数据失败');
      }
    } catch (error) {
      message.error('加载部门数据失败');
      console.error('加载部门数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载用户列表
  const loadUserList = async () => {
    setUserLoading(true);
    try {
      const response = await getUserList({ pageSize: 1000 }); // 获取所有用户
      if (response.success) {
        setUserList(response.data || []);
      } else {
        message.error('加载用户列表失败');
      }
    } catch (error) {
      message.error('加载用户列表失败');
      console.error('加载用户列表失败:', error);
    } finally {
      setUserLoading(false);
    }
  };

  // 搜索防抖
  const { run: handleSearch } = useDebounceFn(
    (value: string) => {
      setSearchValue(value);
    },
    { wait: 300 },
  );

  // 展开/收起节点
  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys.map((key) => key.toString()));
  };

  // 新增部门
  const handleAdd = (parentId?: number) => {
    setEditingDept(null);
    setFormVisible(true);
    // 在下一个事件循环中设置表单值，确保 Form 组件已经渲染
    setTimeout(() => {
      form.resetFields();
      if (parentId) {
        form.setFieldsValue({ parentId });
      }
    }, 100);
  };

  // 编辑部门
  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormVisible(true);
    // 在下一个事件循环中设置表单值，确保 Form 组件已经渲染
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({
        name: dept.name,
        code: dept.code,
        parentId: dept.parentId,
        managerIds: dept.managerIds || [],
        description: dept.description,
        status: dept.status === 1,
        sort: dept.sort,
      });
    }, 100);
  };

  // 删除部门
  const handleDelete = async (dept: Department) => {
    try {
      const response = await deleteDepartment(dept.id);
      if (response.success) {
        message.success('删除成功');
        loadDepartmentData();
        if (selectedDept?.id === dept.id) {
          setSelectedDept(null);
          setDeptDetail(null);
          setSelectedKeys([]);
        }
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
      console.error('删除失败:', error);
    }
  };

  // 获取所有后代部门ID
  const getDescendantIds = (dept: Department): number[] => {
    let ids: number[] = [];
    if (dept.children && dept.children.length > 0) {
      dept.children.forEach(child => {
        ids.push(child.id);
        ids = ids.concat(getDescendantIds(child));
      });
    }
    return ids;
  };

  // 提交表单
  const handleFormSubmit = async (values: DepartmentFormData) => {
    // 检查上级部门不能为自己的子部门或后代部门
    if (editingDept && values.parentId) {
      const currentDept = findDepartmentById(treeData, editingDept.id);
      if (currentDept) {
        const descendantIds = getDescendantIds(currentDept);
        if (descendantIds.includes(values.parentId)) {
          message.error('不能将部门的上级设置为自己的子部门或后代部门');
          return;
        }
      }
    }
    // 转换 sort 字段为数字
    if (values.sort !== undefined) {
      values.sort = Number(values.sort);
    }
    try {
      let response;
      if (editingDept) {
        response = await updateDepartment(editingDept.id, values);
      } else {
        response = await createDepartment(values);
      }

      if (response.success) {
        message.success(editingDept ? '更新成功' : '创建成功');
        setFormVisible(false);
        setEditingDept(null); // 清理编辑状态
        if (form) {
          form.resetFields();
        }
        loadDepartmentData();
        if (editingDept && selectedDept?.id === editingDept.id) {
          loadDepartmentDetail(editingDept.id);
        }
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
      console.error('部门操作失败:', error);
    }
  };

  // 组织架构图节点点击事件
  const handleChartNodeClick = (dept: Department) => {
    handleSelect(dept);
  };

  useEffect(() => {
    loadDepartmentData();
    loadUserList();
  }, []);

  // 监听表单弹窗状态变化
  useEffect(() => {
    if (!formVisible) {
      // 弹窗关闭时清理编辑状态
      setEditingDept(null);
    }
  }, [formVisible]);

  // 扁平化部门树，移除 children 字段
  const flattenDepartments = (data: Department[]): Department[] => {
    let result: Department[] = [];
    data.forEach((item) => {
      const { children, ...rest } = item; // 移除 children 字段
      result.push(rest);
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenDepartments(item.children));
      }
    });
    return result;
  };

  // 过滤树数据
  const filterTreeData = (data: Department[], searchValue: string): Department[] => {
    if (!searchValue) return data;

    return data.filter((item) => {
      const matchName = item.name.toLowerCase().includes(searchValue.toLowerCase());
      const matchCode = item.code.toLowerCase().includes(searchValue.toLowerCase());

      if (matchName || matchCode) {
        return true;
      }

      if (item.children && item.children.length > 0) {
        const filteredChildren = filterTreeData(item.children, searchValue);
        if (filteredChildren.length > 0) {
          item.children = filteredChildren;
          return true;
        }
      }

      return false;
    });
  };

  const filteredTreeData = filterTreeData(treeData, searchValue);
  const flatDeptList = flattenDepartments(filteredTreeData);

  // 表格列定义
  const columns = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '部门编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '上级部门',
      dataIndex: 'parentName',
      key: 'parentName',
      render: (text: string) => text || '无',
    },
    {
      title: '负责人',
      dataIndex: 'managerNames',
      key: 'managerNames',
      render: (names: string[]) => names && names.length > 0 ? names.join(', ') : '未设置',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'error'}>{status === 1 ? '正常' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Department) => (
        <Space>
          <Tooltip title="新增子部门">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={e => { e.stopPropagation(); handleAdd(record.id); }}
            />
          </Tooltip>
          <Tooltip title="成员管理">
            <Button
              type="text"
              size="small"
              icon={<TeamOutlined />}
              onClick={e => { e.stopPropagation(); setSelectedDept(record); setMemberVisible(true); }}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={e => { e.stopPropagation(); handleEdit(record); }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title={`确定删除"${record.name}"？`}
              onConfirm={e => { e?.stopPropagation(); handleDelete(record); }}
              onCancel={e => e?.stopPropagation()}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={e => e.stopPropagation()}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 加载部门成员
  const loadDepartmentMembers = async (deptId: number) => {
    setMemberLoading(true);
    try {
      const res = await getDepartmentMembers(deptId);
      if (res.success && Array.isArray(res.data)) {
        setMemberList(res.data);
      } else {
        setMemberList([]);
      }
    } catch (e) {
      setMemberList([]);
    } finally {
      setMemberLoading(false);
    }
  };

  // 打开成员管理弹窗时加载成员
  useEffect(() => {
    if (memberVisible && selectedDept) {
      loadDepartmentMembers(selectedDept.id);
    }
  }, [memberVisible, selectedDept]);

  // 移除成员
  const handleRemoveMember = async (userId: number) => {
    if (!selectedDept) return;
    setMemberLoading(true);
    try {
      await removeDepartmentMember(selectedDept.id, userId);
      message.success('移除成功');
      loadDepartmentMembers(selectedDept.id);
    } catch (e) {
      message.error('移除失败');
    } finally {
      setMemberLoading(false);
    }
  };

  // 成员表格列
  const memberColumns = [
    { title: '姓名', dataIndex: 'userName', key: 'userName' },
    { title: '工号', dataIndex: 'userCode', key: 'userCode' },
    { title: '职位', dataIndex: 'positionName', key: 'positionName' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DepartmentMember) => (
        <Popconfirm
          title="确定移除该成员？"
          onConfirm={() => handleRemoveMember(record.userId)}
        >
          <Button type="link" danger size="small">移除</Button>
        </Popconfirm>
      ),
    },
  ];

  // 成员搜索过滤
  const filteredMembers = memberList.filter(m =>
    m.userName?.includes(memberSearch) ||
    m.userCode?.includes(memberSearch) ||
    m.positionName?.includes(memberSearch) ||
    m.email?.includes(memberSearch)
  );

  // 打开添加成员弹窗时加载可选用户
  const loadAvailableUsers = async () => {
    setAddMemberLoading(true);
    try {
      const res = await getUserList({ pageSize: 1000 });
      if (res.success && Array.isArray(res.data)) {
        // 过滤掉已在本部门的成员
        const existIds = memberList.map(m => String(m.userId));
        setAddMemberUserList(res.data.filter(u => !existIds.includes(String(u.id))));
      } else {
        setAddMemberUserList([]);
      }
    } catch (e) {
      setAddMemberUserList([]);
    } finally {
      setAddMemberLoading(false);
    }
  };

  // 打开添加成员弹窗
  const handleOpenAddMember = () => {
    setAddMemberUserIds([]);
    setAddMemberVisible(true);
    loadAvailableUsers();
  };

  // 提交添加成员
  const handleAddMember = async () => {
    // addMemberUserIds 现在直接存 number
    const userIds = addMemberUserIds.filter(id => id !== undefined && id !== null);
    if (!selectedDept) return;
    if (userIds.length === 0) {
      message.warning('请选择要添加的成员');
      return;
    }
    console.log('[添加成员] 部门ID:', selectedDept.id, '选中用户ID:', addMemberUserIds, '提交 userIds:', userIds);
    setAddMemberLoading(true);
    try {
      const res = await addDepartmentMember(selectedDept.id, userIds);
      console.log('[添加成员] 后端响应:', res);
      message.success('添加成功');
      setAddMemberVisible(false);
      loadDepartmentMembers(selectedDept.id);
    } catch (e: any) {
      console.error('[添加成员] 失败:', e);
      message.error(e?.data?.message || e?.message || '添加失败');
    } finally {
      setAddMemberLoading(false);
    }
  };

  // 批量移除成员
  const handleBatchRemoveMembers = async () => {
    if (!selectedDept || selectedMemberRowKeys.length === 0) return;
    setMemberLoading(true);
    try {
      await Promise.all(selectedMemberRowKeys.map(userId =>
        removeDepartmentMember(selectedDept.id, userId)
      ));
      message.success('批量移除成功');
      setSelectedMemberRowKeys([]);
      loadDepartmentMembers(selectedDept.id);
    } catch (e) {
      message.error('批量移除失败');
    } finally {
      setMemberLoading(false);
    }
  };

  return (
    
    <PageContainer className="department-management">
      {/* 组织架构图 */}
      <Card title="组织架构" style={{ marginBottom: 16 }}>
        <div style={{ height: 450 }}>
          <DemoOrganizationChart treeData={treeData} />
          </div>
      </Card>
      {/* 组织架构图 */}

      <Row gutter={16}>
        {/* 左侧部门列表 */}
        <Col span={24}>
          <Card
            title="部门管理"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
                新增部门
              </Button>
            }
            styles={{ body: { padding: '16px' } }}
          >
            <div className="department-search">
              <Search
                placeholder="搜索部门"
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="department-table-container">
              <Spin spinning={loading}>
                <Table
                  rowKey="id"
                  columns={columns}
                  dataSource={flatDeptList}
                  pagination={false}
                  onRow={record => ({
                    onClick: () => {
                      setDetailDept(record);
                      setDetailModalVisible(true);
                      loadDepartmentDetail(record.id);
                    },
                    style: { cursor: 'pointer' },
                  })}
                  rowClassName={record => (selectedDept?.id === record.id ? 'ant-table-row-selected' : '')}
                />
              </Spin>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 详情弹窗 */}
      <Modal
        title={`${detailDept?.name} - 部门详情`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {detailDept && deptDetail ? (
          <div>
            {/* 基本信息 */}
            <div style={{ marginBottom: 20 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#666', fontSize: 13, marginBottom: 4 }}>部门名称</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{deptDetail.name}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#666', fontSize: 13, marginBottom: 4 }}>部门编码</div>
                    <div style={{ fontSize: 16 }}>{deptDetail.code}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#666', fontSize: 13, marginBottom: 4 }}>上级部门</div>
                    <div style={{ fontSize: 16 }}>{deptDetail.parentName || '无'}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#666', fontSize: 13, marginBottom: 4 }}>状态</div>
                    <Tag color={deptDetail.status === 1 ? 'green' : 'red'}>
                      {deptDetail.status === 1 ? '正常' : '禁用'}
                    </Tag>
                  </div>
                </Col>
              </Row>
              
              {/* 部门负责人 */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>部门负责人</div>
                {deptDetail.managerNames && deptDetail.managerNames.length > 0 ? (
                  <Space size={8} wrap>
                    {deptDetail.managerNames.map((name) => (
                      <span key={name} style={{ color: '#1890ff' }}>
                        <UserOutlined style={{ marginRight: 4 }} />
                        {name}
                      </span>
                    ))}
                  </Space>
                ) : (
                  <span style={{ color: '#bfbfbf' }}>未设置负责人</span>
                )}
              </div>

              {/* 描述信息 */}
              {deptDetail.description && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>部门描述</div>
                  <div style={{ color: '#595959', fontSize: 14 }}>{deptDetail.description}</div>
                </div>
              )}
            </div>

            <Divider style={{ margin: '8px 0 16px 0' }} />

            {/* 统计信息 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>部门统计</div>
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '16px', background: '#f5f5f5', borderRadius: 6 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1890ff', marginBottom: 4 }}>
                      {deptDetail.memberCount || 0}
                    </div>
                    <div style={{ fontSize: 13, color: '#666' }}>部门人数</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '16px', background: '#f5f5f5', borderRadius: 6 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a', marginBottom: 4 }}>
                      {deptDetail.childCount || 0}
                    </div>
                    <div style={{ fontSize: 13, color: '#666' }}>子部门数</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '16px', background: '#f5f5f5', borderRadius: 6 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#fa8c16', marginBottom: 4 }}>
                      {deptDetail.totalMemberCount || 0}
                    </div>
                    <div style={{ fontSize: 13, color: '#666' }}>总人数</div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* 其他信息 */}
            <div style={{ 
              background: '#fafafa', 
              padding: '12px 16px', 
              borderRadius: 6, 
              fontSize: 13, 
              color: '#666',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>排序：{deptDetail.sort}</span>
              <span>创建时间：{deptDetail.createTime}</span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
          </div>
        )}
      </Modal>

      {/* 表单弹窗 */}
      <Modal
        title={editingDept ? '编辑部门' : '新增部门'}
        open={formVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            handleFormSubmit(values);
          });
        }}
        onCancel={() => {
          setFormVisible(false);
          setEditingDept(null); // 清理编辑状态
          // 在 Form 组件存在时才重置表单
          if (form) {
            form.resetFields();
          }
        }}
        width={600}
      >
        <Form 
          form={form} 
          layout="vertical" 
          initialValues={{ 
            status: true, 
            sort: 0,
            managerIds: []
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="部门名称"
                rules={[{ required: true, message: '请输入部门名称' }]}
              >
                <Input placeholder="请输入部门名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="部门编码"
                rules={[{ required: true, message: '请输入部门编码' }]}
              >
                <Input placeholder="请输入部门编码" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="parentId" label="上级部门">
            <TreeSelect
              placeholder="请选择上级部门"
              allowClear
              treeData={generateTreeSelectData(treeData)}
              treeDefaultExpandAll
              showSearch
              filterTreeNode={(inputValue, treeNode) =>
                treeNode?.title?.toString().toLowerCase().includes(inputValue.toLowerCase()) ??
                false
              }
            />
          </Form.Item>
          <Form.Item name="managerIds" label="部门负责人">
            <Select
              mode="multiple"
              placeholder="请选择部门负责人"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
              loading={userLoading}
            >
              {userList.map((user) => (
                <Option key={user.id} value={user.id}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span>{user.name}</span>
                    {user.departmentName && (
                      <Tag color="blue">
                        {user.departmentName}
                      </Tag>
                    )}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="部门描述">
            <Input.TextArea placeholder="请输入部门描述" rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="状态" valuePropName="checked">
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sort" label="排序">
                <Input type="number" placeholder="排序号" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 成员管理弹窗 */}
      <Modal
        title={`${selectedDept?.name} - 成员管理`}
        open={memberVisible}
        onCancel={() => setMemberVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
          <Input.Search
            placeholder="搜索成员（姓名/工号/职位/邮箱）"
            allowClear
            style={{ width: 300, borderRadius: 6 }}
            onChange={e => setMemberSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ alignSelf: 'center', color: '#888', fontSize: 14, marginRight: 12 }}>
              当前成员数：{filteredMembers.length}
            </span>
            <Button
              danger
              disabled={selectedMemberRowKeys.length === 0}
              onClick={handleBatchRemoveMembers}
              style={{ borderRadius: 6 }}
            >
              批量移除
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddMember} style={{ borderRadius: 6 }}>
              添加成员
            </Button>
          </div>
        </div>
        <Divider style={{ margin: '8px 0 16px 0' }} />
        <Table
          rowKey="userId"
          columns={memberColumns.map(col => col.key === 'action' ? col : { ...col, onHeaderCell: () => ({ style: { fontWeight: 600 } }) })}
          dataSource={filteredMembers}
          loading={memberLoading}
          pagination={false}
          size="small"
          bordered
          rowSelection={{
            selectedRowKeys: selectedMemberRowKeys,
            onChange: (keys) => setSelectedMemberRowKeys(keys as number[]),
          }}
          style={{ background: '#fff', borderRadius: 8 }}
        />
        {/* 添加成员子弹窗 */}
        <Modal
          title="添加成员"
          open={addMemberVisible}
          onCancel={() => setAddMemberVisible(false)}
          footer={null}
          width={700}
        >
          <Transfer
            dataSource={addMemberUserList.map(user => ({
              key: user.id,
              title: user.name,
              ...user,
            }))}
            showSearch
            listStyle={{ width: 280, height: 400 }}
            targetKeys={addMemberUserIds}
            onChange={(keys) => setAddMemberUserIds(keys as number[])}
            render={item => item.name}
            filterOption={(inputValue, item) =>
              (item.title ?? '').toLowerCase().includes((inputValue ?? '').toLowerCase())
            }
            titles={['可选用户', '已选用户']}
            operations={['添加', '移除']}
          />
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={() => setAddMemberVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" onClick={handleAddMember} loading={addMemberLoading}>
              确定
            </Button>
          </div>
        </Modal>
      </Modal>

      {/* 批量操作弹窗 */}
      <Modal
        title="批量操作"
        open={batchVisible}
        onCancel={() => setBatchVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ padding: 20, textAlign: 'center' }}>
          <SettingOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <div>批量操作功能开发中...</div>
        </div>
      </Modal>
    </PageContainer>
  );
}
