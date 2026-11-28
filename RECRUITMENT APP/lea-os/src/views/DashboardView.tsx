import { getAdminSettingsRef } from '../lib/api';
import React from 'react';
import {
  Briefcase,
  Users,
  Mail,
  Award,
  ArrowUpRight,
  Palette,
  Eye,
  CheckCircle2,
  Star,
  ChevronRight,
} from 'lucide-react';
import { Candidate, CandidateStage, JobPosition, PublishLog } from '../types';
import { TabType } from '../components/Sidebar';

interface DashboardViewProps {
  jobs: JobPosition[];
  candidates: Candidate[];
  unprocessedEmailsCount: number;
  publishLogs: PublishLog[];
  onNavigate: (tab: TabType) => void;
  onSelectJobForBanner: (job: JobPosition) => void;
  onSelectCandidateDetails: (candidate: Candidate) => void;
  onFilterCandidatesByStage: (stage: CandidateStage) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  candidates,
  unprocessedEmailsCount,
  publishLogs,
  onNavigate,
  onSelectJobForBanner,
  onSelectCandidateDetails,
  onFilterCandidatesByStage,
}) => {
  const stageCounts: Record<CandidateStage, number> = {
    'Mới nhận': candidates.filter((c) => c.stage === 'Mới nhận').length,
    'Đã thẩm định': candidates.filter((c) => c.stage === 'Đã thẩm định').length,
    'Phỏng vấn': candidates.filter((c) => c.stage === 'Phỏng vấn').length,
    'Đề nghị việc': candidates.filter((c) => c.stage === 'Đề nghị việc').length,
    'Đã từ chối': candidates.filter((c) => c.stage === 'Đã từ chối').length,
  };

  const QUAL = Number((getAdminSettingsRef() as any)?.minBenchmarkQualifiedScore) || 3.8;
  const highMatchCandidates = candidates.filter((c) => c.benchmarkScore >= QUAL).length;
  const matchRate = candidates.length > 0 ? Math.round((highMatchCandidates / candidates.length) * 100) : 0;

  const recentCandidates = [...candidates].slice(0, 5);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-7 max-w-[1720px] w-full mx-auto">
      {/* 1. iOS 26 Liquid Glass Hero Banner */}
      <div className="relative overflow-hidden rounded-[26px] p-7 text-white shadow-[0_20px_48px_-16px_rgba(0,122,255,0.42)] border border-white/30 bg-gradient-to-br from-[#0A84FF] via-[#007AFF] to-[#5856D6]">
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-white/15 blur-3xl pointer-events-none" />
        <div className="absolute right-36 -bottom-24 w-64 h-64 rounded-full bg-cyan-300/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-white/85">
              <span>Trung tâm tuyển dụng nội bộ</span>
              <span aria-hidden="true">·</span>
              <span>Cập nhật thời gian thực</span>
            </div>
            <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-white">
              Hệ Thống Tự Động Hóa Tuyển Dụng & Thẩm Định CV
            </h2>
            <p className="text-sm text-white/85 max-w-2xl leading-relaxed">
              Tự động hóa toàn diện từ khởi tạo JD thông minh, đồng bộ quảng bá đa kênh, tự động bóc tách CV và chấm điểm benchmark đa chiều chuẩn hóa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('mailbox')}
              className="px-4 py-2.5 text-xs font-semibold text-[#007AFF] bg-white hover:bg-white/95 rounded-full transition-all cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.14)] active:scale-[0.97] whitespace-nowrap"
            >
              Kiểm tra {unprocessedEmailsCount} email mới
            </button>
            <button
              onClick={() => onNavigate('candidates')}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-xl rounded-full transition-all cursor-pointer active:scale-[0.97] whitespace-nowrap"
            >
              Quản lý ứng viên
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-black/20 hover:bg-black/30 border border-white/20 backdrop-blur-xl rounded-full transition-all cursor-pointer active:scale-[0.97] whitespace-nowrap"
            >
              Báo cáo tuyển dụng
            </button>
          </div>
        </div>
      </div>

      {/* 2. iOS Key Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neumorphic-card neumorphic-card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8E8E93]">Vị trí đang mở</span>
            <div className="w-9 h-9 rounded-[11px] bg-gradient-to-b from-[#2E96FF] to-[#007AFF] text-white flex items-center justify-center shadow-[0_3px_10px_rgba(0,122,255,0.28)]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1C1C1E] dark:text-white tabular-nums">{jobs.length}</span>
            <span className="text-xs text-[#8E8E93]">vị trí cần tuyển</span>
          </div>
          <p className="mt-2 text-xs text-[#8E8E93]">Tiếp nhận hồ sơ trên 5 kênh</p>
        </div>

        <div className="neumorphic-card neumorphic-card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8E8E93]">Tổng ứng viên tiếp nhận</span>
            <div className="w-9 h-9 rounded-[11px] bg-gradient-to-b from-[#4CD964] to-[#34C759] text-white flex items-center justify-center shadow-[0_3px_10px_rgba(52,199,89,0.28)]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1C1C1E] dark:text-white tabular-nums">{candidates.length}</span>
            <span className="text-xs text-[#8E8E93]">đã cấp mã CAND</span>
          </div>
          <p className="mt-2 text-xs text-[#8E8E93]">Tự động định danh chuẩn</p>
        </div>

        <div className="neumorphic-card neumorphic-card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8E8E93]">Hòm thư ứng tuyển</span>
            <div className="w-9 h-9 rounded-[11px] bg-gradient-to-b from-[#FFAA33] to-[#FF9500] text-white flex items-center justify-center shadow-[0_3px_10px_rgba(255,149,0,0.28)]">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1C1C1E] dark:text-white tabular-nums">
              {unprocessedEmailsCount}
            </span>
            <span className="text-xs text-[#8E8E93]">thư chờ xử lý</span>
          </div>
          <p className="mt-2 text-xs text-[#8E8E93]">Tự động bóc tách đính kèm</p>
        </div>

        <div className="neumorphic-card neumorphic-card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8E8E93]">Tỷ lệ đạt Benchmark</span>
            <div className="w-9 h-9 rounded-[11px] bg-gradient-to-b from-[#7371EE] to-[#5856D6] text-white flex items-center justify-center shadow-[0_3px_10px_rgba(88,86,214,0.28)]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1C1C1E] dark:text-white tabular-nums">{matchRate}%</span>
            <span className="text-xs text-[#8E8E93]">hồ sơ ≥ {QUAL.toFixed(1)} sao</span>
          </div>
          <p className="mt-2 text-xs text-[#8E8E93]">Đạt tiêu chuẩn vị trí</p>
        </div>
      </div>

      {/* 3. iOS Recruitment Pipeline Funnel */}
      <div className="glass-panel p-6 rounded-[24px] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-[#1C1C1E] dark:text-white">Phễu Quản Lý Ứng Viên (Pipeline)</h3>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Nhấp vào từng giai đoạn để chuyển sang danh sách hồ sơ tương ứng
            </p>
          </div>
          <button
            onClick={() => onNavigate('candidates')}
            className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:opacity-80 flex items-center gap-0.5 cursor-pointer transition-opacity whitespace-nowrap"
          >
            <span>Toàn bộ hồ sơ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(
            [
              { stage: 'Mới nhận', label: '1. Mới Tiếp Nhận', desc: 'Từ email & tải file', textColor: 'text-[#007AFF] dark:text-[#0A84FF]', border: 'border-[#007AFF]/20 hover:border-[#007AFF]/50', bg: 'bg-[#007AFF]/[0.06] hover:bg-[#007AFF]/[0.11]' },
              { stage: 'Đã thẩm định', label: '2. Đã Chấm Điểm', desc: 'Đã có điểm sao', textColor: 'text-[#5856D6] dark:text-[#5E5CE6]', border: 'border-[#5856D6]/20 hover:border-[#5856D6]/50', bg: 'bg-[#5856D6]/[0.06] hover:bg-[#5856D6]/[0.11]' },
              { stage: 'Phỏng vấn', label: '3. Phỏng Vấn', desc: 'Vòng chuyên môn', textColor: 'text-[#FF9500] dark:text-[#FF9F0A]', border: 'border-[#FF9500]/25 hover:border-[#FF9500]/55', bg: 'bg-[#FF9500]/[0.07] hover:bg-[#FF9500]/[0.12]' },
              { stage: 'Đề nghị việc', label: '4. Đề Nghị Việc', desc: 'Đang gửi offer', textColor: 'text-[#34C759] dark:text-[#30D158]', border: 'border-[#34C759]/25 hover:border-[#34C759]/55', bg: 'bg-[#34C759]/[0.07] hover:bg-[#34C759]/[0.12]' },
              { stage: 'Đã từ chối', label: '5. Lưu Trữ / Từ Chối', desc: 'Không phù hợp JD', textColor: 'text-[#FF3B30] dark:text-[#FF453A]', border: 'border-[#FF3B30]/20 hover:border-[#FF3B30]/50', bg: 'bg-[#FF3B30]/[0.06] hover:bg-[#FF3B30]/[0.11]' },
            ] as const
          ).map((item) => (
            <button
              key={item.stage}
              onClick={() => {
                onFilterCandidatesByStage(item.stage);
                onNavigate('candidates');
              }}
              className={`p-4 rounded-[18px] border text-left transition-all active:scale-[0.98] cursor-pointer ${item.border} ${item.bg}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#1C1C1E] dark:text-white">{item.label}</span>
                <span className={`text-xl font-bold tabular-nums ${item.textColor}`}>
                  {stageCounts[item.stage]}
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E93] mt-1.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 4. iOS Grouped Lists: Open Jobs & Recent Top Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Active Jobs */}
        <div className="glass-panel rounded-[24px] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-[#1C1C1E] dark:text-white">Vị Trí Tuyển Dụng Đang Mở</h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">Sẵn sàng để soạn tin và tạo banner</p>
            </div>
            <button
              onClick={() => onNavigate('jd-studio')}
              className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:opacity-80 flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>Thư viện JD</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] flex-1">
            {jobs.map((job) => (
              <div key={job.id} className="px-5 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-semibold text-[#1C1C1E] dark:text-white truncate">{job.title}</h4>
                      <span className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] shrink-0">
                        {job.level}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#8E8E93]">
                      <span>{job.department}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#3C3C43] dark:text-[#EBEBF5] tabular-nums">{job.salaryRange}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectJobForBanner(job);
                      onNavigate('banner-studio');
                    }}
                    title="Soạn tin và tạo banner quảng cáo cho vị trí này"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 hover:bg-[#007AFF]/18 rounded-full transition-all cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Tạo Banner</span>
                  </button>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs text-[#8E8E93]">
                  <span>Tiêu chuẩn: {job.benchmarkCriteria.minExperienceYears}+ năm kinh nghiệm</span>
                  <span className="font-semibold text-[#007AFF] dark:text-[#0A84FF] tabular-nums">{job.totalApplicants} hồ sơ</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Top Candidates */}
        <div className="glass-panel rounded-[24px] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-[#1C1C1E] dark:text-white">Hồ Sơ Ứng Viên Mới Cập Nhật</h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">Đã được AI đối chiếu benchmark 5 sao</p>
            </div>
            <button
              onClick={() => onNavigate('candidates')}
              className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:opacity-80 flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>Xem tất cả</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] flex-1">
            {recentCandidates.map((c) => {
              const scoreColor =
                c.benchmarkScore >= 4.5
                  ? 'text-[#34C759] dark:text-[#30D158]'
                  : c.benchmarkScore >= 4.0
                  ? 'text-[#007AFF] dark:text-[#0A84FF]'
                  : 'text-[#FF9500] dark:text-[#FF9F0A]';

              return (
                <div key={c.id} className="px-5 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-xs text-[#007AFF] dark:text-[#0A84FF]">{c.id}</span>
                        <h4 className="text-[14px] font-semibold text-[#1C1C1E] dark:text-white truncate">{c.fullName}</h4>
                      </div>
                      <p className="text-xs text-[#3C3C43] dark:text-[#EBEBF5]/85 truncate">{c.jobTitle}</p>
                      <div className="flex items-center gap-2 text-[11px] text-[#8E8E93]">
                        <span>{c.source}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{c.appliedDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className={`flex items-center gap-1 text-xs font-bold tabular-nums ${scoreColor}`}>
                        <Star className="w-3.5 h-3.5 fill-current text-[#FF9500]" />
                        <span>{c.benchmarkScore.toFixed(1)}/5.0</span>
                      </div>

                      <button
                        onClick={() => onSelectCandidateDetails(c)}
                        className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:opacity-80 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Chi tiết</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Recent Publishing Activity Logs */}
      <div className="glass-panel p-6 rounded-[24px] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-[#1C1C1E] dark:text-white">Lịch Sử Đăng Tin Tuyển Dụng Tự Động</h3>
            <p className="text-xs text-[#8E8E93] mt-0.5">Nhật ký phát hành đa kênh từ hệ thống</p>
          </div>
          <button
            onClick={() => onNavigate('channels')}
            className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:opacity-80 flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
          >
            <span>Quản lý kênh</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.08] dark:border-white/[0.1] text-[#8E8E93]">
                <th className="pb-3 font-semibold">Mã Nhật Ký</th>
                <th className="pb-3 font-semibold">Vị Trí Tuyển Dụng</th>
                <th className="pb-3 font-semibold">Các Kênh Đã Xuất Bản</th>
                <th className="pb-3 font-semibold">Thời Gian</th>
                <th className="pb-3 font-semibold text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
              {publishLogs.map((log) => (
                <tr key={log.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                  <td className="py-3 font-mono font-semibold text-[#007AFF] dark:text-[#0A84FF] whitespace-nowrap">{log.id}</td>
                  <td className="py-3 font-semibold text-[#1C1C1E] dark:text-white whitespace-nowrap">{log.jobTitle}</td>
                  <td className="py-3 text-[#3C3C43] dark:text-[#EBEBF5]/85">
                    <span className="truncate max-w-xs block">{log.channelNames.join(', ')}</span>
                  </td>
                  <td className="py-3 tabular-nums text-[#8E8E93] whitespace-nowrap">{log.publishedAt}</td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <span className="text-[#34C759] dark:text-[#30D158] font-semibold inline-flex items-center gap-1">
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
    </div>
  );
};
