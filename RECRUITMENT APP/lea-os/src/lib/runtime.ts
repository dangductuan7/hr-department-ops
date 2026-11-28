// Kết nối các năng lực của artifact claude.ai (db, sample/AI, user, downloads, mcp/Google Drive).
// Mỗi năng lực có thể vắng mặt (null) – giao diện phải chạy được khi không có.

type Any = any;
const cl: Any = (window as Any).claude;

const use = (name: string): Promise<Any> =>
  cl?.use ? cl.use(name).catch(() => null) : Promise.resolve(null);

export const caps = {
  db: use('db'),
  sample: use('sample'),
  user: use('user'),
  downloads: use('downloads'),
  mcp: use('mcp'),
};

// Thông báo nhỏ thay cho alert() (alert bị chặn trong artifact)
export function toast(msg: string) {
  let el = document.getElementById('seico-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'seico-toast';
    el.setAttribute(
      'style',
      'position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9999;max-width:380px;background:#1C1C1E;color:#fff;padding:12px 16px;border-radius:14px;font:14px/1.45 -apple-system,"Plus Jakarta Sans",sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25)'
    );
    document.body.appendChild(el);
  }
  el.textContent = String(msg);
  el.style.display = 'block';
  clearTimeout((toast as Any).t);
  (toast as Any).t = setTimeout(() => (el!.style.display = 'none'), 4200);
}

// Lưu tệp qua năng lực downloads (thẻ <a download> bị chặn trong artifact)
export async function saveFile(filename: string, data: Blob | string) {
  const d = await caps.downloads;
  if (!d) {
    toast('Trình xem này không cho phép tải tệp.');
    return;
  }
  try {
    await d.save({ filename, data });
    toast(`Đã xuất tệp ${filename}`);
  } catch (e: Any) {
    if (e?.code !== 'declined') toast('Không tải được tệp.');
  }
}
