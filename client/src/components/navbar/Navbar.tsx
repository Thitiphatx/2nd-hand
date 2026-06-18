import { Avatar, Button, Dropdown, Input, Layout, Space, theme, type MenuProps } from 'antd';
import { ChevronDown, LogOut, Moon, Package, Shield, Store, Sun, User } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { Header } = Layout;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { handleLogout, userData } = useAuth();
  const { token } = theme.useToken();
  const { theme: tme, toggleTheme } = useTheme();


  const menuItems: MenuProps['items'] = useMemo(() => {
    const items: MenuProps['items'] = [
      {
        label: 'Profile & Account',
        key: 'account',
        icon: <User size={16} />
      },
      {
        label: 'My Purchases',
        key: 'orders',
        icon: <Package size={16} />
      },
      {
        label: 'My Shop',
        key: 'shopkeeper/dashboard',
        icon: <Store size={16} />
      },
    ];

    if (userData?.roles?.includes('ADMIN')) {
      items.push({
        label: 'Admin Dashboard',
        key: 'admin/dashboard',
        icon: <Shield size={16} className="text-red-500" />
      });
    }

    items.push(
      {
        type: 'divider',
      },
      {
        label: tme === 'light' ? "Switch to Dark" : "Switch to Light",
        key: 'theme',
        icon: tme === 'light' ? <Moon size={16} /> : <Sun size={16} />
      },
      {
        label: 'Sign out',
        danger: true,
        key: 'logout',
        icon: <LogOut size={16} />
      }
    );

    return items;
  }, [userData, tme]);

  const handleClickLogout = useCallback(async () => {
    await handleLogout();
    window.location.reload();
  }, [handleLogout]);

  const menuOnClick: MenuProps['onClick'] = (info) => {
    if (info.key === 'logout') {
      handleClickLogout();
    } else if (info.key === 'theme') {
      toggleTheme();
    } else {
      navigate(`/${info.key}`);
    }
  };

  return (
    <Header
      style={{ backgroundColor: token.colorBgContainer, borderBottom: `1px solid ${token.colorBorderSecondary}` }}
      className="px-4 flex items-center justify-between sticky top-0 z-50 h-16"
    >
      <div className="flex items-center gap-8 flex-1">
        <Link to="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <Store size={20} />
          <span className="hidden sm:inline">2ndHandRevived</span>
        </Link>
      </div>

      <Space size="large" className="flex items-center">
        {userData && userData.id ? (
          <Dropdown menu={{ items: menuItems, onClick: menuOnClick }} trigger={['click']}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar icon={<User size={16} />} size="small" />
                {userData.name}
                <ChevronDown size={16} />
              </Space>
            </a>
          </Dropdown>
        ) : (
          <Button
            type="primary"
            icon={<User size={18} />}
            className="flex items-center"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        )}
      </Space>
    </Header >
  );
};

export default Navbar;
