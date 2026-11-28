import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Palette,
  Share2,
  Mail,
  Users,
  Briefcase,
  RefreshCw,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  ChevronLeft,
} from 'lucide-react';
import { AppUser, MailboxSettings } from '../types';

export type TabType =
  | 'dashboard'
  | 'jd-studio'
  | 'banner-studio'
  | 'channels'
  | 'mailbox'
  | 'candidates'
  | 'analytics'
  | 'admin';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unprocessedEmailsCount: number;
  totalCandidatesCount: number;
  openJobsCount: number;
  mailboxSettings: MailboxSettings;
  onQuickScan: () => void;
  isScanning: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentUser?: AppUser;
  onOpenProfileModal?: () => void;
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unprocessedEmailsCount,
  totalCandidatesCount,
  openJobsCount,
  mailboxSettings,
  onQuickScan,
  isScanning,
  isCollapsed = false,
  onToggleCollapse,
  currentUser,
  onOpenProfileModal,
  onOpenAuthModal,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Tổng quan & Pipeline',
      icon: LayoutDashboard,
      badge: null,
      accent: 'from-[#0A84FF] to-[#007AFF]',
    },
    {
      id: 'jd-studio' as TabType,
      label: 'Thư viện & Tạo JD',
      icon: FileText,
      badge: `${openJobsCount}`,
      accent: 'from-[#5856D6] to-[#4B49C8]',
    },
    {
      id: 'banner-studio' as TabType,
      label: 'Soạn tin & Banner Studio',
      icon: Palette,
      badge: null,
      accent: 'from-[#AF52DE] to-[#9333EA]',
    },
    {
      id: 'channels' as TabType,
      label: 'Kênh đăng tin kết nối',
      icon: Share2,
      badge: '5',
      accent: 'from-[#30B0C7] to-[#00A3BF]',
    },
    {
      id: 'mailbox' as TabType,
      label: 'Hòm thư HR & Quét Email',
      icon: Mail,
      badge: unprocessedEmailsCount > 0 ? `${unprocessedEmailsCount} mới` : null,
      highlightBadge: unprocessedEmailsCount > 0,
      accent: 'from-[#FF9500] to-[#F97316]',
    },
    {
      id: 'candidates' as TabType,
      label: 'Ứng viên & Phân tích CV',
      icon: Users,
      badge: `${totalCandidatesCount}`,
      accent: 'from-[#34C759] to-[#28B34A]',
    },
    {
      id: 'analytics' as TabType,
      label: 'Báo cáo & Phân tích',
      icon: BarChart3,
      badge: null,
      accent: 'from-[#007AFF] to-[#5856D6]',
    },
    {
      id: 'admin' as TabType,
      label: 'Cài đặt Admin (RBAC)',
      icon: ShieldCheck,
      badge: 'Admin',
      highlightBadge: true,
      accent: 'from-[#3A3A3C] to-[#1C1C1E]',
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-[84px]' : 'w-[280px]'
      } bg-white/80 dark:bg-[#1C1C1E]/85 text-[#1C1C1E] dark:text-[#F2F2F7] flex flex-col shrink-0 border-r border-black/[0.08] dark:border-white/[0.1] backdrop-blur-2xl shadow-[4px_0_24px_-12px_rgba(0,0,0,0.08)] transition-all duration-300 select-none relative z-30`}
    >
      {/* iOS Sidebar Header */}
      <div className="h-16 px-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
        <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          {/* iOS App Icon Squircle */}
          <div className="w-10 h-10 rounded-[13px] bg-gradient-to-b from-[#2E96FF] to-[#007AFF] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,122,255,0.35),inset_0_1px_0_rgba(255,255,255,0.45)] shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[15px] tracking-tight text-[#1C1C1E] dark:text-white">
                  SEICO
                </span>
                <span className="text-[10px] font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 px-1.5 py-0.5 rounded-[6px]">
                  LEA-OS
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E93] mt-0.5 truncate">Nhà tuyển dụng</p>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        {!isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded-[10px] transition-all cursor-pointer shrink-0"
            title="Thu gọn thanh tác vụ (sidebar)"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand Button When Collapsed */}
      {isCollapsed && onToggleCollapse && (
        <div className="p-2 flex justify-center border-b border-black/[0.06] dark:border-white/[0.08]">
          <button
            onClick={onToggleCollapse}
            className="p-2 text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF]/10 rounded-[10px] transition-all cursor-pointer"
            title="Mở rộng thanh tác vụ (sidebar)"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* iOS Grouped Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 pt-1 pb-1.5 text-[11px] font-semibold tracking-tight text-[#8E8E93]">
            Phân hệ chức năng
          </div>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
              } rounded-[13px] text-[13px] font-medium transition-all duration-150 text-left cursor-pointer relative group ${
                isActive
                  ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white shadow-[0_4px_14px_-2px_rgba(0,122,255,0.42),inset_0_1px_0_rgba(255,255,255,0.28)] font-semibold'
                  : 'text-[#3C3C43] dark:text-[#EBEBF5]/85 hover:bg-black/[0.045] dark:hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-[9px] flex items-center justify-center shrink-0 transition-transform duration-150 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : `bg-gradient-to-b ${item.accent} text-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] group-hover:scale-105`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span
                  className={`text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : item.highlightBadge
                      ? 'bg-[#FF3B30]/12 text-[#FF3B30] dark:bg-[#FF453A]/20 dark:text-[#FF453A]'
                      : 'bg-black/[0.05] dark:bg-white/[0.1] text-[#636366] dark:text-[#AEAEB2]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info: iOS Inset Grouped Cards */}
      <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#F2F2F7]/60 dark:bg-black/25 space-y-2.5">
        {!isCollapsed ? (
          <div className="p-3 rounded-[16px] bg-white/95 dark:bg-[#2C2C2E]/90 border border-black/[0.06] dark:border-white/[0.08] space-y-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#3C3C43] dark:text-[#EBEBF5] flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
                <span>Hòm thư HR</span>
              </span>
              <span className={`text-[11px] font-semibold ${mailboxSettings?.isConnected ? 'text-[#34C759] dark:text-[#30D158]' : 'text-[#FF9500]'}`}>
                {mailboxSettings?.isConnected ? 'Đã kết nối' : 'Chưa nối máy chủ thư'}
              </span>
            </div>

            <div className="text-[11px] text-[#8E8E93] font-mono truncate">
              {mailboxSettings.emailAddress}
            </div>

            <button
              onClick={onQuickScan}
              disabled={isScanning}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 hover:bg-[#007AFF]/18 dark:bg-[#0A84FF]/15 dark:hover:bg-[#0A84FF]/25 rounded-[11px] transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Đang quét...' : 'Quét Email'}</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onQuickScan}
              disabled={isScanning}
              className="p-2.5 text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF]/10 rounded-[12px] cursor-pointer transition-colors"
              title="Quét hòm thư ngay"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}

        {/* User Account Card */}
        {!isCollapsed && currentUser ? (
          <div
            onClick={onOpenProfileModal}
            title="Nhấp để cập nhật hồ sơ tài khoản"
            className="flex items-center justify-between p-2.5 rounded-[16px] bg-white/95 dark:bg-[#2C2C2E]/90 hover:bg-white dark:hover:bg-[#3A3A3C] border border-black/[0.06] dark:border-white/[0.08] cursor-pointer transition-all group shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#2E96FF] to-[#007AFF] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-[0_2px_6px_rgba(0,122,255,0.28)]">
                {currentUser.fullName.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-[#1C1C1E] dark:text-white font-semibold truncate text-xs group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] transition-colors">
                  {currentUser.fullName}
                </p>
                <p className="text-[11px] text-[#8E8E93] truncate">
                  {currentUser.role === 'master_admin'
                    ? 'Quản trị hệ thống'
                    : currentUser.role === 'ops_admin'
                    ? 'Quản trị vận hành'
                    : currentUser.role === 'member'
                    ? 'Thành viên'
                    : currentUser.role}
                </p>
              </div>
            </div>

            {onOpenAuthModal && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAuthModal();
                }}
                className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] px-2.5 py-1 rounded-full bg-[#007AFF]/10 hover:bg-[#007AFF]/20 shrink-0 transition-colors cursor-pointer"
                title="Đổi tài khoản / Đăng ký mới"
              >
                Đổi
              </button>
            )}
          </div>
        ) : isCollapsed && currentUser && onOpenAuthModal ? (
          <div className="flex justify-center">
            <button
              onClick={onOpenAuthModal}
              className="w-9 h-9 rounded-full bg-gradient-to-b from-[#2E96FF] to-[#007AFF] flex items-center justify-center text-white font-bold text-xs cursor-pointer shadow-sm hover:scale-105 transition-transform"
              title={`${currentUser.fullName} (${currentUser.role})`}
            >
              {currentUser.fullName.slice(0, 2)}
            </button>
          </div>
        ) : null}

        {/* Collapse Sidebar Toggle */}
        {!isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-[10px] transition-all cursor-pointer"
            title="Thu gọn thanh tác vụ (sidebar)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Thu gọn thanh tác vụ (sidebar)</span>
          </button>
        )}
      </div>
    </aside>
  );
};
