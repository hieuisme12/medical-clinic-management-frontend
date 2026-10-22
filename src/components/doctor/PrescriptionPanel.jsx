import React from 'react';
import { Button, Card, Col, DatePicker, Divider, Empty, Image, Input, InputNumber, Row, Select, Space, Table, Typography } from 'antd';
import { EnvironmentOutlined, DeleteOutlined, MedicineBoxOutlined, PhoneOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function PrescriptionPanel({
  selectedPatient, diagnosis, note, examDate, medicines, prescription, saving, totalPrice,
  onDiagnosisChange, onNoteChange, onExamDateChange, onAddMedicine, onUpdateItem, onRemoveItem, onSave, onCancel,
}) {
  return (
    <Card className="doctor-section-card" title={<div className="doctor-section-title"><span className="doctor-section-icon"><MedicineBoxOutlined /></span><span>Chuẩn đoán & kê đơn</span></div>} bordered={false}>
      <div className="doctor-patient-readonly-section">
        <div className="doctor-subsection-title">Thông tin bệnh nhân</div>
        {selectedPatient ? (
          <Row gutter={8}>
            <Col span={14}>
              <Text className="doctor-field-label">Họ và tên</Text>
              <Input size="large" value={selectedPatient.fullName || ''} disabled />
            </Col>
            <Col span={10}>
              <Text className="doctor-field-label">Năm sinh</Text>
              <Input size="large" value={selectedPatient.birthYear || ''} disabled />
            </Col>
            <Col span={12}>
              <Text className="doctor-field-label">Số điện thoại</Text>
              <Input size="large" prefix={<PhoneOutlined />} value={selectedPatient.phone || ''} placeholder="Chưa có số điện thoại" disabled />
            </Col>
            <Col span={12}>
              <Text className="doctor-field-label">Địa chỉ</Text>
              <Input size="large" prefix={<EnvironmentOutlined />} value={selectedPatient.address || ''} placeholder="Chưa có địa chỉ" disabled />
            </Col>
          </Row>
        ) : (
          <Text type="secondary">Vui lòng chọn bệnh nhân ở danh sách bên trái để bắt đầu khám.</Text>
        )}
      </div>

      <div className="doctor-form-section">
        <div className="doctor-subsection-title">Thông tin khám</div>
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Text className="doctor-field-label">Chẩn đoán bệnh</Text>
            <Input.TextArea rows={3} value={diagnosis} onChange={(event) => onDiagnosisChange(event.target.value)} placeholder="Nhập chẩn đoán..." />
          </Col>
          <Col xs={24} md={8}>
            <Text className="doctor-field-label">Ngày khám</Text>
            <DatePicker size="large" style={{ width: '100%' }} value={examDate} onChange={onExamDateChange} format="DD/MM/YYYY" />
            <Text className="doctor-field-label doctor-note-label">Ghi chú</Text>
            <Input value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="Ghi chú ngắn..." />
          </Col>
        </Row>
      </div>

      <Divider />
      <div className="doctor-subsection-title">Kê đơn thuốc</div>
      <Text className="doctor-field-label">Chọn thuốc</Text>
      <Select
        showSearch size="large" prefix={<SearchOutlined />} style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
        placeholder="Tìm theo tên thuốc..." optionFilterProp="label" onChange={onAddMedicine}
        options={medicines.map((medicine) => ({ value: medicine.id, label: medicine.name, medicine }))}
        optionRender={(option) => {
          const medicine = option.data.medicine;
          return <Space align="center">
            <img src={medicine.imageUrl || medicine.image_url || 'https://via.placeholder.com/40?text=Thuoc'} alt={medicine.name} className="doctor-medicine-thumb" />
            <div><Text strong>{medicine.name}</Text> ({medicine.unit})<br /><Text type="secondary">{medicine.price?.toLocaleString()} đ · Tồn kho {medicine.stockQuantity}</Text></div>
          </Space>;
        }}
      />

      {prescription.length ? (
        <Table
          className="doctor-table"
          dataSource={prescription}
          rowKey="medicineId"
          pagination={false}
          columns={[
            { title: 'Ảnh', dataIndex: 'imageUrl', width: 64, render: (url) => <Image src={url || 'https://via.placeholder.com/40?text=Thuoc'} width={40} height={40} className="doctor-table-thumb" /> },
            { title: 'Tên thuốc', dataIndex: 'name' },
            { title: 'Số lượng', width: 110, render: (_, record) => <InputNumber min={1} value={record.quantity} onChange={(value) => onUpdateItem(record.medicineId, 'quantity', value || 1)} /> },
            { title: 'Cách dùng / liều dùng', render: (_, record) => <Input value={record.dosage} onChange={(event) => onUpdateItem(record.medicineId, 'dosage', event.target.value)} placeholder="Sáng 1 viên, tối 1 viên" /> },
            { title: '', width: 56, render: (_, record) => <Button type="text" danger className="doctor-delete-button" icon={<DeleteOutlined />} onClick={() => onRemoveItem(record.medicineId)} /> },
          ]}
        />
      ) : (
        <Empty className="doctor-empty" image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thuốc trong đơn. Hãy tìm và chọn thuốc ở phía trên." />
      )}

      <div className="doctor-total">
        <span className="doctor-total-label">Tạm tính đơn thuốc</span>
        <Title level={4} className="doctor-total-value">{totalPrice.toLocaleString()} VNĐ</Title>
      </div>
      <div className="doctor-action-bar">
        <Button type="primary" size="large" loading={saving} onClick={onSave}>Lưu đơn thuốc</Button>
        <Button size="large" disabled>Lưu nháp</Button>
        <Button size="large" onClick={onCancel}>Hủy</Button>
      </div>
    </Card>
  );
}
