import React, { useRef, useState } from 'react';
import { FolderInput, Square, CloudDownload } from 'lucide-react';
import { caps } from '../lib/runtime';
import { analyzeCv } from '../lib/api';
import { Candidate, JobPosition } from '../types';

type Any = any;
const GD = 'Google Drive';
// Thư mục gốc: O - SEICO-APP/Recruitment/DOCUMENT/Curriculum Vitae
export const CV_ROOT_ID = '1mfGG9PfWZoeazbPnroRy8qVha7w-pm2d';
const FOLDER = 'application/vnd.google-apps.folder';
const AUTH_CODES = ['server_not_connected', 'needs_reauth', 'not_in_manifest', 'approval_required', 'blocked_by_policy'];
const MSG: Record<string, string> = {
  server_not_connected: 'Chưa có kết nối Google Drive: thêm Google Drive trong claude.ai → Cài đặt → Kết nối.',
  needs_reauth: 'Kết nối Google Drive đã hết hạn: kết nối lại trong claude.ai → Cài đặt → Kết nối.',
  not_in_manifest: 'Anh/chị chưa cho phép trang đọc Google Drive.',
  approval_required: 'Cần anh/chị cho phép trang đọc Google Drive; bấm lại để cấp quyền.',
  blocked_by_policy: 'Tổ chức đang chặn công cụ Google Drive cho trang này.',
  server_unavailable: 'Google Drive tạm thời không phản hồi, thử lại sau ít phút.',
  no_ai: 'AI chưa được cấp quyền cho trang này nên chưa chấm được CV.',
};

export interface DriveFolder { id: string; name: string; jobId: string }
export interface DriveConfig { rootId?: string; folders: DriveFolder[]; lastSyncAt?: string }

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

// Chọn JD cho CV thuộc thư mục chưa gán JD
async function pickJob(text: string, jobs: JobPosition[]): Promise<JobPosition | null> {
  const sample = await caps.sample;
  if (!sample || !jobs.length) return null;
  try {
    const r = await sample.json(
      `Chọn MỘT vị trí phù hợp nhất với CV dưới đây trong danh sách vị trí của SEICO. Chỉ dựa vào kinh nghiệm, chuyên môn trong CV. Trả về DUY NHẤT JSON {"jobId": string}.
Danh sách: ${JSON.stringify(jobs.map((j) => ({ jobId: j.id, title: j.title, department: j.department })))}
CV: """${text.slice(0, 6000)}"""`,
      { modelTier: 'quick' }
    );
    return jobs.find((j) => j.id === r?.jobId) || null;
  } catch {
    return null;
  }
}

export function DriveImportPanel({
  config, onUpdateConfig, jobs, candidates, onAddCandidate, makeCandidate,
}: {
  config: DriveConfig;
  onUpdateConfig: (c: DriveConfig) => void;
  jobs: JobPosition[];
  candidates: Candidate[];
  onAddCandidate: (c: Candidate) => void;
  makeCandidate: (analysis: Any, job: JobPosition, base: Any) => Candidate;
}) {
  const [msg, setMsg] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const stop = useRef(false);
  const imported = candidates.filter((c: Any) => c.driveFileId).length;

  async function list(mcp: Any, query: string) {
    const out: Any[] = [];
    let tok: string | undefined;
    for (let k = 0; k < 30; k++) {
      const r = await mcp.callTool(GD, 'search_files', { query, excludeContentSnippets: true, pageSize: 100, ...(tok ? { pageToken: tok } : {}) });
      const p = r.payload || {};
      out.push(...(p.files || []));
      tok = p.nextPageToken;
      if (!tok) break;
    }
    return out;
  }

  // Liệt kê toàn bộ CV trong thư mục gốc và mọi thư mục con (bỏ qua thư mục lưu trữ)
  async function collect(mcp: Any) {
    const root = config.rootId || CV_ROOT_ID;
    const files: { file: Any; folder: DriveFolder }[] = [];
    const known = new Map((config.folders || []).map((f) => [f.id, f]));
    const seen: DriveFolder[] = [];
    const walk = async (id: string, name: string, inherited: string, depth: number) => {
      const items = await list(mcp, `parentId = '${id}'`);
      const k = known.get(id);
      const byName = jobs.find((j) => norm(name).includes(norm(j.title)) || norm(j.title).includes(norm(name)));
      const folder: DriveFolder = { id, name, jobId: k?.jobId ?? (byName?.id || inherited) };
      if (id !== root) seen.push(folder);
      for (const it of items) {
        if (it.mimeType === FOLDER) {
          if (/archive|luu tru|lưu trữ/i.test(it.title) || depth > 3) continue;
          await walk(it.id, it.title, folder.jobId, depth + 1);
        } else files.push({ file: it, folder });
      }
    };
    await walk(root, 'Curriculum Vitae', '', 0);
    return { files, seen };
  }

  async function run() {
    const mcp = await caps.mcp;
    if (!mcp) return setMsg('Trình xem này chưa hỗ trợ kết nối Google Drive. Hãy mở artifact trên claude.ai.');
    if (!jobs.length) return setMsg('Cần ít nhất một JD để chấm CV.');
    setRunning(true); stop.current = false; setProgress(null);
    let ok = 0, fail = 0, skip = 0;
    try {
      setMsg('Đang quét thư mục Curriculum Vitae trên Google Drive…');
      const { files, seen } = await collect(mcp);
      // Ghi nhớ thư mục mới phát hiện (giữ JD đã gán)
      const merged = [...(config.folders || [])];
      seen.forEach((f) => { if (!merged.some((x) => x.id === f.id)) merged.push(f); });
      const done = new Set(candidates.flatMap((c: Any) => [c.driveFileId, ...(c.altDriveFileIds || [])]).filter(Boolean));
      const todo = files.filter((x) => !done.has(x.file.id));
      if (!todo.length) {
        onUpdateConfig({ ...config, folders: merged, lastSyncAt: new Date().toISOString() });
        setRunning(false);
        return setMsg(`Không có CV mới. Hệ thống đang có ${imported} CV từ Google Drive.`);
      }
      setProgress({ done: 0, total: todo.length });
      for (const { file: x, folder: f } of todo) {
        if (stop.current) break;
        setMsg(`Đang chấm ${x.title}`);
        try {
          const r = await mcp.callTool(GD, 'read_file_content', { fileId: x.id });
          const text = String(r.payload?.fileContent || '');
          if (text.trim().length < 80) { skip++; continue; }
          const job = jobs.find((j) => j.id === f.jobId) || (await pickJob(text, jobs));
          if (!job) { fail++; continue; }
          const a = await analyzeCv(text, job, { candidateNameHint: String(x.title).replace(/\.[a-z]+$/i, '') });
          onAddCandidate(makeCandidate(a, job, {
            source: 'Google Drive', resumeFileName: x.title,
            notes: `Nhập từ Google Drive (thư mục ${f.name}${f.jobId ? '' : ', JD do AI chọn'}) lúc ${new Date().toLocaleString('vi-VN')}`,
            extra: { driveFileId: x.id, driveFolderId: f.id, driveUrl: x.viewUrl || '' },
          }));
          ok++;
        } catch (e: Any) {
          if (AUTH_CODES.includes(e?.code) || e?.code === 'no_ai') throw e;
          fail++;
        } finally {
          setProgress({ done: ok + fail + skip, total: todo.length });
        }
      }
      onUpdateConfig({ ...config, folders: merged, lastSyncAt: new Date().toISOString() });
      setMsg(`${stop.current ? 'Đã dừng. ' : ''}Đã cập nhật ${ok} CV mới vào hệ thống${fail ? `, ${fail} CV lỗi` : ''}${skip ? `, ${skip} CV không trích được chữ (cần xem tay)` : ''}.`);
    } catch (e: Any) {
      setMsg(MSG[e?.code] || 'Lỗi Google Drive: ' + (e?.code || e?.message || 'không rõ'));
    }
    setRunning(false);
  }

  const pct = progress && progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="glass-panel rounded-[22px] p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[12px] bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center shrink-0"><FolderInput className="w-5 h-5" /></div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white">Nhập CV từ Google Drive</h3>
            <p className="text-xs text-[#8E8E93] dark:text-[#98989D]">
              {imported} CV đã nhập{config.lastSyncAt ? ` · cập nhật lần cuối ${new Date(config.lastSyncAt).toLocaleString('vi-VN')}` : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {running && (
            <button onClick={() => { stop.current = true; setMsg('Đang dừng sau CV hiện tại…'); }} className="h-9 px-3 rounded-full btn-fluent-glass text-xs font-semibold flex items-center gap-1.5 cursor-pointer"><Square className="w-3.5 h-3.5" />Dừng</button>
          )}
          <button disabled={running} onClick={run} className="h-9 px-4 rounded-full btn-fluent-primary text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 cursor-pointer whitespace-nowrap">
            <CloudDownload className="w-4 h-4" />{running ? 'Đang nhập…' : 'Nhập CV mới'}
          </button>
        </div>
      </div>
      {progress && running && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-black/[0.06] dark:bg-white/10 overflow-hidden"><div className="h-full bg-[#007AFF] transition-all" style={{ width: `${pct}%` }} /></div>
          <p className="mt-1 text-[11px] font-mono text-[#8E8E93]">{progress.done}/{progress.total} CV</p>
        </div>
      )}
      {msg && <p className="mt-2 text-xs text-[#3C3C43] dark:text-[#EBEBF5] break-words">{msg}</p>}
    </div>
  );
}
