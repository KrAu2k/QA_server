import React, { useMemo, useEffect, useRef } from 'react';
import { Card, Spin, Empty } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import type { Department } from '@/services/system/department';

interface OrganizationChartProps {
  data: Department[];
  loading?: boolean;
  onNodeClick?: (dept: Department) => void;
  selectedDeptId?: number;
}

export default function OrganizationChartComponent({
  data,
  loading = false,
  onNodeClick,
  selectedDeptId,
}: OrganizationChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 转换数据为ECharts格式
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { nodes: [], links: [] };

    const nodes: any[] = [];
    const links: any[] = [];
    const nodeMap = new Map<number, any>();

    const processDepartment = (dept: Department, parentId?: number) => {
      // 添加数据验证
      if (!dept || !dept.id || !dept.name) {
        console.warn('Invalid department data:', dept);
        return;
      }

      const node = {
        id: dept.id.toString(),
        name: dept.name,
        value: dept.name,
        symbolSize: 60,
        itemStyle: {
          color: dept.status === 1 ? '#1890ff' : '#ff4d4f',
          borderColor: selectedDeptId === dept.id ? '#52c41a' : '#d9d9d9',
          borderWidth: selectedDeptId === dept.id ? 3 : 1,
        },
        label: {
          show: true,
          position: 'bottom',
          fontSize: 12,
          color: '#333',
        },
        dept: dept, // 保存原始数据用于点击事件
      };

      nodes.push(node);
      nodeMap.set(dept.id, node);

      if (parentId) {
        links.push({
          source: parentId.toString(),
          target: dept.id.toString(),
          lineStyle: {
            color: '#d9d9d9',
            width: 2,
          },
        });
      }

      if (dept.children && dept.children.length > 0) {
        dept.children.forEach(child => processDepartment(child, dept.id));
      }
    };

    data.forEach(dept => processDepartment(dept));

    console.log('Chart data converted:', { nodes: nodes.length, links: links.length });
    return { nodes, links };
  }, [data, selectedDeptId]);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (!params || !params.data || !params.data.dept) {
            return '';
          }
          
          const dept = params.data.dept;
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${dept.name || '未知部门'}</div>
              <div>编码: ${dept.code || '无'}</div>
              <div>状态: ${dept.status === 1 ? '正常' : '禁用'}</div>
              ${dept.managerName ? `<div>负责人: ${dept.managerName}</div>` : ''}
              ${dept.memberCount !== undefined ? `<div>人数: ${dept.memberCount}</div>` : ''}
            </div>
          `;
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: chartData.nodes,
          links: chartData.links,
          roam: true,
          label: {
            show: true,
            position: 'bottom',
            fontSize: 12,
          },
          force: {
            repulsion: 200,
            gravity: 0.1,
            edgeLength: 100,
            layoutAnimation: true,
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 3,
            },
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    // 添加点击事件
    chartInstance.current.on('click', (params) => {
      if (params.dataType === 'node' && 
          params.data && 
          typeof params.data === 'object' && 
          'dept' in params.data && 
          params.data.dept && 
          onNodeClick) {
        onNodeClick((params.data as any).dept);
      }
    });

    // 响应式处理
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [chartData, onNodeClick]);

  // 更新选中状态
  useEffect(() => {
    if (chartInstance.current) {
      const option = chartInstance.current.getOption();
      if (option.series && Array.isArray(option.series) && option.series[0]) {
        (option.series[0] as any).data = chartData.nodes;
        chartInstance.current.setOption(option);
      }
    }
  }, [selectedDeptId, chartData]);

  if (loading) {
    return (
      <Card title="组织架构图" style={{ marginBottom: 16 }} className="organization-chart">
        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!chartData.nodes.length) {
    return (
      <Card title="组织架构图" style={{ marginBottom: 16 }} className="organization-chart">
        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty
            image={<TeamOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
            description="暂无部门数据"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="组织架构图" 
      style={{ marginBottom: 16 }}
      className="organization-chart"
      extra={
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#1890ff' }}></div>
            正常部门
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: '#ff4d4f' }}></div>
            禁用部门
          </div>
        </div>
      }
    >
      <div 
        ref={chartRef}
        className="chart-container"
        style={{ 
          height: 500, 
          width: '100%',
        }} 
      />
    </Card>
  );
} 