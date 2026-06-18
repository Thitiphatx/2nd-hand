import React from 'react';
import { Row, Col, Card, Statistic, Table, Masonry, Typography, Button, theme, Rate, Avatar, Space, Tag } from 'antd';
import { ListOrdered, ShoppingBag, Star } from 'lucide-react';
import type { IShopkeeperStats, IOrder } from '../interface';
import type { IReview } from '../../../interface';
import { formatDateTime, formatTHB } from '../../../utils/formatter';
import { getFullImagePath } from '../../../utils/utils';
import { orderStatusInfo } from '../../../utils/constant';

const { Text } = Typography;

interface IOverviewTabProps {
  stats: IShopkeeperStats;
  orders: IOrder[];
  reviews: IReview[];
  onViewAllOrders: () => void;
  onViewAllReviews: () => void;
}

const OverviewTab: React.FC<IOverviewTabProps> = ({ 
  stats, 
  orders, 
  reviews, 
  onViewAllOrders, 
  onViewAllReviews,
}) => {
  const { token } = theme.useToken();

  const recentOrderColumns = [
    {
      title: 'Date',
      dataIndex: 'purchasedDate',
      key: 'purchasedDate',
      render: (date: string) => <div className="text-xs">{formatDateTime(date)}</div>,
    },
    {
      title: 'Product',
      dataIndex: 'item',
      key: 'product',
      render: (item: any) => (
        <Space size="small">
          <Avatar shape="square" size="small" src={getFullImagePath(item.productImage)} />
          <Text className="text-xs line-clamp-1">{item.productName}</Text>
        </Space>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => <Text strong className="text-blue-600 text-xs">{formatTHB(total)}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: any) => {
        const info = orderStatusInfo[status as keyof typeof orderStatusInfo] || { label: status, color: 'default' };
        return (
          <Tag variant="outlined" color={info.color} className="m-0 text-[10px]">
            {info.label}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm">
            <Statistic 
              title="Total Revenue" 
              value={stats.totalSales} 
              prefix="฿" 
              valueStyle={{ color: token.colorPrimary }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm">
            <Statistic 
              title="Total Orders" 
              value={stats.totalOrders} 
              prefix={<ListOrdered size={20} className="mr-2" />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm">
            <Statistic 
              title="Active Products" 
              value={stats.activeProducts} 
              prefix={<ShoppingBag size={20} className="mr-2" />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm">
            <Statistic 
              title="Avg Rating" 
              value={stats.averageRating} 
              precision={1}
              prefix={<Star size={20} className="text-yellow-500 mr-2" />} 
              suffix="/ 5"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Orders" className="shadow-sm" extra={<Button type="link" onClick={onViewAllOrders}>View All</Button>}>
            <Table 
              columns={recentOrderColumns} 
              dataSource={orders} 
              pagination={false} 
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Latest Reviews" className="shadow-sm" extra={<Button type="link" onClick={onViewAllReviews}>View All</Button>}>
            <Masonry<IReview>
              columns={1}
              items={reviews.slice(0, 3).map(r => ({ key: r.id, data: r }))}
              itemRender={(itemInfo) => {
                const review = itemInfo.data;
                return (
                  <div className="py-3 border-b last:border-b-0 border-gray-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-1">
                      <Text strong>{review.username}</Text>
                      <Rate disabled defaultValue={review.score} className="text-[10px]" />
                    </div>
                    <Text type="secondary" className="text-xs line-clamp-2">{review.comment}</Text>
                  </div>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewTab;
