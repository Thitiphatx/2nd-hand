import { Avatar, Breadcrumb, Button, Card, Col, Divider, Row, Space, Tag, theme, Typography } from 'antd';
import { ShoppingCart, Store, MessageSquare, Edit } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { IProduct } from '../../interface';
import apiClient from '../../libs/axios/axios';
import { formatDateTime } from '../../utils/formatter';
import { getFullImagePath } from '../../utils/utils';
import ProductImageViewer from '../../components/product/ProductImageViewer';

const { Title, Text, Paragraph } = Typography;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [product, setProduct] = useState<IProduct | null>(null);

  const isShopkeeper = useMemo(() => userData?.id == product?.shopkeeperId, [product?.shopkeeperId, userData?.id])

  const getProductDetail = useCallback(async () => {
    try {
      const { data } = await apiClient.get<IProduct>(`/products/${id}`);
      setProduct(data);
    } catch {
      // Handle in interceptor
    }
  }, [id]);

  const handleBuyProduct = useCallback(() => {
    navigate(`/checkout?productId=${id}`);
  }, [id, navigate]);

  useEffect(() => {
    getProductDetail();
  }, [getProductDetail]);

  return product ? (
    <div className="space-y-6!">
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate('/')}>Product List</a> },
          { title: product.name },
        ]}
      />
      <Row gutter={[32, 32]}>
        {/* Left Column: Image Gallery */}
        <Col xs={24} md={12}>
          <ProductImageViewer images={product.images} productName={product.name} />
        </Col>

        {/* Right Column: Product Info */}
        <Col xs={24} md={12} className='space-y-8!'>
          <Card>
            <div className="space-y-4">
              <Title level={2} className="m-0">{product.name}</Title>

              <Divider className="my-4" />

              <div>
                <Text strong className="block mb-2 text-lg">Description</Text>
                <Paragraph
                  style={{ color: token.colorTextSecondary }}
                  className="leading-relaxed whitespace-pre-wrap"
                >
                  {product.description}
                </Paragraph>
              </div>

              <div>
                <Text strong className="block mb-2">Tags</Text>
                <Space wrap>
                  {product.tags.map(tag => (
                    <Tag variant="outlined" key={tag} color="blue">{tag}</Tag>
                  ))}
                </Space>
              </div>

              <Divider className="my-4" />

              <div className="pt-4 flex flex-col gap-4">
                {isShopkeeper && (
                  <Button
                    size="large"
                    icon={<Edit size={20} />}
                    onClick={() => navigate(`/shopkeeper/edit-product/${id}`)}
                  >
                    Edit Product
                  </Button>
                )}
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCart size={20} />}
                  onClick={handleBuyProduct}
                  disabled={(product.state || 'LISTED') !== 'LISTED' || isShopkeeper}
                >
                  {isShopkeeper ? 'Your Own Product' : (product.state || 'LISTED') === 'LISTED' ? 'Buy Now' : product.state === 'PURCHASED' ? 'Sold Out' : 'Unavailable'}
                </Button>
                {(product.state || 'LISTED') !== 'LISTED' && (
                  <Text type="danger" className="text-center">
                    This product is currently {product.state === 'PURCHASED' ? 'sold out' : 'unavailable'}.
                  </Text>
                )}
              </div>

              <Text type="secondary" className="text-xs block text-center mt-2">
                Listed on {formatDateTime(product.createdDate)}
              </Text>
            </div>
          </Card>
          <Card
            classNames={{
              body: 'flex flex-row justify-between items-center w-full'
            }}
          >
            <div className="flex items-center gap-3">
              <Avatar
                icon={<Store size={18} />}
                className='bg-blue-500!'
              />
              <div>
                <Text strong className="block">{product.shopkeeperName}</Text>
                <Text type="secondary" className="text-xs">Joined 2 years ago</Text>
              </div>
            </div>
            <Space>
              <Button onClick={() => navigate(`/shop/${product.shopkeeperId}`)}>Visit Shop</Button>
              <Button 
                type="primary" 
                icon={<MessageSquare size={16} />}
                onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { 
                  detail: { userId: product.shopkeeperId, userName: product.shopkeeperName } 
                }))}
                disabled={isShopkeeper}
              >
                Chat
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  ) : (
    <div>Loading</div>
  );
};

export default ProductDetail;
