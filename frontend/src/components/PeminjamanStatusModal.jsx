import { X, CheckCircle2, XCircle } from 'lucide-react';

export default function PeminjamanStatusModal({ isOpen, onClose, type = 'success', message }) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
        >
          <X size={22} />
        </button>

        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${
            isSuccess ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 size={30} className="text-[#027959]" />
          ) : (
            <XCircle size={30} className="text-red-500" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-[#2B3674] mb-2">
          {isSuccess ? 'Berhasil!' : 'Gagal!'}
        </h2>
        <p className="text-[15px] text-[#8789C0] mb-8 leading-relaxed">{message}</p>

        <button
          onClick={onClose}
          className={`w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-colors ${
            isSuccess
              ? 'bg-[#027959] hover:bg-green-800'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );
}