import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Share2,
  CheckCircle2,
  Palette,
  Layout,
  RefreshCw,
  Sliders,
  Send,
  Eye,
  FileText,
  Briefcase,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ConnectedChannel, JobPosition } from '../types';

interface BannerStudioViewProps {
  jobs: JobPosition[];
  selectedJob: JobPosition;
  onSelectJob: (job: JobPosition) => void;
  channels: ConnectedChannel[];
  onPublishToChannels: (job: JobPosition, socialText: string) => void;
}

type AspectRatioType = '16:9' | '1:1';
type PaletteTheme = 'navy' | 'emerald' | 'obsidian' | 'indigo';

export const BannerStudioView: React.FC<BannerStudioViewProps> = ({
  jobs,
  selectedJob,
  onSelectJob,
  channels,
  onPublishToChannels,
}) => {
  // Social Copywriter States
  const [platform, setPlatform] = useState<'facebook' | 'linkedin' | 'jobboard'>('facebook');
  const [headline, setHeadline] = useState('');
  const [bodyContent, setBodyContent] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Canvas Studio States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [theme, setTheme] = useState<PaletteTheme>('navy');
  const [bannerBadge, setBannerBadge] = useState('WE ARE HIRING');
  const [bannerTitle, setBannerTitle] = useState(selectedJob.title);
  const [bannerSubtitle, setBannerSubtitle] = useState(`${selectedJob.level} Level · ${selectedJob.salaryRange}`);
  const [bannerPerks, setBannerPerks] = useState('Lương thưởng cạnh tranh · Bảo hiểm VIP · Môi trường cởi mở');
  const [bannerLocation, setBannerLocation] = useState(selectedJob.location);
  const [companyName, setCompanyName] = useState('TALENTFLOW GROUP');

  // AI Prompt generator for auxiliary images
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [isPromptCopied, setIsPromptCopied] = useState(false);

  // Update banner fields when job changes
  useEffect(() => {
    setBannerTitle(selectedJob.title);
    setBannerSubtitle(`${selectedJob.level} Level · ${selectedJob.salaryRange}`);
    setBannerLocation(selectedJob.location);
    if (selectedJob.benefits && selectedJob.benefits.length > 0) {
      setBannerPerks(selectedJob.benefits.slice(0, 3).map((b) => b.split(':')[0]).join(' · '));
    }
    // Generate initial post copy for this job
    generateSocialPost(selectedJob, platform);
  }, [selectedJob]);

  // Social post generation
  const generateSocialPost = async (job: JobPosition, targetPlatform: 'facebook' | 'linkedin' | 'jobboard') => {
    setIsGeneratingPost(true);
    try {
      const response = await fetch('/api/social-post/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          department: job.department,
          level: job.level,
          salaryRange: job.salaryRange,
          location: job.location,
          keyRequirements: job.requirements.slice(0, 3).join(', '),
          benefits: job.benefits.slice(0, 3).join(', '),
          platform: targetPlatform,
        }),
      });

      if (!response.ok) throw new Error((await response.clone().json().catch(() => ({}))).error || 'AI chưa soạn được bài đăng');
      const data = await response.json();

      setHeadline(data.headline || '');
      setBodyContent(data.bodyContent || '');
      setCallToAction(data.callToAction || '');
      setHashtags(data.hashtags || []);

      if (data.bannerCopy) {
        if (data.bannerCopy.badgeText) setBannerBadge(data.bannerCopy.badgeText);
        if (data.bannerCopy.titleText) setBannerTitle(data.bannerCopy.titleText);
        if (data.bannerCopy.subtitleText) setBannerSubtitle(data.bannerCopy.subtitleText);
        if (data.bannerCopy.perksSummary) setBannerPerks(data.bannerCopy.perksSummary);
      }

      setAiImagePrompt(
        `Professional high-end corporate recruitment graphic background for ${job.title}, modern enterprise workspace, sleek lighting, clean minimalist geometric gradient, ultra-high resolution, commercial grade`
      );
    } catch (err: any) {
      alert(err?.message || 'AI chưa soạn được bài đăng.');
    } finally {
      setIsGeneratingPost(false);
    }
  };

  // Re-draw Canvas Banner whenever attributes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    const width = aspectRatio === '16:9' ? 1200 : 1080;
    const height = aspectRatio === '16:9' ? 630 : 1080;
    canvas.width = width;
    canvas.height = height;

    // Palette Definition
    let bgGrad1 = '#06423A';
    let bgGrad2 = '#02211C';
    let accentColor = '#018377';
    let accentGradient = '#10B981';
    let badgeBg = 'rgba(1, 131, 119, 0.25)';
    let badgeText = '#A7F3D0';

    if (theme === 'emerald') {
      bgGrad1 = '#064E3B';
      bgGrad2 = '#022C22';
      accentColor = '#10B981';
      accentGradient = '#34D399';
      badgeBg = 'rgba(16, 185, 129, 0.2)';
      badgeText = '#6EE7B7';
    } else if (theme === 'obsidian') {
      bgGrad1 = '#18181B';
      bgGrad2 = '#09090B';
      accentColor = '#F59E0B';
      accentGradient = '#FBBF24';
      badgeBg = 'rgba(245, 158, 11, 0.15)';
      badgeText = '#FCD34D';
    } else if (theme === 'indigo') {
      bgGrad1 = '#312E81';
      bgGrad2 = '#1E1B4B';
      accentColor = '#818CF8';
      accentGradient = '#A5B4FC';
      badgeBg = 'rgba(129, 140, 248, 0.2)';
      badgeText = '#C7D2FE';
    }

    // 1. Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, bgGrad1);
    gradient.addColorStop(1, bgGrad2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Geometric Accent Shapes
    ctx.save();
    ctx.beginPath();
    ctx.arc(width - 80, 100, 320, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width - 150, 150, 220, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bottom decorative bar
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, height - 12, width, 12);
    ctx.restore();

    // 3. Grid Pattern overlay (subtle dots)
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    for (let x = 60; x < width - 60; x += 40) {
      for (let y = 60; y < height - 60; y += 40) {
        if ((x + y) % 80 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();

    // Margins
    const marginX = 80;
    let currentY = aspectRatio === '16:9' ? 95 : 120;

    // 4. Company Brand Text
    ctx.save();
    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(companyName.toUpperCase(), marginX, currentY);
    ctx.restore();

    currentY += 45;

    // 5. Badge Text Box ("WE ARE HIRING")
    ctx.save();
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    const badgeMetrics = ctx.measureText(bannerBadge);
    const badgeW = badgeMetrics.width + 36;
    const badgeH = 34;

    ctx.fillStyle = badgeBg;
    ctx.beginPath();
    ctx.roundRect(marginX, currentY - 24, badgeW, badgeH, 6);
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = badgeText;
    ctx.fillText(bannerBadge, marginX + 18, currentY);
    ctx.restore();

    currentY += aspectRatio === '16:9' ? 65 : 85;

    // 6. Job Title (Multi-line wrap support)
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 48px "Plus Jakarta Sans", sans-serif';

    const maxTitleWidth = width - marginX * 2 - 40;
    const words = bannerTitle.split(' ');
    let line = '';
    const titleLines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTitleWidth && n > 0) {
        titleLines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    titleLines.push(line);

    titleLines.forEach((tLine) => {
      ctx.fillText(tLine.trim(), marginX, currentY);
      currentY += 58;
    });
    ctx.restore();

    currentY += 15;

    // 7. Subtitle / Salary Highlight
    ctx.save();
    ctx.fillStyle = accentGradient;
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(bannerSubtitle, marginX, currentY);
    ctx.restore();

    currentY += aspectRatio === '16:9' ? 55 : 80;

    // 8. Perks / Benefits Bar
    if (bannerPerks) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(marginX, currentY - 28, width - marginX * 2, 54, 8);
      ctx.fill();

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '500 18px "DM Sans", sans-serif';
      ctx.fillText(`✨  ${bannerPerks}`, marginX + 24, currentY + 6);
      ctx.restore();

      currentY += 60;
    }

    // 9. Location & Footer Action
    ctx.save();
    const footerY = height - (aspectRatio === '16:9' ? 60 : 80);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 16px "DM Sans", sans-serif';
    ctx.fillText(`📍 ${bannerLocation}`, marginX, footerY);

    // Right-aligned CTA mark
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    const ctaText = 'ỨNG TUYỂN NGAY  →';
    const ctaWidth = ctx.measureText(ctaText).width;
    ctx.fillText(ctaText, width - marginX - ctaWidth, footerY);
    ctx.restore();
  }, [aspectRatio, theme, bannerBadge, bannerTitle, bannerSubtitle, bannerPerks, bannerLocation, companyName]);

  // Handle Download Image (PNG)
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Banner_TuyenDung_${selectedJob.title.replace(/\s+/g, '_')}_${aspectRatio.replace(':', 'x')}.png`;
    a.click();
  };

  // Copy Full Social Post
  const handleCopyPost = () => {
    const fullText = `${headline}\n\n${bodyContent}\n\n👉 ${callToAction}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Publish Directly to Connected Channels
  const handlePublishAll = () => {
    const fullText = `${headline}\n\n${bodyContent}\n\n👉 ${callToAction}\n\n${hashtags.join(' ')}`;
    onPublishToChannels(selectedJob, fullText);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 3000);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1720px] w-full mx-auto">
      {/* 1. Header with Job Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-[22px]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#007AFF] dark:text-[#0A84FF] font-semibold">
            <Palette className="w-3.5 h-3.5" />
            <span>Studio Marketing Tuyển Dụng Tự Động</span>
          </div>
          <h2 className="text-xl font-bold text-[#1C1C1E] dark:text-white tracking-tight mt-0.5">
            Soạn Tin Tuyển Dụng & Thiết Kế Banner Đồ Họa
          </h2>
        </div>

        {/* Job Selector Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[#8E8E93] font-medium">Vị trí áp dụng:</span>
          <select
            value={selectedJob.id}
            onChange={(e) => {
              const found = jobs.find((j) => j.id === e.target.value);
              if (found) onSelectJob(found);
            }}
            className="text-xs py-2 px-3.5 neumorphic-inset rounded-[12px] font-semibold text-[#1C1C1E] dark:text-white cursor-pointer"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.level})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Main Two-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: AI Social Post Copywriter */}
        <div className="glass-panel rounded-[24px] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                1. Soạn Thảo Nội Dung Đăng Tuyển (AI Copywriter)
              </h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                Tự động tối ưu câu chữ, cấu trúc thu hút theo nền tảng
              </p>
            </div>

            {/* Platform Selector (iOS Segmented) */}
            <div className="ios-segmented flex items-center gap-0.5">
              {(['facebook', 'linkedin', 'jobboard'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPlatform(p);
                    generateSocialPost(selectedJob, p);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-[9px] transition-all cursor-pointer ${
                    platform === p
                      ? 'ios-segmented-active'
                      : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                  }`}
                >
                  {p === 'facebook' ? 'Facebook' : p === 'linkedin' ? 'LinkedIn' : 'Job Board'}
                </button>
              ))}
            </div>
          </div>

          {/* Regenerate AI Post CTA */}
          <div className="flex items-center justify-between p-3.5 bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/15 rounded-[14px] border border-[#007AFF]/20 text-xs text-[#1C1C1E] dark:text-[#EBEBF5]">
            <span>Đang tạo nội dung dựa trên JD {selectedJob.title}</span>
            <button
              onClick={() => generateSocialPost(selectedJob, platform)}
              disabled={isGeneratingPost}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] btn-fluent-glass rounded-full cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPost ? 'animate-spin' : ''}`} />
              <span>{isGeneratingPost ? 'Đang viết lại...' : 'Viết lại bằng AI'}</span>
            </button>
          </div>

          {/* Post Form Fields */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">Tiêu Đề Giật Tít (Headline)</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] font-medium text-[#1C1C1E] dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">Nội Dung Chi Tiết (Body Text)</label>
              <textarea
                rows={9}
                value={bodyContent}
                onChange={(e) => setBodyContent(e.target.value)}
                className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] font-mono text-[#1C1C1E] dark:text-white text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">Lời Kêu Gọi Hành Động (CTA)</label>
              <input
                type="text"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] text-[#1C1C1E] dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">Hashtags Tối Ưu Tìm Kiếm</label>
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-[12px]">
                {hashtags.map((tag, idx) => (
                  <span key={idx} className="font-mono text-[11px] font-medium text-[#007AFF] dark:text-[#0A84FF] bg-[#007AFF]/10 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopyPost}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#1C1C1E] dark:text-white btn-fluent-glass rounded-full cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copySuccess ? 'Đã sao chép vào bộ nhớ tạm!' : 'Sao chép bài đăng'}</span>
            </button>

            <button
              onClick={handlePublishAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white btn-fluent-primary rounded-full cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{publishSuccess ? 'Đã phát hành thành công!' : `Đăng Lên ${channels.length} Kênh Kết Nối`}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Canvas Banner Studio */}
        <div className="glass-panel rounded-[24px] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                2. Canvas Studio Tạo Banner Đồ Họa
              </h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                Xuất ảnh PNG độ nét cao tải về hoặc đính kèm đăng tin
              </p>
            </div>

            {/* Aspect Ratio Switch */}
            <div className="ios-segmented flex items-center gap-0.5">
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-[9px] transition-all cursor-pointer tabular-nums ${
                  aspectRatio === '16:9'
                    ? 'ios-segmented-active'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                }`}
              >
                16:9 (1200x630)
              </button>
              <button
                onClick={() => setAspectRatio('1:1')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-[9px] transition-all cursor-pointer tabular-nums ${
                  aspectRatio === '1:1'
                    ? 'ios-segmented-active'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                }`}
              >
                1:1 (1080x1080)
              </button>
            </div>
          </div>

          {/* Theme Palette Bar */}
          <div className="flex items-center justify-between p-3.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-[14px]">
            <span className="text-xs font-semibold text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
              <span>Phối màu thương hiệu:</span>
            </span>

            <div className="flex items-center gap-2.5">
              {[
                { id: 'navy' as PaletteTheme, label: 'Ocean Blue', bg: 'bg-[#007AFF]' },
                { id: 'emerald' as PaletteTheme, label: 'Emerald Growth', bg: 'bg-[#34C759]' },
                { id: 'obsidian' as PaletteTheme, label: 'Obsidian Gold', bg: 'bg-[#FF9500]' },
                { id: 'indigo' as PaletteTheme, label: 'Modern Indigo', bg: 'bg-[#5856D6]' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                  className={`w-6 h-6 rounded-full ${t.bg} border-2 transition-transform cursor-pointer ${
                    theme === t.id ? 'border-white ring-2 ring-[#007AFF] scale-110' : 'border-transparent opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Canvas Render Area */}
          <div className="w-full bg-[#1C1C1E] rounded-[18px] p-3 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-[12px] shadow-2xl max-h-[340px] object-contain"
            />
          </div>

          {/* Banner Controls & Customization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-[#3C3C43] dark:text-slate-300 mb-1">Huy Hiệu (Badge)</label>
              <input
                type="text"
                value={bannerBadge}
                onChange={(e) => setBannerBadge(e.target.value)}
                className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs font-mono text-[#1C1C1E] dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#3C3C43] dark:text-slate-300 mb-1">Tên Tổ Chức / Logo Chữ</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs font-mono text-[#1C1C1E] dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#3C3C43] dark:text-slate-300 mb-1">Tiêu Đề Vị Trí Trên Banner</label>
              <input
                type="text"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs font-semibold text-[#1C1C1E] dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#3C3C43] dark:text-slate-300 mb-1">Mức Thu Nhập / Cấp Bậc</label>
              <input
                type="text"
                value={bannerSubtitle}
                onChange={(e) => setBannerSubtitle(e.target.value)}
                className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs text-[#1C1C1E] dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#3C3C43] dark:text-slate-300 mb-1">3 Đặc Quyền Nổi Bật</label>
              <input
                type="text"
                value={bannerPerks}
                onChange={(e) => setBannerPerks(e.target.value)}
                className="w-full px-3 py-2 neumorphic-inset rounded-[10px] text-xs text-[#1C1C1E] dark:text-white"
              />
            </div>
          </div>

          {/* Export Action */}
          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
            <span className="text-[11px] text-[#8E8E93] font-mono tabular-nums">
              Định dạng xuất: PNG HD ({aspectRatio === '16:9' ? '1200x630px' : '1080x1080px'})
            </span>

            <button
              onClick={handleDownloadPNG}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1C1C1E] hover:bg-black dark:bg-[#007AFF] dark:hover:bg-[#0066D6] rounded-full transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Tệp Ảnh PNG Ngay</span>
            </button>
          </div>

          {/* AI Prompt Recipe Assistant Box */}
          <div className="p-3.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/[0.06] dark:border-white/[0.08] rounded-[14px] text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#1C1C1E] dark:text-white font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
                <span>Gợi ý AI Prompt sinh ảnh nền theo chủ đề:</span>
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiImagePrompt);
                  setIsPromptCopied(true);
                  setTimeout(() => setIsPromptCopied(false), 2000);
                }}
                className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer"
              >
                {isPromptCopied ? 'Đã sao chép prompt' : 'Sao chép prompt'}
              </button>
            </div>
            <p className="text-[#8E8E93] italic text-[11px] line-clamp-2">{aiImagePrompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
