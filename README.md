# hr-department-ops – Hệ thống vận hành Phòng Nhân sự nhiều agent

Bộ khung vận hành **trống**, không chứa dữ liệu của doanh nghiệp nào. Cài vào Claude, khởi tạo cho một doanh nghiệp, rồi nạp văn bản nội bộ của doanh nghiệp đó.

## Thành phần

| Loại | Tên | Vai trò |
|---|---|---|
| Skill | `khoi-tao-he-thong` | Dựng cây thư mục chuẩn và toàn bộ tệp hệ thống từ bộ mẫu; hướng dẫn nạp thông tin doanh nghiệp |
| Skill | `dieu-phoi-nhan-su` | Agent Quản lý: đầu phiên, kiểm tra trùng, định tuyến, cổng duyệt A/B/C, phiếu giao việc, kiểm tra chất lượng, báo cáo |
| Skill | `bao-mat-du-lieu-nhan-su` | Cổng kiểm tra QT-05: nhóm A (lương thưởng), B (hồ sơ nhân sự), C (hồ sơ tuyển dụng) |
| Agent con | `luong-thuong-phuc-loi` (mã 2), `tuyen-dung` (3), `dao-tao` (4), `van-hoa-doanh-nghiep` (5), `truyen-thong-noi-bo` (6), `noi-bo-phong` (7) | Thực thi việc chuyên môn theo `AGENT.md` trong thư mục bộ phận, trả phiếu kết quả |

## Cây thư mục sau khởi tạo

```
<Thư mục gốc>/
├── about-company.md        Hồ sơ doanh nghiệp – nguồn chuẩn (khung, mục PENDING)
├── log - ROOT.md
├── 00 - SYSTEM/            MAP, RULES (QT-01–QT-06), PROJECT-INSTRUCTIONS, holidays.txt,
│                           MANAGER/ (AGENT, PLAN, TASKS.md/.xlsx, ESCALATION, REPORTS/), TEMPLATES/ (mẫu + công cụ)
├── Compensation and Benefits/  (+ CONFIDENTIAL/)
├── Recruitment/                (+ DOCUMENT/Curriculum Vitae/, DOCUMENT/JOB DESCRIPTION/, archive/Ho so ung vien/)
├── Training/
├── Corporate Culture/
├── Internal Communications/
├── Department Internal/        (+ sổ lịch sử chi phí chương trình .xlsx)
├── Shared Resources/           Kho dùng chung, không agent
└── Uncategorized documents/    Hộp tiếp nhận
```
Mỗi bộ phận: `AGENT.md`, `TASKS.md`, log, `REFERENCE/`, `DOCUMENT/`, `OUTPUT/`, `assets/`.

## Công cụ đi kèm (`00 - SYSTEM/TEMPLATES/`)

| Công cụ | Việc |
|---|---|
| `tasks_md_to_xlsx.py` | Đồng bộ `TASKS.md` (và lưu trữ quý) sang `TASKS.xlsx` |
| `deadline.py` | Tính thời hạn mặc định T+15, trừ Chủ Nhật và ngày trong `holidays.txt` |
| `check_map.py` | So dấu đối chiếu của `MAP.md` với log – quyết định có cần quét thư mục không |
| `make_cost_ledger.py` | Tạo sổ lịch sử chi phí chương trình (KH – TT – TC) |

Yêu cầu: Python 3, thư viện `openpyxl`.

## Bắt đầu

1. Cài plugin. 2. Nói "khởi tạo hệ thống nhân sự" – trả lời 5 câu hỏi (tên doanh nghiệp, cách gọi người duyệt, tên trợ lý, thư mục gốc, ngày). 3. Bổ sung ngày nghỉ âm lịch vào `holidays.txt`. 4. Nạp văn bản nội bộ theo bảng ở bước 4 của skill khởi tạo. 5. Giao việc bình thường – Agent Quản lý điều phối.

## Điểm cần doanh nghiệp tự chốt (đang PENDING trong bộ mẫu)

- Toàn bộ nội dung `about-company.md`.
- Thời hạn các gói bàn giao GB-01 đến GB-07 (`Compensation and Benefits/AGENT.md` §7.1) – đang là mặc định đề xuất.
- Bảng rủi ro pháp lý thử việc R1, R2… theo quy định thử việc của doanh nghiệp.
- Thời hạn lưu hồ sơ ứng viên không trúng tuyển (QT-05 mục 5.3.6) – đề xuất 24 tháng.
- Phân loại bảo mật hồ sơ đào tạo cá nhân, bản cam kết đào tạo.
- Ngưỡng hài lòng khóa học, chỉ số mục tiêu (3 tháng đầu chỉ đo nền).
- Hướng dẫn thương hiệu, danh mục kênh truyền thông.

## Lưu ý pháp lý
Các mốc pháp luật trong bộ mẫu (Bộ luật Lao động 2019 Điều 20, 24–27, 112; Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15; Nghị định 30/2020/NĐ-CP) là tài liệu tham khảo (REFERENCE). Đối chiếu văn bản hiện hành trước khi trích dẫn chính thức; không thay thế tư vấn của luật sư.
