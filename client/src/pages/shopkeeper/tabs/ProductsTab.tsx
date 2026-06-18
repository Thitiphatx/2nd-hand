import { Avatar, Button, Card, Space, Table, Tag, Typography, Modal, Input, Select, InputNumber, Row, Col, Form, Badge, Tooltip, App } from 'antd';
import { Edit, Filter, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IPage, IProductItem } from '../../../interface';
import apiClient from '../../../libs/axios/axios';
import { formatTHB } from '../../../utils/formatter';
import { productStateInfo } from '../../../utils/constant';
import type { ColumnsType } from 'antd/es/table';
import { getFullImagePath } from '../../../utils/utils';

const { Text } = Typography;

const ProductsTab: React.FC = () => {
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const [products, setProducts] = useState<IProductItem[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [form] = Form.useForm();
  const [appliedFilters, setAppliedFilters] = useState<{
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    state?: string;
  }>({});

  const getMyProducts = useCallback(async () => {
    try {
      const { data } = await apiClient.get<IPage<IProductItem>>('/products/my');
      setProducts(data.content);
    } catch {
      // Handle in interceptor
    }
  }, []);

  const handleDeleteProduct = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/products/${id}`);
      notification.success({ title: 'Product Unlisted', description: 'Product unlisted successfully' });
      getMyProducts();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to unlist product';
      notification.error({ title: 'Error', description: errMsg });
    }
  }, [getMyProducts, notification]);

  const handleDeleteConfirm = useCallback((record: IProductItem) => {
    Modal.confirm({
      title: 'Unlist Product',
      content: `Are you sure you want to unlist "${record.name}"? This action cannot be undone.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => handleDeleteProduct(record.id),
    });
  }, [handleDeleteProduct]);

  const pendingProducts = React.useMemo(() => {
    return products.filter(p => p.state === 'WAIT_APPROVE');
  }, [products]);

  const columns: ColumnsType<IProductItem> = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: IProductItem) => (
        <Space>
          <Avatar shape="square" src={getFullImagePath(record.image)} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Price (฿)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatTHB(price),
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      render: (state: string) => {
        const info = productStateInfo[state as keyof typeof productStateInfo] || { label: state, color: 'default' };
        return (
          <Tag variant="outlined" color={info.color} className="font-medium">
            {info.label}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: IProductItem) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              variant="link"
              color="orange"
              icon={<Edit size={16} />}
              onClick={() => navigate(`/shopkeeper/edit-product/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              variant="link"
              color="danger"
              icon={<Trash2 size={16} />}
              onClick={() => handleDeleteConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getMyProducts();
  }, [getMyProducts])

  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      if (appliedFilters.name && !p.name.toLowerCase().includes(appliedFilters.name.toLowerCase())) {
        return false;
      }
      if (appliedFilters.minPrice !== undefined && p.price < appliedFilters.minPrice) {
        return false;
      }
      if (appliedFilters.maxPrice !== undefined && p.price > appliedFilters.maxPrice) {
        return false;
      }
      if (appliedFilters.state && p.state !== appliedFilters.state) {
        return false;
      }
      return true;
    });
  }, [products, appliedFilters]);

  const handleApplyFilter = (values: any) => {
    setAppliedFilters(values);
  };

  const handleResetFilter = () => {
    form.resetFields();
    setAppliedFilters({});
  };

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <Card
        title={
          <Space>
            <span>Pending Approvals</span>
            <Badge
              count={pendingProducts.length}
              overflowCount={99}
              color="orange"
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={pendingProducts}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card
        title="Product Management"
        extra={
          <Space>
            <Button
              icon={<Filter size={16} />}
              onClick={() => setShowFilter(!showFilter)}
              color="default"
              variant={showFilter ? 'filled' : 'outlined'}
            >
              {showFilter ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              className="flex items-center"
              onClick={() => navigate('/shopkeeper/add-product')}
            >
              Add Product
            </Button>
          </Space>
        }
      >
        {showFilter && (
          <Card
            title="Filters"
            size="small"
            className="mb-4!"
            classNames={{ body: "space-y-4" }}
          >
            <Form form={form} onFinish={handleApplyFilter}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Typography.Text strong className="block mb-1 text-xs">Product Name</Typography.Text>
                  <Form.Item name="name" className="mb-0">
                    <Input placeholder="Search by name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Typography.Text strong className="block mb-1 text-xs">Price Range</Typography.Text>
                  <Space align="start">
                    <Form.Item name="minPrice" className="mb-0">
                      <InputNumber placeholder="Min" style={{ width: '100%' }} />
                    </Form.Item>
                    <Typography.Text className="leading-8">-</Typography.Text>
                    <Form.Item name="maxPrice" className="mb-0">
                      <InputNumber placeholder="Max" style={{ width: '100%' }} />
                    </Form.Item>
                  </Space>
                </Col>
                <Col xs={24} sm={8}>
                  <Typography.Text strong className="block mb-1 text-xs">Status</Typography.Text>
                  <Form.Item name="state" className="mb-0">
                    <Select
                      placeholder="Select status"
                      style={{ width: '100%' }}
                      options={[
                        { label: 'All', value: undefined },
                        { label: 'For Sale', value: 'LISTED' },
                        { label: 'Sold', value: 'PURCHASED' },
                        { label: 'Pending Approval', value: 'WAIT_APPROVE' },
                      ]}
                      allowClear
                    />
                  </Form.Item>
                </Col>
              </Row>
              <div className="flex justify-end gap-2 mt-4">
                <Button onClick={handleResetFilter}>Reset</Button>
                <Button type="primary" htmlType="submit">Apply</Button>
              </div>
            </Form>
          </Card>
        )}

        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Space>
  );
};

export default ProductsTab;

