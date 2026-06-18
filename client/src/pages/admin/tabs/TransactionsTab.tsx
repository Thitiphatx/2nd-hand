import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Tooltip,
} from 'antd';
import { Filter, Eye } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import apiClient from '../../../libs/axios/axios';
import { formatTHB, formatDateTime, getPaymentMethodInfo } from '../../../utils/formatter';
import { orderStatusInfo } from '../../../utils/constant';
import { getFullImagePath } from '../../../utils/utils';
import type { IAdminOrder } from '../interface';
import type { OrderStatus } from '../../orders/interface';

const { Text } = Typography;
const { Option } = Select;

type OrderFilter = OrderStatus | 'ALL';

const TransactionsTab: React.FC = () => {
  const { notification } = App.useApp();
  const [allOrders, setAllOrders] = useState<IAdminOrder[]>([]);
  const [orders, setOrders] = useState<IAdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IAdminOrder | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters state
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchPaymentMethod, setSearchPaymentMethod] = useState<string>('ALL');
  const [searchStatus, setSearchStatus] = useState<OrderFilter>('ALL');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get<IAdminOrder[]>('/admin/orders');
      setAllOrders(data);
      setOrders(data);

      // Reset inputs on fresh fetch
      setSearchOrderId('');
      setSearchPaymentMethod('ALL');
      setSearchStatus('ALL');
    } catch {
      notification.error({
        title: 'Failed to Load Transactions',
        description: 'An error occurred while fetching the transaction logs.',
      });
    } finally {
      setLoading(false);
    }
  }, [notification]);

  const handleApplyFilters = useCallback(() => {
    let result = [...allOrders];
    if (searchOrderId) {
      result = result.filter(o => o.id.toLowerCase().includes(searchOrderId.toLowerCase()));
    }
    if (searchPaymentMethod !== 'ALL') {
      result = result.filter(o => o.paymentMethod === searchPaymentMethod);
    }
    if (searchStatus !== 'ALL') {
      result = result.filter(o => o.status === searchStatus);
    }
    setOrders(result);
  }, [allOrders, searchOrderId, searchPaymentMethod, searchStatus]);

  const handleResetFilters = useCallback(() => {
    setSearchOrderId('');
    setSearchPaymentMethod('ALL');
    setSearchStatus('ALL');
    setOrders(allOrders);
  }, [allOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns = useMemo<ColumnsType<IAdminOrder>>(() => [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 230,
      render: (id: string) => <Text copyable className="text-xs font-mono">{id}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'purchasedDate',
      key: 'purchasedDate',
      render: (date: string) => <div className="text-xs">{date ? formatDateTime(date) : '—'}</div>,
      sorter: (a, b) =>
        new Date(a.purchasedDate ?? 0).getTime() - new Date(b.purchasedDate ?? 0).getTime(),
    },
    {
      title: 'Total (฿)',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => <Text strong className="text-blue-600">{formatTHB(total)}</Text>,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => {
        const info = getPaymentMethodInfo(method);
        return <Tag variant="outlined" color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const info = orderStatusInfo[status as keyof typeof orderStatusInfo];
        return <Tag variant="outlined" color={info?.color ?? 'default'}>{info?.label ?? status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: IAdminOrder) => (
        <Tooltip title="View Detail">
          <Button
            variant="link"
            color="primary"
            size="small"
            icon={<Eye size={16} />}
            onClick={() => setSelectedOrder(record)}
          />
        </Tooltip>
      ),
    },
  ], [getPaymentMethodInfo]);

  return (
    <>
      <Card
        title="Transaction Log"
        extra={
          <Button
            icon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
            color="default"
            variant={showFilters ? 'filled' : 'outlined'}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        }
      >
        {showFilters && (
          <Card
            title="Filters"
            size="small"
            className="mb-4!"
            classNames={{ body: "space-y-4" }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Text strong className="block mb-1 text-xs">Order ID</Text>
                <Input
                  placeholder="Search Order ID..."
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  onPressEnter={handleApplyFilters}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Text strong className="block mb-1 text-xs">Payment Method</Text>
                <Select
                  value={searchPaymentMethod}
                  onChange={setSearchPaymentMethod}
                  style={{ width: '100%' }}
                >
                  <Option value="ALL">All Methods</Option>
                  <Option value="CREDIT_CARD">Credit Card</Option>
                  <Option value="PROMPTPAY">PromptPay</Option>
                </Select>
              </Col>
              <Col xs={24} sm={8}>
                <Text strong className="block mb-1 text-xs">Status</Text>
                <Select
                  value={searchStatus}
                  onChange={setSearchStatus}
                  style={{ width: '100%' }}
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
              </Col>
            </Row>
            <div className="flex justify-end gap-2">
              <Button onClick={handleResetFilters}>Reset</Button>
              <Button type="primary" onClick={handleApplyFilters}>Apply</Button>
            </div>
          </Card>
        )}

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Order Details"
        open={!!selectedOrder}
        onCancel={() => setSelectedOrder(null)}
        footer={
          <Button type="primary" onClick={() => setSelectedOrder(null)}>
            Close
          </Button>
        }
        width={560}
      >
        {selectedOrder && (
          <div className="space-y-4 mt-2">
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Order ID" span={2}>
                <Text copyable className="font-mono text-xs">{selectedOrder.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {selectedOrder.purchasedDate ? formatDateTime(selectedOrder.purchasedDate) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                <Text strong className="text-blue-600">{formatTHB(selectedOrder.total)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Payment">
                {(() => {
                  const info = getPaymentMethodInfo(selectedOrder.paymentMethod);
                  return <Tag variant="outlined" color={info.color}>{info.label}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {(() => {
                  const info = orderStatusInfo[selectedOrder.status as keyof typeof orderStatusInfo];
                  return <Tag variant="outlined" color={info?.color ?? 'default'}>{info?.label ?? selectedOrder.status}</Tag>;
                })()}
              </Descriptions.Item>
            </Descriptions>

            {selectedOrder.shippingAddress && (
              <Card title="Shipping Address" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Recipient">
                    {selectedOrder.shippingAddress.receiverName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {selectedOrder.shippingAddress.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {[
                      selectedOrder.shippingAddress.address,
                      selectedOrder.shippingAddress.subDistrict,
                      selectedOrder.shippingAddress.district,
                      selectedOrder.shippingAddress.province,
                      selectedOrder.shippingAddress.zipcode,
                    ].filter(Boolean).join(', ')}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {selectedOrder.item && (
              <Card title="Ordered Item" size="small">
                <Space>
                  <Avatar
                    shape="square"
                    size={48}
                    src={selectedOrder.item.image ? getFullImagePath(selectedOrder.item.image) : undefined}
                  >
                    {!selectedOrder.item.image && selectedOrder.item.name?.charAt(0)}
                  </Avatar>
                  <div>
                    <Text strong>{selectedOrder.item.name}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      {formatTHB(selectedOrder.item.price)} × {selectedOrder.item.quantity}
                    </Text>
                  </div>
                </Space>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default TransactionsTab;
