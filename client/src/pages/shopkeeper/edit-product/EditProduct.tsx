import {
  App,
  Breadcrumb,
  Button,
  Spin,
  Typography,
  Alert,
} from 'antd';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../../libs/axios/axios';
import type { IProduct } from '../../../interface';
import { getFullImagePath } from '../../../utils/utils';
import ProductForm from '../components/ProductForm';
import type { IFormEditProduct } from './interface';

const { Text } = Typography;

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notification, modal } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [initialValues, setInitialValues] = useState<any>(null);

  const getProductDetail = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get<IProduct>(`/products/${id}`);
      setProduct(data);

      const initialImages = data.images.map((img) => ({
        uid: img,
        name: img,
        status: 'done' as const,
        url: getFullImagePath(img),
      }));

      setInitialValues({
        name: data.name,
        description: data.description,
        price: data.price,
        tags: data.tags,
        images: initialImages,
      });
    } catch (error) {
      console.error('Failed to fetch product:', error);
      notification.error({ title: 'Error', description: 'Failed to load product details' });
    } finally {
      setLoading(false);
    }
  }, [id, notification]);

  useEffect(() => {
    getProductDetail();
  }, [getProductDetail]);

  const handleProductUpdate = async (values: IFormEditProduct) => {
    try {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("price", values.price.toString());
      formData.append("state", "WAIT_APPROVE");
      if (values.tags && values.tags.length > 0) {
        values.tags.forEach(tag => formData.append("tags", tag));
      } else {
        formData.append("tags", "");
      }

      if (values.images) {
        values.images.forEach(file => {
          if (file.originFileObj) {
            formData.append("images", file.originFileObj as File);
          } else {
            formData.append("existingImages", file.name);
          }
        });
      }

      await apiClient.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      notification.success({
        title: "Product Updated",
        description: "Your product has been unlisted and submitted for re-approval.",
      });
      navigate('/shopkeeper/dashboard?tab=products');
    } catch {
      // Handle in interceptor
    }
  };

  const showConfirmModal = (values: IFormEditProduct) => {
    modal.confirm({
      title: 'Confirm Product Update',
      icon: <AlertCircle className="text-orange-500" />,
      content: (
        <div className="space-y-3 mt-4">
          <Text>Are you sure you want to save these changes?</Text>
          <Alert
            type="warning"
            showIcon
            message="This action will unlist your product and it will require admin approval again before it can be sold."
          />
        </div>
      ),
      okText: 'Confirm & Unlist',
      cancelText: 'Review Changes',
      okType: 'danger',
      onOk: () => handleProductUpdate(values),
    });
  };

  const handleDeleteProduct = () => {
    modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure you want to delete this product? This action cannot be undone.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.delete(`/products/${id}`);
          notification.success({ title: 'Success', description: 'Product deleted successfully' });
          navigate('/shopkeeper/dashboard?tab=products');
        } catch {
          notification.error({ title: 'Error', description: 'Failed to delete product' });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Spin size="large" description="Loading product..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate('/')}>Home</a> },
          { title: <a onClick={() => navigate('/shopkeeper/dashboard')}>Dashboard</a> },
          { title: 'Edit Product' },
          { title: product?.name },
        ]}
      />

      <Button
        type="text"
        icon={<ArrowLeft size={20} />}
        onClick={() => navigate(-1)}
        className="p-0 flex items-center justify-center"
      >
        Back to Dashboard
      </Button>

      <ProductForm
        isEdit
        initialValues={initialValues}
        onFinish={showConfirmModal}
        onDelete={handleDeleteProduct}
        product={product}
      />
    </div>
  );
};

export default EditProduct;
