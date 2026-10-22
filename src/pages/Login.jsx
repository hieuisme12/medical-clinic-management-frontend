// src/pages/Login.jsx
import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxFilled } from '@ant-design/icons';
import { loginUser } from '../services/api';

const { Title, Text } = Typography;

export default function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);

    try {
      const response = await loginUser(values);
      const userData = response?.data ?? response;

      message.success('Đăng nhập thành công!');
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
    } catch (error) {
      const status = error.response?.status;
      const errorMessage = status === 401
        ? 'Tên đăng nhập hoặc mật khẩu không đúng.'
        : status === 403
          ? 'Tài khoản không có quyền truy cập.'
          : status === 400
            ? error.response?.data?.message || 'Thông tin đăng nhập không hợp lệ.'
            : 'Không thể kết nối đến máy chủ đăng nhập.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #e6f7ff 0%, #1890ff 100%)',
        overflow: 'hidden',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          padding: '20px 10px',
        }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <MedicineBoxFilled style={{ fontSize: 52, color: '#cf1322' }} />
          <Title level={3} style={{ color: '#003a8c', marginTop: 12, marginBottom: 4 }}>
            PHÒNG KHÁM Y TẾ
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Đăng nhập hệ thống quản lý khám bệnh
          </Text>
        </div>

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="username"
            label={<Text strong>Tên đăng nhập</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              placeholder="Nhập tên tài khoản"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<Text strong>Mật khẩu</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="Nhập mật khẩu"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{
                height: 48,
                borderRadius: 8,
                fontSize: 17,
                fontWeight: 600,
                backgroundColor: '#096dd9',
              }}
            >
              ĐĂNG NHẬP
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}