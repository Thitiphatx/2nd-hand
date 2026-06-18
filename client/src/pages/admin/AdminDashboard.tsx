import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Spin, Tabs, Typography } from 'antd';
import {
  LayoutDashboard,
  ListOrdered,
  ShoppingBag,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../libs/axios/axios';
import type { IAdminStats } from './interface';
import OverviewTab from './tabs/OverviewTab';
import UsersTab from './tabs/UsersTab';
import ProductsTab from './tabs/ProductsTab';
import TransactionsTab from './tabs/TransactionsTab';

const { Title, Text } = Typography;

const emptyStats: IAdminStats = {
  totalUsers: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0,
  revenueTrend: [],
  userRegistrationTrend: [],
  productTagDistribution: [],
  orderStatusDistribution: [],
};

const AdminDashboard: React.FC = () => {
  const { userData } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState<IAdminStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = useMemo(() => userData?.roles?.includes('ADMIN') ?? false, [userData]);

  const handleTabChange = useCallback((key: string) => {
    setSearchParams({ tab: key });
  }, [setSearchParams]);

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get<IAdminStats>('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setError('Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const tabItems = useMemo(
    () => [
      {
        key: 'overview',
        label: (
          <span className="flex items-center gap-2">
            <LayoutDashboard size={16} />
            Overview
          </span>
        ),
        children: <OverviewTab stats={stats} />,
      },
      {
        key: 'users',
        label: (
          <span className="flex items-center gap-2">
            <Users size={16} />
            Users
          </span>
        ),
        children: <UsersTab />,
      },
      {
        key: 'products',
        label: (
          <span className="flex items-center gap-2">
            <ShoppingBag size={16} />
            Products
          </span>
        ),
        children: <ProductsTab />,
      },
      {
        key: 'transactions',
        label: (
          <span className="flex items-center gap-2">
            <ListOrdered size={16} />
            Transactions
          </span>
        ),
        children: <TransactionsTab />,
      },
    ],
    [stats]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <Title level={3}>Access Denied</Title>
        <Text type="secondary">You do not have permission to view this page.</Text>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <Title level={2}>Admin Dashboard</Title>
        <Text type="secondary">Manage users, products, and transactions.</Text>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spin size="large" description="Loading dashboard data..." />
        </div>
      ) : error ? (
        <div className="text-red-500 py-4">{error}</div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size="large"
          type="line"
        />
      )}
    </div>
  );
};

export default AdminDashboard;
