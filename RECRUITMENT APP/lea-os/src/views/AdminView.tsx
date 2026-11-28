import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Hash,
  Sliders,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Sparkles,
  Lock,
  Mail,
  Bell,
  Sun,
  Moon,
  Check,
  AlertCircle,
  KeyRound,
  FileText,
  Download,
  Share2,
  Globe,
  Database,
  History,
  UserCheck,
  SlidersHorizontal,
  ExternalLink,
  Search,
  Filter,
  Eye,
  X,
  Star,
  CheckSquare,
  Square,
  Settings2,
  Layers,
  Network,
  GitBranch,
  Move,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FolderTree,
  CornerDownRight,
  BookUser,
  Upload,
  Phone,
  MapPin,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  Briefcase,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  AdminSettings,
  AppUser,
  BenchmarkConfigProfile,
  BenchmarkDimension,
  Candidate,
  ConnectedChannel,
  CustomIdRuleItem,
  DepartmentItem,
  GoogleContact,
  JobPosition,
  OrgNode,
  PermissionFeature,
  RoleDefinition,
  RolePermissions,
  SystemAuditLog,
  UserRole,
} from '../types';
import { availableFeatures, initialOrgChartNodes, initialRoleDefinitions } from '../data/initialData';

interface AdminViewProps {
  currentUser: AppUser;
  allUsers: AppUser[];
  onUpdateUsers: (users: AppUser[]) => void;
  rolePermissions: RolePermissions;
  onUpdatePermissions: (perms: RolePermissions) => void;
  auditLogs: SystemAuditLog[];
  onAddAuditLog: (log: Omit<SystemAuditLog, 'id' | 'timestamp'>) => void;
  candidates: Candidate[];
  jobs: JobPosition[];
  channels: ConnectedChannel[];
  onUpdateChannels: (channels: ConnectedChannel[]) => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenProfileModal: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  allUsers,
  onUpdateUsers,
  rolePermissions,
  onUpdatePermissions,
  auditLogs,
  onAddAuditLog,
  candidates,
  jobs,
  channels,
  onUpdateChannels,
  adminSettings,
  onUpdateAdminSettings,
  isDarkMode,
  onToggleDarkMode,
  onOpenProfileModal,
}) => {
  const isMasterAdmin = currentUser.role === 'master_admin';

  // Section Selector: 'personal' (Cài Đặt Tài Khoản) vs 'system' (Quản Trị Hệ Thống)
  // 3.1 & 4.1: Bỏ chữ "Phần 1:" và "Phần 2:", dùng "CÀI ĐẶT TÀI KHOẢN" và "QUẢN TRỊ HỆ THỐNG"
  const [mainSection, setMainSection] = useState<'personal' | 'system'>(
    isMasterAdmin ? 'system' : 'personal'
  );

  // Sub-tabs in System Administration
  const [systemSubTab, setSystemSubTab] = useState<
    'rbac_users' | 'role_permissions' | 'org_chart' | 'central_cvs' | 'contacts' | 'audit_logs' | 'departments' | 'benchmark'
  >('rbac_users');

  // Sub-tabs in Personal / Account Settings
  const [personalSubTab, setPersonalSubTab] = useState<'profile' | 'channels' | 'contacts' | 'security'>('profile');

  // Notice Toast State
  const [notice, setNotice] = useState<string | null>(null);
  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // ----------------------------------------------------
  // SECTION: RBAC USERS MANAGEMENT & EDIT USER (3.2)
  // ----------------------------------------------------
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('member');
  const [newUserPhone, setNewUserPhone] = useState('');

  // 3.2: Modal Sửa / Cập nhật thông tin tài khoản thành viên
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserJobTitle, setEditUserJobTitle] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('member');
  const [editUserStatus, setEditUserStatus] = useState<'Active' | 'Locked'>('Active');

  const handleOpenEditUser = (user: AppUser) => {
    setEditingUserId(user.id);
    setEditUserName(user.fullName);
    setEditUserEmail(user.email);
    setEditUserPhone(user.profile?.phone || '');
    setEditUserJobTitle(user.profile?.jobTitle || '');
    setEditUserRole(user.role);
    setEditUserStatus(user.status);
    setIsEditUserModalOpen(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !editUserName.trim() || !editUserEmail.trim()) return;

    const targetUser = allUsers.find((u) => u.id === editingUserId);
    if (!targetUser) return;

    const updatedUsers = allUsers.map((u) => {
      if (u.id === editingUserId) {
        return {
          ...u,
          fullName: editUserName.trim(),
          email: editUserEmail.trim().toLowerCase(),
          role: editUserRole,
          status: editUserStatus,
          profile: {
            ...u.profile,
            fullName: editUserName.trim(),
            phone: editUserPhone.trim(),
            jobTitle: editUserJobTitle.trim(),
          },
        };
      }
      return u;
    });

    onUpdateUsers(updatedUsers);
    setIsEditUserModalOpen(false);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Cập nhật thông tin tài khoản',
      target: `${editUserName.trim()} (${editingUserId})`,
      details: `Cập nhật thông tin: Vai trò [${editUserRole}], Chức vụ [${editUserJobTitle}], Trạng thái [${editUserStatus}]`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã cập nhật thông tin tài khoản ${editUserName.trim()} thành công!`);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const targetUser = allUsers.find((u) => u.id === userId);
    if (!targetUser) return;

    const updated = allUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    onUpdateUsers(updated);

    const roleName =
      newRole === 'master_admin'
        ? 'Quản trị hệ thống'
        : newRole === 'ops_admin'
        ? 'Quản trị vận hành'
        : newRole === 'member'
        ? 'Thành viên'
        : newRole;

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Phân quyền tài khoản',
      target: `${targetUser.fullName} (${targetUser.email})`,
      details: `Thay đổi vai trò sang [${roleName}]`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã chuyển vai trò của ${targetUser.fullName} thành [${roleName}] thành công!`);
  };

  const handleToggleLockUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (!target) return;
    if (target.id === currentUser.id) {
      alert('Không thể tự khóa tài khoản của chính mình!');
      return;
    }

    const nextStatus: 'Active' | 'Locked' = target.status === 'Active' ? 'Locked' : 'Active';
    const updated = allUsers.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u));
    onUpdateUsers(updated);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: nextStatus === 'Locked' ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      target: target.fullName,
      details: `Trạng thái mới: ${nextStatus === 'Locked' ? 'Đã khóa truy cập' : 'Hoạt động bình thường'}`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã ${nextStatus === 'Locked' ? 'khóa' : 'mở khóa'} tài khoản ${target.fullName}!`);
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: AppUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      fullName: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      profileCompleted: true,
      status: 'Active',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      lastLoginAt: 'Chưa đăng nhập',
      avatarColor: 'bg-[#007AFF]',
      assignedChannelsCount: 1,
      profile: {
        fullName: newUserName.trim(),
        phone: newUserPhone.trim() || '0988 000 000',
        identityNumber: '001099000111',
        dateOfBirth: '1996-01-01',
        gender: 'Nam',
        address: 'Hà Nội',
        jobTitle: newUserRole === 'ops_admin' ? 'Quản lý Tuyển dụng' : 'Chuyên viên Tuyển dụng',
      },
    };

    onUpdateUsers([newUser, ...allUsers]);
    setIsAddUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Thêm tài khoản mới',
      target: newUser.fullName,
      details: `Khởi tạo người dùng mới với vai trò ${newUser.role}`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã khởi tạo tài khoản thành công cho ${newUser.fullName}!`);
  };

  // Filtered users
  const filteredUsers = allUsers.filter((u) => {
    const matchQuery =
      !userSearchQuery.trim() ||
      u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchQuery && matchRole;
  });

  // ----------------------------------------------------
  // SECTION: ROLE PERMISSION MATRIX & CUSTOM ROLES (3.3 & 3.4)
  // ----------------------------------------------------
  const [customRoles, setCustomRoles] = useState<RoleDefinition[]>(initialRoleDefinitions);
  const [localPermissions, setLocalPermissions] = useState<RolePermissions>(rolePermissions);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleKey, setNewRoleKey] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // 3.3: Thêm loại tài khoản mới & tự động cập nhật trong ma trận
  const handleAddNewRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleTitle.trim() || !newRoleKey.trim()) return;

    const normalizedKey = newRoleKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (customRoles.some((r) => r.id === normalizedKey)) {
      alert('Mã định danh vai trò này đã tồn tại!');
      return;
    }

    const createdRole: RoleDefinition = {
      id: normalizedKey,
      name: newRoleTitle.trim(),
      description: newRoleDesc.trim() || 'Nhóm vai trò tùy chỉnh do Quản trị hệ thống thiết lập',
      isCustom: true,
      color: 'bg-indigo-600 text-white',
    };

    setCustomRoles((prev) => [...prev, createdRole]);
    setLocalPermissions((prev) => ({
      ...prev,
      [normalizedKey]: ['jd_create', 'cv_evaluate', 'candidate_compare'],
    }));

    setIsAddRoleModalOpen(false);
    setNewRoleTitle('');
    setNewRoleKey('');
    setNewRoleDesc('');

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Thêm loại tài khoản mới',
      target: createdRole.name,
      details: `Tạo nhóm vai trò [${createdRole.name}] (Mã: ${normalizedKey}) và tự động thêm vào ma trận phân quyền`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã thêm thành công nhóm vai trò [${createdRole.name}] vào ma trận phân quyền!`);
  };

  const handleTogglePermission = (roleId: string, featureId: string) => {
    if (roleId === 'master_admin') {
      triggerNotice('Quản trị hệ thống luôn sở hữu toàn bộ các quyền hạn cốt lõi!');
      return;
    }

    setLocalPermissions((prev) => {
      const currentList = prev[roleId] || [];
      const hasPerm = currentList.includes(featureId);
      const nextList = hasPerm
        ? currentList.filter((id) => id !== featureId)
        : [...currentList, featureId];

      return {
        ...prev,
        [roleId]: nextList,
      };
    });
  };

  const handleSavePermissions = () => {
    onUpdatePermissions(localPermissions);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Cập nhật ma trận phân quyền',
      target: 'Ma Trận Quyền Hạn Toàn Hệ Thống',
      details: 'Cập nhật danh sách quyền cho các nhóm vai trò tài khoản',
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice('Đã lưu cấu hình ma trận phân quyền thành công!');
  };

  // ----------------------------------------------------
  // SECTION: CENTRAL CV REPOSITORY & BATCH DOWNLOAD (3.5)
  // ----------------------------------------------------
  const [cvSearchQuery, setCvSearchQuery] = useState('');
  const [cvSourceFilter, setCvSourceFilter] = useState('all');
  const [cvBenchmarkFilter, setCvBenchmarkFilter] = useState<number>(0);
  const [selectedCvIds, setSelectedCvIds] = useState<string[]>([]);

  const filteredCentralCvs = candidates.filter((cand) => {
    const matchQuery =
      !cvSearchQuery.trim() ||
      cand.fullName.toLowerCase().includes(cvSearchQuery.toLowerCase()) ||
      cand.id.toLowerCase().includes(cvSearchQuery.toLowerCase()) ||
      cand.matchedSkills.some((s) => s.toLowerCase().includes(cvSearchQuery.toLowerCase())) ||
      (cand.uploadedBy && cand.uploadedBy.toLowerCase().includes(cvSearchQuery.toLowerCase()));

    const matchSource = cvSourceFilter === 'all' || cand.source === cvSourceFilter;
    const matchBenchmark = cand.benchmarkScore >= cvBenchmarkFilter;
    return matchQuery && matchSource && matchBenchmark;
  });

  // 3.5: Toggle Select All CVs
  const handleToggleSelectAllCvs = () => {
    if (selectedCvIds.length === filteredCentralCvs.length) {
      setSelectedCvIds([]);
    } else {
      setSelectedCvIds(filteredCentralCvs.map((c) => c.id));
    }
  };

  // 3.5: Toggle Individual CV
  const handleToggleSelectCv = (id: string) => {
    setSelectedCvIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 3.5: Batch download selected CVs
  const handleBatchDownloadSelected = () => {
    const targetCvs = candidates.filter((c) => selectedCvIds.includes(c.id));
    if (targetCvs.length === 0) {
      triggerNotice('Vui lòng chọn ít nhất 1 hồ sơ CV để tải xuống!');
      return;
    }

    const headers = [
      'Mã Ứng Viên',
      'Họ và Tên',
      'Vị Trí Ứng Tuyển',
      'Tài Khoản Upload',
      'Điểm Benchmark 5 Sao',
      'Đề Xuất',
      'Kỹ Năng Phù Hợp',
      'Nguồn Nạp',
      'Ngày Nộp',
      'Trạng Thái',
    ];

    const rows = targetCvs.map((c) => [
      c.id,
      `"${c.fullName}"`,
      `"${c.jobTitle}"`,
      `"${c.uploadedBy || 'Đặng Đức Tuấn (Quản trị hệ thống)'}"`,
      c.benchmarkScore.toFixed(1),
      c.recommendation,
      `"${c.matchedSkills.join(', ')}"`,
      c.source,
      c.appliedDate,
      c.stage,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kho_CV_Da_Chon_${targetCvs.length}_Ho_So_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Tải hàng loạt CV',
      target: `${targetCvs.length} hồ sơ đã chọn`,
      details: `Xuất tệp dữ liệu gồm ${targetCvs.length} ứng viên từ kho CV chung`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã tải xuống thành công gói ${targetCvs.length} hồ sơ CV đã chọn!`);
  };

  const handleDownloadAllCVs = () => {
    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Tải toàn bộ kho CV chung',
      target: `Kho dữ liệu (${filteredCentralCvs.length} hồ sơ)`,
      details: 'Xuất toàn bộ hồ sơ ứng viên định dạng CSV/ZIP',
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    const headers = [
      'Mã Ứng Viên',
      'Họ và Tên',
      'Vị Trí Ứng Tuyển',
      'Tài Khoản Upload',
      'Điểm Benchmark 5 Sao',
      'Đề Xuất',
      'Kỹ Năng Phù Hợp',
      'Nguồn Nạp',
      'Ngày Nộp',
      'Trạng Thái',
    ];
    const rows = filteredCentralCvs.map((c) => [
      c.id,
      `"${c.fullName}"`,
      `"${c.jobTitle}"`,
      `"${c.uploadedBy || 'Đặng Đức Tuấn (Quản trị hệ thống)'}"`,
      c.benchmarkScore.toFixed(1),
      c.recommendation,
      `"${c.matchedSkills.join(', ')}"`,
      c.source,
      c.appliedDate,
      c.stage,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kho_Du_Lieu_CV_Chung_ATS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerNotice(`Đã tải xuống thành công kho dữ liệu ${filteredCentralCvs.length} hồ sơ CV!`);
  };

  // ----------------------------------------------------
  // SECTION: SYSTEM ACTIVITY & AUDIT LOGS
  // ----------------------------------------------------
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchQuery =
      !logSearchQuery.trim() ||
      log.userName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchAction = logActionFilter === 'all' || log.action === logActionFilter;
    return matchQuery && matchAction;
  });

  const handleExportAuditLogs = () => {
    const headers = ['Thời Gian', 'Người Thực Hiện', 'Vai Trò', 'Hành Động', 'Đối Tượng', 'Chi Tiết', 'Địa Chỉ IP', 'Trạng Thái'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      `"${l.action}"`,
      `"${l.target}"`,
      `"${l.details}"`,
      l.ipAddress,
      l.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nhat_Ky_Hoat_Dong_He_Thong_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerNotice('Đã xuất báo cáo lịch sử hoạt động hệ thống thành công!');
  };

  // ----------------------------------------------------
  // SECTION: CHANNELS MANAGEMENT (EDIT & DELETE 4.2)
  // ----------------------------------------------------
  const [isAddChannelModalOpen, setIsAddChannelModalOpen] = useState(false);
  const [isEditChannelModalOpen, setIsEditChannelModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ConnectedChannel | null>(null);

  const [chanName, setChanName] = useState('');
  const [chanUrl, setChanUrl] = useState('');
  const [chanAccountId, setChanAccountId] = useState('');
  const [chanPassword, setChanPassword] = useState('');
  const [chanPlatform, setChanPlatform] = useState<any>('topcv');
  const [channelToDelete, setChannelToDelete] = useState<ConnectedChannel | null>(null);

  const handleAddNewChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chanName.trim() || !chanUrl.trim() || !chanAccountId.trim()) return;

    const newChan: ConnectedChannel = {
      id: `CHAN-${Date.now().toString().slice(-4)}`,
      name: chanName.trim(),
      webUrl: chanUrl.trim(),
      accountId: chanAccountId.trim(),
      passwordMasked: chanPassword ? '••••••••••••' : '••••••••',
      status: 'Connected',
      lastPublishedAt: 'Vừa kết nối',
      totalJobsPosted: 0,
      autoSync: true,
      platformType: chanPlatform,
    };

    onUpdateChannels([...channels, newChan]);
    setIsAddChannelModalOpen(false);
    setChanName('');
    setChanUrl('');
    setChanAccountId('');
    setChanPassword('');

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Kết nối kênh mới',
      target: newChan.name,
      details: `Liên kết tài khoản ${newChan.accountId} (${newChan.webUrl})`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã kết nối thành công kênh [${newChan.name}] vào tài khoản!`);
  };

  // 4.2: Open Edit Channel Modal
  const handleOpenEditChannel = (channel: ConnectedChannel) => {
    setEditingChannel(channel);
    setChanName(channel.name);
    setChanUrl(channel.webUrl);
    setChanAccountId(channel.accountId);
    setChanPassword('');
    setChanPlatform(channel.platformType);
    setIsEditChannelModalOpen(true);
  };

  // 4.2: Save Edited Channel
  const handleSaveEditChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel || !chanName.trim() || !chanUrl.trim() || !chanAccountId.trim()) return;

    const updatedChannels = channels.map((c) => {
      if (c.id === editingChannel.id) {
        return {
          ...c,
          name: chanName.trim(),
          webUrl: chanUrl.trim(),
          accountId: chanAccountId.trim(),
          passwordMasked: chanPassword ? '••••••••••••' : c.passwordMasked,
          platformType: chanPlatform,
        };
      }
      return c;
    });

    onUpdateChannels(updatedChannels);
    setIsEditChannelModalOpen(false);
    setEditingChannel(null);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Chỉnh sửa kênh kết nối',
      target: chanName.trim(),
      details: `Cập nhật thông số kết nối của kênh ${editingChannel.id}`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã cập nhật kênh kết nối [${chanName.trim()}] thành công!`);
  };

  const handleConfirmDeleteChannel = () => {
    if (!channelToDelete) return;
    const deletedName = channelToDelete.name;
    const updated = channels.filter((c) => c.id !== channelToDelete.id);
    onUpdateChannels(updated);
    setChannelToDelete(null);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Xóa kênh kết nối',
      target: deletedName,
      details: 'Ngắt kết nối và xóa kênh đăng tin khỏi hệ thống',
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã xóa thành công kênh [${deletedName}]!`);
  };

  // ----------------------------------------------------
  // SECTION: DEPARTMENTS & POP-UP ID RULES (3.6 & 3.7)
  // ----------------------------------------------------
  const [departments, setDepartments] = useState<DepartmentItem[]>(adminSettings.departments);
  const [isEditDeptModalOpen, setIsEditDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptManager, setDeptManager] = useState('');
  const [deptHeadCount, setDeptHeadCount] = useState<number>(10);

  // 3.6: Sửa phòng ban
  const handleOpenEditDept = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptManager(dept.managerName);
    setDeptHeadCount(dept.headCount);
    setIsEditDeptModalOpen(true);
  };

  const handleSaveEditDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !deptName.trim() || !deptCode.trim()) return;

    const updatedDepts = departments.map((d) => {
      if (d.id === editingDept.id) {
        return {
          ...d,
          name: deptName.trim(),
          code: deptCode.trim().toUpperCase(),
          managerName: deptManager.trim(),
          headCount: Number(deptHeadCount),
        };
      }
      return d;
    });

    setDepartments(updatedDepts);
    onUpdateAdminSettings({
      ...adminSettings,
      departments: updatedDepts,
    });
    setIsEditDeptModalOpen(false);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Cập nhật phòng ban',
      target: deptName.trim(),
      details: `Sửa thông tin phòng ban [${deptCode}]: Trưởng khối ${deptManager}, quy mô ${deptHeadCount} nhân sự`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã cập nhật phòng ban [${deptName.trim()}] thành công!`);
  };

  // 3.6: Pop-up Thêm Quy Tắc Dạng Bảng
  const [customIdRules, setCustomIdRules] = useState<CustomIdRuleItem[]>(
    adminSettings.customIdRules || []
  );
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [rulePrefix, setRulePrefix] = useState('');
  const [ruleSecondaryCode, setRuleSecondaryCode] = useState('');
  const [ruleStartNumber, setRuleStartNumber] = useState<number>(10001);
  const [ruleExplanation, setRuleExplanation] = useState('');
  const [ruleDeptName, setRuleDeptName] = useState(departments[0]?.name || '');
  const [ruleUnitCode, setRuleUnitCode] = useState(departments[0]?.code || '');

  const handleSaveNewIdRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !rulePrefix.trim()) return;

    const newRule: CustomIdRuleItem = {
      id: `RULE-${Date.now().toString().slice(-4)}`,
      name: ruleName.trim(),
      prefix: rulePrefix.trim().toUpperCase(),
      secondaryCode: ruleSecondaryCode.trim().toUpperCase(),
      startNumber: Number(ruleStartNumber),
      departmentName: ruleDeptName,
      unitCode: ruleUnitCode,
      explanation: ruleExplanation.trim() || 'Quy tắc định danh tự động theo chuẩn ATS',
    };

    const updatedRules = [...customIdRules, newRule];
    setCustomIdRules(updatedRules);
    onUpdateAdminSettings({
      ...adminSettings,
      customIdRules: updatedRules,
    });

    setIsAddRuleModalOpen(false);
    setRuleName('');
    setRulePrefix('');
    setRuleSecondaryCode('');
    setRuleExplanation('');

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Thêm quy tắc định danh ID',
      target: newRule.name,
      details: `Tạo quy ước [${newRule.name}] với tiền tố [${newRule.prefix}], thứ cấp [${newRule.secondaryCode}], bắt đầu từ [${newRule.startNumber}] cho phòng ban [${newRule.departmentName}]`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã thêm quy tắc định danh [${newRule.name}] thành công!`);
  };

  const handleDeleteIdRule = (ruleId: string) => {
    const updated = customIdRules.filter((r) => r.id !== ruleId);
    setCustomIdRules(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      customIdRules: updated,
    });
    triggerNotice('Đã xóa quy tắc định danh thành công!');
  };

  // ----------------------------------------------------
  // SECTION: BENCHMARK CUSTOMIZATION (3.8: 5D DEFAULT, 3D-7D, WEIGHTS SUM TO 100%)
  // ----------------------------------------------------
  const [benchmarkProfiles, setBenchmarkProfiles] = useState<BenchmarkConfigProfile[]>(
    adminSettings.benchmarkProfiles || []
  );
  const [activeProfileId, setActiveProfileId] = useState<string>(
    adminSettings.activeBenchmarkProfileId || benchmarkProfiles[0]?.id || 'BENCH-01'
  );

  const activeProfile =
    benchmarkProfiles.find((p) => p.id === activeProfileId) || benchmarkProfiles[0];

  // Editable Profile Dimensions
  const [profileTitle, setProfileTitle] = useState(activeProfile?.title || 'Chuẩn Tuyển Dụng Toàn Diện (5D)');
  const [dimensionCount, setDimensionCount] = useState<number>(activeProfile?.dimensionCount || 5);
  const [dimensions, setDimensions] = useState<BenchmarkDimension[]>(
    activeProfile?.dimensions || [
      { id: 'dim_1', name: 'Chuyên môn kỹ thuật & Năng lực lõi', weight: 30 },
      { id: 'dim_2', name: 'Số năm kinh nghiệm thực chiến & Dự án', weight: 25 },
      { id: 'dim_3', name: 'Kỹ năng mềm, Giao tiếp & Làm việc nhóm', weight: 15 },
      { id: 'dim_4', name: 'Trình độ ngoại ngữ & Học vấn chứng chỉ', weight: 15 },
      { id: 'dim_5', name: 'Độ hòa hợp văn hóa & Tinh thần chủ động', weight: 15 },
    ]
  );

  // Sync when activeProfileId changes
  const handleSelectBenchmarkProfile = (profileId: string) => {
    const target = benchmarkProfiles.find((p) => p.id === profileId);
    if (!target) return;
    setActiveProfileId(profileId);
    setProfileTitle(target.title);
    setDimensionCount(target.dimensionCount);
    setDimensions(target.dimensions);
  };

  // Calculate total weight percentage
  const totalWeight = dimensions.reduce((sum, dim) => sum + (Number(dim.weight) || 0), 0);

  // Adjust dimension count
  const handleDimensionCountChange = (count: number) => {
    setDimensionCount(count);
    if (count > dimensions.length) {
      const addedCount = count - dimensions.length;
      const newDims: BenchmarkDimension[] = [];
      for (let i = 0; i < addedCount; i++) {
        const index = dimensions.length + i + 1;
        newDims.push({
          id: `dim_${Date.now()}_${i}`,
          name: `Tiêu chí đánh giá bổ sung ${index}`,
          weight: 10,
        });
      }
      setDimensions([...dimensions, ...newDims]);
    } else if (count < dimensions.length) {
      setDimensions(dimensions.slice(0, count));
    }
  };

  // Dimension field change
  const handleDimensionFieldChange = (index: number, field: 'name' | 'weight', val: any) => {
    const updated = [...dimensions];
    if (field === 'weight') {
      updated[index] = { ...updated[index], weight: Math.max(0, Math.min(100, Number(val) || 0)) };
    } else {
      updated[index] = { ...updated[index], name: val };
    }
    setDimensions(updated);
  };

  // Save current profile
  const handleSaveBenchmarkProfile = () => {
    if (totalWeight !== 100) {
      alert(`Tổng trọng số hiện tại là ${totalWeight}%. Vui lòng điều chỉnh các chiều sao cho tổng chính xác 100%!`);
      return;
    }

    const updatedProfile: BenchmarkConfigProfile = {
      id: activeProfileId,
      title: profileTitle.trim(),
      dimensionCount,
      dimensions,
      isDefault: activeProfile?.isDefault || false,
    };

    const updatedProfiles = benchmarkProfiles.map((p) =>
      p.id === activeProfileId ? updatedProfile : p
    );

    setBenchmarkProfiles(updatedProfiles);
    onUpdateAdminSettings({
      ...adminSettings,
      benchmarkProfiles: updatedProfiles,
      activeBenchmarkProfileId: activeProfileId,
    });

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Tùy biến trọng số benchmark',
      target: profileTitle.trim(),
      details: `Lưu cấu hình chuẩn ${dimensionCount} chiều với tổng 100% trọng số`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã lưu cấu hình benchmark [${profileTitle.trim()}] đạt chuẩn 100%!`);
  };

  // Add new profile
  const handleCreateNewBenchmarkProfile = () => {
    const newId = `BENCH-${Date.now().toString().slice(-4)}`;
    const newProf: BenchmarkConfigProfile = {
      id: newId,
      title: `Cấu hình Benchmark Mới (${dimensionCount}D)`,
      dimensionCount,
      dimensions: [
        { id: 'dim_1', name: '1. Năng lực kỹ thuật chuyên sâu', weight: 30 },
        { id: 'dim_2', name: '2. Kinh nghiệm thực chiến dự án', weight: 25 },
        { id: 'dim_3', name: '3. Kỹ năng mềm & Xử lý tình huống', weight: 15 },
        { id: 'dim_4', name: '4. Khả năng ngoại ngữ & Nghiên cứu', weight: 15 },
        { id: 'dim_5', name: '5. Tinh thần đồng đội & Văn hóa', weight: 15 },
      ],
      isDefault: false,
    };

    const updated = [...benchmarkProfiles, newProf];
    setBenchmarkProfiles(updated);
    setActiveProfileId(newId);
    setProfileTitle(newProf.title);
    setDimensionCount(newProf.dimensionCount);
    setDimensions(newProf.dimensions);

    triggerNotice(`Đã tạo cấu hình benchmark mới [${newProf.title}]!`);
  };

  // ----------------------------------------------------
  // SECTION: SƠ ĐỒ TỔ CHỨC (ORG CHART - 1.3)
  // ----------------------------------------------------
  const [orgNodes, setOrgNodes] = useState<OrgNode[]>(
    adminSettings.orgChartNodes && adminSettings.orgChartNodes.length > 0
      ? adminSettings.orgChartNodes
      : initialOrgChartNodes
  );
  const [orgViewMode, setOrgViewMode] = useState<
    'tree' | 'table' | 'headcount_report' | 'recruitment_comparison'
  >('tree');
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
  const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState(false);
  const [isAdjustParentModalOpen, setIsAdjustParentModalOpen] = useState(false);
  const [orgNodeToEdit, setOrgNodeToEdit] = useState<OrgNode | null>(null);
  const [orgNodeToAdjust, setOrgNodeToAdjust] = useState<OrgNode | null>(null);

  // Form states for Org Node & Headcount
  const [orgName, setOrgName] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [orgParentId, setOrgParentId] = useState<string | null>(null);
  const [orgLeaderName, setOrgLeaderName] = useState('');
  const [orgLeaderTitle, setOrgLeaderTitle] = useState('');
  const [orgHeadCount, setOrgHeadCount] = useState<number>(10);
  const [orgHeadcountQuota, setOrgHeadcountQuota] = useState<number>(10); // 1.1: Định biên chỉ tiêu
  const [orgCurrentHeadcount, setOrgCurrentHeadcount] = useState<number>(8); // 1.1: Nhân sự hiện tại
  const [orgOpenPositions, setOrgOpenPositions] = useState<number>(2); // 1.1: Vị trí đang tuyển
  const [orgDescription, setOrgDescription] = useState('');
  const [orgColor, setOrgColor] = useState('#007AFF');

  const handleOpenAddOrg = (parent?: OrgNode) => {
    setOrgName('');
    setOrgCode('');
    setOrgParentId(parent ? parent.id : orgNodes[0]?.id || null);
    setOrgLeaderName('');
    setOrgLeaderTitle(parent ? 'Trưởng Nhóm / Phụ Trách' : 'Trưởng Khối / Phòng');
    setOrgHeadCount(10);
    setOrgHeadcountQuota(10);
    setOrgCurrentHeadcount(8);
    setOrgOpenPositions(2);
    setOrgDescription('');
    setOrgColor(parent?.color || '#007AFF');
    setIsAddOrgModalOpen(true);
  };

  const handleSaveNewOrgNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !orgCode.trim()) return;

    const parent = orgNodes.find((n) => n.id === orgParentId);
    const computedLevel = parent ? parent.level + 1 : 1;
    const quota = Number(orgHeadcountQuota) || Number(orgHeadCount) || 5;
    const current = Number(orgCurrentHeadcount) || Math.round(quota * 0.8);
    const open = Number(orgOpenPositions) || Math.max(0, quota - current);

    const newNode: OrgNode = {
      id: `ORG-${Date.now().toString().slice(-4)}`,
      name: orgName.trim(),
      code: orgCode.trim().toUpperCase(),
      parentId: orgParentId || null,
      leaderName: orgLeaderName.trim() || 'Chưa bổ nhiệm',
      leaderTitle: orgLeaderTitle.trim() || 'Người đứng đầu',
      headCount: quota,
      headcountQuota: quota,
      currentHeadcount: current,
      openPositions: open,
      description: orgDescription.trim() || 'Đơn vị trực thuộc cơ cấu tổ chức',
      level: computedLevel,
      color: orgColor,
    };

    const updated = [...orgNodes, newNode];
    setOrgNodes(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      orgChartNodes: updated,
    });
    setIsAddOrgModalOpen(false);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Thêm đơn vị sơ đồ tổ chức',
      target: `${newNode.name} (${newNode.code})`,
      details: `Tạo mới đơn vị cấp ${newNode.level}, chỉ tiêu định biên ${newNode.headcountQuota} NS, hiện có ${newNode.currentHeadcount} NS, mở tuyển ${newNode.openPositions} vị trí, trực thuộc [${parent?.name || 'Ban Lãnh Đạo Cao Nhất'}]`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });
    triggerNotice(`Đã thêm đơn vị [${newNode.name}] vào sơ đồ tổ chức thành công!`);
  };

  const handleOpenEditOrg = (node: OrgNode) => {
    setOrgNodeToEdit(node);
    setOrgName(node.name);
    setOrgCode(node.code);
    setOrgLeaderName(node.leaderName);
    setOrgLeaderTitle(node.leaderTitle);
    const quota = node.headcountQuota ?? node.headCount ?? 10;
    const current = node.currentHeadcount ?? Math.round(quota * 0.85);
    const open = node.openPositions ?? Math.max(0, quota - current);
    setOrgHeadCount(quota);
    setOrgHeadcountQuota(quota);
    setOrgCurrentHeadcount(current);
    setOrgOpenPositions(open);
    setOrgDescription(node.description || '');
    setOrgColor(node.color || '#007AFF');
    setIsEditOrgModalOpen(true);
  };

  const handleSaveEditOrgNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgNodeToEdit || !orgName.trim() || !orgCode.trim()) return;

    const quota = Number(orgHeadcountQuota) || Number(orgHeadCount) || 5;
    const current = Number(orgCurrentHeadcount) || 0;
    const open = Number(orgOpenPositions) || 0;

    const updated = orgNodes.map((n) => {
      if (n.id === orgNodeToEdit.id) {
        return {
          ...n,
          name: orgName.trim(),
          code: orgCode.trim().toUpperCase(),
          leaderName: orgLeaderName.trim(),
          leaderTitle: orgLeaderTitle.trim(),
          headCount: quota,
          headcountQuota: quota,
          currentHeadcount: current,
          openPositions: open,
          description: orgDescription.trim(),
          color: orgColor,
        };
      }
      return n;
    });

    setOrgNodes(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      orgChartNodes: updated,
    });
    setIsEditOrgModalOpen(false);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Cập nhật sơ đồ tổ chức',
      target: orgName.trim(),
      details: `Chỉnh sửa thông tin đơn vị [${orgCode.trim().toUpperCase()}]: Lãnh đạo ${orgLeaderName}, chỉ tiêu định biên ${quota} NS, thực tế ${current} NS, tuyển ${open} vị trí`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });
    triggerNotice(`Đã cập nhật đơn vị [${orgName.trim()}] thành công!`);
  };

  // 1.1: Xuất Báo Cáo Định Biên Nhân Sự ra CSV
  const handleExportHeadcountReportCsv = () => {
    const headers = [
      'Mã Đơn Vị',
      'Tên Đơn Vị / Phòng Ban',
      'Cấp Quản Lý',
      'Đơn Vị Cấp Trên',
      'Lãnh Đạo Phụ Trách',
      'Chức Danh',
      'Chỉ Tiêu Định Biên (Quota)',
      'Nhân Sự Hiện Tại (Thực Tế)',
      'Số Lượng Còn Thiếu (Gap)',
      'Vị Trí Đang Mở Tuyển',
      'Tỷ Lệ Lấp Đầy (%)',
      'Đánh Giá Tình Trạng',
    ];

    const rows = orgNodes.map((node) => {
      const parent = orgNodes.find((p) => p.id === node.parentId);
      const quota = node.headcountQuota ?? node.headCount ?? 1;
      const current = node.currentHeadcount ?? Math.round(quota * 0.85);
      const gap = Math.max(0, quota - current);
      const open = node.openPositions ?? gap;
      const fillRate = Math.round((current / (quota || 1)) * 100);
      let status = 'Đủ định biên (100%)';
      if (fillRate > 100) status = `Vượt định biên (+${fillRate - 100}%)`;
      else if (fillRate < 80) status = 'Thiếu nghiêm trọng (<80%)';
      else if (fillRate < 100) status = 'Thiếu nhẹ (80-99%)';

      return [
        node.code,
        `"${node.name.replace(/"/g, '""')}"`,
        `Cấp ${node.level}`,
        `"${(parent?.name || 'Ban Lãnh Đạo Cao Nhất').replace(/"/g, '""')}"`,
        `"${node.leaderName.replace(/"/g, '""')}"`,
        `"${node.leaderTitle.replace(/"/g, '""')}"`,
        quota,
        current,
        gap,
        open,
        `${fillRate}%`,
        `"${status}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Dinh_Bien_Nhan_Su_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerNotice('Đã xuất Báo Cáo Định Biên Nhân Sự thành công (.CSV)!');
  };

  // 1.1: Xuất Báo Cáo So Sánh Định Biên & Tuyển Dụng ra CSV
  const handleExportRecruitmentComparisonCsv = () => {
    const headers = [
      'Mã Đơn Vị',
      'Phòng Ban / Khối',
      'Chỉ Tiêu Định Biên',
      'Nhân Sự Hiện Tại',
      'Nhu Cầu Bổ Sung (Gap)',
      'Số Tin JD Đang Tuyển',
      'Ứng Viên Trong Phễu Tuyển Dụng',
      'Ứng Viên Phỏng Vấn / Test',
      'Ứng Viên Đã Đề Nghị Việc (Offer)',
      'Tỷ Lệ Bù Đắp Tuyển Dụng (%)',
      'Đánh Giá Rủi Ro Tuyển Dụng',
    ];

    const rows = orgNodes.map((node) => {
      const quota = node.headcountQuota ?? node.headCount ?? 1;
      const current = node.currentHeadcount ?? Math.round(quota * 0.85);
      const gap = Math.max(0, quota - current);

      const deptJds = jobs.filter(
        (j) =>
          j.department.toLowerCase().includes(node.name.toLowerCase()) ||
          node.name.toLowerCase().includes(j.department.toLowerCase()) ||
          j.department.toLowerCase().includes(node.code.toLowerCase())
      );

      const deptCandidates = candidates.filter((c) =>
        deptJds.some((j) => j.id === c.jobId)
      );

      const interviewCount = deptCandidates.filter(
        (c) => c.stage === 'Phỏng vấn' || c.stage === 'Đã thẩm định'
      ).length;

      const offerCount = deptCandidates.filter((c) => c.stage === 'Đề nghị việc').length;
      const pipelineCoverage = gap > 0 ? Math.round((deptCandidates.length / gap) * 100) : 100;

      let riskAssessment = 'Ổn định: Đã đủ định biên';
      if (gap > 0 && deptJds.length === 0) {
        riskAssessment = 'Báo động đỏ: Thiếu định biên nhưng CHƯA MỞ JD!';
      } else if (gap > 0 && deptCandidates.length < gap) {
        riskAssessment = 'Cảnh báo: Phễu ứng viên mỏng, cần đẩy mạnh!';
      } else if (gap > 0) {
        riskAssessment = 'Tiến độ tốt: Phễu ứng viên dồi dào, đáp ứng chỉ tiêu';
      }

      return [
        node.code,
        `"${node.name.replace(/"/g, '""')}"`,
        quota,
        current,
        gap,
        deptJds.length,
        deptCandidates.length,
        interviewCount,
        offerCount,
        `${pipelineCoverage}%`,
        `"${riskAssessment}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_So_Sanh_Dinh_Bien_Tuyen_Dung_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerNotice('Đã xuất Báo Cáo So Sánh Định Biên & Tuyển Dụng thành công (.CSV)!');
  };

  const handleOpenAdjustParent = (node: OrgNode) => {
    setOrgNodeToAdjust(node);
    setOrgParentId(node.parentId || null);
    setIsAdjustParentModalOpen(true);
  };

  const handleSaveAdjustParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgNodeToAdjust) return;

    if (orgParentId === orgNodeToAdjust.id) {
      alert('Một đơn vị không thể tự làm cấp trên của chính mình!');
      return;
    }

    const parent = orgNodes.find((n) => n.id === orgParentId);
    const newLevel = parent ? parent.level + 1 : 1;

    const updated = orgNodes.map((n) => {
      if (n.id === orgNodeToAdjust.id) {
        return {
          ...n,
          parentId: orgParentId || null,
          level: newLevel,
        };
      }
      return n;
    });

    setOrgNodes(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      orgChartNodes: updated,
    });
    setIsAdjustParentModalOpen(false);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Điều chỉnh cấp trên trong sơ đồ',
      target: orgNodeToAdjust.name,
      details: `Chuyển đơn vị [${orgNodeToAdjust.name}] sang trực thuộc [${parent?.name || 'Ban Lãnh Đạo Cao Nhất'}]`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });
    triggerNotice(`Đã chuyển đơn vị [${orgNodeToAdjust.name}] sang cấp trên mới!`);
  };

  const handleDeleteOrgNode = (nodeId: string) => {
    const node = orgNodes.find((n) => n.id === nodeId);
    if (!node) return;

    const children = orgNodes.filter((n) => n.parentId === nodeId);
    if (children.length > 0) {
      alert(`Đơn vị [${node.name}] đang có ${children.length} đơn vị con trực thuộc (${children.map((c) => c.name).join(', ')}). Vui lòng điều chỉnh hoặc xóa các đơn vị con trước khi xóa đơn vị này!`);
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn vị [${node.name}] khỏi sơ đồ tổ chức không?`)) {
      return;
    }

    const updated = orgNodes.filter((n) => n.id !== nodeId);
    setOrgNodes(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      orgChartNodes: updated,
    });

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Xóa đơn vị khỏi sơ đồ tổ chức',
      target: node.name,
      details: `Xóa vĩnh viễn đơn vị [${node.code}] khỏi cơ cấu tổ chức`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });
    triggerNotice(`Đã xóa đơn vị [${node.name}] thành công!`);
  };

  // ----------------------------------------------------
  // SECTION: SỬA & XÓA CẤU HÌNH BENCHMARK (1.2)
  // ----------------------------------------------------
  const [isEditBenchmarkModalOpen, setIsEditBenchmarkModalOpen] = useState(false);
  const [benchmarkToEdit, setBenchmarkToEdit] = useState<BenchmarkConfigProfile | null>(null);
  const [editProfileTitle, setEditProfileTitle] = useState('');
  const [editProfileNotes, setEditProfileNotes] = useState('');

  const handleOpenEditBenchmark = (profile: BenchmarkConfigProfile) => {
    setBenchmarkToEdit(profile);
    setEditProfileTitle(profile.title);
    setEditProfileNotes(profile.notes || '');
    setIsEditBenchmarkModalOpen(true);
  };

  const handleSaveEditBenchmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!benchmarkToEdit || !editProfileTitle.trim()) return;

    const updated = benchmarkProfiles.map((p) =>
      p.id === benchmarkToEdit.id
        ? { ...p, title: editProfileTitle.trim(), notes: editProfileNotes.trim() }
        : p
    );
    setBenchmarkProfiles(updated);
    if (activeProfileId === benchmarkToEdit.id) {
      setProfileTitle(editProfileTitle.trim());
    }
    onUpdateAdminSettings({
      ...adminSettings,
      benchmarkProfiles: updated,
    });
    setIsEditBenchmarkModalOpen(false);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Cập nhật tiêu đề cấu hình benchmark',
      target: editProfileTitle.trim(),
      details: `Sửa tên và ghi chú cho hồ sơ benchmark [${editProfileTitle.trim()}]`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });
    triggerNotice(`Đã cập nhật cấu hình benchmark [${editProfileTitle.trim()}] thành công!`);
  };

  const handleDeleteBenchmarkProfile = (profileId: string) => {
    const target = benchmarkProfiles.find((p) => p.id === profileId);
    if (!target) return;
    if (benchmarkProfiles.length <= 1) {
      alert('Không thể xóa cấu hình duy nhất còn lại trong hệ thống!');
      return;
    }
    if (target.isDefault) {
      alert('Không thể xóa cấu hình đang được thiết lập là Mặc định hệ thống! Hãy chọn cấu hình khác làm mặc định trước.');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa cấu hình benchmark [${target.title}] không?`)) {
      return;
    }

    const updated = benchmarkProfiles.filter((p) => p.id !== profileId);
    const newActiveId = activeProfileId === profileId ? updated[0].id : activeProfileId;

    setBenchmarkProfiles(updated);
    setActiveProfileId(newActiveId);
    const newActiveProf = updated.find((p) => p.id === newActiveId) || updated[0];
    setProfileTitle(newActiveProf.title);
    setDimensionCount(newActiveProf.dimensionCount);
    setDimensions(newActiveProf.dimensions);

    onUpdateAdminSettings({
      ...adminSettings,
      benchmarkProfiles: updated,
      activeBenchmarkProfileId: newActiveId,
    });

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Xóa cấu hình benchmark',
      target: target.title,
      details: `Xóa vĩnh viễn cấu hình benchmark [${target.id}]`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });
    triggerNotice(`Đã xóa cấu hình benchmark [${target.title}] thành công!`);
  };

  const handleSetDefaultBenchmark = (profileId: string) => {
    const updated = benchmarkProfiles.map((p) => ({
      ...p,
      isDefault: p.id === profileId,
    }));
    setBenchmarkProfiles(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      benchmarkProfiles: updated,
    });
    triggerNotice('Đã thiết lập cấu hình benchmark mặc định thành công!');
  };

  // -------------------------------------------------------------------------
  // 2.1: GOOGLE CONTACTS MANAGEMENT (DANH BẠ LIÊN HỆ THEO CHUẨN GOOGLE CONTACT)
  // -------------------------------------------------------------------------
  const [contactsList, setContactsList] = useState<GoogleContact[]>(adminSettings.contacts || []);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactGroupFilter, setContactGroupFilter] = useState('all');

  // Contact Modal (Create / Edit)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // Form fields mirroring Google Contacts "Tạo người liên hệ"
  const [cNamePrefix, setCNamePrefix] = useState('');
  const [cFamilyName, setCFamilyName] = useState('');
  const [cAdditionalName, setCAdditionalName] = useState('');
  const [cGivenName, setCGivenName] = useState('');
  const [cNickname, setCNickname] = useState('');
  const [cOrganization, setCOrganization] = useState('SEICO');
  const [cJobTitle, setCJobTitle] = useState('');
  const [cDepartment, setCDepartment] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cEmailType, setCEmailType] = useState('Work');
  const [cSecondaryEmail, setCSecondaryEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cPhoneType, setCPhoneType] = useState('Mobile');
  const [cSecondaryPhone, setCSecondaryPhone] = useState('');
  const [cGroupMembership, setCGroupMembership] = useState('* myContacts ::: Đội Ngũ Tuyển Dụng');
  const [cAddress, setCAddress] = useState('');
  const [cBirthday, setCBirthday] = useState('');
  const [cGender, setCGender] = useState<string>('Nam');
  const [cWebsite, setCWebsite] = useState('');
  const [cNotes, setCNotes] = useState('');

  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Open modal for manual creation
  const handleOpenAddContact = () => {
    setEditingContactId(null);
    setCNamePrefix('Anh');
    setCFamilyName('');
    setCAdditionalName('');
    setCGivenName('');
    setCNickname('');
    setCOrganization('SEICO');
    setCJobTitle('');
    setCDepartment('Khối Tuyển Dụng & Nhân Sự');
    setCEmail('');
    setCEmailType('Work');
    setCSecondaryEmail('');
    setCPhone('');
    setCPhoneType('Mobile');
    setCSecondaryPhone('');
    setCGroupMembership('* myContacts ::: Hội Đồng Tuyển Dụng');
    setCAddress('Tòa tháp Keangnam Landmark 72, Hà Nội');
    setCBirthday('1992-01-01');
    setCGender('Nam');
    setCWebsite('');
    setCNotes('');
    setIsContactModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditContact = (contact: GoogleContact) => {
    setEditingContactId(contact.id);
    setCNamePrefix(contact.namePrefix || '');
    setCFamilyName(contact.familyName || '');
    setCAdditionalName(contact.additionalName || '');
    setCGivenName(contact.givenName || '');
    setCNickname(contact.nickname || '');
    setCOrganization(contact.organization || 'SEICO');
    setCJobTitle(contact.jobTitle || '');
    setCDepartment(contact.department || '');
    setCEmail(contact.email || '');
    setCEmailType(contact.emailType || 'Work');
    setCSecondaryEmail(contact.secondaryEmail || '');
    setCPhone(contact.phone || '');
    setCPhoneType(contact.phoneType || 'Mobile');
    setCSecondaryPhone(contact.secondaryPhone || '');
    setCGroupMembership(contact.groupMembership || '* myContacts');
    setCAddress(contact.address || '');
    setCBirthday(contact.birthday || '');
    setCGender(contact.gender || 'Nam');
    setCWebsite(contact.website || '');
    setCNotes(contact.notes || '');
    setIsContactModalOpen(true);
  };

  // Save contact (create or edit)
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cEmail.trim() && !cPhone.trim()) {
      alert('Vui lòng nhập ít nhất Email hoặc Số điện thoại của người liên hệ.');
      return;
    }

    const fullName = [cNamePrefix, cFamilyName, cAdditionalName, cGivenName]
      .filter(Boolean)
      .join(' ')
      .trim() || cGivenName.trim() || cEmail.trim();

    let updatedList: GoogleContact[];
    if (editingContactId) {
      updatedList = contactsList.map((c) => {
        if (c.id === editingContactId) {
          return {
            ...c,
            name: fullName,
            givenName: cGivenName.trim(),
            additionalName: cAdditionalName.trim(),
            familyName: cFamilyName.trim(),
            namePrefix: cNamePrefix.trim(),
            nickname: cNickname.trim(),
            organization: cOrganization.trim(),
            jobTitle: cJobTitle.trim(),
            department: cDepartment.trim(),
            email: cEmail.trim(),
            emailType: cEmailType,
            secondaryEmail: cSecondaryEmail.trim(),
            phone: cPhone.trim(),
            phoneType: cPhoneType,
            secondaryPhone: cSecondaryPhone.trim(),
            groupMembership: cGroupMembership.trim(),
            address: cAddress.trim(),
            birthday: cBirthday,
            gender: cGender,
            website: cWebsite.trim(),
            notes: cNotes.trim(),
          };
        }
        return c;
      });
      triggerNotice(`Đã cập nhật người liên hệ [${fullName}] thành công!`);
    } else {
      const newContact: GoogleContact = {
        id: `CONT-${Date.now().toString().slice(-4)}`,
        name: fullName,
        givenName: cGivenName.trim(),
        additionalName: cAdditionalName.trim(),
        familyName: cFamilyName.trim(),
        namePrefix: cNamePrefix.trim(),
        nickname: cNickname.trim(),
        organization: cOrganization.trim(),
        jobTitle: cJobTitle.trim(),
        department: cDepartment.trim(),
        email: cEmail.trim(),
        emailType: cEmailType,
        secondaryEmail: cSecondaryEmail.trim(),
        phone: cPhone.trim(),
        phoneType: cPhoneType,
        secondaryPhone: cSecondaryPhone.trim(),
        groupMembership: cGroupMembership.trim(),
        address: cAddress.trim(),
        birthday: cBirthday,
        gender: cGender,
        website: cWebsite.trim(),
        notes: cNotes.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      updatedList = [newContact, ...contactsList];
      triggerNotice(`Đã thêm người liên hệ [${fullName}] vào danh bạ Google Contacts!`);
    }

    setContactsList(updatedList);
    onUpdateAdminSettings({
      ...adminSettings,
      contacts: updatedList,
    });
    setIsContactModalOpen(false);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: editingContactId ? 'Cập nhật danh bạ' : 'Tạo người liên hệ mới',
      target: fullName,
      details: `Google Contact: ${cJobTitle || 'Liên hệ'} - ${cEmail} - ${cPhone}`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });
  };

  // Delete contact
  const handleDeleteContact = (contactId: string) => {
    const target = contactsList.find((c) => c.id === contactId);
    if (!target) return;
    if (!confirm(`Bạn có chắc muốn xóa người liên hệ [${target.name}] khỏi danh bạ không?`)) return;

    const updated = contactsList.filter((c) => c.id !== contactId);
    setContactsList(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      contacts: updated,
    });
    triggerNotice(`Đã xóa người liên hệ [${target.name}] khỏi danh bạ!`);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Xóa người liên hệ danh bạ',
      target: target.name,
      details: `Xóa liên hệ [${target.email}] khỏi danh bạ Google Contacts`,
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });
  };

  // 2.1: Xuất danh bạ theo chuẩn Google Contacts CSV (có UTF-8 BOM)
  const handleExportGoogleContactsCsv = () => {
    const headers = [
      'Name',
      'Given Name',
      'Additional Name',
      'Family Name',
      'Yomi Name',
      'Given Name Yomi',
      'Additional Name Yomi',
      'Family Name Yomi',
      'Name Prefix',
      'Name Suffix',
      'Initials',
      'Nickname',
      'Short Name',
      'Maiden Name',
      'Birthday',
      'Gender',
      'Location',
      'Billing Information',
      'Directory Server',
      'Mileage',
      'Occupation',
      'Hobby',
      'Sensitivity',
      'Priority',
      'Subject',
      'Notes',
      'Language',
      'Photo',
      'Group Membership',
      'E-mail 1 - Type',
      'E-mail 1 - Value',
      'E-mail 2 - Type',
      'E-mail 2 - Value',
      'Phone 1 - Type',
      'Phone 1 - Value',
      'Phone 2 - Type',
      'Phone 2 - Value',
      'Address 1 - Type',
      'Address 1 - Formatted',
      'Address 1 - Street',
      'Address 1 - City',
      'Address 1 - PO Box',
      'Address 1 - Region',
      'Address 1 - Postal Code',
      'Address 1 - Country',
      'Address 1 - Extended Address',
      'Organization 1 - Type',
      'Organization 1 - Name',
      'Organization 1 - Yomi Name',
      'Organization 1 - Title',
      'Organization 1 - Department',
      'Organization 1 - Symbol',
      'Organization 1 - Location',
      'Organization 1 - Job Description',
      'Website 1 - Type',
      'Website 1 - Value',
    ];

    const escapeCsv = (val: string | undefined | null) => {
      if (!val) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = contactsList.map((c) => {
      return [
        escapeCsv(c.name),
        escapeCsv(c.givenName || ''),
        escapeCsv(c.additionalName || ''),
        escapeCsv(c.familyName || ''),
        '', // Yomi Name
        '', // Given Name Yomi
        '', // Additional Name Yomi
        '', // Family Name Yomi
        escapeCsv(c.namePrefix || ''),
        '', // Name Suffix
        '', // Initials
        escapeCsv(c.nickname || ''),
        '', // Short Name
        '', // Maiden Name
        escapeCsv(c.birthday || ''),
        escapeCsv(c.gender || ''),
        '', // Location
        '', // Billing Information
        '', // Directory Server
        '', // Mileage
        escapeCsv(c.jobTitle || ''), // Occupation
        '', // Hobby
        '', // Sensitivity
        '', // Priority
        '', // Subject
        escapeCsv(c.notes || ''),
        'vi', // Language
        '', // Photo
        escapeCsv(c.groupMembership || '* myContacts'),
        escapeCsv(c.emailType || 'Work'),
        escapeCsv(c.email || ''),
        'Work',
        escapeCsv(c.secondaryEmail || ''),
        escapeCsv(c.phoneType || 'Mobile'),
        escapeCsv(c.phone || ''),
        'Work',
        escapeCsv(c.secondaryPhone || ''),
        'Work',
        escapeCsv(c.address || ''),
        escapeCsv(c.address || ''),
        'Hà Nội',
        '',
        'Hà Nội',
        '100000',
        'Việt Nam',
        '',
        'Work',
        escapeCsv(c.organization || 'SEICO'),
        '',
        escapeCsv(c.jobTitle || ''),
        escapeCsv(c.department || ''),
        '',
        'Hà Nội',
        '',
        'Work',
        escapeCsv(c.website || ''),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `google_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Xuất danh bạ Google CSV',
      target: `${contactsList.length} liên hệ`,
      details: 'Xuất file định dạng chuẩn Google Contacts CSV có hỗ trợ UTF-8 BOM',
      ipAddress: '118.70.182.45',
      status: 'Thành công',
    });

    triggerNotice(`Đã xuất thành công ${contactsList.length} người liên hệ theo chuẩn Google CSV!`);
  };

  // 2.1: Nhập danh bạ theo chuẩn Google Contacts CSV
  const handleImportGoogleContactsCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          alert('Tệp CSV không chứa dòng dữ liệu người liên hệ nào.');
          return;
        }

        const parseCsvLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headerLine = lines[0].replace(/^\uFEFF/, '');
        const headers = parseCsvLine(headerLine).map((h) => h.toLowerCase());

        const getColIdx = (...names: string[]) => {
          for (const name of names) {
            const idx = headers.indexOf(name.toLowerCase());
            if (idx !== -1) return idx;
          }
          return -1;
        };

        const nameIdx = getColIdx('name', 'họ tên', 'full name');
        const givenNameIdx = getColIdx('given name', 'tên', 'first name');
        const familyNameIdx = getColIdx('family name', 'họ', 'last name');
        const additionalNameIdx = getColIdx('additional name', 'tên đệm', 'middle name');
        const prefixIdx = getColIdx('name prefix', 'tiền tố', 'danh xưng');
        const nicknameIdx = getColIdx('nickname', 'biệt danh');
        const emailIdx = getColIdx('e-mail 1 - value', 'email', 'e-mail', 'mail');
        const emailTypeIdx = getColIdx('e-mail 1 - type', 'email type');
        const phoneIdx = getColIdx('phone 1 - value', 'phone', 'điện thoại', 'mobile');
        const phoneTypeIdx = getColIdx('phone 1 - type', 'phone type');
        const orgIdx = getColIdx('organization 1 - name', 'organization', 'company', 'công ty');
        const titleIdx = getColIdx('organization 1 - title', 'job title', 'title', 'chức danh', 'chức vụ');
        const deptIdx = getColIdx('organization 1 - department', 'department', 'phòng ban');
        const groupIdx = getColIdx('group membership', 'group', 'nhãn', 'nhóm');
        const notesIdx = getColIdx('notes', 'ghi chú', 'note');
        const addressIdx = getColIdx('address 1 - formatted', 'address', 'địa chỉ');
        const bdayIdx = getColIdx('birthday', 'ngày sinh');
        const genderIdx = getColIdx('gender', 'giới tính');
        const websiteIdx = getColIdx('website 1 - value', 'website');

        const newContacts: GoogleContact[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCsvLine(lines[i]);
          if (cols.length === 0) continue;

          const email = emailIdx !== -1 ? cols[emailIdx] : '';
          const phone = phoneIdx !== -1 ? cols[phoneIdx] : '';
          const givenName = givenNameIdx !== -1 ? cols[givenNameIdx] : '';
          const familyName = familyNameIdx !== -1 ? cols[familyNameIdx] : '';
          const additionalName = additionalNameIdx !== -1 ? cols[additionalNameIdx] : '';
          const prefix = prefixIdx !== -1 ? cols[prefixIdx] : '';
          let name = nameIdx !== -1 ? cols[nameIdx] : '';

          if (!name) {
            name = [prefix, familyName, additionalName, givenName].filter(Boolean).join(' ') || email || phone || `Người liên hệ ${i}`;
          }

          if (!email && !phone && !name) continue;

          newContacts.push({
            id: `CONT-${Date.now().toString().slice(-4)}-${i}`,
            name,
            givenName,
            familyName,
            additionalName,
            namePrefix: prefix,
            nickname: nicknameIdx !== -1 ? cols[nicknameIdx] : '',
            email: email || 'chua_co_email@domain.com',
            emailType: emailTypeIdx !== -1 ? cols[emailTypeIdx] : 'Work',
            phone: phone || '',
            phoneType: phoneTypeIdx !== -1 ? cols[phoneTypeIdx] : 'Mobile',
            organization: orgIdx !== -1 ? cols[orgIdx] : 'SEICO',
            jobTitle: titleIdx !== -1 ? cols[titleIdx] : '',
            department: deptIdx !== -1 ? cols[deptIdx] : '',
            groupMembership: groupIdx !== -1 ? cols[groupIdx] : '* myContacts',
            notes: notesIdx !== -1 ? cols[notesIdx] : '',
            address: addressIdx !== -1 ? cols[addressIdx] : '',
            birthday: bdayIdx !== -1 ? cols[bdayIdx] : '',
            gender: genderIdx !== -1 ? cols[genderIdx] : 'Nam',
            website: websiteIdx !== -1 ? cols[websiteIdx] : '',
            createdAt: new Date().toISOString().slice(0, 10),
          });
        }

        if (newContacts.length === 0) {
          alert('Không tìm thấy bản ghi người liên hệ hợp lệ nào trong tệp CSV.');
          return;
        }

        const merged = [...newContacts, ...contactsList];
        setContactsList(merged);
        onUpdateAdminSettings({
          ...adminSettings,
          contacts: merged,
        });

        triggerNotice(`Đã nhập thành công ${newContacts.length} người liên hệ từ tệp Google Contacts CSV!`);
        setIsImportModalOpen(false);

        onAddAuditLog({
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role,
          action: 'Nhập danh bạ Google CSV',
          target: `${newContacts.length} người liên hệ`,
          details: `Nhập thành công từ tệp [${file.name}], tự động chuẩn hóa các cột Google Contacts`,
          ipAddress: '118.70.182.45',
          status: 'Thành công',
        });
      } catch (err: any) {
        alert('Lỗi đọc tệp CSV: ' + err.message);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // Filtered contacts list
  const filteredContacts = contactsList.filter((c) => {
    const q = contactSearchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.jobTitle && c.jobTitle.toLowerCase().includes(q)) ||
      (c.organization && c.organization.toLowerCase().includes(q)) ||
      (c.department && c.department.toLowerCase().includes(q));

    const matchesGroup =
      contactGroupFilter === 'all' ||
      (c.groupMembership && c.groupMembership.toLowerCase().includes(contactGroupFilter.toLowerCase()));

    return matchesSearch && matchesGroup;
  });

  // 2.1: Giao diện bảng danh bạ Google Contacts
  const renderGoogleContactsPanel = () => {
    return (
      <div className="glass-panel rounded-[26px] p-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-[12px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF]">
                <BookUser className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                Danh Bạ Người Liên Hệ (Google Contacts Chuẩn)
              </h3>
              <span className="text-xs font-mono font-bold tabular-nums px-2.5 py-0.5 rounded-full bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF]">
                {contactsList.length} liên hệ
              </span>
            </div>
            <p className="text-xs text-[#8E8E93] dark:text-[#98989D]">
              Quản lý danh bạ chuẩn Google Contacts: Thêm thủ công đầy đủ các trường thông tin của Google Contact, Xuất & Nhập định dạng chuẩn Google CSV (UTF-8).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Nút Nhập CSV chuẩn Google */}
            <label className="btn-fluent-glass inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] rounded-full cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập CSV Google</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportGoogleContactsCsv}
                className="hidden"
              />
            </label>

            {/* Nút Xuất CSV chuẩn Google */}
            <button
              type="button"
              onClick={handleExportGoogleContactsCsv}
              className="btn-fluent-glass inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] rounded-full cursor-pointer"
              title="Xuất file CSV theo chuẩn Google Contacts với BOM tiếng Việt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất CSV Google</span>
            </button>

            {/* Nút Thêm thủ công */}
            <button
              type="button"
              onClick={handleOpenAddContact}
              className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-full cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Người Liên Hệ</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={contactSearchQuery}
              onChange={(e) => setContactSearchQuery(e.target.value)}
              placeholder="Tìm theo họ tên, email, số điện thoại, công ty, chức danh, phòng ban..."
              className="w-full pl-10 pr-4 py-2.5 neumorphic-inset rounded-[14px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/40"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={contactGroupFilter}
              onChange={(e) => setContactGroupFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 neumorphic-inset rounded-[14px] text-xs font-medium text-[#1C1C1E] dark:text-white cursor-pointer focus:outline-none"
            >
              <option value="all">Tất cả nhóm liên hệ</option>
              <option value="Ban Giám Đốc">Ban Giám Đốc</option>
              <option value="Hội Đồng Tuyển Dụng">Hội Đồng Tuyển Dụng</option>
              <option value="Hội Đồng Phỏng Vấn">Hội Đồng Phỏng Vấn</option>
              <option value="Đội Ngũ Tuyển Dụng">Đội Ngũ Tuyển Dụng</option>
              <option value="Người Đánh Giá Kỹ Thuật">Người Đánh Giá Kỹ Thuật</option>
            </select>
          </div>
        </div>

        {/* Contact Table */}
        {filteredContacts.length === 0 ? (
          <div className="py-12 text-center space-y-2 border-2 border-dashed border-black/10 dark:border-white/15 rounded-[20px]">
            <BookUser className="w-8 h-8 text-[#8E8E93] mx-auto" />
            <p className="text-xs font-bold text-[#1C1C1E] dark:text-white">
              Không tìm thấy người liên hệ nào phù hợp
            </p>
            <p className="text-[11px] text-[#8E8E93] dark:text-[#98989D]">
              Hãy thử tìm kiếm với từ khóa khác hoặc nhấn "Tạo Người Liên Hệ" để thêm người mới vào danh bạ.
            </p>
          </div>
        ) : (
          <div className="border border-black/[0.06] dark:border-white/[0.08] rounded-[20px] overflow-hidden bg-white/50 dark:bg-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[1100px]">
                <thead className="bg-black/[0.03] dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.08] text-[#8E8E93] dark:text-[#98989D] text-[11px] uppercase tracking-wider">
                  <tr className="whitespace-nowrap">
                    <th className="py-3.5 px-4 font-semibold">Người Liên Hệ</th>
                    <th className="py-3.5 px-4 font-semibold">Công Ty & Chức Vụ</th>
                    <th className="py-3.5 px-4 font-semibold">Email & Điện Thoại</th>
                    <th className="py-3.5 px-4 font-semibold">Nhóm / Nhãn (Labels)</th>
                    <th className="py-3.5 px-4 font-semibold">Ghi Chú</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-[#007AFF]/[0.04] dark:hover:bg-white/[0.04] transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0A84FF] to-[#5856D6] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {contact.givenName ? contact.givenName.slice(0, 2) : contact.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-[#1C1C1E] dark:text-white">
                              {contact.namePrefix && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-black/[0.05] dark:bg-white/[0.08] text-[#3C3C43] dark:text-[#EBEBF5] rounded-md">
                                  {contact.namePrefix}
                                </span>
                              )}
                              <span>{contact.name}</span>
                              {contact.nickname && (
                                <span className="text-[10px] text-[#8E8E93] font-normal">
                                  ({contact.nickname})
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-[#8E8E93] block tabular-nums">
                              Mã: {contact.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Org & Title */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <strong className="text-[#1C1C1E] dark:text-white block text-[11px]">
                            {contact.jobTitle || 'Chưa cập nhật chức vụ'}
                          </strong>
                          <span className="text-[11px] text-[#8E8E93] dark:text-[#98989D] block truncate max-w-[200px]">
                            {contact.department ? `${contact.department} · ` : ''}{contact.organization || 'SEICO'}
                          </span>
                        </div>
                      </td>

                      {/* Contact Info (Email & Phone) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[#3C3C43] dark:text-[#EBEBF5]">
                            <Mail className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF] shrink-0" />
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-[11px] hover:text-[#007AFF] hover:underline font-mono"
                            >
                              {contact.email}
                            </a>
                            <span className="text-[9px] text-[#8E8E93]">({contact.emailType || 'Work'})</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-1.5 text-[#3C3C43] dark:text-[#EBEBF5]">
                              <Phone className="w-3.5 h-3.5 text-[#34C759] dark:text-[#30D158] shrink-0" />
                              <a
                                href={`tel:${contact.phone}`}
                                className="text-[11px] hover:text-[#007AFF] font-mono tabular-nums"
                              >
                                {contact.phone}
                              </a>
                              <span className="text-[9px] text-[#8E8E93]">({contact.phoneType || 'Mobile'})</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Groups / Labels */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {contact.groupMembership ? (
                            contact.groupMembership
                              .split(':::')
                              .map((g) => g.replace(/^\*\s*/, '').trim())
                              .filter((g) => g && g !== 'myContacts')
                              .map((lbl, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF] whitespace-nowrap"
                                >
                                  {lbl}
                                </span>
                              ))
                          ) : (
                            <span className="text-[#8E8E93] text-[10px] italic">Liên hệ chung</span>
                          )}
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-[11px] text-[#8E8E93] dark:text-[#98989D] line-clamp-2" title={contact.notes}>
                          {contact.notes || (contact.address ? `Đ/c: ${contact.address}` : 'Không có ghi chú')}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditContact(contact)}
                            className="p-1.5 text-[#3C3C43] dark:text-[#EBEBF5] hover:text-[#007AFF] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded-full cursor-pointer transition-colors"
                            title="Sửa thông tin người liên hệ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-1.5 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-full cursor-pointer transition-colors"
                            title="Xóa người liên hệ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1720px] w-full mx-auto">
      {/* 1. Header Banner - Apple iOS 26 Liquid Glass Banner */}
      <div className="relative overflow-hidden rounded-[26px] p-7 text-white shadow-[0_20px_48px_-16px_rgba(0,122,255,0.42)] border border-white/30 bg-gradient-to-br from-[#0A84FF] via-[#007AFF] to-[#5856D6]">
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-white/15 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-24 w-60 h-60 rounded-full bg-cyan-300/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-white/85">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Trung tâm cài đặt & quản trị hệ thống ATS</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-white">2026</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isMasterAdmin
                ? 'Bảng Điều Khiển Cài Đặt & Quản Trị Hệ Thống'
                : 'Trung Tâm Cài Đặt Tài Khoản & Quản Trị Kênh Tuyển Dụng'}
            </h2>

            <p className="text-xs text-white/85 max-w-2xl leading-relaxed">
              {isMasterAdmin
                ? 'Quản trị danh sách người dùng, ma trận phân quyền linh hoạt, kho CV tập trung, cấu hình benchmark đa chiều và nhật ký kiểm toán.'
                : 'Quản trị hồ sơ tài khoản, kết nối/chỉnh sửa/xóa các kênh đăng tin tuyển dụng và cấu hình bảo mật cá nhân.'}
            </p>
          </div>

          {/* User Card Pill */}
          <div className="flex items-center gap-3 shrink-0 p-3.5 bg-white/15 backdrop-blur-xl rounded-[20px] border border-white/25 shadow-lg">
            <div className="w-11 h-11 rounded-full bg-white/25 border border-white/40 flex items-center justify-center text-white font-bold text-sm">
              {currentUser.fullName.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">{currentUser.fullName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#007AFF] shadow-xs">
                  {currentUser.role === 'master_admin'
                    ? 'Quản trị hệ thống'
                    : currentUser.role === 'ops_admin'
                    ? 'Quản trị vận hành'
                    : currentUser.role === 'member'
                    ? 'Thành viên'
                    : currentUser.role}
                </span>
              </div>
              <span className="text-[11px] text-white/85 block truncate max-w-[180px] mt-0.5">
                {currentUser.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notice Toast */}
      {notice && (
        <div className="p-3.5 bg-[#34C759]/12 border border-[#34C759]/30 rounded-[18px] text-xs font-semibold text-[#1C1C1E] dark:text-white flex items-center justify-between shadow-lg backdrop-blur-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Layout with Left-Side Vertical Navigation Table / Panel (1.1) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT VERTICAL SIDEBAR TABLE */}
        <div className="w-full lg:w-72 shrink-0 glass-panel rounded-[24px] p-4 space-y-4 lg:sticky lg:top-6">
          {/* Header */}
          <div className="pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08] px-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8E8E93]">
              Bảng mục quản trị
            </span>
            <span className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF]">
              Admin ATS
            </span>
          </div>

          {/* Group 1: QUẢN TRỊ HỆ THỐNG */}
          {isMasterAdmin && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] block px-2.5 pt-1">
                Quản Trị Hệ Thống
              </span>

              <button
                type="button"
                onClick={() => {
                  setMainSection('system');
                  setSystemSubTab('rbac_users');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                  mainSection === 'system' && systemSubTab === 'rbac_users'
                    ? 'btn-fluent-primary text-white shadow-md'
                    : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Phân Quyền Tài Khoản</span>
                </div>
                <span className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${mainSection === 'system' && systemSubTab === 'rbac_users' ? 'bg-white/25 text-white' : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#3C3C43] dark:text-[#EBEBF5]'}`}>
                  {allUsers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainSection('system');
                  setSystemSubTab('role_permissions');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                  mainSection === 'system' && systemSubTab === 'role_permissions'
                    ? 'btn-fluent-primary text-white shadow-md'
                    : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Ma Trận Quyền Hạn</span>
                </div>
              </button>

              {/* 1.3: Sơ Đồ Tổ Chức */}
              <button
                type="button"
                onClick={() => {
                  setMainSection('system');
                  setSystemSubTab('org_chart');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                  mainSection === 'system' && systemSubTab === 'org_chart'
                    ? 'btn-fluent-primary text-white shadow-md'
                    : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Network className="w-4 h-4" />
                  <span>Sơ Đồ Tổ Chức</span>
                </div>
                <span className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${mainSection === 'system' && systemSubTab === 'org_chart' ? 'bg-white/25 text-white' : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#3C3C43] dark:text-[#EBEBF5]'}`}>
                  {orgNodes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainSection('system');
                  setSystemSubTab('central_cvs');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                  mainSection === 'system' && systemSubTab === 'central_cvs'
                    ? 'btn-fluent-primary text-white shadow-md'
                    : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4" />
                  <span>Kho Dữ Liệu CV Chung</span>
                </div>
                <span className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${mainSection === 'system' && systemSubTab === 'central_cvs' ? 'bg-white/25 text-white' : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#3C3C43] dark:text-[#EBEBF5]'}`}>
                  {candidates.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainSection('system');
                  setSystemSubTab('departments');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                  mainSection === 'system' && systemSubTab === 'departments'
                    ? 'btn-fluent-primary text-white shadow-md'
                    : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4" />
                  <span>Phòng Ban & Quy Tắc ID</span>
                </div>
                <span className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${mainSection === 'system' && systemSubTab === 'departments' ? 'bg-white/25 text-white' : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#3C3C43] dark:text-[#EBEBF5]'}`}>
                  {departments.length}
                </span>
              </button>

              {/* 1.2: Cấu Hình Benchmark */}
              <button
                type="button"
                onClick={() => {
                  setMainSection('system');
                  setSystemSubTab('benchmark');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                  mainSection === 'system' && systemSubTab === 'benchmark'
                    ? 'btn-fluent-primary text-white shadow-md'
                    : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4" />
                  <span>Cấu Hình Benchmark</span>
                </div>
                <span className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${mainSection === 'system' && systemSubTab === 'benchmark' ? 'bg-white/25 text-white' : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#3C3C43] dark:text-[#EBEBF5]'}`}>
                  {benchmarkProfiles.length}
                </span>
              </button>

              {/* 2.1: Danh Bạ Liên Hệ (Google Contacts) */}
              <button
                type="button"
                onClick={() => {
                  setMainSection('system');
                  setSystemSubTab('contacts');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                  mainSection === 'system' && systemSubTab === 'contacts'
                    ? 'btn-fluent-primary text-white shadow-md'
                    : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookUser className="w-4 h-4" />
                  <span>Danh Bạ Liên Hệ</span>
                </div>
                <span className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${mainSection === 'system' && systemSubTab === 'contacts' ? 'bg-white/25 text-white' : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#3C3C43] dark:text-[#EBEBF5]'}`}>
                  {contactsList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainSection('system');
                  setSystemSubTab('audit_logs');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                  mainSection === 'system' && systemSubTab === 'audit_logs'
                    ? 'btn-fluent-primary text-white shadow-md'
                    : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4" />
                  <span>Nhật Ký Hoạt Động</span>
                </div>
                <span className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${mainSection === 'system' && systemSubTab === 'audit_logs' ? 'bg-white/25 text-white' : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#3C3C43] dark:text-[#EBEBF5]'}`}>
                  {auditLogs.length}
                </span>
              </button>
            </div>
          )}

          {/* Group 2: CÀI ĐẶT TÀI KHOẢN */}
          <div className="space-y-1 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <span className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] block px-2.5">
              Cài Đặt Tài Khoản
            </span>

            <button
              type="button"
              onClick={() => {
                setMainSection('personal');
                setPersonalSubTab('profile');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                mainSection === 'personal' && personalSubTab === 'profile'
                  ? 'btn-fluent-primary text-white shadow-md'
                  : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4" />
                <span>Hồ Sơ Tài Khoản</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMainSection('personal');
                setPersonalSubTab('channels');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                mainSection === 'personal' && personalSubTab === 'channels'
                  ? 'btn-fluent-primary text-white shadow-md'
                  : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Share2 className="w-4 h-4" />
                <span>Quản Trị Kênh Kết Nối</span>
              </div>
              <span className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${mainSection === 'personal' && personalSubTab === 'channels' ? 'bg-white/25 text-white' : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#3C3C43] dark:text-[#EBEBF5]'}`}>
                {channels.length}
              </span>
            </button>

            {/* 2.1: Danh Bạ Liên Hệ dành cho thành viên */}
            <button
              type="button"
              onClick={() => {
                setMainSection('personal');
                setPersonalSubTab('contacts');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                mainSection === 'personal' && personalSubTab === 'contacts'
                  ? 'btn-fluent-primary text-white shadow-md'
                  : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookUser className="w-4 h-4" />
                <span>Danh Bạ Liên Hệ</span>
              </div>
              <span className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${mainSection === 'personal' && personalSubTab === 'contacts' ? 'bg-white/25 text-white' : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#3C3C43] dark:text-[#EBEBF5]'}`}>
                {contactsList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMainSection('personal');
                setPersonalSubTab('security');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[14px] text-xs font-semibold transition-all cursor-pointer ${
                mainSection === 'personal' && personalSubTab === 'security'
                  ? 'btn-fluent-primary text-white shadow-md'
                  : 'text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4" />
                <span>Bảo Mật & Mật Khẩu</span>
              </div>
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* ========================================================================= */}
          {/* CÀI ĐẶT TÀI KHOẢN (HỒ SƠ, KÊNH KẾT NỐI, BẢO MẬT) */}
          {/* ========================================================================= */}
          {(mainSection === 'personal' || !isMasterAdmin) && (
            <div className="space-y-6">

          {/* TAB 1: PROFILE DETAILS */}
          {personalSubTab === 'profile' && (
            <div className="glass-panel rounded-[26px] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Thông Tin Hồ Sơ Cá Nhân & Doanh Nghiệp
                  </h3>
                  <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                    Hồ sơ đã hoàn tất các trường danh tính cơ bản bắt buộc. Bạn có thể cập nhật bất cứ lúc nào.
                  </p>
                </div>
                <button
                  onClick={onOpenProfileModal}
                  className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-full cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Chỉnh Sửa Hồ Sơ</span>
                </button>
              </div>

              {/* Profile Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[13px]">
                {/* Basic Identity Details */}
                <div className="neumorphic-card p-5 rounded-[20px] space-y-3">
                  <span className="font-bold text-[11px] text-[#007AFF] dark:text-[#0A84FF] flex items-center gap-1.5 uppercase tracking-wider">
                    <UserCheck className="w-4 h-4" />
                    <span>Danh Tính Cá Nhân (Bắt buộc)</span>
                  </span>

                  <div className="space-y-2.5">
                    <div className="flex justify-between py-1.5 border-b border-black/[0.05] dark:border-white/[0.06]">
                      <span className="text-[#8E8E93] dark:text-[#98989D]">Họ và tên:</span>
                      <strong className="text-[#1C1C1E] dark:text-white">{currentUser.profile.fullName || currentUser.fullName}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-black/[0.05] dark:border-white/[0.06]">
                      <span className="text-[#8E8E93] dark:text-[#98989D]">Số điện thoại:</span>
                      <span className="font-mono text-[#1C1C1E] dark:text-white tabular-nums">{currentUser.profile.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-black/[0.05] dark:border-white/[0.06]">
                      <span className="text-[#8E8E93] dark:text-[#98989D]">Số CCCD / CMND:</span>
                      <span className="font-mono text-[#1C1C1E] dark:text-white tabular-nums">{currentUser.profile.identityNumber || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-black/[0.05] dark:border-white/[0.06]">
                      <span className="text-[#8E8E93] dark:text-[#98989D]">Ngày sinh / Giới tính:</span>
                      <span className="text-[#3C3C43] dark:text-[#EBEBF5]">{currentUser.profile.dateOfBirth || '—'} · {currentUser.profile.gender || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-black/[0.05] dark:border-white/[0.06]">
                      <span className="text-[#8E8E93] dark:text-[#98989D]">Chức danh công tác:</span>
                      <strong className="text-[#1C1C1E] dark:text-white">{currentUser.profile.jobTitle || 'Chuyên viên Nhân sự'}</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#8E8E93] dark:text-[#98989D]">Địa chỉ thường trú:</span>
                      <span className="text-right text-[#3C3C43] dark:text-[#EBEBF5] truncate max-w-[200px]">{currentUser.profile.address || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Corporate Details */}
                <div className="neumorphic-card p-5 rounded-[20px] space-y-3">
                  <span className="font-bold text-[11px] text-[#007AFF] dark:text-[#0A84FF] flex items-center gap-1.5 uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    <span>Thông Tin Doanh Nghiệp (Tùy chọn)</span>
                  </span>

                  <div className="space-y-2.5">
                    <div className="flex justify-between py-1.5 border-b border-black/[0.05] dark:border-white/[0.06]">
                      <span className="text-[#8E8E93] dark:text-[#98989D]">Tên doanh nghiệp:</span>
                      <strong className="text-[#1C1C1E] dark:text-white">{currentUser.profile.companyName || 'SEICO'}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-black/[0.05] dark:border-white/[0.06]">
                      <span className="text-[#8E8E93] dark:text-[#98989D]">Mã số thuế (MST):</span>
                      <span className="font-mono text-[#1C1C1E] dark:text-white tabular-nums">{currentUser.profile.taxCode || '0109887766'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-black/[0.05] dark:border-white/[0.06]">
                      <span className="text-[#8E8E93] dark:text-[#98989D]">Website doanh nghiệp:</span>
                      <a href={currentUser.profile.companyWebsite || 'https://talentflow.vn'} target="_blank" rel="noreferrer" className="text-[#007AFF] dark:text-[#0A84FF] hover:underline font-mono text-[12px]">
                        {currentUser.profile.companyWebsite || 'https://talentflow.vn'}
                      </a>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-black/[0.05] dark:border-white/[0.06]">
                      <span className="text-[#8E8E93] dark:text-[#98989D]">Quy mô nhân sự:</span>
                      <span className="text-[#3C3C43] dark:text-[#EBEBF5]">{currentUser.profile.companySize || '200 - 500 nhân sự'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#8E8E93] dark:text-[#98989D]">Ngành nghề chính:</span>
                      <span className="text-right text-[#3C3C43] dark:text-[#EBEBF5] truncate max-w-[200px]">{currentUser.profile.industry || 'Công nghệ & Giải pháp Nhân sự'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHANNELS MANAGEMENT (EDIT & DELETE 4.2) */}
          {personalSubTab === 'channels' && (
            <div className="glass-panel rounded-[26px] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Quản Trị Các Kênh Kết Nối Đăng Tin Tuyển Dụng
                  </h3>
                  <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                    Thêm kênh mới, chỉnh sửa thông tin kết nối hoặc ngắt kết nối các cổng tuyển dụng (TopCV, VietnamWorks, LinkedIn...).
                  </p>
                </div>

                <button
                  onClick={() => setIsAddChannelModalOpen(true)}
                  className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold rounded-full cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Kết Nối Kênh Mới</span>
                </button>
              </div>

              {/* Channels List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="neumorphic-card p-5 rounded-[20px] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-[11px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center font-bold text-[12px]">
                          {channel.platformType.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-[14px] text-[#1C1C1E] dark:text-white">{channel.name}</p>
                          <span className="text-[11px] text-[#8E8E93] font-mono">{channel.accountId}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#34C759]/12 text-[#248A3D] dark:text-[#30D158] border border-[#34C759]/20">
                          {channel.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#8E8E93] dark:text-[#98989D] space-y-1 font-mono">
                      <p className="truncate">URL: {channel.webUrl}</p>
                      <p>Mật khẩu: {channel.passwordMasked}</p>
                      <p>Lần xuất bản gần nhất: {channel.lastPublishedAt}</p>
                    </div>

                    <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] tabular-nums">
                        Đã đăng: {channel.totalJobsPosted} tin tuyển dụng
                      </span>

                      {/* 4.2: Sửa và Xóa Kênh */}
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleOpenEditChannel(channel)}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <span className="text-[#8E8E93]/40">|</span>
                        <button
                          onClick={() => setChannelToDelete(channel)}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#FF3B30] dark:text-[#FF453A] hover:underline cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {personalSubTab === 'security' && (
            <div className="glass-panel rounded-[26px] p-6 space-y-6">
              <div>
                <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                  Bảo Mật Tài Khoản & Mật Khẩu
                </h3>
                <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                  Quản lý mật khẩu đăng nhập và thông tin xác thực an toàn.
                </p>
              </div>

              <div className="max-w-md space-y-4 text-[13px]">
                <div>
                  <label className="block text-[12px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1.5">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    defaultValue="password123"
                    className="w-full px-3.5 py-2.5 neumorphic-inset rounded-[12px] font-mono text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1.5">Mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 8 ký tự"
                    className="w-full px-3.5 py-2.5 neumorphic-inset rounded-[12px] font-mono text-[#1C1C1E] dark:text-white focus:outline-none placeholder:text-[#8E8E93]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => triggerNotice('Đã cập nhật mật khẩu mới thành công!')}
                  className="btn-fluent-primary px-5 py-2.5 text-[12px] font-semibold rounded-full cursor-pointer"
                >
                  Lưu Mật Khẩu Mới
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACTS (DÀNH CHO THÀNH VIÊN) */}
          {personalSubTab === 'contacts' && renderGoogleContactsPanel()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUẢN TRỊ HỆ THỐNG (DÀNH CHO QUẢN TRỊ HỆ THỐNG) */}
      {/* ========================================================================= */}
      {isMasterAdmin && mainSection === 'system' && (
        <div className="space-y-6">

          {/* TAB 1: RBAC USERS MANAGEMENT & EDIT USER (3.2) */}
          {systemSubTab === 'rbac_users' && (
            <div className="glass-panel rounded-[26px] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Phân Quyền & Quản Lý Tài Khoản Thành Viên
                  </h3>
                  <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                    Quản lý tài khoản, thay đổi quyền hạn, sửa thông tin nhân sự và khóa/mở khóa truy cập.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold rounded-full cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Tài Khoản Nhân Sự</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên thành viên, email..."
                    className="w-full pl-9 pr-3.5 py-2.5 neumorphic-inset rounded-[12px] text-[13px] text-[#1C1C1E] dark:text-white focus:outline-none placeholder:text-[#8E8E93]"
                  />
                </div>

                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="px-3.5 py-2.5 neumorphic-inset rounded-[12px] text-[13px] text-[#1C1C1E] dark:text-white font-medium cursor-pointer focus:outline-none"
                >
                  <option value="all">Tất cả vai trò</option>
                  {customRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto border border-black/[0.06] dark:border-white/[0.08] rounded-[18px]">
                <table className="w-full text-left text-[13px] min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] dark:border-white/[0.08] bg-[#767680]/6 dark:bg-white/[0.04] text-[#8E8E93] dark:text-[#98989D] text-[11px] uppercase tracking-wider whitespace-nowrap">
                      <th className="py-3 px-4 font-semibold">Thành Viên</th>
                      <th className="py-3 px-4 font-semibold">Chức Danh</th>
                      <th className="py-3 px-4 font-semibold">Vai Trò Hiện Tại</th>
                      <th className="py-3 px-4 font-semibold">Trạng Thái</th>
                      <th className="py-3 px-4 font-semibold">Đăng Nhập Gần Nhất</th>
                      <th className="py-3 px-4 font-semibold text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#007AFF]/[0.03] dark:hover:bg-white/[0.04] transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center font-bold text-[12px] shrink-0">
                              {user.fullName.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold text-[#1C1C1E] dark:text-white">{user.fullName}</p>
                              <p className="text-[11px] text-[#8E8E93] font-mono">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#3C3C43] dark:text-[#EBEBF5] whitespace-nowrap">
                          {user.profile?.jobTitle || 'Chuyên viên Nhân sự'}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            disabled={user.id === currentUser.id}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            className="px-2.5 py-1.5 rounded-[10px] neumorphic-inset text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer focus:outline-none"
                          >
                            {customRoles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                              user.status === 'Active'
                                ? 'bg-[#34C759]/12 text-[#248A3D] dark:text-[#30D158]'
                                : 'bg-[#FF3B30]/12 text-[#FF3B30] dark:text-[#FF453A]'
                            }`}
                          >
                            {user.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[#8E8E93] dark:text-[#98989D] font-mono text-[11px] tabular-nums whitespace-nowrap">
                          {user.lastLoginAt || 'Chưa có'}
                        </td>

                        <td className="py-3 px-4 text-right space-x-2.5 whitespace-nowrap">
                          {/* 3.2: Nút Sửa Thông Tin Tài Khoản */}
                          <button
                            onClick={() => handleOpenEditUser(user)}
                            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer whitespace-nowrap"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>

                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => handleToggleLockUser(user.id)}
                              className={`inline-flex items-center gap-1 text-[12px] font-semibold cursor-pointer whitespace-nowrap hover:underline ${
                                user.status === 'Active'
                                  ? 'text-[#FF3B30] dark:text-[#FF453A]'
                                  : 'text-[#248A3D] dark:text-[#30D158]'
                              }`}
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>{user.status === 'Active' ? 'Khóa' : 'Mở'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ROLE PERMISSION MATRIX & ADD ROLE (3.3 & 3.4) */}
          {systemSubTab === 'role_permissions' && (
            <div className="glass-panel rounded-[26px] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Ma Trận Phân Quyền Theo Nhóm / Loại Tài Khoản
                  </h3>
                  <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                    Tùy biến quyền hạn cho từng loại tài khoản ({availableFeatures.length} tính năng chi tiết) hoặc tạo thêm loại tài khoản mới.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* 3.3: Thêm Loại Tài Khoản Mới */}
                  <button
                    onClick={() => setIsAddRoleModalOpen(true)}
                    className="btn-fluent-glass inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] rounded-full cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Loại Tài Khoản</span>
                  </button>

                  <button
                    onClick={handleSavePermissions}
                    className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-full cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Ma Trận Quyền Hạn</span>
                  </button>
                </div>
              </div>

              {/* Role Permission Matrix Table */}
              <div className="overflow-x-auto border border-black/[0.06] dark:border-white/[0.08] rounded-[18px]">
                <table className="w-full text-left text-[13px] min-w-[950px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] dark:border-white/[0.08] bg-[#767680]/6 dark:bg-white/[0.04] text-[#8E8E93] dark:text-[#98989D] text-[11px] uppercase tracking-wider whitespace-nowrap">
                      <th className="py-3 px-4 font-semibold min-w-[240px]">Tính Năng Hệ Thống ({availableFeatures.length})</th>
                      <th className="py-3 px-4 font-semibold">Phân Loại</th>
                      {customRoles.map((role) => (
                        <th key={role.id} className="py-3 px-4 font-semibold text-center whitespace-nowrap">
                          <span className="block text-[#1C1C1E] dark:text-white">{role.name}</span>
                          <span className="text-[10px] font-normal text-[#8E8E93] block font-mono normal-case">
                            {role.id === 'master_admin' ? 'Cố định' : 'Tùy biến'}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                    {availableFeatures.map((feat) => {
                      return (
                        <tr key={feat.id} className="hover:bg-[#007AFF]/[0.03] dark:hover:bg-white/[0.04] transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-[#1C1C1E] dark:text-white whitespace-nowrap">{feat.name}</p>
                            <p className="text-[11px] text-[#8E8E93] mt-0.5">{feat.description}</p>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#767680]/10 dark:bg-white/[0.08] text-[#3C3C43] dark:text-[#EBEBF5] whitespace-nowrap">
                              {feat.category}
                            </span>
                          </td>

                          {customRoles.map((role) => {
                            const isMaster = role.id === 'master_admin';
                            const hasPerm = isMaster
                              ? true
                              : localPermissions[role.id]?.includes(feat.id) || false;

                            return (
                              <td key={role.id} className="py-3 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={hasPerm}
                                  disabled={isMaster}
                                  onChange={() => handleTogglePermission(role.id, feat.id)}
                                  className={`rounded accent-[#007AFF] w-4 h-4 ${
                                    isMaster ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                                  }`}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: SƠ ĐỒ TỔ CHỨC (1.3: TẠO/SỬA/ĐIỀU CHỈNH SƠ ĐỒ TỔ CHỨC) */}
          {systemSubTab === 'org_chart' && (
            <div className="glass-panel rounded-[26px] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                      Sơ Đồ Cơ Cấu Tổ Chức & Định Biên Nhân Sự Doanh Nghiệp
                    </h3>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] tabular-nums">
                      {orgNodes.length} Đơn Vị
                    </span>
                  </div>
                  <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                    Mô hình cơ cấu phân cấp trực thuộc, quản trị lãnh đạo phụ trách, định biên nhân sự và chức năng nhiệm vụ.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="ios-segmented flex flex-wrap items-center">
                    <button
                      type="button"
                      onClick={() => setOrgViewMode('tree')}
                      className={`px-3 py-1.5 rounded-[9px] text-[12px] font-semibold cursor-pointer transition-all ${
                        orgViewMode === 'tree' ? 'ios-segmented-active text-[#007AFF] dark:text-[#0A84FF]' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                      }`}
                    >
                      Sơ Đồ Phân Cấp
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrgViewMode('table')}
                      className={`px-3 py-1.5 rounded-[9px] text-[12px] font-semibold cursor-pointer transition-all ${
                        orgViewMode === 'table' ? 'ios-segmented-active text-[#007AFF] dark:text-[#0A84FF]' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                      }`}
                    >
                      Bảng Danh Sách
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrgViewMode('headcount_report')}
                      className={`px-3 py-1.5 rounded-[9px] text-[12px] font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                        orgViewMode === 'headcount_report' ? 'ios-segmented-active text-[#007AFF] dark:text-[#0A84FF]' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Báo Cáo Định Biên</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrgViewMode('recruitment_comparison')}
                      className={`px-3 py-1.5 rounded-[9px] text-[12px] font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                        orgViewMode === 'recruitment_comparison' ? 'ios-segmented-active text-[#007AFF] dark:text-[#0A84FF]' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>So Sánh Tuyển Dụng</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenAddOrg()}
                    className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-full cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Đơn Vị Mới</span>
                  </button>
                </div>
              </div>

              {/* KPI Summary Chips */}
              {(() => {
                const totalQuota = orgNodes.reduce((sum, n) => sum + (n.headcountQuota ?? n.headCount ?? 0), 0);
                const totalCurrent = orgNodes.reduce((sum, n) => sum + (n.currentHeadcount ?? Math.round((n.headcountQuota ?? n.headCount) * 0.85)), 0);
                const totalGap = Math.max(0, totalQuota - totalCurrent);
                const totalOpen = orgNodes.reduce((sum, n) => sum + (n.openPositions ?? 0), 0);
                const fillPct = Math.round((totalCurrent / (totalQuota || 1)) * 100);

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="neumorphic-card p-4 rounded-[20px]">
                      <div className="flex items-center justify-between text-[#8E8E93] dark:text-[#98989D]">
                        <span className="text-[11px] font-medium">Tổng Chỉ Tiêu Định Biên</span>
                        <Users className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
                      </div>
                      <div className="text-[22px] font-bold tabular-nums text-[#1C1C1E] dark:text-white mt-1">
                        {totalQuota} <span className="text-[12px] font-normal text-[#8E8E93]">nhân sự</span>
                      </div>
                      <span className="text-[11px] text-[#8E8E93] block mt-0.5 tabular-nums">{orgNodes.length} phòng ban/đơn vị</span>
                    </div>

                    <div className="neumorphic-card p-4 rounded-[20px]">
                      <div className="flex items-center justify-between text-[#8E8E93] dark:text-[#98989D]">
                        <span className="text-[11px] font-medium">Nhân Sự Thực Tế Có Mặt</span>
                        <UserCheck className="w-4 h-4 text-[#34C759]" />
                      </div>
                      <div className="text-[22px] font-bold tabular-nums text-[#248A3D] dark:text-[#30D158] mt-1">
                        {totalCurrent} <span className="text-[12px] font-normal text-[#8E8E93]">nhân sự</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#248A3D] dark:text-[#30D158] block mt-0.5 tabular-nums">Lấp đầy {fillPct}% định biên</span>
                    </div>

                    <div className="neumorphic-card p-4 rounded-[20px]">
                      <div className="flex items-center justify-between text-[#8E8E93] dark:text-[#98989D]">
                        <span className="text-[11px] font-medium">Nhân Sự Còn Thiếu (Gap)</span>
                        <AlertCircle className="w-4 h-4 text-[#FF9500]" />
                      </div>
                      <div className="text-[22px] font-bold tabular-nums text-[#C93400] dark:text-[#FF9F0A] mt-1">
                        {totalGap} <span className="text-[12px] font-normal text-[#8E8E93]">chỉ tiêu</span>
                      </div>
                      <span className="text-[11px] text-[#C93400] dark:text-[#FF9F0A] block mt-0.5">Cần bổ sung theo kế hoạch</span>
                    </div>

                    <div className="neumorphic-card p-4 rounded-[20px]">
                      <div className="flex items-center justify-between text-[#8E8E93] dark:text-[#98989D]">
                        <span className="text-[11px] font-medium">Vị Trí Đang Mở Tuyển</span>
                        <Briefcase className="w-4 h-4 text-[#5856D6] dark:text-[#5E5CE6]" />
                      </div>
                      <div className="text-[22px] font-bold tabular-nums text-[#5856D6] dark:text-[#5E5CE6] mt-1">
                        {totalOpen} <span className="text-[12px] font-normal text-[#8E8E93]">vị trí</span>
                      </div>
                      <span className="text-[11px] text-[#007AFF] dark:text-[#0A84FF] block mt-0.5 tabular-nums">Đối chiếu với {jobs.length} tin JD</span>
                    </div>
                  </div>
                );
              })()}

              {/* 1.1: SƠ ĐỒ PHÂN CẤP (TREE VIEW) */}
              {orgViewMode === 'tree' && (
                <div className="space-y-6 pt-2">
                  {/* LEVEL 1: ROOT (BOD) */}
                  {orgNodes
                    .filter((n) => n.parentId === null || n.level === 1)
                    .map((rootNode) => {
                      const quota = rootNode.headcountQuota ?? rootNode.headCount ?? 5;
                      const current = rootNode.currentHeadcount ?? Math.round(quota * 0.9);
                      const pct = Math.round((current / (quota || 1)) * 100);

                      return (
                        <div key={rootNode.id} className="space-y-6">
                          {/* Root Card */}
                          <div className="max-w-xl mx-auto p-5 rounded-[24px] bg-gradient-to-br from-[#007AFF]/12 via-white/95 to-[#5856D6]/12 dark:from-[#0A84FF]/18 dark:via-[#1C1C1E] dark:to-[#5E5CE6]/18 border border-[#007AFF]/35 shadow-md relative text-center">
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#007AFF] dark:bg-[#0A84FF] text-white shadow-xs">
                              Cấp 1 · Ban Lãnh Đạo Cao Nhất (Root)
                            </span>
                            <div className="flex items-center justify-center gap-3.5 mt-1">
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center font-bold text-[14px] shadow-sm shrink-0">
                                {rootNode.leaderName.slice(0, 2)}
                              </div>
                              <div className="text-left">
                                <h4 className="font-bold text-[15px] text-[#1C1C1E] dark:text-white">{rootNode.name}</h4>
                                <p className="text-[12px] text-[#007AFF] dark:text-[#0A84FF] font-medium">{rootNode.leaderTitle}: <strong>{rootNode.leaderName}</strong></p>
                              </div>
                              <div className="ml-auto text-right">
                                <span className="font-mono text-[12px] font-bold px-3 py-1 rounded-full bg-[#767680]/12 dark:bg-white/[0.08] text-[#1C1C1E] dark:text-white tabular-nums block">
                                  {current} / {quota} NS
                                </span>
                                <span className="text-[10px] text-[#248A3D] dark:text-[#30D158] font-bold block mt-1 tabular-nums">{pct}% Định biên</span>
                              </div>
                            </div>
                            {rootNode.description && (
                              <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-2.5">{rootNode.description}</p>
                            )}
                            <div className="flex items-center justify-center gap-3 mt-3.5 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] text-[12px] font-semibold">
                              <button
                                type="button"
                                onClick={() => handleOpenAddOrg(rootNode)}
                                className="text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" /> Thêm Khối Trực Thuộc
                              </button>
                              <span className="text-[#8E8E93]/40">·</span>
                              <button
                                type="button"
                                onClick={() => handleOpenEditOrg(rootNode)}
                                className="text-[#3C3C43] dark:text-[#EBEBF5] hover:text-[#007AFF] cursor-pointer flex items-center gap-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Sửa & Định Biên
                              </button>
                            </div>
                          </div>

                          {/* Connector Down Arrow */}
                          <div className="flex justify-center">
                            <div className="w-0.5 h-6 bg-[#007AFF]/35 rounded-full" />
                          </div>

                          {/* LEVEL 2: DIVISIONS */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {orgNodes
                              .filter((n) => n.parentId === rootNode.id)
                              .map((divNode) => {
                                const subTeams = orgNodes.filter((t) => t.parentId === divNode.id);
                                const divQuota = divNode.headcountQuota ?? divNode.headCount ?? 10;
                                const divCurrent = divNode.currentHeadcount ?? Math.round(divQuota * 0.85);
                                const divGap = Math.max(0, divQuota - divCurrent);
                                const divPct = Math.round((divCurrent / (divQuota || 1)) * 100);

                                return (
                                  <div
                                    key={divNode.id}
                                    className="neumorphic-card p-4 rounded-[20px] space-y-3.5 flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-2.5">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF]">
                                          {divNode.code}
                                        </span>
                                        <div className="text-right">
                                          <span className="text-[12px] font-mono font-bold text-[#1C1C1E] dark:text-white tabular-nums block">
                                            {divCurrent}/{divQuota} NS ({divPct}%)
                                          </span>
                                          {divGap > 0 && (
                                            <span className="text-[10px] text-[#C93400] dark:text-[#FF9F0A] font-semibold block">
                                              Thiếu {divGap} NS
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <h5 className="font-bold text-[14px] text-[#1C1C1E] dark:text-white mt-2.5">
                                        {divNode.name}
                                      </h5>
                                      <p className="text-[12px] text-[#3C3C43] dark:text-[#EBEBF5] mt-0.5">
                                        {divNode.leaderTitle}: <strong className="text-[#007AFF] dark:text-[#0A84FF]">{divNode.leaderName}</strong>
                                      </p>
                                      {divNode.description && (
                                        <p className="text-[11px] text-[#8E8E93] dark:text-[#98989D] line-clamp-2 mt-1">
                                          {divNode.description}
                                        </p>
                                      )}

                                      {/* Sub-teams / Level 3 children */}
                                      {subTeams.length > 0 && (
                                        <div className="mt-3 pt-2.5 border-t border-dashed border-black/[0.08] dark:border-white/[0.1] space-y-2">
                                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
                                            Đội ngũ trực thuộc ({subTeams.length})
                                          </span>
                                          {subTeams.map((team) => {
                                            const teamQuota = team.headcountQuota ?? team.headCount ?? 6;
                                            const teamCurrent = team.currentHeadcount ?? Math.round(teamQuota * 0.85);

                                            return (
                                              <div
                                                key={team.id}
                                                className="p-2.5 rounded-[14px] bg-[#767680]/6 dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[12px]"
                                              >
                                                <div>
                                                  <span className="font-semibold text-[#1C1C1E] dark:text-white block text-[12px]">
                                                    {team.name}
                                                  </span>
                                                  <span className="text-[11px] text-[#8E8E93]">
                                                    {team.leaderTitle}: {team.leaderName} ·{' '}
                                                    <strong className="text-[#248A3D] dark:text-[#30D158] font-mono tabular-nums">
                                                      {teamCurrent}/{teamQuota} NS
                                                    </strong>
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-0.5 shrink-0">
                                                  <button
                                                    type="button"
                                                    onClick={() => handleOpenEditOrg(team)}
                                                    className="p-1.5 rounded-full text-[#8E8E93] hover:text-[#007AFF] hover:bg-[#007AFF]/10 cursor-pointer transition-colors"
                                                    title="Sửa & Định Biên"
                                                  >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleOpenAdjustParent(team)}
                                                    className="p-1.5 rounded-full text-[#8E8E93] hover:text-[#5856D6] hover:bg-[#5856D6]/10 cursor-pointer transition-colors"
                                                    title="Chuyển cấp trên"
                                                  >
                                                    <Move className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleDeleteOrgNode(team.id)}
                                                    className="p-1.5 rounded-full text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 cursor-pointer transition-colors"
                                                    title="Xóa"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-semibold">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAddOrg(divNode)}
                                        className="text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer flex items-center gap-1"
                                      >
                                        <Plus className="w-3.5 h-3.5" /> Thêm Team
                                      </button>
                                      <div className="flex items-center gap-2.5">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditOrg(divNode)}
                                          className="text-[#8E8E93] hover:text-[#007AFF] cursor-pointer"
                                        >
                                          Sửa & Định Biên
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenAdjustParent(divNode)}
                                          className="text-[#8E8E93] hover:text-[#5856D6] cursor-pointer"
                                        >
                                          Chuyển Cấp
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteOrgNode(divNode.id)}
                                          className="text-[#FF3B30] dark:text-[#FF453A] hover:underline cursor-pointer"
                                        >
                                          Xóa
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* 1.1: BẢNG DANH SÁCH (TABLE VIEW MODE) */}
              {orgViewMode === 'table' && (
                <div className="overflow-x-auto rounded-[18px] border border-black/[0.06] dark:border-white/[0.08]">
                  <table className="w-full text-left text-[13px] min-w-[1050px]">
                    <thead className="bg-[#767680]/6 dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.08] text-[#8E8E93] dark:text-[#98989D] text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap">
                      <tr>
                        <th className="py-3 px-4">Cấp</th>
                        <th className="py-3 px-4">Mã Đơn Vị</th>
                        <th className="py-3 px-4">Tên Đơn Vị / Phòng Ban</th>
                        <th className="py-3 px-4">Đơn Vị Cấp Trên</th>
                        <th className="py-3 px-4">Người Đứng Đầu & Chức Danh</th>
                        <th className="py-3 px-4 text-center">Định Biên (Quota)</th>
                        <th className="py-3 px-4 text-center">Thực Tế</th>
                        <th className="py-3 px-4 text-center">Còn Thiếu</th>
                        <th className="py-3 px-4 text-center">Tỷ Lệ %</th>
                        <th className="py-3 px-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                      {orgNodes.map((node) => {
                        const parent = orgNodes.find((p) => p.id === node.parentId);
                        const quota = node.headcountQuota ?? node.headCount ?? 1;
                        const current = node.currentHeadcount ?? Math.round(quota * 0.85);
                        const gap = Math.max(0, quota - current);
                        const fillRate = Math.round((current / (quota || 1)) * 100);

                        return (
                          <tr key={node.id} className="hover:bg-[#007AFF]/[0.03] dark:hover:bg-white/[0.04] transition-colors">
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                                node.level === 1 ? 'bg-[#FF9500]/12 text-[#C93400] dark:text-[#FF9F0A]' : node.level === 2 ? 'bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF]' : 'bg-[#34C759]/12 text-[#248A3D] dark:text-[#30D158]'
                              }`}>
                                Cấp {node.level}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-[#007AFF] dark:text-[#0A84FF] whitespace-nowrap">{node.code}</td>
                            <td className="py-3 px-4 font-semibold text-[#1C1C1E] dark:text-white whitespace-nowrap">{node.name}</td>
                            <td className="py-3 px-4 text-[#8E8E93] dark:text-[#98989D] whitespace-nowrap">{parent ? parent.name : '— Ban Tổng Giám Đốc (Gốc) —'}</td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-semibold text-[#1C1C1E] dark:text-white">{node.leaderName}</div>
                              <span className="text-[11px] text-[#8E8E93]">{node.leaderTitle}</span>
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-[#1C1C1E] dark:text-white tabular-nums whitespace-nowrap">
                              {quota} NS
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-[#248A3D] dark:text-[#30D158] tabular-nums whitespace-nowrap">
                              {current} NS
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-[#C93400] dark:text-[#FF9F0A] tabular-nums whitespace-nowrap">
                              {gap}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                                fillRate >= 100 ? 'bg-[#34C759]/12 text-[#248A3D] dark:text-[#30D158]' : fillRate >= 80 ? 'bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF]' : 'bg-[#FF3B30]/12 text-[#FF3B30] dark:text-[#FF453A]'
                              }`}>
                                {fillRate}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2 font-semibold text-[12px] whitespace-nowrap shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditOrg(node)}
                                  className="text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer whitespace-nowrap"
                                >
                                  Sửa & Định Biên
                                </button>
                                <span className="text-[#8E8E93]/40">|</span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAdjustParent(node)}
                                  className="text-[#5856D6] dark:text-[#5E5CE6] hover:underline cursor-pointer whitespace-nowrap"
                                >
                                  Chuyển Cấp
                                </button>
                                <span className="text-[#8E8E93]/40">|</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrgNode(node.id)}
                                  className="text-[#FF3B30] dark:text-[#FF453A] hover:underline cursor-pointer whitespace-nowrap"
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 1.1: MỤC BÁO CÁO ĐỊNH BIÊN NHÂN SỰ (HEADCOUNT REPORT) */}
              {orgViewMode === 'headcount_report' && (
                <div className="space-y-6 pt-2">
                  {/* Header & Export Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[20px] bg-[#34C759]/10 dark:bg-[#30D158]/10 border border-[#34C759]/20">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#1C1C1E] dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#248A3D] dark:text-[#30D158]" />
                        <span>Báo Cáo Định Biên Nhân Sự Theo Phòng / Ban (Headcount Quota Report)</span>
                      </h4>
                      <p className="text-[12px] text-[#3C3C43] dark:text-[#EBEBF5] mt-0.5">
                        Theo dõi chỉ tiêu định biên được duyệt, nhân sự thực tế, khoảng trống tuyển dụng (Gap) và tỷ lệ lấp đầy.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportHeadcountReportCsv}
                      className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-full cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Xuất Báo Cáo Định Biên (.CSV)</span>
                    </button>
                  </div>

                  {/* Progress Matrix Overview Cards */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-semibold text-[#8E8E93] dark:text-[#98989D] block uppercase tracking-wider">
                      Tiến Độ Lấp Đầy Định Biên Theo Đơn Vị Trực Thuộc
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {orgNodes.map((node) => {
                        const quota = node.headcountQuota ?? node.headCount ?? 1;
                        const current = node.currentHeadcount ?? Math.round(quota * 0.85);
                        const gap = Math.max(0, quota - current);
                        const fillRate = Math.round((current / (quota || 1)) * 100);

                        return (
                          <div
                            key={node.id}
                            className="neumorphic-card p-4 rounded-[20px] space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF]">
                                  {node.code}
                                </span>
                                <h5 className="font-bold text-[13px] text-[#1C1C1E] dark:text-white">
                                  {node.name}
                                </h5>
                              </div>
                              <span className={`text-[11px] font-bold tabular-nums px-2.5 py-0.5 rounded-full ${
                                fillRate >= 100
                                  ? 'bg-[#34C759]/12 text-[#248A3D] dark:text-[#30D158]'
                                  : fillRate >= 80
                                  ? 'bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF]'
                                  : 'bg-[#FF3B30]/12 text-[#FF3B30] dark:text-[#FF453A]'
                              }`}>
                                {fillRate}% Định Biên
                              </span>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="w-full bg-[#767680]/15 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  fillRate >= 100 ? 'bg-[#34C759]' : fillRate >= 80 ? 'bg-[#007AFF]' : 'bg-[#FF3B30]'
                                }`}
                                style={{ width: `${Math.min(100, fillRate)}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[12px] text-[#8E8E93] dark:text-[#98989D]">
                              <span>
                                Chỉ tiêu: <strong className="text-[#1C1C1E] dark:text-white font-mono tabular-nums">{quota}</strong> | Hiện có: <strong className="text-[#248A3D] dark:text-[#30D158] font-mono tabular-nums">{current}</strong>
                              </span>
                              <span>
                                {gap > 0 ? (
                                  <span className="text-[#C93400] dark:text-[#FF9F0A] font-semibold">Còn thiếu {gap} nhân sự</span>
                                ) : (
                                  <span className="text-[#248A3D] dark:text-[#30D158] font-semibold">Đã đạt định biên</span>
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comprehensive Headcount Table */}
                  <div className="overflow-x-auto border border-black/[0.06] dark:border-white/[0.08] rounded-[18px]">
                    <table className="w-full text-left text-[13px] min-w-[1050px]">
                      <thead className="bg-[#767680]/6 dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.08] text-[#8E8E93] dark:text-[#98989D] text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap">
                        <tr>
                          <th className="py-3 px-4">Mã Đơn Vị</th>
                          <th className="py-3 px-4">Tên Phòng Ban / Khối</th>
                          <th className="py-3 px-4">Người Phụ Trách</th>
                          <th className="py-3 px-4 text-center">Chỉ Tiêu Định Biên</th>
                          <th className="py-3 px-4 text-center">Thực Tế Hiện Có</th>
                          <th className="py-3 px-4 text-center">Chênh Lệch (Gap)</th>
                          <th className="py-3 px-4 text-center">Đang Tuyển</th>
                          <th className="py-3 px-4 text-center">Tỷ Lệ Lấp Đầy</th>
                          <th className="py-3 px-4">Tình Trạng</th>
                          <th className="py-3 px-4 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                        {orgNodes.map((node) => {
                          const quota = node.headcountQuota ?? node.headCount ?? 1;
                          const current = node.currentHeadcount ?? Math.round(quota * 0.85);
                          const gap = Math.max(0, quota - current);
                          const open = node.openPositions ?? gap;
                          const fillRate = Math.round((current / (quota || 1)) * 100);

                          return (
                            <tr key={node.id} className="hover:bg-[#007AFF]/[0.03] dark:hover:bg-white/[0.04] transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-[#007AFF] dark:text-[#0A84FF] whitespace-nowrap">{node.code}</td>
                              <td className="py-3 px-4 font-semibold text-[#1C1C1E] dark:text-white whitespace-nowrap">
                                {node.name}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="font-medium text-[#1C1C1E] dark:text-white">{node.leaderName}</span>
                                <span className="text-[11px] text-[#8E8E93] block">{node.leaderTitle}</span>
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-[#1C1C1E] dark:text-white tabular-nums whitespace-nowrap">
                                {quota} NS
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-[#248A3D] dark:text-[#30D158] tabular-nums whitespace-nowrap">
                                {current} NS
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-[#C93400] dark:text-[#FF9F0A] tabular-nums whitespace-nowrap">
                                {gap > 0 ? `-${gap}` : '0'}
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-[#007AFF] dark:text-[#0A84FF] tabular-nums whitespace-nowrap">
                                {open}
                              </td>
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                                  fillRate >= 100 ? 'bg-[#34C759]/12 text-[#248A3D] dark:text-[#30D158]' : fillRate >= 80 ? 'bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF]' : 'bg-[#FF3B30]/12 text-[#FF3B30] dark:text-[#FF453A]'
                                }`}>
                                  {fillRate}%
                                </span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                {fillRate >= 100 ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#248A3D] dark:text-[#30D158] bg-[#34C759]/12 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                    <CheckCircle2 className="w-3 h-3" /> Đủ Định Biên
                                  </span>
                                ) : fillRate >= 80 ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/12 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                    <Clock className="w-3 h-3" /> Thiếu Nhẹ
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF3B30] dark:text-[#FF453A] bg-[#FF3B30]/12 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                    <AlertTriangle className="w-3 h-3" /> Thiếu Nhiều
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditOrg(node)}
                                  className="text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer whitespace-nowrap"
                                >
                                  Điều Chỉnh
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 1.1: BÁO CÁO SO SÁNH VỚI TUYỂN DỤNG (RECRUITMENT COMPARISON REPORT) */}
              {orgViewMode === 'recruitment_comparison' && (
                <div className="space-y-6 pt-2">
                  {/* Header & Export Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[20px] bg-[#007AFF]/10 dark:bg-[#0A84FF]/12 border border-[#007AFF]/20">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#1C1C1E] dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
                        <span>Báo Cáo Đối Chiếu Định Biên Nhân Sự Với Tuyển Dụng Thực Tế</span>
                      </h4>
                      <p className="text-[12px] text-[#3C3C43] dark:text-[#EBEBF5] mt-0.5">
                        So sánh số lượng nhân sự cần bổ sung theo định biên với số tin JD đang mở tuyển và ứng viên đang trong phễu.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportRecruitmentComparisonCsv}
                      className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-full cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Xuất Báo Cáo Đối Chiếu (.CSV)</span>
                    </button>
                  </div>

                  {/* Recruitment Comparison Matrix Table */}
                  <div className="overflow-x-auto border border-black/[0.06] dark:border-white/[0.08] rounded-[18px]">
                    <table className="w-full text-left text-[13px] min-w-[1150px]">
                      <thead className="bg-[#767680]/6 dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.08] text-[#8E8E93] dark:text-[#98989D] text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap">
                        <tr>
                          <th className="py-3 px-4">Phòng Ban / Khối</th>
                          <th className="py-3 px-4 text-center">Định Biên & Thực Tế</th>
                          <th className="py-3 px-4 text-center">Nhu Cầu Cần Tuyển (Gap)</th>
                          <th className="py-3 px-4">Tin JD Đang Tuyển Dụng</th>
                          <th className="py-3 px-4 text-center">Phễu Ứng Viên</th>
                          <th className="py-3 px-4 text-center">Tỷ Lệ Bù Đắp Phễu</th>
                          <th className="py-3 px-4">Đánh Giá & Khuyến Nghị Tuyển Dụng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                        {orgNodes.map((node) => {
                          const quota = node.headcountQuota ?? node.headCount ?? 1;
                          const current = node.currentHeadcount ?? Math.round(quota * 0.85);
                          const gap = Math.max(0, quota - current);

                          // Find jobs related to this department
                          const deptJds = jobs.filter(
                            (j) =>
                              j.department.toLowerCase().includes(node.name.toLowerCase()) ||
                              node.name.toLowerCase().includes(j.department.toLowerCase()) ||
                              j.department.toLowerCase().includes(node.code.toLowerCase())
                          );

                          // Candidates in funnel for this dept
                          const deptCandidates = candidates.filter((c) =>
                            deptJds.some((j) => j.id === c.jobId)
                          );

                          const interviewCount = deptCandidates.filter(
                            (c) => c.stage === 'Phỏng vấn' || c.stage === 'Đã thẩm định'
                          ).length;

                          const offerCount = deptCandidates.filter((c) => c.stage === 'Đề nghị việc').length;
                          const pipelineCoverage = gap > 0 ? Math.round((deptCandidates.length / gap) * 100) : 100;

                          return (
                            <tr key={node.id} className="hover:bg-[#007AFF]/[0.03] dark:hover:bg-white/[0.04] transition-colors">
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF] whitespace-nowrap">
                                    {node.code}
                                  </span>
                                  <div>
                                    <h5 className="font-semibold text-[13px] text-[#1C1C1E] dark:text-white whitespace-nowrap">
                                      {node.name}
                                    </h5>
                                    <span className="text-[11px] text-[#8E8E93] whitespace-nowrap block">
                                      {node.leaderTitle}: {node.leaderName}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <span className="font-mono text-[12px] font-bold text-[#1C1C1E] dark:text-white tabular-nums block whitespace-nowrap">
                                  {current} / {quota} NS
                                </span>
                                <span className="text-[11px] text-[#8E8E93] tabular-nums whitespace-nowrap">
                                  Đạt {Math.round((current / (quota || 1)) * 100)}%
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono font-bold text-[#C93400] dark:text-[#FF9F0A] text-[13px] tabular-nums whitespace-nowrap">
                                {gap > 0 ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#FF9500]/12 border border-[#FF9500]/25 whitespace-nowrap">
                                    {gap} Chỉ Tiêu
                                  </span>
                                ) : (
                                  <span className="text-[#248A3D] dark:text-[#30D158] text-[12px] font-semibold whitespace-nowrap">
                                    Đã đủ (0)
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {deptJds.length > 0 ? (
                                  <div className="space-y-1">
                                    <span className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] block whitespace-nowrap">
                                      {deptJds.length} Vị trí JD đang mở
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {deptJds.slice(0, 2).map((j) => (
                                        <span
                                          key={j.id}
                                          className="text-[10px] font-mono px-2 py-0.5 bg-[#767680]/10 dark:bg-white/[0.08] rounded-full text-[#3C3C43] dark:text-[#EBEBF5] truncate max-w-[160px] whitespace-nowrap"
                                        >
                                          {j.title}
                                        </span>
                                      ))}
                                      {deptJds.length > 2 && (
                                        <span className="text-[10px] text-[#8E8E93] whitespace-nowrap">
                                          +{deptJds.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : gap > 0 ? (
                                  <span className="text-[11px] font-semibold text-[#FF3B30] dark:text-[#FF453A] bg-[#FF3B30]/12 px-2.5 py-0.5 rounded-full border border-[#FF3B30]/20 inline-block whitespace-nowrap">
                                    ⚠️ Chưa mở tin tuyển dụng
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-[#8E8E93] whitespace-nowrap">Không có JD mở</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <div className="space-y-0.5 whitespace-nowrap">
                                  <span className="font-mono font-bold text-[12px] text-[#1C1C1E] dark:text-white tabular-nums block whitespace-nowrap">
                                    {deptCandidates.length} Hồ sơ
                                  </span>
                                  <span className="text-[11px] text-[#8E8E93] block whitespace-nowrap">
                                    {interviewCount} Phỏng vấn · {offerCount} Offer
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums whitespace-nowrap ${
                                  pipelineCoverage >= 100
                                    ? 'bg-[#34C759]/12 text-[#248A3D] dark:text-[#30D158]'
                                    : pipelineCoverage >= 50
                                    ? 'bg-[#FF9500]/12 text-[#C93400] dark:text-[#FF9F0A]'
                                    : 'bg-[#FF3B30]/12 text-[#FF3B30] dark:text-[#FF453A]'
                                }`}>
                                  {pipelineCoverage}%
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                {gap > 0 && deptJds.length === 0 ? (
                                  <span className="text-[12px] text-[#FF3B30] dark:text-[#FF453A] font-semibold block">
                                    🚨 Cảnh báo: Thiếu {gap} NS nhưng chưa có JD. Cần tạo JD ngay!
                                  </span>
                                ) : gap > 0 && deptCandidates.length < gap ? (
                                  <span className="text-[12px] text-[#C93400] dark:text-[#FF9F0A] font-semibold block">
                                    ⚡ Nguồn ứng viên mỏng: Cần đẩy mạnh đăng tuyển đa kênh.
                                  </span>
                                ) : gap > 0 ? (
                                  <span className="text-[12px] text-[#248A3D] dark:text-[#30D158] font-semibold block">
                                    ✅ Tiến độ tốt: Phễu ứng viên dồi dào, đủ bù đắp chỉ tiêu.
                                  </span>
                                ) : (
                                  <span className="text-[12px] text-[#8E8E93] font-medium block">
                                    ✨ Định biên đã ổn định và đạt chuẩn 100%.
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CENTRAL CV REPOSITORY & BATCH DOWNLOAD (3.5) */}
          {systemSubTab === 'central_cvs' && (
            <div className="glass-panel rounded-[26px] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Kho Dữ Liệu CV Chung Toàn Hệ Thống ({candidates.length} Hồ Sơ)
                  </h3>
                  <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                    Hồ sơ ứng viên nạp từ tất cả các tài khoản. Bạn có thể chọn từng CV hoặc tải xuống hàng loạt (.CSV / .ZIP).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* 3.5: Nút tải nhiều CV cùng lúc */}
                  <button
                    onClick={handleBatchDownloadSelected}
                    disabled={selectedCvIds.length === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold text-white bg-[#34C759] hover:bg-[#2DB84E] rounded-full transition-colors cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải {selectedCvIds.length} CV Đã Chọn (.CSV / .ZIP)</span>
                  </button>

                  <button
                    onClick={handleDownloadAllCVs}
                    className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold rounded-full cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Toàn Bộ Kho CV (.CSV)</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cvSearchQuery}
                    onChange={(e) => setCvSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên ứng viên, mã CAND, tài khoản upload..."
                    className="w-full pl-9 pr-3.5 py-2.5 neumorphic-inset rounded-[12px] text-[13px] text-[#1C1C1E] dark:text-white focus:outline-none placeholder:text-[#8E8E93]"
                  />
                </div>

                <div>
                  <select
                    value={cvSourceFilter}
                    onChange={(e) => setCvSourceFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 neumorphic-inset rounded-[12px] text-[13px] text-[#1C1C1E] dark:text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="all">Tất cả nguồn ứng tuyển</option>
                    <option value="Email Tự Động Quét">Email Tự Động Quét</option>
                    <option value="Tải File Trực Tiếp">Tải File Trực Tiếp</option>
                    <option value="TopCV Kênh Kết Nối">TopCV Kênh Kết Nối</option>
                    <option value="LinkedIn">LinkedIn Talent</option>
                  </select>
                </div>

                <div>
                  <select
                    value={cvBenchmarkFilter}
                    onChange={(e) => setCvBenchmarkFilter(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 neumorphic-inset rounded-[12px] text-[13px] text-[#1C1C1E] dark:text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value={0}>Tất cả mức điểm benchmark</option>
                    <option value={4.5}>≥ 4.5 ⭐ (Rất nên tuyển)</option>
                    <option value={4.0}>≥ 4.0 ⭐ (Đạt chuẩn phỏng vấn)</option>
                    <option value={3.5}>≥ 3.5 ⭐ (Cân nhắc)</option>
                  </select>
                </div>
              </div>

              {/* Central CVs Table (3.5: Chọn CV, Cột Tài khoản upload CV) */}
              <div className="overflow-x-auto border border-black/[0.06] dark:border-white/[0.08] rounded-[18px]">
                <table className="w-full text-left text-[13px] min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] dark:border-white/[0.08] bg-[#767680]/6 dark:bg-white/[0.04] text-[#8E8E93] dark:text-[#98989D] text-[11px] uppercase tracking-wider whitespace-nowrap">
                      {/* 3.5: Checkbox Select All */}
                      <th className="py-3 px-3 text-center w-10">
                        <input
                          type="checkbox"
                          checked={
                            filteredCentralCvs.length > 0 &&
                            selectedCvIds.length === filteredCentralCvs.length
                          }
                          onChange={handleToggleSelectAllCvs}
                          className="rounded accent-[#007AFF] w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4 font-semibold">Mã CAND</th>
                      <th className="py-3 px-4 font-semibold">Họ và Tên Ứng Viên</th>
                      <th className="py-3 px-4 font-semibold">Vị Trí JD</th>
                      {/* 3.5: Cột Tài Khoản Upload CV */}
                      <th className="py-3 px-4 font-semibold">Tài Khoản Upload</th>
                      <th className="py-3 px-4 font-semibold text-center">Điểm Benchmark</th>
                      <th className="py-3 px-4 font-semibold">Nguồn Nạp</th>
                      <th className="py-3 px-4 font-semibold">Tệp CV</th>
                      <th className="py-3 px-4 font-semibold text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                    {filteredCentralCvs.map((cand) => {
                      const isSelected = selectedCvIds.includes(cand.id);

                      return (
                        <tr
                          key={cand.id}
                          className={`hover:bg-[#007AFF]/[0.03] dark:hover:bg-white/[0.04] transition-colors ${
                            isSelected ? 'bg-[#007AFF]/[0.06] dark:bg-[#0A84FF]/10' : ''
                          }`}
                        >
                          {/* Checkbox Individual */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectCv(cand.id)}
                              className="rounded accent-[#007AFF] w-4 h-4 cursor-pointer"
                            />
                          </td>

                          <td className="py-3 px-4 font-mono font-semibold text-[#007AFF] dark:text-[#0A84FF] tabular-nums whitespace-nowrap">{cand.id}</td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <p className="font-semibold text-[#1C1C1E] dark:text-white">{cand.fullName}</p>
                            <span className="text-[11px] text-[#8E8E93] font-mono">{cand.email}</span>
                          </td>

                          <td className="py-3 px-4 text-[#3C3C43] dark:text-[#EBEBF5] whitespace-nowrap">
                            {cand.jobTitle}
                          </td>

                          {/* 3.5: Tài Khoản Upload CV */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 px-2.5 py-0.5 rounded-full inline-block whitespace-nowrap">
                              {cand.uploadedBy || 'Đặng Đức Tuấn (Quản trị hệ thống)'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 font-bold tabular-nums text-[#C93400] dark:text-[#FF9F0A] bg-[#FF9500]/12 px-2.5 py-0.5 rounded-full border border-[#FF9500]/25 whitespace-nowrap text-[12px]">
                              <Star className="w-3 h-3 fill-current text-[#FF9500]" />
                              <span>{cand.benchmarkScore.toFixed(1)} ⭐</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-[#8E8E93] dark:text-[#98989D] whitespace-nowrap">
                            {cand.source}
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] text-[#8E8E93] whitespace-nowrap">
                            {cand.resumeFileName}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                triggerNotice(`Đang tải tệp hồ sơ gốc của ${cand.fullName}...`);
                              }}
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer whitespace-nowrap"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Tải CV</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2.1: TAB: CONTACTS (DANH BẠ GOOGLE CONTACT CHO QUẢN TRỊ HỆ THỐNG) */}
          {systemSubTab === 'contacts' && renderGoogleContactsPanel()}

          {/* TAB 4: AUDIT LOGS */}
          {systemSubTab === 'audit_logs' && (
            <div className="glass-panel rounded-[26px] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Báo Cáo Chi Tiết Hoạt Động & Nhật Ký Kiểm Toán Hệ Thống
                  </h3>
                  <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                    Ghi nhận thời gian thực toàn bộ thao tác nghiệp vụ, phân quyền, đăng nhập và xuất dữ liệu của các tài khoản.
                  </p>
                </div>

                <button
                  onClick={handleExportAuditLogs}
                  className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold rounded-full cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất Báo Cáo Nhật Ký (CSV)</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    placeholder="Tìm theo người thực hiện, thao tác, đối tượng..."
                    className="w-full pl-9 pr-3.5 py-2.5 neumorphic-inset rounded-[12px] text-[13px] text-[#1C1C1E] dark:text-white focus:outline-none placeholder:text-[#8E8E93]"
                  />
                </div>

                <select
                  value={logActionFilter}
                  onChange={(e) => setLogActionFilter(e.target.value)}
                  className="px-3.5 py-2.5 neumorphic-inset rounded-[12px] text-[13px] text-[#1C1C1E] dark:text-white font-medium cursor-pointer focus:outline-none"
                >
                  <option value="all">Tất cả hành động</option>
                  <option value="Đăng nhập hệ thống">Đăng nhập hệ thống</option>
                  <option value="Phân quyền tài khoản">Phân quyền tài khoản</option>
                  <option value="Cập nhật thông tin tài khoản">Cập nhật thông tin tài khoản</option>
                  <option value="Phê duyệt ứng viên">Phê duyệt ứng viên</option>
                  <option value="Nạp CV ứng viên">Nạp CV ứng viên</option>
                  <option value="Tải hàng loạt CV">Tải hàng loạt CV</option>
                </select>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto border border-black/[0.06] dark:border-white/[0.08] rounded-[18px]">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] dark:border-white/[0.08] bg-[#767680]/6 dark:bg-white/[0.04] text-[#8E8E93] dark:text-[#98989D] text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold">Thời Gian</th>
                      <th className="py-3 px-4 font-semibold">Người Thực Hiện</th>
                      <th className="py-3 px-4 font-semibold">Hành Động</th>
                      <th className="py-3 px-4 font-semibold">Đối Tượng</th>
                      <th className="py-3 px-4 font-semibold">Chi Tiết Nghiệp Vụ</th>
                      <th className="py-3 px-4 font-semibold text-center">Địa Chỉ IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#007AFF]/[0.03] dark:hover:bg-white/[0.04] transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-[#8E8E93] tabular-nums">{log.timestamp}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#1C1C1E] dark:text-white">{log.userName}</p>
                          <span className="text-[11px] text-[#8E8E93] font-mono">{log.userRole}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[12px] text-[#007AFF] dark:text-[#0A84FF]">{log.action}</span>
                        </td>
                        <td className="py-3 px-4 text-[#3C3C43] dark:text-[#EBEBF5] font-medium">{log.target}</td>
                        <td className="py-3 px-4 text-[#8E8E93] dark:text-[#98989D] text-[12px]">{log.details}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-center text-[#8E8E93] tabular-nums">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DEPARTMENTS & POP-UP ID RULES TABLE (3.6 & 3.7) */}
          {systemSubTab === 'departments' && (
            <div className="glass-panel rounded-[26px] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Quản Lý Phòng Ban & Bảng Quy Tắc Định Danh ID
                  </h3>
                  <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                    Chỉnh sửa danh sách phòng ban và thiết lập quy tắc sinh mã tự động (Ứng viên, JD, Đơn vị).
                  </p>
                </div>

                {/* 3.6: Nút Thêm quy tắc dạng pop-up dạng bảng */}
                <button
                  onClick={() => setIsAddRuleModalOpen(true)}
                  className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold rounded-full cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Quy Tắc Định Danh Mới (Pop-up)</span>
                </button>
              </div>

              {/* 3.6: Danh Sách Phòng Ban với Nút Sửa */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[13px] text-[#1C1C1E] dark:text-white block">
                    Danh Sách Phòng Ban Doanh Nghiệp ({departments.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="neumorphic-card p-4 rounded-[20px] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 px-2.5 py-0.5 rounded-full">
                            {dept.code}
                          </span>
                          <span className="text-[11px] text-[#8E8E93] font-mono tabular-nums">{dept.headCount} nhân sự</span>
                        </div>
                        <p className="font-bold text-[14px] text-[#1C1C1E] dark:text-white mt-2.5">{dept.name}</p>
                        <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">Trưởng khối: {dept.managerName}</p>
                      </div>

                      {/* 3.6: Nút sửa phòng ban */}
                      <div className="pt-3 mt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex justify-end">
                        <button
                          onClick={() => handleOpenEditDept(dept)}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Sửa Phòng Ban</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3.6: Bảng Các Quy Tắc Định Danh Dạng Bảng */}
              <div className="space-y-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[13px] text-[#1C1C1E] dark:text-white block">
                      Bảng Quy Tắc Định Danh Mã (ID Rules Table - {customIdRules.length})
                    </span>
                    <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D]">
                      Quy chuẩn tự động sinh mã hồ sơ theo tiền tố, mã thứ cấp, số bắt đầu và đơn vị phòng ban.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-black/[0.06] dark:border-white/[0.08] rounded-[18px]">
                  <table className="w-full text-left text-[13px] min-w-[950px]">
                    <thead>
                      <tr className="border-b border-black/[0.06] dark:border-white/[0.08] bg-[#767680]/6 dark:bg-white/[0.04] text-[#8E8E93] dark:text-[#98989D] text-[11px] uppercase tracking-wider whitespace-nowrap">
                        <th className="py-3 px-4 font-semibold">Tên Quy Ước</th>
                        <th className="py-3 px-4 font-semibold">Mã Tiền Tố</th>
                        <th className="py-3 px-4 font-semibold">Mã Thứ Cấp</th>
                        <th className="py-3 px-4 font-semibold text-center">Số Bắt Đầu</th>
                        <th className="py-3 px-4 font-semibold">Phòng / Ban / Đơn Vị</th>
                        <th className="py-3 px-4 font-semibold">Diễn Giải</th>
                        <th className="py-3 px-4 font-semibold text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                      {customIdRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-[#007AFF]/[0.03] dark:hover:bg-white/[0.04] transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#1C1C1E] dark:text-white whitespace-nowrap">
                            {rule.name}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#007AFF] dark:text-[#0A84FF] whitespace-nowrap">
                            {rule.prefix}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#3C3C43] dark:text-[#EBEBF5] whitespace-nowrap">
                            {rule.secondaryCode || '—'}
                          </td>
                          <td className="py-3 px-4 font-mono text-center font-bold text-[#1C1C1E] dark:text-white tabular-nums whitespace-nowrap">
                            {rule.startNumber}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <p className="font-semibold text-[#1C1C1E] dark:text-white">{rule.departmentName}</p>
                            <span className="text-[11px] text-[#8E8E93] font-mono">Mã: {rule.unitCode}</span>
                          </td>
                          <td className="py-3 px-4 text-[#8E8E93] dark:text-[#98989D] text-[12px] max-w-xs">
                            <span className="line-clamp-2">{rule.explanation}</span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteIdRule(rule.id)}
                              className="text-[#FF3B30] dark:text-[#FF453A] hover:underline text-[12px] font-semibold cursor-pointer whitespace-nowrap"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BENCHMARK MULTI-DIMENSIONAL CUSTOMIZATION (3.8: 5D DEFAULT, 3D-7D, SUM 100%) */}
          {systemSubTab === 'benchmark' && (
            <div className="glass-panel rounded-[26px] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-[17px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Cấu Hình & Tùy Biến Benchmark Đa Chiều (Thang Điểm 5 Sao)
                  </h3>
                  <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                    Lựa chọn số lượng chiều (Mặc định 5D, hỗ trợ 3D-7D), tự đặt tên các chiều và cân đối tổng trọng số tối đa 100%.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCreateNewBenchmarkProfile}
                    className="btn-fluent-glass inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] rounded-full cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Cấu Hình Mới</span>
                  </button>

                  <button
                    onClick={handleSaveBenchmarkProfile}
                    disabled={totalWeight !== 100}
                    className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Cấu Hình Benchmark</span>
                  </button>
                </div>
              </div>

              {/* Profiles Selector Bar */}
              <div className="p-4 rounded-[18px] bg-[#767680]/8 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[12px] font-semibold text-[#1C1C1E] dark:text-white">
                    Hồ Sơ Cấu Hình Mẫu:
                  </span>
                  <select
                    value={activeProfileId}
                    onChange={(e) => handleSelectBenchmarkProfile(e.target.value)}
                    className="px-3.5 py-2 neumorphic-inset rounded-[12px] text-[13px] font-semibold text-[#007AFF] dark:text-[#0A84FF] cursor-pointer focus:outline-none"
                  >
                    {benchmarkProfiles.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.title} ({prof.dimensionCount}D)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dimension Count Selector (Mặc định 5D, 3D - 7D) */}
                <div className="flex items-center gap-2.5">
                  <span className="text-[12px] font-semibold text-[#1C1C1E] dark:text-white">
                    Số Lượng Chiều Đánh Giá:
                  </span>
                  <div className="ios-segmented flex items-center gap-1">
                    {[3, 4, 5, 6, 7].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleDimensionCountChange(num)}
                        className={`px-2.5 py-1 rounded-[9px] font-bold font-mono text-[12px] cursor-pointer transition-all tabular-nums ${
                          dimensionCount === num
                            ? 'ios-segmented-active text-[#007AFF] dark:text-[#0A84FF]'
                            : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                        }`}
                      >
                        {num}D
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3.8: Hiển thị Tổng Phần Trăm Các Chiều & Thanh Cân Đối (Tối Đa 100%) */}
              <div
                className={`p-4 rounded-[18px] border transition-colors ${
                  totalWeight === 100
                    ? 'bg-[#34C759]/10 border-[#34C759]/25'
                    : totalWeight > 100
                    ? 'bg-[#FF3B30]/10 border-[#FF3B30]/25'
                    : 'bg-[#FF9500]/10 border-[#FF9500]/25'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#1C1C1E] dark:text-white">
                      Tổng Tỷ Trọng Các Chiều Đã Phân Bổ:
                    </span>
                    <span
                      className={`text-[13px] font-bold tabular-nums px-2.5 py-0.5 rounded-full text-white ${
                        totalWeight === 100
                          ? 'bg-[#34C759]'
                          : totalWeight > 100
                          ? 'bg-[#FF3B30]'
                          : 'bg-[#FF9500]'
                      }`}
                    >
                      {totalWeight}% / 100%
                    </span>
                  </div>

                  <span className="text-[12px] font-semibold">
                    {totalWeight === 100 ? (
                      <span className="text-[#248A3D] dark:text-[#30D158] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Đạt chuẩn 100% chính xác, sẵn sàng áp dụng
                      </span>
                    ) : totalWeight > 100 ? (
                      <span className="text-[#FF3B30] dark:text-[#FF453A] flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Vượt quá 100% (Dư {totalWeight - 100}%) - Vui lòng giảm bớt!
                      </span>
                    ) : (
                      <span className="text-[#C93400] dark:text-[#FF9F0A] flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Chưa đủ 100% (Còn thiếu {100 - totalWeight}%) - Vui lòng tăng thêm!
                      </span>
                    )}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-[#767680]/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      totalWeight === 100
                        ? 'bg-[#34C759]'
                        : totalWeight > 100
                        ? 'bg-[#FF3B30]'
                        : 'bg-[#FF9500]'
                    }`}
                    style={{ width: `${Math.min(100, totalWeight)}%` }}
                  />
                </div>
              </div>

              {/* Dimensions Editor Form */}
              <div className="space-y-3">
                <span className="font-semibold text-[13px] text-[#1C1C1E] dark:text-white block">
                  Thiết Lập Nội Dung & Trọng Số Từng Chiều ({dimensions.length} Chiều)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {dimensions.map((dim, idx) => (
                    <div
                      key={dim.id}
                      className="neumorphic-card p-4 rounded-[18px] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-full bg-[#007AFF] dark:bg-[#0A84FF] text-white flex items-center justify-center font-bold text-[11px] tabular-nums shrink-0">
                            {idx + 1}
                          </span>
                          {/* 3.8: Nội dung chiều được người dùng tự đặt tên */}
                          <input
                            type="text"
                            value={dim.name}
                            onChange={(e) => handleDimensionFieldChange(idx, 'name', e.target.value)}
                            placeholder={`Tên chiều đánh giá ${idx + 1}`}
                            className="w-full px-3 py-1.5 neumorphic-inset rounded-[10px] text-[13px] font-semibold text-[#1C1C1E] dark:text-white focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={dim.weight}
                            onChange={(e) => handleDimensionFieldChange(idx, 'weight', e.target.value)}
                            className="w-16 px-2 py-1 text-center font-bold tabular-nums text-[13px] neumorphic-inset rounded-[10px] text-[#007AFF] dark:text-[#0A84FF] focus:outline-none"
                          />
                          <span className="text-[12px] font-bold text-[#8E8E93] font-mono">%</span>
                        </div>
                      </div>

                      {/* Slider Control */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dim.weight}
                        onChange={(e) => handleDimensionFieldChange(idx, 'weight', e.target.value)}
                        className="w-full accent-[#007AFF] cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 1.2: Bảng Quản Lý Cấu Hình Benchmark Đang Lưu */}
              <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[15px] font-bold text-[#1C1C1E] dark:text-white">
                      Danh Sách Các Cấu Hình Benchmark Đang Lưu
                    </h4>
                    <p className="text-[12px] text-[#8E8E93] dark:text-[#98989D]">
                      Quản lý, chỉnh sửa tên, đặt mặc định hoặc xóa các cấu hình đã lưu trong hệ thống.
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] px-3 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 tabular-nums">
                    {benchmarkProfiles.length} Cấu hình
                  </span>
                </div>

                <div className="overflow-x-auto border border-black/[0.06] dark:border-white/[0.08] rounded-[18px]">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-black/[0.06] dark:border-white/[0.08] bg-[#767680]/6 dark:bg-white/[0.04] text-[#8E8E93] dark:text-[#98989D] text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4 font-semibold">Tên Cấu Hình & Ghi Chú</th>
                        <th className="py-3 px-4 font-semibold text-center">Số Chiều</th>
                        <th className="py-3 px-4 font-semibold">Phân Bổ Chi Tiết</th>
                        <th className="py-3 px-4 font-semibold text-center">Trạng Thái</th>
                        <th className="py-3 px-4 font-semibold text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                      {benchmarkProfiles.map((prof) => (
                        <tr
                          key={prof.id}
                          className={`hover:bg-[#007AFF]/[0.03] dark:hover:bg-white/[0.04] transition-colors ${
                            prof.id === activeProfileId ? 'bg-[#007AFF]/[0.06] dark:bg-[#0A84FF]/10' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#1C1C1E] dark:text-white">
                                {prof.title}
                              </span>
                              {prof.id === activeProfileId && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#007AFF] text-white font-semibold">
                                  Đang chọn
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#8E8E93] mt-0.5">
                              {prof.notes || 'Cấu hình tiêu chuẩn đa chiều hệ thống'}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-mono font-bold text-[12px] px-2.5 py-0.5 bg-[#767680]/12 dark:bg-white/[0.08] rounded-full text-[#1C1C1E] dark:text-white tabular-nums">
                              {prof.dimensionCount}D
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1.5 max-w-md">
                              {prof.dimensions.map((d, i) => (
                                <span
                                  key={d.id || i}
                                  className="text-[11px] font-mono px-2 py-0.5 bg-[#767680]/8 dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] rounded-full text-[#3C3C43] dark:text-[#EBEBF5]"
                                >
                                  {d.name.slice(0, 12)}: <strong>{d.weight}%</strong>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {prof.isDefault ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#34C759]/12 text-[#248A3D] dark:text-[#30D158]">
                                <CheckCircle2 className="w-3 h-3" /> Mặc Định
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSetDefaultBenchmark(prof.id)}
                                className="text-[12px] text-[#8E8E93] hover:text-[#007AFF] underline cursor-pointer"
                              >
                                Đặt làm mặc định
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2.5">
                            {prof.id !== activeProfileId && (
                              <button
                                onClick={() => handleSelectBenchmarkProfile(prof.id)}
                                className="text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer"
                              >
                                Chọn nạp
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditBenchmark(prof)}
                              className="text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteBenchmarkProfile(prof.id)}
                              className="text-[12px] font-semibold text-[#FF3B30] dark:text-[#FF453A] hover:underline cursor-pointer"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW USER */}
      {/* ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-[26px] shadow-2xl p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                Thêm Tài Khoản Nhân Sự Mới
              </h4>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Họ và Tên Nhân Sự *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ví dụ: Trần Văn Nam"
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Email Công Tác *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="nam.tran@company.vn"
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Số Điện Thoại</label>
                <input
                  type="tel"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="0988 111 222"
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono tabular-nums text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Phân Quyền Vai Trò *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-bold text-[#007AFF] dark:text-[#0A84FF] focus:outline-none cursor-pointer"
                >
                  {customRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="btn-fluent-glass px-4 py-2 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-fluent-primary px-5 py-2 text-white font-semibold rounded-full cursor-pointer"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT USER */}
      {/* ========================================================================= */}
      {isEditUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-[26px] shadow-2xl p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                Cập Nhật Thông Tin Tài Khoản Thành Viên
              </h4>
              <button
                onClick={() => setIsEditUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Họ và Tên Nhân Sự *</label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Email Công Tác *</label>
                <input
                  type="email"
                  required
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Số Điện Thoại</label>
                <input
                  type="tel"
                  value={editUserPhone}
                  onChange={(e) => setEditUserPhone(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono tabular-nums text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Chức Danh / Vị Trí</label>
                <input
                  type="text"
                  value={editUserJobTitle}
                  onChange={(e) => setEditUserJobTitle(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Phân Quyền Vai Trò *</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-bold text-[#007AFF] dark:text-[#0A84FF] focus:outline-none cursor-pointer"
                >
                  {customRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Trạng Thái Truy Cập *</label>
                <select
                  value={editUserStatus}
                  onChange={(e) => setEditUserStatus(e.target.value as 'Active' | 'Locked')}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-semibold text-[#1C1C1E] dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="Active">Hoạt động bình thường</option>
                  <option value="Locked">Đã khóa tài khoản</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="btn-fluent-glass px-4 py-2 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-fluent-primary px-5 py-2 text-white font-semibold rounded-full cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD NEW ROLE / ACCOUNT TYPE */}
      {/* ========================================================================= */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-[26px] shadow-2xl p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                Thêm Nhóm / Loại Tài Khoản Mới
              </h4>
              <button
                onClick={() => setIsAddRoleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewRole} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Tên Loại Tài Khoản *</label>
                <input
                  type="text"
                  required
                  value={newRoleTitle}
                  onChange={(e) => {
                    setNewRoleTitle(e.target.value);
                    if (!newRoleKey) {
                      setNewRoleKey(
                        e.target.value
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/[^a-z0-9]/g, '_')
                      );
                    }
                  }}
                  placeholder="Ví dụ: Cố Vấn Tuyển Dụng Cấp Cao"
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Mã Định Danh Vai Trò (Slug) *</label>
                <input
                  type="text"
                  required
                  value={newRoleKey}
                  onChange={(e) => setNewRoleKey(e.target.value)}
                  placeholder="hr_advisor"
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono font-bold text-[#007AFF] dark:text-[#0A84FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Mô Tả Nhiệm Vụ & Quyền Hạn</label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Mô tả tóm tắt phạm vi quyền hạn của nhóm tài khoản này..."
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="btn-fluent-glass px-4 py-2 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-fluent-primary px-5 py-2 text-white font-semibold rounded-full cursor-pointer"
                >
                  Tạo Nhóm Quyền Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT DEPARTMENT */}
      {/* ========================================================================= */}
      {isEditDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-[26px] shadow-2xl p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                Chỉnh Sửa Thông Tin Phòng Ban
              </h4>
              <button
                onClick={() => setIsEditDeptModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDept} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Tên Phòng / Ban / Đơn Vị *</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Mã Khối / Viết Tắt *</label>
                <input
                  type="text"
                  required
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono font-bold text-[#007AFF] dark:text-[#0A84FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Trưởng Khối / Quản Lý Phụ Trách</label>
                <input
                  type="text"
                  value={deptManager}
                  onChange={(e) => setDeptManager(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Quy Mô Nhân Sự Hiện Tại</label>
                <input
                  type="number"
                  value={deptHeadCount}
                  onChange={(e) => setDeptHeadCount(Number(e.target.value))}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono tabular-nums font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditDeptModalOpen(false)}
                  className="btn-fluent-glass px-4 py-2 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-fluent-primary px-5 py-2 text-white font-semibold rounded-full cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD NEW ID RULE POP-UP */}
      {/* ========================================================================= */}
      {isAddRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-[26px] shadow-2xl p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                Thêm Quy Tắc Định Danh Mã Tự Động (ID Rule)
              </h4>
              <button
                onClick={() => setIsAddRuleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewIdRule} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Tên Quy Ước *
                  </label>
                  <input
                    type="text"
                    required
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="Ví dụ: Quy ước Mã Ứng Viên Kinh Doanh"
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Mã Tiền Tố Quy Ước (Prefix) *
                  </label>
                  <input
                    type="text"
                    required
                    value={rulePrefix}
                    onChange={(e) => setRulePrefix(e.target.value)}
                    placeholder="UV-BIZ-"
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono font-bold text-[#007AFF] dark:text-[#0A84FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Mã Thứ Cấp (Secondary Code)
                  </label>
                  <input
                    type="text"
                    value={ruleSecondaryCode}
                    onChange={(e) => setRuleSecondaryCode(e.target.value)}
                    placeholder="HN-2026"
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Số Bắt Đầu (Start Number) *
                  </label>
                  <input
                    type="number"
                    required
                    value={ruleStartNumber}
                    onChange={(e) => setRuleStartNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono tabular-nums font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Phòng / Ban / Đơn Vị Áp Dụng *
                  </label>
                  <select
                    value={ruleDeptName}
                    onChange={(e) => {
                      const selected = departments.find((d) => d.name === e.target.value);
                      setRuleDeptName(e.target.value);
                      if (selected) setRuleUnitCode(selected.code);
                    }}
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-semibold text-[#1C1C1E] dark:text-white focus:outline-none cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Diễn Giải Quy Ước
                  </label>
                  <textarea
                    rows={2}
                    value={ruleExplanation}
                    onChange={(e) => setRuleExplanation(e.target.value)}
                    placeholder="Mục đích sử dụng, phạm vi áp dụng của quy tắc định danh..."
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRuleModalOpen(false)}
                  className="btn-fluent-glass px-4 py-2 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-fluent-primary px-5 py-2 text-white font-semibold rounded-full cursor-pointer"
                >
                  Lưu Quy Tắc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ADD NEW CHANNEL */}
      {/* ========================================================================= */}
      {isAddChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-[26px] shadow-2xl p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                Kết Nối Kênh Tuyển Dụng Mới
              </h4>
              <button
                onClick={() => setIsAddChannelModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewChannel} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Tên Kênh Tuyển Dụng *</label>
                <input
                  type="text"
                  required
                  value={chanName}
                  onChange={(e) => setChanName(e.target.value)}
                  placeholder="Ví dụ: TopCV Doanh Nghiệp Pro"
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Loại Nền Tảng *</label>
                <select
                  value={chanPlatform}
                  onChange={(e) => setChanPlatform(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-semibold text-[#1C1C1E] dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="topcv">TopCV Employer</option>
                  <option value="vietnamworks">VietnamWorks Hub</option>
                  <option value="linkedin">LinkedIn Talent Solutions</option>
                  <option value="internal">Cổng Tuyển Dụng Nội Bộ</option>
                  <option value="facebook">Facebook Jobs / IT Group</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Link Website / API Endpoint *</label>
                <input
                  type="url"
                  required
                  value={chanUrl}
                  onChange={(e) => setChanUrl(e.target.value)}
                  placeholder="https://tuyendung.topcv.vn/api/jobs"
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">ID / Tên Tài Khoản Đăng Nhập *</label>
                <input
                  type="text"
                  required
                  value={chanAccountId}
                  onChange={(e) => setChanAccountId(e.target.value)}
                  placeholder="hr_recruiter_acc"
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Mật Khẩu / API Token Kênh</label>
                <input
                  type="password"
                  value={chanPassword}
                  onChange={(e) => setChanPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddChannelModalOpen(false)}
                  className="btn-fluent-glass px-4 py-2 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-fluent-primary px-5 py-2 text-white font-semibold rounded-full cursor-pointer"
                >
                  Liên Kết Kênh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: EDIT CHANNEL */}
      {/* ========================================================================= */}
      {isEditChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-[26px] shadow-2xl p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                Chỉnh Sửa Thông Tin Kênh Kết Nối
              </h4>
              <button
                onClick={() => setIsEditChannelModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditChannel} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Tên Kênh *</label>
                <input
                  type="text"
                  required
                  value={chanName}
                  onChange={(e) => setChanName(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Loại Nền Tảng *</label>
                <select
                  value={chanPlatform}
                  onChange={(e) => setChanPlatform(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-semibold text-[#1C1C1E] dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="topcv">TopCV Employer</option>
                  <option value="vietnamworks">VietnamWorks Hub</option>
                  <option value="linkedin">LinkedIn Talent Solutions</option>
                  <option value="internal">Cổng Tuyển Dụng Nội Bộ</option>
                  <option value="facebook">Facebook Jobs / IT Group</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Link Website / API URL *</label>
                <input
                  type="url"
                  required
                  value={chanUrl}
                  onChange={(e) => setChanUrl(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">ID / Tên Tài Khoản Đăng Nhập *</label>
                <input
                  type="text"
                  required
                  value={chanAccountId}
                  onChange={(e) => setChanAccountId(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">Mật Khẩu Mới (Để trống nếu giữ nguyên)</label>
                <input
                  type="password"
                  value={chanPassword}
                  onChange={(e) => setChanPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] font-mono text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditChannelModalOpen(false)}
                  className="btn-fluent-glass px-4 py-2 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-fluent-primary px-5 py-2 text-white font-semibold rounded-full cursor-pointer"
                >
                  Lưu Kênh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: DELETE CHANNEL CONFIRMATION */}
      {/* ========================================================================= */}
      {channelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-sm rounded-[26px] border border-[#FF3B30]/30 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FF3B30]/12 text-[#FF3B30] dark:text-[#FF453A] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                Xác Nhận Ngắt & Xóa Kênh Kết Nối?
              </h4>
              <p className="text-xs text-[#8E8E93] dark:text-[#98989D]">
                Bạn có chắc chắn muốn ngắt kết nối và xóa kênh{' '}
                <strong className="text-[#FF3B30] dark:text-[#FF453A] font-bold">[{channelToDelete.name}]</strong> khỏi hệ thống? Các tin đã đăng sẽ không thể tự động đồng bộ nữa.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setChannelToDelete(null)}
                className="btn-fluent-glass px-4 py-2 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteChannel}
                className="px-4 py-2 bg-[#FF3B30] hover:bg-[#D70015] text-white font-semibold rounded-full cursor-pointer text-xs transition-colors"
              >
                Xác Nhận Xóa Kênh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: EDIT BENCHMARK PROFILE */}
      {/* ========================================================================= */}
      {isEditBenchmarkModalOpen && benchmarkToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-[26px] shadow-2xl p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                Sửa Thông Tin Cấu Hình Benchmark
              </h4>
              <button
                onClick={() => setIsEditBenchmarkModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBenchmark} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                  Tên Cấu Hình Benchmark *
                </label>
                <input
                  type="text"
                  required
                  value={editProfileTitle}
                  onChange={(e) => setEditProfileTitle(e.target.value)}
                  placeholder="Ví dụ: Benchmark Chuẩn Ban Công Nghệ (5D)"
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                  Ghi Chú & Phạm Vi Áp Dụng
                </label>
                <textarea
                  rows={3}
                  value={editProfileNotes}
                  onChange={(e) => setEditProfileNotes(e.target.value)}
                  placeholder="Mô tả mục đích áp dụng cấu hình này..."
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditBenchmarkModalOpen(false)}
                  className="btn-fluent-glass px-4 py-2 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-fluent-primary px-5 py-2 text-white font-semibold rounded-full cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 10: ADD NEW ORG NODE */}
      {/* ========================================================================= */}
      {isAddOrgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-[26px] shadow-2xl p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                Thêm Đơn Vị Mới Vào Sơ Đồ Tổ Chức
              </h4>
              <button
                onClick={() => setIsAddOrgModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewOrgNode} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Tên Đơn Vị / Phòng Ban *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Ví dụ: Trung Tâm Trí Tuệ Nhân Tạo"
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Mã Đơn Vị *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgCode}
                    onChange={(e) => setOrgCode(e.target.value)}
                    placeholder="Ví dụ: AI-CENTER"
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs font-mono uppercase text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                  Đơn Vị Cấp Trên Trực Thuộc
                </label>
                <select
                  value={orgParentId || ''}
                  onChange={(e) => setOrgParentId(e.target.value || null)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs font-bold text-[#007AFF] dark:text-[#0A84FF] focus:outline-none cursor-pointer"
                >
                  <option value="">[Ban Lãnh Đạo Cao Nhất - Gốc Hệ Thống]</option>
                  {orgNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {'-'.repeat(n.level - 1)} {n.name} ({n.code}) - Cấp {n.level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Họ & Tên Người Đứng Đầu
                  </label>
                  <input
                    type="text"
                    value={orgLeaderName}
                    onChange={(e) => setOrgLeaderName(e.target.value)}
                    placeholder="Ví dụ: TS. Lê Quang Dũng"
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Chức Danh
                  </label>
                  <input
                    type="text"
                    value={orgLeaderTitle}
                    onChange={(e) => setOrgLeaderTitle(e.target.value)}
                    placeholder="Ví dụ: Giám Đốc Trung Tâm"
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#F2F2F7]/70 dark:bg-white/[0.04] rounded-[16px] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                <span className="font-bold text-[11px] text-[#007AFF] dark:text-[#0A84FF] block uppercase tracking-wider">
                  Kế Hoạch Định Biên Nhân Sự (Headcount Planning)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Chỉ Tiêu Định Biên *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={orgHeadcountQuota}
                      onChange={(e) => setOrgHeadcountQuota(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 neumorphic-inset rounded-[10px] text-xs font-mono tabular-nums font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Nhân Sự Hiện Tại
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={orgCurrentHeadcount}
                      onChange={(e) => setOrgCurrentHeadcount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 neumorphic-inset rounded-[10px] text-xs font-mono tabular-nums text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Đang Tuyển (Open)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={orgOpenPositions}
                      onChange={(e) => setOrgOpenPositions(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 neumorphic-inset rounded-[10px] text-xs font-mono tabular-nums text-[#34C759] dark:text-[#30D158] font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                  Màu Sắc Nhận Diện
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={orgColor}
                    onChange={(e) => setOrgColor(e.target.value)}
                    className="w-9 h-9 p-0.5 border border-black/10 dark:border-white/15 rounded-[10px] cursor-pointer"
                  />
                  <span className="font-mono text-xs text-[#8E8E93]">{orgColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                  Mô Tả Chức Năng Nhiệm Vụ
                </label>
                <textarea
                  rows={2}
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  placeholder="Chức năng, mục tiêu tuyển dụng..."
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOrgModalOpen(false)}
                  className="btn-fluent-glass px-4 py-2 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-fluent-primary px-5 py-2 text-white font-semibold rounded-full cursor-pointer"
                >
                  Tạo Đơn Vị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 11: EDIT ORG NODE */}
      {/* ========================================================================= */}
      {isEditOrgModalOpen && orgNodeToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-[26px] shadow-2xl p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                Chỉnh Sửa Thông Tin Đơn Vị [{orgNodeToEdit.name}]
              </h4>
              <button
                onClick={() => setIsEditOrgModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOrgNode} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Tên Đơn Vị / Phòng Ban *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Mã Đơn Vị *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgCode}
                    onChange={(e) => setOrgCode(e.target.value)}
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs font-mono uppercase text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Lãnh Đạo Phụ Trách
                  </label>
                  <input
                    type="text"
                    value={orgLeaderName}
                    onChange={(e) => setOrgLeaderName(e.target.value)}
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    Chức Danh
                  </label>
                  <input
                    type="text"
                    value={orgLeaderTitle}
                    onChange={(e) => setOrgLeaderTitle(e.target.value)}
                    className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#F2F2F7]/70 dark:bg-white/[0.04] rounded-[16px] border border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                <span className="font-bold text-[11px] text-[#007AFF] dark:text-[#0A84FF] block uppercase tracking-wider">
                  Kế Hoạch Định Biên Nhân Sự (Headcount Planning)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Chỉ Tiêu Định Biên *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={orgHeadcountQuota}
                      onChange={(e) => setOrgHeadcountQuota(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 neumorphic-inset rounded-[10px] text-xs font-mono tabular-nums font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Nhân Sự Hiện Tại
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={orgCurrentHeadcount}
                      onChange={(e) => setOrgCurrentHeadcount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 neumorphic-inset rounded-[10px] text-xs font-mono tabular-nums text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Đang Tuyển (Open)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={orgOpenPositions}
                      onChange={(e) => setOrgOpenPositions(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 neumorphic-inset rounded-[10px] text-xs font-mono tabular-nums text-[#34C759] dark:text-[#30D158] font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                  Màu Sắc Đại Diện
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={orgColor}
                    onChange={(e) => setOrgColor(e.target.value)}
                    className="w-9 h-9 p-0.5 border border-black/10 dark:border-white/15 rounded-[10px] cursor-pointer"
                  />
                  <span className="font-mono text-xs text-[#8E8E93]">{orgColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                  Mô Tả Đơn Vị
                </label>
                <textarea
                  rows={2}
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOrgModalOpen(false)}
                  className="btn-fluent-glass px-4 py-2 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-fluent-primary px-5 py-2 text-white font-semibold rounded-full cursor-pointer"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 12: ADJUST ORG PARENT UNIT */}
      {/* ========================================================================= */}
      {isAdjustParentModalOpen && orgNodeToAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-[26px] shadow-2xl p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                Điều Chỉnh Cấp Trên Đơn Vị [{orgNodeToAdjust.name}]
              </h4>
              <button
                onClick={() => setIsAdjustParentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustParent} className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-[#F2F2F7]/70 dark:bg-white/[0.04] rounded-[14px] border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[11px] text-[#8E8E93] block">Đơn vị đang điều chỉnh:</span>
                <span className="font-bold text-xs text-[#1C1C1E] dark:text-white">
                  {orgNodeToAdjust.name} ({orgNodeToAdjust.code})
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1">
                  Chọn Đơn Vị Cấp Trên Mới *
                </label>
                <select
                  value={orgParentId || ''}
                  onChange={(e) => setOrgParentId(e.target.value || null)}
                  className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs font-bold text-[#007AFF] dark:text-[#0A84FF] focus:outline-none cursor-pointer"
                >
                  <option value="">[Ban Lãnh Đạo Cao Nhất - Gốc Hệ Thống]</option>
                  {orgNodes
                    .filter((n) => n.id !== orgNodeToAdjust.id)
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {'-'.repeat(n.level - 1)} {n.name} ({n.code}) - Cấp {n.level}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-[#8E8E93] mt-1.5">
                  Đơn vị và toàn bộ nhánh trực thuộc sẽ được dịch chuyển vị trí phân cấp tương ứng.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustParentModalOpen(false)}
                  className="btn-fluent-glass px-4 py-2 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-fluent-primary px-5 py-2 text-white font-semibold rounded-full cursor-pointer"
                >
                  Xác Nhận Chuyển Cấp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 13: GOOGLE CONTACTS CREATE / EDIT MODAL */}
      {/* ========================================================================= */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-[26px] shadow-2xl p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5 sticky top-0 bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-md z-10 -mx-6 px-6 -mt-6 pt-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[11px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center">
                  <BookUser className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                    {editingContactId
                      ? 'Cập Nhật Thông Tin Người Liên Hệ (Google Contacts)'
                      : 'Tạo Người Liên Hệ Mới (Chuẩn Google Contacts)'}
                  </h4>
                  <p className="text-[11px] text-[#8E8E93]">
                    Các trường thông tin chuẩn theo ứng dụng Google Contacts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
              {/* PHẦN 1: TÊN & DANH TÍNH */}
              <div className="p-4 rounded-[18px] bg-[#F2F2F7]/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <span className="font-bold text-xs text-[#007AFF] dark:text-[#0A84FF] flex items-center gap-1.5 uppercase tracking-wider">
                  <UserCheck className="w-4 h-4" />
                  <span>Thông Tin Họ & Tên (Name Details)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Tiền tố xưng hô
                    </label>
                    <input
                      type="text"
                      value={cNamePrefix}
                      onChange={(e) => setCNamePrefix(e.target.value)}
                      placeholder="Anh, Chị, TS., Dr..."
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Họ (Family Name)
                    </label>
                    <input
                      type="text"
                      value={cFamilyName}
                      onChange={(e) => setCFamilyName(e.target.value)}
                      placeholder="Nguyễn, Trần..."
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Tên đệm (Middle Name)
                    </label>
                    <input
                      type="text"
                      value={cAdditionalName}
                      onChange={(e) => setCAdditionalName(e.target.value)}
                      placeholder="Văn, Thị..."
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Tên (Given Name) *
                    </label>
                    <input
                      type="text"
                      value={cGivenName}
                      onChange={(e) => setCGivenName(e.target.value)}
                      placeholder="Minh, Hùng, Linh..."
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs font-bold text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                    Biệt danh (Nickname)
                  </label>
                  <input
                    type="text"
                    value={cNickname}
                    onChange={(e) => setCNickname(e.target.value)}
                    placeholder="Tên gọi thân mật, alias..."
                    className="w-full sm:w-1/2 px-3 py-2 neumorphic-inset rounded-[10px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* PHẦN 2: NƠI LÀM VIỆC & CHỨC VỤ */}
              <div className="p-4 rounded-[18px] bg-[#F2F2F7]/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <span className="font-bold text-xs text-[#007AFF] dark:text-[#0A84FF] flex items-center gap-1.5 uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>Cơ Quan, Tổ Chức & Chức Danh</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Công ty / Tổ chức
                    </label>
                    <input
                      type="text"
                      value={cOrganization}
                      onChange={(e) => setCOrganization(e.target.value)}
                      placeholder="SEICO, ..."
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Phòng ban / Bộ phận
                    </label>
                    <input
                      type="text"
                      value={cDepartment}
                      onChange={(e) => setCDepartment(e.target.value)}
                      placeholder="Khối Kỹ Thuật, Ban Nhân Sự..."
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Chức danh / Vị trí
                    </label>
                    <input
                      type="text"
                      value={cJobTitle}
                      onChange={(e) => setCJobTitle(e.target.value)}
                      placeholder="Trưởng Phòng Tuyển Dụng, Tech Lead..."
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs font-bold text-[#007AFF] dark:text-[#0A84FF] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN 3: EMAIL & ĐIỆN THOẠI */}
              <div className="p-4 rounded-[18px] bg-[#F2F2F7]/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <span className="font-bold text-xs text-[#007AFF] dark:text-[#0A84FF] flex items-center gap-1.5 uppercase tracking-wider">
                  <Mail className="w-4 h-4" />
                  <span>Thông Tin Liên Lạc (Email & Điện Thoại)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Email chính */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5]">
                        Email Chính *
                      </label>
                      <select
                        value={cEmailType}
                        onChange={(e) => setCEmailType(e.target.value)}
                        className="text-[10px] font-bold neumorphic-inset rounded-md px-2 py-0.5 text-[#007AFF] dark:text-[#0A84FF] focus:outline-none cursor-pointer"
                      >
                        <option value="Work">Công việc (Work)</option>
                        <option value="Home">Cá nhân (Home)</option>
                        <option value="Other">Khác (Other)</option>
                      </select>
                    </div>
                    <input
                      type="email"
                      value={cEmail}
                      onChange={(e) => setCEmail(e.target.value)}
                      placeholder="lienhe@doanhnghiep.vn"
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs font-mono text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Email phụ */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] block">
                      Email Phụ
                    </label>
                    <input
                      type="email"
                      value={cSecondaryEmail}
                      onChange={(e) => setCSecondaryEmail(e.target.value)}
                      placeholder="phu@gmail.com"
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs font-mono text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Số điện thoại chính */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5]">
                        Số Điện Thoại Chính *
                      </label>
                      <select
                        value={cPhoneType}
                        onChange={(e) => setCPhoneType(e.target.value)}
                        className="text-[10px] font-bold neumorphic-inset rounded-md px-2 py-0.5 text-[#007AFF] dark:text-[#0A84FF] focus:outline-none cursor-pointer"
                      >
                        <option value="Mobile">Di động (Mobile)</option>
                        <option value="Work">Công ty (Work)</option>
                        <option value="Home">Nhà riêng (Home)</option>
                        <option value="Main">Số chính (Main)</option>
                      </select>
                    </div>
                    <input
                      type="tel"
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      placeholder="0988 234 567"
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs font-mono tabular-nums text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Số điện thoại phụ */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] block">
                      Số Điện Thoại Phụ
                    </label>
                    <input
                      type="tel"
                      value={cSecondaryPhone}
                      onChange={(e) => setCSecondaryPhone(e.target.value)}
                      placeholder="024 3822 9999"
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs font-mono tabular-nums text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN 4: NHÃN / NHÓM (GROUP MEMBERSHIP) */}
              <div className="p-4 rounded-[18px] bg-[#F2F2F7]/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <span className="font-bold text-xs text-[#007AFF] dark:text-[#0A84FF] flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Nhóm / Nhãn Google Contacts (Group Membership)</span>
                </span>

                <div>
                  <input
                    type="text"
                    value={cGroupMembership}
                    onChange={(e) => setCGroupMembership(e.target.value)}
                    placeholder="Ví dụ: * myContacts ::: Hội Đồng Tuyển Dụng"
                    className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs font-mono text-[#1C1C1E] dark:text-white focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-[#8E8E93]">Gợi ý nhãn nhanh:</span>
                    {[
                      '* myContacts',
                      'Hội Đồng Tuyển Dụng',
                      'Ban Giám Đốc',
                      'Đội Ngũ Tuyển Dụng',
                      'Ứng Viên Tiềm Năng',
                      'Đối Tác Headhunter',
                    ].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          if (!cGroupMembership.includes(label)) {
                            setCGroupMembership(
                              cGroupMembership
                                ? `${cGroupMembership} ::: ${label}`
                                : label
                            );
                          }
                        }}
                        className="btn-fluent-glass px-2.5 py-0.5 rounded-full text-[10px] font-medium text-[#007AFF] dark:text-[#0A84FF] cursor-pointer"
                      >
                        + {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PHẦN 5: THÔNG TIN BỔ SUNG */}
              <div className="p-4 rounded-[18px] bg-[#F2F2F7]/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-3">
                <span className="font-bold text-xs text-[#007AFF] dark:text-[#0A84FF] flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  <span>Địa Chỉ, Ngày Sinh, Giới Tính & Ghi Chú</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Địa Chỉ (Address)
                    </label>
                    <input
                      type="text"
                      value={cAddress}
                      onChange={(e) => setCAddress(e.target.value)}
                      placeholder="Số nhà, đường, quận, thành phố..."
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Ngày Sinh (Birthday)
                    </label>
                    <input
                      type="date"
                      value={cBirthday}
                      onChange={(e) => setCBirthday(e.target.value)}
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Giới Tính (Gender)
                    </label>
                    <select
                      value={cGender}
                      onChange={(e) => setCGender(e.target.value)}
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                      <option value="Tùy chỉnh">Tùy chỉnh</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Website / LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      value={cWebsite}
                      onChange={(e) => setCWebsite(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs font-mono text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">
                      Ghi Chú Nghiệp Vụ (Notes)
                    </label>
                    <input
                      type="text"
                      value={cNotes}
                      onChange={(e) => setCNotes(e.target.value)}
                      placeholder="Kênh liên lạc ưu tiên, chuyên môn phỏng vấn..."
                      className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="btn-fluent-glass px-4 py-2.5 rounded-full font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="btn-fluent-primary px-5 py-2.5 text-white font-semibold rounded-full cursor-pointer"
                >
                  {editingContactId ? 'Lưu Cập Nhật Người Liên Hệ' : 'Tạo Người Liên Hệ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
