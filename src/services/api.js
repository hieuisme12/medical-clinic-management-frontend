import axios from 'axios';

// Địa chỉ Backend Spring Boot đang chạy
const API_BASE_URL = 'http://localhost:8088/api';
const AUTH_STORAGE_KEY = 'clinic_basic_auth';
const USER_STORAGE_KEY = 'clinic_current_user';

const readStoredCredentials = () => {
    const storedCredentials = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedCredentials) return null;

    try {
        const credentials = JSON.parse(storedCredentials);
        if (credentials?.username && credentials?.password) {
            return credentials;
        }
    } catch {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }

    return null;
};

let authCredentials = readStoredCredentials();

const encodeBasicAuth = ({ username, password }) => {
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return `Basic ${btoa(binary)}`;
};

// Tạo một instance axios chung để gửi Basic Authentication cho các API bảo vệ.
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    if (authCredentials && !config.skipAuth) {
        config.headers.Authorization = encodeBasicAuth(authCredentials);
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuthCredentials();
        }
        return Promise.reject(error);
    },
);

export const setAuthCredentials = (credentials) => {
    authCredentials = {
        username: credentials.username,
        password: credentials.password,
    };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authCredentials));
};

export const getStoredUser = () => {
    const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
    if (!storedUser) return null;

    try {
        return JSON.parse(storedUser);
    } catch {
        sessionStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
};

export const setStoredUser = (user) => {
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearAuthCredentials = () => {
    authCredentials = null;
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
};

// 1. ĐĂNG NHẬP
export const loginUser = async ({ username, password }) => {
    const response = await apiClient.post('/login', { username, password }, { skipAuth: true });
    setAuthCredentials({ username, password });
    const userData = response.data?.data ?? response.data;
    setStoredUser(userData);
    return response.data; // Trả về toàn bộ ApiResponse (chứa status, message, data là user)
};

// 2. BỆNH NHÂN
export const getPatients = async(keyword = '') => {
    const response = await apiClient.get('/patients', {
        params: { keyword }
    });
    // Trợ giúp tự bóc tách tầng data nếu backend trả về chuẩn ApiResponse
    return response.data.data ? response.data.data : response.data;
};

export const addPatient = async(patientData) => {
    const response = await apiClient.post('/patients', patientData);
    return response.data.data ? response.data.data : response.data;
};

export const deletePatient = async(patientId) => {
    const response = await apiClient.delete(`/admin/patients/${patientId}`);
    return response.data.data ? response.data.data : response.data;
};

// 3. THUỐC (MEDICINES)
export const getAllMedicines = async() => {
    const response = await apiClient.get('/medicines');
    // Bóc tách tự động tầng data trả về từ ApiResponse của Backend
    return response.data.data ? response.data.data : response.data;
};

export const getMedicineUnits = async() => {
    const response = await apiClient.get('/medicine-units');
    return response.data.data ? response.data.data : response.data;
};

export const searchMedicines = async(search) => {
    const response = await apiClient.get('/medicines', {
        params: { search }
    });
    return response.data.data ? response.data.data : response.data;
};

export const addMedicine = async(medicineData) => {
    const response = await apiClient.post('/medicines', medicineData);
    return response.data.data ? response.data.data : response.data;
};

export const adminAddMedicine = async(medicineData) => {
    const response = await apiClient.post('/admin/medicines', medicineData);
    return response.data.data ? response.data.data : response.data;
};

export const adminUpdateMedicine = async(medicineId, medicineData) => {
    const response = await apiClient.put(`/admin/medicines/${medicineId}`, medicineData);
    return response.data.data ? response.data.data : response.data;
};

export const adminDeleteMedicine = async(medicineId) => {
    const response = await apiClient.delete(`/admin/medicines/${medicineId}`);
    return response.data.data ? response.data.data : response.data;
};

export const getAdminUsers = async() => {
    const response = await apiClient.get('/admin/users');
    return response.data.data ? response.data.data : response.data;
};

export const createAdminUser = async(userData) => {
    const response = await apiClient.post('/admin/users', userData);
    return response.data.data ? response.data.data : response.data;
};

// 4. HỒ SƠ KHÁM BỆNH
export const getMedicalRecordsByPatient = async(patientId) => {
    const response = await apiClient.get(`/patients/${patientId}/medical-records`);
    return response.data.data ? response.data.data : response.data;
};

export const addMedicalRecord = async(recordData) => {
    const response = await apiClient.post('/medical-records', recordData);
    return response.data.data ? response.data.data : response.data;
};

export const addPrescription = async(prescriptionData) => {
    const response = await apiClient.post('/prescriptions', prescriptionData);
    return response.data.data ? response.data.data : response.data;
};

export const getPrescriptionsByPatient = async(patientId) => {
    const response = await apiClient.get(`/patients/${patientId}/prescriptions`);
    return response.data.data ? response.data.data : response.data;
};