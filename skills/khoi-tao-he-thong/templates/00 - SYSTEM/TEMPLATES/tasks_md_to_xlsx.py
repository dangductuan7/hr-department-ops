"""Đồng bộ MANAGER/TASKS.md -> MANAGER/TASKS.xlsx (QT-04 mục 10).
Ghi đè trực tiếp lên cùng một tệp, một sheet duy nhất.
Cách chạy (tại thư mục 00 - SYSTEM): python3 TEMPLATES/tasks_md_to_xlsx.py
Cần thư viện openpyxl (pip install openpyxl).
"""
import os, re, glob
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD = os.path.join(BASE, 'MANAGER', 'TASKS.md')
XLSX = os.path.join(BASE, 'MANAGER', 'TASKS.xlsx')
WIDTHS = [16, 34, 60, 10, 18, 26, 16, 14, 18, 18, 42, 40]

def read_table(path):
    rows = []
    for line in open(path, encoding='utf-8'):
        line = line.rstrip('\n')
        if not line.startswith('|') or re.match(r'^\|\s*-', line):
            continue
        rows.append([c.strip().replace('`', '') for c in line.strip('|').split('|')])
    return rows

rows = read_table(MD)
header, body = rows[0], rows[1:]
# Giữ cả việc đã chuyển sang lưu trữ quý (MANAGER/archive/TASKS - <năm>-Q<quý>.md) – QT-04 mục 7, 10
seen = {r[0] for r in body}
for arc in sorted(glob.glob(os.path.join(BASE, 'MANAGER', 'archive', 'TASKS - *.md'))):
    for r in read_table(arc)[1:]:
        if r and r[0] not in seen:
            body.append(r); seen.add(r[0])

wb = Workbook(); ws = wb.active; ws.title = 'Danh mục công việc'
thin = Side(style='thin', color='BFBFBF'); border = Border(left=thin, right=thin, top=thin, bottom=thin)
hfont = Font(name='Cambria', size=18, bold=True)
bfont = Font(name='Cambria', size=14)
ws.append(header)
for c in ws[1]:
    c.font = hfont; c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    c.fill = PatternFill('solid', fgColor='DCE6F1'); c.border = border
for r in body:
    r = (r + [''] * len(header))[:len(header)]
    ws.append(r)
for row in ws.iter_rows(min_row=2):
    for c in row:
        c.font = bfont; c.alignment = Alignment(horizontal='left', vertical='top', wrap_text=True); c.border = border
        c.number_format = '@'
for i, w in enumerate(WIDTHS, 1):
    ws.column_dimensions[ws.cell(1, i).column_letter].width = w
ws.row_dimensions[1].height = 54
ws.freeze_panes = 'B2'
ws.auto_filter.ref = ws.dimensions
wb.save(XLSX)
print('TASKS.xlsx:', len(body), 'việc')
