import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DashboardView } from './views/DashboardView';
import { JDStudioView } from './views/JDStudioView';
import { BannerStudioView } from './views/BannerStudioView';
import { ChannelsView } from './views/ChannelsView';
import { MailboxView } from './views/MailboxView';
import { CandidatesView } from './views/CandidatesView';
import { AnalyticsView } from './views/AnalyticsView';
import { AdminView } from './views/AdminView';
import { DriveImportPanel, DriveFolder } from './components/DriveImportPanel';
import { initialMailboxSettings } from './data/initialData';
import { useCollection, useDoc } from './lib/store';
import { caps, toast } from './lib/runtime';
import { setAdminSettingsRef } from './lib/api';
import { SEICO_ADMIN, SEICO_PERMISSIONS, toJob, toChannel, fromChannel, fromCandidate, buildOrgNodes, buildDepartments, nextCandidateId } from './lib/seico';
import {
  AdminSettings,
  AppUser,
  Candidate,
  CandidateStage,
  ConnectedChannel,
  InboundEmail,
  JobPosition,
  MailboxSettings,
  PublishLog,
  QuickReplyHistory,
  RolePermissions,
  SystemAuditLog,
} from './types';

type Any = any;
const nowStr = () => {
  const d = new Date();
  return `${d.toISOString().split('T')[0]} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
};
const blankProfile = (name: string): Any => ({ fullName: name, phone: '', identityNumber: '', dateOfBirth: '', gender: 'Khác', address: '', jobTitle: '' });

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // ---- Dữ liệu dùng chung, lưu trong cơ sở dữ liệu artifact ----
  const [jobsRaw, setJobs] = useCollection<JobPosition>('jobs', { toModel: toJob, order: (a, b) => (a.status === 'Open' ? 0 : 1) - (b.status === 'Open' ? 0 : 1) });
  const [candidates, setCandidates, candsLoaded] = useCollection<Candidate>('cands', { fromModel: fromCandidate, order: (a, b) => String(b.id).localeCompare(String(a.id)) });
  const [channels, setChannels] = useCollection<ConnectedChannel>('chans', { toModel: toChannel, fromModel: fromChannel as Any });
  const [inboundEmails, setInboundEmails] = useCollection<InboundEmail>('emails', { order: (a, b) => String(b.dateReceived).localeCompare(String(a.dateReceived)) });
  const [publishLogs, setPublishLogs] = useCollection<PublishLog>('publogs', { order: (a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)) });
  const [auditLogs, setAuditLogs] = useCollection<SystemAuditLog>('audit', { order: (a, b) => String(b.timestamp).localeCompare(String(a.timestamp)), limit: 300 });
  const [allUsers, setAllUsers, usersLoaded] = useCollection<AppUser>('users');
  const [adminSettings, setAdminSettings] = useDoc<AdminSettings>('settings/admin', SEICO_ADMIN, (s, init) => ({ ...init, ...s }));
  const [rbac, setRbac] = useDoc<{ permissions: RolePermissions }>('settings/rbac', { permissions: SEICO_PERMISSIONS });
  const [mailboxSettings, setMailboxSettings] = useDoc<MailboxSettings>(
    'settings/mailbox_v2',
    { ...initialMailboxSettings, emailAddress: 'hr@seico.vn', mailServer: '', accountId: '', passwordMasked: '', isConnected: false, lastCheckedAt: '', totalReceived: 0 }
  );
  const [driveCfg, setDriveCfg] = useDoc<{ folders: DriveFolder[] }>('settings/drive', { folders: [] });
  const rolePermissions = rbac.permissions;
  const setRolePermissions = (p: Any) => setRbac((r) => ({ permissions: typeof p === 'function' ? p(r.permissions) : p }));

  useEffect(() => setAdminSettingsRef(adminSettings), [adminSettings]);

  // Số ứng viên theo JD tính từ danh sách thật, không cộng dồn thủ công
  const jobs = useMemo(
    () => jobsRaw.map((j) => ({ ...j, totalApplicants: candidates.filter((c) => c.jobId === j.id).length })),
    [jobsRaw, candidates]
  );
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const selectedJob = (jobs.find((j) => j.id === selectedJobId) || jobs[0] || toJob({ id: '', title: 'Chưa có JD' })) as JobPosition;
  const setSelectedJob = (j: JobPosition) => setSelectedJobId(j?.id || '');

  // ---- Người dùng: nhận diện bằng tài khoản claude.ai, vai trò RBAC lưu theo người dùng ----
  const [me, setMe] = useState<{ id: string; name: string; owner: boolean } | null>(null);
  useEffect(() => {
    caps.user.then(async (u: Any) => {
      if (!u) return setMe({ id: 'local', name: 'Người dùng', owner: true });
      const p = await u.me().catch(() => null);
      const owner = await u.isOwner().catch(() => false);
      setMe({ id: p?.id || 'local', name: p?.name || 'Người dùng', owner: !!owner });
    });
  }, []);
  const currentUser: AppUser = useMemo(() => {
    const stored = allUsers.find((x) => x.id === me?.id);
    const name = me?.name || 'Người dùng';
    return {
      id: me?.id || 'local', email: stored?.email || '', fullName: name,
      role: stored?.role || (me?.owner ? 'master_admin' : 'member'),
      profileCompleted: true, profile: { ...blankProfile(name), ...(stored?.profile || {}), fullName: name },
      status: stored?.status || 'Active', createdAt: stored?.createdAt || nowStr(), lastLoginAt: nowStr(),
      avatarColor: stored?.avatarColor || 'bg-[#007AFF]',
    };
  }, [me, allUsers]);
  const registered = useRef(false);
  useEffect(() => {
    if (!me || !usersLoaded || registered.current || me.id === 'local') return;
    registered.current = true;
    if (!allUsers.some((x) => x.id === me.id)) {
      const { lastLoginAt, ...u } = currentUser;
      setAllUsers((prev) => [...prev, u as AppUser]);
    }
  }, [me, usersLoaded]);

  // Lần đầu: nạp sơ đồ tổ chức SEICO nếu cấu hình chưa có
  useEffect(() => {
    if (!adminSettings.orgChartNodes?.length) setAdminSettings((s) => ({ ...s, orgChartNodes: buildOrgNodes(), departments: buildDepartments() }));
  }, [adminSettings.orgChartNodes?.length]);

  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<Candidate | null>(null);
  const [filterCandidateStage, setFilterCandidateStage] = useState<CandidateStage | 'all'>('all');
  const [filterCandidateJobId, setFilterCandidateJobId] = useState<string | 'all'>('all');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const unprocessedEmailsCount = inboundEmails.filter((m) => m.status === 'Chưa bóc tách').length;

  const handleAddJob = (newJob: JobPosition) => {
    setJobs((prev) => [newJob, ...prev]);
    setSelectedJob(newJob);
  };

  // Ứng viên: luôn cấp mã theo quy tắc trong Admin, tránh trùng
  const candsRef = useRef<Candidate[]>([]);
  candsRef.current = candidates;
  const handleAddCandidate = (newCand: Candidate) => {
    const exists = candsRef.current.some((c) => c.id === newCand.id);
    const c = exists || !newCand.id ? { ...newCand, id: nextCandidateId(candsRef.current, adminSettings.idRule) } : newCand;
    candsRef.current = [c, ...candsRef.current];
    setCandidates((prev) => [c, ...prev]);
  };

  // Tạo hồ sơ ứng viên từ kết quả phân tích (dùng cho email, Google Drive)
  const makeCandidate = (a: Any, job: JobPosition, base: Any): Candidate => ({
    ...(base.extra || {}),
    id: nextCandidateId(candsRef.current, adminSettings.idRule),
    jobId: job.id,
    jobTitle: job.title,
    fullName: a.candidateName || base.fullName || 'Chưa rõ tên',
    email: a.candidateEmail || base.email || '',
    phone: a.candidatePhone || '',
    appliedDate: new Date().toISOString().split('T')[0],
    source: base.source,
    resumeFileName: base.resumeFileName || '',
    benchmarkScore: Number(a.benchmarkScore) || 0,
    matrixMatch: a.matrixMatch,
    dimensionScores: a.dimensionScores,
    benchmarkProfileTitle: a.benchmarkProfileTitle,
    matchedSkills: a.matchedSkills || [],
    missingSkills: a.missingSkills || [],
    strengths: a.strengths || [],
    gapsOrRisks: a.gapsOrRisks || [],
    interviewQuestions: a.interviewQuestions || [],
    stage: 'Mới nhận',
    recommendation: a.recommendation || 'Consider',
    summary: a.summary || '',
    resumeTextSnippet: a.resumeTextSnippet || '',
    notes: base.notes || '',
  } as Any);

  const handleUpdateCandidateStage = (candId: string, newStage: CandidateStage) => {
    setCandidates((prev) => prev.map((c) => (c.id === candId ? { ...c, stage: newStage } : c)));
    if (selectedCandidateDetail && selectedCandidateDetail.id === candId)
      setSelectedCandidateDetail((prev) => (prev ? { ...prev, stage: newStage } : null));
  };
  const handleUpdateCandidateNotes = (candId: string, notes: string) =>
    setCandidates((prev) => prev.map((c) => (c.id === candId ? { ...c, notes } : c)));
  const handleUpdateCandidateName = (candId: string, newName: string) => {
    setCandidates((prev) => prev.map((c) => (c.id === candId ? { ...c, fullName: newName } : c)));
    if (selectedCandidateDetail && selectedCandidateDetail.id === candId)
      setSelectedCandidateDetail((prev) => (prev ? { ...prev, fullName: newName } : null));
  };

  // Bóc tách một email ứng tuyển (chỉ tạo hồ sơ khi AI phân tích thành công)
  const handleProcessSingleEmail = async (email: InboundEmail): Promise<string> => {
    const targetJob = jobs.find((j) => j.id === email.targetJobId) || jobs[0];
    if (!targetJob) {
      toast('Cần ít nhất một JD để đối chiếu.');
      return '';
    }
    const response = await fetch('/api/cv/analyze-benchmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvText: email.rawCvContent, jobPosition: targetJob, candidateNameHint: email.senderName, candidateEmailHint: email.senderEmail }),
    });
    const analysis = await response.json();
    if (!response.ok) {
      toast(analysis.error || 'Không phân tích được CV.');
      return '';
    }
    const newCand = makeCandidate(analysis, targetJob, {
      source: 'Email Tự Động Quét', resumeFileName: email.attachmentName, fullName: email.senderName, email: email.senderEmail,
      notes: `Bóc tách từ email "${email.subject}" lúc ${new Date().toLocaleTimeString('vi-VN')}`,
    });
    handleAddCandidate(newCand);
    setInboundEmails((prev) => prev.map((m) => (m.id === email.id ? { ...m, status: 'Đã nạp ứng viên', extractedCandidateId: newCand.id } : m)));
    return newCand.id;
  };

  const handleBatchScanEmails = async (): Promise<number> => {
    setIsScanning(true);
    let count = 0;
    try {
      for (const email of inboundEmails.filter((m) => m.status === 'Chưa bóc tách')) {
        if (await handleProcessSingleEmail(email)) count++;
      }
      setMailboxSettings((prev) => ({ ...prev, lastCheckedAt: nowStr(), totalReceived: prev.totalReceived + count }));
      if (!inboundEmails.length) toast('Hòm thư chưa có email ứng tuyển. CV thật nhập qua mục Google Drive ở trang Ứng viên.');
    } finally {
      setIsScanning(false);
    }
    return count;
  };

  // "Xuất bản" = ghi nhận đã đăng sau khi được duyệt (AGENT Tuyển dụng §6, §9.2) – không tự đăng ra ngoài
  const handlePublishJobToChannels = (jobId: string, channelIds: string[], customMessage?: string) => {
    const job = jobs.find((j) => j.id === jobId) || selectedJob;
    const names = channels.filter((c) => channelIds.includes(c.id)).map((c) => c.name);
    const ts = nowStr();
    setPublishLogs((prev) => [
      { id: `PUB-${Date.now()}`, jobId: job.id, jobTitle: job.title, channelNames: names, publishedAt: ts, status: 'Thành công',
        socialContentSnippet: (customMessage || `Tuyển dụng: ${job.title}`).slice(0, 400) + ' · (ghi nhận sau duyệt, đăng tay)' },
      ...prev,
    ]);
    setChannels((prev) => prev.map((c) => (channelIds.includes(c.id) ? { ...c, lastPublishedAt: ts, totalJobsPosted: (c.totalJobsPosted || 0) + 1 } : c)));
    toast(`Đã ghi nhận đăng tin trên ${names.length} kênh. Hệ thống không tự đăng lên trang việc làm.`);
  };

  const handleSendQuickReply = (emailId: string, reply: QuickReplyHistory, targetCandidateStage?: CandidateStage) => {
    setInboundEmails((prev) => prev.map((m) => (m.id === emailId ? { ...m, lastReply: reply } : m)));
    if (targetCandidateStage) {
      const email = inboundEmails.find((m) => m.id === emailId);
      const cid = email?.extractedCandidateId || candidates.find((c) => c.email && email?.senderEmail && c.email.toLowerCase() === email.senderEmail.toLowerCase())?.id;
      if (cid) handleUpdateCandidateStage(cid, targetCandidateStage);
    }
  };

  const handleAddAuditLog = (entry: Omit<SystemAuditLog, 'id' | 'timestamp'>) => {
    const log: SystemAuditLog = { id: `LOG-${Date.now()}`, timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19), ...entry, ipAddress: '' };
    setAuditLogs((prev) => [log, ...prev]);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden fluent-ambient-bg text-[#1C1C1E] dark:text-[#F2F2F7] transition-colors">
      {/* Sidebar Navigation with Collapse Toggle & Admin tab */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unprocessedEmailsCount={unprocessedEmailsCount}
        totalCandidatesCount={candidates.length}
        openJobsCount={jobs.length}
        mailboxSettings={mailboxSettings}
        onQuickScan={handleBatchScanEmails}
        isScanning={isScanning}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar with Taskbar Toggle, Global Search with Filters, and Dark Mode */}
        <TopNav
          activeTab={activeTab}
          onOpenCreateJD={() => setActiveTab('jd-studio')}
          onOpenUploadCV={() => setActiveTab('candidates')}
          onQuickScan={handleBatchScanEmails}
          isScanning={isScanning}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onNavigate={setActiveTab}
          candidates={candidates}
          jobs={jobs}
          inboundEmails={inboundEmails}
          onSelectCandidate={(cand) => {
            setSelectedCandidateDetail(cand);
            setActiveTab('candidates');
          }}
          onSelectJob={(job) => {
            setSelectedJob(job);
            setActiveTab('jd-studio');
          }}
          currentUser={currentUser}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              jobs={jobs}
              candidates={candidates}
              unprocessedEmailsCount={unprocessedEmailsCount}
              publishLogs={publishLogs}
              onNavigate={setActiveTab}
              onSelectJobForBanner={(job) => setSelectedJob(job)}
              onSelectCandidateDetails={(cand) => setSelectedCandidateDetail(cand)}
              onFilterCandidatesByStage={(stage) => {
                setFilterCandidateStage(stage);
                setFilterCandidateJobId('all');
              }}
            />
          )}

          {activeTab === 'jd-studio' && (
            <JDStudioView
              jobs={jobs}
              onAddJob={handleAddJob}
              onSelectJobForBanner={(job) => setSelectedJob(job)}
              onNavigate={setActiveTab}
              onFilterCandidatesByJob={(jobId) => {
                setFilterCandidateJobId(jobId);
                setFilterCandidateStage('all');
              }}
            />
          )}

          {activeTab === 'banner-studio' && (
            <BannerStudioView
              jobs={jobs}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJob}
              channels={channels}
              onPublishToChannels={(job, socialText) => {
                handlePublishJobToChannels(
                  job.id,
                  channels.map((c) => c.id),
                  socialText
                );
              }}
            />
          )}

          {activeTab === 'channels' && (
            <ChannelsView
              channels={channels}
              onUpdateChannels={setChannels}
              jobs={jobs}
              publishLogs={publishLogs}
              onPublishJobToChannels={handlePublishJobToChannels}
            />
          )}

          {activeTab === 'mailbox' && (
            <MailboxView
              mailboxSettings={mailboxSettings}
              onUpdateSettings={setMailboxSettings}
              inboundEmails={inboundEmails}
              jobs={jobs}
              candidates={candidates}
              onScanAndProcessEmail={handleProcessSingleEmail}
              onBatchScanEmails={handleBatchScanEmails}
              onNavigate={setActiveTab}
              isScanning={isScanning}
              onSendQuickReply={handleSendQuickReply}
            />
          )}

          {activeTab === 'candidates' && (
            <DriveImportPanel
              folders={driveCfg.folders || []}
              onUpdateFolders={(f) => setDriveCfg({ folders: f })}
              jobs={jobs}
              candidates={candidates}
              onAddCandidate={handleAddCandidate}
              makeCandidate={makeCandidate}
            />
          )}

          {activeTab === 'candidates' && (
            <CandidatesView
              candidates={candidates}
              jobs={jobs}
              onAddCandidate={handleAddCandidate}
              onUpdateCandidateStage={handleUpdateCandidateStage}
              onUpdateCandidateNotes={handleUpdateCandidateNotes}
              onUpdateCandidateName={handleUpdateCandidateName}
              selectedCandidateDetail={selectedCandidateDetail}
              onSelectCandidateDetail={setSelectedCandidateDetail}
              initialFilterStage={filterCandidateStage}
              initialFilterJobId={filterCandidateJobId}
              currentUser={currentUser}
              contacts={adminSettings.contacts || []}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              jobs={jobs}
              candidates={candidates}
            />
          )}

          {activeTab === 'admin' && (
            <AdminView
              currentUser={currentUser}
              allUsers={allUsers}
              onUpdateUsers={setAllUsers}
              rolePermissions={rolePermissions}
              onUpdatePermissions={setRolePermissions}
              auditLogs={auditLogs}
              onAddAuditLog={handleAddAuditLog}
              candidates={candidates}
              jobs={jobs}
              channels={channels}
              onUpdateChannels={setChannels}
              adminSettings={adminSettings}
              onUpdateAdminSettings={setAdminSettings}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              onOpenProfileModal={() => toast('Hồ sơ người dùng lấy theo tài khoản claude.ai.')}
            />
          )}
        </main>
      </div>

    </div>
  );
}
