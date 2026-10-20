import { HandoverProtocol } from '../types/handover';

const STORAGE_KEY = 'HANDOVER_PRO_PROTOCOLS_V1';

export const DEFAULT_TERMS = [
  'Bên nhận có trách nhiệm bảo quản, sử dụng thiết bị đúng mục đích công việc và tuân thủ các quy định bảo mật thông tin của công ty.',
  'Mọi hư hỏng, mất mát do nguyên nhân chủ quan (làm rơi vỡ, vô nước, can thiệp phần cứng trái phép) thì Bên nhận phải chịu trách nhiệm bồi thường theo thời giá hiện hành.',
  'Khi chấm dứt hợp đồng lao động, chuyển công tác hoặc có yêu cầu thu hồi từ quản lý, Bên nhận có trách nhiệm hoàn trả đầy đủ thiết bị và các phụ kiện đi kèm trong tình trạng hoạt động tốt.',
  'Biên bản này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để làm căn cứ theo dõi tài sản.',
];

export const INITIAL_SAMPLE_PROTOCOLS: HandoverProtocol[] = [
  {
    id: 'PROTO-20261020-001',
    protocolNumber: '01/2026/BBBG-IT',
    companyName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG NEXUS',
    companyAddress: 'Tầng 12, Tòa nhà Bitexco, Q.1, TP. Hồ Chí Minh',
    title: 'BIÊN BẢN BÀN GIAO THIẾT BỊ LÀM VIỆC & CNTT',
    handoverDate: '2026-10-20',
    handoverTime: '09:30',
    recordedInstantTimestamp: '2026-10-20T09:30:15+07:00',
    location: 'Phòng IT Support - Tầng 12',
    status: 'completed',
    deliverer: {
      name: 'Nguyễn Văn An',
      employeeId: 'IT-0102',
      position: 'Trưởng bộ phận Quản trị Thiết bị IT',
      department: 'Khối Công Nghệ Thông Tin (IT Ops)',
      phone: '0908 123 456',
      email: 'an.nguyen@nexuscorp.vn',
      signedAt: '2026-10-20 09:32:00',
    },
    receiver: {
      name: 'Trần Thị Mai',
      employeeId: 'NV-2024-88',
      position: 'Senior Data Scientist',
      department: 'Trung Tâm AI & Dữ Liệu Lớn',
      phone: '0987 654 321',
      email: 'mai.tran@nexuscorp.vn',
      signedAt: '2026-10-20 09:35:10',
    },
    witness: {
      name: 'Lê Hoàng Nam',
      position: 'Giám đốc Nhân sự & Vận hành',
      department: 'Phòng Hành chính Nhân sự',
      phone: '0912 345 678',
    },
    devices: [
      {
        id: 'dev-001',
        code: 'TS-MBP-2026-015',
        name: 'Laptop Apple MacBook Pro 16" M3 Pro',
        serialNumber: 'C02G87XYZ918',
        category: 'laptop',
        specifications: 'Apple M3 Pro 12-core CPU, 36GB Unified RAM, 1TB SSD, Space Black',
        quantity: 1,
        unit: 'Chiếc',
        condition: 'Mới 100% nguyên hộp, màn hình sáng đẹp, pin 100%',
        accessories: 'Củ sạc 140W USB-C, cáp MagSafe 3 bọc dù, bao chống sốc Tomtoc',
        warrantyPeriod: 'Chính hãng Apple đến 10/2027',
        notes: 'Đã cài đặt sẵn cấu hình MDM và chứng chỉ bảo mật nội bộ',
      },
      {
        id: 'dev-002',
        code: 'TS-MN-2026-089',
        name: 'Màn hình Dell UltraSharp 27" 4K USB-C Hub',
        serialNumber: 'U2723QE-CN892',
        category: 'monitor',
        specifications: '27 inch 4K (3840 x 2160), IPS Black, 98% DCI-P3, sạc ngược 90W',
        quantity: 1,
        unit: 'Chiếc',
        condition: 'Mới 100%, không điểm chết, chân đế nâng hạ xoay dọc tốt',
        accessories: 'Dây nguồn, cáp Type-C to Type-C, cáp DisplayPort, chân đế zin',
        warrantyPeriod: 'Bảo hành 36 tháng Dell VN',
        notes: 'Trang bị tại bàn làm việc số A-14',
      },
      {
        id: 'dev-003',
        code: 'TS-ACC-2026-302',
        name: 'Bộ phím chuột không dây Logitech MX Keys S + MX Master 3S',
        serialNumber: 'LOGI-COMBO-9912',
        category: 'accessory',
        specifications: 'Kết nối Bluetooth / Logi Bolt, phím gõ êm, chuột quang 8K DPI siêu tĩnh',
        quantity: 1,
        unit: 'Bộ',
        condition: 'Mới 100% fullbox',
        accessories: 'Đầu thu USB Logi Bolt, cáp sạc USB-C',
        warrantyPeriod: '12 tháng chính hãng Digiworld',
      },
    ],
    terms: DEFAULT_TERMS,
    scanHistory: [
      {
        id: 'scan-1',
        timestamp: '2026-10-20T09:30:15+07:00',
        formattedTime: '09:30:15, 20/10/2026',
        deviceOrAction: 'Quét mã QR bàn giao tức thời thành công',
        scannedBy: 'Nguyễn Văn An (Bên Giao)',
        notes: 'Xác nhận kiểm tra máy và đối chiếu số Serial trùng khớp tại bàn IT',
      },
    ],
    generalNotes: 'Thiết bị hoạt động hoàn hảo, đã bàn giao tài khoản SSO công ty và hướng dẫn quy chuẩn an toàn thông tin.',
    createdAt: '2026-10-20T08:00:00.000Z',
    updatedAt: '2026-10-20T09:35:10.000Z',
  },
  {
    id: 'PROTO-20261020-002',
    protocolNumber: '02/2026/BBBG-IT',
    companyName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG NEXUS',
    companyAddress: 'Tầng 12, Tòa nhà Bitexco, Q.1, TP. Hồ Chí Minh',
    title: 'BIÊN BẢN BÀN GIAO MÁY TÍNH XÁCH TAY & BẢN QUYỀN PHẦN MỀM',
    handoverDate: '2026-10-20',
    handoverTime: '14:00',
    location: 'Văn phòng Chi nhánh Hà Nội - P. Kinh Doanh',
    status: 'pending',
    deliverer: {
      name: 'Vũ Đức Thịnh',
      employeeId: 'IT-0108',
      position: 'Kỹ sư Hỗ trợ Kỹ thuật IT',
      department: 'Khối Công Nghệ Thông Tin (IT Ops)',
      phone: '0903 998 877',
      email: 'thinh.vu@nexuscorp.vn',
      signedAt: '2026-10-20 08:30:00',
    },
    receiver: {
      name: 'Hoàng Minh Tuấn',
      employeeId: 'NV-2025-11',
      position: 'Chuyên viên Tư vấn Giải pháp Doanh nghiệp',
      department: 'Phòng Phát Triển Kinh Doanh',
      phone: '0945 667 788',
      email: 'tuan.hoang@nexuscorp.vn',
    },
    devices: [
      {
        id: 'dev-004',
        code: 'TS-THINK-2026-031',
        name: 'Laptop Lenovo ThinkPad T14s Gen 5',
        serialNumber: 'PF40K99L',
        category: 'laptop',
        specifications: 'Intel Core Ultra 7 155H, 32GB RAM LPDDR5x, 1TB NVMe Gen4, 14 inch 2.8K OLED',
        quantity: 1,
        unit: 'Chiếc',
        condition: 'Mới 99%, hoạt động ổn định, phím nảy tốt, pin 98%',
        accessories: 'Sạc nhanh Lenovo 65W GaN Type-C, chuột không dây ThinkPad',
        warrantyPeriod: 'Premier Support đến 05/2027',
        notes: 'Đã dán tem bảo hành và mã tài sản QR',
      },
    ],
    terms: DEFAULT_TERMS,
    scanHistory: [],
    generalNotes: 'Chờ nhân sự nhận máy ký biên bản hoặc quét mã QR xác nhận ngày bàn giao tức thời.',
    createdAt: '2026-10-20T08:15:00.000Z',
    updatedAt: '2026-10-20T08:15:00.000Z',
  },
];

export function loadProtocols(): HandoverProtocol[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_PROTOCOLS));
      return INITIAL_SAMPLE_PROTOCOLS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_PROTOCOLS;
  } catch (err) {
    console.error('Failed to load protocols from localStorage:', err);
    return INITIAL_SAMPLE_PROTOCOLS;
  }
}

export function saveProtocols(protocols: HandoverProtocol[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(protocols));
  } catch (err) {
    console.error('Failed to save protocols to localStorage:', err);
  }
}

export function getProtocolById(id: string): HandoverProtocol | undefined {
  const list = loadProtocols();
  return list.find((p) => p.id === id || p.protocolNumber === id);
}

export function saveOrUpdateProtocol(protocol: HandoverProtocol): HandoverProtocol[] {
  const currentList = loadProtocols();
  const index = currentList.findIndex((p) => p.id === protocol.id);
  const now = new Date().toISOString();

  let updatedList: HandoverProtocol[];
  if (index >= 0) {
    const updatedProtocol = {
      ...protocol,
      updatedAt: now,
    };
    updatedList = [...currentList];
    updatedList[index] = updatedProtocol;
  } else {
    const newProtocol = {
      ...protocol,
      createdAt: protocol.createdAt || now,
      updatedAt: now,
    };
    updatedList = [newProtocol, ...currentList];
  }

  saveProtocols(updatedList);
  return updatedList;
}

export function deleteProtocol(id: string): HandoverProtocol[] {
  const currentList = loadProtocols();
  const updatedList = currentList.filter((p) => p.id !== id);
  saveProtocols(updatedList);
  return updatedList;
}

/**
 * Record Instant Handover via QR Code
 */
export function recordInstantHandover(protocolId: string, options: { scannedBy?: string; notes?: string } = {}): { success: boolean; protocol?: HandoverProtocol; message: string } {
  const currentList = loadProtocols();
  const targetIndex = currentList.findIndex((p) => p.id === protocolId || p.protocolNumber === protocolId);

  if (targetIndex === -1) {
    return {
      success: false,
      message: `Không tìm thấy biên bản với mã "${protocolId}" trong hệ thống!`,
    };
  }

  const protocol = currentList[targetIndex];
  const now = new Date();
  const isoString = now.toISOString();

  // Format date and time for Vietnam locale
  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const formattedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const displayFormatted = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}, ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

  const newScanEvent = {
    id: `scan-${Date.now()}`,
    timestamp: isoString,
    formattedTime: displayFormatted,
    deviceOrAction: 'Quét mã QR ghi nhận ngày bàn giao tức thời',
    scannedBy: options.scannedBy || protocol.receiver.name || 'Người dùng quét mã',
    notes: options.notes || 'Hệ thống tự động cập nhật thời gian bàn giao thực tế và chuyển trạng thái hoàn tất.',
  };

  const updatedProtocol: HandoverProtocol = {
    ...protocol,
    handoverDate: formattedDate,
    handoverTime: formattedTime,
    recordedInstantTimestamp: isoString,
    status: 'completed',
    updatedAt: isoString,
    receiver: {
      ...protocol.receiver,
      signedAt: protocol.receiver.signedAt || displayFormatted,
    },
    scanHistory: [newScanEvent, ...(protocol.scanHistory || [])],
  };

  currentList[targetIndex] = updatedProtocol;
  saveProtocols(currentList);

  return {
    success: true,
    protocol: updatedProtocol,
    message: `Đã ghi nhận bàn giao tức thời lúc ${displayFormatted} cho biên bản ${protocol.protocolNumber}!`,
  };
}

/**
 * Export all data to JSON file
 */
export function exportDataAsJSON() {
  const data = loadProtocols();
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `Handover_Protocols_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Reset to default initial sample protocols
 */
export function resetToSampleData(): HandoverProtocol[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_PROTOCOLS));
  return INITIAL_SAMPLE_PROTOCOLS;
}
