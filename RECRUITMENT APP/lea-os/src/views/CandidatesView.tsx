import React, { useState } from 'react';
import { extractText } from '../lib/extract';
import { nextCandidateId } from '../lib/seico';
import { getAdminSettingsRef } from '../lib/api';
import {
  Users,
  Search,
  UploadCloud,
  Star,
  FileText,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Award,
  Filter,
  Eye,
  X,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
  ChevronDown,
  Edit3,
  Edit2,
  ArrowLeftRight,
  CheckSquare,
  Square,
  Copy,
  Check,
  RotateCcw,
  Briefcase,
  ChevronRight,
  FileCheck2,
  Zap,
  Send,
  Download,
  BookUser,
} from 'lucide-react';
import { AppUser, Candidate, CandidateStage, GoogleContact, JobPosition } from '../types';

// 3.3: Màu sắc phân biệt chuẩn cho 5 giai đoạn phễu tuyển dụng
export const STAGE_CONFIG: Record<
  CandidateStage,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    dotColor: string;
    description: string;
  }
> = {
  'Mới nhận': {
    label: 'Mới nhận',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/60',
    badgeText: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-300 dark:border-sky-800',
    dotColor: 'bg-sky-500',
    description: 'Hồ sơ mới nạp vào hệ thống ATS, chờ xem xét',
  },
  'Đã thẩm định': {
    label: 'Đã thẩm định',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-300 dark:border-purple-800',
    dotColor: 'bg-purple-500',
    description: 'AI đã kiểm định benchmark & khớp yêu cầu cốt lõi',
  },
  'Phỏng vấn': {
    label: 'Phỏng vấn',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-300 dark:border-amber-800',
    dotColor: 'bg-amber-500',
    description: 'Đang lên lịch hoặc thực hiện phỏng vấn chuyên môn',
  },
  'Đề nghị việc': {
    label: 'Đề nghị việc',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    badgeBorder: 'border-emerald-300 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
    description: 'Đã thông qua đánh giá, gửi thư mời làm việc (Offer)',
  },
  'Đã từ chối': {
    label: 'Đã từ chối',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-300 dark:border-rose-800',
    dotColor: 'bg-rose-500',
    description: 'Hồ sơ chưa đạt benchmark hoặc ứng viên rút lui',
  },
};

// 3.1: Đảm bảo luôn trả về đầy đủ 10 câu hỏi phỏng vấn chuyên sâu
export const getTenInterviewQuestions = (candidate: Candidate): string[] => {
  const current = candidate.interviewQuestions || [];
  if (current.length >= 10) return current.slice(0, 10);

  const fallbackQuestions = [
    `Hãy chia sẻ về một dự án thực chiến tiêu biểu nhất cho vị trí ${candidate.jobTitle} mà bạn từng làm nòng cốt kỹ thuật?`,
    `Khi đối mặt với yêu cầu nghiệp vụ thay đổi liên tục hoặc thiếu tài liệu đặc tả, phương pháp làm việc và quản trị rủi ro của bạn là gì?`,
    `Bạn giải quyết thế nào khi xảy ra xung đột quan điểm kỹ thuật hoặc kiến trúc giải pháp với đồng nghiệp/Tech Lead?`,
    `Bạn từng thực hiện giải pháp tối ưu hiệu năng hoặc cải tiến quy trình nào mang lại kết quả định lượng rõ rệt nhất?`,
    `Hãy mô tả phương pháp bạn tự học và làm chủ một công nghệ/công cụ mới khi dự án yêu cầu áp dụng khẩn cấp?`,
    `Phương pháp bạn kiểm thử, rà soát chất lượng mã nguồn và xử lý sự cố khẩn cấp trên môi trường Production?`,
    `Kinh nghiệm của bạn trong việc chia sẻ kiến thức, review code và nâng cao năng lực cho các thành viên trong đội ngũ?`,
    `Theo bạn, thách thức lớn nhất của vị trí ${candidate.jobTitle} trong kỷ nguyên ứng dụng AI hiện nay là gì?`,
    `Kỳ vọng của bạn về môi trường làm việc lý tưởng, phong cách quản lý và văn hóa phối hợp tại công ty?`,
    `Mục tiêu phát triển nghề nghiệp và cam kết gắn bó của bạn trong lộ trình 2 - 3 năm tới tại tổ chức là gì?`,
  ];

  const merged = [...current];
  for (const q of fallbackQuestions) {
    if (merged.length >= 10) break;
    if (!merged.includes(q)) merged.push(q);
  }
  return merged.slice(0, 10);
};

interface CandidatesViewProps {
  driveImportSlot?: React.ReactNode;
  candidates: Candidate[];
  jobs: JobPosition[];
  onAddCandidate: (candidate: Candidate) => void;
  onUpdateCandidateStage: (candidateId: string, stage: CandidateStage) => void;
  onUpdateCandidateNotes: (candidateId: string, notes: string) => void;
  onUpdateCandidateName?: (candidateId: string, newName: string) => void;
  selectedCandidateDetail: Candidate | null;
  onSelectCandidateDetail: (candidate: Candidate | null) => void;
  initialFilterStage?: CandidateStage | 'all';
  initialFilterJobId?: string | 'all';
  currentUser?: AppUser;
  contacts?: GoogleContact[];
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  candidates,
  jobs,
  onAddCandidate,
  onUpdateCandidateStage,
  onUpdateCandidateNotes,
  onUpdateCandidateName,
  selectedCandidateDetail,
  onSelectCandidateDetail,
  initialFilterStage = 'all',
  initialFilterJobId = 'all',
  currentUser,
  contacts = [],
  driveImportSlot,
}) => {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobId, setFilterJobId] = useState<string>(initialFilterJobId);
  const [filterStage, setFilterStage] = useState<string>(initialFilterStage);
  const [filterScore, setFilterScore] = useState<string>('all');

  // Candidate Comparison State (Requirement #1)
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonJobId, setComparisonJobId] = useState<string>(jobs[0]?.id || '');
  const [selectedComparisonCandidateIds, setSelectedComparisonCandidateIds] = useState<string[]>([]);

  // -------------------------------------------------------------------------
  // 3.4: 4-STEP WIZARD (Người dùng upload CV -> chọn JD -> AI phân tích -> Báo cáo)
  // -------------------------------------------------------------------------
  const [uploadStep, setUploadStep] = useState<1 | 2 | 3 | 4>(1);
  const [dragActive, setDragActive] = useState(false);
  const [pendingCv, setPendingCv] = useState<{
    name: string;
    text: string;
    size?: string;
  } | null>(null);
  const [selectedJdId, setSelectedJdId] = useState<string>(jobs[0]?.id || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingPhase, setAnalyzingPhase] = useState<string>('Khởi động');
  const [analyzingProgress, setAnalyzingProgress] = useState<number>(0);
  const [latestAnalysis, setLatestAnalysis] = useState<any | null>(null);
  const [createdCandidate, setCreatedCandidate] = useState<Candidate | null>(null);
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);

  // Notes editor inside detail drawer
  const [editingNotes, setEditingNotes] = useState('');

  // 3.2: Inline Candidate Name Editing inside Detail Popup
  const [isEditingCandidateName, setIsEditingCandidateName] = useState(false);
  const [editedCandidateName, setEditedCandidateName] = useState('');
  const [copiedDetailQuestionIdx, setCopiedDetailQuestionIdx] = useState<number | null>(null);

  // 1.3: Chuyển tiếp thông tin Modal State & Draft
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardCandidate, setForwardCandidate] = useState<Candidate | null>(null);
  const [forwardRecipientEmail, setForwardRecipientEmail] = useState('');
  const [forwardRecipientContactId, setForwardRecipientContactId] = useState('');
  const [forwardSubject, setForwardSubject] = useState('');
  const [forwardBody, setForwardBody] = useState('');
  const [forwardToast, setForwardToast] = useState<string | null>(null);

  // Helper tính tỷ lệ % phân bổ cho các tiêu chí của JD (tổng 100%)
  const getJobCriteriaWithPercentages = (job: JobPosition) => {
    const list = job.requirements || [];
    if (list.length === 0) {
      return [
        { name: 'Kỹ năng chuyên môn cốt lõi theo vị trí', percent: 35 },
        { name: 'Kinh nghiệm thực chiến triển khai dự án', percent: 25 },
        { name: 'Kiến trúc giải pháp & Tối ưu hiệu năng', percent: 20 },
        { name: 'Kỹ năng phối hợp, giao tiếp & Văn hóa đội ngũ', percent: 20 },
      ];
    }
    const total = list.length;
    const weights: number[] = [];
    if (total === 1) {
      weights.push(100);
    } else if (total === 2) {
      weights.push(60, 40);
    } else if (total === 3) {
      weights.push(45, 30, 25);
    } else if (total === 4) {
      weights.push(35, 25, 20, 20);
    } else if (total === 5) {
      weights.push(30, 25, 20, 15, 10);
    } else {
      const base = Math.floor(100 / total);
      const rem = 100 - base * total;
      for (let i = 0; i < total; i++) {
        weights.push(base + (i === 0 ? rem : 0));
      }
    }
    return list.map((req, idx) => ({
      name: req,
      percent: weights[idx] ?? Math.round(100 / total),
    }));
  };

  // 1.2: Tải xuống các câu hỏi phỏng vấn đề xuất dạng file .txt
  const handleDownloadQuestions = (cand?: Candidate | null) => {
    const targetCandidate = cand || createdCandidate || candidates[0];
    if (!targetCandidate) return;
    const questions = getTenInterviewQuestions(targetCandidate);
    const content = `======================================================================
TALENTFLOW ATS - BỘ 10 CÂU HỎI PHỎNG VẤN CHUYÊN SÂU AI ĐỀ XUẤT
======================================================================

Ứng viên: ${targetCandidate.fullName}
Mã ứng viên: ${targetCandidate.id}
Vị trí ứng tuyển: ${targetCandidate.jobTitle}
Điểm Benchmark: ${targetCandidate.benchmarkScore.toFixed(1)} / 5.0 ⭐
Đề xuất tuyển dụng: ${targetCandidate.recommendation}
Thời gian tạo: ${new Date().toLocaleString('vi-VN')}

DANH SÁCH 10 CÂU HỎI PHỎNG VẤN THỰC CHIẾN DÀNH RIÊNG CHO ỨNG VIÊN:
----------------------------------------------------------------------
${questions.map((q, idx) => `[Câu hỏi ${idx + 1}]:\n${q}\n`).join('\n')}
----------------------------------------------------------------------
Gợi ý cho Hội đồng phỏng vấn:
- Điểm mạnh nổi bật cần kiểm chứng: ${targetCandidate.strengths.join(', ')}
- Vấn đề / Rủi ro cần đào sâu: ${targetCandidate.gapsOrRisks.join(', ')}
- Kỹ năng cốt lõi đã khớp: ${targetCandidate.matchedSkills.join(', ')}

© SEICO Recruitment app - Xuất bản tự động
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `10_Cau_Hoi_Phong_Van_${targetCandidate.id}_${targetCandidate.fullName.replace(/\\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1.3: Tạo nội dung báo cáo phân tích tự động cho email chuyển tiếp
  const generateForwardEmailContent = (cand: Candidate) => {
    const questions = getTenInterviewQuestions(cand);
    return `Kính gửi Anh/Chị,

Hệ thống Tuyển dụng SEICO Recruitment trân trọng gửi báo cáo đối chiếu năng lực ứng viên chi tiết như sau:

I. THÔNG TIN ỨNG VIÊN:
- Họ và tên: ${cand.fullName}
- Mã hồ sơ: ${cand.id}
- Vị trí ứng tuyển: ${cand.jobTitle}
- Email: ${cand.email} | Điện thoại: ${cand.phone}
- Ngày nộp: ${cand.appliedDate} | Nguồn: ${cand.source}

II. KẾT QUẢ ĐỐI SOÁT BENCHMARK AI:
- Điểm đánh giá tổng hợp: ${cand.benchmarkScore.toFixed(1)} / 5.0 ⭐
- Đề xuất tuyển dụng: ${
      cand.recommendation === 'Strong Hire'
        ? 'RẤT NÊN TUYỂN (STRONG HIRE)'
        : cand.recommendation === 'Interview'
        ? 'MỜI PHỎNG VẤN (INTERVIEW)'
        : 'CÂN NHẮC VÒNG SAU'
    }
- Điểm Chuyên môn kỹ thuật: ${cand.matrixMatch.skillsScore.toFixed(1)} / 5.0
- Điểm Kinh nghiệm thực chiến: ${cand.matrixMatch.experienceScore.toFixed(1)} / 5.0
- Điểm Bằng cấp & Chứng chỉ: ${cand.matrixMatch.educationScore.toFixed(1)} / 5.0
- Điểm Phù hợp văn hóa: ${cand.matrixMatch.cultureScore.toFixed(1)} / 5.0

III. KỸ NĂNG & ĐÁNH GIÁ CHUYÊN MÔN:
- Kỹ năng đã đáp ứng (${cand.matchedSkills.length}): ${cand.matchedSkills.join(', ')}
- Kỹ năng cần đào sâu: ${cand.missingSkills && cand.missingSkills.length > 0 ? cand.missingSkills.join(', ') : 'Đã thỏa mãn đầy đủ yêu cầu chính của JD'}
- Điểm mạnh nổi bật: ${cand.strengths.join('; ')}
- Điểm cần lưu ý / Đào sâu: ${cand.gapsOrRisks.join('; ')}

IV. 10 CÂU HỎI PHỎNG VẤN CHUYÊN SÂU AI ĐỀ XUẤT:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

V. GHI CHÚ NỘI BỘ:
${cand.notes ? cand.notes : 'Chưa có ghi chú bổ sung.'}

---
Email được chuyển tiếp tự động từ hệ thống SEICO Recruitment bởi thành viên: ${currentUser?.fullName || 'Người dùng hệ thống'} (${currentUser?.email || 'dangductuan.7@gmail.com'}).`;
  };

  // Mở popup chuyển tiếp thông tin
  const handleOpenForwardModal = (cand: Candidate) => {
    setForwardCandidate(cand);
    setForwardRecipientEmail('');
    setForwardRecipientContactId('');
    setForwardSubject(`[SEICO Recruitment] Báo Cáo Phân Tích & Đối Chiếu Năng Lực Ứng Viên: ${cand.fullName} - ${cand.jobTitle}`);
    setForwardBody(generateForwardEmailContent(cand));
    setIsForwardModalOpen(true);
  };

  // 1.3: Hủy bỏ -> Xóa hoàn toàn bản nháp đã soạn sẵn
  const handleCancelForward = () => {
    setForwardCandidate(null);
    setForwardRecipientEmail('');
    setForwardRecipientContactId('');
    setForwardSubject('');
    setForwardBody('');
    setIsForwardModalOpen(false);
  };

  // Chọn người liên hệ từ danh bạ đã lưu
  const handleSelectContactForForward = (contactId: string) => {
    setForwardRecipientContactId(contactId);
    if (!contactId) return;
    const found = contacts.find((c) => c.id === contactId);
    if (found && found.email) {
      setForwardRecipientEmail(found.email);
    }
  };

  // 1.3: Xác nhận gửi email -> sử dụng email thành viên gửi email
  const handleConfirmForward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forwardRecipientEmail.trim()) {
      alert('Vui lòng nhập email người nhận hoặc chọn từ danh bạ đã lưu.');
      return;
    }
    const body = `${forwardSubject || ''}\n\n${(forwardBody as any) || ''}`;
    navigator.clipboard?.writeText(body).catch(() => {});
    setForwardToast(`Đã soạn và sao chép báo cáo ứng viên [${forwardCandidate?.fullName}] để gửi [${forwardRecipientEmail.trim()}]. Hệ thống KHÔNG tự gửi email; chỉ chuyển cho thành viên Hội đồng tuyển dụng (QT-05).`);
    setTimeout(() => setForwardToast(null), 5000);
    handleCancelForward();
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((cand) => {
    const matchesSearch =
      cand.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cand.matchedSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesJob = filterJobId === 'all' || cand.jobId === filterJobId;
    const matchesStage = filterStage === 'all' || cand.stage === filterStage;

    let matchesScore = true;
    if (filterScore === 'high') matchesScore = cand.benchmarkScore >= 4.5;
    else if (filterScore === 'good') matchesScore = cand.benchmarkScore >= 4.0 && cand.benchmarkScore < 4.5;
    else if (filterScore === 'medium') matchesScore = cand.benchmarkScore < 4.0;

    return matchesSearch && matchesJob && matchesStage && matchesScore;
  });

  // Handle Open Comparison Modal (Requirement #1)
  const handleOpenComparison = (jobId?: string, defaultCandidateId?: string) => {
    const targetJobId = jobId || (filterJobId !== 'all' ? filterJobId : jobs[0]?.id || '');
    setComparisonJobId(targetJobId);

    const jobCandidates = candidates.filter((c) => c.jobId === targetJobId);
    let selectedIds: string[] = [];
    if (defaultCandidateId) {
      selectedIds = [
        defaultCandidateId,
        ...jobCandidates.filter((c) => c.id !== defaultCandidateId).map((c) => c.id),
      ].slice(0, 3);
    } else {
      selectedIds = jobCandidates.slice(0, 3).map((c) => c.id);
    }

    setSelectedComparisonCandidateIds(selectedIds);
    setIsComparisonModalOpen(true);
  };

  // 3.4 - Step 1: Handle File Selection (Drop / Input)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await loadCvFileIntoWizard(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await loadCvFileIntoWizard(file);
    }
  };

  const loadCvFileIntoWizard = async (file: File) => {
    let fileText = '';
    try {
      fileText = await extractText(file);
    } catch (err: any) {
      alert(err?.message || 'Không đọc được tệp CV.');
      return;
    }
    if (!fileText || fileText.trim().length < 80) {
      alert('Không trích được chữ từ tệp này (có thể là bản quét). Hãy dùng tệp PDF có chữ, DOCX hoặc ảnh rõ nét.');
      return;
    }

    setPendingCv({
      name: file.name,
      text: fileText,
      size: `${(file.size / 1024).toFixed(0)} KB`,
    });
    // Move to Step 2: Lựa chọn đối chiếu theo JD
    setUploadStep(2);
  };

  // 3.4 - Step 1: Quick Load Sample CV
  const handleSelectDemoCv = (demoType: 'senior_fe' | 'golang_be' | 'uiux' | 'pm') => {
    let sampleText = '';
    let demoFileName = '';
    let matchedJobId = jobs[0]?.id || '';

    if (demoType === 'senior_fe') {
      const j = jobs.find((item) => item.title.includes('Frontend')) || jobs[0];
      matchedJobId = j.id;
      demoFileName = 'CV_PhamHoangNam_Senior_React.pdf';
      sampleText = `HỌ VÀ TÊN: PHẠM HOÀNG NAM
Email: nam.phamhoang@techmail.vn | SĐT: 0918 333 444
Kinh nghiệm: 5 năm Senior Frontend Developer
Kỹ năng: React 19, TypeScript, Tailwind CSS, Next.js, Redux Toolkit, Web Performance, Micro-frontend, CI/CD.
Học vấn: Đại học Bách Khoa Hà Nội - Công nghệ thông tin (Loại Giỏi).
Kinh nghiệm thực chiến: Từng dẫn dắt đội ngũ 6 kỹ sư frontend tối ưu hệ thống thanh toán với Core Web Vitals đạt 95+.`;
    } else if (demoType === 'golang_be') {
      const j = jobs.find((item) => item.title.includes('Backend')) || jobs[1] || jobs[0];
      matchedJobId = j.id;
      demoFileName = 'Resume_VuDinhTung_Golang_Microservices.pdf';
      sampleText = `HỌ VÀ TÊN: VŨ ĐÌNH TÙNG
Email: tung.vudinh.dev@gmail.com | Phone: 0987 112 233
Kinh nghiệm: 3.5 năm Backend Golang & Node.js
Kỹ năng: Golang, PostgreSQL, Redis, Docker, Kubernetes, gRPC, Kafka, Event-driven architecture.
Học vấn: Học viện Công nghệ Bưu chính Viễn thông.
Thành tích: Thiết kế kiến trúc chịu tải 10.000 QPS, giảm thời gian xử lý đơn hàng xuống dưới 50ms.`;
    } else if (demoType === 'uiux') {
      const j = jobs.find((item) => item.title.includes('Designer')) || jobs[3] || jobs[0];
      matchedJobId = j.id;
      demoFileName = 'Portfolio_NguyenBaoNgoc_ProductDesigner.pdf';
      sampleText = `HỌ VÀ TÊN: NGUYỄN BẢO NGỌC
Email: ngoc.baongoc.design@gmail.com | Portfolio: behance.net/baongoc
Kinh nghiệm: 3 năm UI/UX Product Designer
Kỹ năng: Figma, Design Tokens, User Flow, Wireframing, Usability Testing, WCAG 2.1 Accessibility, Design System.
Học vấn: Đại học Mỹ thuật Công nghiệp Hà Nội.
Thành tựu: Xây dựng thư viện Design System với 80+ components chuẩn Figma Variables.`;
    } else {
      const j = jobs.find((item) => item.title.includes('Product Manager')) || jobs[2] || jobs[0];
      matchedJobId = j.id;
      demoFileName = 'CV_DangQuangHuy_Senior_PM.pdf';
      sampleText = `HỌ VÀ TÊN: ĐẶNG QUANG HUY
Email: quanghuy.dang@saaspm.com | SĐT: 0903 555 666
Kinh nghiệm: 5 năm B2B SaaS Product Manager
Kỹ năng: Product Roadmap, PRD, Data Analytics (SQL/Amplitude), Scrum/Agile, Customer Discovery, OKR.
Học vấn: Đại học Kinh tế Quốc dân (Khoa Quản trị Kinh doanh).
Thành tích: Đưa sản phẩm tăng trưởng ARR từ $200K lên $1.2M trong vòng 18 tháng.`;
    }

    setPendingCv({
      name: demoFileName,
      text: sampleText,
      size: '142 KB',
    });
    setSelectedJdId(matchedJobId);
    // Move to Step 2
    setUploadStep(2);
  };

  // 3.4 - Step 3: Trigger AI Analysis
  const handleStartAiAnalysis = async () => {
    if (!pendingCv) return;
    const targetJob = jobs.find((j) => j.id === selectedJdId) || jobs[0];

    setUploadStep(3);
    setIsAnalyzing(true);
    setAnalyzingProgress(15);
    setAnalyzingPhase('Đang đọc tệp và phân tách cấu trúc CV...');

    // Progress simulation
    const timer1 = setTimeout(() => {
      setAnalyzingProgress(45);
      setAnalyzingPhase(`Đang trích xuất kỹ năng & đối chiếu ma trận benchmark với JD [${targetJob.title}]...`);
    }, 600);

    const timer2 = setTimeout(() => {
      setAnalyzingProgress(80);
      setAnalyzingPhase('Đang chấm điểm 5 sao, đánh giá rủi ro & tạo 10 câu hỏi phỏng vấn...');
    }, 1200);

    try {
      const response = await fetch('/api/cv/analyze-benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: pendingCv.text,
          jobPosition: targetJob,
          candidateNameHint: pendingCv.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        }),
      });

      const analysis = await response.json();
      if (!response.ok) throw new Error(analysis.error || 'Không thể phân tích CV');

      setAnalyzingProgress(100);
      setAnalyzingPhase('Hoàn tất phân tích!');

      const newCandId = nextCandidateId(candidates, getAdminSettingsRef()?.idRule);

      const rawQuestions: string[] = analysis.interviewQuestions || [];
      const guaranteed10Questions =
        rawQuestions.length >= 10
          ? rawQuestions.slice(0, 10)
          : getTenInterviewQuestions({
              id: newCandId,
              jobId: targetJob.id,
              jobTitle: targetJob.title,
              fullName: analysis.candidateName || pendingCv.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
              email: analysis.candidateEmail || '',
              phone: analysis.candidatePhone || '',
              appliedDate: new Date().toISOString().split('T')[0],
              source: 'Tải File Trực Tiếp',
              resumeFileName: pendingCv.name,
              benchmarkScore: Number(analysis.benchmarkScore) || 0,
              matrixMatch: analysis.matrixMatch || {
                skillsScore: 4.2,
                experienceScore: 4.0,
                educationScore: 4.3,
                cultureScore: 4.0,
              },
              matchedSkills: analysis.matchedSkills || ['Kỹ năng chuyên môn cốt lõi'],
              missingSkills: analysis.missingSkills || [],
              strengths: analysis.strengths || ['Phù hợp với tiêu chuẩn tuyển dụng'],
              gapsOrRisks: analysis.gapsOrRisks || [],
              interviewQuestions: rawQuestions,
              stage: 'Mới nhận',
              recommendation: analysis.recommendation || 'Interview',
              summary: analysis.summary || 'Phân tích tự động',
              notes: '',
            });

      const newCandidate: Candidate = {
        id: newCandId,
        jobId: targetJob.id,
        jobTitle: targetJob.title,
        fullName: analysis.candidateName || pendingCv.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        email: analysis.candidateEmail || '',
        phone: analysis.candidatePhone || '',
        appliedDate: new Date().toISOString().split('T')[0],
        source: 'Tải File Trực Tiếp',
        resumeFileName: pendingCv.name,
        benchmarkScore: Number(analysis.benchmarkScore) || 0,
        matrixMatch: analysis.matrixMatch,
        dimensionScores: analysis.dimensionScores,
        benchmarkProfileTitle: analysis.benchmarkProfileTitle,
        matchedSkills: analysis.matchedSkills || [],
        missingSkills: analysis.missingSkills || [],
        strengths: analysis.strengths || [],
        gapsOrRisks: analysis.gapsOrRisks || [],
        interviewQuestions: guaranteed10Questions,
        stage: 'Mới nhận',
        recommendation: analysis.recommendation || 'Interview',
        summary: analysis.summary || '',
        notes: `Nạp qua tệp ${pendingCv.name} đối chiếu JD [${targetJob.title}] vào lúc ${new Date().toLocaleTimeString('vi-VN')}`,
        rawCvText: pendingCv.text,
      };

      // Add to global state
      onAddCandidate(newCandidate);
      setCreatedCandidate(newCandidate);
      setLatestAnalysis(analysis);

      // Transition to Step 4: Báo cáo phân tích
      setUploadStep(4);
    } catch (err) {
      console.error(err);
      alert((err as any)?.message || 'Có lỗi khi gọi AI phân tích CV.');
      setUploadStep(2);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsAnalyzing(false);
    }
  };

  const handleResetWizard = () => {
    setUploadStep(1);
    setPendingCv(null);
    setLatestAnalysis(null);
    setCreatedCandidate(null);
  };

  const handleCopyQuestion = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIdx(idx);
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  // 3.2: Save Edited Candidate Name
  const handleSaveCandidateName = (candId: string) => {
    if (!editedCandidateName.trim()) return;
    const trimmed = editedCandidateName.trim();
    if (onUpdateCandidateName) {
      onUpdateCandidateName(candId, trimmed);
    }
    if (selectedCandidateDetail && selectedCandidateDetail.id === candId) {
      onSelectCandidateDetail({
        ...selectedCandidateDetail,
        fullName: trimmed,
      });
    }
    setIsEditingCandidateName(false);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-[1720px] w-full mx-auto">
      {/* 1. Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1C1E] dark:text-white tracking-tight">
            Hồ Sơ Ứng Viên & Phân Tích Benchmark 5 Sao
          </h2>
          <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
            Quy trình đối chiếu AI khép kín 4 bước: Tải lên CV → Chọn JD đối chiếu → AI phân tích ma trận → Báo cáo chi tiết & 10 câu hỏi phỏng vấn.
          </p>
        </div>

        <div className="glass-panel flex items-center gap-2.5 text-xs text-[#3C3C43] dark:text-[#EBEBF5] px-4 py-2.5 rounded-full shrink-0">
          <span className="text-[#8E8E93] dark:text-[#98989D]">Tổng số hồ sơ trong hệ thống:</span>
          <strong className="font-mono text-[#007AFF] dark:text-[#0A84FF] text-sm tabular-nums">{candidates.length}</strong>
        </div>
      </div>

      {driveImportSlot}

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE 4-STEP WIZARD (3.4) */}
      {/* ========================================================================= */}
      <div className="glass-panel rounded-[26px] p-6 sm:p-7 space-y-6">
        {/* Wizard Step Progress Bar */}
        <div className="border-b border-black/[0.06] dark:border-white/[0.08] pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-[10px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Quy Trình Đối Chiếu Năng Lực Ứng Viên Bằng AI (4 Giai Đoạn)</span>
              </h3>
              <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
                Người dùng upload CV → Chọn JD đối chiếu → AI phân tích → Báo cáo phân tích toàn diện
              </p>
            </div>

            {uploadStep > 1 && (
              <button
                type="button"
                onClick={handleResetWizard}
                className="btn-fluent-glass inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs text-[#007AFF] dark:text-[#0A84FF] font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nạp CV Mới Khác</span>
              </button>
            )}
          </div>

          {/* Stepper Header Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div
              className={`p-3.5 rounded-[18px] border transition-all ${
                uploadStep === 1
                  ? 'bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 border-[#007AFF]/40 text-[#007AFF] dark:text-[#0A84FF] shadow-xs'
                  : uploadStep > 1
                  ? 'bg-[#34C759]/10 dark:bg-[#30D158]/15 border-[#34C759]/30 text-[#248A3D] dark:text-[#30D158]'
                  : 'neumorphic-inset text-[#8E8E93] dark:text-[#98989D]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Bước 1</span>
                {uploadStep > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#34C759] dark:text-[#30D158]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#007AFF] dark:bg-[#0A84FF]" />
                )}
              </div>
              <p className="text-xs font-bold mt-1 text-[#1C1C1E] dark:text-white">1. Tải Lên CV</p>
              <span className="text-[11px] opacity-80 block truncate">
                {pendingCv ? pendingCv.name : 'PDF, DOCX, TXT'}
              </span>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3.5 rounded-[18px] border transition-all ${
                uploadStep === 2
                  ? 'bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 border-[#007AFF]/40 text-[#007AFF] dark:text-[#0A84FF] shadow-xs'
                  : uploadStep > 2
                  ? 'bg-[#34C759]/10 dark:bg-[#30D158]/15 border-[#34C759]/30 text-[#248A3D] dark:text-[#30D158]'
                  : 'neumorphic-inset text-[#8E8E93] dark:text-[#98989D]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Bước 2</span>
                {uploadStep > 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#34C759] dark:text-[#30D158]" />
                ) : uploadStep === 2 ? (
                  <span className="w-2 h-2 rounded-full bg-[#007AFF] dark:bg-[#0A84FF]" />
                ) : null}
              </div>
              <p className="text-xs font-bold mt-1 text-[#1C1C1E] dark:text-white">2. Chọn JD Đối Chiếu</p>
              <span className="text-[11px] opacity-80 block truncate">
                {jobs.find((j) => j.id === selectedJdId)?.title || 'Chọn vị trí tuyển dụng'}
              </span>
            </div>

            {/* Step 3 */}
            <div
              className={`p-3.5 rounded-[18px] border transition-all ${
                uploadStep === 3
                  ? 'bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 border-[#007AFF]/40 text-[#007AFF] dark:text-[#0A84FF] shadow-xs'
                  : uploadStep > 3
                  ? 'bg-[#34C759]/10 dark:bg-[#30D158]/15 border-[#34C759]/30 text-[#248A3D] dark:text-[#30D158]'
                  : 'neumorphic-inset text-[#8E8E93] dark:text-[#98989D]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Bước 3</span>
                {uploadStep > 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#34C759] dark:text-[#30D158]" />
                ) : uploadStep === 3 ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#007AFF] dark:text-[#0A84FF]" />
                ) : null}
              </div>
              <p className="text-xs font-bold mt-1 text-[#1C1C1E] dark:text-white">3. AI Phân Tích</p>
              <span className="text-[11px] opacity-80 block truncate">
                {uploadStep === 3 ? 'Đang chấm điểm...' : 'Đối soát ma trận'}
              </span>
            </div>

            {/* Step 4 */}
            <div
              className={`p-3.5 rounded-[18px] border transition-all ${
                uploadStep === 4
                  ? 'bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 border-[#007AFF]/40 text-[#007AFF] dark:text-[#0A84FF] shadow-xs'
                  : 'neumorphic-inset text-[#8E8E93] dark:text-[#98989D]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">Bước 4</span>
                {uploadStep === 4 && <Star className="w-4 h-4 text-[#FF9500] fill-[#FF9500]" />}
              </div>
              <p className="text-xs font-bold mt-1 text-[#1C1C1E] dark:text-white">4. Báo Cáo Phân Tích</p>
              <span className="text-[11px] opacity-80 block truncate">
                {uploadStep === 4 ? 'Scorecard & 10 câu hỏi' : 'Kết quả chi tiết'}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1 CONTENT: UPLOAD CV FILE OR CHOOSE REALISTIC DEMO CV */}
        {/* ========================================================================= */}
        {uploadStep === 1 && (
          <div className="space-y-5">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-[22px] p-8 text-center transition-all ${
                dragActive
                  ? 'border-[#007AFF] bg-[#007AFF]/10'
                  : 'border-black/15 dark:border-white/15 hover:border-[#007AFF] bg-white/40 dark:bg-white/[0.03]'
              }`}
            >
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 rounded-[18px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center mx-auto shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                    Kéo thả file CV (PDF, DOCX, TXT) vào đây
                  </p>
                  <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
                    Hệ thống sẽ chuyển sang bước chọn JD mục tiêu để đối chiếu benchmark chính xác.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <label className="btn-fluent-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white rounded-full cursor-pointer">
                    <FileText className="w-4 h-4" />
                    <span>Chọn Tệp CV Từ Máy Tính</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2 CONTENT: SELECT TARGET JD TO BENCHMARK AGAINST */}
        {/* ========================================================================= */}
        {uploadStep === 2 && pendingCv && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Loaded CV Info Strip */}
            <div className="p-4 bg-[#34C759]/10 dark:bg-[#30D158]/15 border border-[#34C759]/30 rounded-[18px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-[#34C759] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#248A3D] dark:text-[#30D158]">
                    Đã nạp tệp CV thành công (Bước 1)
                  </span>
                  <p className="text-xs font-bold text-[#1C1C1E] dark:text-white">
                    {pendingCv.name} {pendingCv.size && `(${pendingCv.size})`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setUploadStep(1)}
                className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline self-start sm:self-auto cursor-pointer"
              >
                Đổi Tệp CV Khác
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#1C1C1E] dark:text-white uppercase tracking-wider mb-1.5">
                Bước 2: Lựa Chọn Bản Mô Tả Công Việc (JD) Mục Tiêu Để Đối Chiếu (1.1)
              </h4>
              <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mb-4">
                Chọn một vị trí JD bên trái để xem chi tiết đầy đủ bên phải bao gồm mã JD, Khối/ban, Vị trí, mô tả ngắn, số lượng tiêu chí, tên từng tiêu chí và tỷ lệ phần trăm trọng số benchmark.
              </p>

              {/* 1.1: CHIA 2 PHẦN: BÊN TRÁI DANH MỤC THẺ JD, BÊN PHẢI NỘI DUNG CHI TIẾT & TIÊU CHÍ % */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* BÊN TRÁI: Danh mục thẻ các JD gồm Tên và Khoảng lương */}
                <div className="lg:col-span-5 space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-[#8E8E93] dark:text-[#98989D] uppercase tracking-wider">
                      Danh Mục Vị Trí ({jobs.length})
                    </span>
                    <span className="text-[10px] text-[#8E8E93]">
                      Click để chọn đối chiếu
                    </span>
                  </div>

                  {jobs.map((job) => {
                    const isSelected = selectedJdId === job.id;
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJdId(job.id)}
                        className={`p-3.5 rounded-[18px] border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#007AFF] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 shadow-xs ring-1 ring-[#007AFF]/30'
                            : 'border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04] hover:border-[#007AFF]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="space-y-1 flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-[#1C1C1E] dark:text-white line-clamp-1">
                              {job.title}
                            </h5>
                            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] tabular-nums">
                              <span>{job.salaryRange}</span>
                            </div>
                          </div>

                          <div
                            className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isSelected
                                ? 'border-[#007AFF] bg-[#007AFF]'
                                : 'border-black/20 dark:border-white/25'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* BÊN PHẢI: Nội dung gồm mã JD, tên Khối/ban; Tên vị trí công việc; mô tả ngắn; số lượng tiêu chí; tên tiêu chí và phần trăm */}
                <div className="lg:col-span-7">
                  {(() => {
                    const selectedJob = jobs.find((j) => j.id === selectedJdId) || jobs[0];
                    if (!selectedJob) return null;
                    const criteriaList = getJobCriteriaWithPercentages(selectedJob);

                    return (
                      <div className="p-5 bg-white/80 dark:bg-white/[0.05] rounded-[22px] border border-[#007AFF]/25 dark:border-[#0A84FF]/30 shadow-xs space-y-4">
                        {/* Header: Mã JD & Tên Khối/ban */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold tabular-nums px-2.5 py-1 rounded-full bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF]">
                              Mã: {selectedJob.id}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#3C3C43] dark:text-[#EBEBF5]">
                              Khối / Ban: {selectedJob.department}
                            </span>
                          </div>

                          <span className="font-mono text-xs font-bold tabular-nums text-[#007AFF] dark:text-[#0A84FF]">
                            {selectedJob.salaryRange}
                          </span>
                        </div>

                        {/* Tên vị trí công việc */}
                        <div>
                          <span className="text-[10px] font-semibold text-[#8E8E93] dark:text-[#98989D] uppercase tracking-wider block">
                            Tên Vị Trí Công Việc:
                          </span>
                          <h4 className="text-base font-bold text-[#1C1C1E] dark:text-white mt-0.5">
                            {selectedJob.title}
                          </h4>
                        </div>

                        {/* Mô tả ngắn */}
                        <div>
                          <span className="text-[10px] font-semibold text-[#8E8E93] dark:text-[#98989D] uppercase tracking-wider block">
                            Mô Tả Ngắn:
                          </span>
                          <p className="text-xs text-[#3C3C43] dark:text-[#EBEBF5] leading-relaxed mt-1 p-3.5 neumorphic-inset rounded-[14px]">
                            {selectedJob.summary}
                          </p>
                        </div>

                        {/* Số lượng tiêu chí; Tên tiêu chí và phần trăm */}
                        <div className="space-y-2.5 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1C1C1E] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                              <span>
                                Số Lượng Tiêu Chí: <strong>{criteriaList.length} tiêu chí</strong>
                              </span>
                            </span>
                            <span className="text-[11px] font-mono font-bold tabular-nums text-[#248A3D] dark:text-[#30D158] px-2.5 py-0.5 rounded-full bg-[#34C759]/12">
                              Tổng: 100%
                            </span>
                          </div>

                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {criteriaList.map((crit, idx) => (
                              <div
                                key={idx}
                                className="p-3 neumorphic-inset rounded-[14px] text-xs space-y-1.5 hover:ring-1 hover:ring-[#007AFF]/40 transition-all"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span className="font-medium text-[#1C1C1E] dark:text-[#EBEBF5]">
                                      {crit.name}
                                    </span>
                                  </div>
                                  <span className="font-mono font-bold tabular-nums text-[#007AFF] dark:text-[#0A84FF] shrink-0 text-xs px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-white/10 shadow-2xs">
                                    {crit.percent}%
                                  </span>
                                </div>
                                <div className="w-full bg-black/[0.06] dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#007AFF] dark:bg-[#0A84FF] h-full rounded-full transition-all duration-300"
                                    style={{ width: `${crit.percent}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setUploadStep(1)}
                className="btn-fluent-glass px-4 py-2 rounded-full text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5] cursor-pointer"
              >
                ← Quay Lại Bước 1
              </button>

              <button
                type="button"
                onClick={handleStartAiAnalysis}
                className="btn-fluent-primary inline-flex items-center gap-2 px-6 py-2.5 text-white text-xs font-semibold rounded-full cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tiến Hành AI Đối Chiếu Phân Tích (Bước 3) →</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3 CONTENT: AI ANALYZING IN PROGRESS */}
        {/* ========================================================================= */}
        {uploadStep === 3 && (
          <div className="py-12 px-6 text-center max-w-lg mx-auto space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-[20px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center mx-auto shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h4 className="text-base font-bold text-[#1C1C1E] dark:text-white">
                AI Đang Phân Tích & Chấm Điểm Benchmark
              </h4>
              <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
                {analyzingPhase}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/[0.06] dark:bg-white/[0.08] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#007AFF] to-[#5856D6] h-full transition-all duration-300 rounded-full"
                style={{ width: `${analyzingProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[11px] text-[#3C3C43] dark:text-[#EBEBF5] text-left pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] dark:text-[#30D158] shrink-0" />
                <span>Bóc tách kỹ năng lõi CV</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] dark:text-[#30D158] shrink-0" />
                <span>Đối soát ma trận benchmark</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] dark:text-[#30D158] shrink-0" />
                <span>Tính điểm sao & rủi ro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] dark:text-[#30D158] shrink-0" />
                <span>Tạo 10 câu hỏi phỏng vấn</span>
              </div>
            </div>

            {/* 1.2: Bổ sung nút tải xuống các câu hỏi phỏng vấn đề xuất */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => handleDownloadQuestions(createdCandidate)}
                className="btn-fluent-glass inline-flex items-center gap-2 px-5 py-2.5 text-[#007AFF] dark:text-[#0A84FF] rounded-full text-xs font-semibold cursor-pointer"
                title="Tải xuống 10 câu hỏi phỏng vấn đề xuất dạng file text"
              >
                <Download className="w-4 h-4" />
                <span>Tải Xuống 10 Câu Hỏi Phỏng Vấn Đề Xuất (.txt)</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4 CONTENT: COMPREHENSIVE BENCHMARK SCORECARD REPORT */}
        {/* ========================================================================= */}
        {uploadStep === 4 && createdCandidate && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Scorecard Header */}
            <div className="p-6 bg-gradient-to-br from-[#0A84FF] via-[#007AFF] to-[#5856D6] text-white rounded-[24px] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_16px_36px_-12px_rgba(0,122,255,0.42)] border border-white/25">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-white/85">
                  <span className="font-mono font-semibold text-white">
                    {createdCandidate.id}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Đối chiếu theo JD: <strong className="text-white">{createdCandidate.jobTitle}</strong>
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">
                  {createdCandidate.fullName}
                </h4>
                <p className="text-xs text-white/80">
                  {createdCandidate.email} · {createdCandidate.phone}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white/15 backdrop-blur-xl p-3.5 rounded-[18px] border border-white/25">
                <div className="text-center">
                  <span className="text-[10px] text-white/80 block font-medium">
                    Điểm Benchmark
                  </span>
                  <div className="flex items-center gap-1 text-[#FFD60A] font-bold font-mono text-2xl tabular-nums">
                    <Star className="w-5 h-5 fill-[#FFD60A]" />
                    <span>{createdCandidate.benchmarkScore.toFixed(1)}/5.0</span>
                  </div>
                </div>

                <div className="h-10 w-px bg-white/25" />

                <div>
                  <span className="text-[10px] text-white/80 block font-medium">
                    Đề Xuất Tuyển Dụng
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#007AFF] inline-block mt-1 shadow-xs">
                    {createdCandidate.recommendation === 'Strong Hire'
                      ? 'RẤT NÊN TUYỂN (STRONG HIRE)'
                      : createdCandidate.recommendation === 'Interview'
                      ? 'MỜI PHỎNG VẤN (INTERVIEW)'
                      : 'CÂN NHẮC VÒNG SAU'}
                  </span>
                </div>
              </div>
            </div>

            {/* Matrix Dimension Breakdown */}
            <div className="neumorphic-card p-5 rounded-[22px] space-y-4">
              <h5 className="text-[12px] font-bold text-[#1C1C1E] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
                <span>Ma Trận Năng Lực Đa Chiều Đối Chiếu Theo JD</span>
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-3.5 bg-white/85 dark:bg-white/[0.04] rounded-[16px] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
                  <div className="flex justify-between text-[12px] font-semibold">
                    <span className="text-[#3C3C43] dark:text-[#EBEBF5]">1. Chuyên Môn</span>
                    <span className="text-[#007AFF] dark:text-[#0A84FF] font-bold tabular-nums">
                      {createdCandidate.matrixMatch.skillsScore.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="w-full bg-[#767680]/15 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#007AFF] dark:bg-[#0A84FF] h-full rounded-full transition-all duration-300"
                      style={{ width: `${(createdCandidate.matrixMatch.skillsScore / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-white/85 dark:bg-white/[0.04] rounded-[16px] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
                  <div className="flex justify-between text-[12px] font-semibold">
                    <span className="text-[#3C3C43] dark:text-[#EBEBF5]">2. Kinh Nghiệm</span>
                    <span className="text-[#248A3D] dark:text-[#30D158] font-bold tabular-nums">
                      {createdCandidate.matrixMatch.experienceScore.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="w-full bg-[#767680]/15 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#34C759] dark:bg-[#30D158] h-full rounded-full transition-all duration-300"
                      style={{ width: `${(createdCandidate.matrixMatch.experienceScore / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-white/85 dark:bg-white/[0.04] rounded-[16px] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
                  <div className="flex justify-between text-[12px] font-semibold">
                    <span className="text-[#3C3C43] dark:text-[#EBEBF5]">3. Bằng Cấp</span>
                    <span className="text-[#AF52DE] dark:text-[#BF5AF2] font-bold tabular-nums">
                      {createdCandidate.matrixMatch.educationScore.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="w-full bg-[#767680]/15 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#AF52DE] dark:bg-[#BF5AF2] h-full rounded-full transition-all duration-300"
                      style={{ width: `${(createdCandidate.matrixMatch.educationScore / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-white/85 dark:bg-white/[0.04] rounded-[16px] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
                  <div className="flex justify-between text-[12px] font-semibold">
                    <span className="text-[#3C3C43] dark:text-[#EBEBF5]">4. Văn Hóa</span>
                    <span className="text-[#C93400] dark:text-[#FF9F0A] font-bold tabular-nums">
                      {createdCandidate.matrixMatch.cultureScore.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="w-full bg-[#767680]/15 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#FF9500] dark:bg-[#FF9F0A] h-full rounded-full transition-all duration-300"
                      style={{ width: `${(createdCandidate.matrixMatch.cultureScore / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Skills matched vs missing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 bg-[#34C759]/10 dark:bg-[#30D158]/10 rounded-[18px] border border-[#34C759]/20 space-y-2">
                  <span className="font-bold text-[#248A3D] dark:text-[#30D158] text-[12px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kỹ Năng Đã Đáp Ứng ({createdCandidate.matchedSkills.length}):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {createdCandidate.matchedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold text-[#248A3D] dark:text-[#30D158] bg-white/90 dark:bg-[#1C1C1E] border border-[#34C759]/25 px-2.5 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#FF9500]/10 dark:bg-[#FF9F0A]/10 rounded-[18px] border border-[#FF9500]/20 space-y-2">
                  <span className="font-bold text-[#C93400] dark:text-[#FF9F0A] text-[12px] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Kỹ Năng Còn Thiếu Hoặc Cần Làm Rõ:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {createdCandidate.missingSkills && createdCandidate.missingSkills.length > 0 ? (
                      createdCandidate.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold text-[#C93400] dark:text-[#FF9F0A] bg-white/90 dark:bg-[#1C1C1E] border border-[#FF9500]/25 px-2.5 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#8E8E93] dark:text-[#98989D] text-[12px] italic">
                        Đã thỏa mãn đầy đủ các yêu cầu cốt lõi của JD.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3.1: 10 AI Interview Questions Section */}
            <div className="neumorphic-card p-5 rounded-[22px] space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
                  <h5 className="text-[12px] font-bold text-[#1C1C1E] dark:text-white uppercase tracking-wider">
                    10 Câu Hỏi Phỏng Vấn Chuyên Sâu AI Đề Xuất Dành Riêng Cho Ứng Viên Này
                  </h5>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadQuestions(createdCandidate)}
                    className="btn-fluent-glass inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[#007AFF] dark:text-[#0A84FF] rounded-full text-[12px] font-semibold cursor-pointer"
                    title="Tải xuống 10 câu hỏi phỏng vấn đề xuất"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Xuống 10 Câu Hỏi (.txt)</span>
                  </button>
                  <span className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] px-2.5 py-1 rounded-full bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 border border-[#007AFF]/20 tabular-nums">
                    10 Câu Hỏi Chuẩn
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {getTenInterviewQuestions(createdCandidate).map((question, idx) => {
                  const isCopied = copiedQuestionIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#767680]/6 dark:bg-white/[0.04] rounded-[16px] border border-black/[0.05] dark:border-white/[0.07] flex items-start justify-between gap-3 text-[13px] leading-relaxed hover:border-[#007AFF]/35 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#007AFF] dark:bg-[#0A84FF] text-white font-bold text-[11px] tabular-nums flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-[#1C1C1E] dark:text-[#EBEBF5]">
                          {question}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyQuestion(question, idx)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#007AFF] hover:bg-[#007AFF]/10 cursor-pointer shrink-0 transition-colors"
                        title="Sao chép câu hỏi"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-[#34C759]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions for Step 4 */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[12px] text-[#8E8E93] dark:text-[#98989D] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                <span>Hồ sơ đã tự động được lưu trữ vào hệ thống ATS với mã CAND.</span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetWizard}
                  className="btn-fluent-glass px-4 py-2 rounded-full text-[12px] font-semibold text-[#1C1C1E] dark:text-white cursor-pointer whitespace-nowrap shrink-0"
                >
                  Phân Tích Thêm CV Khác
                </button>

                {/* 1.2: Tải xuống các câu hỏi phỏng vấn đề xuất */}
                <button
                  type="button"
                  onClick={() => handleDownloadQuestions(createdCandidate)}
                  className="btn-fluent-glass inline-flex items-center gap-1.5 px-4 py-2 text-[#248A3D] dark:text-[#30D158] text-[12px] font-semibold rounded-full cursor-pointer whitespace-nowrap shrink-0"
                  title="Tải xuống 10 câu hỏi phỏng vấn đề xuất (.txt)"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Tải Xuống 10 Câu Hỏi Đề Xuất (.txt)</span>
                </button>

                {/* 1.3: Chuyển tiếp thông tin */}
                <button
                  type="button"
                  onClick={() => handleOpenForwardModal(createdCandidate)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#007AFF]/12 hover:bg-[#007AFF]/20 text-[#007AFF] dark:text-[#0A84FF] border border-[#007AFF]/25 text-[12px] font-semibold rounded-full cursor-pointer transition-colors whitespace-nowrap shrink-0"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>Chuyển Tiếp Thông Tin</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectCandidateDetail(createdCandidate)}
                  className="btn-fluent-primary inline-flex items-center gap-1.5 px-5 py-2 text-[12px] font-semibold rounded-full cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>Mở Hồ Sơ Chi Tiết Ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Search & Filter Bar - iOS Liquid Glass Panel */}
      <div className="glass-panel p-4 rounded-[22px] flex flex-col xl:flex-row items-center gap-3">
        <div className="relative flex-1 w-full xl:min-w-[220px]">
          <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã CAND-XXXXX, họ tên, email, kỹ năng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-[13px] neumorphic-inset rounded-[12px] focus:outline-none text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto min-w-0">
          {/* Job Filter */}
          <select
            value={filterJobId}
            onChange={(e) => setFilterJobId(e.target.value)}
            className="text-[12px] font-medium py-2.5 px-3 neumorphic-inset rounded-[12px] text-[#1C1C1E] dark:text-white cursor-pointer focus:outline-none"
          >
            <option value="all">Tất cả vị trí</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          {/* Stage Filter */}
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="text-[12px] font-medium py-2.5 px-3 neumorphic-inset rounded-[12px] text-[#1C1C1E] dark:text-white cursor-pointer focus:outline-none"
          >
            <option value="all">Tất cả giai đoạn</option>
            <option value="Mới nhận">Mới nhận</option>
            <option value="Đã thẩm định">Đã thẩm định</option>
            <option value="Phỏng vấn">Phỏng vấn</option>
            <option value="Đề nghị việc">Đề nghị việc</option>
            <option value="Đã từ chối">Đã từ chối</option>
          </select>

          {/* Benchmark Score Filter */}
          <select
            value={filterScore}
            onChange={(e) => setFilterScore(e.target.value)}
            className="text-[12px] font-medium py-2.5 px-3 neumorphic-inset rounded-[12px] text-[#1C1C1E] dark:text-white cursor-pointer focus:outline-none"
          >
            <option value="all">Tất cả điểm sao</option>
            <option value="high">≥ 4.5 sao (Xuất sắc)</option>
            <option value="good">4.0 - 4.4 sao (Tốt)</option>
            <option value="medium">&lt; 4.0 sao (Cân nhắc)</option>
          </select>

          {/* Compare Button */}
          <button
            type="button"
            onClick={() => handleOpenComparison()}
            className="btn-fluent-glass inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-[#007AFF] dark:text-[#0A84FF] rounded-full cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>So Sánh (3 Ứng Viên)</span>
          </button>
        </div>
      </div>

      {/* 4. Comprehensive Candidate Table - iOS Liquid Glass Container */}
      <div className="glass-panel rounded-[26px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] min-w-[1100px]">
            <thead>
              <tr className="bg-[#767680]/6 dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.08] text-[#8E8E93] dark:text-[#98989D] text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-4 font-mono">Mã Số</th>
                <th className="py-3.5 px-4">Ứng Viên</th>
                <th className="py-3.5 px-4">Vị Trí Ứng Tuyển</th>
                <th className="py-3.5 px-4">Nguồn Tiếp Nhận</th>
                <th className="py-3.5 px-4">Điểm Benchmark (5 Sao)</th>
                <th className="py-3.5 px-4">Giai Đoạn Phễu</th>
                <th className="py-3.5 px-4 text-right">Thẩm Định & Chuyển Tiếp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8E8E93] dark:text-[#98989D] text-[13px]">
                    Không tìm thấy ứng viên nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => {
                  const scoreColor =
                    cand.benchmarkScore >= 4.5
                      ? 'text-[#248A3D] bg-[#34C759]/12 border border-[#34C759]/25 dark:text-[#30D158]'
                      : cand.benchmarkScore >= 4.0
                      ? 'text-[#007AFF] bg-[#007AFF]/10 border border-[#007AFF]/20 dark:text-[#0A84FF]'
                      : 'text-[#C93400] bg-[#FF9500]/12 border border-[#FF9500]/25 dark:text-[#FF9F0A]';

                  return (
                    <tr key={cand.id} className="hover:bg-[#007AFF]/[0.03] dark:hover:bg-white/[0.04] transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-semibold text-[#007AFF] dark:text-[#0A84FF] tabular-nums whitespace-nowrap">
                        {cand.id}
                      </td>

                      {/* Name & Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#1C1C1E] dark:text-white">{cand.fullName}</div>
                        <div className="text-[11px] text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                          {cand.email} · {cand.phone}
                        </div>
                      </td>

                      {/* Job Title */}
                      <td className="py-3.5 px-4 text-[#3C3C43] dark:text-[#EBEBF5] font-medium whitespace-nowrap">
                        <div className="font-semibold text-[#1C1C1E] dark:text-white">{cand.jobTitle}</div>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 text-[#8E8E93] dark:text-[#98989D] whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-[#767680]/10 dark:bg-white/[0.08] text-[#3C3C43] dark:text-[#EBEBF5] text-[11px] font-medium">{cand.source}</span>
                      </td>

                      {/* Benchmark Score (5 Stars) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold tabular-nums ${scoreColor}`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current text-[#FF9500]" />
                            <span>{cand.benchmarkScore.toFixed(1)}/5.0</span>
                          </div>

                          <div className="hidden lg:flex items-center gap-0.5 text-[#FF9500]">
                            {[1, 2, 3, 4, 5].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3 h-3 ${
                                  cand.benchmarkScore >= starIdx
                                    ? 'fill-[#FF9500] text-[#FF9500]'
                                    : cand.benchmarkScore >= starIdx - 0.5
                                    ? 'fill-[#FF9500]/40 text-[#FF9500]'
                                    : 'text-[#8E8E93]/35'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Stage Selector (3.3: Màu sắc phân biệt chuẩn) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              STAGE_CONFIG[cand.stage]?.dotColor || 'bg-[#8E8E93]'
                            }`}
                          />
                          <select
                            value={cand.stage}
                            onChange={(e) =>
                              onUpdateCandidateStage(cand.id, e.target.value as CandidateStage)
                            }
                            className={`text-[12px] py-1 px-2.5 rounded-[10px] font-semibold border cursor-pointer ${
                              STAGE_CONFIG[cand.stage]?.badgeBg || 'bg-[#767680]/10'
                            } ${STAGE_CONFIG[cand.stage]?.badgeText || 'text-[#3C3C43]'} ${
                              STAGE_CONFIG[cand.stage]?.badgeBorder || 'border-black/10'
                            }`}
                          >
                            <option value="Mới nhận">Mới nhận</option>
                            <option value="Đã thẩm định">Đã thẩm định</option>
                            <option value="Phỏng vấn">Phỏng vấn</option>
                            <option value="Đề nghị việc">Đề nghị việc</option>
                            <option value="Đã từ chối">Đã từ chối</option>
                          </select>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end whitespace-nowrap shrink-0">
                          {/* 1.2: Tải xuống 10 câu hỏi phỏng vấn */}
                          <button
                            type="button"
                            onClick={() => handleDownloadQuestions(cand)}
                            className="btn-fluent-glass inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] hover:text-[#007AFF] rounded-full cursor-pointer whitespace-nowrap shrink-0"
                            title="Tải xuống 10 câu hỏi phỏng vấn đề xuất (.txt)"
                          >
                            <Download className="w-3.5 h-3.5 shrink-0" />
                            <span className="hidden xl:inline">Tải câu hỏi</span>
                          </button>

                          {/* 1.3: Nút Chuyển tiếp thông tin nằm ngay phía trước nút Chi tiết */}
                          <button
                            type="button"
                            onClick={() => handleOpenForwardModal(cand)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 hover:bg-[#007AFF]/18 border border-[#007AFF]/20 rounded-full transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            title="Chuyển tiếp báo cáo phân tích năng lực ứng viên qua email"
                          >
                            <Send className="w-3.5 h-3.5 shrink-0" />
                            <span>Chuyển tiếp thông tin</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingNotes(cand.notes);
                              onSelectCandidateDetail(cand);
                            }}
                            className="btn-fluent-glass inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] rounded-full cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5 shrink-0" />
                            <span>Chi tiết</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Deep Benchmark Assessment Drawer / Modal */}
      {selectedCandidateDetail && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="glass-panel rounded-[26px] max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 sm:px-6 border-b border-black/[0.06] dark:border-white/[0.08] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums text-xs font-bold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 px-2.5 py-0.5 rounded-full">
                    {selectedCandidateDetail.id}
                  </span>
                  <span className="text-xs text-[#8E8E93] font-mono">
                    Nộp ngày {selectedCandidateDetail.appliedDate} · {selectedCandidateDetail.source}
                  </span>
                </div>

                {/* 3.2: Tính năng sửa tên ứng viên trong popup từ nút chi tiết */}
                <div className="mt-1.5">
                  {isEditingCandidateName ? (
                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        type="text"
                        value={editedCandidateName}
                        onChange={(e) => setEditedCandidateName(e.target.value)}
                        className="px-3 py-1.5 text-base font-bold text-[#1C1C1E] dark:text-white neumorphic-inset rounded-[12px] focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveCandidateName(selectedCandidateDetail.id)}
                        className="btn-fluent-primary w-8 h-8 rounded-full text-white flex items-center justify-center cursor-pointer"
                        title="Lưu họ tên mới"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingCandidateName(false)}
                        className="btn-fluent-glass w-8 h-8 rounded-full text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer"
                        title="Hủy"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                        {selectedCandidateDetail.fullName}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditedCandidateName(selectedCandidateDetail.fullName);
                          setIsEditingCandidateName(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:bg-[#007AFF]/15 cursor-pointer px-2.5 py-0.5 rounded-full bg-[#007AFF]/10 transition-colors"
                        title="Sửa tên ứng viên"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Sửa tên</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#8E8E93] mt-1">
                  <span>{selectedCandidateDetail.email}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{selectedCandidateDetail.phone}</span>
                  <span aria-hidden="true">·</span>
                  <span>Vị trí: <strong className="text-[#1C1C1E] dark:text-white">{selectedCandidateDetail.jobTitle}</strong></span>
                </div>
              </div>

              <button
                onClick={() => onSelectCandidateDetail(null)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs text-[#3C3C43] dark:text-[#EBEBF5]">
              {/* Score Highlight Strip */}
              <div className="bg-gradient-to-br from-[#0A84FF] via-[#007AFF] to-[#5856D6] text-white p-5 rounded-[22px] shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider block">
                    Điểm Tiêu Chuẩn Benchmark (Thang 5 Sao):
                  </span>
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <span className="text-3xl font-extrabold font-mono tabular-nums text-white">
                      {selectedCandidateDetail.benchmarkScore.toFixed(1)} / 5.0
                    </span>
                    <div className="flex items-center gap-1 text-[#FFD60A]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            selectedCandidateDetail.benchmarkScore >= star
                              ? 'fill-[#FFD60A] text-[#FFD60A]'
                              : 'text-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-[11px] text-white/80 uppercase tracking-wider font-semibold block mb-1.5">
                    Đề Xuất Tuyển Dụng:
                  </span>
                  <span className="inline-block px-3.5 py-1.5 bg-white/20 backdrop-blur-md border border-white/25 text-white font-bold rounded-full text-xs tracking-wide">
                    {selectedCandidateDetail.recommendation === 'Strong Hire'
                      ? 'RẤT NÊN TUYỂN (STRONG HIRE)'
                      : selectedCandidateDetail.recommendation === 'Interview'
                      ? 'MỜI PHỎNG VẤN (INTERVIEW)'
                      : selectedCandidateDetail.recommendation === 'Consider'
                      ? 'CÂN NHẮC VÒNG SAU'
                      : 'KHÔNG PHÙ HỢP'}
                  </span>
                </div>
              </div>

              {/* 4-Dimension Matrix Radar breakdown */}
              <div className="neumorphic-card p-5 rounded-[22px] space-y-3.5">
                <h4 className="font-bold text-[#1C1C1E] dark:text-white text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
                  <span>Ma Trận Năng Lực Đối Chiếu Tiêu Chuẩn JD (Thang 1.0 - 5.0 Sao)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Dim 1: Technical Skills */}
                  <div className="space-y-1.5 p-3 rounded-[14px] bg-[#F2F2F7]/70 dark:bg-white/[0.04]">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#3C3C43] dark:text-[#EBEBF5] font-medium">1. Kỹ năng chuyên môn cốt lõi</span>
                      <span className="font-mono tabular-nums font-bold text-[#007AFF] dark:text-[#0A84FF]">
                        {selectedCandidateDetail.matrixMatch.skillsScore.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="w-full bg-[#767680]/15 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#007AFF] h-full rounded-full"
                        style={{
                          width: `${(selectedCandidateDetail.matrixMatch.skillsScore / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Dim 2: Experience */}
                  <div className="space-y-1.5 p-3 rounded-[14px] bg-[#F2F2F7]/70 dark:bg-white/[0.04]">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#3C3C43] dark:text-[#EBEBF5] font-medium">2. Số năm kinh nghiệm thực chiến</span>
                      <span className="font-mono tabular-nums font-bold text-[#34C759] dark:text-[#30D158]">
                        {selectedCandidateDetail.matrixMatch.experienceScore.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="w-full bg-[#767680]/15 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#34C759] h-full rounded-full"
                        style={{
                          width: `${(selectedCandidateDetail.matrixMatch.experienceScore / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Dim 3: Education */}
                  <div className="space-y-1.5 p-3 rounded-[14px] bg-[#F2F2F7]/70 dark:bg-white/[0.04]">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#3C3C43] dark:text-[#EBEBF5] font-medium">3. Bằng cấp & chứng chỉ chuyên ngành</span>
                      <span className="font-mono tabular-nums font-bold text-[#AF52DE] dark:text-[#BF5AF2]">
                        {selectedCandidateDetail.matrixMatch.educationScore.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="w-full bg-[#767680]/15 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#AF52DE] h-full rounded-full"
                        style={{
                          width: `${(selectedCandidateDetail.matrixMatch.educationScore / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Dim 4: Culture */}
                  <div className="space-y-1.5 p-3 rounded-[14px] bg-[#F2F2F7]/70 dark:bg-white/[0.04]">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#3C3C43] dark:text-[#EBEBF5] font-medium">4. Độ phù hợp văn hóa & tác phong</span>
                      <span className="font-mono tabular-nums font-bold text-[#FF9500] dark:text-[#FF9F0A]">
                        {selectedCandidateDetail.matrixMatch.cultureScore.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="w-full bg-[#767680]/15 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#FF9500] h-full rounded-full"
                        style={{
                          width: `${(selectedCandidateDetail.matrixMatch.cultureScore / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#34C759]/8 rounded-[18px] border border-[#34C759]/25 space-y-2">
                  <span className="font-bold text-[#248A3D] dark:text-[#30D158] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                    <span>Kỹ Năng Đã Đáp Ứng:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidateDetail.matchedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono font-semibold text-[#248A3D] dark:text-[#30D158] bg-white/80 dark:bg-black/30 border border-[#34C759]/25 px-2.5 py-0.5 rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#FF9500]/8 rounded-[18px] border border-[#FF9500]/25 space-y-2">
                  <span className="font-bold text-[#C93400] dark:text-[#FF9F0A] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#FF9500]" />
                    <span>Kỹ Năng Còn Thiếu Hoặc Chưa Rõ:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidateDetail.missingSkills && selectedCandidateDetail.missingSkills.length > 0 ? (
                      selectedCandidateDetail.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-mono font-semibold text-[#C93400] dark:text-[#FF9F0A] bg-white/80 dark:bg-black/30 border border-[#FF9500]/25 px-2.5 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#8E8E93] italic text-[11px]">Đã đáp ứng đầy đủ yêu cầu chính.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-[#1C1C1E] dark:text-white block mb-1.5">Điểm Mạnh Nổi Bật:</span>
                  <ul className="space-y-1.5 list-disc list-inside bg-[#F2F2F7]/70 dark:bg-white/[0.04] p-3.5 rounded-[16px] border border-black/[0.05] dark:border-white/[0.06]">
                    {selectedCandidateDetail.strengths.map((st, i) => (
                      <li key={i} className="leading-relaxed">
                        {st}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-[#1C1C1E] dark:text-white block mb-1.5">Rủi Ro / Cần Đào Sâu:</span>
                  <ul className="space-y-1.5 list-disc list-inside bg-[#F2F2F7]/70 dark:bg-white/[0.04] p-3.5 rounded-[16px] border border-black/[0.05] dark:border-white/[0.06]">
                    {selectedCandidateDetail.gapsOrRisks && selectedCandidateDetail.gapsOrRisks.length > 0 ? (
                      selectedCandidateDetail.gapsOrRisks.map((g, i) => (
                        <li key={i} className="leading-relaxed">
                          {g}
                        </li>
                      ))
                    ) : (
                      <li className="text-[#8E8E93] italic">Không có rủi ro đáng kể.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* 3.1: 10 Câu Hỏi Phỏng Vấn AI Đề Xuất Dành Riêng Cho Ứng Viên Này */}
              <div className="bg-[#007AFF]/[0.06] dark:bg-[#0A84FF]/[0.08] p-5 rounded-[22px] border border-[#007AFF]/20 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[#1C1C1E] dark:text-white font-bold text-xs">
                    <HelpCircle className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
                    <span>10 Câu Hỏi Phỏng Vấn AI Đề Xuất Dành Riêng Cho Ứng Viên Này (3.1):</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#007AFF] dark:text-[#0A84FF] px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-black/30 border border-[#007AFF]/25 shrink-0">
                    10 Câu Hỏi Chuẩn
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {getTenInterviewQuestions(selectedCandidateDetail).map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 neumorphic-card rounded-[14px] text-[#1C1C1E] dark:text-[#EBEBF5] text-xs leading-relaxed flex items-start justify-between gap-2.5 hover:border-[#007AFF]/40 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white font-mono tabular-nums font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p>{q}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(q);
                          setCopiedDetailQuestionIdx(idx);
                          setTimeout(() => setCopiedDetailQuestionIdx(null), 2000);
                        }}
                        className="text-[#8E8E93] hover:text-[#007AFF] cursor-pointer shrink-0 p-1 transition-colors"
                        title="Sao chép câu hỏi"
                      >
                        {copiedDetailQuestionIdx === idx ? (
                          <Check className="w-3.5 h-3.5 text-[#34C759]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recruiter Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1C1C1E] dark:text-white">Ghi Chú Nội Bộ Của Tuyển Dụng:</span>
                  <span className="text-[11px] text-[#8E8E93]">Tự động lưu lại trên hệ thống</span>
                </div>
                <textarea
                  rows={3}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Thêm đánh giá sau phỏng vấn hoặc lưu ý về mức lương..."
                  className="w-full p-3 neumorphic-inset rounded-[14px] text-xs leading-relaxed text-[#1C1C1E] dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    onUpdateCandidateNotes(selectedCandidateDetail.id, editingNotes);
                    onSelectCandidateDetail({ ...selectedCandidateDetail, notes: editingNotes });
                  }}
                  className="btn-fluent-glass px-4 py-1.5 text-xs font-semibold text-[#1C1C1E] dark:text-white rounded-full cursor-pointer"
                >
                  Lưu Ghi Chú
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#F2F2F7]/60 dark:bg-white/[0.03] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E8E93] font-medium">Chuyển giai đoạn:</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      STAGE_CONFIG[selectedCandidateDetail.stage]?.dotColor || 'bg-[#8E8E93]'
                    }`}
                  />
                  <select
                    value={selectedCandidateDetail.stage}
                    onChange={(e) => {
                      const newStage = e.target.value as CandidateStage;
                      onUpdateCandidateStage(selectedCandidateDetail.id, newStage);
                      onSelectCandidateDetail({ ...selectedCandidateDetail, stage: newStage });
                    }}
                    className={`text-xs py-1 px-3 rounded-full font-bold border cursor-pointer focus:outline-none ${
                      STAGE_CONFIG[selectedCandidateDetail.stage]?.badgeBg || 'bg-white'
                    } ${STAGE_CONFIG[selectedCandidateDetail.stage]?.badgeText || 'text-[#1C1C1E]'} ${
                      STAGE_CONFIG[selectedCandidateDetail.stage]?.badgeBorder || 'border-black/10'
                    }`}
                  >
                    <option value="Mới nhận">Mới nhận</option>
                    <option value="Đã thẩm định">Đã thẩm định</option>
                    <option value="Phỏng vấn">Phỏng vấn</option>
                    <option value="Đề nghị việc">Đề nghị việc</option>
                    <option value="Đã từ chối">Đã từ chối</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 whitespace-nowrap shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => handleDownloadQuestions(selectedCandidateDetail)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#248A3D] dark:text-[#30D158] bg-[#34C759]/12 border border-[#34C759]/25 hover:bg-[#34C759]/22 rounded-full transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title="Tải xuống 10 câu hỏi phỏng vấn đề xuất dạng .txt"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>Tải 10 Câu Hỏi (.txt)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenForwardModal(selectedCandidateDetail)}
                  className="btn-fluent-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-full cursor-pointer whitespace-nowrap shrink-0"
                  title="Chuyển tiếp báo cáo phân tích năng lực ứng viên"
                >
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  <span>Chuyển Tiếp Thông Tin</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleOpenComparison(selectedCandidateDetail.jobId, selectedCandidateDetail.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 border border-[#007AFF]/25 hover:bg-[#007AFF]/20 rounded-full transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
                  <span>So Sánh Đối Chiếu</span>
                </button>

                <button
                  onClick={() => onSelectCandidateDetail(null)}
                  className="btn-fluent-glass px-4 py-2 text-xs font-semibold text-[#1C1C1E] dark:text-white rounded-full cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: So Sánh Đối Chiếu 3 Ứng Viên Cùng JD */}
      {isComparisonModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="glass-panel rounded-[26px] max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:px-6 border-b border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Bảng So Sánh Đối Chiếu Ma Trận Benchmark Ứng Viên
                  </h3>
                </div>
                <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                  Chọn tối đa 3 ứng viên cùng ứng tuyển một vị trí để phân tích điểm số, năng lực cạnh tranh và nhận định của AI
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Job Position Switcher */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[#8E8E93] font-medium">Vị trí:</span>
                  <select
                    value={comparisonJobId}
                    onChange={(e) => {
                      const newJobId = e.target.value;
                      setComparisonJobId(newJobId);
                      const peerCands = candidates.filter((c) => c.jobId === newJobId);
                      setSelectedComparisonCandidateIds(peerCands.slice(0, 3).map((c) => c.id));
                    }}
                    className="py-1.5 px-3 neumorphic-inset rounded-[12px] font-semibold text-[#1C1C1E] dark:text-white text-xs cursor-pointer focus:outline-none"
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} ({job.level})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setIsComparisonModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Candidate Selector Ribbon */}
            <div className="px-6 py-3 bg-[#F2F2F7]/70 dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1C1C1E] dark:text-white">
                  Chọn ứng viên để so sánh đối chiếu:
                </span>
                <span className="font-mono tabular-nums text-[#8E8E93]">
                  (Đã chọn {selectedComparisonCandidateIds.length}/3 ứng viên)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {candidates
                  .filter((c) => c.jobId === comparisonJobId)
                  .map((cand) => {
                    const isSelected = selectedComparisonCandidateIds.includes(cand.id);
                    return (
                      <button
                        key={cand.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedComparisonCandidateIds((prev) => prev.filter((id) => id !== cand.id));
                          } else if (selectedComparisonCandidateIds.length < 3) {
                            setSelectedComparisonCandidateIds((prev) => [...prev, cand.id]);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'btn-fluent-primary text-white'
                            : selectedComparisonCandidateIds.length >= 3
                            ? 'bg-[#767680]/10 text-[#8E8E93] opacity-60 cursor-not-allowed'
                            : 'btn-fluent-glass text-[#1C1C1E] dark:text-white'
                        }`}
                      >
                        {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        <span>{cand.fullName}</span>
                        <span className="font-mono tabular-nums text-[10px] opacity-85">({cand.benchmarkScore.toFixed(1)}⭐)</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Modal Body: Side-by-Side Comparison */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-[#3C3C43] dark:text-[#EBEBF5]">
              {selectedComparisonCandidateIds.length === 0 ? (
                <div className="text-center py-12 space-y-2 text-[#8E8E93]">
                  <ArrowLeftRight className="w-8 h-8 mx-auto text-[#8E8E93]/60" />
                  <p className="font-semibold text-[#1C1C1E] dark:text-white">
                    Chưa có ứng viên nào được chọn để so sánh.
                  </p>
                  <p className="text-[11px]">
                    Hãy nhấp chọn tối thiểu 2 hoặc 3 ứng viên ở thanh chọn phía trên.
                  </p>
                </div>
              ) : (
                <>
                  {/* Side-by-Side Comparison Grid */}
                  <div
                    className={`grid gap-5 ${
                      selectedComparisonCandidateIds.length === 1
                        ? 'grid-cols-1 max-w-md mx-auto'
                        : selectedComparisonCandidateIds.length === 2
                        ? 'grid-cols-1 md:grid-cols-2'
                        : 'grid-cols-1 md:grid-cols-3'
                    }`}
                  >
                    {selectedComparisonCandidateIds.map((candId) => {
                      const cand = candidates.find((c) => c.id === candId);
                      if (!cand) return null;

                      // Rank among selected
                      const sortedSelected = [...selectedComparisonCandidateIds]
                        .map((id) => candidates.find((c) => c.id === id))
                        .filter(Boolean) as Candidate[];
                      sortedSelected.sort((a, b) => b.benchmarkScore - a.benchmarkScore);
                      const rankIndex = sortedSelected.findIndex((c) => c.id === cand.id);

                      return (
                        <div
                          key={cand.id}
                          className={`neumorphic-card rounded-[22px] p-5 space-y-4 flex flex-col justify-between ${
                            rankIndex === 0 && sortedSelected.length > 1
                              ? 'ring-2 ring-[#007AFF] dark:ring-[#0A84FF] shadow-lg'
                              : ''
                          }`}
                        >
                          <div className="space-y-4">
                            {/* Candidate Identity Header */}
                            <div className="flex items-start justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono tabular-nums text-xs font-bold text-[#007AFF] dark:text-[#0A84FF]">
                                    {cand.id}
                                  </span>
                                  {rankIndex === 0 && sortedSelected.length > 1 && (
                                    <span className="text-[10px] font-bold text-[#FF9500] bg-[#FF9500]/12 px-2 py-0.5 rounded-full uppercase">
                                      Xếp hạng #1
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white mt-0.5">
                                  {cand.fullName}
                                </h4>
                                <p className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                                  {cand.email}
                                </p>
                              </div>

                              <span className="text-[11px] font-semibold text-[#3C3C43] dark:text-[#EBEBF5] bg-[#767680]/12 px-2.5 py-0.5 rounded-full shrink-0">
                                {cand.source}
                              </span>
                            </div>

                            {/* Benchmark Score Badge */}
                            <div className="p-3.5 bg-gradient-to-br from-[#0A84FF] via-[#007AFF] to-[#5856D6] text-white rounded-[16px] flex items-center justify-between shadow-sm">
                              <div>
                                <span className="text-[10px] text-white/80 uppercase tracking-wider font-semibold block">
                                  Điểm Benchmark
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-xl font-bold font-mono tabular-nums text-white">
                                    {cand.benchmarkScore.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-white/75">/ 5.0 sao</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-0.5 text-[#FFD60A]">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${
                                      cand.benchmarkScore >= star
                                        ? 'fill-[#FFD60A] text-[#FFD60A]'
                                        : 'text-white/30'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* 4-Dimension Metric Bars */}
                            <div className="space-y-2.5 bg-[#F2F2F7]/70 dark:bg-white/[0.04] p-3.5 rounded-[14px] border border-black/[0.05] dark:border-white/[0.06]">
                              <span className="font-bold text-[#1C1C1E] dark:text-white text-[11px] block">
                                Ma Trận 4 Chiều (Thang 1.0 - 5.0):
                              </span>

                              {/* Skills */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-[#8E8E93]">Kỹ năng cốt lõi:</span>
                                  <span className="font-mono tabular-nums font-bold text-[#007AFF] dark:text-[#0A84FF]">
                                    {cand.matrixMatch.skillsScore.toFixed(1)}/5
                                  </span>
                                </div>
                                <div className="w-full bg-[#767680]/15 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#007AFF] h-full rounded-full"
                                    style={{ width: `${(cand.matrixMatch.skillsScore / 5) * 100}%` }}
                                  />
                                </div>
                              </div>

                              {/* Experience */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-[#8E8E93]">Kinh nghiệm thực chiến:</span>
                                  <span className="font-mono tabular-nums font-bold text-[#34C759] dark:text-[#30D158]">
                                    {cand.matrixMatch.experienceScore.toFixed(1)}/5
                                  </span>
                                </div>
                                <div className="w-full bg-[#767680]/15 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#34C759] h-full rounded-full"
                                    style={{ width: `${(cand.matrixMatch.experienceScore / 5) * 100}%` }}
                                  />
                                </div>
                              </div>

                              {/* Education */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-[#8E8E93]">Bằng cấp & chứng chỉ:</span>
                                  <span className="font-mono tabular-nums font-bold text-[#AF52DE] dark:text-[#BF5AF2]">
                                    {cand.matrixMatch.educationScore.toFixed(1)}/5
                                  </span>
                                </div>
                                <div className="w-full bg-[#767680]/15 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#AF52DE] h-full rounded-full"
                                    style={{ width: `${(cand.matrixMatch.educationScore / 5) * 100}%` }}
                                  />
                                </div>
                              </div>

                              {/* Culture */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-[#8E8E93]">Phù hợp văn hóa:</span>
                                  <span className="font-mono tabular-nums font-bold text-[#FF9500] dark:text-[#FF9F0A]">
                                    {cand.matrixMatch.cultureScore.toFixed(1)}/5
                                  </span>
                                </div>
                                <div className="w-full bg-[#767680]/15 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#FF9500] h-full rounded-full"
                                    style={{ width: `${(cand.matrixMatch.cultureScore / 5) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Matched Skills */}
                            <div>
                              <span className="font-semibold text-[#248A3D] dark:text-[#30D158] text-[11px] block mb-1.5">
                                Kỹ năng đáp ứng:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {cand.matchedSkills.slice(0, 4).map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-mono font-semibold text-[#248A3D] dark:text-[#30D158] bg-[#34C759]/10 border border-[#34C759]/25 px-2 py-0.5 rounded-md"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Missing Skills */}
                            <div>
                              <span className="font-semibold text-[#C93400] dark:text-[#FF9F0A] text-[11px] block mb-1.5">
                                Kỹ năng còn thiếu / cần làm rõ:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {cand.missingSkills && cand.missingSkills.length > 0 ? (
                                  cand.missingSkills.slice(0, 2).map((s, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] font-mono font-semibold text-[#C93400] dark:text-[#FF9F0A] bg-[#FF9500]/10 border border-[#FF9500]/25 px-2 py-0.5 rounded-md"
                                    >
                                      {s}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[#8E8E93] italic text-[11px]">
                                    Đáp ứng đầy đủ yêu cầu chính.
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Strengths */}
                            <div>
                              <span className="font-semibold text-[#1C1C1E] dark:text-white text-[11px] block mb-1">
                                Điểm mạnh nổi bật:
                              </span>
                              <ul className="list-disc list-inside space-y-1 text-[#3C3C43] dark:text-[#EBEBF5] text-[11px]">
                                {cand.strengths.slice(0, 2).map((st, i) => (
                                  <li key={i} className="leading-snug">{st}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Action row on column */}
                          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                STAGE_CONFIG[cand.stage]?.badgeBg || 'bg-[#767680]/10'
                              } ${STAGE_CONFIG[cand.stage]?.badgeText || 'text-[#3C3C43]'} ${
                                STAGE_CONFIG[cand.stage]?.badgeBorder || 'border-black/10'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  STAGE_CONFIG[cand.stage]?.dotColor || 'bg-[#8E8E93]'
                                }`}
                              />
                              <span>{cand.stage}</span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              {cand.stage !== 'Phỏng vấn' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateCandidateStage(cand.id, 'Phỏng vấn')}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-full cursor-pointer transition-colors"
                                >
                                  Mời Phỏng Vấn
                                </button>
                              )}
                              {cand.stage !== 'Đề nghị việc' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateCandidateStage(cand.id, 'Đề nghị việc')}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-[#248A3D] dark:text-[#30D158] bg-[#34C759]/12 hover:bg-[#34C759]/22 rounded-full cursor-pointer transition-colors"
                                >
                                  Gửi Offer
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Synthesis Verdict Box */}
                  {selectedComparisonCandidateIds.length >= 2 && (
                    <div className="p-4 bg-[#1C1C1E] dark:bg-[#2C2C2E] text-white rounded-[18px] space-y-2 border border-white/10 shadow-md">
                      <div className="flex items-center gap-2 text-[#0A84FF] font-semibold text-xs">
                        <Sparkles className="w-4 h-4 text-[#0A84FF]" />
                        <span>AI Tổng Hợp Nhận Định & Khuyến Nghị Tuyển Dụng:</span>
                      </div>
                      <p className="text-xs text-[#EBEBF5]/85 leading-relaxed">
                        Dựa trên việc đối chiếu ma trận benchmark 5 sao với yêu cầu của vị trí{' '}
                        <strong className="text-white">
                          {jobs.find((j) => j.id === comparisonJobId)?.title}
                        </strong>
                        :{' '}
                        {(() => {
                          const sorted = [...selectedComparisonCandidateIds]
                            .map((id) => candidates.find((c) => c.id === id))
                            .filter(Boolean) as Candidate[];
                          sorted.sort((a, b) => b.benchmarkScore - a.benchmarkScore);
                          const top1 = sorted[0];
                          const top2 = sorted[1];
                          return (
                            <>
                              Ứng viên <strong className="text-[#30D158]">{top1.fullName} ({top1.id})</strong> đang dẫn đầu với điểm benchmark{' '}
                              <strong className="text-[#FFD60A] font-mono tabular-nums">{top1.benchmarkScore.toFixed(1)}/5.0 sao</strong>, thể hiện ưu thế vượt trội về kỹ năng chuyên môn cốt lõi và số năm kinh nghiệm thực chiến. Trong khi đó, ứng viên{' '}
                              <strong className="text-white">{top2.fullName}</strong> đạt{' '}
                              <span className="font-mono tabular-nums text-[#EBEBF5]">{top2.benchmarkScore.toFixed(1)} sao</span>, là phương án dự phòng chất lượng hoặc có thể cân nhắc phỏng vấn song song.
                            </>
                          );
                        })()}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#F2F2F7]/60 dark:bg-white/[0.03] flex items-center justify-between">
              <span className="text-xs text-[#8E8E93] font-mono">
                So sánh đối chiếu trực tiếp dữ liệu theo thời gian thực
              </span>

              <button
                type="button"
                onClick={() => setIsComparisonModalOpen(false)}
                className="btn-fluent-glass px-4 py-2 text-xs font-semibold text-[#1C1C1E] dark:text-white rounded-full cursor-pointer"
              >
                Đóng Bảng So Sánh
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 1.3: POPUP CHUYỂN TIẾP THÔNG TIN BÁO CÁO PHÂN TÍCH */}
      {isForwardModalOpen && forwardCandidate && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="glass-panel rounded-[26px] max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 sm:px-6 border-b border-black/[0.06] dark:border-white/[0.08] flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Chuyển Tiếp Thông Tin Báo Cáo Phân Tích (1.3)
                  </h3>
                  <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-0.5">
                    Hồ sơ: <strong className="text-[#1C1C1E] dark:text-white">{forwardCandidate.fullName}</strong> ({forwardCandidate.id}) · {forwardCandidate.jobTitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancelForward}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center transition-colors cursor-pointer"
                title="Đóng cửa sổ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleConfirmForward} className="p-5 sm:px-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Người gửi (Tài khoản thành viên) */}
              <div>
                <label className="block text-xs font-bold text-[#1C1C1E] dark:text-white mb-1.5">
                  Tài Khoản Gửi (Email Thành Viên):
                </label>
                <div className="p-3 neumorphic-inset rounded-[14px] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
                    <span className="font-semibold text-[#1C1C1E] dark:text-white">
                      {currentUser?.fullName || 'Thành viên'} ({currentUser?.email || 'dangductuan.7@gmail.com'})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#34C759]/12 text-[#248A3D] dark:text-[#30D158]">
                    Sử dụng email thành viên gửi email
                  </span>
                </div>
              </div>

              {/* Email người nhận hoặc theo danh bạ đã lưu */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1C1C1E] dark:text-white">
                  Email Người Nhận: <span className="text-[#FF3B30]">*</span>
                </label>

                {/* Chọn từ danh bạ đã lưu */}
                {contacts.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8E8E93]">
                      <BookUser className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                      <span>Chọn nhanh từ danh bạ Google Contacts đã lưu ({contacts.length} liên hệ):</span>
                    </div>
                    <select
                      value={forwardRecipientContactId}
                      onChange={(e) => handleSelectContactForForward(e.target.value)}
                      className="w-full p-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white cursor-pointer focus:outline-none"
                    >
                      <option value="">-- Chọn người nhận từ danh bạ hệ thống --</option>
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.email}) - {c.jobTitle || c.organization || 'Hội đồng / Khối ban'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Nhập email trực tiếp */}
                <input
                  type="email"
                  required
                  value={forwardRecipientEmail}
                  onChange={(e) => {
                    setForwardRecipientEmail(e.target.value);
                    setForwardRecipientContactId('');
                  }}
                  placeholder="Nhập email người nhận (ví dụ: lead.engineer@talentflow.vn)..."
                  className="w-full p-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              {/* Tiêu đề email */}
              <div>
                <label className="block text-xs font-bold text-[#1C1C1E] dark:text-white mb-1.5">
                  Tiêu Đề Email:
                </label>
                <input
                  type="text"
                  required
                  value={forwardSubject}
                  onChange={(e) => setForwardSubject(e.target.value)}
                  className="w-full p-2.5 neumorphic-inset rounded-[12px] text-xs font-semibold text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              {/* Nội dung báo cáo phân tích tự động */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                    <span>Nội Dung Báo Cáo Phân Tích (Tự Động Điền Sẵn):</span>
                  </label>
                  <span className="text-[10px] text-[#8E8E93]">
                    Bao gồm kết quả Benchmark & 10 câu hỏi AI
                  </span>
                </div>
                <textarea
                  rows={10}
                  value={forwardBody}
                  onChange={(e) => setForwardBody(e.target.value)}
                  className="w-full p-3 neumorphic-inset rounded-[14px] text-xs font-mono leading-relaxed text-[#1C1C1E] dark:text-white focus:outline-none"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                {/* 1.3: Người dùng bấm HỦY thì xóa hoàn toàn bản nháp đã soạn sẵn */}
                <button
                  type="button"
                  onClick={handleCancelForward}
                  className="px-4 py-2 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/18 text-[#FF3B30] dark:text-[#FF453A] rounded-full text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0"
                >
                  Hủy & Xóa Hoàn Toàn Bản Nháp
                </button>

                {/* 1.3: Người dùng bấm XÁC NHẬN thì sử dụng email thành viên gửi email */}
                <button
                  type="submit"
                  className="btn-fluent-primary inline-flex items-center gap-2 px-6 py-2.5 text-white text-xs font-semibold rounded-full cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>Xác Nhận Gửi Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Forward Toast Notification */}
      {forwardToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 glass-panel border border-[#34C759]/35 bg-[#34C759]/95 text-white rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          <span className="text-xs font-semibold">{forwardToast}</span>
          <button
            type="button"
            onClick={() => setForwardToast(null)}
            className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
