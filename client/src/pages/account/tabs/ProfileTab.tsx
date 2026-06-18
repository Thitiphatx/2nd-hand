import { App, Button, DatePicker, Form, Input, Radio, Typography, type CheckboxOptionType } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../libs/axios/axios';
import type { IProfileUpdate } from '../interface';

const { Title } = Typography;

const ProfileTab: React.FC = () => {
  const [form] = Form.useForm();
  const { userData, handleUpdateUserData } = useAuth();
  const { notification } = App.useApp();

  const genderOptions: CheckboxOptionType[] = useMemo(() => [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
  ], []);

  const fetchProfile = useCallback(async () => {
    if (!userData?.id) return;
    try {
      const { data } = await apiClient.get(`/users/${userData.id}`);
      form.setFieldsValue({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        gender: data.gender || 'MALE',
        birth: data.birth ? dayjs(data.birth) : null,
      });
    } catch {
      // Handle in interceptor
    }
  }, [form, userData]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const initialValues = useMemo(() => {
    return {
      name: userData?.name,
      email: userData?.email,
      phone: userData?.phone || '',
      gender: userData?.gender || 'MALE',
      birth: userData?.birth ? dayjs(userData.birth) : null,
    };
  }, [userData]);

  const handleSubmit = useCallback(async (values: IProfileUpdate) => {
    try {
      if (!userData?.id) return;

      const { data } = await apiClient.put(`/users/${userData.id}`, {
        ...values,
        birth: values.birth ? values.birth.format('YYYY-MM-DD') : null
      });

      if (handleUpdateUserData) {
        handleUpdateUserData({
          ...data,
          token: userData.token
        });
      }

      notification.success({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch {
      // Handle in interceptor
    }
  }, [userData, handleUpdateUserData, notification]);

  return (
    <div>
      <div className="mb-6">
        <Title level={4}>Profile Information</Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
        size="large"
        requiredMark="optional"
      >
        <Form.Item
          label="Full Name"
          name="name"
          rules={[
            { required: true, message: 'Please input your name' },
            { min: 4, message: 'Name must be at least 4 characters long' },
            { max: 255, message: 'Name cannot exceed 255 characters' },
            {
              pattern: /^[\p{L}\s]+$/u,
              message: 'Name must not contain numbers or special characters',
            },
          ]}
        >
          <Input placeholder="Your full name" />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[
            {
              validator(_, value) {
                if (!value) return Promise.resolve();
                if (value.length < 9) {
                  return Promise.reject(new Error('Phone number must be at least 9 digits'));
                }
                if (value.length > 11) {
                  return Promise.reject(new Error('Phone number cannot exceed 11 digits'));
                }
                if (!/^[0-9]+$/.test(value)) {
                  return Promise.reject(new Error('Phone number must contain only numbers'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Your phone number" />
        </Form.Item>

        <Form.Item
          label="Gender"
          name="gender"
        >
          <Radio.Group options={genderOptions} />
        </Form.Item>

        <Form.Item
          label="Birth Date"
          name="birth"
          rules={[
            {
              validator(_, value) {
                if (!value) return Promise.resolve();
                const oneYearAgo = dayjs().subtract(1, 'year');
                if (!value.isBefore(oneYearAgo)) {
                  return Promise.reject(new Error('Birth date must be more than 1 year in the past'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item className="mt-8">
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProfileTab;
