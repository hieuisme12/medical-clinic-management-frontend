// src/App.jsx
import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import Login from './pages/Login';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { clearAuthCredentials, getStoredUser } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    clearAuthCredentials();
    setCurrentUser(null);
  };

  const currentRole = String(currentUser?.role || currentUser?.userRole || '').toUpperCase();

  return (
    <ConfigProvider>
      {/* Ép div gốc chiếm trọn 100% chiều rộng và chiều cao */}
      <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflowX: 'hidden' }}>
        {!currentUser ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : currentRole === 'ADMIN' ? (
          <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          <DoctorDashboard currentUser={currentUser} onLogout={handleLogout} />
        )}
      </div>
    </ConfigProvider>
  );
}

export default App;