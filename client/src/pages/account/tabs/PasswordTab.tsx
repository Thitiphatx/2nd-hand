import { App, Button, Form, Input, Typography } from 'antd';
import { Lock } from 'lucide-react';
import React, { useCallback } from 'react';
import type { IPasswordUpdate } from '../interface';
import { useAuth } from '../../../context/AuthContext';
import { getPasswordRules, getConfirmPasswordRules } from '../../../utils/validation';
import apiClient from '../../../libs/axios/axios';

const { Title, Text } = Typography;

const PasswordTab: React.FC = () => {
  const { userData } = useAuth();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const handleSubmit = useCallback(async (values: IPasswordUpdate) => {
    try {
      if (!userData?.id) return;

      await apiClient.put(`/users/${userData.id}/change-password`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      notification.success({
        title: 'Success',
        description: 'Password updated successfully'
      });
    } catch {
      // Handle in interceptor
    } finally {
      form.resetFields();
    }
  }, [userData, form, notification]);

  return (
    <div>
      <div className="mb-6">
        <Title level={4}>Change Password</Title>
        <Text type="secondary">Update your password to keep your account secure</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
      >
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: 'Please input your current password' }]}
        >
          <Input.Password
            prefix={<Lock size={18} className="text-gray-400" />}
            placeholder="Enter your current password"
          />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={getPasswordRules('Please input your new password')}
        >
          <Input.Password
            prefix={<Lock size={18} className="text-gray-400" />}
            placeholder="Enter your new password (min. 6 characters)"
          />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={getConfirmPasswordRules('newPassword', 'Please confirm your new password')}
        >
          <Input.Password
            prefix={<Lock size={18} className="text-gray-400" />}
            placeholder="Confirm your new password"
          />
        </Form.Item>

        <Form.Item className="mt-8">
          <Button type="primary" htmlType="submit">
            Update Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PasswordTab;
