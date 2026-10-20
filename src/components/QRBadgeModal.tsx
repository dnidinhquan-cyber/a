import React, { useState, useEffect } from 'react';
import { X, Download, Printer, Check, Copy } from 'lucide-react';
import { generateQRCodeDataURL } from '../utils/qrHelper';
import { HandoverProtocol, DeviceItem } from '../types/handover';

interface QRBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocol?: HandoverProtocol | null;
  device?: DeviceItem | null;
}

export const QRBadgeModal: React.FC<QRBadgeModalProps> = ({
  isOpen,
  onClose,
  protocol,
  device,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const title = device ? `Mã QR Tài Sản: ${device.code || device.name}` : `Mã QR Biên Bản: ${protocol?.protocolNumber}`;
  const qrRawText = device
    ? JSON.stringify({ type: 'DEVICE_ASSET', code: device.code, sn: device.serialNumber, name: device.name })
    : protocol?.id || '';

  useEffect(() => {
    if (isOpen && (protocol || device)) {
      generateQRCodeDataURL(qrRawText, { width: 320, margin: 2 }).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [isOpen, protocol, device, qrRawText]);

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${device ? device.code || 'device' : protocol?.protocolNumber || 'handover'}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(qrRawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>In Tem QR - ${title}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .badge { border: 2px dashed #334155; padding: 24px; border-radius: 12px; width: 280px; }
            h2 { margin: 0 0 8px 0; font-size: 16px; }
            p { margin: 4px 0; font-size: 12px; color: #475569; }
            img { width: 200px; height: 200px; margin: 12px 0; }
          </style>
        </head>
        <body>
          <div class="badge">
            <h2>${device ? 'TEM QUẢN LÝ THIẾT BỊ' : 'XÁC THỰC BÀN GIAO'}</h2>
            <p><strong>${device ? device.name : protocol?.title}</strong></p>
            <p>Mã: <strong>${device ? device.code : protocol?.protocolNumber}</strong></p>
            ${qrDataUrl ? `<img src="${qrDataUrl}" />` : ''}
            <p style="font-size: 10px; color: #64748b;">Quét để xác nhận bàn giao tức thời</p>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-52 h-52 object-contain" />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                Đang tạo mã QR...
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-800">
              {device ? device.name : protocol?.protocolNumber}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Dán mã này lên thiết bị hoặc biên bản để quét ghi nhận ngày giờ bàn giao tức thời
            </p>
          </div>

          <div className="flex items-center gap-2 w-full pt-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Đã sao chép' : 'Sao chép mã'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPNG}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Tải ảnh PNG
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              title="In tem dán nhãn"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
