import React, { useMemo } from 'react';
import { Card, Col, Empty, Row, Statistic, theme } from 'antd';
import { Package, ShoppingBag, Users } from 'lucide-react';
import * as echarts from 'echarts';
import { useTheme } from '../../../context/ThemeContext';
import EChart from '../../../components/chart/EChart';
import { formatTHB } from '../../../utils/formatter';
import { orderStatusInfo } from '../../../utils/constant';
import type { IAdminStats } from '../interface';

interface IOverviewTabProps {
  stats: IAdminStats;
}

const OverviewTab: React.FC<IOverviewTabProps> = ({ stats }) => {
  const { token } = theme.useToken();
  const { theme: currentTheme } = useTheme();

  const revenueChartOptions = useMemo<echarts.EChartsOption>(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: token.colorBorderSecondary,
        },
      },
      formatter: (params: any) => {
        const item = params[0];
        return `${item.name}<br/><b>${formatTHB(item.value)}</b>`;
      },
    },
    grid: {
      top: 15,
      right: 15,
      bottom: 20,
      left: 10,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: stats.revenueTrend.map((d) => d.label.substring(5)), // MM-DD
      axisLine: {
        lineStyle: {
          color: token.colorBorderSecondary,
        },
      },
      axisLabel: {
        color: token.colorTextSecondary,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: token.colorTextSecondary,
        fontSize: 11,
        formatter: (val: number) => `฿${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`,
      },
      splitLine: {
        lineStyle: {
          color: token.colorSplit,
        },
      },
    },
    series: [
      {
        data: stats.revenueTrend.map((d) => d.value),
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: {
          color: token.colorPrimary,
        },
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${token.colorPrimary}4D` },
            { offset: 1, color: `${token.colorPrimary}00` },
          ]),
        },
      },
    ],
  }), [stats.revenueTrend, token, currentTheme]);

  const userChartOptions = useMemo<echarts.EChartsOption>(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const item = params[0];
        return `${item.name}<br/><b>${item.value} users</b>`;
      },
    },
    grid: {
      top: 15,
      right: 15,
      bottom: 20,
      left: 10,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: stats.userRegistrationTrend.map((d) => d.label.substring(5)),
      axisLine: {
        lineStyle: {
          color: token.colorBorderSecondary,
        },
      },
      axisLabel: {
        color: token.colorTextSecondary,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: token.colorTextSecondary,
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: token.colorSplit,
        },
      },
    },
    series: [
      {
        data: stats.userRegistrationTrend.map((d) => d.value),
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8b5cf6' },
            { offset: 1, color: '#c084fc' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  }), [stats.userRegistrationTrend, token, currentTheme]);

  const tagChartOptions = useMemo<echarts.EChartsOption>(() => {
    const sortedData = [...stats.productTagDistribution]
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const colors = ['#1890ff', '#2f54eb', '#722ed1', '#13c2c2', '#52c41a', '#faad14'];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '<b>#{b}</b>: {c} products ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        bottom: '0%',
        textStyle: {
          color: token.colorTextSecondary,
          fontSize: 11,
        },
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
      },
      series: [
        {
          name: 'Tags',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['65%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: token.colorBgContainer,
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
              color: token.colorText,
              formatter: '#{b}',
            },
          },
          data: sortedData.map((d, i) => ({
            name: d.label,
            value: d.value,
            itemStyle: {
              color: colors[i % colors.length],
            },
          })),
        },
      ],
    };
  }, [stats.productTagDistribution, token, currentTheme]);

  const orderChartOptions = useMemo<echarts.EChartsOption>(() => {
    const activeData = stats.orderStatusDistribution.filter((d) => d.value > 0);

    const statusColorMap: Record<string, string> = {
      warning: '#faad14',
      processing: '#1677ff',
      blue: '#2f54eb',
      success: '#52c41a',
      error: '#ff4d4f',
      purple: '#722ed1',
    };

    const getStatusColor = (rawStatus: string) => {
      const info = orderStatusInfo[rawStatus as keyof typeof orderStatusInfo];
      const colorKey = info?.color || 'default';
      return statusColorMap[colorKey] || '#bfbfbf';
    };

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '<b>{b}</b>: {c} orders ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        bottom: '0%',
        textStyle: {
          color: token.colorTextSecondary,
          fontSize: 11,
        },
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
      },
      series: [
        {
          name: 'Orders',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['65%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: token.colorBgContainer,
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold',
              color: token.colorText,
              formatter: '{b}',
            },
          },
          data: activeData.map((d) => {
            const info = orderStatusInfo[d.label as keyof typeof orderStatusInfo];
            return {
              name: info?.label || d.label,
              value: d.value,
              itemStyle: {
                color: getStatusColor(d.label),
              },
            };
          }),
        },
      ],
    };
  }, [stats.orderStatusDistribution, token, currentTheme]);

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix="฿"
              precision={2}
              valueStyle={{ color: token.colorPrimary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Registered Users"
              value={stats.totalUsers}
              prefix={<Users size={18} className="mr-1" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Catalog Products"
              value={stats.totalProducts}
              prefix={<ShoppingBag size={18} className="mr-1" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<Package size={18} className="mr-1" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Revenue Trend (Last 7 Days)" className="shadow-sm">
            {stats.revenueTrend.length > 0 ? (
              <EChart options={revenueChartOptions} theme={currentTheme} />
            ) : (
              <Empty description="No revenue data" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="User Registrations (Last 7 Days)" className="shadow-sm">
            {stats.userRegistrationTrend.length > 0 ? (
              <EChart options={userChartOptions} theme={currentTheme} />
            ) : (
              <Empty description="No registration data" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Top Product Tags" className="shadow-sm">
            {stats.productTagDistribution.length > 0 ? (
              <EChart options={tagChartOptions} theme={currentTheme} />
            ) : (
              <Empty description="No tag data" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Order Status Breakdown" className="shadow-sm">
            {stats.orderStatusDistribution.filter((d) => d.value > 0).length > 0 ? (
              <EChart options={orderChartOptions} theme={currentTheme} />
            ) : (
              <Empty description="No order data" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewTab;
