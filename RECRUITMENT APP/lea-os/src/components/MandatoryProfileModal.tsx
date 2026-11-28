import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Building2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Phone,
  CreditCard,
  Calendar,
  MapPin,
  Briefcase,
  Globe,
  Hash,
  X,
  Sparkles,
} from 'lucide-react';
import { AppUser, UserProfile } from '../types';

interface MandatoryProfileModalProps {
  isOpen: boolean;
  user: AppUser | null;
  isMandatory?: boolean;
  onSaveProfile: (profile: UserProfile) => void;
  onClose?: () => void;
}

export const MandatoryProfileModal: React.FC<MandatoryProfileModalProps> = ({
  isOpen,
  user,
  isMandatory = false,
  onSaveProfile,
  onClose,
}) => {
  // 1. Mandatory Basic Identity Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [address, setAddress] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // 2. Optional Enterprise Fields
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companySize, setCompanySize] = useState('50 - 200 nhân sự');
  const [officeAddress, setOfficeAddress] = useState('');
  const [industry, setIndustry] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync initial user profile data
  useEffect(() => {
    if (user) {
      setFullName(user.profile.fullName || user.fullName || '');
      setPhone(user.profile.phone || '');
      setIdentityNumber(user.profile.identityNumber || '');
      setDateOfBirth(user.profile.dateOfBirth || '');
      setGender(user.profile.gender || 'Nam');
      setAddress(user.profile.address || '');
      setJobTitle(user.profile.jobTitle || 'Chuyên viên Nhân sự');

      setCompanyName(user.profile.companyName || 'TalentFlow Technology Group');
      setTaxCode(user.profile.taxCode || '');
      setCompanyWebsite(user.profile.companyWebsite || 'https://talentflow.vn');
      setCompanySize(user.profile.companySize || '50 - 200 nhân sự');
      setOfficeAddress(user.profile.officeAddress || '');
      setIndustry(user.profile.industry || 'Công nghệ thông tin & Quản trị nhân sự');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation for Mandatory Basic Identity Fields
    if (!fullName.trim()) {
      setValidationError('Vui lòng điền Họ và Tên (trường bắt buộc).');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setValidationError('Vui lòng điền Số điện thoại liên hệ hợp lệ (trường bắt buộc).');
      return;
    }
    if (!identityNumber.trim() || identityNumber.trim().length < 9) {
      setValidationError('Vui lòng điền Số CCCD / CMND hợp lệ (trường bắt buộc).');
      return;
    }
    if (!dateOfBirth) {
      setValidationError('Vui lòng chọn Ngày sinh của bạn (trường bắt buộc).');
      return;
    }
    if (!address.trim()) {
      setValidationError('Vui lòng điền Địa chỉ thường trú / Nơi ở hiện tại (trường bắt buộc).');
      return;
    }
    if (!jobTitle.trim()) {
      setValidationError('Vui lòng điền Chức danh / Vị trí công tác nội bộ (trường bắt buộc).');
      return;
    }

    const updatedProfile: UserProfile = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      identityNumber: identityNumber.trim(),
      dateOfBirth,
      gender,
      address: address.trim(),
      jobTitle: jobTitle.trim(),

      // Optional corporate fields
      companyName: companyName.trim() || undefined,
      taxCode: taxCode.trim() || undefined,
      companyWebsite: companyWebsite.trim() || undefined,
      companySize: companySize || undefined,
      officeAddress: officeAddress.trim() || undefined,
      industry: industry.trim() || undefined,
    };

    onSaveProfile(updatedProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel bg-white/95 dark:bg-[#1C1C1E]/95 w-full max-w-2xl rounded-[26px] shadow-2xl overflow-hidden text-xs flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-b from-[#2E96FF] to-[#007AFF] flex items-center justify-center text-white shadow-[0_3px_10px_rgba(0,122,255,0.3)] shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white">
                  Cập Nhật Hồ Sơ Tài Khoản Nhân Sự
                </h3>
                {isMandatory && (
                  <span className="text-[10px] font-semibold text-[#FF3B30] dark:text-[#FF453A]">
                    · Bắt buộc sau đăng ký
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">
                {isMandatory
                  ? 'Vui lòng hoàn tất các thông tin danh tính cơ bản bên dưới để kích hoạt đầy đủ quyền hạn truy cập hệ thống.'
                  : 'Chỉnh sửa thông tin hồ sơ cá nhân và thông tin doanh nghiệp công tác.'}
              </p>
            </div>
          </div>

          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#767680]/15 hover:bg-[#767680]/25 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {validationError && (
            <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#FF3B30] dark:text-[#FF453A] rounded-[14px] flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* SECTION 1: MANDATORY BASIC IDENTITY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-[8px] bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h4 className="text-xs font-bold text-[#1C1C1E] dark:text-white tracking-tight">
                  Thông Tin Danh Tính Cơ Bản (Bắt Buộc *)
                </h4>
              </div>
              <span className="text-[11px] text-[#FF3B30] dark:text-[#FF453A] font-semibold">
                * Bắt buộc
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Họ tên */}
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Họ và Tên Đầy Đủ *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Đặng Đức Tuấn"
                  className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Số Điện Thoại Di Động *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0988 123 456"
                    className="w-full pl-9 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                  />
                </div>
              </div>

              {/* CCCD / CMND */}
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Số Căn Cước Công Dân (CCCD/CMND) *
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    placeholder="Ví dụ: 001095012345 (12 số)"
                    className="w-full pl-9 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                  />
                </div>
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Ngày Tháng Năm Sinh *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                  />
                </div>
              </div>

              {/* Giới tính */}
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Giới Tính *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác / Không công khai</option>
                </select>
              </div>

              {/* Chức danh nội bộ */}
              <div>
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Chức Danh / Vị Trí Công Tác *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Ví dụ: HR Director, Senior Recruiter..."
                    className="w-full pl-9 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                  />
                </div>
              </div>

              {/* Địa chỉ thường trú */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#1C1C1E] dark:text-slate-200 mb-1.5">
                  Địa Chỉ Thường Trú / Nơi Ở Hiện Tại *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ví dụ: Tòa nhà Dịch Vọng Hậu, Cầu Giấy, Hà Nội"
                    className="w-full pl-9 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: OPTIONAL ENTERPRISE DETAILS */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-[8px] bg-[#767680]/20 text-[#3C3C43] dark:text-[#EBEBF5] flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h4 className="text-xs font-bold text-[#3C3C43] dark:text-slate-200 tracking-tight">
                  Thông Tin Về Doanh Nghiệp (Tùy Chọn)
                </h4>
              </div>
              <span className="text-[11px] text-[#8E8E93] font-medium">
                Có thể bổ sung sau
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Tên doanh nghiệp */}
              <div>
                <label className="block font-medium text-[#3C3C43] dark:text-slate-300 mb-1.5">
                  Tên Doanh Nghiệp / Chi Nhánh
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Tên công ty / tập đoàn"
                    className="w-full pl-9 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
                  />
                </div>
              </div>

              {/* Mã số thuế */}
              <div>
                <label className="block font-medium text-[#3C3C43] dark:text-slate-300 mb-1.5">
                  Mã Số Thuế Doanh Nghiệp
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    placeholder="Mã số thuế (10 hoặc 13 số)"
                    className="w-full pl-9 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block font-medium text-[#3C3C43] dark:text-slate-300 mb-1.5">
                  Website Doanh Nghiệp
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://company.vn"
                    className="w-full pl-9 pr-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
                  />
                </div>
              </div>

              {/* Quy mô nhân sự */}
              <div>
                <label className="block font-medium text-[#3C3C43] dark:text-slate-300 mb-1.5">
                  Quy Mô Nhân Sự
                </label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white"
                >
                  <option value="Dưới 50 nhân sự">Dưới 50 nhân sự</option>
                  <option value="50 - 200 nhân sự">50 - 200 nhân sự</option>
                  <option value="200 - 500 nhân sự">200 - 500 nhân sự</option>
                  <option value="500 - 1000 nhân sự">500 - 1000 nhân sự</option>
                  <option value="Trên 1000 nhân sự">Trên 1000 nhân sự</option>
                </select>
              </div>

              {/* Lĩnh vực hoạt động */}
              <div>
                <label className="block font-medium text-[#3C3C43] dark:text-slate-300 mb-1.5">
                  Lĩnh Vực Hoạt Động
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Ví dụ: FinTech, E-commerce, EdTech..."
                  className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
                />
              </div>

              {/* Địa chỉ văn phòng */}
              <div>
                <label className="block font-medium text-[#3C3C43] dark:text-slate-300 mb-1.5">
                  Địa Chỉ Trụ Sở / Văn Phòng
                </label>
                <input
                  type="text"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  placeholder="Ví dụ: Tòa Keangnam Landmark 72, Hà Nội"
                  className="w-full px-3 py-2.5 neumorphic-inset rounded-[12px] text-xs text-[#1C1C1E] dark:text-white placeholder:text-[#8E8E93]"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
            <span className="text-[11px] text-[#8E8E93]">
              {isMandatory
                ? 'Bạn cần lưu thông tin danh tính để mở khóa hệ thống.'
                : 'Thông tin có thể cập nhật lại bất kỳ lúc nào.'}
            </span>

            <div className="flex items-center gap-2">
              {!isMandatory && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#3C3C43] dark:text-[#EBEBF5] btn-fluent-glass rounded-full cursor-pointer"
                >
                  Hủy Bỏ
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white btn-fluent-primary rounded-full transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu & Kích Hoạt Hồ Sơ</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
