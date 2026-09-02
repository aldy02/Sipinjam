import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DaftarBarang from './pages/DaftarBarang';
import FormPeminjamanBarang from './pages/FormPeminjamanBarang';
import DaftarPeminjaman from './pages/DaftarPeminjaman';
import AktivitasSaya from './pages/AktivitasSaya';
import Pengaturan from './pages/Pengaturan';
import UnderConstruction from './pages/UnderConstruction';
import KelolaAkun from './pages/KelolaAkun';
import FormPengembalianBarang from './pages/FormPengembalianBarang';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<UnderConstruction />} />

        {/* Protected routes — wajib login, semua role */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/daftar-barang" element={<DaftarBarang />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
        </Route>

        {/* Protected routes — khusus karyawan */}
        <Route element={<ProtectedRoute allowedRoles={['karyawan']} />}>
          <Route path="/form-peminjaman" element={<FormPeminjamanBarang />} />
          <Route path="/aktivitas-saya" element={<AktivitasSaya />} />
          <Route path="/form-pengembalian" element={<FormPengembalianBarang />} />
        </Route>

        {/* Protected routes — khusus admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/daftar-peminjaman" element={<DaftarPeminjaman />} />
            <Route path="/kelola-akun" element={<KelolaAkun />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;