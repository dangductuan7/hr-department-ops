import React, { useRef, useState } from 'react';
import { FolderInput, Square, CloudDownload } from 'lucide-react';
import { caps } from '../lib/runtime';
import { analyzeCv } from '../lib/api';
import { Candidate, JobPosition } from '../types';

type Any = any;
const GD = 'Google Drive';
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

export function DriveImportPanel({
  folders, onUpdateFolders, jobs, candidates, onAddCandidate, makeCandidate,
}: {
  folders: DriveFolder[];
  onUpdateFolders: (f: DriveFolder[]) => void;
  jobs: JobPosition[];
  candidates: Candidate[];
  onAddCandidate: (c: Candidate) => void;
  makeCandidate: (analysis: Any, job: JobPosition, base: Any) => Candidate;
}) {
  const [msg, setMsg] = useState('');
  const [running, setRunning] = useState(false);
  const stop = useRef(false);

  async function listFolder(mcp: Any, id: string) {
    const out: Any[] = [];
    let tok: string | undefined;
    for (let k = 0; k < 20; k++) {
      const r = await mcp.callTool(GD, 'search_files', {
        query: `parentId = '${id}' and mimeType != 'application/vnd.google-apps.folder'`,
        excludeContentSnippets: true, pageSize: 100, ...(tok ? { pageToken: tok } : {}),
      });
      const p = r.payload || {};
      out.push(...(p.files || []));
      tok = p.nextPageToken;
      if (!tok) break;
    }
    return out;
  }

  async function run() {
    const mcp = await caps.mcp;
    if (!mcp) return setMsg('Trình xem này chưa hỗ trợ kết nối Google Drive. Hãy mở artifact trên claude.ai.');
    const todo = folders.filter((f) => f.jobId && jobs.some((j) => j.id === f.jobId));
    if (!todo.length) return setMsg('Chưa gán JD cho thư mục nào.');
    const done = new Set(candidates.map((c: Any) => c.driveFileId).filter(Boolean));
    setRunning(true); stop.current = false;
    let ok = 0, fail = 0, skip = 0;
    try {
      for (const f of todo) {
        if (stop.current) break;
        const job = jobs.find((j) => j.id === f.jobId)!;
        setMsg(`Đang liệt kê thư mục ${f.name}…`);
        const files = (await listFolder(mcp, f.id)).filter((x) => !done.has(x.id));
        for (const x of files) {
          if (stop.current) break;
          setMsg(`${f.name}: đang chấm ${x.title} (${ok + fail + skip + 1}/${files.length})…`);
          try {
            const r = await mcp.callTool(GD, 'read_file_content', { fileId: x.id });
            const text = String(r.payload?.fileContent || '');
            if (text.trim().length < 80) { skip++; continue; }
            const a = await analyzeCv(text, job, { candidateNameHint: String(x.title).replace(/\.[a-z]+$/i, '') });
            onAddCandidate(makeCandidate(a, job, {
              source: 'Google Drive', resumeFileName: x.title,
              notes: `Nhập từ Google Drive (thư mục ${f.name}) lúc ${new Date().toLocaleString('vi-VN')}`,
              extra: { driveFileId: x.id, driveFolderId: f.id, driveUrl: x.viewUrl || '' },
            }));
            done.add(x.id); ok++;
          } catch (e: Any) {
            if (AUTH_CODES.includes(e?.code) || e?.code === 'no_ai') throw e;
            fail++;
          }
        }
      }
      setMsg(`${stop.current ? 'Đã dừng. ' : ''}Nhập xong ${ok} CV${fail ? `, ${fail} CV lỗi` : ''}${skip ? `, ${skip} CV không trích được chữ (cần xem tay)` : ''}.`);
    } catch (e: Any) {
      setMsg(MSG[e?.code] || 'Lỗi Google Drive: ' + (e?.code || e?.message || 'không rõ'));
    }
    setRunning(false);
  }

  return (
    <div className="mx-4 md:mx-6 mt-4 md:mt-6 rounded-[22px] bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 p-4 md:p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[12px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0"><FolderInput className="w-5 h-5" /></div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold">Nhập CV từ Google Drive</h3>
            <p className="text-[12.5px] text-[#3C3C43]/70 dark:text-white/60">Recruitment/DOCUMENT/Curriculum Vitae/ · bỏ qua CV đã nhập · chấm theo JD gán cho từng thư mục</p>
          </div>
        </div>
        <div className="flex gap-2">
          {running && (
            <button onClick={() => { stop.current = true; setMsg('Đang dừng sau CV hiện tại…'); }} className="h-9 px-3 rounded-full border border-black/10 dark:border-white/15 text-[13px] font-semibold flex items-center gap-1.5"><Square className="w-3.5 h-3.5" />Dừng</button>
          )}
          <button disabled={running} onClick={run} className="h-9 px-4 rounded-full bg-[#007AFF] text-white text-[13px] font-semibold flex items-center gap-1.5 disabled:opacity-50"><CloudDownload className="w-4 h-4" />{running ? 'Đang nhập…' : 'Nhập CV mới'}</button>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-[#3C3C43]/60 dark:text-white/50"><th className="py-1.5 pr-3 font-medium">Thư mục CV</th><th className="py-1.5 pr-3 font-medium">Chấm theo JD</th><th className="py-1.5 font-medium text-right">Đã nhập</th></tr></thead>
          <tbody>
            {folders.map((f, i) => (
              <tr key={f.id} className="border-t border-black/5 dark:border-white/10">
                <td className="py-2 pr-3 font-medium whitespace-nowrap">{f.name}</td>
                <td className="py-2 pr-3">
                  <select value={f.jobId} onChange={(e) => onUpdateFolders(folders.map((x, k) => (k === i ? { ...x, jobId: e.target.value } : x)))} className="w-full min-w-[12em] bg-[#F2F2F7] dark:bg-white/10 rounded-[10px] px-2 py-1.5 text-[13px]">
                    <option value="">— Không nhập —</option>
                    {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </td>
                <td className="py-2 text-right font-mono">{candidates.filter((c: Any) => c.driveFolderId === f.id).length}</td>
              </tr>
            ))}
            {!folders.length && <tr><td colSpan={3} className="py-3 text-center text-[#3C3C43]/60">Chưa cấu hình thư mục CV</td></tr>}
          </tbody>
        </table>
      </div>
      {msg && <p className="mt-2 text-[12.5px] text-[#3C3C43]/80 dark:text-white/70">{msg}</p>}
    </div>
  );
}
