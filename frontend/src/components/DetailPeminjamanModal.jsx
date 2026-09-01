import { X } from 'lucide-react';

const formatTanggal = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const STATUS_STYLE = {
  dipinjam: 'bg-orange-50 text-[#CD6200]',
  dikembalikan: 'bg-green-50 text-[#1F9254]',
};

function DetailRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-[#8789C0]">{label}</span>
      <span className={`text-sm font-semibold text-[#2B3674] text-right ${valueClass}`}>
        {value || '-'}
      </span>
    </div>
  );
}

export default function DetailPeminjamanModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <p className="text-sm font-medium text-[#003399] mb-1">{data.kode_peminjaman}</p>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#2B3674]">Detail Peminjaman</h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
              STATUS_STYLE[data.status] || 'bg-gray-50 text-gray-500'
            }`}
          >
            {data.status}
          </span>
        </div>

        <div className="border-t border-gray-100 pt-1">
          <DetailRow label="Peminjam" value={data.User?.nama} />
          <DetailRow label="NPK" value={data.User?.npk} />
          <DetailRow label="Kode Barang" value={data.Equipment?.kode_barang} />
          <DetailRow label="Nama Barang" value={data.Equipment?.nama} />
          <DetailRow label="Kondisi Saat Pinjam" value={data.kondisi_saat_pinjam} valueClass="capitalize" />
          <DetailRow label="Kondisi Saat Kembali" value={data.kondisi_saat_kembali} valueClass="capitalize" />
          <DetailRow label="Lokasi Pickup" value={data.lokasi_pickup} />
          <DetailRow label="Lokasi Pemakaian" value={data.lokasi_pemakaian} />
          <DetailRow label="Lokasi Kembali" value={data.lokasi_kembali} />
          <DetailRow label="Tanggal Pinjam" value={formatTanggal(data.tanggal_pinjam)} />
          <DetailRow label="Rencana Kembali" value={formatTanggal(data.tanggal_rencana_kembali)} />
          <DetailRow label="Aktual Kembali" value={formatTanggal(data.tanggal_aktual_kembali)} />
        </div>

        {data.keterangan && (
          <div className="mt-4 bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-[#8789C0] mb-1">Keterangan</p>
            <p className="text-sm text-[#2B3674]">{data.keterangan}</p>
          </div>
        )}
      </div>
    </div>
  );
}