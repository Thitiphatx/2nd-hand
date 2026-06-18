import { CreditCardOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons';
import { Elements } from '@stripe/react-stripe-js';
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Row,
  Space,
  Spin,
  theme,
  Typography
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CardAddress from '../../components/payment/CardAddress';
import { useTheme } from '../../context/ThemeContext';

import apiClient from '../../libs/axios/axios';
import stripePromise from '../../libs/stripe';
import { formatTHB } from '../../utils/formatter';
import { getFullImagePath } from '../../utils/utils';
import type { IOrder } from '../orders/interface';
import FormStripe from './FormStripe';

const { Title, Text } = Typography;

const Payment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { theme: currentTheme } = useTheme();


  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const getOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get<IOrder>(`/orders/${id}`);

      if (data.status === 'CANCELLED') {
        notification.warning({
          title: 'Order was cancelled',
          description: 'You take too long to do the payment. please place the order again',
        });
        return
      }
      else if (data.status !== 'PAY_WAITING') {
        navigate(`/order/${id}`);
        return;
      }

      setOrder(data);
    } catch {
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, notification]);

  const handlePaymentSuccess = useCallback(async () => {
    try {
      setPaying(true);
      navigate(`/order/${id}`);
    } catch {
      // Handled in interceptor
    } finally {
      setPaying(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    getOrderDetail();
  }, [getOrderDetail]);

  return (
    <>
      {loading || paying ? (
        <Flex align="center" justify="center" className="min-h-[60vh]">
          <Spin
            size="large"
            description={paying ? 'Processing secure payment...' : 'Loading secure payment checkout...'}
          />
        </Flex>

      ) : !order ? (
        <Flex vertical align="center" justify="center" gap="middle" className="py-12">
          <Empty description="Order not found" />
          <Button type="primary" onClick={() => navigate('/orders')}>
            Go to Orders
          </Button>
        </Flex>

      ) : (
        <Flex vertical gap="large" className="py-6 px-4">

          <Title level={2} style={{ margin: 0 }}>
            Secure Payment Checkout
          </Title>

          <Row gutter={[24, 24]}>
            {/* Left Column: Payment Form */}
            <Col xs={24} md={14}>
              <Card
                title={
                  <Space>
                    <LockOutlined style={{ color: token.colorPrimary }} />
                    <Text strong>Payment Method Details</Text>
                  </Space>
                }
                variant="borderless"
              >
                {order.clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret: order.clientSecret,
                      appearance: {
                        theme: currentTheme === 'dark' ? 'night' : 'stripe',
                      },
                    }}
                  >
                    <FormStripe
                      order={order}
                      onFinish={handlePaymentSuccess}
                      onCancel={() => navigate(-1)}
                    />
                  </Elements>
                ) : (
                  <Flex align="center" justify="center" className="py-8">
                    <Spin size="large" description="Initializing payment form..." />
                  </Flex>
                )}
              </Card>
            </Col>

            {/* Right Column: Order Summary */}
            <Col xs={24} md={10}>
              {order.shippingAddress && (
                <CardAddress address={order.shippingAddress} />
              )}
              <Card
                title={
                  <Space>
                    <CreditCardOutlined style={{ color: token.colorPrimary }} />
                    <Text strong>Order Details</Text>
                  </Space>
                }
                variant="borderless"
              >
                <Flex gap="middle" className="mb-4">
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: token.borderRadius,
                      overflow: 'hidden',
                      border: `1px solid ${token.colorBorderSecondary}`,
                      background: token.colorFillTertiary,
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={getFullImagePath(order.item.productImage)}
                      alt={order.item.productName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <Flex vertical justify="space-between" style={{ flex: 1, minWidth: 0 }}>
                    <Flex vertical gap={4}>
                      <Text strong ellipsis>
                        {order.item.productName}
                      </Text>
                      <Space size={4}>
                        <ShopOutlined />
                        <Text type="secondary">{order.item.shopkeeperName}</Text>
                      </Space>
                    </Flex>
                    <Text strong>{formatTHB(order.item.price)}</Text>
                  </Flex>
                </Flex>

                <Divider />

                <Flex vertical gap="small">
                  <Flex justify="space-between">
                    <Text>Subtotal</Text>
                    <Text>{formatTHB(order.item.price)}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Shipping Fee</Text>
                    <Text type="success">Free</Text>
                  </Flex>

                  <Divider className="my-1!" />

                  <Flex justify="space-between" align="baseline">
                    <Text strong>Total Amount</Text>
                    <Title level={4} style={{ margin: 0, color: token.colorPrimary }}>
                      {formatTHB(order.total)}
                    </Title>
                  </Flex>
                </Flex>
              </Card>
            </Col>
          </Row>
        </Flex>
      )}
    </>
  );
};

export default Payment;