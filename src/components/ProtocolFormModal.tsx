import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Camera,
  Check,
  Laptop,
  PenTool,
  Sparkles,
  FileText,
  Calendar,
  Building,
  MapPin,
  ImageIcon
} from 'lucide-react';
import { HandoverProtocol, DeviceItem, DevicePhoto } from '../types/handover';
import { DEFAULT_TERMS } from '../utils/storage';
import { PhotoCaptureModal } from './PhotoCaptureModal';
import { SignaturePadModal } from './SignaturePadModal';

interface ProtocolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (protocol: HandoverProtocol) => void;
  initialProtocol?: HandoverProtocol | null;
}

export const ProtocolFormModal: React.FC<ProtocolFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProtocol,
}) => {
  const [protocolNumber, setProtocolNumber] = useState('');
  const [title, setTitle] = useState('BIÊN BẢN BÀN GIAO THIẾT BỊ CNTT & VĂN PHÒNG');
  const [companyName, setCompanyName] = useState('CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG NEXUS');
  const [companyAddress, setCompanyAddress] = useState('Tầng 12, Tòa nhà Bitexco, Q.1, TP. Hồ Chí Minh');
  const [handoverDate, setHandoverDate] = useState(new Date().toISOString().slice(0, 10));
  const [handoverTime, setHandoverTime] = useState('09:00');
  const [location, setLocation] = useState('Văn phòng chính - Tầng 12');
  const [status, setStatus] = useState<HandoverProtocol['status']>('pending');
  const [generalNotes, setGeneralNotes] = useState('');

  // Deliverer (Party A)
  const [delivererName, setDelivererName] = useState('Nguyễn Văn An');
  const [delivererEmpId, setDelivererEmpId] = useState('IT-0102');
  const [delivererPosition, setDelivererPosition] = useState('Trưởng phòng IT Helpdesk');
  const [delivererDept, setDelivererDept] = useState('Khối Công Nghệ Thông Tin');
  const [delivererPhone, setDelivererPhone] = useState('0908 123 456');
  const [delivererEmail, setDelivererEmail] = useState('an.nguyen@nexuscorp.vn');
  const [delivererSig, setDelivererSig] = useState<string | undefined>(undefined);
  const [delivererSignedAt, setDelivererSignedAt] = useState<string | undefined>(undefined);

  // Receiver (Party B)
  const [receiverName, setReceiverName] = useState('');
  const [receiverEmpId, setReceiverEmpId] = useState('');
  const [receiverPosition, setReceiverPosition] = useState('');
  const [receiverDept, setReceiverDept] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [receiverSig, setReceiverSig] = useState<string | undefined>(undefined);
  const [receiverSignedAt, setReceiverSignedAt] = useState<string | undefined>(undefined);

  // Devices
  const [devices, setDevices] = useState<DeviceItem[]>([
    {
      id: `dev-${Date.now()}`,
      code: `TS-LAP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: 'Laptop Dell Latitude 5440',
      serialNumber: 'DL5440-SN8829',
      category: 'laptop',
      specifications: 'Intel Core i7-1365U, 16GB RAM DDR5, 512GB SSD PCIe NVMe, 14 inch FHD',
      quantity: 1,
      unit: 'Chiếc',
      condition: 'Mới 100% nguyên seal',
      accessories: 'Củ sạc Dell 65W Type-C, chuột không dây Logitech B170, balo laptop Dell',
      warrantyPeriod: 'Bảo hành 24 tháng',
      notes: '',
    },
  ]);

  // Attached Photos
  const [attachedPhotos, setAttachedPhotos] = useState<DevicePhoto[]>([]);

  // Modals state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signingTarget, setSigningTarget] = useState<'deliverer' | 'receiver'>('receiver');

  // Load existing protocol or default
  useEffect(() => {
    if (initialProtocol) {
      setProtocolNumber(initialProtocol.protocolNumber);
      setTitle(initialProtocol.title);
      setCompanyName(initialProtocol.companyName);
      setCompanyAddress(initialProtocol.companyAddress || '');
      setHandoverDate(initialProtocol.handoverDate);
      setHandoverTime(initialProtocol.handoverTime || '09:00');
      setLocation(initialProtocol.location);
      setStatus(initialProtocol.status);
      setGeneralNotes(initialProtocol.generalNotes || '');

      setDelivererName(initialProtocol.deliverer.name);
      setDelivererEmpId(initialProtocol.deliverer.employeeId || '');
      setDelivererPosition(initialProtocol.deliverer.position);
      setDelivererDept(initialProtocol.deliverer.department);
      setDelivererPhone(initialProtocol.deliverer.phone);
      setDelivererEmail(initialProtocol.deliverer.email || '');
      setDelivererSig(initialProtocol.deliverer.signature);
      setDelivererSignedAt(initialProtocol.deliverer.signedAt);

      setReceiverName(initialProtocol.receiver.name);
      setReceiverEmpId(initialProtocol.receiver.employeeId || '');
      setReceiverPosition(initialProtocol.receiver.position);
      setReceiverDept(initialProtocol.receiver.department);
      setReceiverPhone(initialProtocol.receiver.phone);
      setReceiverEmail(initialProtocol.receiver.email || '');
      setReceiverSig(initialProtocol.receiver.signature);
      setReceiverSignedAt(initialProtocol.receiver.signedAt);

      setDevices(initialProtocol.devices || []);
      setAttachedPhotos(initialProtocol.attachedPhotos || []);
    } else {
      // Auto-generate fresh protocol number
      const randomNum = Math.floor(10 + Math.random() * 90);
      setProtocolNumber(`${randomNum}/2026/BBBG-IT`);
      setReceiverName('');
      setReceiverEmpId('');
      setReceiverPosition('');
      setReceiverDept('');
      setReceiverPhone('');
      setReceiverEmail('');
      setReceiverSig(undefined);
      setReceiverSignedAt(undefined);
      setAttachedPhotos([]);
    }
  }, [initialProtocol, isOpen]);

  // Quick Templates
  const applyTemplate = (type: 'dev' | 'designer' | 'sales') => {
    if (type === 'dev') {
      setTitle('BIÊN BẢN BÀN GIAO MÁY TÍNH KỸ SƯ PHÁT TRIỂN PHẦN MỀM');
      setDevices([
        {
          id: `dev-${Date.now()}-1`,
          code: `TS-MBP-${Math.floor(100 + Math.random() * 900)}`,
          name: 'MacBook Pro 16" Apple Silicon M3',
          serialNumber: 'C02G' + Math.floor(100000 + Math.random() * 900000),
          category: 'laptop',
          specifications: '36GB Unified RAM, 1TB SSD, 16.2 inch Liquid Retina XDR',
          quantity: 1,
          unit: 'Chiếc',
          condition: 'Mới 100% nguyên seal',
          accessories: 'Củ sạc Apple 140W Type-C, cáp MagSafe 3, cáp chuyển HDMI',
          warrantyPeriod: 'Bảo hành chính hãng 12 tháng',
        },
      ]);
    } else if (type === 'designer') {
      setTitle('BIÊN BẢN BÀN GIAO THIẾT BỊ ĐỒ HỌA & THIẾT KẾ');
      setDevices([
        {
          id: `dev-${Date.now()}-1`,
          code: `TS-PC-${Math.floor(100 + Math.random() * 900)}`,
          name: 'Máy trạm đồ họa ASUS ProArt Station',
          serialNumber: 'PROART-88912',
          category: 'desktop',
          specifications: 'Intel Core i9-14900K, 64GB RAM DDR5, RTX 4080 16GB, 2TB NVMe Gen4',
          quantity: 1,
          unit: 'Bộ',
          condition: 'Mới 100%',
          accessories: 'Bàn phím cơ, chuột công thái học, dây nguồn',
          warrantyPeriod: '36 tháng',
        },
        {
          id: `dev-${Date.now()}-2`,
          code: `TS-MN-${Math.floor(100 + Math.random() * 900)}`,
          name: 'Màn hình ASUS ProArt 32" 4K HDR',
          serialNumber: 'PA329CV-091',
          category: 'monitor',
          specifications: '32 inch 4K IPS, 100% sRGB, Calman Verified',
          quantity: 1,
          unit: 'Chiếc',
          condition: 'Mới 100% không điểm chết',
          accessories: 'Cáp Thunderbolt 4, cáp HDMI, chân đế',
          warrantyPeriod: '36 tháng',
        },
      ]);
    } else if (type === 'sales') {
      setTitle('BIÊN BẢN BÀN GIAO LAPTOP & THIẾT BỊ DI ĐỘNG KINH DOANH');
      setDevices([
        {
          id: `dev-${Date.now()}-1`,
          code: `TS-LAP-${Math.floor(100 + Math.random() * 900)}`,
          name: 'Laptop HP Envy x360 2-in-1 Touchscreen',
          serialNumber: '5CG' + Math.floor(100000 + Math.random() * 900000),
          category: 'laptop',
          specifications: 'Intel Core i7-1355U, 16GB RAM, 512GB SSD, Cảm ứng gập xoay 360 độ',
          quantity: 1,
          unit: 'Chiếc',
          condition: 'Mới 100%',
          accessories: 'Bút cảm ứng HP Rechargeable MPP2.0 Tilt Pen, sạc 65W, bao da',
          warrantyPeriod: 'Bảo hành 24 tháng',
        },
      ]);
    }
  };

  const handleAddDevice = () => {
    const newDev: DeviceItem = {
      id: `dev-${Date.now()}`,
      code: `TS-DEV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      serialNumber: '',
      category: 'other',
      specifications: '',
      quantity: 1,
      unit: 'Chiếc',
      condition: 'Mới 100%',
      accessories: '',
    };
    setDevices([...devices, newDev]);
  };

  const handleUpdateDevice = (index: number, field: keyof DeviceItem, value: unknown) => {
    const updated = [...devices];
    updated[index] = { ...updated[index], [field]: value };
    setDevices(updated);
  };

  const handleRemoveDevice = (index: number) => {
    setDevices(devices.filter((_, idx) => idx !== index));
  };

  const handleOpenSignature = (target: 'deliverer' | 'receiver') => {
    setSigningTarget(target);
    setSignatureModalOpen(true);
  };

  const handleSaveSignature = (sigUrl: string, name: string) => {
    const nowStr = new Date().toLocaleString('vi-VN');
    if (signingTarget === 'deliverer') {
      setDelivererSig(sigUrl);
      setDelivererSignedAt(nowStr);
      if (name) setDelivererName(name);
    } else {
      setReceiverSig(sigUrl);
      setReceiverSignedAt(nowStr);
      if (name) setReceiverName(name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!protocolNumber.trim()) {
      alert('Vui lòng nhập Số biên bản');
      return;
    }
    if (!receiverName.trim()) {
      alert('Vui lòng nhập Họ tên Người nhận thiết bị (Bên B)');
      return;
    }
    if (devices.length === 0 || !devices[0].name.trim()) {
      alert('Vui lòng thêm ít nhất 01 thiết bị bàn giao');
      return;
    }

    const now = new Date().toISOString();
    const finalProtocol: HandoverProtocol = {
      id: initialProtocol?.id || `PROTO-${Date.now()}`,
      protocolNumber: protocolNumber.trim(),
      companyName,
      companyAddress,
      title,
      handoverDate,
      handoverTime,
      recordedInstantTimestamp: initialProtocol?.recordedInstantTimestamp,
      location,
      status,
      deliverer: {
        name: delivererName.trim(),
        employeeId: delivererEmpId.trim(),
        position: delivererPosition.trim(),
        department: delivererDept.trim(),
        phone: delivererPhone.trim(),
        email: delivererEmail.trim(),
        signature: delivererSig,
        signedAt: delivererSignedAt,
      },
      receiver: {
        name: receiverName.trim(),
        employeeId: receiverEmpId.trim(),
        position: receiverPosition.trim(),
        department: receiverDept.trim(),
        phone: receiverPhone.trim(),
        email: receiverEmail.trim(),
        signature: receiverSig,
        signedAt: receiverSignedAt,
      },
      witness: initialProtocol?.witness,
      devices,
      attachedPhotos,
      terms: initialProtocol?.terms || DEFAULT_TERMS,
      scanHistory: initialProtocol?.scanHistory || [],
      generalNotes,
      createdAt: initialProtocol?.createdAt || now,
      updatedAt: now,
    };

    onSave(finalProtocol);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base sm:text-lg">
                  {initialProtocol ? 'Cập Nhật Biên Bản Bàn Giao' : 'Lập Biên Bản Bàn Giao Thiết Bị Mới'}
                </h2>
                <p className="text-xs text-slate-500">
                  Điền đầy đủ thông tin bên nhận, danh mục thiết bị và chụp ảnh chứng thực
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Quick Templates */}
            {!initialProtocol && (
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Mẫu có sẵn:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyTemplate('dev')}
                    className="px-2.5 py-1 text-xs bg-white text-blue-700 font-medium rounded-lg border border-blue-200 hover:bg-blue-100/50 shadow-2xs transition-colors cursor-pointer"
                  >
                    💻 Laptop Kỹ sư / Dev
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('designer')}
                    className="px-2.5 py-1 text-xs bg-white text-blue-700 font-medium rounded-lg border border-blue-200 hover:bg-blue-100/50 shadow-2xs transition-colors cursor-pointer"
                  >
                    🎨 Máy trạm & Màn hình Design
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('sales')}
                    className="px-2.5 py-1 text-xs bg-white text-blue-700 font-medium rounded-lg border border-blue-200 hover:bg-blue-100/50 shadow-2xs transition-colors cursor-pointer"
                  >
                    💼 Laptop Doanh nhân / Sales
                  </button>
                </div>
              </div>
            )}

            {/* General Protocol Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-600" /> Thông tin chung biên bản
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số biên bản <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={protocolNumber}
                    onChange={(e) => setProtocolNumber(e.target.value)}
                    placeholder="01/2026/BBBG-IT"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono font-bold text-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày bàn giao <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={handoverDate}
                      onChange={(e) => setHandoverDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng thái biên bản
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as HandoverProtocol['status'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="pending">⏳ Chờ bàn giao / Chờ ký nhận</option>
                    <option value="completed">✓ Đã hoàn tất bàn giao</option>
                    <option value="draft">📝 Dự thảo</option>
                    <option value="returned">↩ Đã thu hồi thiết bị</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề biên bản</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Địa điểm bàn giao</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Phòng IT / Chi nhánh..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 pl-8"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Parties Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deliverer (Party A) */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900">
                    BÊN GIAO (BÊN A)
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleOpenSignature('deliverer')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    {delivererSig ? 'Đã ký (Ký lại)' : 'Ký số bên giao'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Họ và tên</label>
                    <input
                      type="text"
                      value={delivererName}
                      onChange={(e) => setDelivererName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Mã nhân viên</label>
                    <input
                      type="text"
                      value={delivererEmpId}
                      onChange={(e) => setDelivererEmpId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Chức danh</label>
                    <input
                      type="text"
                      value={delivererPosition}
                      onChange={(e) => setDelivererPosition(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Phòng ban</label>
                    <input
                      type="text"
                      value={delivererDept}
                      onChange={(e) => setDelivererDept(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Số điện thoại</label>
                    <input
                      type="text"
                      value={delivererPhone}
                      onChange={(e) => setDelivererPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Email</label>
                    <input
                      type="email"
                      value={delivererEmail}
                      onChange={(e) => setDelivererEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {delivererSig && (
                  <div className="p-2 bg-white rounded-lg border border-blue-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Chữ ký điện tử:</span>
                    <img src={delivererSig} alt="Sig" className="h-8 max-w-28 object-contain" />
                  </div>
                )}
              </div>

              {/* Receiver (Party B) */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                    BÊN NHẬN (BÊN B)
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleOpenSignature('receiver')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    {receiverSig ? 'Đã ký (Ký lại)' : 'Ký số bên nhận'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Nguyễn Văn B"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Mã nhân viên</label>
                    <input
                      type="text"
                      value={receiverEmpId}
                      onChange={(e) => setReceiverEmpId(e.target.value)}
                      placeholder="NV-9921"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Chức danh</label>
                    <input
                      type="text"
                      value={receiverPosition}
                      onChange={(e) => setReceiverPosition(e.target.value)}
                      placeholder="Chuyên viên..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Phòng ban</label>
                    <input
                      type="text"
                      value={receiverDept}
                      onChange={(e) => setReceiverDept(e.target.value)}
                      placeholder="Phòng Kinh doanh / Marketing..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Số điện thoại</label>
                    <input
                      type="text"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      placeholder="09xx xxx xxx"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Email</label>
                    <input
                      type="email"
                      value={receiverEmail}
                      onChange={(e) => setReceiverEmail(e.target.value)}
                      placeholder="user@company.com"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {receiverSig && (
                  <div className="p-2 bg-white rounded-lg border border-emerald-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Chữ ký điện tử:</span>
                    <img src={receiverSig} alt="Sig" className="h-8 max-w-28 object-contain" />
                  </div>
                )}
              </div>
            </div>

            {/* Devices Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-blue-600" /> Danh mục trang thiết bị bàn giao ({devices.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddDevice}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm thiết bị
                </button>
              </div>

              <div className="space-y-3">
                {devices.map((device, idx) => (
                  <div
                    key={device.id}
                    className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-md">
                        #{idx + 1}
                      </span>
                      {devices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDevice(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa thiết bị này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                          Tên thiết bị & Model <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={device.name}
                          onChange={(e) => handleUpdateDevice(idx, 'name', e.target.value)}
                          placeholder="VD: Laptop Dell Latitude 5440"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                          Mã tài sản (Asset Code)
                        </label>
                        <input
                          type="text"
                          value={device.code}
                          onChange={(e) => handleUpdateDevice(idx, 'code', e.target.value)}
                          placeholder="TS-LAP-2026-001"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono text-blue-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                          Số Serial (S/N)
                        </label>
                        <input
                          type="text"
                          value={device.serialNumber}
                          onChange={(e) => handleUpdateDevice(idx, 'serialNumber', e.target.value)}
                          placeholder="C02G87XYZ..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Số lượng & ĐVT</label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            min="1"
                            value={device.quantity}
                            onChange={(e) => handleUpdateDevice(idx, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-center font-bold"
                          />
                          <input
                            type="text"
                            value={device.unit}
                            onChange={(e) => handleUpdateDevice(idx, 'unit', e.target.value)}
                            placeholder="Chiếc"
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-center"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Tình trạng</label>
                        <input
                          type="text"
                          value={device.condition}
                          onChange={(e) => handleUpdateDevice(idx, 'condition', e.target.value)}
                          placeholder="Mới 100%, 98%..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-emerald-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Cấu hình kỹ thuật</label>
                        <input
                          type="text"
                          value={device.specifications}
                          onChange={(e) => handleUpdateDevice(idx, 'specifications', e.target.value)}
                          placeholder="CPU, RAM, SSD, kích thước màn hình..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-0.5">Phụ kiện đi kèm</label>
                        <input
                          type="text"
                          value={device.accessories}
                          onChange={(e) => handleUpdateDevice(idx, 'accessories', e.target.value)}
                          placeholder="Củ sạc, cáp, túi xách, chuột không dây..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attached Photos Trigger & Preview Section (Requested Feature) */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    Ảnh chụp thiết bị đính kèm ({attachedPhotos.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Chụp trực tiếp qua camera hoặc tải ảnh tình trạng máy, tem serial vào biên bản
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Chụp / Thêm ảnh
                </button>
              </div>

              {attachedPhotos.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
                  {attachedPhotos.map((photo) => (
                    <div key={photo.id} className="relative rounded-xl border border-slate-200 bg-white p-1 overflow-hidden group shadow-2xs">
                      <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                        <img src={photo.dataUrl} alt={photo.caption} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-slate-700 font-medium truncate mt-1 px-0.5" title={photo.caption}>
                        {photo.caption || 'Ảnh chụp'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setAttachedPhotos(attachedPhotos.filter((p) => p.id !== photo.id))}
                        className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-xs text-slate-400 bg-white/70 rounded-xl border border-dashed border-indigo-200">
                  <ImageIcon className="w-6 h-6 mx-auto mb-1 text-indigo-300" />
                  Chưa có ảnh nào. Nhấn <strong>"Chụp / Thêm ảnh"</strong> để lưu bằng chứng thiết bị.
                </div>
              )}
            </div>

            {/* General Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú chung biên bản</label>
              <textarea
                rows={2}
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Ghi chú về bảo mật, tài khoản, hướng dẫn sử dụng hoặc phụ kiện đặc biệt..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              * Dữ liệu được lưu trữ trực tiếp vào hệ thống và sẵn sàng xuất PDF
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {initialProtocol ? 'Lưu thay đổi' : 'Tạo biên bản'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      <SignaturePadModal
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onSave={handleSaveSignature}
        title={signingTarget === 'deliverer' ? 'Ký số Bên Giao (Bên A)' : 'Ký số Bên Nhận (Bên B)'}
        defaultSignerName={signingTarget === 'deliverer' ? delivererName : receiverName}
        roleLabel={signingTarget === 'deliverer' ? 'Bên Giao Thiết Bị' : 'Bên Nhận Thiết Bị'}
      />

      {/* Photo Capture Modal */}
      <PhotoCaptureModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        devices={devices}
        existingPhotos={attachedPhotos}
        onSavePhotos={(photos) => setAttachedPhotos(photos)}
      />
    </>
  );
};
