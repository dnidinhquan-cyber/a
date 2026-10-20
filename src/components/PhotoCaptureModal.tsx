import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, X, Check, Trash2, SwitchCamera, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { DeviceItem, DevicePhoto } from '../types/handover';
import { compressImageFile, captureVideoFrame } from '../utils/imageHelper';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceItem[];
  existingPhotos: DevicePhoto[];
  onSavePhotos: (photos: DevicePhoto[]) => void;
  defaultDeviceId?: string;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  devices,
  existingPhotos,
  onSavePhotos,
  defaultDeviceId,
}) => {
  const [photos, setPhotos] = useState<DevicePhoto[]>(existingPhotos || []);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(defaultDeviceId || '');
  const [caption, setCaption] = useState<string>('');
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync photos when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhotos(existingPhotos || []);
      if (defaultDeviceId) setSelectedDeviceId(defaultDeviceId);
    }
  }, [isOpen, existingPhotos, defaultDeviceId]);

  // Start Camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: unknown) {
      console.warn('Camera error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể truy cập camera';
      setCameraError('Không thể mở camera (' + errorMessage + '). Bạn có thể tải ảnh lên từ thư viện thiết bị.');
      setMode('upload');
    }
  }, [cameraFacing]);

  // Stop Camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (isOpen && mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, startCamera]);

  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const base64 = captureVideoFrame(videoRef.current);
    if (base64) {
      setCapturedPreview(base64);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressed = await compressImageFile(file, 1200, 0.82);
        const newPhoto: DevicePhoto = {
          id: `photo-${Date.now()}-${i}`,
          dataUrl: compressed,
          caption: caption || (file.name.replace(/\.[^/.]+$/, '') || 'Ảnh thiết bị'),
          takenAt: new Date().toLocaleString('vi-VN'),
          deviceId: selectedDeviceId || undefined,
        };
        setPhotos((prev) => [newPhoto, ...prev]);
      } catch (err) {
        console.error('Lỗi khi nén và tải ảnh:', err);
      }
    }
    setCaption('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmCapturedPhoto = () => {
    if (!capturedPreview) return;
    const newPhoto: DevicePhoto = {
      id: `photo-${Date.now()}`,
      dataUrl: capturedPreview,
      caption: caption || 'Ảnh thực tế thiết bị',
      takenAt: new Date().toLocaleString('vi-VN'),
      deviceId: selectedDeviceId || undefined,
    };
    setPhotos((prev) => [newPhoto, ...prev]);
    setCapturedPreview(null);
    setCaption('');
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveAndClose = () => {
    onSavePhotos(photos);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Chụp & Đính Kèm Ảnh Thiết Bị</h3>
              <p className="text-xs text-slate-500">Lưu lại bằng chứng tình trạng thiết bị vào biên bản bàn giao</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Mode Selector */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('camera');
                  setCapturedPreview(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  mode === 'camera' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-4 h-4" />
                Chụp trực tiếp qua Camera
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('upload');
                  setCapturedPreview(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  mode === 'upload' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4" />
                Tải ảnh từ thư viện
              </button>
            </div>

            {/* Quick Caption Suggestions */}
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Gợi ý:
              </span>
              {['Tem Serial', 'Mặt trước', 'Phụ kiện'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setCaption(tag)}
                  className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Thiết bị liên kết (tùy chọn)</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Ảnh biên bản chung / Tất cả thiết bị</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.serialNumber ? `(S/N: ${d.serialNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Mô tả / Chú thích ảnh</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="VD: Tem serial không rách, màn hình nguyên vẹn..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Camera Viewport or Upload Area */}
          {mode === 'camera' && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => setMode('upload')}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg font-medium text-xs hover:bg-amber-700"
                    >
                      <Upload className="w-3.5 h-3.5" /> Chuyển sang tải ảnh từ thư viện
                    </button>
                  </div>
                </div>
              ) : capturedPreview ? (
                /* Preview captured frame before confirming */
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-72 flex items-center justify-center border border-slate-300">
                    <img src={capturedPreview} alt="Preview" className="w-full h-full object-contain" />
                    <span className="absolute top-3 left-3 px-2 py-1 bg-black/60 text-white text-[11px] rounded-md backdrop-blur-xs">
                      Xem trước ảnh vừa chụp
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setCapturedPreview(null)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Chụp lại
                    </button>
                    <button
                      type="button"
                      onClick={confirmCapturedPhoto}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Đính kèm ảnh này
                    </button>
                  </div>
                </div>
              ) : (
                /* Live Camera Feed */
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-72 flex items-center justify-center border border-slate-800 shadow-md">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Camera overlay actions */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="p-2 rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-xs transition-colors cursor-pointer"
                      title="Chuyển camera trước / sau"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Shutter button */}
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleCaptureFrame}
                      className="w-14 h-14 rounded-full border-4 border-white bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                      title="Bấm để chụp ảnh"
                    >
                      <Camera className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
                id="equipment-file-upload"
              />
              <label
                htmlFor="equipment-file-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl p-8 cursor-pointer transition-all text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-800 text-sm mb-1">
                  Nhấp để chọn ảnh hoặc kéo thả vào đây
                </p>
                <p className="text-xs text-slate-500">
                  Hỗ trợ PNG, JPG, JPEG, WebP. Tự động tối ưu hóa để lưu trữ cùng biên bản.
                </p>
              </label>
            </div>
          )}

          {/* Attached Photos Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Ảnh đã đính kèm ({photos.length})
              </h4>
              {photos.length > 0 && (
                <span className="text-[11px] text-slate-400">
                  Được tự động đưa vào file PDF báo cáo
                </span>
              )}
            </div>

            {photos.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                Chưa có ảnh nào được đính kèm. Hãy chụp ảnh tình trạng máy hoặc tải lên từ thiết bị.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((item) => {
                  const device = devices.find((d) => d.id === item.deviceId);
                  return (
                    <div
                      key={item.id}
                      className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-4/3 bg-slate-100 overflow-hidden relative">
                        <img
                          src={item.dataUrl}
                          alt={item.caption || 'Thiết bị'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(item.id)}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 text-white rounded-md hover:bg-rose-700 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-slate-800 truncate" title={item.caption}>
                          {item.caption || 'Ảnh thiết bị'}
                        </p>
                        {device && (
                          <p className="text-[10px] text-indigo-600 font-medium truncate">
                            {device.name}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.takenAt}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            {photos.length} hình ảnh sẽ được lưu trữ cùng biên bản
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" /> Lưu danh sách ảnh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
