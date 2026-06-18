import { Card, Tabs, Typography } from 'antd';
import React, { useState } from 'react';
import type { OrderStatus } from './interface';
import PurchasesTab from './tabs/PurchasesTab';

const { Title, Text } = Typography;

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');

  const items = [
    {
      key: 'ALL',
      label: 'All Purchases',
      children: <PurchasesTab status="ALL" />
    },
    {
      key: 'PAY_WAITING',
      label: 'Waiting for Payment',
      children: <PurchasesTab status="PAY_WAITING" />
    },
    {
      key: 'PENDING',
      label: 'Pending',
      children: <PurchasesTab status="PENDING" />
    },
    {
      key: 'SHIPPED',
      label: 'Shipped',
      children: <PurchasesTab status="SHIPPED" />
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      children: <PurchasesTab status="DELIVERED" />
    },
    {
      key: 'PENDING_REFUND',
      label: 'Refunding',
      children: <PurchasesTab status="PENDING_REFUND" />
    },
    {
      key: 'REFUND_APPROVED',
      label: 'Refund Approved',
      children: <PurchasesTab status="REFUND_APPROVED" />
    },
    {
      key: 'REFUNDED',
      label: 'Refunded',
      children: <PurchasesTab status="REFUNDED" />
    },
    {
      key: 'CANCELLED',
      label: 'Cancelled',
      children: <PurchasesTab status="CANCELLED" />
    },
  ];

  return (
    <div className="py-8 px-4">
      <div className="mb-6">
        <Title level={2} className="m-0">My Purchases</Title>
        <Text type="secondary">Track and manage your orders</Text>
      </div>

      <Card className="shadow-sm overflow-hidden" styles={{ body: { padding: '0 24px 24px 24px' } }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as OrderStatus | 'ALL')}
          items={items}
          className="purchases-tabs"
        />
      </Card>
    </div>
  );
};

export default Orders;
