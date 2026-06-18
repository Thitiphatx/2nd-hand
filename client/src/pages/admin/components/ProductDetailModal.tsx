import React from 'react';
import { Modal, Typography, Space, Tag, Button, Row, Col, Divider } from 'antd';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatTHB } from '../../../utils/formatter';
import { productStateInfo } from '../../../utils/constant';
import type { IAdminProduct } from '../interface';
import ProductImageViewer from '../../../components/product/ProductImageViewer';

const { Text, Title, Paragraph } = Typography;

interface ProductDetailModalProps {
  open: boolean;
  onCancel: () => void;
  product: IAdminProduct | null;
  onApprove?: (id: string, name: string) => void;
  onReject?: (id: string, name: string, isDecliningPending: boolean) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  open,
  onCancel,
  product,
  onApprove,
  onReject,
}) => {
  if (!product) return null;

  return (
    <Modal
      title="Product Details"
      open={open}
      onCancel={onCancel}
      width={800}
      footer={
        product.state === 'WAIT_APPROVE' && (onReject || onApprove) ? (
          <Space>
            {onReject && (
              <Button
                danger
                icon={<XCircle size={16} />}
                onClick={() => {
                  onReject(product.id, product.name, true);
                  onCancel();
                }}
              >
                Decline
              </Button>
            )}
            {onApprove && (
              <Button
                color="green"
                variant="solid"
                icon={<CheckCircle size={16} />}
                onClick={() => {
                  onApprove(product.id, product.name);
                  onCancel();
                }}
              >
                Approve
              </Button>
            )}
          </Space>
        ) : null
      }
    >
      <Row gutter={[24, 24]} className="mt-4">
        <Col xs={24} md={10}>
          <ProductImageViewer images={product.images || []} productName={product.name} />
        </Col>
        <Col xs={24} md={14}>
          <Title level={4} className="mb-2">{product.name}</Title>
          <Text className="text-2xl font-bold text-blue-600 block mb-4">
            {formatTHB(product.price)}
          </Text>

          <Space size={4} wrap className="mb-4">
            {product.tags?.map(tag => (
              <Tag variant="outlined" key={tag}>{tag}</Tag>
            ))}
          </Space>

          <Divider className="my-4" />

          <div className="space-y-4">
            <div>
              <Text strong className="block mb-1">Description</Text>
              <Paragraph className="whitespace-pre-wrap mb-0 text-gray-600">
                {product.description || 'No description provided.'}
              </Paragraph>
            </div>

            <div>
              <Text strong className="block mb-1">Seller</Text>
              <Text>{product.shopkeeperName}</Text>
            </div>

            <div>
              <Text strong className="block mb-1">Status</Text>
              {(() => {
                const info = productStateInfo[product.state] || { label: product.state, color: 'default' };
                return (
                  <Tag variant="outlined" color={info.color}>
                    {info.label}
                  </Tag>
                );
              })()}
            </div>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default ProductDetailModal;
