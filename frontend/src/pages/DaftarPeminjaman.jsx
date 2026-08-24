import MainLayout from '../layouts/MainLayout';
import PageHeader from '../components/PageHeader';

export default function DaftarPeminjaman() {
  return (
    <MainLayout>
      <PageHeader breadcrumb="Sipinjam / Daftar Peminjaman" title="Daftar Peminjaman" />
      <div className="bg-white rounded-2xl p-8 shadow-sm text-gray-500 text-sm">
        Daftar Peminjaman.
      </div>
    </MainLayout>
  );
}