import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Globe,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Edit2,
  Send,
  Calendar,
  X,
  Sliders,
  Check,
} from 'lucide-react';
import { ConnectedChannel, JobPosition, PublishLog } from '../types';

interface ChannelsViewProps {
  channels: ConnectedChannel[];
  onUpdateChannels: (channels: ConnectedChannel[]) => void;
  jobs: JobPosition[];
  publishLogs: PublishLog[];
  onPublishJobToChannels: (jobId: string, channelIds: string[], customMessage?: string) => void;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  channels,
  onUpdateChannels,
  jobs,
  publishLogs,
  onPublishJobToChannels,
}) => {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ConnectedChannel | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formAccountId, setFormAccountId] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // 1-Click Publish Modal States
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(channels.map((c) => c.id));
  const [customPublishText, setCustomPublishText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);

  // Toggle password visibility
  const togglePasswordVisibility = (channelId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [channelId]: !prev[channelId],
    }));
  };

  // Open Edit Modal
  const handleOpenEdit = (channel: ConnectedChannel) => {
    setEditingChannel(channel);
    setFormName(channel.name);
    setFormUrl(channel.webUrl);
    setFormAccountId(channel.accountId);
    setFormPassword(channel.passwordMasked);
    setIsAddModalOpen(true);
  };

  // Save Channel (Add or Edit)
  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUrl.trim() || !formAccountId.trim()) return;

    if (editingChannel) {
      // Update
      const updated = channels.map((c) =>
        c.id === editingChannel.id
          ? {
              ...c,
              name: formName,
              webUrl: formUrl,
              accountId: formAccountId,
              passwordMasked: formPassword,
            }
          : c
      );
      onUpdateChannels(updated);
    } else {
      // Add
      const newChan: ConnectedChannel = {
        id: `CHAN-0${channels.length + 1}`,
        name: formName,
        webUrl: formUrl,
        accountId: formAccountId,
        passwordMasked: formPassword || '•••••••••••••',
        status: 'Connected',
        lastPublishedAt: 'Chưa đăng tin',
        totalJobsPosted: 0,
        autoSync: true,
        platformType: 'internal',
      };
      onUpdateChannels([...channels, newChan]);
    }

    setIsAddModalOpen(false);
    setEditingChannel(null);
    setFormName('');
    setFormUrl('');
    setFormAccountId('');
    setFormPassword('');
  };

  // Test Connection
  const handleTestConnection = (channelId: string) => {
    const updated = channels.map((c) => (c.id === channelId ? { ...c, status: 'Syncing' as const } : c));
    onUpdateChannels(updated);

    setTimeout(() => {
      const final = channels.map((c) => (c.id === channelId ? { ...c, status: 'Connected' as const } : c));
      onUpdateChannels(final);
    }, 1200);
  };

  // Execute 1-Click Publish
  const handleExecutePublish = () => {
    if (!selectedJobId || selectedChannelIds.length === 0) return;

    setIsPublishing(true);
    setTimeout(() => {
      onPublishJobToChannels(selectedJobId, selectedChannelIds, customPublishText);
      setIsPublishing(false);
      setPublishFeedback(`Đã đăng tải thành công lên ${selectedChannelIds.length} kênh kết nối!`);
      setTimeout(() => {
        setPublishFeedback(null);
        setIsPublishModalOpen(false);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1720px] w-full mx-auto">
      {/* 1. Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1C1E] dark:text-white tracking-tight">
            Kênh Tuyển Dụng & Đăng Tải Tự Động
          </h2>
          <p className="text-xs text-[#8E8E93] mt-1">
            Lưu trữ thông tin xác thực và tự động đồng bộ bài đăng tin 1-click lên các cổng tuyển dụng.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setEditingChannel(null);
              setFormName('');
              setFormUrl('');
              setFormAccountId('');
              setFormPassword('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#1C1C1E] dark:text-white btn-fluent-glass rounded-full cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
            <span>Thêm Kênh Mới</span>
          </button>

          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white btn-fluent-primary rounded-full cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Đăng Tin 1-Click</span>
          </button>
        </div>
      </div>

      {/* 2. Connected Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {channels.map((channel) => {
          const isPassVisible = visiblePasswords[channel.id];

          return (
            <div
              key={channel.id}
              className="neumorphic-card neumorphic-card-hover rounded-[22px] p-5 flex flex-col justify-between transition-all"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono text-[#8E8E93]">{channel.id}</span>
                    <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white">{channel.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {channel.status === 'Connected' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#34C759] dark:text-[#30D158] bg-[#34C759]/12 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đã kết nối</span>
                      </span>
                    ) : channel.status === 'Syncing' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/12 px-2.5 py-0.5 rounded-full">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Đang kiểm tra...</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF3B30] dark:text-[#FF453A] bg-[#FF3B30]/12 px-2.5 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" />
                        <span>Lỗi kết nối</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Connection Specs */}
                <div className="space-y-2.5 text-xs bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3.5 rounded-[14px] border border-black/[0.05] dark:border-white/[0.06] font-mono">
                  {/* Web URL */}
                  <div>
                    <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider block font-sans">
                      Link Web Tuyển Dụng
                    </span>
                    <a
                      href={channel.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007AFF] dark:text-[#0A84FF] hover:underline truncate block mt-0.5"
                    >
                      {channel.webUrl}
                    </a>
                  </div>

                  {/* Account ID */}
                  <div>
                    <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider block font-sans">
                      ID / Tài Khoản
                    </span>
                    <span className="text-[#1C1C1E] dark:text-white select-all mt-0.5 block">{channel.accountId}</span>
                  </div>

                  {/* Password / Token */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider block font-sans">
                        Mật Khẩu / API Token
                      </span>
                      <span className="text-[#1C1C1E] dark:text-white mt-0.5 block">
                        {isPassVisible ? 'Secured@Token2026' : channel.passwordMasked}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(channel.id)}
                      className="p-1.5 text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
                    >
                      {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-xs text-[#8E8E93] pt-1 tabular-nums">
                  <span>Tin đã đăng: <strong className="font-mono text-[#1C1C1E] dark:text-white">{channel.totalJobsPosted}</strong></span>
                  <span>Đăng gần nhất: <span className="font-mono">{channel.lastPublishedAt.split(' ')[0]}</span></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTestConnection(channel.id)}
                  className="text-xs font-medium text-[#3C3C43] dark:text-[#EBEBF5] hover:text-[#007AFF] dark:hover:text-[#0A84FF] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Kiểm tra kết nối</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(channel)}
                  className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:opacity-80 flex items-center gap-1 cursor-pointer transition-opacity"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Sửa thông tin</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Publish Logs Table */}
      <div className="glass-panel rounded-[24px] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white">Nhật Ký Đăng Tải Lên Các Kênh</h3>
            <p className="text-xs text-[#8E8E93] mt-0.5">Lịch sử các lần hệ thống tự động đẩy tin tuyển dụng</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.08] text-[#8E8E93]">
                <th className="pb-3 font-semibold">Mã Đăng Tải</th>
                <th className="pb-3 font-semibold">Vị Trí Công Việc</th>
                <th className="pb-3 font-semibold">Kênh Đã Phát Hành</th>
                <th className="pb-3 font-semibold">Thời Điểm</th>
                <th className="pb-3 font-semibold text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
              {publishLogs.map((log) => (
                <tr key={log.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                  <td className="py-3 font-mono text-[#8E8E93]">{log.id}</td>
                  <td className="py-3 font-semibold text-[#1C1C1E] dark:text-white">{log.jobTitle}</td>
                  <td className="py-3 text-[#3C3C43] dark:text-[#EBEBF5]">
                    <span className="truncate block max-w-sm">{log.channelNames.join(', ')}</span>
                  </td>
                  <td className="py-3 font-mono text-[#8E8E93] tabular-nums">{log.publishedAt}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[#34C759] dark:text-[#30D158] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{log.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add or Edit Channel */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-[26px] border border-black/[0.08] dark:border-white/[0.12] max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white">
                {editingChannel ? 'Cập Nhật Kênh Kết Nối' : 'Thêm Kênh Tuyển Dụng Mới'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveChannel} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Tên Kênh / Nền Tảng <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tuyển dụng 24h, ITviec, Cổng nội bộ..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Link Web Đăng Nhập / API Endpoint <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://tuyendung.domain.com/login"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Tên Đăng Nhập / ID Tài Khoản <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="hr.recruiter@company.vn"
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Mật Khẩu / Mật Mã Ứng Dụng (Token)
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu hoặc để trống để giữ nguyên"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5] btn-fluent-glass rounded-full cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white btn-fluent-primary rounded-full cursor-pointer"
                >
                  {editingChannel ? 'Cập Nhật' : 'Lưu Kênh Kết Nối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: 1-Click Publish Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-[26px] border border-black/[0.08] dark:border-white/[0.12] max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[10px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white">
                  Đăng Tải Đồng Loạt Lên Các Kênh
                </h3>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {publishFeedback ? (
              <div className="p-4 bg-[#34C759]/12 border border-[#34C759]/25 rounded-[16px] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#34C759] mx-auto" />
                <p className="text-xs font-bold text-[#1C1C1E] dark:text-white">{publishFeedback}</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Select Job */}
                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                    Chọn Vị Trí Cần Phát Hành Tin:
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] font-medium text-[#1C1C1E] dark:text-white"
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} ({job.level}) - {job.salaryRange}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Channels Checkboxes */}
                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-2">
                    Các Kênh Nhận Tin ({selectedChannelIds.length}/{channels.length} kênh):
                  </label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto border border-black/[0.06] dark:border-white/[0.08] rounded-[14px] p-3 bg-[#F2F2F7] dark:bg-[#2C2C2E]">
                    {channels.map((chan) => {
                      const isChecked = selectedChannelIds.includes(chan.id);
                      return (
                        <label
                          key={chan.id}
                          className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-[#3A3A3C] rounded-[10px] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedChannelIds([...selectedChannelIds, chan.id]);
                                } else {
                                  setSelectedChannelIds(selectedChannelIds.filter((id) => id !== chan.id));
                                }
                              }}
                              className="rounded text-[#007AFF] accent-[#007AFF]"
                            />
                            <span className="font-medium text-[#1C1C1E] dark:text-white">{chan.name}</span>
                          </div>
                          <span className="font-mono text-[11px] text-[#8E8E93]">{chan.accountId}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Note */}
                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                    Ghi Chú Đợt Phát Hành (Tùy chọn):
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Đợt tuyển dụng Q4 - Đăng tin gấp trong 14 ngày"
                    value={customPublishText}
                    onChange={(e) => setCustomPublishText(e.target.value)}
                    className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5] btn-fluent-glass rounded-full cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleExecutePublish}
                    disabled={isPublishing || selectedChannelIds.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white btn-fluent-primary rounded-full cursor-pointer disabled:opacity-50"
                  >
                    {isPublishing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang đồng bộ lên các kênh...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Bắt Đầu Đăng Tải</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
