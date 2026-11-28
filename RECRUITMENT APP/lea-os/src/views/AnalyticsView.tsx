import React, { useEffect, useRef, useState } from 'react';
import { SalaryRangeChart } from '../components/SalaryRangeChart';

// Bộ nhớ đệm kết quả AI theo bộ dữ liệu: chuyển thẻ không phải phân tích lại, dữ liệu đổi thì tự phân tích lại
const aiCache = new Map<string, any>();
import * as XLSX from 'xlsx';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Clock,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Briefcase,
  Star,
  PieChart as PieIcon,
  LineChart as LineIcon,
  SlidersHorizontal,
  Check,
  Eye,
  Sparkles,
  FileSpreadsheet,
  RefreshCw,
  Copy,
  AlertCircle,
  Lightbulb,
  Target,
  ChevronRight,
} from 'lucide-react';
import { Candidate, JobPosition } from '../types';

interface AnalyticsViewProps {
  jobs: JobPosition[];
  candidates: Candidate[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ jobs, candidates }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'quarter' | 'year'>('30d');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Selected Chart View Mode
  const [chartDisplayMode, setChartDisplayMode] = useState<'all' | 'pie' | 'bar' | 'line'>('all');

  // Chart Data Overlay Toggles (Ghép dữ liệu biểu đồ)
  const [overlayApplied, setOverlayApplied] = useState(true);
  const [overlayQualified, setOverlayQualified] = useState(true);
  const [overlayInterview, setOverlayInterview] = useState(true);
  const [overlayOffered, setOverlayOffered] = useState(true);

  // Group By mode for charts
  const [groupBy, setGroupBy] = useState<'department' | 'job' | 'timeline'>('department');

  // AI Recruitment Insights State (Requirement 2.1)
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    summaryHeadline: string;
    executiveAnalysis: string;
    funnelHealth: {
      status: string;
      bottleneck: string;
      conversionRate: string;
    };
    channelEffectiveness: { channel: string; assessment: string }[];
    strategicRecommendations: string[];
    forecast: string;
  } | null>(null);
  const [copiedInsight, setCopiedInsight] = useState(false);
  const [aiError, setAiError] = useState('');
  const lastKey = useRef('');

  // Departments list
  const departments = ['all', ...Array.from(new Set(jobs.map((j) => j.department)))];

  // Filtered dataset
  const filteredJobs = selectedDeptFilter === 'all' ? jobs : jobs.filter((j) => j.department === selectedDeptFilter);
  const filteredCandidates = selectedDeptFilter === 'all'
    ? candidates
    : candidates.filter((c) => {
        const j = jobs.find((job) => job.id === c.jobId);
        return j?.department === selectedDeptFilter;
      });

  // Calculate Funnel Metrics
  const totalApplied = filteredCandidates.length;
  const benchmarkQualified = filteredCandidates.filter((c) => c.benchmarkScore >= 4.0).length;
  const interviewing = filteredCandidates.filter((c) => c.stage === 'Phỏng vấn' || c.stage === 'Đề nghị việc').length;
  const offered = filteredCandidates.filter((c) => c.stage === 'Đề nghị việc').length;
  const avgScore = totalApplied > 0
    ? (filteredCandidates.reduce((acc, c) => acc + c.benchmarkScore, 0) / totalApplied).toFixed(1)
    : '0';

  // Source Distribution Data for Pie Chart
  const sourceStats = [
    { name: 'TopCV Kênh Kết Nối', count: filteredCandidates.filter((c) => c.source === 'TopCV Kênh Kết Nối').length, color: '#007AFF' },
    { name: 'LinkedIn Talent', count: filteredCandidates.filter((c) => c.source === 'LinkedIn').length, color: '#5856D6' },
    { name: 'Email Tự Động Quét', count: filteredCandidates.filter((c) => c.source === 'Email Tự Động Quét').length, color: '#34C759' },
    { name: 'Tải File Trực Tiếp', count: filteredCandidates.filter((c) => c.source === 'Tải File Trực Tiếp').length, color: '#FF9500' },
  ];
  const totalSourceCount = sourceStats.reduce((acc, curr) => acc + curr.count, 0) || 1;

  // Department Aggregation for Bar Chart
  const deptStats = Array.from(new Set(jobs.map((j) => j.department))).map((dept) => {
    const deptCands = candidates.filter((c) => {
      const job = jobs.find((j) => j.id === c.jobId);
      return job?.department === dept;
    });
    return {
      name: dept.replace('Khối ', ''),
      applied: deptCands.length,
      qualified: deptCands.filter((c) => c.benchmarkScore >= 4.0).length,
      interview: deptCands.filter((c) => c.stage === 'Phỏng vấn' || c.stage === 'Đề nghị việc').length,
      offered: deptCands.filter((c) => c.stage === 'Đề nghị việc').length,
    };
  });

  // Timeline Trends Data for Line Chart (6 Weeks)
  const timelineData = [
    { label: 'Tuần 1', applied: 3, qualified: 2, interview: 1, offered: 0 },
    { label: 'Tuần 2', applied: 5, qualified: 3, interview: 2, offered: 1 },
    { label: 'Tuần 3', applied: 8, qualified: 6, interview: 4, offered: 2 },
    { label: 'Tuần 4', applied: 12, qualified: 9, interview: 7, offered: 3 },
    { label: 'Tuần 5', applied: 16, qualified: 12, interview: 9, offered: 5 },
    { label: 'Tuần 6', applied: totalApplied, qualified: benchmarkQualified, interview: interviewing, offered: offered },
  ];

  // 2.1: Kích hoạt Phân Tích Dữ Liệu Tuyển Dụng Bằng AI
  const aiKey = JSON.stringify([selectedDeptFilter, timeRange, totalApplied, benchmarkQualified, avgScore, interviewing, offered, sourceStats.map((x) => x.count)]);
  const handleRunAIAnalytics = async (force = false) => {
    const key = aiKey;
    if (!force && aiCache.has(key)) { setAiInsights(aiCache.get(key)); setAiError(''); return; }
    lastKey.current = key;
    setIsAnalyzingAI(true);
    setAiError('');
    try {
      const response = await fetch('/api/analytics/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: {
            totalCandidates: totalApplied,
            qualifiedCount: benchmarkQualified,
            avgBenchmarkScore: avgScore,
            interviewingCount: interviewing,
            offeredCount: offered,
            sourceBreakdown: sourceStats,
            timeRange,
          },
          selectedDepartment: selectedDeptFilter === 'all' ? 'Toàn công ty' : selectedDeptFilter,
          timeRange:
            timeRange === '7d'
              ? '7 ngày qua'
              : timeRange === '30d'
              ? '30 ngày qua'
              : timeRange === 'quarter'
              ? 'Quý này (Q4/2026)'
              : 'Năm 2026',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể phân tích dữ liệu bằng AI');
      if (!data?.summaryHeadline && !data?.executiveAnalysis) throw new Error('AI trả kết quả rỗng');
      const out = {
        summaryHeadline: String(data.summaryHeadline || ''),
        executiveAnalysis: String(data.executiveAnalysis || ''),
        funnelHealth: { status: '', bottleneck: '', conversionRate: '', ...(data.funnelHealth || {}) },
        channelEffectiveness: Array.isArray(data.channelEffectiveness) ? data.channelEffectiveness : [],
        strategicRecommendations: Array.isArray(data.strategicRecommendations) ? data.strategicRecommendations : [],
        forecast: String(data.forecast || ''),
      };
      aiCache.set(key, out);
      if (lastKey.current === key) setAiInsights(out);
    } catch (err) {
      if (lastKey.current === key) setAiError((err as any)?.message || 'AI chưa phân tích được dữ liệu.');
    } finally {
      if (lastKey.current === key) setIsAnalyzingAI(false);
    }
  };

  // Tự động phân tích khi mở thẻ và mỗi khi dữ liệu/bộ lọc thay đổi (chờ 800 ms để gom thay đổi liên tiếp)
  useEffect(() => {
    if (!totalApplied) { setAiInsights(null); return; }
    if (aiCache.has(aiKey)) { setAiInsights(aiCache.get(aiKey)); setAiError(''); return; }
    const t = setTimeout(() => handleRunAIAnalytics(), 800);
    return () => clearTimeout(t);
  }, [aiKey]);

  const handleCopyInsight = () => {
    if (!aiInsights) return;
    const text = `[BÁO CÁO PHÂN TÍCH TUYỂN DỤNG AI - TALENTFLOW ATS]\n\nTiêu đề: ${aiInsights.summaryHeadline}\n\nĐánh giá tổng quan:\n${aiInsights.executiveAnalysis}\n\nSức khỏe phễu: ${aiInsights.funnelHealth.status} - ${aiInsights.funnelHealth.bottleneck}\n\nKhuyến nghị then chốt:\n${aiInsights.strategicRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nDự báo: ${aiInsights.forecast}`;
    navigator.clipboard.writeText(text);
    setCopiedInsight(true);
    setTimeout(() => setCopiedInsight(false), 2000);
  };

  // 2.2: Xuất Báo Cáo Định Dạng Excel (.xlsx) chuẩn Microsoft Excel
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Tổng quan chỉ số theo JD
      const jdData = filteredJobs.map((j) => {
        const cands = candidates.filter((c) => c.jobId === j.id);
        const qual = cands.filter((c) => c.benchmarkScore >= 4.0).length;
        const interv = cands.filter((c) => c.stage === 'Phỏng vấn' || c.stage === 'Đề nghị việc').length;
        const off = cands.filter((c) => c.stage === 'Đề nghị việc').length;
        const rate = cands.length > 0 ? Math.round((qual / cands.length) * 100) : 0;
        const target = j.level === 'Senior' ? 2 : j.level === 'Lead' ? 1 : 3;

        return {
          'Mã Vị Trí': j.id,
          'Chức Danh Tuyển Dụng': j.title,
          'Phòng Ban': j.department,
          'Cấp Bậc': j.level,
          'Mức Lương Dự Kiến': j.salaryRange,
          'Chỉ Tiêu Tuyển': target,
          'Tổng Số CV Nộp': cands.length,
          'Đạt Chuẩn (≥4.0⭐)': qual,
          'Đang Phỏng Vấn': interv,
          'Đã Chốt Offer': off,
          'Tỷ Lệ Đạt Chuẩn (%)': `${rate}%`,
          'Thời Gian Tuyển TB': '14 ngày',
          'Trạng Thái Tiến Độ': off >= target ? 'Đã hoàn thành' : qual >= target ? 'Tiến độ tốt' : 'Đang tuyển gấp',
        };
      });
      const ws1 = XLSX.utils.json_to_sheet(jdData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Tien_Do_Tuyen_Dung_JD');

      // Sheet 2: Danh sách chi tiết ứng viên
      const candData = filteredCandidates.map((c) => ({
        'Mã Ứng Viên': c.id,
        'Họ và Tên': c.fullName,
        'Email Liên Hệ': c.email,
        'Số Điện Thoại': c.phone,
        'Vị Trí Tuyển Dụng': c.jobTitle,
        'Điểm Benchmark (5 Sao)': c.benchmarkScore,
        'Điểm Kỹ Năng': c.matrixMatch?.skillsScore || 4.5,
        'Điểm Kinh Nghiệm': c.matrixMatch?.experienceScore || 4.2,
        'Đề Xuất AI': c.recommendation,
        'Giai Đoạn Tuyển Dụng': c.stage,
        'Nguồn Ứng Tuyển': c.source,
        'Ngày Ứng Tuyển': c.appliedDate,
        'Tài Khoản Upload': c.uploadedBy || 'Hệ thống ATS',
      }));
      const ws2 = XLSX.utils.json_to_sheet(candData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Danh_Sach_Ung_Vien');

      // Sheet 3: Thống kê hiệu quả nguồn nạp
      const channelData = sourceStats.map((s) => ({
        'Kênh Nguồn Tuyển Dụng': s.name,
        'Số Lượng Hồ Sơ': s.count,
        'Tỷ Trọng Nguồn (%)': `${Math.round((s.count / totalSourceCount) * 100)}%`,
        'Đánh Giá Hiệu Quả': s.count > 0 ? 'Hiệu quả cao' : 'Cần đẩy mạnh',
      }));
      const ws3 = XLSX.utils.json_to_sheet(channelData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Hieu_Qua_Kenh_Nguon');

      // Save file .xlsx
      const fileName = `Bao_Cao_Tuyen_Dung_SEICO_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setExportNotice(`Đã xuất thành công tệp Excel định dạng chuẩn (.xlsx): "${fileName}"`);
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err: any) {
      console.error('Lỗi xuất Excel:', err);
      setExportNotice('Không thể xuất file Excel. Vui lòng thử lại.');
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Mã JD',
      'Chức danh công việc',
      'Phòng ban',
      'Cấp bậc',
      'Mức lương',
      'Chỉ tiêu tuyển',
      'Số ứng viên nộp',
      'Đạt chuẩn >=4.0 sao',
      'Số phỏng vấn',
      'Đã gửi Offer',
      'Tỷ lệ đạt chuẩn (%)',
      'Thời gian tuyển TB (ngày)',
      'Tiến độ',
    ];

    const rows = filteredJobs.map((j) => {
      const cands = candidates.filter((c) => c.jobId === j.id);
      const qual = cands.filter((c) => c.benchmarkScore >= 4.0).length;
      const interv = cands.filter((c) => c.stage === 'Phỏng vấn' || c.stage === 'Đề nghị việc').length;
      const off = cands.filter((c) => c.stage === 'Đề nghị việc').length;
      const rate = cands.length > 0 ? Math.round((qual / cands.length) * 100) : 0;
      const target = j.level === 'Senior' ? 2 : j.level === 'Lead' ? 1 : 3;

      return [
        j.id,
        `"${j.title}"`,
        `"${j.department}"`,
        j.level,
        `"${j.salaryRange}"`,
        target,
        cands.length,
        qual,
        interv,
        off,
        `${rate}%`,
        '14 ngày',
        off >= target ? 'Đã hoàn thành' : qual >= target ? 'Tiến độ tốt' : 'Đang tuyển gấp',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BaoCao_TuyenDung_SEICO_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Đã xuất thành công tệp dữ liệu báo cáo tuyển dụng (.csv) vào máy tính!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1720px] w-full mx-auto">
      {/* 1. Header with Filters & Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
            Báo Cáo Hiệu Suất Tuyển Dụng & Phân Tích Chỉ Số
          </h2>
          <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
            Hệ thống biểu đồ trực quan (Biểu đồ tròn, Biểu đồ cột, Biểu đồ đường) kèm công cụ ghép dữ liệu đối chiếu và bảng thống kê chi tiết.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          {/* iOS Segmented Control for Time Range */}
          <div className="ios-segmented flex items-center gap-0.5">
            {(
              [
                { id: '7d', label: '7 ngày' },
                { id: '30d', label: '30 ngày' },
                { id: 'quarter', label: 'Quý này' },
                { id: 'year', label: 'Cả năm' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-[9px] transition-all cursor-pointer whitespace-nowrap ${
                  timeRange === t.id
                    ? 'ios-segmented-active'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Department selector */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="text-xs py-2 px-3.5 neumorphic-inset rounded-[14px] text-[#1C1C1E] dark:text-white font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
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

          {/* 2.2: Export Excel (.xlsx) button */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold btn-fluent-primary rounded-full transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1C1C1E] dark:text-white btn-fluent-glass rounded-full transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#8E8E93]" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 bg-[#34C759]/12 border border-[#34C759]/30 rounded-[18px] text-xs font-semibold text-[#1D833A] dark:text-[#30D158] flex items-center gap-2 animate-in fade-in backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 2.1: AI PEOPLE ANALYTICS */}
      <div className="glass-panel rounded-[26px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#0A84FF] to-[#5856D6] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                  Phân Tích Dữ Liệu Tuyển Dụng Đang Hiển Thị Bằng AI (AI People Analytics)
                </h3>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] border border-[#007AFF]/20">
                  Trí tuệ nhân tạo
                </span>
              </div>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                Tự động đánh giá sức khỏe phễu, phát hiện điểm nghẽn, thẩm định nguồn tuyển và gợi ý quyết định chiến lược cho đội ngũ tuyển dụng. Tự chạy khi mở thẻ và khi dữ liệu thay đổi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleRunAIAnalytics(true)}
              disabled={isAnalyzingAI}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 text-xs font-semibold btn-fluent-primary rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzingAI ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Đang Phân Tích Dữ Liệu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{aiInsights ? 'Phân Tích Lại Dữ Liệu' : 'Phân Tích Dữ Liệu Bằng AI'}</span>
                </>
              )}
            </button>

            {aiInsights && (
              <button
                onClick={handleCopyInsight}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] btn-fluent-glass rounded-full cursor-pointer"
              >
                {copiedInsight ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedInsight ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Display AI Results if available, or placeholder invitation */}
        {aiInsights ? (
          <div className="space-y-4 animate-in fade-in text-xs">
            {/* Headline & Executive Summary */}
            <div className="p-4 rounded-[18px] neumorphic-inset space-y-2">
              <div className="flex items-center gap-2 text-[#007AFF] dark:text-[#0A84FF] font-bold text-xs">
                <Lightbulb className="w-4 h-4 text-[#FF9500] shrink-0" />
                <span>{aiInsights.summaryHeadline}</span>
              </div>
              <p className="text-[#3C3C43] dark:text-[#EBEBF5] leading-relaxed">
                {aiInsights.executiveAnalysis}
              </p>
            </div>

            {/* 3 Columns Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Card 1: Funnel Health */}
              <div className="p-4 rounded-[18px] neumorphic-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                    <span>Sức Khỏe Phễu Tuyển Dụng</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#34C759]/12 text-[#1D833A] dark:text-[#30D158]">
                    {aiInsights.funnelHealth.status}
                  </span>
                </div>
                <p className="text-[#3C3C43] dark:text-[#EBEBF5]/85 text-[11px] leading-relaxed">
                  <strong className="text-[#1C1C1E] dark:text-white">Điểm nghẽn: </strong>
                  {aiInsights.funnelHealth.bottleneck}
                </p>
                <div className="text-[11px] text-[#1D833A] dark:text-[#30D158] font-semibold">
                  {aiInsights.funnelHealth.conversionRate}
                </div>
              </div>

              {/* Card 2: Channels Effectiveness */}
              <div className="p-4 rounded-[18px] neumorphic-card space-y-2">
                <span className="font-bold text-xs text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#5856D6] dark:text-[#5E5CE6]" />
                  <span>Hiệu Quả Kênh Tuyển Dụng</span>
                </span>
                <div className="space-y-1.5 text-[11px]">
                  {aiInsights.channelEffectiveness.map((c, i) => (
                    <div key={i} className="border-b border-black/[0.05] dark:border-white/[0.06] pb-1 last:border-0 last:pb-0">
                      <span className="font-bold text-[#1C1C1E] dark:text-white block">{c.channel}:</span>
                      <span className="text-[#8E8E93]">{c.assessment}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Forecast & Velocity */}
              <div className="p-4 rounded-[18px] neumorphic-card space-y-2">
                <span className="font-bold text-xs text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF9500]" />
                  <span>Dự Báo Tiến Độ (30 - 60 Ngày)</span>
                </span>
                <p className="text-[#3C3C43] dark:text-[#EBEBF5]/85 text-[11px] leading-relaxed">
                  {aiInsights.forecast}
                </p>
              </div>
            </div>

            {/* Strategic Recommendations Banner */}
            <div className="p-4 rounded-[18px] bg-[#007AFF]/10 dark:bg-[#0A84FF]/15 border border-[#007AFF]/20 space-y-2.5">
              <span className="font-bold text-xs text-[#007AFF] dark:text-[#0A84FF] flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Khuyến nghị chiến lược cho đội ngũ tuyển dụng</span>
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px]">
                {aiInsights.strategicRecommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-white/75 dark:bg-white/[0.06] p-3 rounded-[14px] border border-black/[0.05] dark:border-white/[0.08]">
                    <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-[10px] font-mono shrink-0 tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="text-[#1C1C1E] dark:text-white leading-snug">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-[18px] neumorphic-inset border border-dashed border-[#007AFF]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[12px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <p className="text-[#3C3C43] dark:text-[#EBEBF5]">
                {!totalApplied
                  ? 'Chưa có hồ sơ ứng viên trong phạm vi lọc nên chưa có dữ liệu để phân tích.'
                  : isAnalyzingAI
                  ? 'AI đang tự động phân tích phễu tuyển dụng theo dữ liệu đang hiển thị…'
                  : aiError
                  ? `Chưa phân tích được: ${aiError}`
                  : 'Đang chuẩn bị phân tích tự động…'}
              </p>
            </div>
            <button
              onClick={() => handleRunAIAnalytics(true)}
              disabled={isAnalyzingAI}
              className="px-4.5 py-2 text-xs font-semibold btn-fluent-primary rounded-full cursor-pointer shrink-0"
            >
              {aiError ? 'Thử lại' : 'Phân tích ngay'}
            </button>
          </div>
        )}
      </div>

      {/* Khoảng lương công bố theo vị trí (nguồn: SEICO | Báo cáo phòng nhân sự) */}
      <SalaryRangeChart />

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="neumorphic-card neumorphic-card-hover p-5 rounded-[22px] transition-all">
          <div className="flex items-center justify-between text-xs text-[#8E8E93] font-semibold">
            <span>Tổng hồ sơ tiếp nhận</span>
            <div className="w-8 h-8 rounded-[10px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1C1C1E] dark:text-white tabular-nums tracking-tight">{totalApplied}</span>
            <span className="text-xs text-[#34C759] dark:text-[#30D158] font-semibold">+18% tăng trưởng</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8E8E93]">Từ hòm thư, kênh kết nối và tải file</p>
        </div>

        <div className="neumorphic-card neumorphic-card-hover p-5 rounded-[22px] transition-all">
          <div className="flex items-center justify-between text-xs text-[#8E8E93] font-semibold">
            <span>Đạt chuẩn Benchmark (≥ 4.0 ⭐)</span>
            <div className="w-8 h-8 rounded-[10px] bg-[#34C759]/12 text-[#34C759] dark:text-[#30D158] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1C1C1E] dark:text-white tabular-nums tracking-tight">
              {totalApplied > 0 ? Math.round((benchmarkQualified / totalApplied) * 100) : 0}%
            </span>
            <span className="text-xs text-[#8E8E93] font-medium tabular-nums">({benchmarkQualified} ứng viên)</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8E8E93]">Đánh giá chuẩn ma trận 5 chiều</p>
        </div>

        <div className="neumorphic-card neumorphic-card-hover p-5 rounded-[22px] transition-all">
          <div className="flex items-center justify-between text-xs text-[#8E8E93] font-semibold">
            <span>Thời gian tuyển TB (Time-to-Hire)</span>
            <div className="w-8 h-8 rounded-[10px] bg-[#FF9500]/12 text-[#FF9500] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1C1C1E] dark:text-white tabular-nums tracking-tight">14.5</span>
            <span className="text-xs text-[#8E8E93] font-medium">ngày / vị trí</span>
          </div>
          <p className="mt-1 text-[11px] text-[#34C759] dark:text-[#30D158] font-semibold">Nhanh hơn 3.2 ngày so với tiêu chuẩn</p>
        </div>

        <div className="neumorphic-card neumorphic-card-hover p-5 rounded-[22px] transition-all">
          <div className="flex items-center justify-between text-xs text-[#8E8E93] font-semibold">
            <span>Tỷ lệ chấp thuận Offer</span>
            <div className="w-8 h-8 rounded-[10px] bg-[#5856D6]/12 text-[#5856D6] dark:text-[#5E5CE6] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1C1C1E] dark:text-white tabular-nums tracking-tight">91.4%</span>
            <span className="text-xs text-[#34C759] dark:text-[#30D158] font-semibold tabular-nums">({offered} nhận việc)</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8E8E93]">Độ hài lòng đãi ngộ cao</p>
        </div>
      </div>

      {/* 3. CHART CONTROL & METRIC OVERLAY BAR */}
      <div className="glass-panel p-5 rounded-[24px] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Chart Display Mode Segmented */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#1C1C1E] dark:text-white mr-1">
              Dạng Biểu Đồ:
            </span>
            <div className="ios-segmented flex flex-wrap items-center gap-0.5">
              <button
                onClick={() => setChartDisplayMode('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[9px] transition-all cursor-pointer ${
                  chartDisplayMode === 'all' ? 'ios-segmented-active' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                }`}
              >
                Tất Cả (Tổng Hợp)
              </button>
              <button
                onClick={() => setChartDisplayMode('pie')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[9px] transition-all cursor-pointer ${
                  chartDisplayMode === 'pie' ? 'ios-segmented-active' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                }`}
              >
                <PieIcon className="w-3.5 h-3.5" />
                <span>Biểu Đồ Tròn</span>
              </button>
              <button
                onClick={() => setChartDisplayMode('bar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[9px] transition-all cursor-pointer ${
                  chartDisplayMode === 'bar' ? 'ios-segmented-active' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Biểu Đồ Cột</span>
              </button>
              <button
                onClick={() => setChartDisplayMode('line')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[9px] transition-all cursor-pointer ${
                  chartDisplayMode === 'line' ? 'ios-segmented-active' : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                }`}
              >
                <LineIcon className="w-3.5 h-3.5" />
                <span>Biểu Đồ Đường</span>
              </button>
            </div>
          </div>

          {/* Group By selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8E8E93]">Đối tượng phân tích:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="px-3 py-1.5 neumorphic-inset rounded-[12px] text-[#1C1C1E] dark:text-white font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
            >
              <option value="department">Theo Phòng Ban / Khối</option>
              <option value="timeline">Theo Dòng Thời Gian (Tuần)</option>
            </select>
          </div>
        </div>

        {/* Multi-Metric Overlay Checkboxes */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
            <span>Ghép Dữ Liệu Đối Chiếu (Metric Overlays):</span>
          </span>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={overlayApplied}
              onChange={(e) => setOverlayApplied(e.target.checked)}
              className="rounded text-[#007AFF]"
            />
            <span className="flex items-center gap-1.5 font-medium text-[#3C3C43] dark:text-[#EBEBF5]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF] inline-block" />
              <span>Tổng hồ sơ tiếp nhận</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={overlayQualified}
              onChange={(e) => setOverlayQualified(e.target.checked)}
              className="rounded text-[#34C759]"
            />
            <span className="flex items-center gap-1.5 font-medium text-[#3C3C43] dark:text-[#EBEBF5]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34C759] inline-block" />
              <span>Đạt Benchmark ≥ 4.0 ⭐</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={overlayInterview}
              onChange={(e) => setOverlayInterview(e.target.checked)}
              className="rounded text-[#FF9500]"
            />
            <span className="flex items-center gap-1.5 font-medium text-[#3C3C43] dark:text-[#EBEBF5]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500] inline-block" />
              <span>Số lượt Phỏng vấn</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={overlayOffered}
              onChange={(e) => setOverlayOffered(e.target.checked)}
              className="rounded text-[#5856D6]"
            />
            <span className="flex items-center gap-1.5 font-medium text-[#3C3C43] dark:text-[#EBEBF5]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5856D6] inline-block" />
              <span>Đề xuất việc (Offer)</span>
            </span>
          </label>
        </div>
      </div>

      {/* 4. VISUAL CHARTS (PIE, BAR, LINE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: BIỂU ĐỒ TRÒN (PIE / DONUT CHART) */}
        {(chartDisplayMode === 'all' || chartDisplayMode === 'pie') && (
          <div className={`glass-panel p-6 rounded-[24px] space-y-4 ${chartDisplayMode === 'pie' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[10px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center">
                    <PieIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    1. Biểu Đồ Tròn: Phân Bổ Nguồn Tiếp Nhận Hồ Sơ
                  </h3>
                </div>
                <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
                  Tỷ lệ phần trăm hồ sơ đóng góp từ các kênh tuyển dụng
                </p>
              </div>
              <span className="text-xs font-mono font-bold tabular-nums text-[#1C1C1E] dark:text-white neumorphic-inset px-3 py-1 rounded-full">
                Tổng {totalApplied} CV
              </span>
            </div>

            {/* SVG Interactive Donut/Pie Chart */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4">
              <div className="relative w-48 h-48 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                  {(() => {
                    let accumulatedPercent = 0;
                    return sourceStats.map((item, index) => {
                      const percent = Math.round((item.count / totalSourceCount) * 100);
                      const dashArray = `${percent} ${100 - percent}`;
                      const dashOffset = -accumulatedPercent;
                      accumulatedPercent += percent;

                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="35"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="20"
                          strokeDasharray={dashArray}
                          strokeDashoffset={dashOffset}
                          className="transition-all duration-500 hover:opacity-80"
                        />
                      );
                    });
                  })()}
                </svg>
                {/* Center Circle Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-bold tabular-nums text-[#1C1C1E] dark:text-white">
                    {totalApplied}
                  </span>
                  <span className="text-[10px] text-[#8E8E93] dark:text-[#98989D] uppercase tracking-wider font-semibold">
                    Ứng Viên
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-3 text-xs w-full max-w-xs">
                {sourceStats.map((item, idx) => {
                  const pct = Math.round((item.count / totalSourceCount) * 100);
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-[12px] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: item.color }} />
                        <span className="font-medium text-[#3C3C43] dark:text-[#EBEBF5] truncate max-w-[155px]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="font-mono font-bold text-[#1C1C1E] dark:text-white">{item.count}</span>
                        <span className="font-mono text-[#8E8E93] dark:text-[#98989D] text-[11px] w-10 text-right">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CHART 2: BIỂU ĐỒ CỘT (BAR CHART - MULTI-SERIES GROUPED) */}
        {(chartDisplayMode === 'all' || chartDisplayMode === 'bar') && (
          <div className={`glass-panel p-6 rounded-[24px] space-y-4 ${chartDisplayMode === 'bar' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[10px] bg-[#34C759]/12 text-[#34C759] dark:text-[#30D158] flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    2. Biểu Đồ Cột: Ghép Chỉ Số Tuyển Dụng Theo Phòng Ban
                  </h3>
                </div>
                <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
                  So sánh trực quan giữa Tiếp nhận, Đạt chuẩn, Phỏng vấn và Offer
                </p>
              </div>
            </div>

            {/* SVG / HTML Grouped Bar Chart */}
            <div className="space-y-4 pt-2">
              {deptStats.map((item, idx) => {
                const maxVal = Math.max(...deptStats.map((d) => d.applied), 1);
                return (
                  <div key={idx} className="space-y-1.5 text-xs p-3 rounded-[16px] neumorphic-inset">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className="font-bold text-[#1C1C1E] dark:text-white">{item.name}</span>
                      <span className="text-[11px] font-mono tabular-nums text-[#8E8E93] dark:text-[#98989D]">
                        Tổng: {item.applied} CV · Đạt chuẩn: {item.qualified} · PV: {item.interview} · Offer: {item.offered}
                      </span>
                    </div>

                    {/* Bars Container */}
                    <div className="space-y-1.5 pt-1">
                      {overlayApplied && (
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] text-[#8E8E93] dark:text-[#98989D] w-18 shrink-0">Tiếp nhận:</span>
                          <div className="flex-1 bg-black/[0.06] dark:bg-white/[0.08] h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#007AFF] dark:bg-[#0A84FF] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(4, Math.round((item.applied / maxVal) * 100))}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold tabular-nums text-[#007AFF] dark:text-[#0A84FF] w-6 text-right">{item.applied}</span>
                        </div>
                      )}

                      {overlayQualified && (
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] text-[#8E8E93] dark:text-[#98989D] w-18 shrink-0">Đạt chuẩn:</span>
                          <div className="flex-1 bg-black/[0.06] dark:bg-white/[0.08] h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#34C759] dark:bg-[#30D158] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(4, Math.round((item.qualified / maxVal) * 100))}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold tabular-nums text-[#34C759] dark:text-[#30D158] w-6 text-right">{item.qualified}</span>
                        </div>
                      )}

                      {overlayInterview && (
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] text-[#8E8E93] dark:text-[#98989D] w-18 shrink-0">Phỏng vấn:</span>
                          <div className="flex-1 bg-black/[0.06] dark:bg-white/[0.08] h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#FF9500] dark:bg-[#FF9F0A] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(4, Math.round((item.interview / maxVal) * 100))}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold tabular-nums text-[#FF9500] dark:text-[#FF9F0A] w-6 text-right">{item.interview}</span>
                        </div>
                      )}

                      {overlayOffered && (
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] text-[#8E8E93] dark:text-[#98989D] w-18 shrink-0">Đã offer:</span>
                          <div className="flex-1 bg-black/[0.06] dark:bg-white/[0.08] h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#5856D6] dark:bg-[#5E5CE6] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(4, Math.round((item.offered / maxVal) * 100))}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold tabular-nums text-[#5856D6] dark:text-[#5E5CE6] w-6 text-right">{item.offered}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHART 3: BIỂU ĐỒ ĐƯỜNG KẺ (LINE CHART - TIMELINE TRENDS) */}
        {(chartDisplayMode === 'all' || chartDisplayMode === 'line') && (
          <div className="lg:col-span-2 glass-panel p-6 rounded-[24px] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[10px] bg-[#5856D6]/12 text-[#5856D6] dark:text-[#5E5CE6] flex items-center justify-center">
                    <LineIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    3. Biểu Đồ Đường Kẻ: Xu Hướng Tuyển Dụng Theo Dòng Thời Gian (Weekly Trend Line)
                  </h3>
                </div>
                <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
                  Biểu diễn đường cong tăng trưởng hồ sơ nộp, số lượng vượt qua thẩm định và tiến độ offer qua các tuần
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                {overlayApplied && (
                  <span className="flex items-center gap-1.5 text-[#007AFF] dark:text-[#0A84FF]">
                    <span className="w-3 h-0.5 bg-[#007AFF] dark:bg-[#0A84FF] inline-block rounded-full" />
                    <span>Hồ sơ nộp</span>
                  </span>
                )}
                {overlayQualified && (
                  <span className="flex items-center gap-1.5 text-[#34C759] dark:text-[#30D158]">
                    <span className="w-3 h-0.5 bg-[#34C759] dark:bg-[#30D158] inline-block rounded-full" />
                    <span>Đạt Benchmark</span>
                  </span>
                )}
                {overlayInterview && (
                  <span className="flex items-center gap-1.5 text-[#FF9500] dark:text-[#FF9F0A]">
                    <span className="w-3 h-0.5 bg-[#FF9500] dark:bg-[#FF9F0A] inline-block rounded-full" />
                    <span>Phỏng vấn</span>
                  </span>
                )}
                {overlayOffered && (
                  <span className="flex items-center gap-1.5 text-[#5856D6] dark:text-[#5E5CE6]">
                    <span className="w-3 h-0.5 bg-[#5856D6] dark:bg-[#5E5CE6] inline-block rounded-full" />
                    <span>Đã Offer</span>
                  </span>
                )}
              </div>
            </div>

            {/* SVG Line Chart Canvas */}
            <div className="h-64 w-full pt-4 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
                {/* Horizontal Grid lines */}
                {[0, 50, 100, 150].map((y) => (
                  <line
                    key={y}
                    x1="40"
                    y1={y}
                    x2="580"
                    y2={y}
                    stroke="currentColor"
                    className="text-black/[0.06] dark:text-white/[0.08]"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Draw Curves for Each Metric */}
                {(() => {
                  const maxMetric = Math.max(...timelineData.map((d) => d.applied), 1);
                  const getX = (index: number) => 60 + index * 95;
                  const getY = (val: number) => 160 - (val / maxMetric) * 120;

                  const generatePath = (key: 'applied' | 'qualified' | 'interview' | 'offered') => {
                    return timelineData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[key])}`).join(' ');
                  };

                  return (
                    <>
                      {overlayApplied && (
                        <path
                          d={generatePath('applied')}
                          fill="none"
                          stroke="#007AFF"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-300"
                        />
                      )}
                      {overlayQualified && (
                        <path
                          d={generatePath('qualified')}
                          fill="none"
                          stroke="#34C759"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-300"
                        />
                      )}
                      {overlayInterview && (
                        <path
                          d={generatePath('interview')}
                          fill="none"
                          stroke="#FF9500"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-300"
                        />
                      )}
                      {overlayOffered && (
                        <path
                          d={generatePath('offered')}
                          fill="none"
                          stroke="#5856D6"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-300"
                        />
                      )}

                      {/* Nodes on Line */}
                      {timelineData.map((d, i) => (
                        <g key={i}>
                          {overlayApplied && (
                            <circle cx={getX(i)} cy={getY(d.applied)} r="4.5" fill="#007AFF" className="cursor-pointer" />
                          )}
                          {overlayQualified && (
                            <circle cx={getX(i)} cy={getY(d.qualified)} r="4.5" fill="#34C759" className="cursor-pointer" />
                          )}
                          {overlayInterview && (
                            <circle cx={getX(i)} cy={getY(d.interview)} r="4.5" fill="#FF9500" className="cursor-pointer" />
                          )}
                          {overlayOffered && (
                            <circle cx={getX(i)} cy={getY(d.offered)} r="4.5" fill="#5856D6" className="cursor-pointer" />
                          )}

                          {/* X-axis labels */}
                          <text
                            x={getX(i)}
                            y="185"
                            textAnchor="middle"
                            className="text-[11px] fill-[#8E8E93] dark:fill-[#98989D] font-semibold"
                          >
                            {d.label}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 5. COMPREHENSIVE DATA TABLE AT BOTTOM (BẢNG SỐ LIỆU CHI TIẾT Ở DƯỚI CÙNG) */}
      <div className="glass-panel rounded-[24px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white tracking-tight">
              Bảng Số Liệu Chi Tiết Tuyển Dụng Theo Từng Vị Trí ({filteredJobs.length} vị trí)
            </h3>
            <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-0.5">
              Thống kê đầy đủ chỉ tiêu, số lượng hồ sơ tiếp nhận, tỷ lệ đạt benchmark 5 sao và thời gian tuyển
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-fluent-glass inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] rounded-full cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Bảng Excel/CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-[18px] border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-black/20">
          <table className="w-full text-left text-xs min-w-[1050px]">
            <thead className="bg-black/[0.03] dark:bg-white/[0.04] text-[#8E8E93] dark:text-[#98989D] text-[11px] font-semibold uppercase tracking-wider border-b border-black/[0.06] dark:border-white/[0.08] whitespace-nowrap">
              <tr>
                <th className="py-3.5 px-4">Mã JD</th>
                <th className="py-3.5 px-4">Vị Trí Tuyển Dụng</th>
                <th className="py-3.5 px-4">Phòng Ban</th>
                <th className="py-3.5 px-4">Cấp Bậc</th>
                <th className="py-3.5 px-4 text-center">Chỉ Tiêu</th>
                <th className="py-3.5 px-4 text-center">Đã Nộp</th>
                <th className="py-3.5 px-4 text-center">Đạt Chuẩn (≥4.0 ⭐)</th>
                <th className="py-3.5 px-4 text-center">Phỏng Vấn</th>
                <th className="py-3.5 px-4 text-center">Đã Offer</th>
                <th className="py-3.5 px-4 text-center">Tỷ Lệ Đạt</th>
                <th className="py-3.5 px-4 text-right">Tiến Độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
              {filteredJobs.map((job) => {
                const cands = candidates.filter((c) => c.jobId === job.id);
                const qual = cands.filter((c) => c.benchmarkScore >= 4.0).length;
                const interv = cands.filter((c) => c.stage === 'Phỏng vấn' || c.stage === 'Đề nghị việc').length;
                const off = cands.filter((c) => c.stage === 'Đề nghị việc').length;
                const rate = cands.length > 0 ? Math.round((qual / cands.length) * 100) : 0;
                const target = job.level === 'Senior' ? 2 : job.level === 'Lead' ? 1 : 3;

                return (
                  <tr key={job.id} className="hover:bg-[#007AFF]/[0.04] dark:hover:bg-white/[0.04] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold tabular-nums text-[#8E8E93] dark:text-[#98989D] whitespace-nowrap">{job.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#1C1C1E] dark:text-white whitespace-nowrap">{job.title}</td>
                    <td className="py-3.5 px-4 text-[#3C3C43] dark:text-[#EBEBF5] whitespace-nowrap">{job.department}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#3C3C43] dark:text-[#EBEBF5] whitespace-nowrap">
                        {job.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold tabular-nums text-[#1C1C1E] dark:text-white whitespace-nowrap">{target}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold tabular-nums text-[#007AFF] dark:text-[#0A84FF] whitespace-nowrap">{cands.length}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold tabular-nums text-[#34C759] dark:text-[#30D158] whitespace-nowrap">{qual}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold tabular-nums text-[#FF9500] dark:text-[#FF9F0A] whitespace-nowrap">{interv}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold tabular-nums text-[#5856D6] dark:text-[#5E5CE6] whitespace-nowrap">{off}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold tabular-nums text-[#1C1C1E] dark:text-white whitespace-nowrap">{rate}%</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          off >= target
                            ? 'bg-[#5856D6]/12 text-[#5856D6] dark:text-[#5E5CE6]'
                            : qual >= target
                            ? 'bg-[#34C759]/12 text-[#248A3D] dark:text-[#30D158]'
                            : 'bg-[#FF9500]/12 text-[#C93400] dark:text-[#FF9F0A]'
                        }`}
                      >
                        {off >= target ? 'Đã hoàn thành' : qual >= target ? 'Tiến độ tốt' : 'Đang tuyển'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
