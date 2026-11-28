import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  ArrowRight,
  Sparkles,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AppUser, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AppUser, isNewRegistration?: boolean) => void;
  initialMode?: 'login' | 'register';
  allUsers: AppUser[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  allUsers,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [regStep, setRegStep] = useState<'info' | 'otp'>('info');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPass, setLoginShowPass] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPass, setRegShowPass] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // OTP Form
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpCountdown, setOtpCountdown] = useState<number>(60);
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Reset states on open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRegStep('info');
      setLoginError(null);
      setRegError(null);
      setOtpError(null);
    }
  }, [isOpen, initialMode]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any = null;
    if (regStep === 'otp' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [regStep, otpCountdown]);

  if (!isOpen) return null;

  // 1. Handle Send 6-digit OTP
  const handleSendOtp = () => {
    setRegError(null);
    if (!regFullName.trim()) {
      setRegError('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Vui lòng nhập địa chỉ email hợp lệ để nhận mã xác thực.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu xác nhận không khớp.');
      return;
    }

    // Check if email already registered
    const existing = allUsers.find((u) => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (existing) {
      setRegError('Email này đã được đăng ký trong hệ thống. Vui lòng chuyển sang Đăng nhập.');
      return;
    }

    setIsSendingOtp(true);
    // Generate secure random 6-digit code
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);

    setTimeout(() => {
      setIsSendingOtp(false);
      setRegStep('otp');
      setOtpCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpSentNotice(`Hệ thống đã gửi mã xác thực 6 chữ số đến hòm thư: ${regEmail}`);
    }, 700);
  };

  // 2. Handle OTP Input digit changes
  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // 3. Handle Verify OTP and Create User
  const handleVerifyOtp = () => {
    setOtpError(null);
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setOtpError('Vui lòng nhập đủ 6 chữ số mã xác thực.');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setOtpError('Mã xác thực không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại!');
      return;
    }

    // Create new AppUser with role 'member' and profileCompleted: false
    const newUser: AppUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      email: regEmail.trim().toLowerCase(),
      fullName: regFullName.trim(),
      role: 'member',
      profileCompleted: false, // Bắt buộc hoàn tất hồ sơ sau khi tạo tài khoản
      status: 'Active',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      lastLoginAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      avatarColor: 'bg-[#007AFF]',
      assignedChannelsCount: 1,
      profile: {
        fullName: regFullName.trim(),
        phone: '',
        identityNumber: '',
        dateOfBirth: '',
        gender: 'Nam',
        address: '',
        jobTitle: 'Chuyên viên Nhân sự',
      },
    };

    onAuthSuccess(newUser, true);
    onClose();
  };

  // 4. Handle Standard Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const targetUser = allUsers.find(
      (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (!targetUser) {
      setLoginError('Tài khoản email không tồn tại trong hệ thống TalentFlow ATS.');
      return;
    }

    if (targetUser.status === 'Locked') {
      setLoginError('Tài khoản này hiện đang bị khóa bởi Quản trị viên. Vui lòng liên hệ Admin.');
      return;
    }

    onAuthSuccess(targetUser, false);
    onClose();
  };

  // 5. Quick Switch / Preset Login for 3 Roles
  const handleQuickSwitch = (role: UserRole) => {
    const target = allUsers.find((u) => u.role === role);
    if (target) {
      onAuthSuccess(target, false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel bg-white/95 dark:bg-[#1C1C1E]/95 w-full max-w-md rounded-[26px] shadow-2xl overflow-hidden text-xs flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[11px] bg-gradient-to-b from-[#2E96FF] to-[#007AFF] flex items-center justify-center text-white shadow-[0_3px_10px_rgba(0,122,255,0.3)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                {mode === 'login' ? 'Đăng Nhập Hệ Thống ATS' : 'Đăng Ký Tài Khoản Tuyển Dụng'}
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                TalentFlow Internal Recruitment System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* iOS Segmented Switcher */}
        <div className="px-5 pt-4">
          <div className="ios-segmented flex">
            <button
              onClick={() => {
                setMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2 font-semibold rounded-[9px] transition-all cursor-pointer text-center ${
                mode === 'login'
                  ? 'ios-segmented-active'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => {
                setMode('register');
                setRegStep('info');
                setRegError(null);
              }}
              className={`flex-1 py-2 font-semibold rounded-[9px] transition-all cursor-pointer text-center ${
                mode === 'register'
                  ? 'ios-segmented-active'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
              }`}
            >
              Đăng Ký Mới (OTP)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {mode === 'login' ? (
            /* LOGIN VIEW */
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF3B30] dark:text-[#FF453A] rounded-[14px] flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Email Cơ Quan / Đăng Nhập *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="dangductuan.7@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200">
                    Mật Khẩu *
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type={loginShowPass ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
                  />
                  <button
                    type="button"
                    onClick={() => setLoginShowPass(!loginShowPass)}
                    className="absolute right-3 top-2.5 text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
                  >
                    {loginShowPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white btn-fluent-primary rounded-[14px] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Đăng Nhập Vào Hệ Thống</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
                <span className="text-[11px] font-medium text-[#8E8E93] block text-center">
                  Đăng nhập nhanh theo phân quyền (Demo)
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickSwitch('master_admin')}
                    className="w-full p-2.5 rounded-[14px] bg-[#007AFF]/[0.08] hover:bg-[#007AFF]/[0.14] text-[#1C1C1E] dark:text-white border border-[#007AFF]/20 flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-[10px]">
                        QT
                      </span>
                      <div>
                        <p className="font-semibold text-xs">Quản trị hệ thống - Đặng Đức Tuấn</p>
                        <p className="text-[10px] text-[#8E8E93] font-mono">dangductuan.7@gmail.com</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#007AFF] dark:text-[#0A84FF]">
                      Toàn quyền
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitch('ops_admin')}
                    className="w-full p-2.5 rounded-[14px] bg-[#34C759]/[0.08] hover:bg-[#34C759]/[0.14] text-[#1C1C1E] dark:text-white border border-[#34C759]/20 flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#34C759] text-white flex items-center justify-center font-bold text-[10px]">
                        VH
                      </span>
                      <div>
                        <p className="font-semibold text-xs">Quản trị vận hành - Nguyễn Thùy Linh</p>
                        <p className="text-[10px] text-[#8E8E93] font-mono">linh.nguyen@talentflow.vn</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#34C759] dark:text-[#30D158]">
                      Điều hành
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitch('member')}
                    className="w-full p-2.5 rounded-[14px] bg-[#5856D6]/[0.08] hover:bg-[#5856D6]/[0.14] text-[#1C1C1E] dark:text-white border border-[#5856D6]/20 flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#5856D6] text-white flex items-center justify-center font-bold text-[10px]">
                        TV
                      </span>
                      <div>
                        <p className="font-semibold text-xs">Thành viên tuyển dụng - Lê Hoàng Nam</p>
                        <p className="text-[10px] text-[#8E8E93] font-mono">nam.le@talentflow.vn</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#5856D6] dark:text-[#5E5CE6]">
                      Thành viên
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : regStep === 'info' ? (
            /* REGISTER STEP 1: Basic Credential Input */
            <div className="space-y-3.5">
              {regError && (
                <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF3B30] dark:text-[#FF453A] rounded-[14px] flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="p-3.5 bg-[#007AFF]/[0.08] dark:bg-[#0A84FF]/15 rounded-[14px] border border-[#007AFF]/20 text-xs text-[#1C1C1E] dark:text-[#EBEBF5] flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF] shrink-0" />
                <span>
                  Đăng ký tài khoản nội bộ: Hệ thống sẽ gửi <strong>mã OTP 6 chữ số</strong> về email của bạn để xác thực.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Họ và Tên Nhân Sự *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ví dụ: Hoàng Minh Trí"
                    className="w-full pl-9 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Email Nhận Mã Xác Thực (OTP) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="tri.hoang@company.com"
                    className="w-full pl-9 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Mật Khẩu *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type={regShowPass ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-9 pr-9 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowPass(!regShowPass)}
                    className="absolute right-3 top-2.5 text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white cursor-pointer"
                  >
                    {regShowPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Xác Nhận Mật Khẩu *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type={regShowPass ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-9 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isSendingOtp}
                onClick={handleSendOtp}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white btn-fluent-primary rounded-[14px] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSendingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Tạo & Gửi Mã OTP...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Gửi Mã Xác Thực 6 Chữ Số</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* REGISTER STEP 2: 6-DIGIT OTP VERIFICATION */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-[14px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                  Xác Thực Mã 6 Chữ Số (Email OTP)
                </h4>
                <p className="text-xs text-[#8E8E93]">
                  Vui lòng nhập mã xác thực vừa được gửi đến:{' '}
                  <span className="font-semibold text-[#1C1C1E] dark:text-white font-mono">{regEmail}</span>
                </p>
              </div>

              {/* DEMO / SIMULATION NOTIFICATION BANNER */}
              <div className="p-3.5 bg-[#FF9500]/10 dark:bg-[#FF9F0A]/15 border border-[#FF9500]/25 rounded-[16px] text-xs text-[#1C1C1E] dark:text-[#EBEBF5] space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-[#FF9500] dark:text-[#FF9F0A]">
                  <Sparkles className="w-4 h-4" />
                  <span>Mô phỏng email tự động - Hòm thư ATS</span>
                </div>
                <p>
                  Mã OTP của bạn là:{' '}
                  <strong className="text-base font-mono text-[#007AFF] dark:text-[#0A84FF] tracking-widest px-2 py-0.5 bg-white dark:bg-[#2C2C2E] rounded-[8px] border border-black/[0.08] dark:border-white/[0.12] tabular-nums">
                    {generatedOtp}
                  </strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const digits = generatedOtp.split('');
                    setOtpDigits(digits);
                  }}
                  className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF] hover:underline cursor-pointer pt-0.5 block"
                >
                  Nhấp để tự động điền mã {generatedOtp}
                </button>
              </div>

              {otpError && (
                <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF3B30] dark:text-[#FF453A] rounded-[14px] flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* 6 OTP Input Boxes */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-bold font-mono tabular-nums text-[#1C1C1E] dark:text-white neumorphic-inset rounded-[12px] transition-colors"
                  />
                ))}
              </div>

              {/* Resend and Countdown */}
              <div className="flex items-center justify-between text-xs text-[#8E8E93] pt-1">
                <span>
                  {otpCountdown > 0 ? (
                    <>Mã hết hạn sau: <strong className="font-mono text-[#007AFF] dark:text-[#0A84FF] tabular-nums">{otpCountdown}s</strong></>
                  ) : (
                    <span className="text-[#FF3B30] font-semibold">Mã đã hết hạn</span>
                  )}
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
                  className="text-[#007AFF] dark:text-[#0A84FF] font-semibold hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer"
                >
                  Gửi lại mã OTP
                </button>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRegStep('info')}
                  className="w-1/3 py-2.5 px-3 text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5] btn-fluent-glass rounded-[14px] cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-white btn-fluent-primary rounded-[14px] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận & Đăng Ký</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
