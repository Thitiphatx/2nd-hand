import { Button, Card, DatePicker, Divider, Form, Input, Radio, Typography, type CheckboxOptionType } from 'antd';
import { Lock, User } from 'lucide-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import { getPasswordRules, getConfirmPasswordRules } from '../../utils/validation';
import apiClient from '../../libs/axios/axios';
import type { IFormRegister } from './interface';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const { handleUpdateUserData, userData } = useAuth();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const genderOptions: CheckboxOptionType[] = useMemo(() => [
    {
      value: 'MALE',
      label: 'Male',
    },
    {
      value: 'FEMALE',
      label: 'Female',
    },
    {
      value: 'OTHER',
      label: 'Other',
    },
  ], []);

  const handleSubmit = useCallback(async (values: IFormRegister) => {
    try {
      const { data } = await apiClient.post('/auth/register', {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        gender: values.gender,
        birth: values.birth.format('YYYY-MM-DD'),
      });
      await handleUpdateUserData(data);
      navigate("/");
    } catch {
      // Handle in interceptor
    }
  }, [handleUpdateUserData, navigate]);

  useEffect(() => {
    if (userData) {
      navigate("/");
    }
  }, [userData, navigate]);

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full shadow-md">
        <div className="text-center mb-8">
          <Title level={2} className="m-0">Create Account</Title>
          <Text type="secondary">Join 2ndHandRevived marketplace today</Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          initialValues={{ roles: 'CUSTOMER' }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email' },
              { type: 'email', message: 'Email is not valid' }
            ]}
          >
            <Input prefix={<User size={18} className="text-gray-400" />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={getPasswordRules('Please input your Password!')}
          >
            <Input.Password
              prefix={<Lock size={18} className="text-gray-400" />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={getConfirmPasswordRules('password', 'Please confirm your password')}
          >
            <Input.Password
              prefix={<Lock size={18} className="text-gray-400" />}
              placeholder="Confirm Password"
            />
          </Form.Item>

          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Please input your account name!' }
            ]}
          >
            <Input placeholder="Account Name" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Please input your phone number!' },
              { pattern: /^[0-9]{9,10}$/, message: 'Phone number must be 9-10 digits!' }
            ]}
          >
            <Input placeholder="Phone number" />
          </Form.Item>

          <Form.Item
            name="gender"
            rules={[
              { required: true, message: 'Please select your gender!' }
            ]}
          >
            <Radio.Group
              options={genderOptions}
            />
          </Form.Item>

          <Form.Item
            name="birth"
            rules={[
              { required: true, message: 'Please select your birth date!' }
            ]}
          >
            <DatePicker
              className="w-full"
              placeholder="Birth Date"
              disabledDate={(current) => current && current.isAfter(dayjs().endOf('day'))}
            />
          </Form.Item>

          <Form.Item className="mt-8">
            <Button type="primary" htmlType="submit" className="w-full h-12 text-lg">
              Register
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div className="text-center">
          <Text type="secondary">Already have an account? </Text>
          <Link to="/login">Login here</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
