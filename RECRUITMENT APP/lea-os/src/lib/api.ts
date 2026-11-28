// Thay thế máy chủ Express + Gemini của LEA-OS bằng AI Claude của artifact.
// Giữ nguyên các đường dẫn /api/... để các phân hệ không phải sửa.
// Không còn cơ chế "dự phòng" tự sinh số liệu giả: AI lỗi thì trả lỗi rõ ràng.
import { caps } from './runtime';

type Any = any;

let adminRef: Any = null;
export const setAdminSettingsRef = (s: Any) => (adminRef = s);
export const getAdminSettingsRef = () => adminRef;

export const SEICO_CTX =
  'Doanh nghiệp: SEICO – Công ty Cổ phần Nhà Khung thép và Thiết bị Công nghiệp (kết cấu thép, nhà thép tiền chế, tôn lợp, sơn công nghiệp). ' +
  'Khẩu hiệu: "SEICO – Chuẩn chất thép – Trọn niềm tin". Thời gian làm việc: khối sản xuất từ thứ Hai đến thứ Bảy; khối văn phòng từ thứ Hai đến sáng thứ Bảy ' +
  '(tuyệt đối không ghi "5 ngày/tuần" hay "nghỉ thứ Bảy"). Liên hệ tuyển dụng: hr@seico.vn. Viết tiếng Việt chuẩn, thuật ngữ tiếng Anh phải kèm nghĩa tiếng Việt. ' +
  'Không bịa phúc lợi, số liệu, mức lương, tên người; thông tin không có thì ghi "PENDING".';

const NO_BIAS = 'Không đánh giá, không chấm điểm theo tuổi, giới tính, quê quán, tình trạng hôn nhân, ngoại hình.';

const json = (body: Any, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function ask(prompt: string, tier: 'quick' | 'default' | 'complex' = 'default') {
  const sample = await caps.sample;
  if (!sample) throw Object.assign(new Error('AI chưa được cấp quyền cho trang này'), { code: 'no_ai' });
  return sample.json(prompt, { modelTier: tier });
}

export function activeProfile(job?: Any) {
  const s = adminRef || {};
  const list: Any[] = s.benchmarkProfiles || [];
  return (
    list.find((p) => p.id === job?.benchmarkProfileId) ||
    list.find((p) => p.id === s.activeBenchmarkProfileId) ||
    list.find((p) => p.isDefault) ||
    list[0]
  );
}

const clamp = (n: Any) => Math.max(1, Math.min(5, Math.round((Number(n) || 1) * 10) / 10));

function scoreFromDims(profile: Any, dimScores: Any[]) {
  const dims: Any[] = profile?.dimensions || [];
  const scored = dims.map((d, i) => {
    const hit = dimScores.find((x) => x?.id === d.id) || dimScores[i] || {};
    return { id: d.id, name: d.name, weight: Number(d.weight) || 0, score: clamp(hit.score), evidence: String(hit.evidence || '') };
  });
  const tw = scored.reduce((s, d) => s + d.weight, 0) || 1;
  const total = Math.round((scored.reduce((s, d) => s + d.weight * d.score, 0) / tw) * 10) / 10;
  const pick = (re: RegExp, not?: RegExp) => scored.find((d) => re.test(d.name.toLowerCase()) && !(not && not.test(d.name.toLowerCase())))?.score;
  const avg = total;
  const matrixMatch = {
    skillsScore: pick(/chuyên môn|kỹ năng|kỹ thuật|lập trình|chiến lược/, /mềm/) ?? avg,
    experienceScore: pick(/kinh nghiệm|thực chiến|quản trị|lãnh đạo/) ?? avg,
    educationScore: pick(/học vấn|ngoại ngữ|chứng chỉ|bằng cấp/) ?? avg,
    cultureScore: pick(/văn hóa|giá trị|chủ động|tinh thần/) ?? avg,
  };
  return { total, scored, matrixMatch };
}

const handlers: Record<string, (b: Any) => Promise<Any>> = {
  '/api/health': async () => ({ status: 'ok', ai: Boolean(await caps.sample) }),

  '/api/jd/generate': async (b) => {
    if (!b.title) throw Object.assign(new Error('Chức danh công việc là bắt buộc'), { status: 400 });
    return ask(`Bạn là Trưởng bộ phận tuyển dụng. Tạo bản Mô tả công việc (JD) hoàn chỉnh cho vị trí sau. ${SEICO_CTX} ${NO_BIAS} Không đưa tiêu chí tuổi, giới tính vào JD.
- Chức danh: ${b.title}
- Đơn vị: ${b.department || 'PENDING'}
- Cấp bậc: ${b.level || 'Middle'}
- Mức lương: ${b.salaryRange || 'Thỏa thuận'}
- Địa điểm: ${b.location || 'Hà Nội'}
- Gợi ý yêu cầu chính: ${b.keyRequirements || 'PENDING'}
- Phúc lợi do người dùng cung cấp: ${b.companyPerks || 'không có (để mảng rỗng)'}
Trả về DUY NHẤT JSON: {"title":string,"department":string,"level":string,"salaryRange":string,"location":string,"summary":string (2-3 câu),"responsibilities":string[] (4-6),"requirements":string[] (4-6),"niceToHave":string[] (1-3),"benefits":string[] (chỉ phúc lợi người dùng cung cấp),"benchmarkCriteria":{"technicalSkills":string[] (4-7),"minExperienceYears":number,"educationLevel":string,"culturalFitTraits":string[] (2-4)}}`);
  },

  '/api/jd/parse-upload': async (b) => {
    if (!b.rawText || String(b.rawText).trim().length < 15)
      throw Object.assign(new Error('Nội dung tệp JD quá ngắn hoặc không đọc được văn bản.'), { status: 400 });
    return ask(`Bạn là chuyên gia phân tích tuyển dụng. Bóc tách văn bản JD dưới đây (tệp "${b.fileName || 'JD'}") thành cấu trúc chuẩn. CHỈ dùng thông tin có trong văn bản; thiếu thì ghi "PENDING" hoặc mảng rỗng, không ước tính mức lương. ${NO_BIAS}
--- VĂN BẢN JD ---
${String(b.rawText).slice(0, 20000)}
Trả về DUY NHẤT JSON: {"title":string,"department":string,"level":"Junior|Middle|Senior|Lead|Manager","salaryRange":string,"location":string,"summary":string,"responsibilities":string[],"requirements":string[],"niceToHave":string[],"benefits":string[],"benchmarkCriteria":{"technicalSkills":string[],"minExperienceYears":number,"educationLevel":string,"culturalFitTraits":string[]}}`);
  },

  '/api/social-post/generate': async (b) => {
    if (!b.jobTitle) throw Object.assign(new Error('Chức danh công việc là bắt buộc'), { status: 400 });
    const r = await ask(`Bạn là chuyên gia thương hiệu nhà tuyển dụng của SEICO. Soạn bài đăng tuyển dụng cho nền tảng ${b.platform || 'facebook'}. ${SEICO_CTX} Chỉ dùng thông tin dưới đây, không phóng đại. Có một câu xin ứng viên đồng ý cho SEICO lưu hồ sơ phục vụ tuyển dụng.
- Chức danh: ${b.jobTitle}
- Đơn vị: ${b.department || ''}
- Cấp bậc: ${b.level || ''}
- Thu nhập: ${b.salaryRange || 'Thỏa thuận'}
- Địa điểm: ${b.location || ''}
- Yêu cầu chính: ${b.keyRequirements || ''}
- Phúc lợi: ${b.benefits || 'PENDING'}
Trả về DUY NHẤT JSON: {"platform":"${b.platform || 'facebook'}","headline":string,"bodyContent":string (xuống dòng rõ ràng),"callToAction":string,"hashtags":string[] (3-6),"bannerCopy":{"badgeText":"SEICO TUYỂN DỤNG","titleText":"${b.jobTitle}","subtitleText":string,"perksSummary":string}}`);
    r.bodyContent = '[BẢN NHÁP – CHỜ DUYỆT]\n\n' + (r.bodyContent || '');
    return r;
  },

  '/api/cv/analyze-benchmark': async (b) => {
    if (!b.cvText || String(b.cvText).trim().length < 80)
      throw Object.assign(new Error('Không trích được đủ nội dung CV để phân tích (tệp có thể là bản quét).'), { status: 400 });
    const job = b.jobPosition || {};
    const profile = activeProfile(job);
    const dims: Any[] = profile?.dimensions || [];
    const r = await ask(`Bạn là chuyên gia thẩm định hồ sơ tuyển dụng của SEICO. Đối chiếu CV với JD và bộ tiêu chí benchmark "${profile?.title || ''}". CHỈ dựa vào nội dung CV; thông tin không có thì ghi "Không có thông tin", tuyệt đối không suy diễn. ${NO_BIAS} Viết tiếng Việt.
--- VỊ TRÍ ---
${JSON.stringify({ title: job.title, level: job.level, department: job.department, requirements: job.requirements, benchmarkCriteria: job.benchmarkCriteria })}
--- CÁC CHIỀU ĐÁNH GIÁ (chấm mỗi chiều 1.0–5.0; 5 = vượt yêu cầu, 3 = đáp ứng một phần, 1 = không đáp ứng hoặc không có bằng chứng) ---
${dims.map((d) => `${d.id}: ${d.name} (trọng số ${d.weight}%)`).join('\n')}
--- CV ---
"""${String(b.cvText).slice(0, 16000)}"""
Trả về DUY NHẤT JSON: {"candidateName":string,"candidateEmail":string,"candidatePhone":string,"candidateExperienceYears":number,"educationLevel":string,"dimensionScores":[{"id":string,"score":number,"evidence":string (1 câu dẫn chứng từ CV)}],"matchedSkills":string[],"missingSkills":string[],"strengths":string[] (2-4),"gapsOrRisks":string[] (2-4),"interviewQuestions":string[] (đúng 10 câu, đánh số "1. [Nhóm] ..."),"summary":string (2-3 câu),"resumeTextSnippet":string (1 câu tóm tắt kinh nghiệm)}`);
    const { total, scored, matrixMatch } = scoreFromDims(profile, Array.isArray(r.dimensionScores) ? r.dimensionScores : []);
    const min = Number(adminRef?.minBenchmarkQualifiedScore) || 3.8;
    const none = (v: Any) => (v && v !== 'Không có thông tin' ? v : '');
    return {
      ...r,
      candidateName: none(r.candidateName) || b.candidateNameHint || '',
      candidateEmail: none(r.candidateEmail) || b.candidateEmailHint || '',
      candidatePhone: none(r.candidatePhone),
      benchmarkScore: total,
      matrixMatch,
      dimensionScores: scored,
      benchmarkProfileId: profile?.id || '',
      benchmarkProfileTitle: profile?.title || '',
      recommendation: total >= 4.5 ? 'Strong Hire' : total >= min ? 'Interview' : total >= min - 0.8 ? 'Consider' : 'Reject',
    };
  },

  '/api/mailbox/quick-reply': async (b) => {
    const type = b.replyType || 'thank_you';
    return ask(`Bạn là chuyên viên tuyển dụng Phòng Nhân sự SEICO. Soạn email phản hồi ứng viên, văn phong lịch sự, ấm áp, chuẩn mực. ${SEICO_CTX}
- Ứng viên: ${b.candidateName || 'Ứng viên'} · Vị trí: ${b.jobTitle || ''}
- Mục đích: ${type} (thank_you: cảm ơn và xác nhận đã nhận hồ sơ, hẹn phản hồi trong 05 ngày làm việc; interview_invite: mời phỏng vấn; rejection: từ chối lịch sự, xin phép lưu hồ sơ cho cơ hội sau; request_info: đề nghị bổ sung thông tin)
- Điểm mạnh: ${(b.strengths || []).join(', ') || 'PENDING'}
- Lịch phỏng vấn: ${JSON.stringify(b.interviewDetails || {})} (thiếu thông tin nào thì để [PENDING], không tự bịa ngày giờ, đường dẫn)
- Yêu cầu thêm: ${b.customInstructions || ''}
Không nhắc điểm số benchmark trong email gửi ứng viên. Ký tên "Phòng Nhân sự – Công ty Cổ phần Nhà Khung thép và Thiết bị Công nghiệp (SEICO)".
Trả về DUY NHẤT JSON: {"subject":string,"body":string,"suggestedTone":string,"actionRecommended":string,"replyType":"${type}"}`, 'quick');
  },

  '/api/analytics/ai-insights': async (b) =>
    ask(`Bạn là chuyên gia phân tích dữ liệu tuyển dụng. Phân tích bộ số liệu sau, CHỈ dựa vào số liệu được cung cấp; không bịa số, không so sánh với "trung bình ngành" khi không có dữ liệu. Nếu số liệu quá ít (dưới 5 ứng viên) thì nói rõ là chưa đủ để kết luận.
- Số liệu: ${JSON.stringify(b.metrics || {})}
- Phạm vi: ${b.selectedDepartment || 'Toàn công ty'} · Thời gian: ${b.timeRange || ''}
Trả về DUY NHẤT JSON: {"summaryHeadline":string,"executiveAnalysis":string,"funnelHealth":{"status":"Rất tốt|Tốt|Cần chú ý|Chưa đủ dữ liệu","bottleneck":string,"conversionRate":string},"channelEffectiveness":[{"channel":string,"assessment":string}],"strategicRecommendations":string[] (3-4),"forecast":string}`),
};

export function installApiShim() {
  const orig = window.fetch.bind(window);
  window.fetch = async (input: Any, init?: Any) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const path = url.startsWith('/api/') ? url.split('?')[0] : '';
    const h = path && handlers[path];
    if (!h) return orig(input, init);
    let body: Any = {};
    try {
      body = init?.body ? JSON.parse(init.body) : {};
    } catch {}
    try {
      return json(await h(body));
    } catch (e: Any) {
      return json({ error: e?.message || 'Lỗi AI' }, e?.status || 503);
    }
  };
}

// Gọi trực tiếp (dùng cho nhập CV hàng loạt)
export async function analyzeCv(cvText: string, jobPosition: Any, hints: Any = {}) {
  return handlers['/api/cv/analyze-benchmark']({ cvText, jobPosition, ...hints });
}
