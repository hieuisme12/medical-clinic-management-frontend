import React from 'react';
import { List, Modal, Typography } from 'antd';

const { Text } = Typography;

export default function HistoryModals({
  selectedPatient,
  prescriptionHistory,
  prescriptionOpen,
  medicalRecordHistory,
  medicalHistoryOpen,
  onClosePrescription,
  onCloseMedicalHistory,
}) {
  return (
    <>
      <Modal title={`Lịch sử thuốc - ${selectedPatient?.fullName || ''}`} open={prescriptionOpen} onCancel={onClosePrescription} footer={null} width={760}>
        <List
          dataSource={prescriptionHistory}
          locale={{ emptyText: 'Chưa có lịch sử thuốc.' }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.medicine?.name || 'Thuốc'} description={`${item.medicalRecord?.examDate || ''} - ${item.medicalRecord?.diagnosis || ''}`} />
              <Text>{item.quantity} {item.medicine?.unit || ''} - {item.dosage}</Text>
            </List.Item>
          )}
        />
      </Modal>
      <Modal title={`Lịch sử khám bệnh - ${selectedPatient?.fullName || ''}`} open={medicalHistoryOpen} onCancel={onCloseMedicalHistory} footer={null} width={760}>
        <List
          dataSource={medicalRecordHistory}
          locale={{ emptyText: 'Bệnh nhân chưa có lịch sử khám.' }}
          renderItem={(record) => (
            <List.Item>
              <List.Item.Meta title={`${record.examDate || 'Chưa có ngày khám'} - ${record.diagnosis || 'Chưa có chẩn đoán'}`} description={record.note || 'Không có ghi chú'} />
              <Text type="secondary">{record.doctor?.fullName || record.doctor?.username || record.doctor?.name || ''}</Text>
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
}
