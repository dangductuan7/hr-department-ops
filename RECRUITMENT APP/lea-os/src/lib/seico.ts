// Cấu hình SEICO cho LEA-OS: chỉ cấu hình, không có dữ liệu mẫu.
// Sơ đồ tổ chức theo about-SEICO.md §9.1 (hồ sơ năng lực 07/2026).
import { AdminSettings, ConnectedChannel, DepartmentItem, JobPosition, OrgNode } from '../types';
import { initialAdminSettings, initialPermissions, initialRoleDefinitions } from '../data/initialData';

type Any = any;

export const SEICO_ORG = [
  { block: 'Quản trị', code: 'QT', units: ['Hội đồng quản trị', 'Kiểm soát nội bộ', 'Ban Tổng Giám đốc'] },
  { block: 'Khối Phục vụ', code: 'PV', units: ['Phòng Nhân sự', 'Phòng Tài chính – Kế toán', 'Phòng Hành chính – Pháp chế', 'Phòng Công nghệ và Hạ tầng số'] },
  { block: 'Khối Kinh doanh', code: 'KD', units: ['Ban Kinh doanh dự án nội địa', 'Ban Kinh doanh dự án xuất khẩu', 'Ban Dự án', 'Phòng Kinh doanh thương mại', 'Phòng Marketing'] },
  { block: 'Khối Sản xuất', code: 'SX', units: ['Ban Chất lượng', 'Ban Kế hoạch sản xuất', 'Thiết kế sản xuất', 'Nhà máy I', 'Nhà máy II', 'Nhà máy III', 'Nhà máy sơn', 'Ban Nghiên cứu và sản xuất sơn'] },
  { block: 'Khối Thi công', code: 'TC', units: ['Ban Điều hành', 'Ban An toàn', 'Ban Chỉ huy công trường'] },
];

const NOTE = 'Theo hồ sơ năng lực 07/2026 (about-SEICO §9.1). ⚠️ Chưa đối chiếu phụ lục Thông báo 20/2026/TB-SEICO; quan hệ cấp trên – cấp dưới giữa các khối là ASSUMPTION.';
const COLORS: Record<string, string> = { QT: '#007AFF', PV: '#5856D6', KD: '#FF9500', SX: '#34C759', TC: '#30B0C7' };

export function buildOrgNodes(): OrgNode[] {
  const nodes: OrgNode[] = [];
  const base = { leaderName: '', leaderTitle: 'PENDING', headCount: 0, headcountQuota: 0, currentHeadcount: 0, openPositions: 0 };
  nodes.push({ ...base, id: 'ORG-HDQT', name: 'Hội đồng quản trị', code: 'HDQT', parentId: null, level: 1, color: COLORS.QT, description: NOTE, leaderTitle: 'Chủ tịch HĐQT' });
  nodes.push({ ...base, id: 'ORG-KSNB', name: 'Kiểm soát nội bộ', code: 'KSNB', parentId: 'ORG-HDQT', level: 2, color: COLORS.QT, description: NOTE });
  nodes.push({ ...base, id: 'ORG-BTGD', name: 'Ban Tổng Giám đốc', code: 'BTGD', parentId: 'ORG-HDQT', level: 1, color: COLORS.QT, description: NOTE, leaderTitle: 'Tổng Giám đốc' });
  SEICO_ORG.slice(1).forEach((b) => {
    const bid = `ORG-${b.code}`;
    nodes.push({ ...base, id: bid, name: b.block, code: b.code, parentId: 'ORG-BTGD', level: 2, color: COLORS[b.code], description: NOTE });
    b.units.forEach((u, i) =>
      nodes.push({ ...base, id: `${bid}-${String(i + 1).padStart(2, '0')}`, name: u, code: `${b.code}-${String(i + 1).padStart(2, '0')}`, parentId: bid, level: 3, color: COLORS[b.code], description: NOTE })
    );
  });
  return nodes;
}

export function buildDepartments(): DepartmentItem[] {
  return SEICO_ORG.flatMap((b) => b.units).map((u, i) => ({ id: `DEP-${String(i + 1).padStart(2, '0')}`, name: u, code: `DEP-${String(i + 1).padStart(2, '0')}`, headCount: 0, managerName: '' }));
}

export const blockOf = (unit: string) => SEICO_ORG.find((b) => b.units.includes(unit))?.block || '';

export const SEICO_ADMIN: AdminSettings = {
  ...initialAdminSettings,
  companyName: 'Công ty Cổ phần Nhà Khung thép và Thiết bị Công nghiệp (SEICO)',
  departments: buildDepartments(),
  customIdRules: [],
  orgChartNodes: buildOrgNodes(),
  idRule: { candidatePrefix: 'CAND-', candidateStartNumber: 10001, jobPrefix: 'JOB-2026-', jobStartNumber: 1 },
  minBenchmarkQualifiedScore: 3.8,
  benchmarkProfiles: initialAdminSettings.benchmarkProfiles,
  activeBenchmarkProfileId: 'BENCH-01',
  adminUsers: [],
  contacts: [],
};

export const SEICO_ROLES = initialRoleDefinitions;
export const SEICO_PERMISSIONS = initialPermissions;

// ---- Bộ chuyển đổi dữ liệu đã có trong cơ sở dữ liệu (bản artifact trước) sang cấu trúc LEA-OS ----
export function toJob(d: Any): JobPosition {
  return {
    ...d,
    title: d.title || '',
    department: d.department || '',
    level: d.level || 'Middle',
    salaryRange: d.salaryRange || 'Thỏa thuận',
    location: d.location || '',
    summary: d.summary ?? d.description ?? '',
    responsibilities: d.responsibilities || [],
    requirements: d.requirements || [],
    niceToHave: d.niceToHave || [],
    benefits: d.benefits || [],
    benchmarkCriteria: d.benchmarkCriteria || { technicalSkills: [], minExperienceYears: 0, educationLevel: '', culturalFitTraits: [] },
    status: d.status || 'Draft',
    createdAt: d.createdAt || '',
    totalApplicants: d.totalApplicants || 0,
  };
}

const platformOf = (n: string): Any => {
  const s = n.toLowerCase();
  if (s.includes('topcv')) return 'topcv';
  if (s.includes('vietnamworks')) return 'vietnamworks';
  if (s.includes('linkedin')) return 'linkedin';
  if (s.includes('facebook') || s.includes('fanpage')) return 'facebook';
  return 'internal';
};

export function toChannel(d: Any): ConnectedChannel {
  return {
    ...d,
    name: d.name || '',
    webUrl: d.webUrl || d.channelUrl || '',
    accountId: d.accountId || '',
    passwordMasked: '',
    status: d.status === 'Disconnected' ? 'Error' : d.status || 'Connected',
    lastPublishedAt: d.lastPublishedAt || d.lastSyncedAt || '',
    totalJobsPosted: d.totalJobsPosted ?? d.publishedJobsCount ?? 0,
    autoSync: false,
    platformType: d.platformType || platformOf(d.name || ''),
  };
}
// Không lưu mật khẩu kênh vào cơ sở dữ liệu dùng chung
export const fromChannel = (c: ConnectedChannel) => ({ ...c, passwordMasked: '' });

// Không lưu toàn văn CV (AGENT Tuyển dụng v1.7 §9.3)
export const fromCandidate = (c: Any) => {
  const { rawCvText, ...rest } = c;
  return rest;
};

// Cấp mã ứng viên duy nhất: số lớn nhất hiện có + 1 (không trùng khi đã xóa hồ sơ)
export function nextCandidateId(cands: Any[], rule: Any) {
  const prefix = rule?.candidatePrefix || 'CAND-';
  const start = Number(rule?.candidateStartNumber) || 10001;
  const max = cands.reduce((m, c) => (c.id.startsWith(prefix) ? Math.max(m, Number(c.id.slice(prefix.length)) || 0) : m), start - 1);
  return `${prefix}${max + 1}`;
}

