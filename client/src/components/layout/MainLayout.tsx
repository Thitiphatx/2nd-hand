import React from 'react';
import { Layout, theme } from 'antd';
import Navbar from '../navbar/Navbar';

const { Content, Footer } = Layout;

interface IMainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<IMainLayoutProps> = ({ children }) => {
  const { token } = theme.useToken();

  return (
    <Layout className="min-h-screen!" style={{ backgroundColor: token.colorBgLayout }}>
      <Navbar />
      <Content className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </Content>
      <Footer
        style={{ backgroundColor: token.colorBgContainer, borderTop: `1px solid ${token.colorBorderSecondary}` }}
        className="text-center py-8"
      >
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium" style={{ color: token.colorTextSecondary }}>2ndHandRevived ©{new Date().getFullYear()}</p>
          <p className="text-sm mt-2" style={{ color: token.colorTextTertiary }}>The best place to find and sell second-hand treasures.</p>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
