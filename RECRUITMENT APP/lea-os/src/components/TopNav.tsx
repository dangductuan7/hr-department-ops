import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  UploadCloud,
  RefreshCw,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Sun,
  Moon,
  ShieldCheck,
  X,
  Briefcase,
  Star,
  UserPlus,
  Mail,
  Home, Menu } from 'lucide-react';
import { TabType } from './Sidebar';
import { AppUser, Candidate, InboundEmail, JobPosition } from '../types';

interface TopNavProps {
  activeTab: TabType;
  onOpenCreateJD: () => void;
  onOpenUploadCV: () => void;
  onQuickScan: () => void;
  isScanning: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate: (tab: TabType) => void;
  candidates?: Candidate[];
  jobs?: JobPosition[];
  inboundEmails?: InboundEmail[];
  onSelectCandidate?: (candidate: Candidate) => void;
  onSelectJob?: (job: JobPosition) => void;
  currentUser?: AppUser;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
  onOpenProfileModal?: () => void;
  onOpenLanding?: () => void;
  onOpenMobileNav?: () => void;
}

const tabTitles: Record<TabType, { section: string; title: string }> = {
  dashboard: { section: 'Hệ thống', title: 'Tổng Quan Tuyển Dụng' },
  'jd-studio': { section: 'Mô tả công việc', title: 'Thư Viện & Trình Tạo JD' },
  'banner-studio': { section: 'Marketing tuyển dụng', title: 'Soạn Tin & Banner Studio' },
  channels: { section: 'Kết nối tuyển dụng', title: 'Kênh Đăng Tin 1-Click' },
  mailbox: { section: 'Hòm thư HR', title: 'Hòm Thư & Quét Email' },
  candidates: { section: 'Dữ liệu ứng viên', title: 'Ứng Viên & Phân Tích Benchmark' },
  analytics: { section: 'Báo cáo hiệu suất', title: 'Báo Cáo & Phân Tích' },
  admin: { section: 'Cài đặt hệ thống', title: 'Quản Trị & Phân Quyền' },
};

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onOpenCreateJD,
  onOpenUploadCV,
  onQuickScan,
  isScanning,
  isDarkMode,
  onToggleDarkMode,
  onNavigate,
  candidates = [],
  jobs = [],
  inboundEmails = [],
  onSelectCandidate,
  onSelectJob,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenLanding,
  onOpenMobileNav,
}) => {
  const current = tabTitles[activeTab] || tabTitles.dashboard;

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filterDept, setFilterDept] = useState('all');
  const [filterBenchmark, setFilterBenchmark] = useState<number>(0);
  const [filterStage, setFilterStage] = useState('all');

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = searchQuery.trim().toLowerCase();

  const matchingCandidates = query || filterDept !== 'all' || filterBenchmark > 0 || filterStage !== 'all'
    ? candidates.filter((c) => {
        const matchesQuery = !query ||
          c.fullName.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.jobTitle.toLowerCase().includes(query) ||
          c.matchedSkills.some((s) => s.toLowerCase().includes(query));

        const job = jobs.find((j) => j.id === c.jobId);
        const matchesDept = filterDept === 'all' || job?.department === filterDept;
        const matchesBenchmark = c.benchmarkScore >= filterBenchmark;
        const matchesStage = filterStage === 'all' || c.stage === filterStage;

        return matchesQuery && matchesDept && matchesBenchmark && matchesStage;
      }).slice(0, 5)
    : [];

  const matchingJobs = query
    ? jobs.filter((j) =>
        j.title.toLowerCase().includes(query) ||
        j.department.toLowerCase().includes(query) ||
        j.id.toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  const matchingEmails = query
    ? inboundEmails.filter((m) =>
        m.senderName.toLowerCase().includes(query) ||
        m.senderEmail.toLowerCase().includes(query) ||
        m.subject.toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  const hasResults = matchingCandidates.length > 0 || matchingJobs.length > 0 || matchingEmails.length > 0;
  const isFilterActive = filterDept !== 'all' || filterBenchmark > 0 || filterStage !== 'all';

  const resetFilters = () => {
    setFilterDept('all');
    setFilterBenchmark(0);
    setFilterStage('all');
  };

  const departments = Array.from(new Set(jobs.map((j) => j.department)));

  return (
    <header className="h-16 px-3 sm:px-6 bg-[#F2F2F7]/80 dark:bg-[#000000]/75 backdrop-blur-2xl flex items-center justify-between gap-2 sm:gap-4 shrink-0 transition-all z-20 sticky top-0 border-b border-black/[0.08] dark:border-white/[0.1]">
      {/* Zone 1: iOS Navigation Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        {onOpenMobileNav && (
          <button onClick={onOpenMobileNav} aria-label="Mở menu" className="lg:hidden w-9 h-9 -ml-1 flex items-center justify-center rounded-full btn-fluent-glass shrink-0 cursor-pointer">
            <Menu className="w-5 h-5 text-[#1C1C1E] dark:text-white" />
          </button>
        )}
        <span className="text-[12px] text-[#8E8E93] font-medium whitespace-nowrap hidden xl:inline">
          {current.section}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#C7C7CC] dark:text-[#48484A] hidden xl:inline shrink-0" />
        <h1 className="text-[15px] font-bold text-[#1C1C1E] dark:text-white tracking-tight truncate">
          {current.title}
        </h1>
      </div>

      {/* Zone 2: iOS Spotlight Search Bar */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-2 hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm ứng viên, kỹ năng, JD..."
            className="w-full pl-9 pr-16 py-2 neumorphic-inset rounded-full text-[13px] text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93] focus:outline-hidden transition-all"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-9 w-4 h-4 rounded-full bg-[#8E8E93]/40 hover:bg-[#8E8E93]/60 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`absolute right-1.5 p-1.5 rounded-full cursor-pointer transition-all ${
              isFilterActive
                ? 'text-white bg-[#007AFF] shadow-xs'
                : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.1]'
            }`}
            title="Bộ lọc nâng cao"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Popover Sheet */}
        {isFilterOpen && (
          <div className="absolute top-12 right-0 w-80 glass-panel rounded-[22px] shadow-2xl p-4 space-y-3 z-50 text-xs animate-in fade-in">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-2.5">
              <span className="font-bold text-[13px] text-[#1C1C1E] dark:text-white">Bộ Lọc Tìm Kiếm</span>
              {isFilterActive && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] cursor-pointer"
                >
                  Đặt lại
                </button>
              )}
            </div>

            <div>
              <label className="block text-[#8E8E93] font-medium mb-1">Theo Phòng Ban</label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-3 py-2 bg-[#767680]/[0.08] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-[11px] text-[#1C1C1E] dark:text-white focus:outline-none"
              >
                <option value="all">Tất cả phòng ban</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#8E8E93] font-medium mb-1">
                Điểm Benchmark Tối Thiểu
              </label>
              <select
                value={filterBenchmark}
                onChange={(e) => setFilterBenchmark(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#767680]/[0.08] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-[11px] text-[#1C1C1E] dark:text-white focus:outline-none"
              >
                <option value={0}>Tất cả mức điểm</option>
                <option value={4.5}>≥ 4.5 ★ (Xuất sắc)</option>
                <option value={4.0}>≥ 4.0 ★ (Đạt chuẩn phỏng vấn)</option>
                <option value={3.5}>≥ 3.5 ★ (Khá)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8E8E93] font-medium mb-1">Giai Đoạn Tuyển Dụng</label>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="w-full px-3 py-2 bg-[#767680]/[0.08] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-[11px] text-[#1C1C1E] dark:text-white focus:outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Mới nhận">Mới nhận</option>
                <option value="Đã thẩm định">Đã thẩm định</option>
                <option value="Phỏng vấn">Phỏng vấn</option>
                <option value="Đề nghị việc">Đề nghị việc (Offer)</option>
                <option value="Đã từ chối">Đã từ chối</option>
              </select>
            </div>
          </div>
        )}

        {/* Spotlight Results Sheet */}
        {isSearchFocused && (searchQuery || isFilterActive) && (
          <div className="absolute top-12 left-0 right-0 glass-panel rounded-[22px] shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-black/[0.06] dark:divide-white/[0.08] text-xs">
            {hasResults ? (
              <>
                {matchingCandidates.length > 0 && (
                  <div className="p-2 space-y-1">
                    <span className="px-2.5 py-1 text-[11px] font-semibold text-[#8E8E93] block">
                      Ứng viên ({matchingCandidates.length})
                    </span>
                    {matchingCandidates.map((cand) => (
                      <button
                        key={cand.id}
                        onClick={() => {
                          onNavigate('candidates');
                          onSelectCandidate?.(cand);
                          setIsSearchFocused(false);
                        }}
                        className="w-full p-2 hover:bg-[#007AFF]/10 rounded-[12px] flex items-center justify-between text-left cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[#007AFF]/15 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center font-bold text-xs shrink-0">
                            {cand.fullName.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#1C1C1E] dark:text-white truncate">{cand.fullName}</span>
                              <span className="font-mono text-[11px] text-[#8E8E93]">{cand.id}</span>
                            </div>
                            <span className="text-[11px] text-[#8E8E93] truncate block">{cand.jobTitle}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 font-mono font-bold text-[#FF9500] text-xs shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{cand.benchmarkScore.toFixed(1)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {matchingJobs.length > 0 && (
                  <div className="p-2 space-y-1">
                    <span className="px-2.5 py-1 text-[11px] font-semibold text-[#8E8E93] block">
                      Vị trí tuyển dụng ({matchingJobs.length})
                    </span>
                    {matchingJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => {
                          onNavigate('jd-studio');
                          onSelectJob?.(job);
                          setIsSearchFocused(false);
                        }}
                        className="w-full p-2 hover:bg-[#007AFF]/10 rounded-[12px] flex items-center justify-between text-left cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Briefcase className="w-4 h-4 text-[#007AFF] shrink-0" />
                          <div className="min-w-0">
                            <span className="font-semibold text-[#1C1C1E] dark:text-white truncate block">{job.title}</span>
                            <span className="text-[11px] text-[#8E8E93]">{job.department}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-[#8E8E93]">{job.salaryRange}</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchingEmails.length > 0 && (
                  <div className="p-2 space-y-1">
                    <span className="px-2.5 py-1 text-[11px] font-semibold text-[#8E8E93] block">
                      Hòm thư tuyển dụng ({matchingEmails.length})
                    </span>
                    {matchingEmails.map((mail) => (
                      <button
                        key={mail.id}
                        onClick={() => {
                          onNavigate('mailbox');
                          setIsSearchFocused(false);
                        }}
                        className="w-full p-2 hover:bg-[#007AFF]/10 rounded-[12px] flex items-center justify-between text-left cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Mail className="w-4 h-4 text-[#5856D6] shrink-0" />
                          <div className="min-w-0">
                            <span className="font-semibold text-[#1C1C1E] dark:text-white truncate block">{mail.senderName}</span>
                            <span className="text-[11px] text-[#8E8E93] truncate block">{mail.subject}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-[#8E8E93]">{mail.attachmentName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-[#8E8E93] text-xs">
                Không tìm thấy kết quả phù hợp.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zone 3: iOS Liquid Glass Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onOpenAuthModal && (
          <button
            onClick={() => onOpenAuthModal('register')}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] btn-fluent-glass rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0"
            title="Đăng ký tài khoản tuyển dụng mới"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Đăng Ký Mới</span>
          </button>
        )}

        {currentUser && (
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full btn-fluent-glass cursor-pointer transition-all shrink-0"
            title={`Tài khoản: ${currentUser.fullName} - Nhấp để cập nhật hồ sơ`}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#2E96FF] to-[#007AFF] text-white flex items-center justify-center font-bold text-[10px]">
              {currentUser.fullName.slice(0, 1)}
            </div>
            <span className="hidden xl:inline text-xs font-semibold text-[#1C1C1E] dark:text-white truncate max-w-[110px]">
              {currentUser.fullName}
            </span>
            <span className="hidden sm:inline text-[10px] font-semibold text-[#007AFF] dark:text-[#0A84FF]">
              {currentUser.role === 'master_admin'
                ? 'Quản trị hệ thống'
                : currentUser.role === 'ops_admin'
                ? 'Vận hành'
                : currentUser.role === 'member'
                ? 'Thành viên'
                : currentUser.role}
            </span>
          </button>
        )}

        {onOpenLanding && (
          <button
            onClick={onOpenLanding}
            className="w-8 h-8 flex items-center justify-center text-[#3C3C43] hover:text-[#007AFF] dark:text-[#AEAEB2] dark:hover:text-[#0A84FF] btn-fluent-glass rounded-full transition-all cursor-pointer shrink-0"
            title="Xem Trang Giới Thiệu"
          >
            <Home className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onToggleDarkMode}
          className="w-8 h-8 flex items-center justify-center text-[#3C3C43] hover:text-[#1C1C1E] dark:text-[#AEAEB2] dark:hover:text-white btn-fluent-glass rounded-full transition-all cursor-pointer shrink-0"
          title={isDarkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-[#FF9F0A]" /> : <Moon className="w-4 h-4 text-[#5856D6]" />}
        </button>

        <button
          onClick={() => onNavigate('admin')}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer shrink-0 ${
            activeTab === 'admin'
              ? 'text-white bg-[#007AFF] shadow-[0_2px_10px_rgba(0,122,255,0.4)]'
              : 'text-[#3C3C43] hover:text-[#007AFF] dark:text-[#AEAEB2] dark:hover:text-white btn-fluent-glass'
          }`}
          title="Cài đặt hệ thống & Phân quyền"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        <button
          onClick={onQuickScan}
          disabled={isScanning}
          title="Kiểm tra email ứng tuyển mới"
          className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1C1C1E] dark:text-white btn-fluent-glass rounded-full transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF] ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Đang quét...' : 'Quét Email'}</span>
        </button>

        <button
          onClick={onOpenUploadCV}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-[#1C1C1E] dark:text-white btn-fluent-glass rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <UploadCloud className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
          <span className="hidden sm:inline">Nạp CV</span>
        </button>

        <button
          onClick={onOpenCreateJD}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 text-xs font-semibold btn-fluent-primary rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tạo JD Mới</span>
        </button>
      </div>
    </header>
  );
};
