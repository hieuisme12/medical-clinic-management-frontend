import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Layout,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import {
  adminAddMedicine,
  adminDeleteMedicine,
  adminUpdateMedicine,
  createAdminUser,
  deletePatient,
  getAdminUsers,
  getAllMedicines,
  getMedicineUnits,
  getPatients,
} from '../services/api';
import '../styles/admin-dashboard.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const unwrapList = (value) => (Array.isArray(value) ? value : []);
const UNIT_LABELS = {
  VIEN: 'Viên',
  VI: 'Vỉ',
  HOP: 'Hộp',
  CHAI: 'Chai',
  GOI: 'Gói',
  LO: 'Lọ',
  TUYP: 'Tuýp',
  ONG: 'Ống',
};

const normalizeMedicineUnits = (units) => unwrapList(units).map((unit) => {
  if (typeof unit === 'string') {
    return { code: unit, label: UNIT_LABELS[unit] || unit };
  }
  return unit;
});

export default function AdminDashboard({ currentUser, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [medicineUnits, setMedicineUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [medicineForm] = Form.useForm();
  const [userForm] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientData, medicineData, userData, unitData] = await Promise.all([
        getPatients(),
        getAllMedicines(),
        getAdminUsers(),
        getMedicineUnits(),
      ]);
      setPatients(unwrapList(patientData));
      setMedicines(unwrapList(medicineData));
      setUsers(unwrapList(userData));
      setMedicineUnits(normalizeMedicineUnits(unitData));
    } catch (error) {
      message.error(error.response?.status === 403
        ? 'Tài khoản không có quyền quản trị.'
        : 'Không thể tải dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeletePatient = async (patientId) => {
    try {
      await deletePatient(patientId);
      message.success('Đã xóa bệnh nhân.');
      setPatients((items) => items.filter((item) => item.id !== patientId));
    } catch (error) {
      message.error(error.response?.status === 403 ? 'Bạn không có quyền xóa bệnh nhân.' : 'Xóa bệnh nhân thất bại.');
    }
  };

  const openMedicineModal = (medicine = null) => {
    setEditingMedicine(medicine);
    medicineForm.setFieldsValue(medicine ? {
      ...medicine,
      unit: medicine.unit?.code || medicine.unit,
    } : {
      name: '',
      unit: '',
      price: 0,
      stockQuantity: 0,
      imageUrl: '',
    });
    setMedicineModalOpen(true);
  };

  const getUnitLabel = (unit) => {
    if (unit && typeof unit === 'object') {
      return unit.label || unit.code || '';
    }
    return medicineUnits.find((item) => item.code === unit)?.label || unit || '';
  };

  const handleSaveMedicine = async (values) => {
    try {
      if (editingMedicine) {
        const updated = await adminUpdateMedicine(editingMedicine.id, values);
        setMedicines((items) => items.map((item) => item.id === editingMedicine.id ? (updated || { ...item, ...values }) : item));
        message.success('Đã cập nhật thuốc.');
      } else {
        const created = await adminAddMedicine(values);
        setMedicines((items) => [...items, created || values]);
        message.success('Đã thêm thuốc.');
      }
      setMedicineModalOpen(false);
      medicineForm.resetFields();
    } catch (error) {
      message.error(error.response?.status === 400 ? error.response?.data?.message || 'Dữ liệu thuốc không hợp lệ.' : 'Lưu thuốc thất bại.');
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    try {
      await adminDeleteMedicine(medicineId);
      message.success('Đã xóa thuốc.');
      setMedicines((items) => items.filter((item) => item.id !== medicineId));
    } catch (error) {
      message.error(error.response?.status === 403 ? 'Bạn không có quyền xóa thuốc.' : 'Xóa thuốc thất bại.');
    }
  };

  const handleCreateUser = async (values) => {
    try {
      const created = await createAdminUser(values);
      message.success('Đã tạo tài khoản.');
      userForm.resetFields();
      setUsers((items) => [...items, created || { username: values.username, role: values.role }]);
    } catch (error) {
      message.error(error.response?.status === 400 ? error.response?.data?.message || 'Thông tin tài khoản không hợp lệ.' : 'Tạo tài khoản thất bại.');
    }
  };

  return (
    <Layout className="admin-dashboard">
      <Header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <span className="admin-brand-mark"><MedicineBoxOutlined /></span>
            <div className="admin-brand-copy">
              <Title className="admin-brand-title" level={4}>Tâm Phúc Clinic</Title>
              <span className="admin-brand-subtitle">Hệ thống quản trị phòng khám</span>
            </div>
          </div>
          <div className="admin-user">
            <Avatar className="admin-user-avatar">{(currentUser?.username || 'A').charAt(0).toUpperCase()}</Avatar>
            <div className="admin-user-copy">
              <span className="admin-user-name">{currentUser?.username || 'Admin'}</span>
              <span className="admin-user-role">Quản trị viên</span>
            </div>
            <Button className="admin-logout" icon={<LogoutOutlined />} onClick={onLogout}>
              <span className="admin-logout-label">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </Header>
      <Content className="admin-content">
        <div className="admin-heading">
          <Title level={2}>Tổng quan quản trị</Title>
          <Text>Quản lý bệnh nhân, thuốc và tài khoản hệ thống.</Text>
        </div>
        <div className="admin-toolbar">
          <Text type="secondary">Dữ liệu được cập nhật từ hệ thống phòng khám</Text>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>Tải lại</Button>
        </div>

        <Card className="admin-card" title={<div className="admin-card-title"><span className="admin-section-icon"><UserOutlined /></span><span>Bệnh nhân</span></div>}>
          <Table
            className="admin-table"
            loading={loading}
            rowKey="id"
            dataSource={patients}
            pagination={{ pageSize: 8 }}
            columns={[
              { title: 'ID', dataIndex: 'id', width: 70 },
              { title: 'Họ tên', dataIndex: 'fullName' },
              { title: 'Năm sinh', dataIndex: 'birthYear', width: 110 },
              { title: 'Số điện thoại', dataIndex: 'phone' },
              { title: 'Địa chỉ', dataIndex: 'address' },
              {
                title: 'Thao tác',
                width: 110,
                render: (_, record) => (
                  <Popconfirm title="Xóa bệnh nhân này?" onConfirm={() => handleDeletePatient(record.id)} okText="Xóa" cancelText="Hủy">
                    <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                  </Popconfirm>
                ),
              },
            ]}
          />
        </Card>

        <Card className="admin-card" title={<div className="admin-card-title"><span className="admin-section-icon"><MedicineBoxOutlined /></span><span>Quản lý thuốc</span></div>}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openMedicineModal()} style={{ marginBottom: 16 }}>
            Thêm thuốc
          </Button>
          <Table
            className="admin-table"
            loading={loading}
            rowKey="id"
            dataSource={medicines}
            pagination={{ pageSize: 8 }}
            columns={[
              { title: 'ID', dataIndex: 'id', width: 70 },
              { title: 'Tên thuốc', dataIndex: 'name' },
              { title: 'Đơn vị', dataIndex: 'unit', width: 100, render: (unit) => getUnitLabel(unit) },
              { title: 'Giá', dataIndex: 'price', render: (value) => `${Number(value || 0).toLocaleString()} đ` },
              { title: 'Tồn kho', dataIndex: 'stockQuantity', width: 110 },
              {
                title: 'Thao tác',
                width: 180,
                render: (_, record) => (
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => openMedicineModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa thuốc này?" onConfirm={() => handleDeleteMedicine(record.id)} okText="Xóa" cancelText="Hủy">
                      <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </Card>

        <Card className="admin-card" title={<div className="admin-card-title"><span className="admin-section-icon"><UserOutlined /></span><span>Tài khoản hệ thống</span></div>}>
          <div className="admin-user-form">
          <Form form={userForm} layout="inline" onFinish={handleCreateUser} style={{ marginBottom: 16 }}>
            <Form.Item name="username" rules={[{ required: true, message: 'Nhập username' }]}>
              <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>
            <Form.Item name="role" initialValue="USER" rules={[{ required: true }]}>
              <Select style={{ width: 130 }} options={[
                { value: 'USER', label: 'USER' },
                { value: 'DOCTOR', label: 'DOCTOR' },
                { value: 'ADMIN', label: 'ADMIN' },
              ]} />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>Tạo tài khoản</Button>
          </Form>
          </div>
          <Table
            className="admin-table"
            loading={loading}
            rowKey={(record) => record.id || record.username}
            dataSource={users}
            pagination={{ pageSize: 8 }}
            columns={[
              { title: 'ID', dataIndex: 'id', width: 80 },
              { title: 'Username', dataIndex: 'username' },
              { title: 'Vai trò', dataIndex: 'role', render: (role) => <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag> },
            ]}
          />
        </Card>
      </Content>

      <Modal
        className="admin-modal"
        title={editingMedicine ? 'Cập nhật thuốc' : 'Thêm thuốc'}
        open={medicineModalOpen}
        onCancel={() => setMedicineModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={medicineForm} layout="vertical" onFinish={handleSaveMedicine}>
          <Form.Item name="name" label="Tên thuốc" rules={[{ required: true, message: 'Nhập tên thuốc' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="unit" label="Đơn vị" rules={[{ required: true, message: 'Chọn đơn vị' }]}>
            <Select
              placeholder="Chọn đơn vị thuốc"
              options={medicineUnits.map((unit) => ({
                value: unit.code,
                label: unit.label,
              }))}
              notFoundContent="Không có danh mục đơn vị"
            />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Nhập giá' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stockQuantity" label="Tồn kho" rules={[{ required: true, message: 'Nhập tồn kho' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="imageUrl" label="URL hình ảnh">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Lưu thuốc</Button>
        </Form>
      </Modal>
    </Layout>
  );
}
