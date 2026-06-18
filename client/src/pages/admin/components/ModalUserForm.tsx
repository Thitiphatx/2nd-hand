import React, { useCallback, useEffect, useState } from 'react';
import { Form, Modal, Input, Select, Switch } from 'antd';
import apiClient from '../../../libs/axios/axios';
import type { IUser } from '../../auth/interface';

interface IModalUserFormProps {
  isOpen: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingUser?: IUser & { enabled?: boolean };
}

const ModalUserForm: React.FC<IModalUserFormProps> = ({
  isOpen,
  onCancel,
  onSuccess,
  editingUser,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleResetForm = useCallback(() => {
    if (isOpen) {
      if (editingUser) {
        form.setFieldsValue({
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          gender: editingUser.gender,
          roles: editingUser.roles,
          enabled: editingUser.enabled ?? true,
          password: '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [editingUser, form, isOpen]);

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();
      if (editingUser) {
        // Exclude blank password from update if not set
        if (!values.password) {
          delete values.password;
        }
        await apiClient.put(`/admin/users/${editingUser.id}`, values);
      } else {
        await apiClient.post('/admin/users', values);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to submit user form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, editingUser, onSuccess]);

  useEffect(() => {
    handleResetForm();
  }, [handleResetForm]);

  return (
    <Modal
      open={isOpen}
      title={editingUser ? "Edit User Account" : "Create New User Account"}
      okText={editingUser ? "Save Changes" : "Create User"}
      cancelText="Cancel"
      confirmLoading={isSubmitting}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ enabled: true, roles: ['USER'] }}
        className="mt-4"
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Please enter the user name' }]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please enter email address' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="john@example.com" disabled={!!editingUser} />
        </Form.Item>

        <Form.Item
          name="password"
          label={editingUser ? "New Password (Leave blank to keep current)" : "Password"}
          rules={[{ required: !editingUser, message: 'Please enter password' }]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
        >
          <Input placeholder="0812345678" />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Gender"
          rules={[{ required: true, message: 'Please select gender' }]}
        >
          <Select placeholder="Select Gender">
            <Select.Option value="MALE">Male</Select.Option>
            <Select.Option value="FEMALE">Female</Select.Option>
            <Select.Option value="OTHER">Other</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="roles"
          label="Account Roles"
          rules={[{ required: true, message: 'Please select at least one role' }]}
        >
          <Select mode="multiple" placeholder="Select roles">
            <Select.Option value="USER">User</Select.Option>
            <Select.Option value="ADMIN">Admin</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="enabled"
          label="Account Status (Active / Disabled)"
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Disabled" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalUserForm;
