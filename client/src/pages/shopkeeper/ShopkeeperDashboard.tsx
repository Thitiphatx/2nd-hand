import {
  LayoutDashboard,
  ListOrdered,
  ShoppingBag,
  MessageSquare,
} from 'lucide-react';
import {
  Tabs,
  Typography,
  Spin,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../libs/axios/axios';
import type { IReview } from '../../interface';
import type { IOrder, IShopkeeperStats } from './interface';

// Tab Components
import OverviewTab from './tabs/OverviewTab';
import ProductsTab from './tabs/ProductsTab';
import OrdersTab from './tabs/OrdersTab';
import ReviewsTab from './tabs/ReviewsTab';

const { Title, Text } = Typography;

const ShopkeeperDashboard: React.FC = () => {
  // 1. useContext / Custom context hooks
  const { userData } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // 2. useState hooks
  const activeTab = searchParams.get('tab') || 'overview';
  const [stats, setStats] = useState<IShopkeeperStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. useMemo hooks
  const handleTabChange = useCallback((key: string) => {
    setSearchParams({ tab: key });
  }, [setSearchParams]);



  const tabItems = useMemo(() => {
    return [
      {
        key: 'overview',
        label: (
          <span className="flex items-center gap-2">
            <LayoutDashboard size={18} />
            Overview
          </span>
        ),
        children: (
          <OverviewTab 
            stats={stats || { totalSales: 0, totalOrders: 0, activeProducts: 0, averageRating: 0 }} 
            orders={recentOrders} 
            reviews={reviews} 
            onViewAllOrders={() => handleTabChange('orders')}
            onViewAllReviews={() => handleTabChange('reviews')}
          />
        ),
      },
      {
        key: 'products',
        label: (
          <span className="flex items-center gap-2">
            <ShoppingBag size={18} />
            My Products
          </span>
        ),
        children: (
          <ProductsTab />
        ),
      },
      {
        key: 'orders',
        label: (
          <span className="flex items-center gap-2">
            <ListOrdered size={18} />
            Orders
          </span>
        ),
        children: (
          <OrdersTab />
        ),
      },
      {
        key: 'reviews',
        label: (
          <span className="flex items-center gap-2">
            <MessageSquare size={18} />
            Reviews ({reviews.length})
          </span>
        ),
        children: (
          <ReviewsTab
            reviews={reviews}
          />
        ),
      },
    ];
  }, [stats, recentOrders, reviews, handleTabChange]);

  // 4. useCallback hooks
  const fetchDashboardData = useCallback(async () => {
    if (!userData?.id) return;
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, ordersRes, reviewsRes] = await Promise.all([
        apiClient.get<IShopkeeperStats>('/shopkeeper/stats'),
        apiClient.get<any>('/orders/shop', { params: { size: 5, sort: 'purchasedDate,desc' } }),
        apiClient.get<IReview[]>(`/products/shopkeeper/${userData.id}/reviews`)
      ]);
      
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.content);
      setReviews(reviewsRes.data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [userData?.id]);



  // 5. useEffect hooks
  useEffect(() => {
    if (userData) {
      fetchDashboardData();
    }
  }, [userData, fetchDashboardData]);

  // 6. exactly 1 return statement acceptable
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <Title level={2}>Shopkeeper Dashboard</Title>
        <Text type="secondary">Manage your shop, products, and orders here.</Text>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spin size="large" description="Loading dashboard stats..." />
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

export default ShopkeeperDashboard;
