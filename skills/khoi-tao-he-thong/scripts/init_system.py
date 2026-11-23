"""Khởi tạo hệ thống vận hành Phòng Nhân sự nhiều agent trong một thư mục gốc.

Cách chạy:
  python3 init_system.py --root "<thư mục gốc>" --company "<tên công ty>" \
      --approver "<cách gọi người duyệt>" --assistant "<tên trợ lý>" [--date dd/mm/yyyy]

Không ghi đè: dừng nếu thư mục gốc đã có tệp, thư mục của hệ thống.
"""
import argparse, os, shutil, subprocess, sys
from datetime import date, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(os.path.dirname(HERE), 'templates')

DEPTS = [
    # (thư mục, mã, tên tiếng Việt, phạm vi log)
    ('Compensation and Benefits', 2, 'Lương thưởng & Phúc lợi', 'Chính sách nhân sự, quan hệ lao động, lương thưởng; CONFIDENTIAL/ chứa nhóm A, B'),
    ('Recruitment', 3, 'Tuyển dụng', 'Tuyển dụng; DOCUMENT/ chứa nhóm C'),
    ('Training', 4, 'Đào tạo', 'Đào tạo & Phát triển'),
    ('Corporate Culture', 5, 'Văn hóa doanh nghiệp', 'Văn hóa doanh nghiệp'),
    ('Internal Communications', 6, 'Truyền thông nội bộ', 'Truyền thông nội bộ, đối ngoại, hậu cần sự kiện'),
    ('Department Internal', 7, 'Nội bộ Phòng', 'Hành chính của Phòng và việc không tên'),
]
EXTRA_DIRS = [
    '00 - SYSTEM/archive', '00 - SYSTEM/MANAGER/REPORTS', '00 - SYSTEM/MANAGER/archive',
    'Compensation and Benefits/CONFIDENTIAL',
    'Recruitment/DOCUMENT/Curriculum Vitae', 'Recruitment/DOCUMENT/JOB DESCRIPTION',
    'Recruitment/archive/Ho so ung vien',
    'Shared Resources/REFERENCE', 'Shared Resources/DOCUMENT', 'Shared Resources/OUTPUT', 'Shared Resources/assets',
    'Uncategorized documents',
]
SYSTEM_NAMES = ['about-company.md', '00 - SYSTEM', 'Shared Resources', 'Uncategorized documents'] + [d[0] for d in DEPTS]


def holidays(year):
    out = []
    for y in (year, year + 1):
        out += [f'01/01/{y}', f'30/04/{y}', f'01/05/{y}', f'02/09/{y}']
    return '\n'.join(out) + '\n# TODO: bổ sung Tết Âm lịch, Giỗ Tổ Hùng Vương, ngày liền kề 02/9 và ngày nghỉ bù theo thông báo hằng năm'


def render(text, subs):
    for k, v in subs.items():
        text = text.replace('{{' + k + '}}', v)
    return text


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)


def log_file(path, title, scope, d, who, content):
    tpl = open(os.path.join(TPL, '00 - SYSTEM', 'TEMPLATES', 'log-template.md'), encoding='utf-8').read()
    tpl = tpl.replace('<TÊN THƯ MỤC>', title).replace('<mô tả thư mục>', scope)
    tpl += f'| 1 | {d} | Tạo mới | {title}/ | {content} | {who} | Khởi tạo từ bộ mẫu |\n'
    write(path, tpl)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', required=True)
    ap.add_argument('--company', required=True)
    ap.add_argument('--approver', required=True)
    ap.add_argument('--assistant', required=True)
    ap.add_argument('--date', default=date.today().strftime('%d/%m/%Y'))
    a = ap.parse_args()

    d = a.date
    year = datetime.strptime(d, '%d/%m/%Y').year
    root = os.path.abspath(os.path.expanduser(a.root))
    os.makedirs(root, exist_ok=True)
    clash = [n for n in SYSTEM_NAMES if os.path.exists(os.path.join(root, n))]
    if clash:
        print('DỪNG – thư mục gốc đã có:', ', '.join(clash), '→ không ghi đè. Chọn thư mục khác hoặc dọn trước.')
        sys.exit(2)

    subs = {'TEN_CONG_TY': a.company, 'NGUOI_DUYET': a.approver, 'NGUOI_DUYET_HOA': a.approver.upper(),
            'TRO_LY': a.assistant, 'NGAY': d, 'HOLIDAYS': holidays(year)}

    # 1. Chép mẫu, thay biến
    for dp, _, files in os.walk(TPL):
        rel = os.path.relpath(dp, TPL)
        for fn in files:
            src = os.path.join(dp, fn)
            dst = os.path.join(root, rel, fn) if rel != '.' else os.path.join(root, fn)
            if fn.endswith(('.md', '.txt')):
                write(dst, render(open(src, encoding='utf-8').read(), subs))
            else:
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copy2(src, dst)

    # 2. Thư mục chuẩn, TASKS.md, log của bộ phận
    ttpl = open(os.path.join(TPL, '00 - SYSTEM', 'TEMPLATES', 'TASKS-template.md'), encoding='utf-8').read()
    for folder, code, vn, scope in DEPTS:
        for sub in ('REFERENCE', 'DOCUMENT', 'OUTPUT', 'assets'):
            os.makedirs(os.path.join(root, folder, sub), exist_ok=True)
        write(os.path.join(root, folder, 'TASKS.md'),
              ttpl.replace('<TÊN BỘ PHẬN>', f'{folder.upper()} ({vn.upper()})').replace('<n>', str(code)))
        log_file(os.path.join(root, folder, f'log - {folder}.md'), folder, f'Thư mục {vn} – mã {code}. {scope}',
                 d, a.assistant, 'Tạo AGENT.md v1.0, TASKS.md, REFERENCE/, DOCUMENT/, OUTPUT/, assets/'
                 + {2: ', CONFIDENTIAL/', 3: ', DOCUMENT/Curriculum Vitae/, DOCUMENT/JOB DESCRIPTION/, archive/Ho so ung vien/',
                    7: ', OUTPUT/So lich su chi phi chuong trinh.xlsx'}.get(code, ''))
    for p in EXTRA_DIRS:
        os.makedirs(os.path.join(root, p), exist_ok=True)

    # 3. Log hệ thống
    log_file(os.path.join(root, 'log - ROOT.md'), 'ROOT', 'Thư mục gốc: about-company.md, archive/', d, a.assistant,
             'Tạo about-company.md v1.0 (khung) và cấu trúc hệ thống')
    log_file(os.path.join(root, '00 - SYSTEM', 'log - 00 - SYSTEM.md'), '00 - SYSTEM', 'Hạ tầng hệ thống: MAP, RULES, MANAGER, TEMPLATES',
             d, a.assistant, 'Tạo MAP, RULES v1.0, PROJECT-INSTRUCTIONS v1.0, holidays.txt, MANAGER/ (AGENT v1.0, PLAN, TASKS, ESCALATION), TEMPLATES/')
    log_file(os.path.join(root, 'Shared Resources', 'log - Shared Resources.md'), 'Shared Resources', 'Kho dùng chung, không agent',
             d, a.assistant, 'Tạo README.md v1.0, REFERENCE/, DOCUMENT/, OUTPUT/, assets/')
    log_file(os.path.join(root, 'Uncategorized documents', 'log - Uncategorized documents.md'), 'Uncategorized documents',
             'Hộp tiếp nhận – Agent Quản lý phân loại theo QT-05 mục 5.2.3', d, a.assistant, 'Tạo hộp tiếp nhận')

    # 4. Bảng tính, sổ chi phí
    sysdir = os.path.join(root, '00 - SYSTEM')
    for cmd, cwd in (([sys.executable, 'TEMPLATES/tasks_md_to_xlsx.py'], sysdir),
                     ([sys.executable, '00 - SYSTEM/TEMPLATES/make_cost_ledger.py'], root)):
        r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
        print((r.stdout or r.stderr).strip() or 'ok')
        if r.returncode != 0:
            print('⚠️ Chưa chạy được (thiếu openpyxl?) – cài "pip install openpyxl" rồi chạy lại lệnh trên.')

    # 5. Kiểm tra MAP
    r = subprocess.run([sys.executable, '00 - SYSTEM/TEMPLATES/check_map.py'], cwd=root, capture_output=True, text=True)
    print(r.stdout.strip())
    print('XONG – hệ thống đã khởi tạo tại:', root)


if __name__ == '__main__':
    main()
