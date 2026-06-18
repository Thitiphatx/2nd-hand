import { App, Button, Card, Col, Divider, Empty, Flex, Form, Radio, Row, Space, Spin, Tag, Tooltip, Typography, theme } from 'antd';
import { CreditCard, Edit2, MapPin, Plus, ShoppingBag, Store } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CardAddress from '../../components/payment/CardAddress';
import { useAuth } from '../../context/AuthContext';
import type { IProduct } from '../../interface';
import apiClient from '../../libs/axios/axios';
import { formatTHB } from '../../utils/formatter';
import { getFullImagePath } from '../../utils/utils';
import type { IAddress } from '../account/interface';
import ModalFormAddress from '../account/ModalFormAddress';

const { Title, Text, Paragraph } = Typography;

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const { notification } = App.useApp();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const [form] = Form.useForm();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('PROMPTPAY');

  const isHasAddress = useMemo(() => !(addresses.length === 0), [addresses.length]);

  const getProductDetail = useCallback(async () => {
    if (!productId) {
      notification.error({ title: 'Invalid Request', description: 'Product ID is missing.' });
      navigate('/');
      return;
    }
    try {
      setLoadingProduct(true);
      const { data } = await apiClient.get<IProduct>(`/products/${productId}`);
      if (data.state !== 'LISTED') {
        notification.warning({ title: 'Product Unavailable', description: 'This product has already been sold or is unavailable.' });
        navigate(`/product/${productId}`);
        return;
      }
      if (userData && data.shopkeeperId === userData.id) {
        notification.warning({ title: 'Invalid Action', description: 'You cannot buy your own product.' });
        navigate(`/product/${productId}`);
        return;
      }
      setProduct(data);
    } catch {
      navigate('/');
    } finally {
      setLoadingProduct(false);
    }
  }, [productId, navigate, notification, userData]);

  const fetchAddresses = useCallback(async () => {
    if (!userData) return;
    try {
      setLoadingAddresses(true);
      const addrRes = await apiClient.get<IAddress[]>('/users/addresses');
      const addressList = addrRes.data;
      setAddresses(addressList);
      const userRes = await apiClient.get(`/users/${userData.id}`);
      const defaultId = userRes.data.defaultAddressId;
      if (addressList.length > 0) {
        const hasDefault = addressList.find(addr => addr.id === defaultId || addr.isDefault);
        setSelectedAddressId(hasDefault ? hasDefault.id : addressList[0].id);
      } else {
        setSelectedAddressId(null);
      }
    } catch {
      // Handled in interceptor
    } finally {
      setLoadingAddresses(false);
    }
  }, [userData]);

  useEffect(() => {
    getProductDetail();
    fetchAddresses();
  }, [getProductDetail, fetchAddresses]);

  const handleOpenModal = useCallback((address?: IAddress) => {
    if (address) {
      setEditingAddress(address);
      form.setFieldsValue(address);
    } else {
      setEditingAddress(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  }, [form]);

  const handleSubmitAddNewAddress = useCallback(async (values: Omit<IAddress, 'id'>) => {
    try {
      if (addresses.length >= 5) {
        notification.error({ title: 'Limit Reached', description: 'Maximum 5 addresses allowed' });
        return;
      }
      const { data } = await apiClient.post<IAddress>('/users/addresses', values);
      notification.success({ title: 'Success', description: 'New address added successfully' });
      setIsModalOpen(false);
      form.resetFields();
      const addrRes = await apiClient.get<IAddress[]>('/users/addresses');
      setAddresses(addrRes.data);
      setSelectedAddressId(data.id);
    } catch {
      // Handled in interceptor
    }
  }, [addresses.length, notification, form]);

  const handleSubmitEditAddress = useCallback(async (values: Omit<IAddress, 'id'>) => {
    try {
      if (!editingAddress) return;
      await apiClient.put(`/users/addresses/${editingAddress.id}`, values);
      notification.success({ title: 'Success', description: 'Address updated successfully' });
      setIsModalOpen(false);
      form.resetFields();
      const addrRes = await apiClient.get<IAddress[]>('/users/addresses');
      setAddresses(addrRes.data);
    } catch {
      // Handled in interceptor
    }
  }, [editingAddress, notification, form]);

  const handlePlaceOrder = useCallback(async () => {
    if (!productId || !selectedAddressId) return;
    try {
      setPlacingOrder(true);
      const { data } = await apiClient.post('/orders', { productId, addressId: selectedAddressId, paymentMethod });
      notification.success({ title: 'Order Created Successfully', description: 'Your order has been created. Proceeding to order details.' });
      navigate(`/order/${data.id}`);
    } catch {
      // Handled in interceptor
    } finally {
      setPlacingOrder(false);
    }
  }, [productId, selectedAddressId, paymentMethod, navigate, notification]);

  if (loadingProduct || loadingAddresses) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Empty description="Product not found" />
        <Button type="primary" onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    );
  }

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  return (
    <div className="space-y-6">
      <Title level={2} className="m-0">Checkout</Title>

      <Row gutter={[24, 24]}>
        {/* Left Column */}
        <Col xs={24} md={14}>
          <div className="space-y-6!">
            {/* Shipping Address */}
            <Card
              variant="borderless"
              className="shadow-sm rounded-xl overflow-hidden"
              title={
                <Flex justify="space-between" align="center">
                  <Space>
                    <MapPin size={16} style={{ color: token.colorPrimary }} />
                    <span className="font-semibold text-sm">Shipping Address</span>
                  </Space>
                  <Button
                    variant="dashed"
                    color="default"
                    icon={<Plus size={13} />}
                    onClick={() => handleOpenModal()}
                    disabled={addresses.length >= 5}
                    hidden={!isHasAddress}
                  >
                    Add Address
                  </Button>
                </Flex>
              }
            >
              {!isHasAddress ? (
                <div className="py-8 flex flex-col items-center text-center">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text type="secondary">No shipping addresses saved. Please add one to proceed.</Text>
                    }
                  />
                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={() => handleOpenModal()}
                    className="mt-4"
                  >
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-112.5 overflow-y-auto pr-1">
                  {addresses.map(addr => {
                    const isSelected = addr.id === selectedAddressId;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        style={isSelected ? {
                          borderColor: token.colorPrimary,
                          background: token.colorPrimaryBg,
                        } : {
                          borderColor: token.colorBorderSecondary,
                        }}
                        className="p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 relative"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1 pr-10">
                            <Space align="center" className="flex-wrap">
                              <Text strong>{addr.title || 'Address'}</Text>
                              {addr.isDefault && (
                                <Tag variant="outlined" color="success" className="text-xs font-semibold uppercase">
                                  Default
                                </Tag>
                              )}
                            </Space>
                            <Text strong className="text-sm block">
                              {addr.receiverName} | {addr.phone}
                            </Text>
                            <Paragraph type="secondary" className="m-0 text-xs leading-relaxed">
                              {addr.address}, {addr.subDistrict}, {addr.district}, {addr.province} {addr.zipcode}
                            </Paragraph>
                          </div>
                          <Tooltip title="Edit">
                            <Button
                              type="text"
                              shape="circle"
                              size="small"
                              icon={<Edit2 size={14} />}
                              onClick={(e) => { e.stopPropagation(); handleOpenModal(addr); }}
                              className="absolute top-3 right-3"
                            />
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Payment Method */}
            <Card
              variant="borderless"
              className="shadow-sm rounded-xl overflow-hidden"
              title={
                <Space>
                  <CreditCard size={16} style={{ color: token.colorPrimary }} />
                  <span className="font-semibold text-sm">Payment Method</span>
                </Space>
              }
            >
              <Radio.Group
                onChange={(e) => setPaymentMethod(e.target.value)}
                value={paymentMethod}
                className="w-full flex flex-col gap-3"
              >
                {[
                  {
                    value: 'PROMPTPAY',
                    label: 'PromptPay QR Code',
                    description: 'Scan and pay instantly using any mobile banking app',
                  },
                  {
                    value: 'CREDIT_CARD',
                    label: 'Credit / Debit Card',
                    description: 'Secure payment via Visa, Mastercard, or JCB',
                  },
                ].map(option => (
                  <div
                    key={option.value}
                    onClick={() => setPaymentMethod(option.value)}
                    style={paymentMethod === option.value ? {
                      borderColor: token.colorPrimary,
                      background: token.colorPrimaryBg,
                    } : {
                      borderColor: token.colorBorderSecondary,
                    }}
                    className="p-4 rounded-lg border-2 cursor-pointer flex items-center gap-3 transition-all mb-2"
                  >
                    <Radio value={option.value} />
                    <div className="flex-1">
                      <Text strong className="text-sm block">{option.label}</Text>
                      <Text type="secondary" className="text-xs">{option.description}</Text>
                    </div>
                  </div>
                ))}
              </Radio.Group>
            </Card>
          </div>
        </Col>

        {/* Right Column: Order Summary */}
        <Col xs={24} md={10}>
          <Card
            variant="borderless"
            className="shadow-sm rounded-xl overflow-hidden"
            title={
              <Space>
                <ShoppingBag size={16} style={{ color: token.colorPrimary }} />
                <span className="font-semibold text-sm">Order Summary</span>
              </Space>
            }
          >
            {/* Product */}
            <div className="flex gap-4 mb-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0"
                style={{ border: `1px solid ${token.colorBorderSecondary}` }}
              >
                <img
                  src={getFullImagePath(product.images[0])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <Text strong className="text-sm block truncate">{product.name}</Text>
                  <Space className="mt-1">
                    <Store size={12} />
                    <Text type="secondary" className="text-xs">{product.shopkeeperName}</Text>
                  </Space>
                </div>
                <Text strong className="text-sm">{formatTHB(product.price)}</Text>
              </div>
            </div>

            {/* Deliver to preview */}
            <div className='mb-6'>
              {selectedAddress ? (
                <CardAddress address={selectedAddress} />
              ) : (
                <Text type="danger" className="text-xs font-medium">
                  Please select or add a shipping address.
                </Text>
              )}
            </div>

            <Divider className="my-3" />

            {/* Price breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text type="secondary" className="text-sm">Subtotal</Text>
                <Text className="text-sm">{formatTHB(product.price)}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary" className="text-sm">Shipping Fee</Text>
                <Text className="text-sm" style={{ color: token.colorSuccess }}>Free</Text>
              </div>
            </div>

            <Divider className="my-3" />

            <div className="flex justify-between items-baseline mb-4">
              <Text strong className="text-base">Total</Text>
              <Text strong className="text-xl" style={{ color: token.colorPrimary }}>
                {formatTHB(product.price)}
              </Text>
            </div>

            {/* Place Order */}
            <Tooltip title={!selectedAddressId ? 'Please select a shipping address to proceed' : ''}>
              <Button
                type="primary"
                size="large"
                block
                onClick={handlePlaceOrder}
                loading={placingOrder}
                disabled={!selectedAddressId}
                className="h-12 text-base font-semibold"
              >
                Place Order
              </Button>
            </Tooltip>
          </Card>
        </Col>
      </Row>

      <ModalFormAddress
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={editingAddress ? handleSubmitEditAddress : handleSubmitAddNewAddress}
        isEdit={!!editingAddress}
        form={form}
      />
    </div>
  );
};

export default Checkout;