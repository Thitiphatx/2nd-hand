import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme, App as AntApp, Spin } from 'antd';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { lazy, Suspense } from 'react';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Notification from './libs/Notification';
import FloatingChat from './components/chat/FloatingChat';

const Home = lazy(() => import('./pages/home/Home'));
const ProductDetail = lazy(() => import('./pages/product-detail/ProductDetail'));
const Shop = lazy(() => import('./pages/shop/Shop'));
const ShopkeeperDashboard = lazy(() => import('./pages/shopkeeper/ShopkeeperDashboard'));
const AddProduct = lazy(() => import('./pages/shopkeeper/add-product/AddProduct'));
const EditProduct = lazy(() => import('./pages/shopkeeper/edit-product/EditProduct'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Orders = lazy(() => import('./pages/orders/Orders'));
const OrderDetail = lazy(() => import('./pages/orders/OrderDetail'));
const Account = lazy(() => import('./pages/account/Account'));
const Checkout = lazy(() => import('./pages/checkout/Checkout'));
const Payment = lazy(() => import('./pages/payment/Payment'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

const AppContent: React.FC = () => {
  const { theme: currentTheme } = useTheme();
  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb', // blue-600
        },
      }}
    >
      <AntApp>
        <Notification />
        <Router>
          <MainLayout>
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <Spin size="large" description="Loading page..." />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/shop/:id" element={<Shop />} />
                <Route path="/shopkeeper/dashboard" element={<ShopkeeperDashboard />} />
                <Route path="/shopkeeper/add-product" element={<AddProduct />} />
                <Route path="/shopkeeper/edit-product/:id" element={<EditProduct />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/order/:id" element={<OrderDetail />} />
                <Route path="/account" element={<Account />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment/:id" element={<Payment />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
            </Suspense>
          </MainLayout>
          <FloatingChat />
        </Router>
      </AntApp>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
