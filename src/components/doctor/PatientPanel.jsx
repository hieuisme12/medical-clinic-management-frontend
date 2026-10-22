import React, { useState } from 'react';
import { Avatar, Button, Card, Col, Collapse, Divider, Form, Input, Row, Space, Table, Tag, Typography } from 'antd';
import { EnvironmentOutlined, HistoryOutlined, PhoneOutlined, PlusOutlined, SearchOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function PatientPanel({
  patientForm,
  patients,
  selectedPatient,
  searchPatientKey,
  medicalHistoryLoading,
  onSearchChange,
  searchInputRef,
  onSearch,
  onResetSearch,
  onAddPatient,
  onSelectPatient,
  onViewMedicalHistory,
  onViewPrescriptionHistory,
}) {
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const initials = selectedPatient?.fullName?.trim()?.charAt(0)?.toUpperCase() || '?';

  return (
    <Card className="doctor-section-card" title={<div className="doctor-section-title"><span className="doctor-section-icon"><UserOutlined /></span><span>Thông tin bệnh nhân</span></div>} bordered={false}>
      <div className="doctor-search-row">
        <Input
          placeholder="Tìm theo tên bệnh nhân..."
          ref={searchInputRef}
          size="large"
          prefix={<SearchOutlined />}
          value={searchPatientKey}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <Button size="large" type="primary" onClick={onSearch}>Tìm</Button>
        <Button size="large" onClick={onResetSearch}>Tất cả</Button>
      </div>

      <Collapse
        ghost
        activeKey={addPatientOpen ? ['add'] : []}
        onChange={(keys) => setAddPatientOpen(keys.includes('add'))}
        items={[{
          key: 'add',
          label: <span className="doctor-collapse-label"><PlusOutlined /> Thêm bệnh nhân mới</span>,
          children: (
            <div className="doctor-form-section">
              <Form form={patientForm} layout="vertical" onFinish={onAddPatient}>
                <Row gutter={8}>
                  <Col span={14}>
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                      <Input size="large" placeholder="Nhập họ và tên" />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item name="birthYear" label="Năm sinh" rules={[{ required: true, message: 'Nhập năm sinh' }]}>
                      <Input size="large" type="number" placeholder="Nhập năm sinh" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item name="phone" label="Số điện thoại">
                      <Input size="large" prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="address" label="Địa chỉ">
                      <Input size="large" prefix={<EnvironmentOutlined />} placeholder="Nhập địa chỉ" />
                    </Form.Item>
                  </Col>
                </Row>
                <Button type="primary" block size="large" icon={<UserAddOutlined />} htmlType="submit">
                  Thêm bệnh nhân
                </Button>
              </Form>
            </div>
          ),
        }]}
      />

      <Divider />
      {selectedPatient ? (
        <div className="doctor-selected-patient">
          <Avatar size={42} className="doctor-patient-avatar">{initials}</Avatar>
          <div className="doctor-patient-details">
            <Text strong>{selectedPatient.fullName}</Text>
            <Space size={6} wrap>
              <Tag>{selectedPatient.birthYear || 'Chưa rõ năm sinh'}</Tag>
              <Tag icon={<PhoneOutlined />}>{selectedPatient.phone || 'Chưa có SĐT'}</Tag>
            </Space>
          </div>
        </div>
      ) : <Text type="secondary">Chưa chọn bệnh nhân nào từ danh sách bên dưới.</Text>}

      <Table
        className="doctor-table"
        style={{ marginTop: 16 }}
        dataSource={patients}
        rowKey="id"
        pagination={{ pageSize: 4 }}
        onRow={(record) => ({
          onClick: () => onSelectPatient(record),
          className: selectedPatient?.id === record.id ? 'doctor-selected-row' : '',
        })}
        columns={[
          { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
          { title: 'Năm sinh', dataIndex: 'birthYear', key: 'birthYear', width: 90 },
          { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
          {
            title: 'Lịch sử',
            key: 'history',
            width: 130,
            render: (_, record) => (
              <Button size="small" icon={<HistoryOutlined />} loading={medicalHistoryLoading && selectedPatient?.id === record.id}
                onClick={(event) => { event.stopPropagation(); onViewMedicalHistory(record); }}>
                Lịch sử khám
              </Button>
            ),
          },
        ]}
      />

      {selectedPatient && (
        <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
          <Button block icon={<HistoryOutlined />} onClick={() => onViewMedicalHistory(selectedPatient)}>Xem lịch sử khám</Button>
          <Button block onClick={() => onViewPrescriptionHistory(selectedPatient.id)}>Xem lịch sử thuốc</Button>
        </Space>
      )}
    </Card>
  );
}
