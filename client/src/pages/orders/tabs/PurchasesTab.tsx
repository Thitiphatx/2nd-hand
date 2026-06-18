import { Button, Card, Divider, Empty, Flex, Image, Pagination, Spin, Tag, Typography, Input } from 'antd';
import { CalendarDays, ChevronRight, FileText, MessageSquare, Store, Search } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IPage } from '../../../interface';
import apiClient from '../../../libs/axios/axios';
import { orderStatusInfo } from '../../../utils/constant';
import { formatDateTime, formatTHB } from '../../../utils/formatter';
import { getFullImagePath } from '../../../utils/utils';
import type { IOrder, IPurchasesTabProps } from '../interface';

const { Text, Link } = Typography;

const PurchasesTab: React.FC<IPurchasesTabProps> = ({ status }) => {
  const navigate = useNavigate();
  const [ordersPage, setOrdersPage] = useState<IPage<IOrder> | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [keyword, setKeyword] = useState('');

  const getOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.current - 1,
        size: pagination.pageSize,
      };
      if (status !== 'ALL') {
        params.status = status;
      } else if (keyword) {
        params.keyword = keyword;
      }
      const { data } = await apiClient.get<IPage<IOrder>>('/orders/purchase', { params });
      setOrdersPage(data);
    } catch {
      // Handle in interceptor
    } finally {
      setLoading(false);
    }
  }, [pagination, status, keyword]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  return (
    <div className="space-y-4">
      {status === 'ALL' && (
        <div className="flex justify-start mb-2">
          <Input
            placeholder="Search by product or shop..."
            prefix={<Search size={16} className="text-gray-400 mr-1" />}
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            allowClear
            size="large"
            className="w-full md:w-80 shadow-sm rounded-lg"
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      ) : ordersPage?.content && ordersPage.content.length > 0 ? (
        <>
          <div className="space-y-3!">
            {ordersPage.content.map((order) => {
              const statusInfo = orderStatusInfo[order.status] || {
                label: order.status,
                color: 'default',
                icon: null,
                description: 'Processing order...',
              };

              return (
                <Card
                  key={order.id}
                  variant="borderless"
                  className="shadow-sm rounded-xl overflow-hidden"
                  classNames={{
                    body: 'p-0!',
                  }}
                  title={
                    <Flex justify="space-between" align="center" wrap gap={8}>
                      {/* Left: Shop info + actions */}
                      <Flex align="center" gap={8}>
                        <Store size={14} className="shrink-0" />
                        <Link
                          href={`/shop/${order.item.shopkeeperId}`}
                          className="font-medium text-sm"
                        >
                          {order.item.shopkeeperName}
                        </Link>
                        <Divider orientation="vertical" />
                        <Button
                          size="small"
                          variant="link"
                          color="default"
                          icon={<MessageSquare size={12} />}
                        >
                          Chat
                        </Button>
                        <Button
                          size="small"
                          variant="link"
                          color="default"
                          icon={<Store size={12} />}
                          onClick={() => navigate(`/shop/${order.item.shopkeeperId}`)}
                        >
                          Shop
                        </Button>
                      </Flex>

                      {/* Right: Status */}
                      <Flex align="center" gap={8}>
                        <Text type="secondary" className="text-xs hidden sm:inline">
                          {statusInfo.description}
                        </Text>
                        <Tag variant="outlined"
                          color={statusInfo.color}
                          className="m-0 font-semibold uppercase text-xs"
                        >
                          <Flex component="span" align="center" gap={4}>
                            {statusInfo.icon}
                            <span>{statusInfo.label}</span>
                          </Flex>
                        </Tag>
                      </Flex>
                    </Flex>
                  }
                >
                  {/* ── Product Row ── */}
                  <div
                    className="px-5 py-4 flex gap-4 items-start"
                    style={{ borderBottom: '1px solid var(--ant-color-border-secondary)' }}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                      <Image
                        width="100%"
                        height="100%"
                        src={getFullImagePath(order.item.productImage)}
                        className="object-cover"
                        classNames={{
                          cover: "rounded-xl"
                        }}
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <Link
                        href={`/product/${order.item.productId}`}
                        className="font-medium text-sm leading-snug line-clamp-2"
                      >
                        {order.item.productName}
                      </Link>
                      <Flex align="center" gap={4}>
                        <CalendarDays size={12} className="shrink-0" />
                        <Text type="secondary" className="text-xs">
                          {formatDateTime(order.purchasedDate)}
                        </Text>
                      </Flex>
                      <Tag variant="outlined" color="default" className="m-0 text-xs">
                        <Flex component="span" align="center" gap={4}>
                          <span>x1</span>
                        </Flex>
                      </Tag>
                    </div>

                    {/* Unit Price */}
                    <div className="text-right shrink-0 space-y-0.5">
                      <Text type="secondary" className="text-xs block">Unit Price</Text>
                      <Text delete type="secondary" className="text-xs block">
                        {formatTHB(order.item.price * 1.25)}
                      </Text>
                      <Text strong className="text-sm block">
                        {formatTHB(order.item.price)}
                      </Text>
                    </div>
                  </div>

                  {/* ── Footer: Total + CTA ── */}
                  <div
                    className="px-5 py-3 flex flex-wrap items-center justify-between gap-4"
                    style={{ background: 'var(--ant-color-fill-quaternary)' }}
                  >
                    {/* Left: Action buttons */}
                    <Flex gap={8}>

                      <Button
                        size="middle"
                        variant="outlined"
                        color="default"
                        icon={<FileText size={14} />}
                        onClick={() => navigate(`/order/${order.id}`)}
                      >
                        Order Detail
                      </Button>
                      <Button
                        type="primary"
                        size="middle"
                        icon={<ChevronRight size={14} />}
                        iconPlacement="end"
                        color="orange"
                        variant="solid"
                        hidden={order.status !== 'PAY_WAITING'}
                        onClick={() => navigate(`/order/${order.id}`)}
                      >
                        Pay Now
                      </Button>
                    </Flex>

                    <Flex align="baseline" gap={4}>
                      <Text type="secondary" className="text-xs">Order Total:</Text>
                      <Text strong className="text-lg">
                        {formatTHB(order.total)}
                      </Text>
                    </Flex>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-end mt-6">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={ordersPage?.totalElements || 0}
              showSizeChanger
              showTotal={(total, range) => `${range[0]}–${range[1]} of ${total} orders`}
              onChange={handlePaginationChange}
            />
          </div>
        </>
      ) : (
        <Card variant="borderless" className="shadow-sm rounded-xl">
          <div className="py-16 text-center">
            <Empty description={<Text type="secondary">No purchases found</Text>} />
          </div>
        </Card>
      )}
    </div>
  );
};

export default PurchasesTab;