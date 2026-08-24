import MainLayout from '../layouts/MainLayout';
import PageHeader from '../components/PageHeader';

export default function AktivitasSaya() {
  return (
    <MainLayout>
      <PageHeader breadcrumb="Sipinjam / Aktivitas Saya" title="Aktivitas Saya" />
      <div className="bg-white rounded-2xl p-8 shadow-sm text-gray-500 text-sm">
        Aktivitas Saya.
      </div>
    </MainLayout>
  );
}