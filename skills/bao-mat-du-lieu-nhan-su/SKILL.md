---
name: bao-mat-du-lieu-nhan-su
description: Cổng kiểm tra bảo mật dữ liệu nhân sự theo quy tắc QT-05 trước khi đọc, lưu, chuyển, báo cáo hay phát hành — phân nhóm A (lương thưởng), B (hồ sơ nhân sự), C (hồ sơ tuyển dụng), xác định ai được đọc, lưu ở đâu, được gửi gì cho bộ phận nào. Dùng khi tài liệu hoặc yêu cầu có lương, thưởng, khung lương, CV, JD, hợp đồng lao động, giấy tờ tùy thân, kỷ luật, sức khỏe, ngày sinh, dữ liệu ứng viên; khi người dùng hỏi "tài liệu này có mật không", "được gửi cho ai", "lưu ở đâu", "ứng viên muốn xóa hồ sơ".
---

# Cổng bảo mật dữ liệu nhân sự (QT-05)

Quy tắc có hiệu lực: `00 - SYSTEM/RULES.md` QT-05 trong thư mục gốc hệ thống. Skill này là bảng kiểm nhanh; khác thì theo `RULES.md`. Bảo mật ưu tiên hơn mọi yêu cầu nhanh gọn.

## 1. Phân nhóm trước khi mở tệp

| Dấu hiệu (tên tệp, người gửi, mô tả) | Nhóm | Ai được đọc | Nơi lưu |
|---|---|---|---|
| Lương, thưởng, phụ cấp, thu nhập cá nhân; thang bảng lương, khung lương | A | Lương thưởng & Phúc lợi, Agent Quản lý; Tuyển dụng (chỉ khung lương, lương ứng viên) | `Compensation and Benefits/CONFIDENTIAL/` |
| Giấy tờ tùy thân, tài khoản ngân hàng, kỷ luật, sức khỏe, hợp đồng cá nhân, hồ sơ nhân sự | B | **Chỉ** Lương thưởng & Phúc lợi | `Compensation and Benefits/CONFIDENTIAL/` |
| CV, hồ sơ dự tuyển, JD, tài liệu tuyển dụng | C | Tuyển dụng | `Recruitment/DOCUMENT/` |
| Không rõ | Coi là B | Không mở; hỏi người duyệt | `CONFIDENTIAL/` tới khi rõ |

## 2. Bảng được gửi (mọi luồng khác: không)

| Từ → Đến | Được gửi | Không được gửi |
|---|---|---|
| LT&PL → Tuyển dụng | Khung lương; bộ văn bản thử việc có lương của người trúng tuyển; mức lương vị trí mới của ứng viên nội bộ | Lương hiện tại của người đang làm việc |
| Tuyển dụng → LT&PL | Toàn bộ hồ sơ người trúng tuyển trừ CV (sau đó Tuyển dụng không giữ lại) | — |
| Tuyển dụng → Đào tạo, Truyền thông nội bộ | Họ tên, vị trí, cấp bậc, đơn vị, ngày nhận việc, quản lý trực tiếp, giới thiệu chuyên môn ngắn | Giấy tờ, bảo hiểm xã hội, mã số thuế, tài khoản, địa chỉ, điện thoại, email cá nhân, sức khỏe, lương, CV, kết quả phỏng vấn |
| LT&PL → Truyền thông nội bộ | Ngày, tháng sinh (không năm), số năm công tác của người **đã đồng ý bằng văn bản** | Người chưa đồng ý hoặc đã rút lại |
| LT&PL → Văn hóa, Tuyển dụng | Số tổng hợp lý do nghỉ việc; tỷ lệ nghỉ sớm theo kênh | Dữ liệu cá nhân |
| LT&PL → Nội bộ Phòng | Tổng chi phí lương, thưởng toàn công ty, theo phòng, ban; số người theo mốc thâm niên | Mọi số cá nhân |

## 3. Không bao giờ
- Đưa nhóm A, B, C vào `Shared Resources/`, `about-company.md`, `MAP.md`, `TASKS.md`, `ESCALATION.md`, log, báo cáo (ngoài số tổng), phiếu giao việc.
- Đưa dữ liệu bảo mật lên tài liệu Project trên claude.ai, artifact, bộ nhớ Claude, dịch vụ bên ngoài.
- Tách báo cáo tới nhóm dưới 5 người (gộp vào nhóm lớn hơn).
- Agent Nội bộ Phòng mở tệp có thể chứa A, B, C – dừng ngay, chuyển Agent Quản lý.

## 4. Log khi xử lý tệp mật
Chỉ ghi tên tệp (hoặc mã hồ sơ), vị trí, loại thay đổi, danh mục loại giấy tờ – không họ tên, không số liệu.

## 5. Ứng viên, người lao động yêu cầu xóa dữ liệu hoặc rút lại đồng ý
Dừng mọi việc dùng dữ liệu đó, trình người duyệt ngay. ⚠️ Tham chiếu (REFERENCE, đối chiếu văn bản hiện hành): Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, hiệu lực 01/01/2026.
