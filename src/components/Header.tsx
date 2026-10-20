import React from 'react';
import {
  QrCode,
  Plus,
  Download,
  RotateCcw,
  Sparkles,
  FileCheck2
} from 'lucide-react';
import { exportDataAsJSON } from '../utils/storage';

interface HeaderProps {
  onOpenQRScanner: () => void;
  onOpenNewProtocol: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQRScanner,
  onOpenNewProtocol,
  onResetData,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Handover<span className="text-blue-600">Pro</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                <Sparkles className="w-3 h-3 text-amber-500" /> Bàn Giao Thiết Bị & QR
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Quét QR ghi nhận tức thời • Ký số điện tử • Chụp ảnh hiện trạng • Xuất PDF chuẩn hành chính
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Scanner */}
          <button
            type="button"
            onClick={onOpenQRScanner}
            className="group relative flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-200"></span>
            </span>
            <QrCode className="w-4 h-4" />
            <span>Quét QR Tức Thời</span>
          </button>

          {/* New Protocol */}
          <button
            type="button"
            onClick={onOpenNewProtocol}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-300" />
            <span>Lập Biên Bản Mới</span>
          </button>

          {/* Utilities Dropdown / Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 border-l border-slate-200 pl-2.5">
            <button
              type="button"
              onClick={exportDataAsJSON}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Sao lưu dữ liệu ra file JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onResetData}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Khôi phục dữ liệu mẫu ban đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
