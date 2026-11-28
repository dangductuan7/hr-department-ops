import { extractText } from '../lib/extract';
import React, { useState } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle2,
  Share2,
  Copy,
  Users,
  X,
  Loader2,
  Award,
  ChevronRight,
  Palette,
  UploadCloud,
} from 'lucide-react';
import { JobPosition } from '../types';
import { TabType } from '../components/Sidebar';

interface JDStudioViewProps {
  jobs: JobPosition[];
  onAddJob: (job: JobPosition) => void;
  onSelectJobForBanner: (job: JobPosition) => void;
  onNavigate: (tab: TabType) => void;
  onFilterCandidatesByJob: (jobId: string) => void;
}

export const JDStudioView: React.FC<JDStudioViewProps> = ({
  jobs,
  onAddJob,
  onSelectJobForBanner,
  onNavigate,
  onFilterCandidatesByJob,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadJDModalOpen, setIsUploadJDModalOpen] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState<JobPosition | null>(null);

  // Upload JD Form States
  const [uploadJDText, setUploadJDText] = useState('');
  const [uploadJDFileName, setUploadJDFileName] = useState('');
  const [isParsingJD, setIsParsingJD] = useState(false);
  const [parsedJD, setParsedJD] = useState<JobPosition | null>(null);
  const [dragJDActive, setDragJDActive] = useState(false);
  const [uploadJDFeedback, setUploadJDFeedback] = useState<string | null>(null);

  // AI Generator Form States
  const [formTitle, setFormTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('Khối Công nghệ & Kỹ thuật');
  const [formLevel, setFormLevel] = useState<'Junior' | 'Middle' | 'Senior' | 'Lead' | 'Manager'>('Senior');
  const [formSalary, setFormSalary] = useState('30.000.000 - 50.000.000 VNĐ');
  const [formLocation, setFormLocation] = useState('Hà Nội (Hybrid)');
  const [formKeyReq, setFormKeyReq] = useState('');
  const [formPerks, setFormPerks] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJD, setGeneratedJD] = useState<JobPosition | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Departments list
  const departments = ['all', ...Array.from(new Set(jobs.map((j) => j.department)))];

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requirements.some((r) => r.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDept === 'all' || job.department === selectedDept;
    const matchesLevel = selectedLevel === 'all' || job.level === selectedLevel;
    return matchesSearch && matchesDept && matchesLevel;
  });

  // Handle AI Generate JD
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/jd/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          department: formDepartment,
          level: formLevel,
          salaryRange: formSalary,
          location: formLocation,
          keyRequirements: formKeyReq,
          companyPerks: formPerks,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể tạo JD');
      const newJob: JobPosition = {
        id: `JOB-2026-${Date.now().toString(36).toUpperCase()}`,
        title: data.title || formTitle,
        department: data.department || formDepartment,
        level: formLevel,
        salaryRange: data.salaryRange || formSalary,
        location: data.location || formLocation,
        summary: data.summary || '',
        responsibilities: data.responsibilities || [],
        requirements: data.requirements || [],
        niceToHave: data.niceToHave || [],
        benefits: data.benefits || [],
        benchmarkCriteria: data.benchmarkCriteria || {
          technicalSkills: [formTitle],
          minExperienceYears: formLevel === 'Senior' ? 4 : formLevel === 'Junior' ? 1 : 2,
          educationLevel: 'Đại học chuyên ngành liên quan',
          culturalFitTraits: ['Chủ động', 'Giao tiếp tốt'],
        },
        status: 'Open',
        createdAt: new Date().toISOString().split('T')[0],
        totalApplicants: 0,
      };

      setGeneratedJD(newJob);
    } catch (err: any) {
      alert(err?.message || 'AI chưa tạo được JD.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedJD = () => {
    if (!generatedJD) return;
    onAddJob(generatedJD);
    setIsCreateModalOpen(false);
    setSelectedJobDetail(generatedJD);
    setGeneratedJD(null);
  };

  // Handle Parse Uploaded JD (Text or File)
  const handleParseUploadedJD = async (rawText: string, fileName?: string) => {
    if (!rawText.trim()) return;
    setIsParsingJD(true);
    setUploadJDFeedback(null);

    try {
      const response = await fetch('/api/jd/parse-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, fileName }),
      });

      if (!response.ok) throw new Error('Không thể bóc tách JD');
      const data = await response.json();

      const newJob: JobPosition = {
        id: `JOB-2026-${Date.now().toString(36).toUpperCase()}`,
        title: data.title || 'Vị Trí Mới',
        department: data.department || 'Khối Kỹ thuật & Sản phẩm',
        level: data.level || 'Middle',
        salaryRange: data.salaryRange || 'Thỏa thuận',
        location: data.location || 'Hà Nội / Hybrid',
        summary: data.summary || '',
        responsibilities: data.responsibilities || [],
        requirements: data.requirements || [],
        niceToHave: data.niceToHave || [],
        benefits: data.benefits || [],
        benchmarkCriteria: data.benchmarkCriteria || {
          technicalSkills: [data.title || 'Chuyên môn'],
          minExperienceYears: 3,
          educationLevel: 'Đại học chuyên ngành liên quan',
          culturalFitTraits: ['Chủ động', 'Giao tiếp tốt'],
        },
        status: 'Open',
        createdAt: new Date().toISOString().split('T')[0],
        totalApplicants: 0,
      };

      setParsedJD(newJob);
      setUploadJDFeedback('AI đã phân tích và điền tự động các trường thông tin chuẩn xác theo mẫu JD!');
    } catch (err: any) {
      console.error(err);
      setUploadJDFeedback('Lỗi khi phân tích JD. Vui lòng kiểm tra lại nội dung.');
    } finally {
      setIsParsingJD(false);
    }
  };

  const handleSaveParsedJD = () => {
    if (!parsedJD) return;
    onAddJob(parsedJD);
    setIsUploadJDModalOpen(false);
    setSelectedJobDetail(parsedJD);
    setParsedJD(null);
    setUploadJDText('');
  };

  // Sample Existing JDs for Quick Demo
  const handleLoadSampleJD = (type: 'devops' | 'data_analyst' | 'hr_manager') => {
    let sampleRaw = '';
    let name = '';
    if (type === 'devops') {
      name = 'JD_Lead_DevOps_Cloud.docx';
      sampleRaw = `TUYỂN DỤNG: LEAD DEVOPS & CLOUD ARCHITECT (HÀ NỘI / HYBRID)
Mức lương: 45.000.000 - 70.000.000 VNĐ

Mô tả vai trò:
Chịu trách nhiệm kiến trúc toàn bộ hạ tầng đám mây (GCP/AWS), thiết lập pipeline CI/CD tự động và bảo mật hệ thống Kubernetes cho toàn công ty.

Trách nhiệm chính:
- Thiết kế, triển khai và bảo trì kiến trúc Cloud phân tán, chịu tải 50.000 request/giây.
- Xây dựng hệ thống CI/CD chuẩn mực với GitHub Actions, ArgoCD, Terraform.
- Giám sát độ tin cậy hệ thống 24/7 bằng Prometheus, Grafana, ELK stack.
- Đào tạo và nâng cao nhận thức bảo mật DevSecOps cho toàn bộ đội ngũ lập trình.

Yêu cầu ứng viên:
- Tối thiểu 5+ năm kinh nghiệm làm việc trong lĩnh vực DevOps/Cloud/SysAdmin.
- Thành thạo Docker, Kubernetes (K8s cluster management) và hạ tầng IaC (Terraform).
- Hiểu biết sâu sắc về Networking, bảo mật TLS/SSL, WAF và kiến trúc Zero Trust.
- Tư duy logic, khả năng ứng biến sự cố nhanh và kỹ năng lãnh đạo đội ngũ.

Quyền lợi:
- Thu nhập lên tới 70M + Thưởng hiệu suất năm + Gói ESOP cổ phần ưu đãi.
- Bảo hiểm sức khỏe VIP toàn diện PVI Care cho cả gia đình.
- Được cấp ngân sách thi chứng chỉ CKA/AWS/GCP chuyên nghiệp hàng năm.`;
    } else if (type === 'data_analyst') {
      name = 'JD_Senior_Data_Analyst.pdf';
      sampleRaw = `JOB DESCRIPTION: SENIOR DATA ANALYST (PRODUCT & GROWTH)
Phòng ban: Khối Dữ liệu & Tăng trưởng
Thu nhập: 30.000.000 - 48.000.000 VNĐ

Tổng quan:
Khai phá dữ liệu người dùng, phân tích hành vi và xây dựng các dashboard đo lường chỉ số tăng trưởng sản phẩm SaaS.

Trách nhiệm:
- Xây dựng các mô hình phân tích hành vi khách hàng (Cohort, Funnel, Churn rate, LTV).
- Viết truy vấn SQL phức tạp và xây dựng ETL pipeline kết nối BigQuery/PostgreSQL.
- Thiết kế các dashboard trực quan trên Tableau và Looker Studio cho ban giám đốc.
- Phối hợp với Product Team làm A/B testing để tối ưu hóa tỷ lệ chuyển đổi.

Yêu cầu:
- Tối thiểu 3+ năm kinh nghiệm ở vị trí Data Analyst hoặc Business Intelligence.
- Thành thạo SQL nâng cao, Python/R xử lý dữ liệu và công cụ BI (Tableau/Looker).
- Tư duy sản phẩm nhạy bén, khả năng biến số liệu khô khan thành hành động cụ thể.

Đãi ngộ:
- Lương tháng 13+, thưởng quý theo KPI doanh nghiệp.
- Môi trường làm việc mở, tự do nghiên cứu công nghệ mới.
- Chế độ nghỉ phép 14 ngày/năm.`;
    } else {
      name = 'JD_HR_Talent_Acquisition_Lead.txt';
      sampleRaw = `MÔ TẢ CÔNG VIỆC: TRƯỞNG PHÒNG TUYỂN DỤNG (TALENT ACQUISITION LEAD)
Địa điểm: Hà Nội | Mức thu nhập: 35.000.000 - 50.000.000 VNĐ

Tóm tắt:
Dẫn dắt đội ngũ tuyển dụng 5 thành viên, tối ưu hóa quy trình tuyển dụng và xây dựng thương hiệu nhà tuyển dụng uy tín trong ngành công nghệ.

Nhiệm vụ trọng tâm:
- Lập kế hoạch tuyển dụng quý/năm đáp ứng nhu cầu mở rộng quy mô nhân sự công ty.
- Quản lý và khai thác hiệu quả các kênh tuyển dụng, tối ưu chỉ số Time-to-Hire và Cost-per-Hire.
- Phối hợp chặt chẽ với Hiring Managers để xây dựng tiêu chí benchmark đánh giá ứng viên.
- Tổ chức các sự kiện hướng nghiệp, Job Fair và hợp tác với các trường đại học lớn.

Yêu cầu:
- Tối thiểu 4+ năm kinh nghiệm tuyển dụng trong ngành Tech/SaaS, có ít nhất 1 năm quản lý nhóm.
- Kỹ năng đàm phán, thuyết phục và xây dựng mạng lưới quan hệ rộng trong cộng đồng nhân sự.
- Khả năng phân tích số liệu tuyển dụng để cải tiến quy trình liên tục.

Quyền lợi:
- Thu nhập cạnh tranh, thưởng quý theo số lượng và chất lượng nhân sự tuyển được.
- Đầy đủ bảo hiểm, du lịch nghỉ dưỡng cao cấp cùng ban lãnh đạo.`;
    }

    setUploadJDText(sampleRaw);
    setUploadJDFileName(name);
    handleParseUploadedJD(sampleRaw, name);
  };

  const handleCopyJDContent = (job: JobPosition) => {
    const text = `VỊ TRÍ: ${job.title} (${job.level})
Phòng ban: ${job.department} | Địa điểm: ${job.location}
Thu nhập: ${job.salaryRange}

TÓM TẮT CÔNG VIỆC:
${job.summary}

TRÁCH NHIỆM CHÍNH:
${job.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

YÊU CẦU ỨNG VIÊN:
${job.requirements.map((r, i) => `- ${r}`).join('\n')}

QUYỀN LỢI ĐÃI NGỘ:
${job.benefits.map((b, i) => `+ ${b}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1720px] w-full mx-auto">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
            Thư Viện & Trình Tạo Bản Mô Tả Công Việc (JD)
          </h2>
          <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
            Lựa chọn vị trí mẫu chuẩn hóa, tải lên JD có sẵn để AI bóc tách hoặc dùng AI tự động soạn thảo bản JD mới.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setParsedJD(null);
              setUploadJDFeedback(null);
              setIsUploadJDModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#1C1C1E] dark:text-white btn-fluent-glass rounded-full transition-all cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
            <span>Tải Lên JD Có Sẵn (AI Bóc Tách)</span>
          </button>

          <button
            onClick={() => {
              setGeneratedJD(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold btn-fluent-primary rounded-full transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tạo JD Mới Bằng AI</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-[22px] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo chức danh, phòng ban, kỹ năng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs neumorphic-inset rounded-full text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto min-w-0">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs py-2 px-3.5 neumorphic-inset rounded-[14px] text-[#1C1C1E] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35 cursor-pointer"
          >
            <option value="all">Tất cả phòng ban</option>
            {departments
              .filter((d) => d !== 'all')
              .map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="text-xs py-2 px-3.5 neumorphic-inset rounded-[14px] text-[#1C1C1E] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35 cursor-pointer"
          >
            <option value="all">Tất cả cấp bậc</option>
            <option value="Junior">Junior</option>
            <option value="Middle">Middle</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
      </div>

      {/* Grid of Job Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="neumorphic-card neumorphic-card-hover rounded-[24px] p-5 flex flex-col justify-between transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono text-[#8E8E93] tabular-nums">{job.id}</span>
                  <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white group-hover:text-[#007AFF] dark:group-hover:text-[#0A84FF] transition-colors tracking-tight">
                    {job.title}
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 border border-[#007AFF]/20 px-2.5 py-0.5 rounded-full shrink-0">
                  {job.level}
                </span>
              </div>

              <p className="text-xs text-[#3C3C43] dark:text-[#EBEBF5]/80 line-clamp-2 leading-relaxed">
                {job.summary}
              </p>

              <div className="space-y-1.5 pt-2.5 text-xs text-[#3C3C43] dark:text-[#EBEBF5]/85 border-t border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
                  <span className="truncate">{job.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-[#34C759] dark:text-[#30D158] shrink-0" />
                  <span className="font-mono tabular-nums font-semibold text-[#1C1C1E] dark:text-white">{job.salaryRange}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FF9500] shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
              </div>

              {/* Benchmark Highlights */}
              <div className="pt-2 text-xs">
                <span className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1.5">
                  Tiêu chuẩn Benchmark
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-[#3C3C43] dark:text-[#EBEBF5]">
                  <span className="bg-[#767680]/10 dark:bg-white/10 px-2.5 py-0.5 rounded-full font-medium tabular-nums">
                    Kinh nghiệm: {job.benchmarkCriteria.minExperienceYears}+ năm
                  </span>
                  <span className="bg-[#767680]/10 dark:bg-white/10 px-2.5 py-0.5 rounded-full font-medium truncate max-w-[200px]">
                    {job.benchmarkCriteria.technicalSkills.slice(0, 2).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedJobDetail(job)}
                className="text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5] hover:text-[#007AFF] dark:hover:text-[#0A84FF] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Xem chi tiết</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onFilterCandidatesByJob(job.id);
                    onNavigate('candidates');
                  }}
                  title="Xem danh sách ứng viên cho vị trí này"
                  className="p-2 text-[#8E8E93] hover:text-[#007AFF] dark:hover:text-[#0A84FF] hover:bg-[#007AFF]/10 rounded-full transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    onSelectJobForBanner(job);
                    onNavigate('banner-studio');
                  }}
                  title="Soạn tin & Tạo banner cho vị trí này"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 hover:bg-[#007AFF]/18 border border-[#007AFF]/20 rounded-full transition-colors cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Tạo Tin & Banner</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal 1: Chi Tiết JD & Tiêu Chuẩn Benchmark */}
      {selectedJobDetail && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-[26px] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-black/[0.06] dark:border-white/[0.08] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#8E8E93] tabular-nums">{selectedJobDetail.id}</span>
                  <span className="text-[11px] font-mono font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/12 px-2.5 py-0.5 rounded-full">
                    {selectedJobDetail.level}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1C1C1E] dark:text-white mt-1 tracking-tight">
                  {selectedJobDetail.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#8E8E93] mt-1">
                  <span>{selectedJobDetail.department}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[#3C3C43] dark:text-[#EBEBF5] font-medium tabular-nums">{selectedJobDetail.salaryRange}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedJobDetail.location}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedJobDetail(null)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs text-[#3C3C43] dark:text-[#EBEBF5]">
              {/* Summary */}
              <div>
                <h4 className="font-semibold mb-1.5 uppercase text-[11px] tracking-wider text-[#8E8E93]">
                  Tóm Tắt Vị Trí
                </h4>
                <p className="leading-relaxed neumorphic-inset p-4 rounded-[16px]">
                  {selectedJobDetail.summary}
                </p>
              </div>

              {/* Responsibilities */}
              <div>
                <h4 className="font-semibold mb-1.5 uppercase text-[11px] tracking-wider text-[#8E8E93]">
                  Trách Nhiệm Công Việc
                </h4>
                <ul className="space-y-1.5 list-disc list-inside neumorphic-inset p-4 rounded-[16px]">
                  {selectedJobDetail.responsibilities.map((r, i) => (
                    <li key={i} className="leading-relaxed">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="font-semibold mb-1.5 uppercase text-[11px] tracking-wider text-[#8E8E93]">
                  Yêu Cầu Ứng Viên
                </h4>
                <ul className="space-y-1.5 list-disc list-inside neumorphic-inset p-4 rounded-[16px]">
                  {selectedJobDetail.requirements.map((r, i) => (
                    <li key={i} className="leading-relaxed">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="font-semibold mb-1.5 uppercase text-[11px] tracking-wider text-[#8E8E93]">
                  Quyền Lợi & Đãi Ngộ
                </h4>
                <ul className="space-y-1.5 list-disc list-inside neumorphic-inset p-4 rounded-[16px]">
                  {selectedJobDetail.benefits.map((b, i) => (
                    <li key={i} className="leading-relaxed">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benchmark Criteria Box */}
              <div className="bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 p-4 rounded-[18px] border border-[#007AFF]/25 space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
                  <h4 className="font-semibold text-[#1C1C1E] dark:text-white text-xs">
                    Tiêu Chuẩn Benchmark Thẩm Định CV (Đối Chiếu Tự Động)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#8E8E93] text-[11px] block">Kỹ năng kỹ thuật cốt lõi:</span>
                    <span className="font-semibold text-[#1C1C1E] dark:text-white">
                      {selectedJobDetail.benchmarkCriteria.technicalSkills.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8E8E93] text-[11px] block">Kinh nghiệm tối thiểu:</span>
                    <span className="font-semibold text-[#1C1C1E] dark:text-white tabular-nums">
                      {selectedJobDetail.benchmarkCriteria.minExperienceYears} năm thực chiến
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8E8E93] text-[11px] block">Trình độ học vấn:</span>
                    <span className="font-semibold text-[#1C1C1E] dark:text-white">
                      {selectedJobDetail.benchmarkCriteria.educationLevel}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8E8E93] text-[11px] block">Tính cách văn hóa mong đợi:</span>
                    <span className="font-semibold text-[#1C1C1E] dark:text-white">
                      {selectedJobDetail.benchmarkCriteria.culturalFitTraits.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopyJDContent(selectedJobDetail)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1C1C1E] dark:text-white btn-fluent-glass rounded-full transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copyFeedback ? 'Đã sao chép!' : 'Sao chép nội dung JD'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedJobDetail(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    onSelectJobForBanner(selectedJobDetail);
                    setSelectedJobDetail(null);
                    onNavigate('banner-studio');
                  }}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold btn-fluent-primary rounded-full transition-all cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Soạn Tin & Tạo Banner Tuyển Dụng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: AI Tạo Mô Tả Công Việc Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-[26px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-[#0A84FF] to-[#5856D6] text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Trình Tạo Mô Tả Công Việc Bằng AI
                  </h3>
                  <p className="text-xs text-[#8E8E93]">
                    Chỉ cần cung cấp chức danh và thông số cơ bản, AI sẽ sinh trọn bộ JD chuẩn mực
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {!generatedJD ? (
                <form onSubmit={handleGenerateAI} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1E] dark:text-white mb-1.5">
                      Chức Danh Công Việc <span className="text-[#FF3B30]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Senior DevOps Engineer, Data Analyst Lead, Trưởng Phòng Tuyển Dụng..."
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs neumorphic-inset rounded-[14px] text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1E] dark:text-white mb-1.5">
                        Phòng Ban
                      </label>
                      <input
                        type="text"
                        value={formDepartment}
                        onChange={(e) => setFormDepartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs neumorphic-inset rounded-[14px] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1E] dark:text-white mb-1.5">
                        Cấp Bậc
                      </label>
                      <select
                        value={formLevel}
                        onChange={(e) => setFormLevel(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-xs neumorphic-inset rounded-[14px] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35 cursor-pointer"
                      >
                        <option value="Junior">Junior</option>
                        <option value="Middle">Middle</option>
                        <option value="Senior">Senior</option>
                        <option value="Lead">Lead</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1E] dark:text-white mb-1.5">
                        Mức Lương Dự Kiến
                      </label>
                      <input
                        type="text"
                        value={formSalary}
                        onChange={(e) => setFormSalary(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs neumorphic-inset rounded-[14px] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1E] dark:text-white mb-1.5">
                        Địa Điểm Làm Việc
                      </label>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs neumorphic-inset rounded-[14px] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1E] dark:text-white mb-1.5">
                      Yêu Cầu Chuyên Môn Trọng Tâm (Tùy chọn)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="VD: Thành thạo Docker, Kubernetes, CI/CD, có kinh nghiệm triển khai AWS..."
                      value={formKeyReq}
                      onChange={(e) => setFormKeyReq(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs neumorphic-inset rounded-[14px] text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1E] dark:text-white mb-1.5">
                      Phúc Lợi Đặc Biệt (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Bảo hiểm sức khỏe VIP, thưởng 3 tháng lương, MacBook Pro M3..."
                      value={formPerks}
                      onChange={(e) => setFormPerks(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs neumorphic-inset rounded-[14px] text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isGenerating || !formTitle.trim()}
                      className="w-full py-3 px-4 text-xs font-semibold btn-fluent-primary rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>AI Đang Soạn Bản Mô Tả Công Việc...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>AI Tự Động Tạo Mô Tả Công Việc</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Generated Preview */
                <div className="space-y-4 text-xs text-[#3C3C43] dark:text-[#EBEBF5]">
                  <div className="p-3.5 bg-[#34C759]/12 border border-[#34C759]/30 rounded-[16px] text-[#1D833A] dark:text-[#30D158] flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>AI đã tạo xong bản mô tả công việc! Hãy kiểm tra và lưu vào thư viện.</span>
                  </div>

                  <div className="neumorphic-inset rounded-[18px] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#1C1C1E] dark:text-white">{generatedJD.title}</h4>
                      <span className="font-mono text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/12 px-2.5 py-0.5 rounded-full">
                        {generatedJD.level}
                      </span>
                    </div>

                    <p className="text-[#3C3C43] dark:text-[#EBEBF5]/85 leading-relaxed">{generatedJD.summary}</p>

                    <div>
                      <span className="font-semibold text-[#1C1C1E] dark:text-white block mb-1">Trách nhiệm chính:</span>
                      <ul className="list-disc list-inside space-y-1">
                        {generatedJD.responsibilities.slice(0, 3).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-semibold text-[#1C1C1E] dark:text-white block mb-1">Yêu cầu cốt lõi:</span>
                      <ul className="list-disc list-inside space-y-1">
                        {generatedJD.requirements.slice(0, 3).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-white/70 dark:bg-white/[0.06] rounded-[12px] border border-black/[0.06] dark:border-white/[0.08]">
                      <span className="font-semibold text-[#007AFF] dark:text-[#0A84FF] block mb-1">
                        Tiêu chuẩn Benchmark thẩm định:
                      </span>
                      <p>
                        Kỹ năng: {generatedJD.benchmarkCriteria.technicalSkills.join(', ')} · Kinh nghiệm tối thiểu: {generatedJD.benchmarkCriteria.minExperienceYears} năm.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {generatedJD && (
              <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between">
                <button
                  onClick={() => setGeneratedJD(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
                >
                  Tạo lại
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveGeneratedJD}
                    className="px-5 py-2 text-xs font-semibold btn-fluent-primary rounded-full transition-all cursor-pointer"
                  >
                    Lưu Vào Thư Viện JD
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 3: Tải Lên & Bóc Tách JD Có Sẵn Bằng AI */}
      {isUploadJDModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-[26px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Tải Lên & Bóc Tách Mô Tả Công Việc (JD) Bằng AI
                  </h3>
                  <p className="text-xs text-[#8E8E93]">
                    Tải tệp JD có sẵn hoặc dán văn bản thô, AI sẽ tự động phân tích và điền khớp vào các trường mẫu
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadJDModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {!parsedJD ? (
                <div className="space-y-4">
                  {/* Drag & Drop File Zone */}
                  <div
                    onDragEnter={(e) => { e.preventDefault(); setDragJDActive(true); }}
                    onDragOver={(e) => { e.preventDefault(); setDragJDActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragJDActive(false); }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setDragJDActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        setUploadJDFileName(file.name);
                        try {
                          const text = await extractText(file);
                          setUploadJDText(text);
                          handleParseUploadedJD(text, file.name);
                        } catch (err: any) {
                          alert(err?.message || 'Không đọc được tệp JD.');
                        }
                      }
                    }}
                    className={`border-2 border-dashed rounded-[20px] p-6 text-center transition-all ${
                      dragJDActive
                        ? 'border-[#007AFF] bg-[#007AFF]/10'
                        : 'border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.02] hover:border-[#007AFF]/50'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-[14px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center mx-auto mb-2.5">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-[#1C1C1E] dark:text-white">
                      Kéo thả tệp JD (PDF, DOCX, TXT) vào đây
                    </p>
                    <p className="text-[11px] text-[#8E8E93] mt-0.5">
                      hoặc chọn tệp từ máy tính
                    </p>
                    <div className="mt-3">
                      <label className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold btn-fluent-primary rounded-full cursor-pointer transition-all">
                        <span>Chọn Tệp JD</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,.txt"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setUploadJDFileName(file.name);
                              try {
                                const text = await extractText(file);
                                setUploadJDText(text);
                                handleParseUploadedJD(text, file.name);
                              } catch (err: any) {
                                alert(err?.message || 'Không đọc được tệp JD.');
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Or Paste Raw Text */}
                  <div>
                    <label className="block font-semibold text-[#1C1C1E] dark:text-white mb-1.5">
                      Hoặc dán trực tiếp nội dung văn bản JD có sẵn:
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Dán toàn bộ nội dung bản mô tả công việc (vị trí, yêu cầu, trách nhiệm, phúc lợi)..."
                      value={uploadJDText}
                      onChange={(e) => setUploadJDText(e.target.value)}
                      className="w-full px-3.5 py-2.5 neumorphic-inset rounded-[14px] text-xs font-mono leading-relaxed text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                    />
                  </div>

                  {/* Quick sample JD triggers */}
                  <div className="p-3.5 neumorphic-inset rounded-[16px] space-y-2">
                    <span className="font-semibold text-[#8E8E93] block text-[11px]">
                      Thử nghiệm nhanh với các mẫu JD thực tế:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadSampleJD('devops')}
                        className="px-3 py-1.5 text-[11px] font-semibold text-[#1C1C1E] dark:text-white btn-fluent-glass rounded-full transition-colors cursor-pointer"
                      >
                        + Mẫu Lead DevOps Cloud
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadSampleJD('data_analyst')}
                        className="px-3 py-1.5 text-[11px] font-semibold text-[#1C1C1E] dark:text-white btn-fluent-glass rounded-full transition-colors cursor-pointer"
                      >
                        + Mẫu Senior Data Analyst
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadSampleJD('hr_manager')}
                        className="px-3 py-1.5 text-[11px] font-semibold text-[#1C1C1E] dark:text-white btn-fluent-glass rounded-full transition-colors cursor-pointer"
                      >
                        + Mẫu Talent Acquisition Lead
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isParsingJD || !uploadJDText.trim()}
                      onClick={() => handleParseUploadedJD(uploadJDText, uploadJDFileName)}
                      className="w-full py-3 px-4 text-xs font-semibold btn-fluent-primary rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isParsingJD ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>AI Đang Phân Tích & Bóc Tách Từng Mục JD...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>AI Tự Động Phân Tích & Điền Khớp Mẫu JD</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Parsed Result Preview */
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#34C759]/12 border border-[#34C759]/30 rounded-[16px] text-[#1D833A] dark:text-[#30D158] flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{uploadJDFeedback || 'AI đã bóc tách và chuẩn hóa thành công bản JD!'}</span>
                  </div>

                  <div className="neumorphic-inset rounded-[18px] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#1C1C1E] dark:text-white">{parsedJD.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#8E8E93] mt-0.5">
                          <span>{parsedJD.department}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{parsedJD.salaryRange}</span>
                          <span aria-hidden="true">·</span>
                          <span>{parsedJD.location}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/12 px-2.5 py-0.5 rounded-full">
                        {parsedJD.level}
                      </span>
                    </div>

                    <p className="text-[#3C3C43] dark:text-[#EBEBF5] leading-relaxed bg-white/70 dark:bg-white/[0.05] p-3 rounded-[12px] border border-black/[0.06] dark:border-white/[0.08]">
                      {parsedJD.summary}
                    </p>

                    <div>
                      <span className="font-semibold text-[#1C1C1E] dark:text-white block mb-1">Trách nhiệm công việc:</span>
                      <ul className="list-disc list-inside space-y-1 bg-white/70 dark:bg-white/[0.05] p-3 rounded-[12px] border border-black/[0.06] dark:border-white/[0.08] text-[#3C3C43] dark:text-[#EBEBF5]">
                        {parsedJD.responsibilities.slice(0, 4).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-semibold text-[#1C1C1E] dark:text-white block mb-1">Yêu cầu ứng viên:</span>
                      <ul className="list-disc list-inside space-y-1 bg-white/70 dark:bg-white/[0.05] p-3 rounded-[12px] border border-black/[0.06] dark:border-white/[0.08] text-[#3C3C43] dark:text-[#EBEBF5]">
                        {parsedJD.requirements.slice(0, 4).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 bg-[#007AFF]/10 rounded-[14px] border border-[#007AFF]/25 space-y-1">
                      <span className="font-semibold text-[#007AFF] dark:text-[#0A84FF] text-xs block">
                        Tiêu Chuẩn Benchmark Tự Động Thiết Lập:
                      </span>
                      <p className="text-[#3C3C43] dark:text-[#EBEBF5] text-[11px]">
                        <strong>Kỹ năng cốt lõi:</strong> {parsedJD.benchmarkCriteria.technicalSkills.join(', ')}<br />
                        <strong>Kinh nghiệm tối thiểu:</strong> {parsedJD.benchmarkCriteria.minExperienceYears} năm · <strong>Học vấn:</strong> {parsedJD.benchmarkCriteria.educationLevel}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {parsedJD && (
              <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between">
                <button
                  onClick={() => setParsedJD(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
                >
                  Tải lại / Thử tệp khác
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsUploadJDModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-medium text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveParsedJD}
                    className="px-5 py-2 text-xs font-semibold btn-fluent-primary rounded-full transition-all cursor-pointer"
                  >
                    Lưu Vào Thư Viện JD
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
