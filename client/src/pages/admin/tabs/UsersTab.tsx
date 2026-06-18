import React, { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  App,
} from 'antd';
import { Edit, Plus, Trash2 } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import apiClient from '../../../libs/axios/axios';
import ModalUserForm from '../components/ModalUserForm';
import type { IAdminUser } from '../interface';

const { Text } = Typography;

const UsersTab: React.FC = () => {
  const { notification } = App.useApp();
  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IAdminUser | undefined>(undefined);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = search.trim() ? { search: search.trim() } : {};
      const { data } = await apiClient.get<IAdminUser[]>('/admin/users', { params });
      setUsers(data);
    } catch {
      notification.error({ title: 'Error', description: 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  }, [search, notification]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      notification.success({ title: 'User Deleted', description: 'User has been removed.' });
      fetchUsers();
    } catch {
      notification.error({ title: 'Error', description: 'Failed to delete user.' });
    }
  }, [fetchUsers, notification]);



  const handleOpenEdit = useCallback((user: IAdminUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  }, []);

  const handleOpenAdd = useCallback(() => {
    setEditingUser(undefined);
    setIsFormOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    setEditingUser(undefined);
    notification.success({ title: 'User Saved', description: 'User changes have been saved.' });
    fetchUsers();
  }, [fetchUsers, notification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns: ColumnsType<IAdminUser> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar size="small">{record.name?.charAt(0).toUpperCase()}</Avatar>
          <div>
            <Text strong className="block text-sm leading-tight">{record.name}</Text>
            <Text type="secondary" className="text-xs">{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => <Text type="secondary">{phone || '—'}</Text>,
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <Space size={4}>
          {roles.map((role) => (
            <Tag variant="outlined" key={role} color={role === 'ADMIN' ? 'red' : 'blue'} className="font-medium">
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Badge status={enabled ? 'success' : 'default'} text={enabled ? 'Active' : 'Disabled'} />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button variant="link" color="warning" icon={<Edit size={16} />} onClick={() => handleOpenEdit(record)} />
          </Tooltip>

          <Tooltip title="Delete">
            <Button
              variant="link"
              color="danger"
              icon={<Trash2 size={16} />}
              onClick={() => handleDeleteUser(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="User Management"
        extra={
          <Button type="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
            Add User
          </Button>
        }
      >
        <div className="mb-4">
          <Input.Search
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={fetchUsers}
            allowClear
            style={{ width: 300 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <ModalUserForm
        isOpen={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editingUser={editingUser}
      />
    </>
  );
};

export default UsersTab;
