import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Button, Col, Form, Layout, message, Row, Typography } from 'antd';
import { LogoutOutlined, MedicineBoxFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import PatientPanel from '../components/doctor/PatientPanel';
import PrescriptionPanel from '../components/doctor/PrescriptionPanel';
import HistoryModals from '../components/doctor/HistoryModals';
import {
  addMedicalRecord,
  addPrescription,
  addPatient,
  getAllMedicines,
  getMedicalRecordsByPatient,
  getPatients,
  getPrescriptionsByPatient,
} from '../services/api';
import '../styles/doctor-dashboard.css';

const { Title } = Typography;
const { Header } = Layout;

export default function DoctorDashboard({ currentUser, onLogout }) {
  const [patientForm] = Form.useForm();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchPatientKey, setSearchPatientKey] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [prescription, setPrescription] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [examDate, setExamDate] = useState(dayjs());
  const [note, setNote] = useState('');
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [medicalRecordHistory, setMedicalRecordHistory] = useState([]);
  const [medicalHistoryOpen, setMedicalHistoryOpen] = useState(false);
  const [medicalHistoryLoading, setMedicalHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchInputRef = useRef(null);

  const fetchPatients = async (keyword = '') => {
    try {
      const data = await getPatients(keyword);
      const result = Array.isArray(data) ? data : [];
      const normalizedKeyword = keyword.trim().toLocaleLowerCase();
      setPatients(normalizedKeyword
        ? result.filter((patient) => patient.fullName?.toLocaleLowerCase().includes(normalizedKeyword))
        : result);
    } catch (error) {
      console.error('Lỗi tải danh sách bệnh nhân:', error);
      message.error('Không thể tải danh sách bệnh nhân.');
    }
  };

  const fetchMedicines = async () => {
    try {
      const data = await getAllMedicines();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi tải danh sách thuốc:', error);
      message.error('Không thể tải danh sách thuốc.');
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchMedicines();
  }, []);

  const handleAddPatient = async (values) => {
    try {
      const newPatient = await addPatient(values);
      message.success('Thêm bệnh nhân thành công!');
      patientForm.resetFields();
      await fetchPatients();
      setSelectedPatient(newPatient);
    } catch {
      message.error('Thêm bệnh nhân thất bại!');
    }
  };

  const handleAddMedicine = (medicineId) => {
    const medicine = medicines.find((item) => item.id === medicineId);
    if (!medicine) return;
    if (prescription.some((item) => item.medicineId === medicine.id)) {
      message.warning('Thuốc này đã có trong đơn!');
      return;
    }
    setPrescription((items) => [...items, {
      medicineId: medicine.id,
      name: medicine.name,
      unit: medicine.unit,
      price: medicine.price,
      imageUrl: medicine.imageUrl || medicine.image_url,
      quantity: 1,
      dosage: 'Sáng 1 viên, tối 1 viên (sau ăn)',
    }]);
  };

  const updatePrescriptionItem = (medicineId, key, value) => {
    setPrescription((items) => items.map((item) => (
      item.medicineId === medicineId ? { ...item, [key]: value } : item
    )));
  };

  const removePrescriptionItem = (medicineId) => {
    setPrescription((items) => items.filter((item) => item.medicineId !== medicineId));
  };

  const cancelPrescription = () => {
    setPrescription([]);
    setDiagnosis('');
    setNote('');
    setExamDate(dayjs());
  };

  const viewPrescriptionHistory = async (patientId) => {
    try {
      const data = await getPrescriptionsByPatient(patientId);
      setPrescriptionHistory(Array.isArray(data) ? data : []);
      setPrescriptionOpen(true);
    } catch {
      message.error('Không thể tải lịch sử thuốc của bệnh nhân.');
    }
  };

  const viewMedicalHistory = async (patient) => {
    setSelectedPatient(patient);
    setMedicalHistoryLoading(true);
    try {
      const data = await getMedicalRecordsByPatient(patient.id);
      setMedicalRecordHistory(Array.isArray(data) ? data : []);
      setMedicalHistoryOpen(true);
    } catch (error) {
      message.error(error.response?.status === 403
        ? 'Bạn không có quyền xem lịch sử khám.'
        : 'Không thể tải lịch sử khám của bệnh nhân.');
    } finally {
      setMedicalHistoryLoading(false);
    }
  };

  const savePrescription = async () => {
    if (!selectedPatient) return message.warning('Vui lòng chọn bệnh nhân trước khi lưu.');
    if (!diagnosis.trim()) return message.warning('Vui lòng nhập chẩn đoán.');
    if (!prescription.length) return message.warning('Vui lòng chọn ít nhất một thuốc.');
    if (prescription.some((item) => Number(item.quantity) <= 0 || !item.dosage.trim())) {
      return message.warning('Số lượng phải lớn hơn 0 và liều dùng không được để trống.');
    }

    const doctorId = currentUser?.doctorId || currentUser?.id || currentUser?.userId;
    if (!doctorId) return message.error('Không xác định được ID bác sĩ trong tài khoản đăng nhập.');

    setSaving(true);
    try {
      const record = await addMedicalRecord({
        patient: { id: selectedPatient.id },
        doctor: { id: doctorId },
        diagnosis: diagnosis.trim(),
        examDate: examDate.format('YYYY-MM-DD'),
        note: note.trim(),
      });
      if (!record?.id) throw new Error('API không trả về ID hồ sơ khám.');

      await Promise.all(prescription.map((item) => addPrescription({
        medicalRecord: { id: record.id },
        medicine: { id: item.medicineId },
        quantity: Number(item.quantity),
        dosage: item.dosage.trim(),
      })));

      message.success('Đã lưu hồ sơ khám và đơn thuốc.');
      setPrescription([]);
      setDiagnosis('');
      setNote('');
      await viewPrescriptionHistory(selectedPatient.id);
    } catch (error) {
      const status = error.response?.status;
      message.error(status === 400
        ? error.response?.data?.message || 'Dữ liệu hồ sơ hoặc đơn thuốc không hợp lệ.'
        : status === 404
          ? 'Không tìm thấy bệnh nhân, hồ sơ hoặc thuốc.'
          : status === 403
            ? 'Tài khoản không có quyền lưu hồ sơ.'
            : status === 401
              ? 'Phiên đăng nhập đã hết hạn.'
              : error.message || 'Lưu hồ sơ và đơn thuốc thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const totalPrice = prescription.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  useEffect(() => {
    const handleKeyboard = (event) => {
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        savePrescription();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  });

  return (
    <div className="doctor-dashboard">
      <Header className="doctor-header">
        <div className="doctor-header-inner">
          <div className="doctor-brand">
            <span className="doctor-brand-mark"><MedicineBoxFilled /></span>
            <div className="doctor-brand-copy">
              <Title className="doctor-brand-title" level={4}>Phòng khám Tâm Phúc</Title>
              <span className="doctor-brand-subtitle">Hệ thống quản lý khám bệnh</span>
            </div>
          </div>
          <div className="doctor-user">
            <Avatar className="doctor-user-avatar">
              {(currentUser?.username || 'B').charAt(0).toUpperCase()}
            </Avatar>
            <div className="doctor-user-copy">
              <span className="doctor-user-name">{currentUser?.username || 'Bác sĩ'}</span>
              <span className="doctor-user-role">Bác sĩ</span>
            </div>
            <Button className="doctor-logout-button" icon={<LogoutOutlined />} onClick={onLogout}>
              <span className="doctor-logout-label">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </Header>
      <main className="doctor-main">
        <div className="doctor-page-heading">
          <Title level={2}>Tổng quan khám bệnh</Title>
          <Typography.Text>Quản lý bệnh nhân, hồ sơ khám và đơn thuốc trong ngày.</Typography.Text>
        </div>
        <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <PatientPanel
            patientForm={patientForm}
            patients={patients}
            selectedPatient={selectedPatient}
            searchPatientKey={searchPatientKey}
            medicalHistoryLoading={medicalHistoryLoading}
            onSearchChange={setSearchPatientKey}
            searchInputRef={searchInputRef}
            onSearch={() => fetchPatients(searchPatientKey)}
            onResetSearch={() => { setSearchPatientKey(''); fetchPatients(); }}
            onAddPatient={handleAddPatient}
            onSelectPatient={setSelectedPatient}
            onViewMedicalHistory={viewMedicalHistory}
            onViewPrescriptionHistory={viewPrescriptionHistory}
          />
        </Col>
        <Col xs={24} lg={14}>
          <PrescriptionPanel
            selectedPatient={selectedPatient}
            diagnosis={diagnosis}
            note={note}
            examDate={examDate}
            medicines={medicines}
            prescription={prescription}
            saving={saving}
            totalPrice={totalPrice}
            onDiagnosisChange={setDiagnosis}
            onNoteChange={setNote}
            onExamDateChange={setExamDate}
            onAddMedicine={handleAddMedicine}
            onUpdateItem={updatePrescriptionItem}
            onRemoveItem={removePrescriptionItem}
            onSave={savePrescription}
            onCancel={cancelPrescription}
          />
        </Col>
        </Row>
      <HistoryModals
        selectedPatient={selectedPatient}
        prescriptionHistory={prescriptionHistory}
        prescriptionOpen={prescriptionOpen}
        medicalRecordHistory={medicalRecordHistory}
        medicalHistoryOpen={medicalHistoryOpen}
        onClosePrescription={() => setPrescriptionOpen(false)}
        onCloseMedicalHistory={() => setMedicalHistoryOpen(false)}
      />
      </main>
    </div>
  );
}
