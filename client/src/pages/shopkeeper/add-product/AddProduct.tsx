import {
  App,
  Breadcrumb,
  Button,
} from 'antd';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../libs/axios/axios';
import ProductForm from '../components/ProductForm';
import type { IFormAddProduct } from './interface';

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const handleProductSubmit = async (values: IFormAddProduct) => {
    try {
      const formData = new FormData();
      
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("price", (values.price || 0).toString());
      if (values.tags && values.tags.length > 0) {
        values.tags.forEach(tag => formData.append("tags", tag));
      } else {
        formData.append("tags", "");
      }
      
      if (values.images) {
        values.images.forEach(file => formData.append("images", file.originFileObj as File));
      }

      await apiClient.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      notification.success({
        title: "Product Created",
        description: "Please wait for admin approve",
      });
      navigate('/shopkeeper/dashboard?tab=products');
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };


  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { title: <a onClick={() => navigate('/')}>Home</a> },
          { title: <a onClick={() => navigate('/shopkeeper/dashboard')}>Dashboard</a> },
          { title: 'Add New Product' },
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

      <ProductForm onFinish={handleProductSubmit} />
    </div>
  );
};

export default AddProduct;
