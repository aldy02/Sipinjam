import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DaftarBarang from './pages/DaftarBarang';
import FormPeminjamanBarang from './pages/FormPeminjamanBarang';
import DaftarPeminjaman from './pages/DaftarPeminjaman';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes — wajib login, semua role */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/daftar-barang" element={<DaftarBarang />} />
          </Route>

          {/* Protected routes — khusus karyawan */}
          <Route element={<ProtectedRoute allowedRoles={['karyawan']} />}>
            <Route path="/form-peminjaman" element={<FormPeminjamanBarang />} />
          </Route>

          {/* Protected routes — khusus admin */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/daftar-peminjaman" element={<DaftarPeminjaman />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;