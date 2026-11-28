import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installApiShim } from './lib/api';
import { saveFile, toast } from './lib/runtime';

// 1. Các lệnh /api/... của LEA-OS chạy bằng AI Claude của artifact
installApiShim();

// 2. alert/confirm bị chặn trong artifact: alert → thông báo nổi; confirm → đồng ý và báo lại
window.alert = (m?: any) => toast(String(m ?? ''));
window.confirm = (m?: any) => {
  toast('Đã thực hiện: ' + String(m ?? '').replace(/^Bạn có chắc( chắn)? (muốn )?/i, ''));
  return true;
};

// 3. Tải tệp (PNG banner, Excel, TXT) qua năng lực downloads thay cho thẻ <a download>
document.addEventListener(
  'click',
  (e) => {
    const a = (e.target as HTMLElement)?.closest?.('a[download]') as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!/^(blob:|data:)/.test(href)) return;
    e.preventDefault();
    e.stopPropagation();
    fetch(href)
      .then((r) => r.blob())
      .then((b) => saveFile(a.getAttribute('download') || 'tep-tai-ve', b))
      .catch(() => toast('Không tải được tệp.'));
  },
  true
);

// Thẻ <a> tạo bằng mã rồi gọi .click() (không nằm trong trang) không phát sự kiện lên document
const origClick = HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
  const href = this.getAttribute('href') || '';
  if (this.hasAttribute('download') && /^(blob:|data:)/.test(href)) {
    fetch(href)
      .then((r) => r.blob())
      .then((b) => saveFile(this.getAttribute('download') || 'tep-tai-ve', b))
      .catch(() => toast('Không tải được tệp.'));
    return;
  }
  return origClick.call(this);
};

createRoot(document.getElementById('root')!).render(<App />);
