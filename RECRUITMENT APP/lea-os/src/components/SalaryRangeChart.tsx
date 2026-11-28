import React, { useState } from 'react';
import { Wallet } from 'lucide-react';

// Nguồn: artifact "SEICO | Báo cáo phòng nhân sự" (HRD REPORT), mục Tuyển dụng – trích từ
// Recruitment/OUTPUT/Phan tich 13 kenh tuyen dung SEICO (18.11.2026).xlsx (PUBLIC). Đơn vị: triệu VNĐ/tháng.
type Khoi = 'Văn phòng' | 'Nhà máy';
const SAL: [string, Khoi, number, number][] = [
  ['Trưởng phòng Marketing B2B', 'Văn phòng', 30, 50],
  ['Trưởng phòng KD ngành Sơn (SP Paint)', 'Văn phòng', 25, 40],
  ['Trưởng nhóm Hỗ trợ KD xuất khẩu', 'Văn phòng', 20, 30],
  ['Chuyên viên Kế toán tổng hợp', 'Văn phòng', 20, 25],
  ['Chuyên viên Tuyển dụng – Đào tạo', 'Văn phòng', 18, 25],
  ['Chuyên viên Quản lý hợp đồng xây dựng', 'Văn phòng', 15, 25],
  ['NV/CV Hỗ trợ KD & đấu thầu xuất khẩu', 'Văn phòng', 15, 25],
  ['Chuyên viên Pháp chế', 'Văn phòng', 16, 22],
  ['Kỹ sư Thiết kế KCT / TKSX (Tekla)', 'Nhà máy', 14, 22],
  ['NV Thiết kế sản xuất – KCT, Bao che', 'Nhà máy', 14, 20],
  ['Nhân viên Kinh doanh B2B', 'Văn phòng', 12, 20],
  ['Kỹ sư Chất lượng (QC)', 'Nhà máy', 12, 20],
  ['Quản lý dự án', 'Nhà máy', 12, 20],
  ['Thợ hàn (20), lao động phổ thông (10)', 'Nhà máy', 12, 20],
  ['Nhân viên Kinh doanh nhà thép', 'Nhà máy', 10, 20],
  ['Nhân viên R&D Sơn', 'Nhà máy', 14, 18],
  ['NV/Kỹ sư Dự toán (QS)', 'Nhà máy', 12, 18],
  ['Nhân viên Thống kê', 'Nhà máy', 12, 17],
  ['Nhân viên Thủ kho', 'Nhà máy', 11, 14],
];
const MAX = 50;
const TICKS = [0, 10, 20, 30, 40, 50];
const COLOR: Record<Khoi, string> = { 'Văn phòng': '#0A6FE0', 'Nhà máy': '#D97400' };

export const SalaryRangeChart: React.FC = () => {
  const [hot, setHot] = useState<number | null>(null);
  const pct = (v: number) => `${(v / MAX) * 100}%`;
  return (
    <div className="glass-panel rounded-[26px] p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[14px] bg-[#0A6FE0]/12 text-[#0A6FE0] flex items-center justify-center shrink-0"><Wallet className="w-5 h-5" /></div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#1C1C1E] dark:text-white">Khoảng lương công bố theo vị trí</h3>
        </div>
        <span className="text-xs text-[#8E8E93]">Triệu VNĐ/tháng · {SAL.length} vị trí có khoảng lương</span>
      </div>

      <div className="space-y-0.5" onMouseLeave={() => setHot(null)}>
        {SAL.map(([ten, khoi, lo, hi], i) => (
          <div
            key={ten}
            onMouseEnter={() => setHot(i)}
            onClick={() => setHot(hot === i ? null : i)}
            className={`grid grid-cols-[minmax(0,42%)_minmax(0,1fr)] sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] items-center gap-3 py-1 rounded-lg transition-opacity ${hot !== null && hot !== i ? 'opacity-40' : ''}`}
            title={`${ten} · ${khoi}: ${lo}–${hi} triệu`}
          >
            <span className="text-right text-[11.5px] sm:text-[12.5px] text-[#1C1C1E] dark:text-white leading-tight line-clamp-2 break-words">{ten}</span>
            <div className="relative h-5">
              {TICKS.map((t) => (
                <div key={t} className="absolute top-0 bottom-0 border-l border-dashed border-black/10 dark:border-white/10" style={{ left: pct(t) }} />
              ))}
              <div className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full" style={{ left: pct(lo), width: `calc(${pct(hi - lo)})`, background: COLOR[khoi], opacity: 0.45 }} />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full ring-2 ring-white dark:ring-[#1C1C1E]" style={{ left: pct(lo), background: COLOR[khoi] }} />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full ring-2 ring-white dark:ring-[#1C1C1E]" style={{ left: pct(hi), background: COLOR[khoi] }} />
              <span
                className="absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold tabular-nums text-[#1C1C1E] dark:text-white whitespace-nowrap"
                style={hi > 40 ? { right: `calc(${100 - (lo / MAX) * 100}% + 10px)` } : { left: `calc(${pct(hi)} + 10px)` }}
              >
                {lo}–{hi}
              </span>
            </div>
          </div>
        ))}
        <div className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)] sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] gap-3 pt-1">
          <span />
          <div className="relative h-4 border-t border-black/10 dark:border-white/10">
            {TICKS.map((t) => (
              <span key={t} className="absolute -translate-x-1/2 text-[11px] text-[#8E8E93] tabular-nums" style={{ left: pct(t) }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4 text-xs text-[#3C3C43] dark:text-[#EBEBF5]">
        {(Object.keys(COLOR) as Khoi[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-[3px]" style={{ background: COLOR[k] }} />{k}</span>
        ))}
      </div>
      <p className="mt-2 text-xs text-[#8E8E93] leading-relaxed">
        Không gồm: NV Kinh doanh dự án (“từ 20 triệu”) và 8 vị trí không công bố lương. Nguồn: SEICO | Báo cáo phòng nhân sự – phân tích 13 kênh tuyển dụng (18/11/2026).
      </p>
    </div>
  );
};
