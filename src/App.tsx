/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Eye,
  Download,
  Trash2,
  Copy,
  Edit,
  PenTool,
  Camera,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  LayoutGrid,
  ListFilter,
  Plus,
  AlertCircle
} from 'lucide-react';

import { HandoverProtocol, HandoverStatus } from './types/handover';
import {
  loadProtocols,
  saveProtocols,
  saveOrUpdateProtocol,
  deleteProtocol,
  resetToSampleData,
} from './utils/storage';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { ProtocolFormModal } from './components/ProtocolFormModal';
import { HandoverDetailModal } from './components/HandoverDetailModal';
import { QRScannerModal } from './components/QRScannerModal';
import { QRBadgeModal } from './components/QRBadgeModal';
import { exportElementToPDF } from './utils/pdfGenerator';
import { PrintableHandover } from './components/PrintableHandover';

export default function App() {
  const [protocols, setProtocols] = useState<HandoverProtocol[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | HandoverStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [hasPhotoFilter, setHasPhotoFilter] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'receiver'>('newest');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<HandoverProtocol | null>(null);
  
  const [selectedProtocol, setSelectedProtocol] = useState<HandoverProtocol | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [qrBadgeProtocol, setQrBadgeProtocol] = useState<HandoverProtocol | null>(null);

  // Success notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hidden print container for direct export
  const [exportingProtocol, setExportingProtocol] = useState<HandoverProtocol | null>(null);

  // Load from storage on mount
  useEffect(() => {
    const data = loadProtocols();
    setProtocols(data);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveProtocol = (protocol: HandoverProtocol) => {
    const updated = saveOrUpdateProtocol(protocol);
    setProtocols(updated);
    showToast(`Đã lưu thành công biên bản số ${protocol.protocolNumber}`);
    if (selectedProtocol && selectedProtocol.id === protocol.id) {
      setSelectedProtocol(protocol);
    }
  };

  const handleDeleteProtocol = (id: string, code: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa biên bản "${code}" không?`)) {
      const updated = deleteProtocol(id);
      setProtocols(updated);
      showToast(`Đã xóa biên bản ${code}`);
      if (selectedProtocol?.id === id) {
        setIsDetailOpen(false);
        setSelectedProtocol(null);
      }
    }
  };

  const handleCloneProtocol = (source: HandoverProtocol) => {
    const randomNum = Math.floor(10 + Math.random() * 90);
    const cloned: HandoverProtocol = {
      ...source,
      id: `PROTO-${Date.now()}`,
      protocolNumber: `${randomNum}/2026/BBBG-IT`,
      status: 'pending',
      handoverDate: new Date().toISOString().slice(0, 10),
      recordedInstantTimestamp: undefined,
      receiver: {
        ...source.receiver,
        signature: undefined,
        signedAt: undefined,
      },
      scanHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = saveOrUpdateProtocol(cloned);
    setProtocols(updated);
    showToast(`Đã nhân bản biên bản mới ${cloned.protocolNumber}`);
  };

  const handleResetData = () => {
    if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu? (Dữ liệu hiện tại sẽ được thay thế bằng các biên bản mẫu chuẩn)')) {
      const reset = resetToSampleData();
      setProtocols(reset);
      showToast('Đã khôi phục dữ liệu mẫu thành công!');
    }
  };

  // When QR code is scanned to record instant handover
  const handleHandoverRecorded = (updatedProtocol: HandoverProtocol, msg: string) => {
    const updatedList = saveOrUpdateProtocol(updatedProtocol);
    setProtocols(updatedList);
    showToast(msg);
    setSelectedProtocol(updatedProtocol);
    setIsDetailOpen(true);
  };

  // Direct fast PDF export from card/row
  const handleFastExportPDF = async (protocol: HandoverProtocol) => {
    setExportingProtocol(protocol);
    showToast(`Đang kết xuất PDF biên bản ${protocol.protocolNumber}...`);
    setTimeout(async () => {
      const filename = `Bien_Ban_Ban_Giao_${protocol.protocolNumber.replace(/[/\\?%*:|"<>]/g, '_')}`;
      await exportElementToPDF('quick-export-container', filename);
      setExportingProtocol(null);
      showToast(`Đã tải xuống tệp PDF ${protocol.protocolNumber}`);
    }, 200);
  };

  // Search & Filter Logic
  const filteredProtocols = useMemo(() => {
    return protocols.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchCode = p.protocolNumber.toLowerCase().includes(query);
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchReceiver = p.receiver.name.toLowerCase().includes(query);
        const matchDeliverer = p.deliverer.name.toLowerCase().includes(query);
        const matchDept = p.receiver.department?.toLowerCase().includes(query) || p.deliverer.department?.toLowerCase().includes(query);
        const matchDevices = p.devices.some(
          (d) =>
            d.name.toLowerCase().includes(query) ||
            d.code?.toLowerCase().includes(query) ||
            d.serialNumber?.toLowerCase().includes(query)
        );
        if (!matchCode && !matchTitle && !matchReceiver && !matchDeliverer && !matchDept && !matchDevices) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      // Photos Filter
      if (hasPhotoFilter && (!p.attachedPhotos || p.attachedPhotos.length === 0)) {
        return false;
      }

      // Date Filter
      if (dateFilter !== 'all') {
        const pDate = new Date(p.handoverDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - pDate.getTime()) / (1000 * 3600 * 24));

        if (dateFilter === 'today' && diffDays > 0) return false;
        if (dateFilter === 'week' && diffDays > 7) return false;
        if (dateFilter === 'month' && diffDays > 30) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || b.handoverDate).getTime() - new Date(a.createdAt || a.handoverDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || a.handoverDate).getTime() - new Date(b.createdAt || b.handoverDate).getTime();
      }
      if (sortBy === 'receiver') {
        return a.receiver.name.localeCompare(b.receiver.name, 'vi');
      }
      return 0;
    });
  }, [protocols, searchQuery, statusFilter, dateFilter, hasPhotoFilter, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Top Header */}
      <Header
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        onOpenNewProtocol={() => {
          setEditingProtocol(null);
          setIsFormOpen(true);
        }}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* KPI Stats Bar */}
        <StatsBar protocols={protocols} />

        {/* History Management & Filters Section */}
        <section className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo số biên bản, tên người nhận, thiết bị, số Serial S/N..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'all' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({protocols.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'completed' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✓ Đã bàn giao
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⏳ Chờ bàn giao
                </button>
              </div>

              {/* Photo Filter Toggle */}
              <button
                type="button"
                onClick={() => setHasPhotoFilter(!hasPhotoFilter)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  hasPhotoFilter
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Chỉ lọc biên bản có ảnh chụp thiết bị"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Có ảnh chụp</span>
              </button>

              {/* Date Filter Dropdown */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">📅 Toàn thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày qua</option>
                <option value="month">Tháng này</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'receiver')}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="newest">Mới nhất trước</option>
                <option value="oldest">Cũ nhất trước</option>
                <option value="receiver">Tên người nhận (A-Z)</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-slate-600">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'cards' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
                  }`}
                  title="Xem dạng thẻ"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
                  }`}
                  title="Xem dạng bảng"
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Protocols Display Area */}
        {filteredProtocols.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Không tìm thấy biên bản bàn giao phù hợp</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Thử thay đổi từ khóa tìm kiếm hoặc bấm nút bên dưới để tạo một biên bản bàn giao thiết bị mới.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingProtocol(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Lập Biên Bản Mới
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards View Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProtocols.map((protocol) => {
              const isCompleted = protocol.status === 'completed';
              const hasPhotos = protocol.attachedPhotos && protocol.attachedPhotos.length > 0;

              return (
                <div
                  key={protocol.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2 bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {protocol.protocolNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCompleted ? '✓ Đã bàn giao' : '⏳ Chờ bàn giao'}
                        </span>
                      </div>
                      <h3
                        onClick={() => {
                          setSelectedProtocol(protocol);
                          setIsDetailOpen(true);
                        }}
                        className="font-bold text-sm text-slate-900 mt-2 hover:text-blue-600 cursor-pointer line-clamp-1"
                        title={protocol.title}
                      >
                        {protocol.title}
                      </h3>
                    </div>

                    {/* QR Code Icon Badge */}
                    <button
                      type="button"
                      onClick={() => setQrBadgeProtocol(protocol)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Xem & in mã QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 flex-1 text-xs">
                    {/* Timestamp & Instant Badge */}
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {protocol.handoverDate} {protocol.handoverTime ? `(${protocol.handoverTime})` : ''}
                      </span>
                      {protocol.recordedInstantTimestamp && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Quét QR tức thời
                        </span>
                      )}
                    </div>

                    {/* Receiver & Deliverer info */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">Người nhận:</span>
                        <span className="font-semibold text-slate-800">{protocol.receiver.name}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Phòng ban:</span>
                        <span className="text-slate-600 truncate max-w-[180px]">{protocol.receiver.department}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Người bàn giao:</span>
                        <span className="text-slate-700">{protocol.deliverer.name}</span>
                      </div>
                    </div>

                    {/* Devices summary */}
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Thiết bị ({protocol.devices.length}):
                      </p>
                      <div className="space-y-1">
                        {protocol.devices.slice(0, 2).map((dev) => (
                          <div
                            key={dev.id}
                            className="flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-slate-200/70 text-[11px]"
                          >
                            <span className="font-medium text-slate-800 truncate max-w-[190px]" title={dev.name}>
                              {dev.name}
                            </span>
                            <span className="font-mono text-slate-500 text-[10px]">{dev.code}</span>
                          </div>
                        ))}
                        {protocol.devices.length > 2 && (
                          <p className="text-[10px] text-slate-400 italic">
                            + thêm {protocol.devices.length - 2} thiết bị khác...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Attached Photos Thumbnail Strip (Requested Feature) */}
                    {hasPhotos && (
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-purple-700 flex items-center gap-1">
                            <Camera className="w-3 h-3" /> {protocol.attachedPhotos?.length} ảnh hiện trạng:
                          </span>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {protocol.attachedPhotos?.slice(0, 4).map((photo) => (
                            <img
                              key={photo.id}
                              src={photo.dataUrl}
                              alt={photo.caption}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                              title={photo.caption}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProtocol(protocol);
                        setIsDetailOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Chi tiết & PDF
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFastExportPDF(protocol)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                      title="Xuất file PDF nhanh"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingProtocol(protocol);
                        setIsFormOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                      title="Chỉnh sửa biên bản"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCloneProtocol(protocol)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                      title="Nhân bản biên bản"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProtocol(protocol.id, protocol.protocolNumber)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Xóa biên bản"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Số biên bản</th>
                    <th className="p-3.5">Thời gian & Trạng thái</th>
                    <th className="p-3.5">Bên Nhận (Bên B)</th>
                    <th className="p-3.5">Bên Giao (Bên A)</th>
                    <th className="p-3.5">Thiết bị</th>
                    <th className="p-3.5 text-center">Ảnh chụp</th>
                    <th className="p-3.5 text-center">Ký nhận</th>
                    <th className="p-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProtocols.map((protocol) => {
                    const isCompleted = protocol.status === 'completed';
                    const hasPhotos = protocol.attachedPhotos && protocol.attachedPhotos.length > 0;

                    return (
                      <tr key={protocol.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <button
                            onClick={() => {
                              setSelectedProtocol(protocol);
                              setIsDetailOpen(true);
                            }}
                            className="font-bold text-blue-700 hover:underline font-mono text-xs cursor-pointer text-left"
                          >
                            {protocol.protocolNumber}
                          </button>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">{protocol.title}</p>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 ${
                              isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isCompleted ? '✓ Đã bàn giao' : '⏳ Chờ bàn giao'}
                          </span>
                          <p className="text-[11px] text-slate-500">{protocol.handoverDate}</p>
                        </td>

                        <td className="p-3.5">
                          <p className="font-semibold text-slate-900">{protocol.receiver.name}</p>
                          <p className="text-[11px] text-slate-500">{protocol.receiver.department}</p>
                        </td>

                        <td className="p-3.5">
                          <p className="font-medium text-slate-800">{protocol.deliverer.name}</p>
                          <p className="text-[11px] text-slate-500">{protocol.deliverer.department}</p>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-slate-900">{protocol.devices.length} món</span>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">
                            {protocol.devices[0]?.name}
                          </p>
                        </td>

                        <td className="p-3.5 text-center">
                          {hasPhotos ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md font-semibold text-[10px]">
                              <Camera className="w-3 h-3" /> {protocol.attachedPhotos?.length} ảnh
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          {protocol.receiver.signature ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                              <PenTool className="w-3 h-3" /> Đã ký
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium text-[10px]">Chưa ký</span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProtocol(protocol);
                                setIsDetailOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFastExportPDF(protocol)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Tải PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setQrBadgeProtocol(protocol)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Xem mã QR"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProtocol(protocol.id, protocol.protocolNumber)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Hidden printable container for direct PDF export from card */}
      {exportingProtocol && (
        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          <PrintableHandover protocol={exportingProtocol} id="quick-export-container" />
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      <ProtocolFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProtocol(null);
        }}
        onSave={handleSaveProtocol}
        initialProtocol={editingProtocol}
      />

      {/* Detail Modal */}
      <HandoverDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProtocol(null);
        }}
        protocol={selectedProtocol}
        onUpdateProtocol={handleSaveProtocol}
        onEdit={(p) => {
          setIsDetailOpen(false);
          setEditingProtocol(p);
          setIsFormOpen(true);
        }}
      />

      {/* QR Scanner Modal (Instant Handover) */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onHandoverRecorded={handleHandoverRecorded}
        protocols={protocols}
      />

      {/* QR Badge Modal */}
      <QRBadgeModal
        isOpen={!!qrBadgeProtocol}
        onClose={() => setQrBadgeProtocol(null)}
        protocol={qrBadgeProtocol}
      />
    </div>
  );
}
