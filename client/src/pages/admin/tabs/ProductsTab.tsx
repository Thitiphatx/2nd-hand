import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  App,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Tooltip,
  Form,
} from 'antd';
import { CheckCircle, Filter, Trash2, XCircle, Eye } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import apiClient from '../../../libs/axios/axios';
import { formatTHB } from '../../../utils/formatter';
import { productStateInfo } from '../../../utils/constant';
import { getFullImagePath } from '../../../utils/utils';
import type { IAdminProduct } from '../interface';
import type { ProductState } from '../../../interface';
import ProductDetailModal from '../components/ProductDetailModal';

const { Text } = Typography;
const { Option } = Select;

type ProductFilter = ProductState | 'ALL';

interface FilterValues {
  searchName?: string;
  searchShopkeeper?: string;
  searchStatus?: string;
  searchSort?: string;
}

const ProductsTab: React.FC = () => {
  const { notification, modal } = App.useApp();
  const [form] = Form.useForm<FilterValues>();
  const [allProducts, setAllProducts] = useState<IAdminProduct[]>([]);
  const [products, setProducts] = useState<IAdminProduct[]>([]);
  const [pendingProducts, setPendingProducts] = useState<IAdminProduct[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IAdminProduct | null>(null);

  const fetchPendingProducts = useCallback(async () => {
    try {
      setLoadingPending(true);
      const { data } = await apiClient.get<IAdminProduct[]>('/admin/products', { params: { state: 'WAIT_APPROVE' } });
      setPendingProducts(data);
    } catch {
      notification.error({
        title: 'Failed to Load Pending Approvals',
        description: 'An error occurred while fetching products pending approval.',
      });
    } finally {
      setLoadingPending(false);
    }
  }, [notification]);

  const fetchCatalogProducts = useCallback(async (sortParam?: string) => {
    try {
      setLoadingCatalog(true);
      const params: any = {};
      if (sortParam) params.sort = sortParam;
      const { data } = await apiClient.get<IAdminProduct[]>('/admin/products', { params });
      const filteredData = data.filter((p) => p.state !== 'WAIT_APPROVE');
      setAllProducts(filteredData);
      return filteredData;
    } catch {
      notification.error({
        title: 'Failed to Load Products',
        description: 'An error occurred while fetching the product list.',
      });
      return [];
    } finally {
      setLoadingCatalog(false);
    }
  }, [notification]);

  const handleApplyFilters = useCallback(async (values: FilterValues) => {
    const fetched = await fetchCatalogProducts(values.searchSort);
    let result = [...fetched];
    if (values.searchName) {
      result = result.filter(p => p.name.toLowerCase().includes(values.searchName!.toLowerCase()));
    }
    if (values.searchShopkeeper) {
      result = result.filter(p => p.shopkeeperName.toLowerCase().includes(values.searchShopkeeper!.toLowerCase()));
    }
    if (values.searchStatus && values.searchStatus !== 'ALL') {
      result = result.filter(p => p.state === values.searchStatus);
    }
    setProducts(result);
  }, [fetchCatalogProducts]);

  const handleResetFilters = useCallback(async () => {
    form.resetFields();
    const fetched = await fetchCatalogProducts('');
    setProducts(fetched);
  }, [fetchCatalogProducts, form]);

  const refreshAll = useCallback(() => {
    fetchPendingProducts();
    handleApplyFilters(form.getFieldsValue());
  }, [fetchPendingProducts, handleApplyFilters, form]);

  const handleApprove = useCallback((productId: string, productName: string) => {
    modal.confirm({
      title: 'Approve Product',
      content: `Are you sure you want to approve "${productName}"? It will be listed on the marketplace.`,
      okText: 'Approve',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await apiClient.put(`/admin/products/${productId}/approve`);
          notification.success({
            title: 'Product Approved',
            description: `"${productName}" has been successfully approved and listed.`,
          });
          refreshAll();
        } catch {
          notification.error({
            title: 'Approval Failed',
            description: `Failed to approve "${productName}".`,
          });
        }
      }
    });
  }, [modal, notification, refreshAll]);

  const handleReject = useCallback((productId: string, productName: string, isDecliningPending: boolean) => {
    modal.confirm({
      title: isDecliningPending ? 'Decline Product' : 'Delete Product',
      content: isDecliningPending
        ? `Are you sure you want to decline the approval request for "${productName}"?`
        : `Are you sure you want to permanently delete "${productName}"?`,
      okText: isDecliningPending ? 'Decline' : 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.put(`/admin/products/${productId}/reject`);
          notification.success({
            title: isDecliningPending ? 'Product Declined' : 'Product Deleted',
            description: isDecliningPending
              ? `The approval request for "${productName}" has been declined.`
              : `"${productName}" has been successfully deleted.`,
          });
          refreshAll();
        } catch {
          notification.error({
            title: isDecliningPending ? 'Decline Failed' : 'Deletion Failed',
            description: `Failed to process request for "${productName}".`,
          });
        }
      }
    });
  }, [modal, notification, refreshAll]);

  const handleViewDetails = useCallback((product: IAdminProduct) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  }, []);

  const pendingColumns = useMemo<ColumnsType<IAdminProduct>>(() => [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <Space>
          <Avatar
            shape="square"
            size={40}
            src={record.images?.[0] ? getFullImagePath(record.images[0]) : undefined}
          >
            {!record.images?.[0] && record.name?.charAt(0)}
          </Avatar>
          <div>
            <Text strong className="block text-sm leading-tight">{record.name}</Text>
            <Text type="secondary" className="text-xs">by {record.shopkeeperName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Price (฿)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatTHB(price),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space size={4} wrap>
          {tags?.slice(0, 3).map((tag) => <Tag variant="outlined" key={tag}>{tag}</Tag>)}
          {(tags?.length ?? 0) > 3 && <Tag variant="outlined">+{tags.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              variant="link"
              color="primary"
              size="small"
              icon={<Eye size={16} />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Approve">
            <Button
              variant="link"
              color="green"
              size="small"
              icon={<CheckCircle size={16} />}
              onClick={() => handleApprove(record.id, record.name)}
            />
          </Tooltip>
          <Tooltip title="Decline">
            <Button
              variant="link"
              color="danger"
              size="small"
              icon={<XCircle size={16} />}
              onClick={() => handleReject(record.id, record.name, true)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [handleApprove, handleReject, handleViewDetails]);

  const catalogColumns = useMemo<ColumnsType<IAdminProduct>>(() => [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <Space>
          <Avatar
            shape="square"
            size={40}
            src={record.images?.[0] ? getFullImagePath(record.images[0]) : undefined}
          >
            {!record.images?.[0] && record.name?.charAt(0)}
          </Avatar>
          <div>
            <Text strong className="block text-sm leading-tight">{record.name}</Text>
            <Text type="secondary" className="text-xs">by {record.shopkeeperName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Price (฿)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatTHB(price),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space size={4} wrap>
          {tags?.slice(0, 3).map((tag) => <Tag variant="outlined" key={tag}>{tag}</Tag>)}
          {(tags?.length ?? 0) > 3 && <Tag variant="outlined">+{tags.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'state',
      key: 'state',
      render: (state: ProductState) => {
        const info = productStateInfo[state];
        return <Tag variant="outlined" color={info?.color} className="font-medium">{info?.label ?? state}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              variant="link"
              color="primary"
              size="small"
              icon={<Eye size={16} />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              variant="link"
              color="danger"
              size="small"
              icon={<Trash2 size={16} />}
              onClick={() => handleReject(record.id, record.name, false)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [handleApprove, handleReject, handleViewDetails]);

  useEffect(() => {
    refreshAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          columns={pendingColumns}
          dataSource={pendingProducts}
          rowKey="id"
          loading={loadingPending}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card
        title="Product Catalog"
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
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={handleApplyFilters} 
              initialValues={{ searchStatus: 'ALL', searchSort: '' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={6}>
                  <Form.Item name="searchName" label={<Text strong className="text-xs">Product Name</Text>} className="mb-0">
                    <Input placeholder="Search product name..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6}>
                  <Form.Item name="searchShopkeeper" label={<Text strong className="text-xs">Shopkeeper Name</Text>} className="mb-0">
                    <Input placeholder="Search shopkeeper..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6}>
                  <Form.Item name="searchStatus" label={<Text strong className="text-xs">Status</Text>} className="mb-0">
                    <Select style={{ width: '100%' }}>
                      <Option value="ALL">All Status</Option>
                      <Option value="LISTED">Listed</Option>
                      <Option value="PURCHASED">Purchased</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={6}>
                  <Form.Item name="searchSort" label={<Text strong className="text-xs">Sort By</Text>} className="mb-0">
                    <Select style={{ width: '100%' }}>
                      <Option value="">None</Option>
                      <Option value="price_asc">Price (Low to High)</Option>
                      <Option value="price_desc">Price (High to Low)</Option>
                      <Option value="name_asc">Name (A-Z)</Option>
                      <Option value="name_desc">Name (Z-A)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <div className="flex justify-end gap-2 mt-4">
                <Button onClick={handleResetFilters}>Reset</Button>
                <Button type="primary" htmlType="submit">Apply</Button>
              </div>
            </Form>
          </Card>
        )}

        <Table
          columns={catalogColumns}
          dataSource={products}
          rowKey="id"
          loading={loadingCatalog}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <ProductDetailModal
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </Space>
  );
};

export default ProductsTab;
