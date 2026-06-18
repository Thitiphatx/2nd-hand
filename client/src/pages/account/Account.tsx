import { Card, Tabs, Typography } from 'antd';
import { User, MapPin, ShieldCheck } from 'lucide-react';
import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProfileTab from './tabs/ProfileTab';
import AddressTab from './tabs/AddressTab';
import PasswordTab from './tabs/PasswordTab';

const { Title, Text } = Typography;

const Account: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleTabChange = useCallback((key: string) => {
    setSearchParams({ tab: key });
  }, [setSearchParams]);

  const tabParam = searchParams.get('tab');
  const activeTab = ['profile', 'address', 'password'].includes(tabParam || '') ? (tabParam as string) : 'profile';

  const items = [
    {
      key: 'profile',
      label: (
        <span className="flex items-center gap-2">
          <User size={16} />
          Profile
        </span>
      ),
      children: <ProfileTab />,
    },
    {
      key: 'address',
      label: (
        <span className="flex items-center gap-2">
          <MapPin size={16} />
          Address
        </span>
      ),
      children: <AddressTab />,
    },
    {
      key: 'password',
      label: (
        <span className="flex items-center gap-2">
          <ShieldCheck size={16} />
          Password
        </span>
      ),
      children: <PasswordTab />,
    },
  ];

  return (
    <div className="py-8 px-4">
      <div className="mb-6">
        <Title level={2} className="m-0">Account Settings</Title>
        <Text type="secondary">Manage your profile, addresses, and security</Text>
      </div>

      <Card className="shadow-sm" styles={{ body: { padding: '24px' } }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={items}
          size="large"
          tabPlacement='start'
          classNames={{
            item: "pl-0!",
          }}
        />
      </Card>
    </div>
  );
};

export default Account;
