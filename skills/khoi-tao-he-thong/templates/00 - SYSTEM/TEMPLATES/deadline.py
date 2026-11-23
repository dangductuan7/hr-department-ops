"""Tính thời hạn mặc định T+15 (QT-04 mục 14 (d)).
Cộng 15 ngày tính từ ngày kế tiếp ngày bắt đầu, không tính Chủ Nhật và ngày trong 00 - SYSTEM/holidays.txt.
Cách chạy (tại thư mục 00 - SYSTEM): python3 TEMPLATES/deadline.py 05/01/2027 [số_ngày]
"""
import os, sys
from datetime import date, datetime, timedelta

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOL = os.path.join(BASE, 'holidays.txt')

def load_holidays():
    days = set()
    if os.path.exists(HOL):
        for line in open(HOL, encoding='utf-8'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            try:
                days.add(datetime.strptime(line.split()[0], '%d/%m/%Y').date())
            except ValueError:
                pass
    return days

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    start = datetime.strptime(sys.argv[1], '%d/%m/%Y').date()
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 15
    hol = load_holidays()
    if not any(d.year == start.year for d in hol):
        print(f'⚠️ holidays.txt chưa có ngày nghỉ năm {start.year} – kết quả chỉ trừ Chủ Nhật.')
    d, counted, skipped = start, 0, []
    while counted < n:
        d += timedelta(days=1)
        if d.weekday() == 6 or d in hol:
            skipped.append(d.strftime('%d/%m/%Y')); continue
        counted += 1
    print('Thời hạn:', d.strftime('%d/%m/%Y'))
    print('Số ngày bỏ qua (Chủ Nhật, lễ):', len(skipped))

if __name__ == '__main__':
    main()
