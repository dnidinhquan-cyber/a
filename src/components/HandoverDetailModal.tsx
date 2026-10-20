import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  PenTool,
  Camera,
  QrCode,
  Clock,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Building,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit,
  History,
  FileCheck
} from 'lucide-react';
import { HandoverProtocol, DevicePhoto } from '../types/handover';
import { PrintableHandover } from './PrintableHandover';
import { SignaturePadModal } from './SignaturePadModal';
import { PhotoCaptureModal } from './PhotoCaptureModal';
import { QRBadgeModal } from './QRBadgeModal';
import { exportElementToPDF } from '../utils/pdfGenerator';
import { recordInstantHandover } from '../utils/storage';

interface HandoverDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocol: HandoverProtocol | null;
  onUpdateProtocol: (protocol: HandoverProtocol) => void;
  onEdit: (protocol: HandoverProtocol) => void;
}

export const HandoverDetailModal: React.FC<HandoverDetailModalProps> = ({
  isOpen,
  onClose,
  protocol,
  onUpdateProtocol,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'preview' | 'history'>('details');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  
  // Modals inside detail
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signingTarget, setSigningTarget] = useState<'deliverer' | 'receiver'>('receiver');
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [qrBadgeOpen, setQrBadgeOpen] = useState(false);

  // Fullscreen photo preview
  const [previewPhoto, setPreviewPhoto] = useState<DevicePhoto | null>(null);

  if (!isOpen || !protocol) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);
    setExportProgress('Khởi tạo xuất bản PDF...');
    const filename = `Bien_Ban_Ban_Giao_${protocol.protocolNumber.replace(/[/\\?%*:|"<>]/g, '_')}`;
    
    // Ensure preview element is rendered
    setActiveTab('preview');
    setTimeout(async () => {
      const success = await exportElementToPDF('printable-handover-document', filename, {
        onProgress: (msg) => setExportProgress(msg),
      });
      setIsExportingPDF(false);
      setExportProgress('');
      if (!success) {
        alert('Có lỗi xảy ra khi tạo tệp PDF. Bạn có thể sử dụng nút "In trực tiếp" để lưu PDF qua trình duyệt.');
      }
    }, 250);
  };

  const handleInstantRecord = () => {
    const res = recordInstantHandover(protocol.id, {
      notes: 'Ghi nhận thời gian bàn giao tức thời từ chi tiết biên bản',
    });
    if (res.success && res.protocol) {
      onUpdateProtocol(res.protocol);
    }
  };

  const handleSaveSignature = (sigUrl: string, name: string) => {
    const nowStr = new Date().toLocaleString('vi-VN');
    let updated: HandoverProtocol;
    if (signingTarget === 'deliverer') {
      updated = {
        ...protocol,
        deliverer: {
          ...protocol.deliverer,
          name: name || protocol.deliverer.name,
          signature: sigUrl,
          signedAt: nowStr,
        },
        updatedAt: new Date().toISOString(),
      };
    } else {
      updated = {
        ...protocol,
        receiver: {
          ...protocol.receiver,
          name: name || protocol.receiver.name,
          signature: sigUrl,
          signedAt: nowStr,
        },
        status: 'completed',
        updatedAt: new Date().toISOString(),
      };
    }
    onUpdateProtocol(updated);
  };

  const handleSavePhotos = (photos: DevicePhoto[]) => {
    const updated: HandoverProtocol = {
      ...protocol,
      attachedPhotos: photos,
      updatedAt: new Date().toISOString(),
    };
    onUpdateProtocol(updated);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4">
        <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base sm:text-lg">{protocol.protocolNumber}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      protocol.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : protocol.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {protocol.status === 'completed'
                      ? '✓ Đã bàn giao'
                      : protocol.status === 'pending'
                      ? '⏳ Chờ bàn giao'
                      : 'Dự thảo'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate max-w-md">{protocol.title}</p>
              </div>
            </div>

            {/* Quick Action Buttons in Header */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQrBadgeOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Xem mã QR dán nhãn"
              >
                <QrCode className="w-3.5 h-3.5" /> Mã QR
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> In
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExportingPDF}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                {isExportingPDF ? exportProgress || 'Đang xuất PDF...' : 'Xuất PDF'}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 bg-slate-50/70">
            <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'details'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-4 h-4" />
                Chi tiết & Thiết bị ({protocol.devices.length})
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'photos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-4 h-4" />
                Ảnh chụp thiết bị ({protocol.attachedPhotos?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                Văn bản in A4 / PDF
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-4 h-4" />
                Lịch sử quét QR ({protocol.scanHistory?.length || 0})
              </button>
            </div>

            <button
              onClick={() => onEdit(protocol)}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-200/60 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
          </div>

          {/* Modal Main Content */}
          <div className="overflow-y-auto p-6 flex-1 space-y-6">
            {/* TAB 1: DETAILS */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Instant Verification Banner */}
                {protocol.recordedInstantTimestamp ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-200/80 text-emerald-800 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold">Đã ghi nhận ngày giờ bàn giao tức thời qua QR Code</p>
                        <p className="text-slate-600 mt-0.5">
                          Thời gian chuẩn: {new Date(protocol.recordedInstantTimestamp).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" /> ĐÃ XÁC THỰC
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-200/80 text-amber-800 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold">Chưa ghi nhận thời gian bàn giao tức thời</p>
                        <p className="text-amber-800/80 mt-0.5">
                          Quét mã QR bằng camera điện thoại hoặc nhấn nút bên dưới để ghi nhận ngay lập tức
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleInstantRecord}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      ⚡ Ghi nhận tức thời ngay
                    </button>
                  </div>
                )}

                {/* Parties Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Party A */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="font-bold uppercase tracking-wider text-blue-900">
                        Bên Giao (Bên A)
                      </span>
                      {protocol.deliverer.signature ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          ✓ Đã ký số
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSigningTarget('deliverer');
                            setSignatureModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <PenTool className="w-3 h-3" /> Ký số ngay
                        </button>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{protocol.deliverer.name}</p>
                    <p className="text-slate-600">{protocol.deliverer.position} - {protocol.deliverer.department}</p>
                    <p className="text-slate-500">Mã NV: {protocol.deliverer.employeeId || 'Không có'} | SĐT: {protocol.deliverer.phone}</p>
                    {protocol.deliverer.signature && (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Chữ ký điện tử:</span>
                        <img src={protocol.deliverer.signature} alt="Sig" className="h-9 max-w-28 object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Party B */}
                  <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                      <span className="font-bold uppercase tracking-wider text-emerald-900">
                        Bên Nhận (Bên B)
                      </span>
                      {protocol.receiver.signature ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          ✓ Đã ký số
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSigningTarget('receiver');
                            setSignatureModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <PenTool className="w-3 h-3" /> Ký số tiếp nhận
                        </button>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{protocol.receiver.name}</p>
                    <p className="text-slate-600">{protocol.receiver.position} - {protocol.receiver.department}</p>
                    <p className="text-slate-500">Mã NV: {protocol.receiver.employeeId || 'Không có'} | SĐT: {protocol.receiver.phone}</p>
                    {protocol.receiver.signature && (
                      <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Chữ ký điện tử:</span>
                        <img src={protocol.receiver.signature} alt="Sig" className="h-9 max-w-28 object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Devices Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Danh mục thiết bị ({protocol.devices.length})
                    </h3>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <tr>
                          <th className="p-3 w-10 text-center">STT</th>
                          <th className="p-3">Tên thiết bị</th>
                          <th className="p-3">Mã tài sản</th>
                          <th className="p-3">Số Serial (S/N)</th>
                          <th className="p-3 text-center">SL</th>
                          <th className="p-3">Tình trạng thực tế</th>
                          <th className="p-3">Phụ kiện đi kèm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {protocol.devices.map((device, idx) => (
                          <tr key={device.id} className="hover:bg-slate-50/70">
                            <td className="p-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{device.name}</p>
                              {device.specifications && (
                                <p className="text-[11px] text-slate-500 mt-0.5">{device.specifications}</p>
                              )}
                            </td>
                            <td className="p-3 font-mono font-semibold text-blue-700">{device.code}</td>
                            <td className="p-3 font-mono text-slate-700">{device.serialNumber || '-'}</td>
                            <td className="p-3 text-center font-bold">{device.quantity}</td>
                            <td className="p-3 text-emerald-700 font-medium">{device.condition}</td>
                            <td className="p-3 text-slate-600 text-[11px]">{device.accessories || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ATTACHED PHOTOS (Requested Feature) */}
            {activeTab === 'photos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Bằng chứng hình ảnh thiết bị ({protocol.attachedPhotos?.length || 0})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Hình ảnh chụp tình trạng máy móc, tem serial trước khi bàn giao được lưu trữ cùng biên bản
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhotoModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> Chụp thêm ảnh
                  </button>
                </div>

                {!protocol.attachedPhotos || protocol.attachedPhotos.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">Chưa có ảnh chụp thiết bị nào</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Hãy chụp ảnh thực tế ngoại quan, tem serial hoặc các phụ kiện để tăng tính minh bạch
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotoModalOpen(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-xs cursor-pointer"
                    >
                      Bật máy ảnh để chụp ngay
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {protocol.attachedPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setPreviewPhoto(photo)}
                        className="group cursor-pointer rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all"
                      >
                        <div className="aspect-4/3 bg-slate-100 overflow-hidden relative">
                          <img
                            src={photo.dataUrl}
                            alt={photo.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                            Phóng to
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-xs text-slate-800 truncate" title={photo.caption}>
                            {photo.caption || 'Ảnh thiết bị'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{photo.takenAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: A4 / PDF PRINT PREVIEW */}
            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                  <span>
                    Bản in văn bản chuẩn A4 đạt tiêu chuẩn hành chính Việt Nam. Sẵn sàng tải về PDF hoặc in trực tiếp.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white text-blue-800 border border-blue-300 rounded-lg font-semibold hover:bg-blue-100/50 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> In trang
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      disabled={isExportingPDF}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {isExportingPDF ? exportProgress : 'Tải PDF'}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-200/70 p-4 sm:p-8 rounded-2xl overflow-x-auto flex justify-center">
                  <PrintableHandover protocol={protocol} id="printable-handover-document" />
                </div>
              </div>
            )}

            {/* TAB 4: SCAN HISTORY TIMELINE */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Lịch sử quét QR & Hoạt động ghi nhận
                </h3>

                {(!protocol.scanHistory || protocol.scanHistory.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                    Chưa có lần quét QR nào. Hãy quét mã QR để ghi nhận thời gian bàn giao tức thời.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-blue-200 ml-4 space-y-6 py-2">
                    {protocol.scanHistory.map((item) => (
                      <div key={item.id} className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white" />
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{item.deviceOrAction}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{item.formattedTime}</span>
                          </div>
                          {item.scannedBy && (
                            <p className="text-slate-600">Thực hiện bởi: <strong>{item.scannedBy}</strong></p>
                          )}
                          {item.notes && (
                            <p className="text-slate-500 italic text-[11px]">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signature Pad Modal */}
      <SignaturePadModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onSave={handleSaveSignature}
        title={signingTarget === 'deliverer' ? 'Ký số Bên Giao (Party A)' : 'Ký số Bên Nhận (Party B)'}
        defaultSignerName={signingTarget === 'deliverer' ? protocol.deliverer.name : protocol.receiver.name}
        roleLabel={signingTarget === 'deliverer' ? 'Bên Giao Thiết Bị' : 'Bên Nhận Tiếp Nhận Thiết Bị'}
      />

      {/* Photo Capture Modal */}
      <PhotoCaptureModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        devices={protocol.devices}
        existingPhotos={protocol.attachedPhotos || []}
        onSavePhotos={handleSavePhotos}
      />

      {/* QR Badge Modal */}
      <QRBadgeModal
        isOpen={qrBadgeOpen}
        onClose={() => setQrBadgeOpen(false)}
        protocol={protocol}
      />

      {/* Fullscreen Photo Lightbox Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-black rounded-2xl overflow-hidden border border-slate-800" onClick={(e) => e.stopPropagation()}>
            <img src={previewPhoto.dataUrl} alt={previewPhoto.caption} className="w-full h-auto max-h-[80vh] object-contain" />
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{previewPhoto.caption || 'Ảnh thiết bị'}</p>
                <p className="text-xs text-slate-400">{previewPhoto.takenAt}</p>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
