import React, { useCallback, useEffect, useState } from 'react';
import { Card, Select, Space, Table, Tag, Typography, App, Image, Tooltip, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import type { IOrder, OrderStatus, IOrderItem } from '../../orders/interface';
import apiClient from '../../../libs/axios/axios';
import { formatDateTime, formatTHB } from '../../../utils/formatter';
import { getFullImagePath } from '../../../utils/utils';
import { orderStatusInfo } from '../../../utils/constant';

const { Text } = Typography;
const { Option } = Select;

const OrdersTab: React.FC = () => {
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = status === 'ALL' ? {} : { status };
      const { data } = await apiClient.get('/orders/shop', { params });
      setOrders(data.content);
    } catch (error) {
      console.error('Failed to fetch shop orders:', error);
      notification.error({ title: 'Error', description: 'Failed to fetch orders' });
    } finally {
      setLoading(false);
    }
  }, [status, notification]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 230,
      render: (id: string) => <Text copyable className="text-xs font-mono">{id}</Text>
    },
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
      render: (item: IOrderItem) => (
        <Space size="middle">
          <Image
            width={40}
            src={getFullImagePath(item.productImage)}
            className="rounded object-cover"
          />
          <div className="font-semibold text-sm">{item.productName}</div>
        </Space>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => <Text strong className="text-blue-600">{formatTHB(total)}</Text>,
    },
    ...(status === 'ALL' ? [{
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: OrderStatus) => {
        return (
          <Tag variant="outlined" color={orderStatusInfo[status].color}>
            {orderStatusInfo[status].label}
          </Tag>
        );
      },
    }] : []),
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: IOrder) => (
        <Tooltip title="View Detail">
          <Button
            variant="link"
            color="primary"
            icon={<Eye size={16} />}
            onClick={() => navigate(`/order/${record.id}`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Card
      title="Order Management"
      extra={
        <Select
          value={status}
          onChange={setStatus}
          style={{ width: 180 }}
        >
          <Option value="ALL">All Status</Option>
          <Option value="PAY_WAITING">Wait for Payment</Option>
          <Option value="PENDING">Pending</Option>
          <Option value="SHIPPED">Shipped</Option>
          <Option value="DELIVERED">Delivered</Option>
          <Option value="CANCELLED">Cancelled</Option>
          <Option value="PENDING_REFUND">Pending Refund</Option>
          <Option value="REFUND_APPROVED">Refund Approved</Option>
          <Option value="REFUNDED">Refunded</Option>
        </Select>
      }
    >
      <Table
        columns={orderColumns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default OrdersTab;
