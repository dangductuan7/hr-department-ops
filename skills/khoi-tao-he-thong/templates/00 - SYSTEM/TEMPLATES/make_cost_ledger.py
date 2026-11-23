"""Tạo sổ lịch sử chi phí chương trình (Department Internal/AGENT.md §2.4) nếu chưa có.
Cách chạy (tại thư mục gốc hệ thống): python3 "00 - SYSTEM/TEMPLATES/make_cost_ledger.py"
Không ghi đè tệp đã có.
"""
import os
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'Department Internal', 'OUTPUT', 'So lich su chi phi chuong trinh.xlsx')
if os.path.exists(OUT):
    print('Đã có sổ, không ghi đè:', OUT); raise SystemExit

wb = Workbook()
nk = wb.active; nk.title = 'Nhat ky'
cols = ['Ngày ghi', 'Mã chương trình', 'Tên chương trình', 'Kỳ', 'Giai đoạn', 'Loại', 'Hạng mục chuẩn',
        'Số tiền (VND)', 'Bên cung cấp', 'Căn cứ', 'Trạng thái duyệt', 'Ghi chú']
nk.append(cols)
hf = Font(name='Cambria', size=12, bold=True); fill = PatternFill('solid', fgColor='DCE6F1')
for c in nk[1]:
    c.font = hf; c.fill = fill; c.alignment = Alignment(horizontal='center', wrap_text=True)
for i, w in enumerate([12, 16, 30, 10, 10, 12, 22, 16, 22, 30, 16, 30], 1):
    nk.column_dimensions[nk.cell(1, i).column_letter].width = w
LISTS = {
    'E': 'KH,TT,TC',
    'F': 'Ghi mới,Điều chỉnh',
    'G': 'Địa điểm,Thiết bị - kỹ thuật,Ăn uống,Quà tặng - giải thưởng,Truyền thông - ấn phẩm,Khác,Chưa tách hạng mục',
    'K': 'Đề xuất,Được duyệt,Quyết toán',
}
for col, opts in LISTS.items():
    dv = DataValidation(type='list', formula1=f'"{opts}"', allow_blank=True)
    nk.add_data_validation(dv); dv.add(f'{col}2:{col}5000')
nk.freeze_panes = 'A2'

th = wb.create_sheet('Tong hop')
hdr = ['Mã chương trình', 'Tên chương trình', 'Tổng KH', 'Tổng TT', 'Tổng TC', 'TT−KH', 'TC−TT', 'TC−KH',
       'TC−KH (%)', 'Ngày hoàn tất', 'Hạn ghi TC', 'Tình trạng TC']
th.append(hdr)
for c in th[1]:
    c.font = hf; c.fill = fill; c.alignment = Alignment(horizontal='center', wrap_text=True)
for r in range(2, 202):
    th[f'C{r}'] = f'=IF(A{r}="","",SUMIFS(\'Nhat ky\'!H:H,\'Nhat ky\'!B:B,A{r},\'Nhat ky\'!E:E,"KH"))'
    th[f'D{r}'] = f'=IF(A{r}="","",SUMIFS(\'Nhat ky\'!H:H,\'Nhat ky\'!B:B,A{r},\'Nhat ky\'!E:E,"TT"))'
    th[f'E{r}'] = f'=IF(A{r}="","",SUMIFS(\'Nhat ky\'!H:H,\'Nhat ky\'!B:B,A{r},\'Nhat ky\'!E:E,"TC"))'
    th[f'F{r}'] = f'=IF(A{r}="","",D{r}-C{r})'
    th[f'G{r}'] = f'=IF(A{r}="","",E{r}-D{r})'
    th[f'H{r}'] = f'=IF(A{r}="","",E{r}-C{r})'
    th[f'I{r}'] = f'=IF(OR(A{r}="",C{r}=0),"",H{r}/C{r})'
    th[f'K{r}'] = f'=IF(J{r}="","",J{r}+30)'
    th[f'L{r}'] = f'=IF(A{r}="","",IF(E{r}<>0,"Đã có",IF(J{r}="","Chờ",IF(TODAY()>K{r},"QUÁ HẠN","Chờ"))))'
    th[f'I{r}'].number_format = '0.0%'
    th[f'J{r}'].number_format = 'dd/mm/yyyy'; th[f'K{r}'].number_format = 'dd/mm/yyyy'
for i, w in enumerate([16, 30, 14, 14, 14, 12, 12, 12, 10, 14, 14, 14], 1):
    th.column_dimensions[th.cell(1, i).column_letter].width = w
os.makedirs(os.path.dirname(OUT), exist_ok=True)
wb.save(OUT)
print('Đã tạo:', OUT)
