import React, { useRef, useState, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { QrCode, X, SwitchCamera, Upload, CheckCircle2, AlertCircle, Camera, Clock, Sparkles } from 'lucide-react';
import { parseQRPayload, playScanSuccessSound } from '../utils/qrHelper';
import { recordInstantHandover } from '../utils/storage';
import { HandoverProtocol } from '../types/handover';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHandoverRecorded: (protocol: HandoverProtocol, message: string) => void;
  protocols: HandoverProtocol[];
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onHandoverRecorded,
  protocols,
}) => {
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    protocol?: HandoverProtocol;
    message: string;
    timestamp: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCameraStream = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleProcessScannedCode = useCallback((rawCode: string) => {
    // Play sound feedback
    playScanSuccessSound();

    const parsed = parseQRPayload(rawCode);
    let targetId = parsed.protocolId || parsed.protocolNumber;

    // If raw text looks like BBBG or contains ID
    if (!targetId && parsed.rawText) {
      const match = protocols.find(
        (p) =>
          p.id === parsed.rawText ||
          p.protocolNumber.toLowerCase() === parsed.rawText?.toLowerCase() ||
          p.devices.some((d) => d.code === parsed.rawText || d.serialNumber === parsed.rawText)
      );
      if (match) {
        targetId = match.id;
      } else {
        targetId = parsed.rawText;
      }
    }

    if (!targetId) {
      setScanResult({
        success: false,
        message: `Mã QR không hợp lệ hoặc không khớp với định dạng biên bản (${rawCode.slice(0, 30)})`,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      });
      return;
    }

    // Call storage instant handover recorder
    const recordResult = recordInstantHandover(targetId, {
      notes: 'Ghi nhận bàn giao tự động qua quét mã QR trực tiếp tại điểm giao',
    });

    if (recordResult.success && recordResult.protocol) {
      setScanResult({
        success: true,
        protocol: recordResult.protocol,
        message: recordResult.message,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      });
      onHandoverRecorded(recordResult.protocol, recordResult.message);
    } else {
      setScanResult({
        success: false,
        message: recordResult.message,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      });
    }
  }, [protocols, onHandoverRecorded]);

  // QR scanning loop
  const scanLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isOpen) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        // Scanned a code!
        handleProcessScannedCode(code.data);
        return; // stop scanning after successful read
      }
    }

    animationFrameId.current = requestAnimationFrame(scanLoop);
  }, [isOpen, handleProcessScannedCode]);

  // Start Camera
  const startCamera = useCallback(async () => {
    stopCameraStream();
    setCameraError(null);
    setScanResult(null);

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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        animationFrameId.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: unknown) {
      console.warn('Camera error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể kết nối máy ảnh';
      setCameraError('Không thể mở camera (' + errorMessage + '). Bạn có thể tải ảnh chụp mã QR từ máy tính hoặc điện thoại.');
      setIsScanning(false);
    }
  }, [cameraFacing, scanLoop]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCameraStream();
      setScanResult(null);
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen, startCamera]);

  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle uploaded QR image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleProcessScannedCode(code.data);
        } else {
          setScanResult({
            success: false,
            message: 'Không tìm thấy mã QR rõ ràng trong hình ảnh tải lên. Vui lòng thử lại với ảnh rõ nét hơn.',
            timestamp: new Date().toLocaleTimeString('vi-VN'),
          });
        }
      };
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScanAgain = () => {
    setScanResult(null);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Quét QR Ghi Nhận Bàn Giao</h3>
              <p className="text-xs text-slate-400">Xác nhận ngày giờ bàn giao tức thời thời gian thực</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-6 space-y-4">
          {scanResult ? (
            /* Result Banner */
            <div className={`p-6 rounded-2xl border text-center space-y-4 ${
              scanResult.success
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex justify-center">
                {scanResult.success ? (
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-base font-bold mb-1">
                  {scanResult.success ? 'Ghi Nhận Bàn Giao Thành Công!' : 'Không Thể Xác Nhận'}
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {scanResult.message}
                </p>
              </div>

              {scanResult.protocol && (
                <div className="p-3 bg-white rounded-xl border border-emerald-100 text-left text-xs space-y-1.5 shadow-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Số biên bản:</span>
                    <span className="font-bold text-slate-800">{scanResult.protocol.protocolNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Người nhận:</span>
                    <span className="font-semibold text-slate-800">{scanResult.protocol.receiver.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Thời gian tức thời:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {scanResult.protocol.handoverTime} - {scanResult.protocol.handoverDate}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Số lượng thiết bị:</span>
                    <span className="font-medium text-slate-800">{scanResult.protocol.devices.length} món</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Quét tiếp mã khác
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    onClose();
                  }}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Hoàn tất & Đóng
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Area */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 max-h-72 flex items-center justify-center border border-slate-800 shadow-inner">
                {/* Video Feed */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Target Scanning Crosshair Box */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-52 h-52 border-2 border-blue-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-blue-400 rounded-tl-sm -mt-0.5 -ml-0.5" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-blue-400 rounded-tr-sm -mt-0.5 -mr-0.5" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-blue-400 rounded-bl-sm -mb-0.5 -ml-0.5" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-blue-400 rounded-br-sm -mb-0.5 -mr-0.5" />

                      {/* Laser scanning line animation */}
                      <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                )}

                {/* Camera controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-2 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 backdrop-blur-xs transition-colors cursor-pointer"
                    title="Chuyển camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 text-white p-6 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                    <p className="text-xs text-slate-300 mb-4">{cameraError}</p>
                    <label
                      htmlFor="qr-file-input"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-md"
                    >
                      <Upload className="w-4 h-4" /> Tải ảnh mã QR từ thiết bị
                    </label>
                  </div>
                )}
              </div>

              {/* Tips & Quick Upload */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Hướng camera vào mã QR biên bản
                </span>

                <div>
                  <input
                    ref={fileInputRef}
                    id="qr-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="qr-file-input"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" /> Tải ảnh QR
                  </label>
                </div>
              </div>

              {/* Quick Test Demo Button for Easy Evaluation */}
              {protocols.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-600 mb-1.5">
                    Thử nghiệm nhanh không cần camera vật lý:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {protocols.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleProcessScannedCode(p.id)}
                        className="px-2 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-medium rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        ⚡ Mô phỏng quét: {p.protocolNumber}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
