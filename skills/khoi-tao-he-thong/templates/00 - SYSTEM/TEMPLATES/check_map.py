"""So dấu đối chiếu trong 00 - SYSTEM/MAP.md mục 0 với STT dòng cuối của từng log (QT-06 mục 2).
Cách chạy (tại thư mục gốc hệ thống): python3 "00 - SYSTEM/TEMPLATES/check_map.py"
"""
import os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MAP = os.path.join(ROOT, '00 - SYSTEM', 'MAP.md')

def last_stt(path):
    best = 0
    for line in open(path, encoding='utf-8'):
        m = re.match(r'^\|\s*(\d+)\s*\|', line)
        if m:
            best = max(best, int(m.group(1)))
    return best

expected = {}
in_sec0 = False
for line in open(MAP, encoding='utf-8'):
    if line.startswith('## 0.'):
        in_sec0 = True; continue
    if in_sec0 and line.startswith('## '):
        break
    m = re.match(r'^\|\s*`([^`]+)`\s*\|\s*(\d+)\s*\|', line)
    if in_sec0 and m:
        expected[m.group(1)] = int(m.group(2))

actual = {}
for p in [os.path.join(ROOT, 'log - ROOT.md')] + glob.glob(os.path.join(ROOT, '*', 'log - *.md')):
    rel = os.path.relpath(p, ROOT).replace(os.sep, '/')
    actual[rel] = last_stt(p)

ok = True
for rel, exp in expected.items():
    act = actual.get(rel)
    if act is None:
        print(f'THIẾU LOG  {rel} → quét lại toàn bộ (QT-06 mục 4)'); ok = False
    elif act > exp:
        print(f'LỆCH       {rel}: MAP {exp}, log {act} → đọc dòng {exp+1}–{act}'); ok = False
    elif act < exp:
        print(f'LOG BỊ SỬA {rel}: MAP {exp} > log {act} → quét lại toàn bộ'); ok = False
for rel in actual:
    if rel not in expected:
        print(f'MỚI        {rel} chưa có trong MAP → quét lại thư mục này'); ok = False
top = {d for d in os.listdir(ROOT) if os.path.isdir(os.path.join(ROOT, d)) and d != 'archive'}
mapped = {r.split('/')[0] for r in expected if '/' in r}
for d in sorted(top - mapped):
    print(f'THƯ MỤC    {d}/ chưa có trong MAP → quét lại toàn bộ')
    ok = False
print('KHỚP – dùng MAP, không quét thư mục.' if ok else 'Có lệch – xử lý theo QT-06 mục 3, 4.')
