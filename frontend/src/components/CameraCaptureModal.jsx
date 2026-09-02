import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Camera, RotateCcw, Images, Zap } from 'lucide-react';

export default function CameraCaptureModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const galleryInputRef = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment'); // 'environment' = kamera belakang, 'user' = depan
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async () => {
    setError('');
    setReady(false);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setReady(true);
    } catch (err) {
      console.error(err);
      setError(
        err?.name === 'NotAllowedError'
          ? 'Akses kamera ditolak. Izinkan akses kamera di pengaturan browser, atau pilih foto dari galeri.'
          : 'Kamera tidak dapat diakses. Silakan pilih foto dari galeri.'
      );
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (isOpen) {
      startStream();
    } else {
      stopStream();
    }
    return () => stopStream();
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleShutter = () => {
    if (!videoRef.current || !ready) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Flash Effect When Capture Photo
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `bukti-kembali-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopStream();
        onCapture(file);
      },
      'image/jpeg',
      0.9
    );
  };

  const handleGalleryChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    stopStream();
    onCapture(file);
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-60 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white"
        >
          <X size={20} />
        </button>
        <p className="text-white text-sm font-medium">Foto Bukti Pengembalian</p>
        <button
          onClick={handleSwitchCamera}
          className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white"
          title="Ganti kamera"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Preview area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
        {error ? (
          <div className="px-8 text-center">
            <p className="text-white text-sm mb-4">{error}</p>
            <button
              onClick={startStream}
              className="px-5 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-sm">Membuka kamera...</p>
              </div>
            )}
            {flash && <div className="absolute inset-0 bg-white animate-pulse" />}
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom controls */}
      <div className="shrink-0 pb-8 pt-5 px-6 flex items-center justify-between">
        <button
          onClick={() => galleryInputRef.current?.click()}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white"
          title="Pilih dari galeri"
        >
          <Images size={20} />
        </button>

        <button
          onClick={handleShutter}
          disabled={!ready}
          className="w-16 h-16 rounded-full bg-white border-4 border-white/30 flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
        >
          <span className="w-full h-full rounded-full border-2 border-gray-800" />
        </button>

        <div className="w-12 h-12 flex items-center justify-center text-white/40">
          <Zap size={20} />
        </div>
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleGalleryChange}
        className="hidden"
      />
    </div>
  );
}