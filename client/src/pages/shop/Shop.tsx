import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../libs/axios/axios';
import { getFullImagePath } from '../../utils/utils';
import {
  Row, Col, Card, Avatar, Typography, Rate, Space,
  Tabs, Masonry, Empty, Divider, theme,
  Badge, Statistic, Spin, Pagination, Button
} from 'antd';
import { useAuth } from '../../context/AuthContext';
import {
  Store, MessageSquare, MapPin,
  Calendar, ShoppingBag, Star,
  User
} from 'lucide-react';
import CardProduct from '../../components/product/CardProduct';
import type { IReview, IProductItem, IPage } from '../../interface';
import type { IShop } from './interface';
import { formatTHB, formatDateTime } from '../../utils/formatter';

const { Title, Text, Paragraph } = Typography;

const Shop: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { userData } = useAuth();
  const isMe = userData?.id === id;
  const [activeTab, setActiveTab] = useState('products');

  const [shop, setShop] = useState<IShop | null>(null);
  const [productsPage, setProductsPage] = useState<IPage<IProductItem> | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [stats, setStats] = useState<{ successOrderCount: number; totalProducts: number; averageRating: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 6 });

  const fetchShopInfo = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [shopRes, reviewsRes, statsRes] = await Promise.all([
        apiClient.get<IShop>(`/products/shopkeeper/${id}/public`),
        apiClient.get<IReview[]>(`/products/shopkeeper/${id}/reviews`),
        apiClient.get<any>(`/shopkeeper/${id}/stats`),
      ]);
      setShop(shopRes.data);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchShopProducts = useCallback(async () => {
    if (!id) return;
    try {
      setProductsLoading(true);
      const { data } = await apiClient.get<IPage<IProductItem>>('/products', {
        params: {
          shopkeeperId: id,
          page: pagination.current - 1,
          size: pagination.pageSize,
        },
      });
      setProductsPage(data);
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  }, [id, pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchShopInfo();
  }, [fetchShopInfo]);

  useEffect(() => {
    fetchShopProducts();
  }, [fetchShopProducts]);

  if (loading || !shop) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" description="Loading shop..." />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'products',
      label: (
        <span className="flex items-center gap-2">
          <ShoppingBag size={18} />
          Products ({productsPage?.totalElements || 0})
        </span>
      ),
      children: (
        <div>
          {productsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" description="Loading products..." />
            </div>
          ) : (
            <>
              <Row gutter={[24, 24]}>
                {productsPage?.content && productsPage.content.length > 0 ? (
                  productsPage.content.map((product) => (
                    <Col xs={24} sm={12} lg={8} key={product.id}>
                      <CardProduct product={product} />
                    </Col>
                  ))
                ) : (
                  <Col span={24}>
                    <Empty description="No products available from this shop yet." />
                  </Col>
                )}
              </Row>
              {productsPage && productsPage.totalElements > 0 && (
                <div className="flex justify-end mt-6">
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={productsPage.totalElements}
                    showSizeChanger
                    onChange={(page, pageSize) => setPagination({ current: page, pageSize })}
                  />
                </div>
              )}
            </>
          )}
        </div>
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
        <Card className="shadow-sm">
          {reviews.length > 0 ? (
            <Masonry<IReview>
              columns={1}
              items={reviews.map(r => ({ key: r.id, data: r }))}
              itemRender={(itemInfo) => {
                const review = itemInfo.data;
                return (
                  <div key={review.id} className="py-6 border-b last:border-b-0 border-gray-100 dark:border-zinc-800">
                    <div className="flex gap-4">
                      <Avatar icon={<User size={18} />} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <Text strong>{review.username}</Text>
                          <Text type="secondary" className="text-xs">{formatDateTime(review.createdAt)}</Text>
                        </div>
                        <Rate disabled defaultValue={review.score} size="small" className="mb-2" />
                        <Paragraph className="m-0" style={{ color: token.colorTextSecondary }}>{review.comment}</Paragraph>
                        {review.product && (
                          <div 
                            className="mt-3 p-3 rounded flex items-center gap-3 border hover:opacity-85 transition-opacity"
                            style={{ 
                              backgroundColor: token.colorFillAlter, 
                              borderColor: token.colorBorderSecondary,
                              cursor: 'pointer',
                              maxWidth: '320px'
                            }}
                            onClick={() => navigate(`/product/${review.product?.id}`)}
                          >
                            <Avatar 
                              shape="square" 
                              size={44} 
                              src={getFullImagePath(review.product.image)} 
                            />
                            <div className="flex-1 min-w-0">
                              <Text strong className="block text-xs truncate mb-0.5">{review.product.name}</Text>
                              <Text className="text-blue-600 font-medium text-xs block">
                                {formatTHB(review.product.price)}
                              </Text>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                );
              }}
            />
          ) : (
            <Empty description="No reviews yet for this shop." />
          )}
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Shop Header */}
      <Card className="shadow-md overflow-hidden border-none">
        <div
          className="h-32 md:h-48 w-full bg-gradient-to-r from-blue-500 to-indigo-600 relative"
          style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)' }}
        >
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge count={shop.rating} style={{ backgroundColor: '#fadb14', color: '#000' }}>
              <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-md">
                <Star size={18} className="text-yellow-400" />
              </div>
            </Badge>
          </div>
        </div>

        <div className="px-6 pb-6 -mt-12 md:-mt-16 relative flex flex-col md:flex-row gap-6 items-start md:items-end">
          <Avatar
            size={{ xs: 100, sm: 120, md: 150 }}
            src={shop.avatar && (shop.avatar.startsWith('http') ? shop.avatar : getFullImagePath(shop.avatar))}
            className="border-4 border-white shadow-lg bg-white"
            icon={<Store size={64} />}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />

          <div className="flex-1 pb-2 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2 w-full">
              <Title level={2} className="m-0">{shop.name}</Title>
              {!isMe && (
                <Button
                  type="primary"
                  icon={<MessageSquare size={16} />}
                  onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { 
                    detail: { userId: shop.id, userName: shop.name } 
                  }))}
                  className="shadow-sm bg-blue-600 border-none hover:bg-blue-755 text-white font-medium flex items-center gap-1.5"
                >
                  Chat with Seller
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Space>
                <MapPin size={14} />
                <Text type="secondary">{shop.location}</Text>
              </Space>
              <Space>
                <Calendar size={14} />
                <Text type="secondary">Joined {new Date(shop.joinDate).toLocaleDateString()}</Text>
              </Space>
              <Space>
                <Star size={14} className="text-yellow-500" />
                <Text strong>{shop.rating}</Text>
                <Text type="secondary">({shop.totalReviews} reviews)</Text>
              </Space>
            </div>
          </div>

        </div>

        <Divider className="m-0" />

        <div className="p-6 bg-gray-50 dark:bg-zinc-900/50">
          <div className="grid grid-cols-3 gap-4">
            <Card size="small" className="text-center shadow-sm border-none bg-white dark:bg-zinc-800">
              <Statistic title="Products" value={productsPage?.totalElements || 0} prefix={<ShoppingBag size={18} className="mr-2" />} />
            </Card>
            <Card size="small" className="text-center shadow-sm border-none bg-white dark:bg-zinc-800">
              <Statistic title="Rating" value={shop.rating} suffix="/ 5" />
            </Card>
            <Card size="small" className="text-center shadow-sm border-none bg-white dark:bg-zinc-800">
              <Statistic title="Sold Items" value={stats?.successOrderCount || 0} />
            </Card>
          </div>
        </div>
      </Card>

      {/* Tabs Section */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        className="mt-6"
      />
    </div>
  );
};

export default Shop;
