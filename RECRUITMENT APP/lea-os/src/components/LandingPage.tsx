import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Lock,
  User,
  ArrowRight,
  RefreshCw,
  KeyRound,
  FileText,
  Share2,
  Star,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AppUser } from '../types';

interface LandingPageProps {
  onLoginSuccess: (user: AppUser, isNewRegistration?: boolean) => void;
  allUsers: AppUser[];
  onOpenAppDirectly?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginSuccess,
  allUsers,
  onOpenAppDirectly,
}) => {
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'forgot_password'>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPass, setLoginShowPass] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPass, setRegShowPass] = useState(false);
  const [regStep, setRegStep] = useState<'info' | 'otp'>('info');
  const [regError, setRegError] = useState<string | null>(null);

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpCountdown, setOtpCountdown] = useState<number>(60);
  const [otpError, setOtpError] = useState<string | null>(null);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [forgotTempCode, setForgotTempCode] = useState('');
  const [forgotInputCode, setForgotInputCode] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccessNotice, setForgotSuccessNotice] = useState<string | null>(null);
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (regStep === 'otp' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [regStep, otpCountdown]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const email = loginEmail.trim().toLowerCase();
    const existing = allUsers.find((u) => u.email.toLowerCase() === email);

    if (!existing) {
      setLoginError('Email này chưa được đăng ký trong hệ thống tuyển dụng nội bộ.');
      return;
    }

    if (existing.status === 'Locked') {
      setLoginError('Tài khoản này hiện đang bị khóa bởi Quản trị hệ thống. Vui lòng liên hệ IT/HR.');
      return;
    }

    onLoginSuccess(existing, false);
  };

  const handleQuickLogin = (role: 'master_admin' | 'ops_admin' | 'member') => {
    const user = allUsers.find((u) => u.role === role);
    if (user) {
      onLoginSuccess(user, false);
    }
  };

  const handleStartRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regFullName.trim()) {
      setRegError('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    const email = regEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setRegError('Email công tác không hợp lệ.');
      return;
    }

    const existing = allUsers.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      setRegError('Email này đã tồn tại trong hệ thống. Vui lòng chuyển sang tab Đăng Nhập.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Mật khẩu tối thiểu phải từ 6 ký tự trở lên.');
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpCountdown(60);
    setOtpError(null);
    setRegStep('otp');
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = cleaned;
    setOtpDigits(updated);

    if (cleaned && index < 5) {
      const nextInput = document.getElementById(`landing-otp-${index + 1}`);
      nextInput?.focus();
    }

    if (updated.every((d) => d !== '')) {
      verifyOtpCode(updated.join(''));
    }
  };

  const verifyOtpCode = (enteredCode: string) => {
    if (enteredCode !== generatedOtp) {
      setOtpError('Mã OTP không chính xác. Vui lòng kiểm tra lại hộp thư.');
      return;
    }

    const newUser: AppUser = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      email: regEmail.trim().toLowerCase(),
      fullName: regFullName.trim(),
      role: 'member',
      profileCompleted: false,
      status: 'Active',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      lastLoginAt: 'Vừa kích hoạt',
      avatarColor: 'bg-[#007AFF]',
      assignedChannelsCount: 1,
      profile: {
        fullName: regFullName.trim(),
        phone: '',
        identityNumber: '',
        dateOfBirth: '',
        gender: 'Nam',
        address: '',
        jobTitle: '',
      },
    };

    onLoginSuccess(newUser, true);
  };

  const handleRequestForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const email = forgotEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setForgotError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    const existing = allUsers.find((u) => u.email.toLowerCase() === email);
    if (!existing) {
      setForgotError('Không tìm thấy tài khoản với email này trong hệ thống.');
      return;
    }

    setIsSendingForgot(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setForgotTempCode(code);
      setIsSendingForgot(false);
      setForgotStep('verify');
      setForgotSuccessNotice(`Đã gửi mã đăng nhập mới tới hòm thư ${email}`);
    }, 600);
  };

  const handleVerifyForgotCode = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotInputCode.trim() !== forgotTempCode) {
      setForgotError('Mã đăng nhập tạm thời không chính xác.');
      return;
    }

    const email = forgotEmail.trim().toLowerCase();
    const existing = allUsers.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      onLoginSuccess(existing, false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-[#1C1C1E] dark:text-[#F2F2F7] flex flex-col selection:bg-[#007AFF] selection:text-white relative overflow-hidden">
      {/* iOS Ambient Mesh Lights */}
      <div className="absolute top-[-12%] left-[-8%] w-[52vw] h-[52vw] rounded-full bg-gradient-to-br from-[#007AFF]/18 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-12%] right-[-8%] w-[48vw] h-[48vw] rounded-full bg-gradient-to-tl from-[#5856D6]/14 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[35%] right-[25%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-tr from-[#30B0C7]/10 to-transparent blur-3xl pointer-events-none" />

      {/* iOS Translucent Top Bar */}
      <header className="relative z-10 w-full border-b border-black/[0.08] dark:border-white/[0.1] bg-[#F2F2F7]/80 dark:bg-[#000000]/80 backdrop-blur-2xl px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[13px] bg-gradient-to-b from-[#2E96FF] to-[#007AFF] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,122,255,0.35),inset_0_1px_0_rgba(255,255,255,0.45)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#1C1C1E] dark:text-white block">
                TalentFlow ATS
              </span>
              <p className="text-[11px] text-[#8E8E93]">
                Hệ Thống Quản Trị & Vận Hành Tuyển Dụng AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleQuickLogin('master_admin')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] btn-fluent-glass rounded-full transition-all cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Vào Nhanh (Quản trị hệ thống)</span>
            </button>

            {onOpenAppDirectly && (
              <button
                onClick={onOpenAppDirectly}
                className="px-4 py-2 text-xs font-semibold text-white btn-fluent-primary rounded-full transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Vào Bảng Điều Khiển</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero & Auth Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-8 md:py-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-14 my-auto">
        {/* Left Column: System Introduction */}
        <div className="flex-1 space-y-6 text-left">
          <div className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] tracking-tight">
            Nền tảng ATS tuyển dụng thông minh 2026
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight leading-[1.15] text-[#1C1C1E] dark:text-white text-balance">
            Tự Động Hóa Tuyển Dụng, Bóc Tách CV & <span className="text-[#007AFF] dark:text-[#0A84FF]">Benchmark Đa Chiều</span>
          </h1>

          <p className="text-sm sm:text-base text-[#3C3C43] dark:text-[#EBEBF5]/80 leading-relaxed max-w-xl">
            Giải pháp vận hành khép kín cho phòng nhân sự: Tự động khởi tạo JD bằng AI, thiết kế banner canvas đăng tin đa kênh, quét hòm thư bóc tách CV, chấm điểm benchmark 5 sao, so sánh 3 ứng viên và phân quyền chặt chẽ.
          </p>

          {/* 4 iOS Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 max-w-xl">
            <div className="neumorphic-card p-4 space-y-1.5">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-[#1C1C1E] dark:text-white">
                <div className="w-7 h-7 rounded-[9px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span>Khởi Tạo & Điền JD Tự Động</span>
              </div>
              <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                AI soạn JD chuẩn năng lực, phân tích file JD mẫu và tự động tạo banner canvas đăng tin mạng xã hội.
              </p>
            </div>

            <div className="neumorphic-card p-4 space-y-1.5">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-[#1C1C1E] dark:text-white">
                <div className="w-7 h-7 rounded-[9px] bg-[#34C759]/12 text-[#34C759] dark:text-[#30D158] flex items-center justify-center shrink-0">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <span>Đăng Tin & Quét Hộp Thư HR</span>
              </div>
              <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                Kết nối các cổng tuyển dụng, giám sát email ứng tuyển và gửi Quick Reply tự động bằng AI.
              </p>
            </div>

            <div className="neumorphic-card p-4 space-y-1.5">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-[#1C1C1E] dark:text-white">
                <div className="w-7 h-7 rounded-[9px] bg-[#FF9500]/12 text-[#FF9500] dark:text-[#FF9F0A] flex items-center justify-center shrink-0">
                  <Star className="w-3.5 h-3.5" />
                </div>
                <span>Benchmark Đa Chiều (3D-7D)</span>
              </div>
              <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                Chấm điểm 5 sao theo thang đo tùy biến cân đối 100%, tự động cấp mã CAND và so sánh 3 ứng viên.
              </p>
            </div>

            <div className="neumorphic-card p-4 space-y-1.5">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-[#1C1C1E] dark:text-white">
                <div className="w-7 h-7 rounded-[9px] bg-[#5856D6]/12 text-[#5856D6] dark:text-[#5E5CE6] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Kho CV Chung & Phân Quyền</span>
              </div>
              <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                Quản trị hệ thống, Quản trị vận hành và Thành viên; tra cứu, chọn và tải hàng loạt hồ sơ CV.
              </p>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-black/[0.08] dark:border-white/[0.1] text-xs">
            <div>
              <span className="text-xl font-bold tabular-nums text-[#007AFF] dark:text-[#0A84FF] block">100%</span>
              <span className="text-[#8E8E93] text-[11px]">Tự động đánh mã & Phân tích</span>
            </div>
            <div className="w-px h-8 bg-black/[0.08] dark:bg-white/[0.1]" />
            <div>
              <span className="text-xl font-bold tabular-nums text-[#007AFF] dark:text-[#0A84FF] block">&lt; 3s</span>
              <span className="text-[#8E8E93] text-[11px]">Bóc tách & Chấm Benchmark</span>
            </div>
            <div className="w-px h-8 bg-black/[0.08] dark:bg-white/[0.1]" />
            <div>
              <span className="text-xl font-bold tabular-nums text-[#007AFF] dark:text-[#0A84FF] block">256-bit</span>
              <span className="text-[#8E8E93] text-[11px]">Bảo mật hồ sơ ứng viên</span>
            </div>
          </div>
        </div>

        {/* Right Column: iOS 26 Liquid Glass Auth Card */}
        <div className="w-full lg:w-[460px] shrink-0">
          <div className="glass-panel rounded-[28px] overflow-hidden p-6 sm:p-7 space-y-5 relative">
            {/* iOS Segmented Control */}
            <div className="ios-segmented flex">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setLoginError(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-[9px] transition-all cursor-pointer whitespace-nowrap ${
                  authTab === 'login'
                    ? 'ios-segmented-active'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                }`}
              >
                Đăng Nhập
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setRegStep('info');
                  setRegError(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-[9px] transition-all cursor-pointer whitespace-nowrap ${
                  authTab === 'register'
                    ? 'ios-segmented-active'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                }`}
              >
                Đăng Ký (OTP)
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthTab('forgot_password');
                  setForgotStep('request');
                  setForgotError(null);
                  setForgotSuccessNotice(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-[9px] transition-all cursor-pointer whitespace-nowrap ${
                  authTab === 'forgot_password'
                    ? 'ios-segmented-active'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                }`}
              >
                Quên Mật Khẩu
              </button>
            </div>

            {/* TAB 1: LOGIN */}
            {authTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white">
                    Đăng Nhập Cổng Tuyển Dụng
                  </h3>
                  <p className="text-xs text-[#8E8E93] mt-0.5">
                    Nhập email nội bộ và mật khẩu để truy cập bảng điều khiển.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF3B30] dark:text-[#FF453A] rounded-[14px] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5]">
                    Email Công Tác *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-2.5" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="dangductuan.7@gmail.com"
                      className="w-full pl-10 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white font-mono focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5]">
                      Mật Khẩu *
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthTab('forgot_password')}
                      className="text-[11px] text-[#007AFF] dark:text-[#0A84FF] font-semibold hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-2.5" />
                    <input
                      type={loginShowPass ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-9 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white font-mono focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setLoginShowPass(!loginShowPass)}
                      className="absolute right-3 top-2.5 text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
                    >
                      {loginShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 btn-fluent-primary font-semibold rounded-[14px] cursor-pointer flex items-center justify-center gap-2 text-xs"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Đăng Nhập Vào Hệ Thống</span>
                </button>

                {/* Quick Demo Switch */}
                <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
                  <span className="text-[11px] font-medium text-[#8E8E93] block text-center">
                    Đăng nhập nhanh theo vai trò (Demo)
                  </span>

                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('master_admin')}
                      className="w-full p-2.5 rounded-[14px] bg-[#007AFF]/[0.08] hover:bg-[#007AFF]/[0.14] text-[#1C1C1E] dark:text-white border border-[#007AFF]/20 flex items-center justify-between text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          QT
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-xs truncate">Quản trị hệ thống (Đặng Đức Tuấn)</p>
                          <p className="text-[10px] text-[#8E8E93] font-mono truncate">dangductuan.7@gmail.com</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#007AFF] dark:text-[#0A84FF] shrink-0">
                        Toàn quyền
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('ops_admin')}
                      className="w-full p-2.5 rounded-[14px] bg-[#34C759]/[0.08] hover:bg-[#34C759]/[0.14] text-[#1C1C1E] dark:text-white border border-[#34C759]/20 flex items-center justify-between text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-[#34C759] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          VH
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-xs truncate">Quản trị vận hành (Nguyễn Thùy Linh)</p>
                          <p className="text-[10px] text-[#8E8E93] font-mono truncate">linh.nguyen@talentflow.vn</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#34C759] dark:text-[#30D158] shrink-0">
                        Vận hành
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('member')}
                      className="w-full p-2.5 rounded-[14px] bg-[#5856D6]/[0.08] hover:bg-[#5856D6]/[0.14] text-[#1C1C1E] dark:text-white border border-[#5856D6]/20 flex items-center justify-between text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-[#5856D6] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          TV
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-xs truncate">Thành viên tuyển dụng (Lê Hoàng Nam)</p>
                          <p className="text-[10px] text-[#8E8E93] font-mono truncate">nam.le@talentflow.vn</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#5856D6] dark:text-[#5E5CE6] shrink-0">
                        Thành viên
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER + 6-DIGIT OTP */}
            {authTab === 'register' && (
              <div>
                {regStep === 'info' ? (
                  <form onSubmit={handleStartRegister} className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white">
                        Đăng Ký Tài Khoản Nội Bộ
                      </h3>
                      <p className="text-xs text-[#8E8E93] mt-0.5">
                        Mã OTP 6 chữ số sẽ được gửi về email để xác thực danh tính.
                      </p>
                    </div>

                    {regError && (
                      <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF3B30] rounded-[14px] text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{regError}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5]">
                        Họ và Tên Nhân Sự *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-2.5" />
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="Ví dụ: Hoàng Tuấn Kiệt"
                          className="w-full pl-10 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5]">
                        Email Công Tác *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-2.5" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="kiet.hoang@company.vn"
                          className="w-full pl-10 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white font-mono focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5]">
                        Mật Khẩu Khởi Tạo *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-2.5" />
                        <input
                          type={regShowPass ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Tối thiểu 6 ký tự"
                          className="w-full pl-10 pr-9 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white font-mono focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setRegShowPass(!regShowPass)}
                          className="absolute right-3 top-2.5 text-[#8E8E93] hover:text-[#1C1C1E] cursor-pointer"
                        >
                          {regShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 btn-fluent-primary font-semibold rounded-[14px] cursor-pointer flex items-center justify-center gap-2 text-xs"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Gửi Mã Xác Thực 6 Chữ Số</span>
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <div className="w-11 h-11 rounded-full bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center mx-auto">
                        <Mail className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                        Xác Thực Mã Email OTP
                      </h4>
                      <p className="text-xs text-[#8E8E93]">
                        Vui lòng nhập mã xác thực gửi tới: <strong className="text-[#1C1C1E] dark:text-white font-mono">{regEmail}</strong>
                      </p>
                    </div>

                    <div className="p-3 bg-[#FF9500]/10 border border-[#FF9500]/25 rounded-[14px] text-xs text-[#1C1C1E] dark:text-[#F2F2F7] space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-[#FF9500]">
                        <Sparkles className="w-4 h-4" />
                        <span>Email Tự Động - Hộp Thư ATS</span>
                      </div>
                      <p>
                        Mã OTP của bạn là:{' '}
                        <strong className="text-sm font-mono text-[#007AFF] dark:text-[#0A84FF] px-2 py-0.5 bg-white dark:bg-[#2C2C2E] rounded-[6px] border border-black/[0.08]">
                          {generatedOtp}
                        </strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const digits = generatedOtp.split('');
                          setOtpDigits(digits);
                          verifyOtpCode(generatedOtp);
                        }}
                        className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer pt-0.5 block"
                      >
                        Nhấp để tự động điền mã {generatedOtp}
                      </button>
                    </div>

                    {otpError && (
                      <div className="p-2.5 bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF3B30] rounded-[12px] text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{otpError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-2 pt-1">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`landing-otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          className="w-10 h-11 text-center text-lg font-bold font-mono text-[#1C1C1E] dark:text-white neumorphic-inset rounded-[12px] focus:outline-hidden"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#8E8E93] pt-1">
                      <span>
                        Hết hạn sau: <strong className="font-mono text-[#007AFF]">{otpCountdown}s</strong>
                      </span>
                      <button
                        type="button"
                        disabled={otpCountdown > 0}
                        onClick={() => {
                          const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                          setGeneratedOtp(newOtp);
                          setOtpCountdown(60);
                          setOtpDigits(['', '', '', '', '', '']);
                          setOtpError(null);
                        }}
                        className="text-[#007AFF] font-semibold hover:underline disabled:opacity-40 cursor-pointer"
                      >
                        Gửi lại mã OTP
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRegStep('info')}
                      className="w-full text-center text-xs text-[#8E8E93] hover:text-[#1C1C1E] cursor-pointer"
                    >
                      ← Quay lại sửa thông tin
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FORGOT PASSWORD */}
            {authTab === 'forgot_password' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#1C1C1E] dark:text-white">
                    Khôi Phục Quyền Truy Cập
                  </h3>
                  <p className="text-xs text-[#8E8E93] mt-0.5">
                    Khai báo email tài khoản để nhận mã đăng nhập mới qua email.
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF3B30] rounded-[14px] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccessNotice && (
                  <div className="p-3 bg-[#34C759]/10 border border-[#34C759]/25 text-[#34C759] dark:text-[#30D158] rounded-[14px] text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{forgotSuccessNotice}</span>
                  </div>
                )}

                {forgotStep === 'request' ? (
                  <form onSubmit={handleRequestForgot} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5]">
                        Email Tài Khoản Đã Khai Báo *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-2.5" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="dangductuan.7@gmail.com"
                          className="w-full pl-10 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white font-mono focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-[#007AFF]/[0.08] rounded-[14px] border border-[#007AFF]/20 text-xs text-[#1C1C1E] dark:text-[#EBEBF5] flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-[#007AFF] shrink-0" />
                      <span>
                        Hệ thống sẽ tạo <strong>mã đăng nhập một lần (6 số)</strong> và gửi trực tiếp vào hòm thư công tác của bạn.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingForgot}
                      className="w-full py-2.5 px-4 btn-fluent-primary font-semibold rounded-[14px] cursor-pointer flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                    >
                      {isSendingForgot ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang Gửi Mã Qua Email...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Nhận Mã Đăng Nhập Mới Qua Email</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyForgotCode} className="space-y-4">
                    <div className="p-3 bg-[#FF9500]/10 border border-[#FF9500]/25 rounded-[14px] text-xs text-[#1C1C1E] dark:text-[#F2F2F7] space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-[#FF9500]">
                        <Mail className="w-4 h-4" />
                        <span>Email Khôi Phục - Hộp Thư ATS</span>
                      </div>
                      <p>
                        Kính gửi người dùng, mã đăng nhập mới của bạn là:{' '}
                        <strong className="text-sm font-mono text-[#007AFF] px-2 py-0.5 bg-white dark:bg-[#2C2C2E] rounded-[6px] border border-black/[0.08]">
                          {forgotTempCode}
                        </strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => setForgotInputCode(forgotTempCode)}
                        className="text-[11px] font-semibold text-[#007AFF] hover:underline cursor-pointer pt-0.5 block"
                      >
                        Nhấp để tự động điền mã {forgotTempCode}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5]">
                        Nhập Mã Đăng Nhập Mới (6 Chữ Số) *
                      </label>
                      <input
                        type="text"
                        required
                        value={forgotInputCode}
                        onChange={(e) => setForgotInputCode(e.target.value)}
                        placeholder="Ví dụ: 892144"
                        className="w-full px-3 py-2.5 text-center font-mono font-bold text-lg neumorphic-inset rounded-[12px] focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 btn-fluent-primary font-semibold rounded-[14px] cursor-pointer flex items-center justify-center gap-2 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác Nhận & Đăng Nhập Ngay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="w-full text-center text-xs text-[#8E8E93] hover:text-[#1C1C1E] cursor-pointer"
                    >
                      ← Nhập lại địa chỉ email
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-black/[0.08] dark:border-white/[0.1] bg-[#F2F2F7]/80 dark:bg-[#000000]/80 backdrop-blur-xl py-4 text-center text-xs text-[#8E8E93]">
        <p>
          © 2026 TalentFlow ATS · Hệ Thống Quản Trị & Vận Hành Tuyển Dụng Nội Bộ.
        </p>
      </footer>
    </div>
  );
};
