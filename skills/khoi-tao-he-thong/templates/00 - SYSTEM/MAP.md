# BẢN ĐỒ HỆ THỐNG – PHÒNG NHÂN SỰ {{TEN_CONG_TY}}

> **Đọc tệp này đầu tiên trong mọi phiên** (QT-06). Chỉ Agent Quản lý được sửa.
> **Ngày cập nhật:** {{NGAY}} · **Người cập nhật:** {{TRO_LY}} (vai trò Agent Quản lý)
> **Phạm vi:** sơ đồ thư mục, bảng tra nhanh, tài liệu chính, ma trận quyền. **Không** chứa dữ liệu nhóm A, B, C (CV chỉ ghi số lượng).

---

## 0. DẤU ĐỐI CHIẾU

STT dòng cuối (lớn nhất) của từng tệp log tại thời điểm MAP được cập nhật.

| Tệp log | STT cuối |
|---|---|
| `log - ROOT.md` | 1 |
| `00 - SYSTEM/log - 00 - SYSTEM.md` | 1 |
| `Training/log - Training.md` | 1 |
| `Recruitment/log - Recruitment.md` | 1 |
| `Compensation and Benefits/log - Compensation and Benefits.md` | 1 |
| `Corporate Culture/log - Corporate Culture.md` | 1 |
| `Internal Communications/log - Internal Communications.md` | 1 |
| `Department Internal/log - Department Internal.md` | 1 |
| `Shared Resources/log - Shared Resources.md` | 1 |
| `Uncategorized documents/log - Uncategorized documents.md` | 1 |

---

## 1. HƯỚNG DẪN ĐẦU PHIÊN

| Bước | Việc làm |
|---|---|
| 1 | Đọc MAP này. |
| 2 | Tại thư mục gốc chạy `python3 "00 - SYSTEM/TEMPLATES/check_map.py"` để so STT cuối của các log với mục 0. |
| 3 | **Khớp hết** → dùng MAP, **không** quét thư mục. |
| 4 | **Lệch ở thư mục nào** → chỉ đọc các dòng log mới của thư mục đó. Agent bộ phận dùng cho phiên hiện tại, **không** sửa MAP. |
| 5 | **Quét lại toàn bộ** chỉ khi: thiếu tệp log; có thư mục cấp 1 chưa có trong mục 2; STT trong MAP lớn hơn log; hoặc người duyệt yêu cầu. |
| 6 | Đọc `00 - SYSTEM/RULES.md`, `AGENT.md` của mình (Agent Quản lý: `MANAGER/AGENT.md`), rồi `TASKS.md` của mình. Sau đó mới mở tệp cần cho việc. |

**Agent Quản lý cập nhật MAP:** là bước cuối cùng của phiên; log loại Tạo mới, Di chuyển, Xóa, Lưu trữ, đổi phiên bản tài liệu chính → sửa mục 2–4; các dòng khác → chỉ sửa mục 0; không ghi log, không lưu bản cũ, ghi ở mục 6; dấu khớp thì không sửa.

---

## 2. SƠ ĐỒ THƯ MỤC

```
<Thư mục gốc>/
├── about-company.md ............... Hồ sơ doanh nghiệp v1.0 – nguồn chuẩn (QT-01)
├── log - ROOT.md
├── 00 - SYSTEM/ ................... Hạ tầng hệ thống
│   ├── MAP.md ..................... Tệp này
│   ├── RULES.md ................... Quy tắc QT-01 đến QT-06 – v1.0
│   ├── PROJECT-INSTRUCTIONS.md .... Hướng dẫn Project – v1.0
│   ├── holidays.txt ............... Lịch nghỉ lễ, Tết của công ty
│   ├── MANAGER/ ................... AGENT v1.0, PLAN, TASKS (.md, .xlsx), ESCALATION, REPORTS/
│   └── TEMPLATES/ ................. Mẫu AGENT, TASKS, log; công cụ tasks_md_to_xlsx.py, deadline.py, check_map.py, make_cost_ledger.py
├── Compensation and Benefits/ ..... Lương thưởng & Phúc lợi – mã 2 – AGENT v1.0; CONFIDENTIAL/ (nhóm A, B)
├── Recruitment/ ................... Tuyển dụng – mã 3 – AGENT v1.0; DOCUMENT/Curriculum Vitae/, DOCUMENT/JOB DESCRIPTION/ (nhóm C)
├── Training/ ...................... Đào tạo – mã 4 – AGENT v1.0
├── Corporate Culture/ ............. Văn hóa doanh nghiệp – mã 5 – AGENT v1.0
├── Internal Communications/ ....... Truyền thông nội bộ – mã 6 – AGENT v1.0
├── Department Internal/ ........... Nội bộ Phòng, việc không tên – mã 7 – AGENT v1.0
├── Shared Resources/ .............. Kho dùng chung – không agent, không mã; README.md
└── Uncategorized documents/ ....... Hộp tiếp nhận – chờ Agent Quản lý phân loại
```

Mọi thư mục bộ phận có đủ `AGENT.md`, `TASKS.md`, log, `REFERENCE/`, `DOCUMENT/`, `OUTPUT/`, `assets/` (QT-03). Thư mục con trống không ghi trong sơ đồ.

---

## 3. BẢNG TRA NHANH – CẦN GÌ, MỞ TỆP NÀO

| Cần | Mở |
|---|---|
| Thông tin doanh nghiệp, tầm nhìn, sứ mệnh, giá trị | `about-company.md` (dẫn chiếu `→ about §`) |
| Quy tắc hệ thống, mã việc, kiểm tra trùng, ngày bắt đầu và thời hạn | `00 - SYSTEM/RULES.md` (QT-04) |
| Công việc (mọi mã) | `MANAGER/TASKS.md`, lọc theo cột Người nhận; `MANAGER/TASKS.xlsx` |
| Kế hoạch | `MANAGER/PLAN.md` (1-Pxx); `<Bộ phận>/TASKS.md` (2–7-Pxx) |
| Cách điều phối, cổng duyệt A/B/C, phiếu giao việc, báo cáo | `MANAGER/AGENT.md` §0, §4, §6 |
| Mâu thuẫn, quyết định đã chốt | `MANAGER/ESCALATION.md` |
| Bảo mật dữ liệu | `RULES.md` QT-05 |
| Chuỗi bàn giao tuyển dụng – lương thưởng | `Compensation and Benefits/AGENT.md` §7.1 |
| Quy trình tuyển dụng 12 bước, điểm chạm ứng viên | `Recruitment/AGENT.md` §2.1, §2.2 |
| Thiết kế chương trình đào tạo | `Training/AGENT.md` §2.1 |
| Quy trình soạn nội dung truyền thông, kiểm tra trước khi giao | `Internal Communications/AGENT.md` §2.1–§2.4 |
| Ngân sách Phòng, quy ước KH – TT – TC | `Department Internal/AGENT.md` §2.3, §2.4 |

---

## 4. MA TRẬN QUYỀN

| Dữ liệu / tệp | Quản lý | C&B (2) | Recruitment (3) | Training (4) | Culture (5) | IC (6) | Dept Internal (7) |
|---|---|---|---|---|---|---|---|
| Nhóm A – lương thưởng | Đọc | Đọc, ghi | Khung lương, lương ứng viên | — | — | — | Chỉ số tổng |
| Nhóm B – hồ sơ nhân sự | Chỉ chuyển, không đọc | Đọc, ghi | — | — | — | — | — |
| Nhóm C – hồ sơ tuyển dụng | Chỉ chuyển | Sau bàn giao (thành B) | Đọc, ghi | Thông tin cơ bản nhân sự mới | — | Thông tin cơ bản nhân sự mới | — |
| `about-company.md`, `RULES.md`, `MAP.md` | Sửa sau khi duyệt | Đọc | Đọc | Đọc | Đọc | Đọc | Đọc |
| `MANAGER/TASKS.md` | Ghi việc mã 1 | Dòng mã 2 | Dòng mã 3 | Dòng mã 4 | Dòng mã 5 | Dòng mã 6 | Dòng mã 7; đọc toàn bộ |
| `Shared Resources/` | Ghi | Đọc | Đọc | Đọc | Đọc | Đọc | Đọc |

---

## 5. TÀI LIỆU CHÍNH

| Tài liệu | Phiên bản | Trạng thái |
|---|---|---|
| `about-company.md` | 1.0 | Khung – nhiều mục PENDING |
| `RULES.md` | 1.0 | Ban hành |
| `MANAGER/AGENT.md` và 6 `AGENT.md` bộ phận | 1.0 | Ban hành |

---

## 6. LỊCH SỬ CẬP NHẬT MAP

| Ngày | Nội dung | Dấu đối chiếu sau cập nhật |
|---|---|---|
| {{NGAY}} | Khởi tạo hệ thống | Tất cả = 1 |
