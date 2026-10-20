export interface DevicePhoto {
  id: string;
  dataUrl: string; // Base64 data URL
  caption?: string; // Chú thích ảnh (VD: Tem Serial, Mặt trước máy, Vết trầy xước)
  takenAt: string; // Thời gian chụp
  deviceId?: string; // Thuộc thiết bị cụ thể nào
}

export interface DeviceItem {
  id: string;
  code: string; // Mã tài sản, ví dụ: TS-LAP-2026-088
  name: string; // Tên thiết bị, ví dụ: MacBook Pro 16" M3 Max
  serialNumber: string; // Số S/N
  category: 'laptop' | 'desktop' | 'monitor' | 'phone' | 'network' | 'accessory' | 'other';
  specifications: string; // CPU, RAM, SSD, màn hình...
  quantity: number;
  unit: string; // Cái, Bộ, Chiếc
  condition: string; // Mới 100%, Đã qua sử dụng 98%, Hoạt động tốt...
  accessories: string; // Sạc zin, cáp Type-C, chuột không dây, túi chống sốc...
  warrantyPeriod?: string; // Bảo hành đến tháng...
  notes?: string;
  photos?: DevicePhoto[]; // Ảnh chụp thiết bị đính kèm
}

export interface PartyInfo {
  name: string; // Họ tên
  employeeId?: string; // Mã nhân viên
  position: string; // Chức vụ
  department: string; // Phòng ban / Đơn vị
  phone: string; // Số điện thoại
  email?: string; // Email liên hệ
  signature?: string; // Data URL hình ảnh chữ ký số
  signedAt?: string; // Thời gian ký
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string; // ISO String
  formattedTime: string; // HH:mm:ss DD/MM/YYYY
  deviceOrAction: string;
  scannedBy?: string;
  notes?: string;
}

export type HandoverStatus = 'draft' | 'pending' | 'completed' | 'returned';

export interface HandoverProtocol {
  id: string; // Mã hệ thống duy nhất (UUID/Timestamp)
  protocolNumber: string; // Số biên bản: 01/2026/BBBG-IT
  companyName: string; // Tên công ty/Tổ chức
  companyAddress?: string; // Địa chỉ
  companyLogo?: string; // Logo tùy chọn
  title: string; // Tiêu đề biên bản
  handoverDate: string; // Ngày bàn giao (YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm)
  handoverTime?: string; // Giờ bàn giao (HH:mm)
  recordedInstantTimestamp?: string; // Timestamp chính xác khi quét QR ghi nhận tức thời
  location: string; // Địa điểm bàn giao
  status: HandoverStatus;
  
  // Bên giao (Bên A)
  deliverer: PartyInfo;
  
  // Bên nhận (Bên B)
  receiver: PartyInfo;

  // Người giám sát / Làm chứng (Tùy chọn)
  witness?: PartyInfo;

  // Danh mục thiết bị
  devices: DeviceItem[];

  // Hình ảnh chụp thiết bị và phụ kiện bàn giao
  attachedPhotos?: DevicePhoto[];

  // Điều khoản & trách nhiệm
  terms: string[];

  // Lịch sử quét QR
  scanHistory: ScanHistoryItem[];

  // Ghi chú chung
  generalNotes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface QuickStats {
  total: number;
  completed: number;
  pending: number;
  totalDevices: number;
}
