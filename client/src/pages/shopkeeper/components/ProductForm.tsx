import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Tag,
  Typography,
  theme,
} from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import { AlertCircle, ImageUp, PackagePlus, Save, X, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IProduct } from '../../../interface';

const { Title, Text } = Typography;

interface ProductFormProps {
  isEdit?: boolean;
  initialValues?: any;
  onFinish: (values: any) => void;
  onDelete?: () => void;
  product?: IProduct | null;
}

const ProductForm: React.FC<ProductFormProps> = ({
  isEdit,
  initialValues,
  onFinish,
  onDelete,
  product,
}) => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleValuesChange = () => {
    if (isEdit && !isFormChanged) {
      setIsFormChanged(true);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
      onFinish={onFinish}
    >
      <Row gutter={[32, 32]}>
        {/* Left Column: Images Upload & Management */}
        <Col xs={24} md={12}>
          <div className="space-y-4">
            <Form.Item
              name="images"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: true, message: 'Please upload at least one image' }]}
            >
              <Dragger
                multiple
                listType="picture-card"
                maxCount={6}
                beforeUpload={() => false}
                className="w-full"
                classNames={{
                  trigger: 'mb-3',
                }}
                style={{ background: token.colorFillAlter }}
              >
                <div className="py-8">
                  <ImageUp size={48} strokeWidth={1} className="opacity-30 mx-auto mb-4" />
                  <p className="ant-upload-text">Click or drag images here</p>
                  <p className="ant-upload-hint">
                    {isEdit 
                      ? 'Add new images or remove existing ones.' 
                      : 'Up to 6 images. High quality photos help you sell faster.'}
                  </p>
                </div>
              </Dragger>
            </Form.Item>

            {isEdit && (
              <Alert
                title="Approval Required"
                description="Any changes to this product will automatically unlist it. It will require admin approval before being visible to customers again."
                type="warning"
                showIcon
                icon={<AlertCircle size={20} />}
              />
            )}
          </div>
        </Col>

        {/* Right Column: Product Info Form */}
        <Col xs={24} md={12}>
          <Card className="shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Title level={3} className="m-0">Product Details</Title>
                {isEdit && (
                  <div className="flex items-center gap-2">
                    <Text type="secondary" className="text-xs">Current Status:</Text>
                    <Tag variant="outlined" color={
                      product?.state === 'PURCHASED' ? 'blue' : 
                      product?.state === 'WAIT_APPROVE' ? 'warning' :
                      'success'
                    }>
                      {
                        product?.state === 'PURCHASED' ? 'Sold' : 
                        product?.state === 'WAIT_APPROVE' ? 'Pending Approval' :
                        'For Sale'
                      }
                    </Tag>
                  </div>
                )}
              </div>

              <Form.Item
                name="name"
                label={<Text strong>Product Name</Text>}
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="e.g. Vintage Leather Jacket" size="large" />
              </Form.Item>

              <Form.Item
                name="price"
                label={<Text strong>Price (THB)</Text>}
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  size="large"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>

              <Divider className="my-4" />

              <Form.Item
                name="description"
                label={<Text strong>Description</Text>}
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <Input.TextArea
                  rows={6}
                  placeholder="Describe your product's condition, size, and features..."
                  className="whitespace-pre-wrap"
                />
              </Form.Item>

              <Form.Item name="tags" label={<Text strong>Tags</Text>}>
                <Select
                  mode="tags"
                  placeholder="Add tags (e.g. Vintage, Leather, XL)"
                  style={{ width: '100%' }}
                  size="large"
                />
              </Form.Item>

              <Divider className="my-6" />

              <div className="flex gap-4">
                {isEdit && onDelete && (
                  <Button
                    size="large"
                    danger
                    icon={<Trash2 size={20} />}
                    className="flex-1 h-12 text-lg flex items-center justify-center"
                    onClick={onDelete}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  size="large"
                  icon={<X size={20} />}
                  className="flex-1 h-12 text-lg flex items-center justify-center"
                  onClick={() => navigate('/shopkeeper/dashboard?tab=products')}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  icon={isEdit ? <Save size={20} /> : <PackagePlus size={20} />}
                  className="flex-1 h-12 text-lg flex items-center justify-center"
                >
                  {isEdit ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default ProductForm;
