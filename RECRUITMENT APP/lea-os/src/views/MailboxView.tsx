import React, { useState } from 'react';
import {
  Mail,
  RefreshCw,
  Lock,
  Server,
  User,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  Eye,
  Sliders,
  AlertCircle,
  Clock,
  Paperclip,
  Check,
  Send,
  MessageSquare,
  Calendar,
  XCircle,
  Copy,
  ExternalLink,
  ChevronDown,
  Star,
  Info,
} from 'lucide-react';
import {
  Candidate,
  CandidateStage,
  InboundEmail,
  JobPosition,
  MailboxSettings,
  QuickReplyHistory,
} from '../types';
import { TabType } from '../components/Sidebar';

interface MailboxViewProps {
  mailboxSettings: MailboxSettings;
  onUpdateSettings: (settings: MailboxSettings) => void;
  inboundEmails: InboundEmail[];
  jobs: JobPosition[];
  candidates: Candidate[];
  onScanAndProcessEmail: (email: InboundEmail) => Promise<string>;
  onBatchScanEmails: () => Promise<number>;
  onNavigate: (tab: TabType) => void;
  isScanning: boolean;
  onSendQuickReply?: (
    emailId: string,
    reply: QuickReplyHistory,
    targetCandidateStage?: CandidateStage
  ) => void;
}

type QuickReplyType = 'thank_you' | 'interview_invite' | 'rejection' | 'request_info';

export const MailboxView: React.FC<MailboxViewProps> = ({
  mailboxSettings,
  onUpdateSettings,
  inboundEmails,
  jobs,
  candidates,
  onScanAndProcessEmail,
  onBatchScanEmails,
  onNavigate,
  isScanning,
  onSendQuickReply,
}) => {
  // Settings Form State
  const [emailAddress, setEmailAddress] = useState(mailboxSettings.emailAddress);
  const [mailServer, setMailServer] = useState(mailboxSettings.mailServer);
  const [accountId, setAccountId] = useState(mailboxSettings.accountId);
  const [password, setPassword] = useState(mailboxSettings.passwordMasked);
  const [intervalMin, setIntervalMin] = useState(mailboxSettings.autoCheckIntervalMinutes);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Email Viewer Modal
  const [selectedEmail, setSelectedEmail] = useState<InboundEmail | null>(null);
  const [processingSingleId, setProcessingSingleId] = useState<string | null>(null);

  // Batch Scan Results feedback
  const [scanResultNotice, setScanResultNotice] = useState<string | null>(null);

  // --- Quick Reply Modal State ---
  const [quickReplyEmail, setQuickReplyEmail] = useState<InboundEmail | null>(null);
  const [quickReplyType, setQuickReplyType] = useState<QuickReplyType>('interview_invite');
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [suggestedTone, setSuggestedTone] = useState('');
  const [actionRecommended, setActionRecommended] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [autoUpdateCandidateStage, setAutoUpdateCandidateStage] = useState(true);
  const [copiedToast, setCopiedToast] = useState(false);

  // Interview Schedule Specifics (used when replyType === 'interview_invite')
  const [interviewDate, setInterviewDate] = useState('Thứ Năm tới, 30/10/2026');
  const [interviewTime, setInterviewTime] = useState('09:30 - 10:30');
  const [interviewFormat, setInterviewFormat] = useState('Phỏng vấn Online qua Google Meet');
  const [interviewLocation, setInterviewLocation] = useState('https://meet.google.com/talentflow-rec-interview');
  const [interviewers, setInterviewers] = useState('Hội đồng Chuyên môn & Trưởng bộ phận Kỹ thuật');

  // View Sent History Modal
  const [viewingHistory, setViewingHistory] = useState<{ email: InboundEmail; reply: QuickReplyHistory } | null>(null);

  // Helper to find linked candidate
  const getLinkedCandidate = (email: InboundEmail): Candidate | undefined => {
    if (email.extractedCandidateId) {
      return candidates.find((c) => c.id === email.extractedCandidateId);
    }
    return candidates.find(
      (c) => c.email.toLowerCase() === email.senderEmail.toLowerCase()
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...mailboxSettings,
      emailAddress,
      mailServer,
      accountId,
      passwordMasked: password,
      autoCheckIntervalMinutes: Number(intervalMin),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleRunBatchScan = async () => {
    const newlyAdded = await onBatchScanEmails();
    if (newlyAdded > 0) {
      setScanResultNotice(`Đã quét thành công! Tự động bóc tách CV và cấp mã mới cho ${newlyAdded} ứng viên.`);
    } else {
      setScanResultNotice('Hòm thư đã được đồng bộ đầy đủ. Không có CV mới cần bóc tách.');
    }
    setTimeout(() => setScanResultNotice(null), 4000);
  };

  const handleProcessSingle = async (email: InboundEmail) => {
    setProcessingSingleId(email.id);
    try {
      const newCandId = await onScanAndProcessEmail(email);
      setScanResultNotice(`Đã nạp thành công ứng viên ${email.senderName} với mã định danh ${newCandId}!`);
      setTimeout(() => setScanResultNotice(null), 4000);
    } finally {
      setProcessingSingleId(null);
    }
  };

  // --- Trigger Quick Reply Generator via Server-Side AI ---
  const fetchAIReply = async (
    email: InboundEmail,
    type: QuickReplyType,
    customPrompt?: string
  ) => {
    setIsGeneratingAI(true);
    const cand = getLinkedCandidate(email);

    try {
      const res = await fetch('/api/mailbox/quick-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: cand ? cand.fullName : email.senderName,
          candidateEmail: cand ? cand.email : email.senderEmail,
          jobTitle: email.targetJobTitle,
          replyType: type,
          benchmarkScore: cand?.benchmarkScore,
          recommendation: cand?.recommendation,
          strengths: cand?.strengths,
          gapsOrRisks: cand?.gapsOrRisks,
          interviewDetails: {
            date: interviewDate,
            time: interviewTime,
            format: interviewFormat,
            locationOrLink: interviewLocation,
            interviewers,
          },
          customInstructions: customPrompt || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI chưa soạn được thư phản hồi');

      setReplySubject(data.subject || `[SEICO] Phản hồi hồ sơ - ${email.senderName}`);
      setReplyBody(data.body || '');
      setSuggestedTone(data.suggestedTone || 'Chuyên nghiệp, trang trọng');
      setActionRecommended(data.actionRecommended || 'Gửi thư phản hồi tới ứng viên');
    } catch (err) {
      alert((err as any)?.message || 'AI chưa soạn được thư phản hồi. Vui lòng thử lại.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Open Quick Reply Modal & auto-detect best type based on benchmark
  const handleOpenQuickReply = (email: InboundEmail) => {
    setQuickReplyEmail(email);
    setCustomInstructions('');

    const cand = getLinkedCandidate(email);
    let detectedType: QuickReplyType = 'thank_you';

    if (cand) {
      if (cand.benchmarkScore >= 3.8 || ['Strong Hire', 'Interview'].includes(cand.recommendation)) {
        detectedType = 'interview_invite';
      } else if (cand.benchmarkScore < 3.2 || cand.recommendation === 'Reject') {
        detectedType = 'rejection';
      } else {
        detectedType = 'thank_you';
      }
    } else {
      detectedType = 'thank_you';
    }

    setQuickReplyType(detectedType);
    fetchAIReply(email, detectedType);
  };

  const handleSelectReplyType = (type: QuickReplyType) => {
    setQuickReplyType(type);
    if (quickReplyEmail) {
      fetchAIReply(quickReplyEmail, type, customInstructions);
    }
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(`${replySubject}\n\n${replyBody}`);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleSendReply = () => {
    if (!quickReplyEmail || !replySubject || !replyBody) return;
    setIsSendingReply(true);

    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const newReplyHistory: QuickReplyHistory = {
      repliedAt: timestampStr,
      replyType: quickReplyType,
      subject: replySubject,
      sentBody: replyBody,
      recipientEmail: quickReplyEmail.senderEmail,
    };

    // Determine target candidate stage
    let targetStage: CandidateStage | undefined;
    if (autoUpdateCandidateStage) {
      if (quickReplyType === 'interview_invite') {
        targetStage = 'Phỏng vấn';
      } else if (quickReplyType === 'rejection') {
        targetStage = 'Đã từ chối';
      } else if (quickReplyType === 'thank_you') {
        targetStage = 'Đã thẩm định';
      }
    }

    onSendQuickReply?.(quickReplyEmail.id, newReplyHistory, targetStage);

    setTimeout(() => {
      setIsSendingReply(false);
      setScanResultNotice(
        `Đã lưu thư phản hồi (${
          quickReplyType === 'interview_invite'
            ? 'Mời phỏng vấn'
            : quickReplyType === 'rejection'
            ? 'Từ chối lịch sự'
            : 'Xác nhận tiếp nhận'
        }) cho ứng viên ${quickReplyEmail.senderName}. Hệ thống KHÔNG tự gửi: hãy gửi từ hòm thư hr@seico.vn sau khi được duyệt.`
      );
      setQuickReplyEmail(null);
      setTimeout(() => setScanResultNotice(null), 4500);
    }, 600);
  };

  const unprocessedList = inboundEmails.filter((e) => e.status === 'Chưa bóc tách');
  const processedList = inboundEmails.filter((e) => e.status === 'Đã nạp ứng viên');

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1720px] w-full mx-auto">
      {/* 1. Header with Quick Scan Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">
            Hòm Thư Tuyển Dụng & Phản Hồi Nhanh Ứng Viên
          </h2>
          <p className="text-xs text-[#8E8E93] dark:text-[#98989D] mt-1">
            Quét email tự động, bóc tách tệp CV đính kèm và kích hoạt tính năng <strong className="text-[#007AFF] dark:text-[#0A84FF]">Phản hồi nhanh bằng AI</strong> dựa trên điểm chuẩn benchmark.
          </p>
        </div>

        <button
          onClick={handleRunBatchScan}
          disabled={isScanning}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold btn-fluent-primary rounded-full transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Đang Quét & Phân Tích CV...' : 'Quét Hòm Thư Ngay (Auto-Scan)'}</span>
        </button>
      </div>

      {/* Notice Banner */}
      {scanResultNotice && (
        <div className="p-4 bg-[#34C759]/12 border border-[#34C759]/30 rounded-[20px] text-xs font-semibold text-[#1D833A] dark:text-[#30D158] flex items-center justify-between shadow-sm backdrop-blur-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{scanResultNotice}</span>
          </div>
          <button
            onClick={() => onNavigate('candidates')}
            className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer"
          >
            Xem danh sách ứng viên →
          </button>
        </div>
      )}

      {/* 2. Split: Mailbox Connection Settings & Live Scanner Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Account Settings (ID & Password) */}
        <div className="lg:col-span-1 glass-panel rounded-[24px] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
              <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white tracking-tight">Thông Tin Hòm Thư HR</h3>
            </div>
            <span className="text-[11px] font-semibold text-[#1D833A] dark:text-[#30D158] bg-[#34C759]/12 border border-[#34C759]/25 px-2.5 py-0.5 rounded-full">
              Kết nối ổn định
            </span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">Địa Chỉ Email Tiếp Nhận</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 neumorphic-inset rounded-[14px] text-xs text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">Máy Chủ Thư (IMAP / POP3)</label>
              <div className="relative">
                <Server className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mailServer}
                  onChange={(e) => setMailServer(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 neumorphic-inset rounded-[14px] text-xs font-mono text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">Tên Đăng Nhập / ID</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 neumorphic-inset rounded-[14px] text-xs font-mono text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">Mật Khẩu / App Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 neumorphic-inset rounded-[14px] text-xs font-mono text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">Chu Kỳ Quét Tự Động</label>
              <select
                value={intervalMin}
                onChange={(e) => setIntervalMin(Number(e.target.value))}
                className="w-full px-3.5 py-2 neumorphic-inset rounded-[14px] text-xs text-[#1C1C1E] dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
              >
                <option value={5}>Mỗi 5 phút</option>
                <option value={15}>Mỗi 15 phút (Khuyến nghị)</option>
                <option value={30}>Mỗi 30 phút</option>
                <option value={60}>Mỗi 1 giờ</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-[#1C1C1E] dark:text-white btn-fluent-glass rounded-full transition-all cursor-pointer"
              >
                {saveSuccess ? 'Đã lưu cấu hình thành công!' : 'Lưu Cấu Hình Hòm Thư'}
              </button>
            </div>
          </form>
        </div>

        {/* Right 2 Columns: Inbound Emails Queue & Auto-Extraction */}
        <div className="lg:col-span-2 glass-panel rounded-[24px] p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-3.5">
              <div>
                <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                  Hòm Thư Ứng Tuyển Đến ({inboundEmails.length} email)
                </h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  Tự động phát hiện email đính kèm CV, đối chiếu benchmark và gửi phản hồi thông minh
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-[#B26A00] dark:text-[#FF9F0A] bg-[#FF9500]/12 border border-[#FF9500]/25 px-2.5 py-0.5 rounded-full tabular-nums">
                  {unprocessedList.length} thư chưa nạp
                </span>
                <span className="font-semibold text-[#1D833A] dark:text-[#30D158] bg-[#34C759]/12 border border-[#34C759]/25 px-2.5 py-0.5 rounded-full tabular-nums">
                  {processedList.length} đã nạp ứng viên
                </span>
              </div>
            </div>

            {/* Email Rows */}
            <div className="divide-y divide-black/[0.05] dark:divide-white/[0.07] mt-2">
              {inboundEmails.map((mail) => {
                const isProcessed = mail.status === 'Đã nạp ứng viên';
                const isBeingProcessed = processingSingleId === mail.id;
                const cand = getLinkedCandidate(mail);

                return (
                  <div
                    key={mail.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.025] dark:hover:bg-white/[0.03] px-2.5 rounded-[14px] transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-[#1C1C1E] dark:text-white">{mail.senderName}</span>
                        <span className="text-[11px] font-mono text-[#8E8E93]">&lt;{mail.senderEmail}&gt;</span>

                        {cand && (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold font-mono px-2.5 py-0.5 rounded-full tabular-nums ${
                              cand.benchmarkScore >= 4.0
                                ? 'bg-[#34C759]/12 text-[#1D833A] dark:text-[#30D158] border border-[#34C759]/25'
                                : cand.benchmarkScore >= 3.5
                                ? 'bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] border border-[#007AFF]/25'
                                : 'bg-[#FF9500]/12 text-[#B26A00] dark:text-[#FF9F0A] border border-[#FF9500]/25'
                            }`}
                          >
                            <Star className="w-3 h-3 fill-current text-[#FF9500]" />
                            <span>{cand.benchmarkScore.toFixed(1)} ⭐ · {cand.recommendation}</span>
                          </span>
                        )}

                        {mail.lastReply && (
                          <button
                            onClick={() => setViewingHistory({ email: mail, reply: mail.lastReply! })}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                              mail.lastReply.replyType === 'interview_invite'
                                ? 'bg-[#AF52DE]/12 text-[#AF52DE] dark:text-[#BF5AF2] hover:bg-[#AF52DE]/20'
                                : mail.lastReply.replyType === 'rejection'
                                ? 'bg-[#FF3B30]/12 text-[#FF3B30] dark:text-[#FF453A] hover:bg-[#FF3B30]/20'
                                : 'bg-[#767680]/12 text-[#3C3C43] dark:text-[#EBEBF5] hover:bg-[#767680]/20'
                            }`}
                            title="Nhấp để xem lại nội dung phản hồi đã gửi"
                          >
                            <Check className="w-3 h-3" />
                            <span>
                              Đã phản hồi:{' '}
                              {mail.lastReply.replyType === 'interview_invite'
                                ? 'Mời PV'
                                : mail.lastReply.replyType === 'rejection'
                                ? 'Từ chối'
                                : 'Cảm ơn'}
                            </span>
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-[#3C3C43] dark:text-[#EBEBF5] font-medium truncate">{mail.subject}</p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8E8E93]">
                        <span className="inline-flex items-center gap-1 font-mono text-[#3C3C43] dark:text-[#EBEBF5] bg-[#767680]/10 dark:bg-white/10 px-2 py-0.5 rounded-full">
                          <Paperclip className="w-3 h-3 text-[#8E8E93]" />
                          <span>{mail.attachmentName} ({mail.attachmentSize})</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Vị trí: <strong className="text-[#1C1C1E] dark:text-white">{mail.targetJobTitle}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{mail.dateReceived}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedEmail(mail)}
                        className="p-2 text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white btn-fluent-glass rounded-full transition-colors cursor-pointer"
                        title="Xem nội dung thư và CV đính kèm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenQuickReply(mail)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 hover:bg-[#007AFF]/18 border border-[#007AFF]/20 rounded-full transition-colors cursor-pointer"
                        title="Tự động soạn thảo email phản hồi dựa trên benchmark"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Phản Hồi Nhanh</span>
                      </button>

                      {isProcessed ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#1D833A] dark:text-[#30D158] bg-[#34C759]/12 border border-[#34C759]/25 px-3 py-1.5 rounded-full tabular-nums">
                          <Check className="w-3.5 h-3.5" />
                          <span>{mail.extractedCandidateId}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleProcessSingle(mail)}
                          disabled={isBeingProcessed || isScanning}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold btn-fluent-primary rounded-full transition-all cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${isBeingProcessed ? 'animate-spin' : ''}`} />
                          <span>{isBeingProcessed ? 'Đang nạp...' : 'Nạp CV'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom info */}
          <div className="p-3.5 neumorphic-inset rounded-[16px] text-xs text-[#8E8E93] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Chu kỳ quét kế tiếp: sau {intervalMin} phút</span>
            </span>
            <span>Tổng cộng đã tiếp nhận: <strong className="font-mono text-[#1C1C1E] dark:text-white tabular-nums">{mailboxSettings.totalReceived}</strong> hồ sơ</span>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: QUICK REPLY MODAL (AI-POWERED WITH BENCHMARK STATUS) --- */}
      {quickReplyEmail && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-[26px] max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-gradient-to-br from-[#0A84FF] to-[#5856D6] text-white rounded-[12px] shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                    Phản Hồi Nhanh Ứng Viên (AI Quick Reply)
                  </h3>
                </div>
                <p className="text-xs text-[#8E8E93] mt-1">
                  Hệ thống tự động phân tích điểm chuẩn Benchmark và gợi ý nội dung email chuyên nghiệp theo từng giai đoạn.
                </p>
              </div>

              <button
                onClick={() => setQuickReplyEmail(null)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
              {(() => {
                const cand = getLinkedCandidate(quickReplyEmail);
                return (
                  <div className="p-4 neumorphic-inset rounded-[18px] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#1C1C1E] dark:text-white">{quickReplyEmail.senderName}</span>
                          <span className="font-mono text-[#8E8E93] text-xs">&lt;{quickReplyEmail.senderEmail}&gt;</span>
                          {cand && (
                            <span className="font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] tabular-nums">
                              {cand.id}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8E8E93] mt-0.5">
                          Ứng tuyển: <strong className="text-[#1C1C1E] dark:text-white">{quickReplyEmail.targetJobTitle}</strong>
                        </p>
                      </div>

                      {cand ? (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end font-bold text-[#FF9500] font-mono text-sm tabular-nums">
                              <Star className="w-4 h-4 fill-current text-[#FF9500]" />
                              <span>{cand.benchmarkScore.toFixed(1)} / 5.0 ⭐</span>
                            </div>
                            <span className="text-[11px] text-[#8E8E93] font-medium">
                              Khuyến nghị: <strong className="text-[#1C1C1E] dark:text-white">{cand.recommendation}</strong>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#B26A00] dark:text-[#FF9F0A] bg-[#FF9500]/12 border border-[#FF9500]/25 px-3 py-1.5 rounded-[12px] flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0" />
                          <span>Hồ sơ chưa nạp mã. AI tự đối chiếu CV với JD mục tiêu.</span>
                        </div>
                      )}
                    </div>

                    {cand && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                        <div className="bg-white/75 dark:bg-white/[0.06] p-2.5 rounded-[12px] border border-black/[0.05] dark:border-white/[0.08]">
                          <span className="text-[#8E8E93] block">Kỹ năng cốt lõi</span>
                          <span className="font-bold text-[#1C1C1E] dark:text-white font-mono tabular-nums">{cand.matrixMatch.skillsScore} / 5</span>
                        </div>
                        <div className="bg-white/75 dark:bg-white/[0.06] p-2.5 rounded-[12px] border border-black/[0.05] dark:border-white/[0.08]">
                          <span className="text-[#8E8E93] block">Kinh nghiệm thực tế</span>
                          <span className="font-bold text-[#1C1C1E] dark:text-white font-mono tabular-nums">{cand.matrixMatch.experienceScore} / 5</span>
                        </div>
                        <div className="bg-white/75 dark:bg-white/[0.06] p-2.5 rounded-[12px] border border-black/[0.05] dark:border-white/[0.08]">
                          <span className="text-[#8E8E93] block">Học vấn & Bằng cấp</span>
                          <span className="font-bold text-[#1C1C1E] dark:text-white font-mono tabular-nums">{cand.matrixMatch.educationScore} / 5</span>
                        </div>
                        <div className="bg-white/75 dark:bg-white/[0.06] p-2.5 rounded-[12px] border border-black/[0.05] dark:border-white/[0.08]">
                          <span className="text-[#8E8E93] block">Phù hợp văn hóa</span>
                          <span className="font-bold text-[#1C1C1E] dark:text-white font-mono tabular-nums">{cand.matrixMatch.cultureScore} / 5</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Reply Type Selection Tabs */}
              <div>
                <label className="block font-bold text-[#1C1C1E] dark:text-white mb-2">
                  1. Chọn Mục Đích Phản Hồi Dựa Trên Trạng Thái Benchmark
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectReplyType('interview_invite')}
                    className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
                      quickReplyType === 'interview_invite'
                        ? 'border-[#AF52DE] bg-[#AF52DE]/12 shadow-sm ring-2 ring-[#AF52DE]/25'
                        : 'border-black/[0.08] dark:border-white/[0.08] hover:border-[#AF52DE]/50 bg-white/60 dark:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="p-1.5 bg-[#AF52DE]/15 text-[#AF52DE] dark:text-[#BF5AF2] rounded-[10px]">
                        <Calendar className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-bold text-xs text-[#1C1C1E] dark:text-white">Mời Phỏng Vấn</span>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                      Khuyến nghị khi benchmark ≥ 3.8 ⭐. Khen ngợi thế mạnh và đính kèm lịch hẹn.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectReplyType('thank_you')}
                    className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
                      quickReplyType === 'thank_you'
                        ? 'border-[#007AFF] bg-[#007AFF]/12 shadow-sm ring-2 ring-[#007AFF]/25'
                        : 'border-black/[0.08] dark:border-white/[0.08] hover:border-[#007AFF]/50 bg-white/60 dark:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="p-1.5 bg-[#007AFF]/15 text-[#007AFF] dark:text-[#0A84FF] rounded-[10px]">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-bold text-xs text-[#1C1C1E] dark:text-white">Cảm Ơn & Tiếp Nhận</span>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                      Xác nhận đã nhận CV, giới thiệu quy trình đánh giá benchmark và hẹn ngày phản hồi.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectReplyType('rejection')}
                    className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
                      quickReplyType === 'rejection'
                        ? 'border-[#FF3B30] bg-[#FF3B30]/12 shadow-sm ring-2 ring-[#FF3B30]/25'
                        : 'border-black/[0.08] dark:border-white/[0.08] hover:border-[#FF3B30]/50 bg-white/60 dark:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="p-1.5 bg-[#FF3B30]/15 text-[#FF3B30] dark:text-[#FF453A] rounded-[10px]">
                        <XCircle className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-bold text-xs text-[#1C1C1E] dark:text-white">Từ Chối Lịch Sự</span>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                      Dành cho hồ sơ chưa đạt chuẩn đợt này. Lịch thiệp và lưu hồ sơ vào Talent Pool.
                    </p>
                  </button>
                </div>
              </div>

              {quickReplyType === 'interview_invite' && (
                <div className="p-4 bg-[#AF52DE]/10 border border-[#AF52DE]/25 rounded-[18px] space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-[#AF52DE] dark:text-[#BF5AF2] font-semibold text-xs border-b border-[#AF52DE]/20 pb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Thiết Lập Lịch Phỏng Vấn (Tự động đưa vào nội dung thư)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">Ngày phỏng vấn dự kiến</label>
                      <input
                        type="text"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        placeholder="Thứ Năm tới, 30/10/2026"
                        className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">Khung giờ</label>
                      <input
                        type="text"
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        placeholder="09:30 - 10:30"
                        className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">Hình thức</label>
                      <select
                        value={interviewFormat}
                        onChange={(e) => setInterviewFormat(e.target.value)}
                        className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                      >
                        <option value="Phỏng vấn Online qua Google Meet">Phỏng vấn Online qua Google Meet</option>
                        <option value="Phỏng vấn Trực tiếp tại Văn phòng Công ty">Phỏng vấn Trực tiếp tại Văn phòng Công ty</option>
                        <option value="Phỏng vấn Online qua Microsoft Teams">Phỏng vấn Online qua Microsoft Teams</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#3C3C43] dark:text-[#EBEBF5] mb-1">Liên kết / Địa chỉ</label>
                      <input
                        type="text"
                        value={interviewLocation}
                        onChange={(e) => setInterviewLocation(e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className="w-full px-3 py-2 neumorphic-inset rounded-[12px] text-xs font-mono text-[#1C1C1E] dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <div className="flex-1">
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Ghi chú thêm cho AI (ví dụ: yêu cầu mang laptop, nhắc portfolio, phỏng vấn tiếng Anh...)"
                    className="w-full px-3.5 py-2.5 neumorphic-inset rounded-[14px] text-xs text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                  />
                </div>

                <button
                  type="button"
                  disabled={isGeneratingAI}
                  onClick={() => quickReplyEmail && fetchAIReply(quickReplyEmail, quickReplyType, customInstructions)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold btn-fluent-primary rounded-full transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAI ? 'Đang Soạn Thảo...' : 'AI Soạn Thảo Lại'}</span>
                </button>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-[#1C1C1E] dark:text-white">Tiêu Đề Thư (Subject)</label>
                    <span className="text-[11px] text-[#8E8E93] font-mono">Người nhận: {quickReplyEmail.senderEmail}</span>
                  </div>
                  <input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 neumorphic-inset rounded-[14px] text-xs font-semibold text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-[#1C1C1E] dark:text-white">Nội Dung Thư Phản Hồi (Body)</label>
                    <div className="flex items-center gap-2">
                      {suggestedTone && (
                        <span className="text-[11px] text-[#8E8E93] bg-[#767680]/10 dark:bg-white/10 px-2.5 py-0.5 rounded-full font-mono">
                          Giọng điệu: {suggestedTone}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleCopyBody}
                        className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedToast ? 'Đã sao chép!' : 'Sao chép thư'}</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={10}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    className="w-full p-3.5 neumorphic-inset rounded-[16px] text-xs text-[#1C1C1E] dark:text-white font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#007AFF]/35"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#007AFF]/10 border border-[#007AFF]/25 rounded-[16px] flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-[#1C1C1E] dark:text-white font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoUpdateCandidateStage}
                    onChange={(e) => setAutoUpdateCandidateStage(e.target.checked)}
                    className="rounded border-[#8E8E93] text-[#007AFF] cursor-pointer"
                  />
                  <span>
                    Tự động cập nhật trạng thái ứng viên trong hệ thống thành:{' '}
                    <strong className="text-[#007AFF] dark:text-[#0A84FF] font-bold">
                      {quickReplyType === 'interview_invite'
                        ? 'Phỏng vấn'
                        : quickReplyType === 'rejection'
                        ? 'Đã từ chối'
                        : 'Đã thẩm định'}
                    </strong>
                  </span>
                </label>

                {actionRecommended && (
                  <span className="text-[11px] text-[#007AFF] dark:text-[#0A84FF] italic hidden sm:inline">
                    {actionRecommended}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setQuickReplyEmail(null)}
                className="px-4 py-2 text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
              >
                Hủy bỏ
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={isSendingReply || isGeneratingAI || !replySubject || !replyBody}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold btn-fluent-primary rounded-full transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingReply ? 'animate-spin' : ''}`} />
                  <span>{isSendingReply ? 'Đang Gửi Thư...' : 'Gửi Email Cho Ứng Viên'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: VIEW SENT REPLY HISTORY --- */}
      {viewingHistory && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-[26px] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#1D833A] dark:text-[#30D158] bg-[#34C759]/12 px-2.5 py-0.5 rounded-full border border-[#34C759]/25">
                  Thư Đã Gửi Thành Công · {viewingHistory.reply.repliedAt}
                </span>
                <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white mt-1.5 tracking-tight">
                  {viewingHistory.reply.subject}
                </h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  Gửi tới: {viewingHistory.email.senderName} ({viewingHistory.reply.recipientEmail})
                </p>
              </div>

              <button
                onClick={() => setViewingHistory(null)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto text-xs text-[#1C1C1E] dark:text-white space-y-4 flex-1">
              <div>
                <span className="text-[#8E8E93] font-semibold block mb-1.5">Nội dung thư đã gửi:</span>
                <div className="p-4 neumorphic-inset rounded-[16px] whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                  {viewingHistory.reply.sentBody}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between">
              <button
                onClick={() => setViewingHistory(null)}
                className="px-4 py-2 text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  setViewingHistory(null);
                  handleOpenQuickReply(viewingHistory.email);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/12 hover:bg-[#007AFF]/20 rounded-full transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Soạn Phản Hồi Mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: VIEW INBOUND EMAIL & RAW CV SNIPPET --- */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-[26px] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#8E8E93] tabular-nums">{selectedEmail.id}</span>
                <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white mt-0.5 tracking-tight">{selectedEmail.subject}</h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  Từ: {selectedEmail.senderName} ({selectedEmail.senderEmail}) · {selectedEmail.dateReceived}
                </p>
              </div>

              <button
                onClick={() => setSelectedEmail(null)}
                className="w-8 h-8 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#3C3C43] dark:text-[#EBEBF5] flex-1">
              <div>
                <span className="font-semibold text-[#1C1C1E] dark:text-white block mb-1.5">Vị trí ứng tuyển mục tiêu:</span>
                <p className="p-3 neumorphic-inset rounded-[14px] text-[#1C1C1E] dark:text-white font-semibold">
                  {selectedEmail.targetJobTitle}
                </p>
              </div>

              <div>
                <span className="font-semibold text-[#1C1C1E] dark:text-white mb-1.5 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                  <span>Tệp đính kèm: {selectedEmail.attachmentName} ({selectedEmail.attachmentSize})</span>
                </span>

                <div className="bg-[#1C1C1E] text-[#F2F2F7] p-4 rounded-[16px] font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto border border-white/10">
                  {selectedEmail.rawCvContent}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] flex items-center justify-between">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const mail = selectedEmail;
                    setSelectedEmail(null);
                    handleOpenQuickReply(mail);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/12 hover:bg-[#007AFF]/20 border border-[#007AFF]/25 rounded-full transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Phản Hồi Nhanh AI</span>
                </button>

                {selectedEmail.status === 'Đã nạp ứng viên' ? (
                  <div className="text-xs font-mono text-[#1D833A] dark:text-[#30D158] font-semibold flex items-center gap-1 px-3.5 py-2 bg-[#34C759]/12 border border-[#34C759]/25 rounded-full tabular-nums">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã nạp với mã {selectedEmail.extractedCandidateId}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleProcessSingle(selectedEmail);
                      setSelectedEmail(null);
                    }}
                    className="px-4.5 py-2 text-xs font-semibold btn-fluent-primary rounded-full transition-all cursor-pointer"
                  >
                    Bóc Tách & Nạp CV
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
