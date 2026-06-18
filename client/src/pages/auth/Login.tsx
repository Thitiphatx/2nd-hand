import { Button, Card, Form, Input, Typography } from 'antd';
import { Lock, User } from 'lucide-react';
import React, { useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPasswordRules } from '../../utils/validation';
import type { ILoginValues } from './interface';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const { handleLogin, userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      navigate("/");
    }
  }, [userData, navigate]);

  const handleSubmit = useCallback(async (values: ILoginValues) => {
    const success = await handleLogin(values);
    if (success) {
      navigate("/");
    } else {
      form.setFields([
        {
          name: 'email',
          errors: ['Incorrect email or password'],
        },
        {
          name: 'password',
          errors: ['Incorrect email or password'],
        }
      ]);
    }
  }, [handleLogin, navigate, form])

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full shadow-md">
        <div className="text-center mb-8">
          <Title level={2} className="m-0">Welcome Back</Title>
          <Text type="secondary">Login to your account to continue</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          initialValues={{
            email: 'thitiphat6391@gmail.com',
            password: '456456',
          }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your Email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<User size={18} className="text-gray-400" />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={getPasswordRules('Please input your Password!', false)}
          >
            <Input.Password
              prefix={<Lock size={18} className="text-gray-400" />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full h-12 text-lg">
              Log in
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center">
          <Text type="secondary">Don't have an account? </Text>
          <Link to="/register">Register now</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
