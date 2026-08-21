import MainLayout from '../layouts/MainLayout';
import PageHeader from '../components/PageHeader';

export default function Dashboard() {
  return (
    <MainLayout>
      <PageHeader breadcrumb="Sipinjam / Dashboard" title="Dashboard" />
      <div className="bg-white rounded-2xl p-8 shadow-sm text-gray-500 text-sm">
        Selamat datang di SIPINJAM.
      </div>
    </MainLayout>
  );
}