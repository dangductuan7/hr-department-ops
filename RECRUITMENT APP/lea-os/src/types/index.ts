export type CandidateStage = 'Mới nhận' | 'Đã thẩm định' | 'Phỏng vấn' | 'Đề nghị việc' | 'Đã từ chối';

export interface MatrixMatch {
  skillsScore: number;       // Thang 1 - 5
  experienceScore: number;   // Thang 1 - 5
  educationScore: number;    // Thang 1 - 5
  cultureScore: number;      // Thang 1 - 5
}

export interface Candidate {
  id: string; // e.g. "CAND-10021"
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  appliedDate: string;
  source: 'Email Tự Động Quét' | 'Tải File Trực Tiếp' | 'TopCV Kênh Kết Nối' | 'LinkedIn';
  resumeFileName: string;
  benchmarkScore: number; // 1.0 - 5.0 sao
  matrixMatch: MatrixMatch;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gapsOrRisks: string[];
  interviewQuestions: string[];
  stage: CandidateStage;
  recommendation: 'Strong Hire' | 'Interview' | 'Consider' | 'Reject';
  summary: string;
  notes: string;
  // Bổ sung bản SEICO
  dimensionScores?: { id: string; name: string; weight: number; score: number; evidence?: string }[];
  benchmarkProfileTitle?: string;
  resumeTextSnippet?: string;
  driveFileId?: string;
  driveFolderId?: string;
  driveUrl?: string;
  rawCvText?: string;
  uploadedBy?: string;
}

export interface BenchmarkCriteria {
  technicalSkills: string[];
  minExperienceYears: number;
  educationLevel: string;
  culturalFitTraits: string[];
}

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  level: 'Junior' | 'Middle' | 'Senior' | 'Lead' | 'Manager';
  salaryRange: string;
  location: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  benchmarkCriteria: BenchmarkCriteria;
  status: 'Open' | 'Draft' | 'Closed';
  createdAt: string;
  totalApplicants: number;
}

export interface ConnectedChannel {
  id: string;
  name: string;
  webUrl: string;
  accountId: string;
  passwordMasked: string;
  status: 'Connected' | 'Error' | 'Syncing';
  lastPublishedAt: string;
  totalJobsPosted: number;
  autoSync: boolean;
  platformType: 'topcv' | 'vietnamworks' | 'linkedin' | 'internal' | 'facebook';
}

export interface QuickReplyHistory {
  repliedAt: string;
  replyType: 'thank_you' | 'interview_invite' | 'rejection' | 'request_info';
  subject: string;
  sentBody: string;
  recipientEmail: string;
}

export interface InboundEmail {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  dateReceived: string;
  targetJobTitle: string;
  targetJobId: string;
  attachmentName: string;
  attachmentSize: string;
  status: 'Chưa bóc tách' | 'Đã nạp ứng viên';
  extractedCandidateId?: string;
  rawCvContent: string;
  lastReply?: QuickReplyHistory;
}

export interface MailboxSettings {
  emailAddress: string;
  mailServer: string;
  accountId: string;
  passwordMasked: string;
  isConnected: boolean;
  autoCheckIntervalMinutes: number;
  lastCheckedAt: string;
  totalReceived: number;
}

export interface PublishLog {
  id: string;
  jobId: string;
  jobTitle: string;
  channelNames: string[];
  publishedAt: string;
  status: 'Thành công' | 'Đang xử lý';
  socialContentSnippet: string;
}

export type UserRole = 'master_admin' | 'ops_admin' | 'member' | string;

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
  color?: string;
}

export interface UserProfile {
  // Bắt buộc (Danh tính cơ bản):
  fullName: string;
  phone: string;
  identityNumber: string; // CCCD / CMND
  dateOfBirth: string;    // YYYY-MM-DD
  gender: 'Nam' | 'Nữ' | 'Khác';
  address: string;
  jobTitle: string;

  // Không bắt buộc (Thông tin về doanh nghiệp):
  companyName?: string;
  taxCode?: string;
  companyWebsite?: string;
  companySize?: string;
  officeAddress?: string;
  industry?: string;
}

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  profileCompleted: boolean;
  profile: UserProfile;
  status: 'Active' | 'Locked';
  createdAt: string;
  lastLoginAt?: string;
  avatarColor?: string;
  assignedChannelsCount?: number;
}

export interface PermissionFeature {
  id: string;
  name: string;
  category: 'Quản trị JD' | 'Hồ sơ & CV' | 'Kênh kết nối' | 'Hệ thống & Báo cáo';
  description: string;
}

export type RolePermissions = Record<string, string[]>;

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
  status: 'Thành công' | 'Cảnh báo' | 'Thất bại';
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  headCount: number;
  managerName: string;
}

export interface CustomIdRuleItem {
  id: string;
  name: string;          // Tên quy ước
  prefix: string;        // Mã tiền tố quy ước
  secondaryCode: string; // Mã thứ cấp
  startNumber: number;   // Số bắt đầu
  departmentName: string;// Tên phòng/ban/đơn vị
  unitCode: string;      // Mã đơn vị
  explanation: string;   // Diễn giải
}

export interface BenchmarkDimension {
  id: string;
  name: string;          // Nội dung chiều người dùng tự đặt tên
  weight: number;        // Tỷ trọng %
  description?: string;
}

export interface BenchmarkConfigProfile {
  id: string;
  title: string;
  dimensionCount: number; // Mặc định 5D, có thể tùy chọn 3D-7D
  dimensions: BenchmarkDimension[];
  isDefault?: boolean;
  notes?: string;
}

export interface SystemIdRule {
  candidatePrefix: string;       // e.g. "CAND-" or "UV-"
  candidateStartNumber: number;  // e.g. 10001
  jobPrefix: string;             // e.g. "JOB-"
  jobStartNumber: number;        // e.g. 201
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'Super Admin' | 'HR Director' | 'Senior Recruiter';
  status: 'Active' | 'Inactive';
}

export interface OrgNode {
  id: string;
  name: string;          // Tên đơn vị / Phòng ban / Đội ngũ
  code: string;          // Mã định danh
  parentId?: string | null; // Cấp trên trực tiếp (null nếu là gốc)
  leaderName: string;    // Người đứng đầu / Lãnh đạo
  leaderTitle: string;   // Chức danh lãnh đạo
  headCount: number;     // Định biên nhân sự
  headcountQuota?: number; // Chỉ tiêu định biên được duyệt
  currentHeadcount?: number; // Số nhân sự thực tế hiện có
  openPositions?: number;    // Vị trí đang mở tuyển dụng
  description?: string;  // Chức năng nhiệm vụ
  level: number;         // 1: Ban Lãnh Đạo, 2: Khối/Phòng, 3: Đội ngũ/Team
  color?: string;
}

export interface AdminSettings {
  companyName: string;
  departments: DepartmentItem[];
  customIdRules?: CustomIdRuleItem[];
  idRule: SystemIdRule;
  minBenchmarkQualifiedScore: number;
  benchmarkProfiles?: BenchmarkConfigProfile[];
  activeBenchmarkProfileId?: string;
  orgChartNodes?: OrgNode[];
  benchmarkWeights: {
    technicalSkills: number;  // percentage e.g. 40
    experience: number;       // percentage e.g. 30
    education: number;        // percentage e.g. 15
    culturalFit: number;      // percentage e.g. 15
  };
  allowPublicApplication: boolean;
  autoNotifyEmail: boolean;
  autoAssignRecruiter: boolean;
  adminUsers: AdminUser[];
  contacts?: GoogleContact[];
}

export interface GoogleContact {
  id: string;
  name: string; // Họ và tên đầy đủ
  givenName?: string; // Tên (First Name)
  additionalName?: string; // Tên đệm (Middle Name)
  familyName?: string; // Họ (Last Name)
  namePrefix?: string; // Tiền tố / Danh xưng (Ông, Bà, Anh, Chị, TS, ...)
  nickname?: string; // Biệt danh
  email: string; // Email chính (E-mail 1 - Value)
  emailType?: string; // Loại email (Work, Home, Other)
  secondaryEmail?: string;
  phone: string; // Điện thoại chính (Phone 1 - Value)
  phoneType?: string; // Loại điện thoại (Mobile, Work, Home)
  secondaryPhone?: string;
  organization?: string; // Công ty / Cơ quan (Organization 1 - Name)
  jobTitle?: string; // Chức danh (Organization 1 - Title)
  department?: string; // Phòng ban (Organization 1 - Department)
  notes?: string; // Ghi chú (Notes)
  groupMembership?: string; // Nhóm liên hệ (Group Membership / Labels)
  address?: string; // Địa chỉ (Address 1 - Formatted)
  birthday?: string; // Ngày sinh (YYYY-MM-DD)
  gender?: string; // Giới tính (Nam, Nữ, Khác)
  website?: string; // Website / LinkedIn
  createdAt?: string;
}

export interface GlobalSearchFilter {
  query: string;
  department: string;
  minBenchmark: number;
  stage: string;
}
