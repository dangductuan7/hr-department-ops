// Trích văn bản từ tệp CV/JD: PDF (pdf.js), DOCX (mammoth), TXT, ảnh (AI đọc chữ).
// Không bao giờ tự sinh nội dung thay thế khi đọc không được.
import { caps } from './runtime';

type Any = any;

export async function extractText(file: File): Promise<string> {
  const n = file.name.toLowerCase();
  if (/\.(txt|md|csv)$/.test(n) || file.type.startsWith('text/')) return file.text();
  if (n.endsWith('.pdf') || file.type === 'application/pdf') {
    const pdfjs: Any = await import('pdfjs-dist');
    const worker: Any = await import('pdfjs-dist/build/pdf.worker.min.js?url');
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    let t = '';
    for (let i = 1; i <= Math.min(doc.numPages, 10); i++) {
      const p = await doc.getPage(i);
      t += (await p.getTextContent()).items.map((x: Any) => x.str).join(' ') + '\n';
    }
    return t;
  }
  if (n.endsWith('.docx')) {
    const mammoth: Any = await import('mammoth/mammoth.browser');
    return (await (mammoth.default || mammoth).extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
  }
  if (file.type.startsWith('image/')) {
    const sample = await caps.sample;
    if (!sample) throw new Error('AI chưa được cấp quyền nên không đọc được ảnh CV.');
    const lim = await sample.limits().catch(() => ({}));
    if (!lim.images) throw new Error('Trình xem này chưa hỗ trợ đọc ảnh.');
    return (await sample('Chép lại toàn bộ chữ trong ảnh CV này, giữ nguyên thứ tự, không thêm bình luận.', { images: [file], modelTier: 'quick' })).text;
  }
  if (n.endsWith('.doc')) throw new Error('Tệp .doc (Word cũ) chưa đọc được trực tiếp; hãy lưu lại thành .docx hoặc PDF.');
  throw new Error('Định dạng tệp chưa được hỗ trợ.');
}
