import React from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Laptop,
  Camera,
  ShieldCheck
} from 'lucide-react';
import { HandoverProtocol } from '../types/handover';

interface StatsBarProps {
  protocols: HandoverProtocol[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ protocols }) => {
  const total = protocols.length;
  const completed = protocols.filter((p) => p.status === 'completed').length;
  const pending = protocols.filter((p) => p.status === 'pending').length;
  const totalDevices = protocols.reduce((acc, p) => acc + p.devices.reduce((dAcc, d) => dAcc + (d.quantity || 1), 0), 0);
  const totalPhotos = protocols.reduce((acc, p) => acc + (p.attachedPhotos?.length || 0), 0);
  const verifiedInstant = protocols.filter((p) => !!p.recordedInstantTimestamp).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Tổng biên bản */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng biên bản</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{total}</p>
        </div>
      </div>

      {/* 2. Đã bàn giao */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đã bàn giao</p>
          <p className="text-xl font-bold text-emerald-700 mt-0.5">{completed}</p>
        </div>
      </div>

      {/* 3. Chờ bàn giao */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Chờ bàn giao</p>
          <p className="text-xl font-bold text-amber-700 mt-0.5">{pending}</p>
        </div>
      </div>

      {/* 4. Tổng thiết bị */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Laptop className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng thiết bị</p>
          <p className="text-xl font-bold text-indigo-700 mt-0.5">{totalDevices}</p>
        </div>
      </div>

      {/* 5. Ảnh chụp đính kèm */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <Camera className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ảnh hiện trạng</p>
          <p className="text-xl font-bold text-purple-700 mt-0.5">{totalPhotos}</p>
        </div>
      </div>

      {/* 6. Quét QR tức thời */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Xác thực tức thời</p>
          <p className="text-xl font-bold text-cyan-700 mt-0.5">{verifiedInstant}</p>
        </div>
      </div>
    </div>
  );
};
