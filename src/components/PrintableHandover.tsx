import React, { useEffect, useState } from 'react';
import { HandoverProtocol } from '../types/handover';
import { generateQRCodeDataURL } from '../utils/qrHelper';
import { CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

interface PrintableHandoverProps {
  protocol: HandoverProtocol;
  id?: string;
}

export const PrintableHandover: React.FC<PrintableHandoverProps> = ({
  protocol,
  id = 'printable-handover-document',
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code for instant lookup
    const payload = JSON.stringify({
      app: 'HANDOVER_PRO',
      protocolId: protocol.id,
      code: protocol.protocolNumber,
      date: protocol.handoverDate,
      ts: protocol.recordedInstantTimestamp || protocol.updatedAt,
    });
    generateQRCodeDataURL(payload, { width: 140, margin: 1 }).then((url) => {
      setQrCodeDataUrl(url);
    });
  }, [protocol]);

  // Format date helper
  const formatDateVN = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `ngày ${parts[2]} tháng ${parts[1]} năm ${parts[0]}`;
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  return (
    <div
      id={id}
      className="bg-white text-slate-900 p-8 sm:p-12 max-w-[850px] mx-auto shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 print:max-w-none text-sm leading-relaxed"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
    >
      {/* Administrative Header */}
      <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-300">
        <div>
          <h4 className="font-bold uppercase text-xs tracking-wider text-slate-800">
            {protocol.companyName || 'CÔNG TY CỔ PHẦN CÔNG NGHỆ NEXUS'}
          </h4>
          {protocol.companyAddress && (
            <p className="text-[11px] text-slate-600 mt-0.5">{protocol.companyAddress}</p>
          )}
          <p className="text-xs font-semibold text-slate-700 mt-2">
            Số: <span className="text-blue-800 font-bold">{protocol.protocolNumber}</span>
          </p>
        </div>

        <div className="text-center">
          <h4 className="font-bold uppercase text-xs tracking-wider text-slate-900">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </h4>
          <p className="text-xs font-semibold text-slate-800 italic mt-0.5">
            Độc lập - Tự do - Hạnh phúc
          </p>
          <div className="w-28 h-0.5 bg-slate-700 mx-auto mt-1 mb-2"></div>
          <p className="text-[11px] text-slate-600 italic">
            TP. Hồ Chí Minh, {formatDateVN(protocol.handoverDate)}
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="text-center py-6">
        <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-wide">
          {protocol.title || 'BIÊN BẢN BÀN GIAO THIẾT BỊ'}
        </h1>
        <p className="text-xs text-slate-500 italic mt-1">
          (V/v: Bàn giao, tiếp nhận và quản lý trang thiết bị công nghệ)
        </p>
      </div>

      {/* Real-time Handover Badge */}
      {protocol.recordedInstantTimestamp && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Ghi nhận tức thời:</strong> Đã quét mã QR xác nhận bàn giao vào lúc{' '}
              <span className="font-bold underline">{new Date(protocol.recordedInstantTimestamp).toLocaleTimeString('vi-VN')}</span>{' '}
              ngày <span className="font-bold">{new Date(protocol.recordedInstantTimestamp).toLocaleDateString('vi-VN')}</span>
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 font-semibold text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Xác thực số
          </span>
        </div>
      )}

      {/* Opening & Location */}
      <div className="space-y-1 mb-5 text-xs text-slate-700">
        <p>
          Hôm nay, vào lúc <strong>{protocol.handoverTime || '09:00'}</strong>, {formatDateVN(protocol.handoverDate)}, tại <strong>{protocol.location || 'Văn phòng công ty'}</strong>.
        </p>
        <p>Chúng tôi gồm các bên dưới đây tiến hành lập biên bản bàn giao thiết bị với các nội dung chi tiết sau:</p>
      </div>

      {/* Parties Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Party A - Deliverer */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
            <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-blue-900">
              I. BÊN GIAO (BÊN A)
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md font-medium">Bên giao</span>
          </div>
          <p><span className="text-slate-500">Họ và tên:</span> <strong>{protocol.deliverer.name}</strong></p>
          {protocol.deliverer.employeeId && (
            <p><span className="text-slate-500">Mã nhân viên:</span> <strong>{protocol.deliverer.employeeId}</strong></p>
          )}
          <p><span className="text-slate-500">Chức vụ:</span> {protocol.deliverer.position || 'Nhân viên IT'}</p>
          <p><span className="text-slate-500">Bộ phận/Phòng ban:</span> {protocol.deliverer.department}</p>
          <p><span className="text-slate-500">Số điện thoại:</span> {protocol.deliverer.phone || 'Chưa cập nhật'}</p>
          {protocol.deliverer.email && (
            <p><span className="text-slate-500">Email:</span> {protocol.deliverer.email}</p>
          )}
        </div>

        {/* Party B - Receiver */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
            <h3 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-emerald-900">
              II. BÊN NHẬN (BÊN B)
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-medium">Bên nhận</span>
          </div>
          <p><span className="text-slate-500">Họ và tên:</span> <strong>{protocol.receiver.name}</strong></p>
          {protocol.receiver.employeeId && (
            <p><span className="text-slate-500">Mã nhân viên:</span> <strong>{protocol.receiver.employeeId}</strong></p>
          )}
          <p><span className="text-slate-500">Chức vụ:</span> {protocol.receiver.position || 'Nhân viên tiếp nhận'}</p>
          <p><span className="text-slate-500">Bộ phận/Phòng ban:</span> {protocol.receiver.department}</p>
          <p><span className="text-slate-500">Số điện thoại:</span> {protocol.receiver.phone || 'Chưa cập nhật'}</p>
          {protocol.receiver.email && (
            <p><span className="text-slate-500">Email:</span> {protocol.receiver.email}</p>
          )}
        </div>
      </div>

      {/* Witness (if available) */}
      {protocol.witness && protocol.witness.name && (
        <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-700">III. NGƯỜI LÀM CHỨNG / GIÁM SÁT:</span>{' '}
            <strong>{protocol.witness.name}</strong> - Chức vụ: {protocol.witness.position || 'Giám sát'} ({protocol.witness.department})
          </div>
          {protocol.witness.phone && (
            <span className="text-slate-500">SĐT: {protocol.witness.phone}</span>
          )}
        </div>
      )}

      {/* Equipment Table */}
      <div className="mb-6">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>DANH MỤC TRANG THIẾT BỊ BÀN GIAO CHI TIẾT</span>
          <span className="text-[11px] font-normal text-slate-500">Tổng cộng: {protocol.devices.length} mục</span>
        </h3>

        <div className="overflow-x-auto border border-slate-300 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                <th className="p-2 border-r border-slate-300 text-center w-8">STT</th>
                <th className="p-2 border-r border-slate-300">Tên thiết bị & Thông số</th>
                <th className="p-2 border-r border-slate-300 w-24">Mã tài sản</th>
                <th className="p-2 border-r border-slate-300 w-24">Số Serial (S/N)</th>
                <th className="p-2 border-r border-slate-300 text-center w-12">ĐVT</th>
                <th className="p-2 border-r border-slate-300 text-center w-10">SL</th>
                <th className="p-2 border-r border-slate-300">Tình trạng thực tế</th>
                <th className="p-2">Phụ kiện kèm theo</th>
              </tr>
            </thead>
            <tbody>
              {protocol.devices.map((device, idx) => (
                <tr key={device.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                  <td className="p-2 border-r border-slate-200 text-center font-medium text-slate-600">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-200">
                    <p className="font-bold text-slate-900">{device.name}</p>
                    {device.specifications && (
                      <p className="text-[11px] text-slate-600 italic mt-0.5">{device.specifications}</p>
                    )}
                  </td>
                  <td className="p-2 border-r border-slate-200 font-mono text-[11px] font-semibold text-blue-900">
                    {device.code || '-'}
                  </td>
                  <td className="p-2 border-r border-slate-200 font-mono text-[11px] text-slate-800">
                    {device.serialNumber || '-'}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center text-slate-700">{device.unit || 'Cái'}</td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-900">{device.quantity || 1}</td>
                  <td className="p-2 border-r border-slate-200 text-slate-700">
                    <span className="font-medium text-emerald-800">{device.condition}</span>
                    {device.warrantyPeriod && (
                      <div className="text-[10px] text-slate-500 mt-0.5">BH: {device.warrantyPeriod}</div>
                    )}
                  </td>
                  <td className="p-2 text-slate-700 text-[11px]">{device.accessories || 'Không có'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attached Device Photos Section (Requested Feature) */}
      {protocol.attachedPhotos && protocol.attachedPhotos.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>HÌNH ẢNH THỰC TẾ THIẾT BỊ BÀN GIAO ({protocol.attachedPhotos.length} ảnh)</span>
            <span className="text-[10px] text-slate-500 font-normal italic">Lưu trữ ảnh hiện trạng thiết bị khi bàn giao</span>
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {protocol.attachedPhotos.map((photo) => (
              <div key={photo.id} className="border border-slate-200 bg-white rounded-lg p-1.5 shadow-2xs">
                <div className="aspect-4/3 overflow-hidden rounded bg-slate-100 mb-1">
                  <img
                    src={photo.dataUrl}
                    alt={photo.caption || 'Thiết bị'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] font-semibold text-slate-800 truncate" title={photo.caption}>
                  {photo.caption || 'Ảnh thiết bị'}
                </p>
                <p className="text-[9px] text-slate-400">{photo.takenAt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terms and Commitments */}
      <div className="mb-6 space-y-2">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          ĐIỀU KHOẢN VÀ CAM KẾT TRÁCH NHIỆM
        </h3>
        <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-700">
          {protocol.terms.map((term, i) => (
            <li key={i} className="leading-relaxed">{term}</li>
          ))}
        </ol>
      </div>

      {/* General Notes */}
      {protocol.generalNotes && (
        <div className="mb-6 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
          <strong className="font-semibold">Ghi chú bổ sung:</strong> {protocol.generalNotes}
        </div>
      )}

      {/* Signatures Area */}
      <div className="mt-8 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs">
          {/* Party A Signature */}
          <div className="flex flex-col items-center justify-between min-h-36">
            <div>
              <p className="font-bold uppercase text-slate-800">ĐẠI DIỆN BÊN GIAO</p>
              <p className="text-[10px] text-slate-500 italic">(Ký và ghi rõ họ tên)</p>
            </div>
            {/* Signature image or placeholder */}
            <div className="my-2 h-16 flex items-center justify-center">
              {protocol.deliverer.signature ? (
                <img
                  src={protocol.deliverer.signature}
                  alt="Chữ ký Bên Giao"
                  className="max-h-16 max-w-36 object-contain"
                />
              ) : (
                <div className="text-[11px] text-slate-400 italic border-b border-dashed border-slate-300 px-6 py-2">
                  (Đã ký điện tử)
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900">{protocol.deliverer.name}</p>
              {protocol.deliverer.signedAt && (
                <p className="text-[10px] text-slate-500 mt-0.5">Ký lúc: {protocol.deliverer.signedAt}</p>
              )}
            </div>
          </div>

          {/* Party B Signature */}
          <div className="flex flex-col items-center justify-between min-h-36">
            <div>
              <p className="font-bold uppercase text-slate-800">ĐẠI DIỆN BÊN NHẬN</p>
              <p className="text-[10px] text-slate-500 italic">(Ký và ghi rõ họ tên)</p>
            </div>
            {/* Signature image or placeholder */}
            <div className="my-2 h-16 flex items-center justify-center">
              {protocol.receiver.signature ? (
                <img
                  src={protocol.receiver.signature}
                  alt="Chữ ký Bên Nhận"
                  className="max-h-16 max-w-36 object-contain"
                />
              ) : (
                <div className="text-[11px] text-slate-400 italic border-b border-dashed border-slate-300 px-6 py-2">
                  (Chờ ký số hoặc quét QR)
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900">{protocol.receiver.name}</p>
              {protocol.receiver.signedAt && (
                <p className="text-[10px] text-slate-500 mt-0.5">Ký lúc: {protocol.receiver.signedAt}</p>
              )}
            </div>
          </div>

          {/* Verification QR Stamp in Document */}
          <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-between min-h-36 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-200">
            <div>
              <p className="font-bold uppercase text-slate-800 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-blue-700" />
                MÃ TRA CỨU SỐ
              </p>
              <p className="text-[10px] text-slate-500 italic">(Quét QR xác thực)</p>
            </div>
            <div className="my-1 flex items-center justify-center">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="Mã QR tra cứu" className="w-16 h-16 object-contain" />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded"></div>
              )}
            </div>
            <div className="text-[10px] text-slate-500 text-center font-mono">
              {protocol.protocolNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
