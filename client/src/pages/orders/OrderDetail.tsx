import {
  ArrowLeftOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  InboxOutlined,
  ShopOutlined
} from '@ant-design/icons';
import {
  Alert,
  App,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Rate,
  Row,
  Space,
  Spin,
  Steps,
  Tag,
  Timeline,
  Typography,
  theme,
  type MenuProps
} from 'antd';
import { ChevronDown, ChevronRight, ReceiptText, Truck } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CardAddress from '../../components/payment/CardAddress';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../libs/axios/axios';
import { orderStatusInfo } from '../../utils/constant';
import { formatTHB, getPaymentMethodInfo } from '../../utils/formatter';
import { getFullImagePath } from '../../utils/utils';
import type { IFormShipping, IOrder, OrderStatus } from './interface';
import type { IReview } from '../../interface';
import ModalShippingDetail from './ModalShippingDetail';
import ModalFormRefundEmail from './ModalFormRefundEmail';

const { Title, Text } = Typography;

// Moved outside component — stable type, no re-declaration on each render
interface ActionItem {
  key: string;
  label: string;
  onClick: () => void;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  color?: 'default' | 'primary' | 'danger' | 'blue' | 'cyan' | 'gold' | 'green' | 'lime' | 'magenta' | 'orange' | 'pink' | 'purple' | 'red' | 'yellow' | 'volcano' | 'geekblue';
  variant?: 'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link';
  danger?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPlacement?: 'start' | 'end';
}

const steps = [
  { title: 'Payment', icon: <CreditCardOutlined /> },
  { title: 'Pending', icon: <InboxOutlined /> },
  { title: 'Shipped', icon: <CarOutlined /> },
  { title: 'Delivered', icon: <CheckCircleOutlined /> },
];

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { modal, notification } = App.useApp();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { token } = theme.useToken();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpenShipModal, setIsOpenShipModal] = useState(false);
  const [form] = Form.useForm<IFormShipping>();
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewForm] = Form.useForm();
  const [isOpenRefundModal, setIsOpenRefundModal] = useState(false);
  const [refundEmailForm] = Form.useForm<{ email?: string }>();
  const paymentSuccess = searchParams.get('payment_success');

  const isShopkeeper = userData?.id === order?.item.shopkeeperId;
  const statusInfo = order ? orderStatusInfo[order.status] : orderStatusInfo['PAY_WAITING'];

  const getOrderDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get<IOrder>(`/orders/${id}`);
      setOrder(data);
    } catch {
      // Handled in interceptor
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    if (!order?.item?.productId) return;
    try {
      const { data } = await apiClient.get<IReview[]>(`/products/${order.item.productId}/reviews`);
      const userReview = data.find(r => r.userId === userData?.id);
      setHasReviewed(!!userReview);
    } catch {
      // Ignored
    }
  }, [order?.item?.productId, userData?.id]);

  const handleReviewSubmit = useCallback(async (values: { rating: number; comment: string }) => {
    if (!order?.item?.productId) return;
    try {
      await apiClient.post(`/products/${order.item.productId}/reviews`, {
        rating: values.rating,
        comment: values.comment,
        productId: order.item.productId,
      });
      notification.success({ title: 'Review submitted successfully' });
      setIsReviewModalVisible(false);
      reviewForm.resetFields();
      fetchReviews();
    } catch {
      // Handled by axios interceptor
    }
  }, [order?.item?.productId, fetchReviews, notification, reviewForm]);

  useEffect(() => {
    if (order?.item?.productId) {
      fetchReviews();
    }
  }, [order?.item?.productId, fetchReviews]);

  const handleSubmitRefundRequest = useCallback(async (values: { email?: string }) => {
    try {
      setIsLoading(true);
      const emailParam = values.email ? `?refundEmail=${encodeURIComponent(values.email)}` : '';
      await apiClient.delete(`/orders/${id}${emailParam}`);
      notification.success({ title: 'Refund request submitted successfully' });
      setIsOpenRefundModal(false);
      refundEmailForm.resetFields();
      getOrderDetail();
    } catch {
      // Handled in interceptor
    } finally {
      setIsLoading(false);
    }
  }, [id, getOrderDetail, notification, refundEmailForm]);

  const handleCancelOrder = useCallback(() => {
    const isPaid = order?.status !== 'PAY_WAITING';
    const isClientRefund = !isShopkeeper && isPaid;

    if (isClientRefund) {
      refundEmailForm.setFieldsValue({ email: userData?.email });
      setIsOpenRefundModal(true);
    } else {
      modal.confirm({
        title: 'Are you sure to cancel this order?',
        content: 'This product will be listed back on the product list.',
        centered: true,
        okText: 'Cancel Order',
        okType: 'danger',
        onOk: async () => {
          try {
            await apiClient.delete(`/orders/${id}`);
            notification.success({ title: 'Order cancelled successfully' });
            getOrderDetail();
          } catch {
            // Handled in interceptor
          }
        },
      });
    }
  }, [id, modal, notification, getOrderDetail, order?.status, isShopkeeper, userData?.email, refundEmailForm]);

  const handleUpdateStatus = useCallback(async (status: OrderStatus) => {
    try {
      await apiClient.put(`/orders/${id}`, { status });
      notification.success({ title: 'Order status updated' });
      getOrderDetail();
    } catch {
      // Handled in interceptor
    }
  }, [id, notification, getOrderDetail]);

  const handleApproveRefund = useCallback(() => {
    modal.confirm({
      title: 'Approve Refund Request?',
      content: 'This will refund the payment and make the product available for sale again.',
      centered: true,
      okText: 'Approve & Cancel Order',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.put(`/orders/${id}`, { status: 'CANCELLED' });
          notification.success({ title: 'Refund approved successfully' });
          getOrderDetail();
        } catch {
          // Handled in interceptor
        }
      },
    });
  }, [id, modal, notification, getOrderDetail]);

  const handlePayNow = useCallback(() => navigate(`/payment/${id}`), [navigate, id]);

  useEffect(() => {
    if (paymentSuccess === 'true') {
      searchParams.delete('payment_success');
      setSearchParams(searchParams, { replace: true });
    }
    getOrderDetail();
  }, [paymentSuccess, getOrderDetail, searchParams, setSearchParams]);

  const previousStatus = useMemo(() => {
    if (!order?.statusHistory || order.statusHistory.length < 2) return null;
    const history = order.statusHistory;
    const pendingRefundIndex = [...history].reverse().findIndex(h => h.status === 'PENDING_REFUND');
    if (pendingRefundIndex !== -1) {
      const originalIndex = history.length - 1 - pendingRefundIndex;
      if (originalIndex > 0) {
        return history[originalIndex - 1].status;
      }
    }
    return null;
  }, [order?.statusHistory]);

  const handleDeclineRefund = useCallback(() => {
    if (!previousStatus) return;
    modal.confirm({
      title: 'Decline Refund Request?',
      content: `This will decline the refund request and return the order to its previous status: ${orderStatusInfo[previousStatus]?.label || previousStatus}.`,
      centered: true,
      okText: 'Decline Refund',
      okType: 'primary',
      onOk: async () => {
        try {
          await apiClient.put(`/orders/${id}`, { status: previousStatus });
          notification.success({ title: 'Refund request declined successfully' });
          getOrderDetail();
        } catch {
          // Handled in interceptor
        }
      },
    });
  }, [id, previousStatus, modal, notification, getOrderDetail]);

  const availableActions = useMemo<ActionItem[]>(() => {
    if (!order) return [];

    const actions: ActionItem[] = [];

    if (!isShopkeeper && order.status === 'PAY_WAITING') {
      actions.push({
        key: 'pay',
        label: 'Pay Now',
        onClick: handlePayNow,
        type: 'primary',
        color: 'orange',
        variant: 'solid',
      });
    }

    if (isShopkeeper && order.status === 'PENDING') {
      actions.push({
        key: 'mark_shipped',
        label: 'Mark as Shipped',
        onClick: () => setIsOpenShipModal(true),
        type: 'primary',
        variant: 'solid',
        iconPlacement: 'end',
      });
    }

    if (isShopkeeper && order.status === 'SHIPPED') {
      actions.push({
        key: 'mark_delivered',
        label: 'Mark as Delivered',
        onClick: () => handleUpdateStatus('DELIVERED'),
        type: 'primary',
        variant: 'solid',
        iconPlacement: 'end',
      });
      actions.push({
        key: 'rollback',
        label: 'Rollback to Pending',
        onClick: () => handleUpdateStatus('PENDING'),
        color: 'default',
        variant: 'outlined',
      });
    }

    if (isShopkeeper && order.status === 'PENDING_REFUND') {
      actions.push({
        key: 'approve_refund',
        label: 'Approve Refund',
        onClick: handleApproveRefund,
        type: 'primary',
        color: 'red',
        variant: 'solid',
        danger: true,
      });
      if (previousStatus) {
        actions.push({
          key: 'decline_refund',
          label: 'Decline Refund',
          onClick: handleDeclineRefund,
          color: 'default',
          variant: 'outlined',
        });
      }
    }

    if (statusInfo.step < 2) {
      const isPaid = order.status !== 'PAY_WAITING';
      const isClientRefund = !isShopkeeper && isPaid;

      actions.push({
        key: 'cancel',
        label: isClientRefund ? 'Request for Refund' : 'Cancel Order',
        onClick: handleCancelOrder,
        danger: true,
        variant: order.status === 'PAY_WAITING' ? 'outlined' : 'solid',
      });
    }

    if (!isShopkeeper && order.status === 'DELIVERED') {
      actions.push({
        key: 'review_shop',
        label: hasReviewed ? 'Reviewed' : 'Review Shop',
        onClick: () => setIsReviewModalVisible(true),
        type: 'primary',
        color: 'blue',
        variant: 'solid',
        disabled: hasReviewed,
      });
    }

    return actions;
  }, [order, isShopkeeper, handlePayNow, handleUpdateStatus, handleCancelOrder, handleApproveRefund, handleDeclineRefund, previousStatus, statusInfo.step, hasReviewed]);

  const dropdownItems = useMemo(() =>
    availableActions.slice(1).map((action) => ({
      key: action.key,
      label: action.label,
      danger: action.danger,
    })),
    [availableActions]
  );

  const handleMenuClick = useCallback<NonNullable<MenuProps['onClick']>>((info) => {
    availableActions.find((act) => act.key === info.key)?.onClick();
  }, [availableActions]);

  const handleSubmitShippingDetail = useCallback(async (values: IFormShipping) => {
    try {
      setIsLoading(true);
      await apiClient.put(`/orders/${id}`, {
        status: 'SHIPPED',
        shippingCode: values.shippingCode,
        deliveryUrl: values.deliveryUrl,
      });
      notification.success({ title: 'Order marked as shipped successfully' });
      setIsOpenShipModal(false);
      form.resetFields();
      getOrderDetail();
    } catch {
      // Handled in interceptor
    } finally {
      setIsLoading(false);
    }
  }, [form, getOrderDetail, id, notification])

  const firstAction = availableActions[0];

  return (
    <>
      {isLoading ? (
        <Flex align="center" justify="center" className="min-h-[60vh]">
          <Spin size="large" description="Loading order..." />
        </Flex>

      ) : !order ? (
        <Flex vertical align="center" justify="center" gap="middle" className="py-12">
          <Empty description="Order not found" />
          <Button 
            type="primary" 
            onClick={() => navigate('/orders')}
          >
            Go Back
          </Button>
        </Flex>

      ) : (
        <>
          <ModalShippingDetail
            isOpen={isOpenShipModal}
            setIsOpen={setIsOpenShipModal}
            onSubmit={handleSubmitShippingDetail}
            form={form}
          />
          <ModalFormRefundEmail
            isOpen={isOpenRefundModal}
            setIsOpen={setIsOpenRefundModal}
            form={refundEmailForm}
            onSubmit={handleSubmitRefundRequest}
            isPromptPay={order.paymentMethod === 'PROMPTPAY'}
          />
          <Modal
            title="Review Shop"
            open={isReviewModalVisible}
            onCancel={() => setIsReviewModalVisible(false)}
            onOk={() => reviewForm.submit()}
            okText="Submit Review"
            destroyOnClose
            centered
          >
            <Form
              form={reviewForm}
              layout="vertical"
              onFinish={handleReviewSubmit}
              initialValues={{ rating: 5 }}
            >
              <div className="mb-4 text-center">
                <Text type="secondary" className="block mb-2">
                  How was your experience with <strong>{order.item.shopkeeperName}</strong>?
                </Text>
                <Form.Item
                  name="rating"
                  rules={[{ required: true, message: 'Please give a rating' }]}
                  className="mb-0"
                >
                  <Rate size="large" />
                </Form.Item>
              </div>
              <Form.Item
                name="comment"
                label="Review Message"
                rules={[{ required: true, message: 'Please write your review comment' }]}
              >
                <Input.TextArea rows={4} placeholder="Tell others about your purchase and experience..." />
              </Form.Item>
            </Form>
          </Modal>
          <Flex vertical gap={24} className="py-6 px-4">
            <Card
              variant="borderless"
              title={
                <Flex justify="space-between" align="center">
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(isShopkeeper ? '/shopkeeper/dashboard?tab=orders' : '/orders')}
                    className="p-0! w-fit"
                  >
                    {isShopkeeper ? 'Back to My Orders' : 'Back to My Purchases'}
                  </Button>
                  <Tag variant="outlined" color={statusInfo.color === 'danger' ? 'error' : statusInfo.color}>
                    <Flex component="span" align="center" gap={4}>
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </Flex>
                  </Tag>
                </Flex>
              }
            >
              {order.status === 'REFUND_APPROVED' && order.paymentMethod === 'PROMPTPAY' && !isShopkeeper && (
                <Alert
                  type="warning"
                  showIcon
                  message={<Text strong>Action Required: Complete Bank Details for Refund</Text>}
                  description={
                    <div>
                      To process your PromptPay refund, Stripe requires your bank account details. Stripe has sent an email to your account email (<strong>{userData?.email}</strong>) containing a secure link to fill out your bank details. Please check your email inbox and spam/junk folder.
                    </div>
                  }
                  style={{ marginBottom: 24 }}
                />
              )}
              <Row gutter={[48, 48]}>
                {/* Left: Steps & Item */}
                <Col xs={24} lg={15}>
                  <Flex vertical gap={24}>
                    <Steps
                      current={statusInfo.step}
                      items={steps.map((step) => ({
                        title: step.title,
                        icon: step.icon,
                      }))}
                    />

                    <Flex vertical gap={8}>
                      <Title level={5} style={{ margin: 0 }}>Order Items</Title>
                      <Card
                        classNames={{ body: 'flex gap-4 align-top' }}
                      >
                        <Avatar
                          size={112}
                          shape="square"
                          src={
                            <Image
                              draggable={false}
                              src={getFullImagePath(order.item.productImage)}
                              alt={order.item.productName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              preview={false}
                            />
                          }
                        />
                        <Flex vertical justify="space-between" style={{ flex: 1, minWidth: 0 }}>
                          <Flex vertical gap={4}>
                            <Title level={5} ellipsis style={{ margin: 0 }}>
                              {order.item.productName}
                            </Title>
                            <Space size={4}>
                              <ShopOutlined />
                              <Text type="secondary">{order.item.shopkeeperName}</Text>
                            </Space>
                          </Flex>
                          <Text strong style={{ color: token.colorPrimary }}>
                            {formatTHB(order.item.price)}
                          </Text>
                        </Flex>
                      </Card>
                    </Flex>

                    {order.statusHistory && order.statusHistory.length > 0 && (
                      <Card title={<Text strong>Order Activity</Text>}>
                        <Timeline
                          items={order.statusHistory.map((history) => {
                            const info = orderStatusInfo[history.status] || orderStatusInfo['PAY_WAITING'];
                            const formattedTime = new Date(history.timestamp).toLocaleString();
                            return {
                              content: (
                                <Flex vertical gap={2}>
                                  <Text strong>{info.label}</Text>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {formattedTime}
                                  </Text>
                                  {history.status === 'SHIPPED' && history.shippingCode && (
                                    <Flex vertical gap={4}>
                                      <Text type="secondary">
                                        Tracking Code: <Text copyable strong>{history.shippingCode}</Text>
                                      </Text>
                                      {history.deliveryUrl && (
                                        <Button
                                          type="link"
                                          href={history.deliveryUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-0 w-fit h-fit"
                                          size="small"
                                          icon={<ChevronRight size={16} />}
                                          iconPlacement="end"
                                        >
                                          Track Package
                                        </Button>
                                      )}
                                    </Flex>
                                  )}
                                  {history.status === 'REFUND_APPROVED' && order.paymentMethod === 'PROMPTPAY' && !isShopkeeper && (
                                    <Alert
                                      type="info"
                                      showIcon
                                      message="Check your email inbox (and spam folder) for the secure Stripe bank details collection form."
                                      style={{ marginTop: 8 }}
                                    />
                                  )}
                                </Flex>
                              ),
                            };
                          })}
                        />
                      </Card>
                    )}
                  </Flex>
                </Col>

                {/* Right: Actions, Summary & Shipping */}
                <Col xs={24} lg={9}>
                  <Flex vertical gap={16}>
                    {/* Action button(s) */}
                    {availableActions.length > 0 && (
                      <Flex justify="flex-end">
                        {availableActions.length === 1 ? (
                          <Button
                            type={firstAction.type}
                            color={firstAction.color}
                            variant={firstAction.variant}
                            danger={firstAction.danger}
                            disabled={firstAction.disabled}
                            icon={firstAction.icon}
                            iconPlacement={firstAction.iconPlacement}
                            onClick={firstAction.onClick}
                          >
                            {firstAction.label}
                          </Button>
                        ) : (
                          <Space.Compact>
                            <Button
                              type={firstAction.type}
                              color={firstAction.color}
                              variant={firstAction.variant}
                              danger={firstAction.danger}
                              disabled={firstAction.disabled}
                              icon={firstAction.icon}
                              iconPlacement={firstAction.iconPlacement}
                              onClick={firstAction.onClick}
                            >
                              {firstAction.label}
                            </Button>
                            <Dropdown
                              menu={{ items: dropdownItems, onClick: handleMenuClick }}
                              placement="bottomRight"
                              trigger={['click']}
                            >
                              <Button
                                type={firstAction.type}
                                color={firstAction.color}
                                variant={firstAction.variant}
                                danger={firstAction.danger}
                                icon={<ChevronDown size={16} />}
                              />
                            </Dropdown>
                          </Space.Compact>
                        )}
                      </Flex>
                    )}

                    {/* Summary */}
                    <Card
                      title={
                        <Flex align='center' gap={12}>
                          <ReceiptText size={16} className='text-blue-500' />
                          <Title level={5} className='mb-0!'>Summary</Title>
                        </Flex>
                      }
                      classNames={{
                        header: "border-b-0!",
                        body: "pt-0!"
                      }}
                    >
                      <Flex vertical gap={8}>
                        <Flex justify="space-between">
                          <Text type="secondary">Subtotal</Text>
                          <Text>{formatTHB(order.item.price)}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text type="secondary">Shipping Fee</Text>
                          <Text type="success">Free</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text type="secondary">Payment Method</Text>
                          <Text strong>
                            {getPaymentMethodInfo(order.paymentMethod || '').label}
                          </Text>
                        </Flex>
                        <Divider className="my-1!" />
                        <Flex justify="space-between" align="baseline">
                          <Text strong>Total</Text>
                          <Text strong style={{ fontSize: token.fontSizeXL, color: token.colorPrimary }}>
                            {formatTHB(order.total)}
                          </Text>
                        </Flex>
                      </Flex>
                    </Card>

                    {/* Shipping Address */}
                    {order.shippingAddress ? (
                      <CardAddress address={order.shippingAddress} />
                    ) : (
                      <Text type="secondary">Address information not available.</Text>
                    )}

                    {/* Shipping Details */}
                    {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && order.shippingCode && (
                      <Card
                        title={
                          <Flex align='center' gap={12}>
                            <Truck size={16} className='text-blue-500' />
                            <Title level={5} className='mb-0!'>Shipping Info</Title>
                          </Flex>
                        }
                        classNames={{
                          header: "border-b-0!",
                          body: "pt-0!"
                        }}
                      >
                        <Flex vertical gap={8}>
                          <Flex justify="space-between">
                            <Text type="secondary">Tracking Code:</Text>
                            <Text copyable strong>{order.shippingCode}</Text>
                          </Flex>
                          {order.deliveryUrl && (
                            <Flex justify="space-between" align="center">
                              <Text type="secondary">Tracking Link:</Text>
                              <Button
                                type="link"
                                href={order.deliveryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pr-0!"
                              >
                                Track Package <ChevronRight size={16} />
                              </Button>
                            </Flex>
                          )}
                        </Flex>
                      </Card>
                    )}
                  </Flex>
                </Col>
              </Row>
            </Card>
          </Flex>
        </>
      )}

    </>
  );
};

export default OrderDetail;