import { App, Button, Card, Form, Masonry, Typography, Spin, Dropdown, Tooltip } from 'antd';
import { Edit2, MapPin, Plus, Trash2, MoreVertical } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import type { IAddress } from '../interface';
import ModalFormAddress from '../ModalFormAddress';
import apiClient from '../../../libs/axios/axios';
import { useAuth } from '../../../context/AuthContext';

const { Title, Text } = Typography;

const AddressTab: React.FC = () => {
  const { notification, modal } = App.useApp();
  const { userData } = useAuth();
  const [form] = Form.useForm();
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [defaultAddressId, setDefaultAddressId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/addresses');
      setAddresses(response.data);
    } catch {
      // Handle in interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserDetail = useCallback(async () => {
    if (!userData) return;
    try {
      const { data } = await apiClient.get(`/users/${userData.id}`);
      setDefaultAddressId(data.defaultAddressId);
    } catch {
      // Handle in interceptor
    }
  }, [userData])

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

  const handleSubmitAddNewAddress = useCallback(async (values: IAddress) => {
    try {
      if (addresses.length >= 5) {
        notification.error({
          title: 'Limit Reached',
          description: 'Maximum 5 addresses allowed'
        });
        return;
      }

      await apiClient.post('/users/addresses', values);
      notification.success({
        title: 'Success',
        description: 'New address added successfully'
      });
      setIsModalOpen(false);
      form.resetFields();
      fetchAddresses();
    } catch {
      // Handle in interceptor
    }
  }, [addresses.length, notification, fetchAddresses, form]);

  const handleSubmitEditAddress = useCallback(async (values: IAddress) => {
    try {
      if (!editingAddress) return;

      await apiClient.put(`/users/addresses/${editingAddress.id}`, values);

      notification.success({
        title: 'Success',
        description: 'Address updated successfully'
      });
      setIsModalOpen(false);
      form.resetFields();
      fetchAddresses();
    } catch {
      // Handle in interceptor
    }
  }, [editingAddress, notification, fetchAddresses, form]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/users/addresses/${id}`);
      notification.success({
        title: 'Deleted',
        description: 'Address has been removed'
      });
      fetchAddresses();
      fetchUserDetail();
    } catch {
      // Handle in interceptor
    }
  }, [notification, fetchAddresses, fetchUserDetail]);

  const confirmDeleteAddress = useCallback((id: string) => {
    modal.confirm({
      title: 'Delete Address',
      content: 'Are you sure you want to delete this shipping address?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => handleDelete(id),
    });
  }, [modal, handleDelete]);

  const handleSetDefault = useCallback(async (id: string) => {
    try {
      await apiClient.put(`/users/addresses/${id}/default`);
      notification.success({
        title: 'Default Updated',
        description: 'Default shipping address has been changed'
      });
      fetchAddresses();
      fetchUserDetail();
    } catch {
      // Handle in interceptor
    }
  }, [notification, fetchAddresses, fetchUserDetail]);

  useEffect(() => {
    fetchAddresses();
    fetchUserDetail();
  }, [fetchAddresses, fetchUserDetail]);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-6">
            <div>
              <Title level={4} className="m-0">Shipping Addresses</Title>
              <Text type="secondary">Manage your delivery locations</Text>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={() => handleOpenModal()}
                disabled={addresses.length >= 5}
              >
                Add New Address
              </Button>
              <div className="flex items-center gap-1.5 mr-1 select-none">
                <span className={`h-2 w-2 rounded-full ${addresses.length >= 5 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className={`text-xs font-semibold ${addresses.length >= 5 ? 'text-red-500' : 'text-gray-500'}`}>
                  {addresses.length}/5 addresses
                </span>
              </div>
            </div>
          </div>

          <Masonry
            columns={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
            gutter={16}
            items={addresses.map(addr => ({ key: addr.id, data: addr }))}
            itemRender={(itemInfo) => {
              const address = itemInfo.data;
              const isDefault = address.id === defaultAddressId || address.isDefault;
              const menuItems = [
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: <Edit2 size={14} />,
                  onClick: () => handleOpenModal(address),
                },
                ...(!isDefault ? [{
                  key: 'default',
                  label: 'Set Default',
                  onClick: () => handleSetDefault(address.id),
                }] : []),
                {
                  type: 'divider' as const,
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  danger: true,
                  icon: <Trash2 size={14} />,
                  onClick: () => confirmDeleteAddress(address.id),
                },
              ];

              return (
                <Card
                  className={`relative hover:border-primary transition-all duration-300 ${
                    isDefault 
                      ? 'border-2 border-emerald-500 bg-emerald-500/3 shadow-md shadow-emerald-500/5' 
                      : 'hover:shadow-sm'
                  }`}
                >
                  <div className="absolute top-4 right-4 z-10">
                    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                      <Button
                        type="text"
                        shape="circle"
                        icon={<MoreVertical size={16} className="text-gray-500" />}
                      />
                    </Dropdown>
                  </div>

                  <div className="flex gap-3 pr-6">
                    <Tooltip title={isDefault ? "Default shipping address" : "Green pin indicates default shipping address"}>
                      <MapPin 
                        size={20} 
                        className={`mt-1 shrink-0 cursor-help ${isDefault ? 'text-emerald-500' : 'text-gray-400'}`} 
                      />
                    </Tooltip>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 mb-2 pr-2">
                        <Text strong className="text-lg truncate">
                          {address.title || 'Address'}
                        </Text>
                      </div>
                      <Text strong className="block">{address.receiverName} | {address.phone}</Text>
                      <Text type="secondary" className="block mt-1 truncate">
                        {address.address}, {address.subDistrict}, {address.district}, {address.province} {address.zipcode}
                      </Text>
                    </div>
                  </div>
                </Card>
              );
            }}
          />

          <ModalFormAddress
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            onSubmit={editingAddress ? handleSubmitEditAddress : handleSubmitAddNewAddress}
            isEdit={!!editingAddress}
            form={form}
          />
        </>
      )}
    </div>
  );
};

export default AddressTab;
