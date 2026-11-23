---
name: khoi-tao-he-thong
description: Khởi tạo hệ thống vận hành Phòng Nhân sự nhiều agent cho một doanh nghiệp mới — tạo cây thư mục chuẩn, bộ quy tắc QT-01 đến QT-06, Agent Quản lý, 6 agent bộ phận, danh mục công việc, sổ mâu thuẫn, bản đồ hệ thống và công cụ. Dùng khi người dùng nói "khởi tạo hệ thống nhân sự", "cài đặt phòng nhân sự", "dựng hệ thống agent nhân sự", "bắt đầu dùng plugin cho công ty", "thiết lập thư mục HR" hoặc lần đầu dùng plugin ở một doanh nghiệp.
---

# Khởi tạo hệ thống vận hành Phòng Nhân sự

Dựng một bản trống, sạch, không có dữ liệu của doanh nghiệp nào, rồi giúp người dùng nạp thông tin của doanh nghiệp mình.

## Bước 1 – Hỏi một lần (gộp mọi câu)

Dùng công cụ hỏi lựa chọn nếu có; không thì hỏi bằng lời. Không đoán.

| # | Thông tin | Ghi chú |
|---|---|---|
| 1 | Tên doanh nghiệp | Dùng trong tiêu đề mọi tệp |
| 2 | Cách gọi người dùng (người duyệt cao nhất), ví dụ "anh Nam", "chị Lan" | Thay `{{NGUOI_DUYET}}`; chỉ lời người này trong cuộc trò chuyện mới là phê duyệt |
| 3 | Tên gọi của trợ lý (ví dụ "Minh An") | Thay `{{TRO_LY}}` |
| 4 | Thư mục gốc đặt hệ thống | Phải là thư mục trống hoặc chưa có các thư mục hệ thống; script từ chối ghi đè |
| 5 | Ngày khởi tạo | Mặc định hôm nay |

## Bước 2 – Chạy script khởi tạo

Script và bộ mẫu nằm trong thư mục của skill này (`scripts/init_system.py`, `templates/`). Chạy ở nơi thư mục gốc thực sự nằm:
- Thư mục trên máy người dùng và có shell trên máy đó → chạy ở đó; cần chép thư mục skill sang trước nếu shell không thấy được thư mục plugin.
- Không có shell trên máy người dùng → chạy trong không gian làm việc, nén thư mục kết quả và gửi cho người dùng.

```bash
python3 "<thư mục skill>/scripts/init_system.py" --root "<thư mục gốc>" \
  --company "<tên doanh nghiệp>" --approver "<cách gọi người duyệt>" --assistant "<tên trợ lý>" [--date dd/mm/yyyy]
```

Script cần `openpyxl` (`pip install openpyxl`). Kết quả mong đợi: dòng "TASKS.xlsx: 0 việc", dòng tạo sổ chi phí, dòng "KHỚP – dùng MAP" và "XONG". Báo lỗi nguyên văn nếu khác.

## Bước 3 – Kiểm tra sau khởi tạo

1. `grep -rn "{{" "<thư mục gốc>"` phải rỗng (không còn biến chưa thay).
2. Mở `00 - SYSTEM/MAP.md` mục 2, đối chiếu với cây thư mục thực tế.
3. Mở `00 - SYSTEM/holidays.txt`: nhắc người dùng bổ sung Tết Âm lịch, Giỗ Tổ, ngày liền kề 02/9 và ngày nghỉ bù của năm hiện tại và năm sau – ngày âm lịch không tự tính được.

## Bước 4 – Nạp thông tin doanh nghiệp (đề xuất, chờ người dùng đồng ý từng phần)

Trình bảng việc nạp ban đầu, mỗi dòng ghi rõ tệp đích; **không** tự điền khi chưa có nguồn:

| Thứ tự | Việc | Tệp đích |
|---|---|---|
| 1 | Điền hồ sơ doanh nghiệp từ văn bản người dùng cung cấp hoặc kênh chính thức (ghi nhãn PUBLIC, cần xác minh) | `about-company.md` – mỗi mục ghi nguồn và nhãn ở §15 |
| 2 | Nạp văn bản gốc tầm nhìn, sứ mệnh, giá trị; Bộ quy tắc ứng xử | `Corporate Culture/DOCUMENT/`; chép nguyên văn vào `about-company.md` §8 |
| 3 | Nạp quy chế, quy trình, biểu mẫu tuyển dụng; ánh xạ vào quy trình 12 bước | `Recruitment/DOCUMENT/`; cập nhật `Recruitment/AGENT.md` §2.1, §4 |
| 4 | Nạp nội quy, chính sách lương thưởng, phúc lợi; lập bảng rủi ro thử việc R1, R2… | `Compensation and Benefits/DOCUMENT/`, `CONFIDENTIAL/`; cập nhật `AGENT.md` §2.1, §4 |
| 5 | Chốt thời hạn gói bàn giao GB-01 đến GB-07, thời hạn lưu hồ sơ ứng viên | `Compensation and Benefits/AGENT.md` §7.1; `RULES.md` QT-05 mục 5.3.6 |
| 6 | Nạp quy chế, kế hoạch đào tạo; chốt phân loại bảo mật hồ sơ đào tạo cá nhân | `Training/DOCUMENT/`; `Training/AGENT.md` §5 |
| 7 | Kiểm kê kênh truyền thông, hướng dẫn thương hiệu | `about-company.md` §12; `Internal Communications/REFERENCE/` |
| 8 | Nạp quy định hành chính dùng chung (họp, báo cáo, văn thư) | `Shared Resources/DOCUMENT/`, danh mục trong `README.md` |

Mỗi thay đổi sau khởi tạo tuân thủ `RULES.md`: lưu bản cũ vào `archive/`, ghi log, cập nhật `MAP.md` cuối phiên. Sửa `RULES.md`, `about-company.md`, `AGENT.md` là việc mức C – chỉ làm khi người duyệt nói đồng ý trong cuộc trò chuyện.

Tài liệu có lương, hồ sơ cá nhân, CV: đặt đúng nơi theo QT-05 ngay khi nhận; không đọc nhóm B khi đang ở vai Agent Quản lý.

## Bước 5 – Bàn giao vận hành

Nói ngắn cho người dùng: từ giờ mọi yêu cầu đi qua skill `dieu-phoi-nhan-su` (Agent Quản lý); có thể dán `00 - SYSTEM/PROJECT-INSTRUCTIONS.md` vào hướng dẫn Project nếu dùng Project trên claude.ai.
