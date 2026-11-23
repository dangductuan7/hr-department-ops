# QUY TẮC CHUNG CỦA HỆ THỐNG NHIỀU AGENT – PHÒNG NHÂN SỰ {{TEN_CONG_TY}}

> **Phiên bản:** 1.0 · **Ngày ban hành:** {{NGAY}} · **Người biên soạn:** {{TRO_LY}} · **Người duyệt:** {{NGUOI_DUYET}}
> **Áp dụng cho:** Agent Quản lý và mọi agent con (subagent) của các bộ phận trong thư mục gốc của hệ thống
> **Quyền sửa:** chỉ Agent Quản lý, sau khi {{NGUOI_DUYET}} duyệt. Mỗi lần sửa: lưu bản cũ vào `00 - SYSTEM/archive/`, ghi `log - 00 - SYSTEM.md`, tăng phiên bản.

| Mã | Quy tắc |
|---|---|
| QT-01 | Dẫn chiếu `about-company.md` |
| QT-02 | Báo mâu thuẫn lên Agent Quản lý |
| QT-03 | Cấu trúc thư mục chuẩn và cách mở rộng |
| QT-04 | Giao việc, ghi nhật ký và đặt tên tệp |
| QT-05 | Bảo mật dữ liệu nhân sự, lương thưởng và hồ sơ tuyển dụng |
| QT-06 | Bản đồ hệ thống `MAP.md` |

---

## QT-01. DẪN CHIẾU `about-company.md`

| # | Quy tắc |
|---|---|
| 1 | **Phạm vi:** `about-company.md` là hồ sơ doanh nghiệp tổng quát và là **nguồn chuẩn duy nhất** về thông tin doanh nghiệp (pháp lý, lịch sử, tầm nhìn – sứ mệnh – giá trị cốt lõi, cơ cấu, quy mô, sản phẩm, khách hàng, kênh truyền thông). **Không** đưa kiến thức chuyên môn của bộ phận vào tệp này. |
| 2 | **Không chép lại:** khi cần thông tin doanh nghiệp, dẫn chiếu theo mục: `→ about §<mục>` (ví dụ `→ about §8.1`). Tài liệu chính thức ghi kèm phiên bản: `→ about §8.1 (v1.2)`. |
| 3 | **Ngoại lệ trích nguyên văn:** chỉ khi sản phẩm phát hành ra ngoài hệ thống (tin tuyển dụng, slide, bản tin, tài liệu đào tạo) bắt buộc có câu chữ. Khi đó chép **đúng nguyên văn** kèm nguồn; không diễn đạt lại tầm nhìn, sứ mệnh, giá trị cốt lõi, khẩu hiệu. |
| 4 | **Kiểm tra trạng thái trước khi dùng:** nội dung đánh dấu ⚠️, PENDING hoặc ASSUMPTION không được dùng như sự thật đã xác nhận. |
| 5 | **Quyền sửa:** chỉ Agent Quản lý, sau khi {{NGUOI_DUYET}} duyệt; ghi `log - ROOT.md` và mục Lịch sử phiên bản của tệp; bản cũ lưu tại `archive/` của thư mục gốc. |
| 6 | **Khi số mục thay đổi:** Agent Quản lý rà và cập nhật mọi dẫn chiếu `→ about §` trong hệ thống. |
| 7 | **Không đánh số lại:** khi bỏ hoặc tách một mục, giữ nguyên số các mục còn lại; mục mới dùng số còn trống trước, sau đó mới dùng số tiếp theo. |

---

## QT-02. BÁO MÂU THUẪN LÊN AGENT QUẢN LÝ

| Hạng mục | Nội dung |
|---|---|
| **Khi nào phải báo** | (a) Tài liệu nguồn lệch với `about-company.md`; (b) thông tin giữa hai bộ phận lệch nhau, hoặc văn bản nội bộ lệch pháp luật; (c) thông tin trong `about-company.md` lỗi thời; (d) việc được giao vượt phạm vi bộ phận; (e) việc phụ thuộc kết quả của bộ phận khác; (f) việc trùng hoặc chồng chéo giữa các bộ phận (QT-04 mục 11, 12), mức mặc định Trung bình. |
| **Agent con không được** | Tự sửa `about-company.md` hoặc tệp của bộ phận khác; tự chọn một phương án khi chưa có quyết định. |
| **Trong khi chờ quyết định** | Tạm dùng thông tin trong `about-company.md` và đánh dấu ⚠️ trong sản phẩm. Mức **Cao**: dừng phần việc liên quan. |
| **Cách báo** | Thêm một dòng vào `00 - SYSTEM/MANAGER/ESCALATION.md` **và** ghi log của bộ phận. Khi chạy song song (QT-04 mục 15): agent bộ phận ghi nội dung mâu thuẫn vào phiếu kết quả; Agent Quản lý thêm dòng, cấp mã. |
| **Mã mâu thuẫn** | `MT-YYYYMMDD-nn` (ví dụ `MT-20270105-01`) |
| **Mức độ** | **Cao:** chặn phát hành ra ngoài hoặc chặn tiến độ · **Trung bình:** ảnh hưởng chất lượng sản phẩm · **Thấp:** lỗi trình bày, chính tả |
| **Trạng thái** | Mở → Đang xử lý → Đã quyết → Đã đóng |
| **Quy trình xử lý** | Agent Quản lý tổng hợp → trình {{NGUOI_DUYET}} quyết định → ghi quyết định vào `ESCALATION.md` → cập nhật tệp liên quan → báo lại bộ phận → đóng mục. |

---

## QT-03. CẤU TRÚC THƯ MỤC CHUẨN VÀ CÁCH MỞ RỘNG

### 3.1. Cấu trúc gốc

```
<Thư mục gốc>/
├── about-company.md               Hồ sơ doanh nghiệp (nguồn chuẩn – QT-01)
├── log - ROOT.md                  Nhật ký thư mục gốc
├── archive/                       Phiên bản cũ của about-company.md (tạo khi cần)
├── 00 - SYSTEM/                   Hạ tầng hệ thống (không phải bộ phận)
│   ├── MAP.md                     Bản đồ hệ thống – đọc đầu tiên mỗi phiên (QT-06)
│   ├── RULES.md                   Quy tắc chung (tệp này)
│   ├── PROJECT-INSTRUCTIONS.md    Bản lưu hướng dẫn Project
│   ├── holidays.txt               Lịch nghỉ lễ, Tết của công ty (QT-04 mục 14)
│   ├── log - 00 - SYSTEM.md
│   ├── MANAGER/                   Agent Quản lý: AGENT, PLAN, TASKS (.md, .xlsx), ESCALATION, REPORTS/, archive/
│   ├── TEMPLATES/                 Mẫu dùng chung và công cụ
│   └── archive/                   Bản cũ của RULES.md, PROJECT-INSTRUCTIONS.md
├── <Bộ phận>/                     Training, Recruitment, Compensation and Benefits,
│                                  Corporate Culture, Internal Communications,
│                                  Department Internal (việc không tên – mục 3.4)
│                                  (Compensation and Benefits có thêm CONFIDENTIAL/ – QT-05)
├── Shared Resources/              Kho lưu trữ dùng chung, không có agent (mục 3.4)
└── Uncategorized documents/       Hộp tiếp nhận – chờ Agent Quản lý phân loại
```

### 3.2. Cấu trúc chuẩn của mỗi bộ phận

| Thành phần | Vai trò |
|---|---|
| `AGENT.md` | Vai trò, phạm vi, quyền hạn, nguồn tri thức của agent bộ phận |
| `TASKS.md` | Danh mục kế hoạch của bộ phận (QT-04 mục 9); việc của bộ phận xem tại `MANAGER/TASKS.md` |
| `log - <Bộ phận>.md` | Nhật ký thay đổi tệp, thư mục |
| `REFERENCE/` | Tài liệu đầu vào, tham khảo từ bên ngoài hoặc bản gốc nhận được |
| `DOCUMENT/` | Tài liệu nội bộ đang dùng, đã ban hành (quy trình, biểu mẫu, giáo án…) |
| `OUTPUT/` | Sản phẩm do agent tạo ra |
| `assets/` | Tài nguyên thiết kế: hình ảnh, biểu tượng, video, phông chữ, tệp thiết kế |
| `archive/` *(tạo khi cần)* | Phiên bản cũ của tài liệu trong thư mục (QT-04 mục 4). Ngoại lệ: `Recruitment/archive/Ho so ung vien/` lưu hồ sơ ứng viên (QT-05 mục 5.3.6) |
| Thư mục chuyên đề *(tùy chọn)* | Ví dụ `Compensation and Benefits/CONFIDENTIAL/`; được phép khi một nhóm tài liệu đủ lớn và dùng thường xuyên |

### 3.3. Quy tắc mở rộng

1. **Bộ phận mới:** tạo đủ 3 tệp (`AGENT.md`, `TASKS.md`, log) và 4 thư mục (`REFERENCE/`, `DOCUMENT/`, `OUTPUT/`, `assets/`) từ `00 - SYSTEM/TEMPLATES/`; cấp mã bộ phận mới (số tiếp theo, từ 8).
2. **Thư mục con có agent riêng:** áp dụng cùng cấu trúc chuẩn ở 3.2.
3. **Thư mục chuyên đề:** thông báo Agent Quản lý và ghi log khi tạo.
4. Mọi thay đổi cấu trúc phải được cập nhật vào sơ đồ ở 3.1, vào `MAP.md` và `PROJECT-INSTRUCTIONS.md`.

### 3.4. Hai thư mục đặc thù

| Thư mục | Vai trò | Cấu trúc | Giới hạn |
|---|---|---|---|
| `Department Internal/` | Agent làm **việc hành chính thật của Phòng Nhân sự** (họp, biên bản, báo cáo, ngân sách, công văn của Phòng) và **việc lẻ không thuộc bộ phận nào** ("việc không tên"), mã 7. Khác Agent Quản lý: Agent Quản lý điều phối hệ thống agent, không làm việc chuyên môn | Cấu trúc chuẩn 3.2 | Chỉ ghi trong thư mục của mình; kết quả cần cho bộ phận khác thì bàn giao theo QT-04 mục 8, giữ mã `7-…`; không xử lý dữ liệu nhóm A, B, C (QT-05 mục 5.2.7) |
| `Shared Resources/` | **Kho lưu trữ dùng chung**: quy định, mẫu biểu, tài liệu tham khảo cả Phòng dùng. Không có agent; Agent Quản lý quản lý | `README.md` (quy ước kho), log, `REFERENCE/`, `DOCUMENT/`, `OUTPUT/`, `assets/`; không có `AGENT.md`, `TASKS.md` | Không lưu dữ liệu nhóm A, B, C; mỗi tài nguyên giữ một bản chuẩn duy nhất |

---

## QT-04. GIAO VIỆC, NHẬT KÝ VÀ ĐẶT TÊN

| # | Quy tắc |
|---|---|
| 1 | **Luồng giao việc:** {{NGUOI_DUYET}} → Agent Quản lý (`MANAGER/PLAN.md`, `MANAGER/TASKS.md`) → agent bộ phận (lọc `MANAGER/TASKS.md` theo cột Người nhận) → sản phẩm vào `OUTPUT/` → báo cáo vào `MANAGER/REPORTS/`. |
| 2 | **Nhật ký:** mỗi lần tạo mới, cập nhật, sửa đổi, bổ sung, di chuyển hoặc xóa tệp/thư mục đều ghi một dòng vào log của thư mục chứa nó (dòng mới nhất ở dưới cùng; ngày dd/mm/yyyy). Mẫu: `TEMPLATES/log-template.md`. |
| 3 | **Di chuyển tệp giữa thư mục:** ghi log ở **cả nơi đi và nơi đến**. |
| 4 | **Phiên bản:** không ghi đè tài liệu quan trọng khi chưa lưu bản cũ; tài liệu ban hành có số phiên bản trong tên (`-v1.0`). **Lưu bản cũ:** trước khi sửa tài liệu đã ban hành, chép bản hiện hành vào `archive/` **của chính thư mục chứa tài liệu** (tạo nếu chưa có), tên `<tên tệp> - v<số phiên bản>.<đuôi>`; thư mục gốc chỉ giữ bản hiện hành. Ghi log việc lưu trữ. |
| 5 | **Trạng thái thông tin:** dùng bộ nhãn VERIFIED, INTERNAL, PUBLIC, REFERENCE, ASSUMPTION, PENDING, OBSOLETE (định nghĩa tại `PROJECT-INSTRUCTIONS.md` §3). |
| 6 | **Mã việc (task ID):** `<mã bộ phận>-<loại>[số kế hoạch]-<số thứ tự>`. **Loại P (Plan):** việc thuộc kế hoạch, kèm số kế hoạch 2 chữ số, ví dụ `1-P01-003`. **Loại S (Single):** việc lẻ, ví dụ `3-S-021`. **Mã bộ phận:** **1** Agent Quản lý (việc do Agent Quản lý giao) · **2** Compensation and Benefits · **3** Recruitment · **4** Training · **5** Corporate Culture · **6** Internal Communications · **7** Department Internal (mã 2–7: việc người dùng làm trực tiếp với agent bộ phận). `Shared Resources/` không có mã; việc tạo tài nguyên chung mang mã của bên thực hiện. **Số thứ tự** 3 chữ số: việc Plan đánh từ 001 trong mỗi kế hoạch; việc Single tăng dần riêng cho từng mã bộ phận. Không dùng lại mã đã cấp. |
| 7 | **Danh mục công việc duy nhất:** mọi việc, mọi mã, ghi tại `MANAGER/TASKS.md` với 12 cột: Task ID · Tiêu đề công việc · Chi tiết công việc · Loại (Plan/Single) · Người giao · Người nhận · Ngày bắt đầu · Thời hạn · Ngày hoàn thành · Trạng thái · Đầu ra (tệp) · Ghi chú. Agent Quản lý ghi việc mã 1. Agent bộ phận được thêm dòng việc mang mã của mình và cập nhật Trạng thái, Ngày hoàn thành, Đầu ra, Ghi chú ở dòng mình là Người nhận; **không** sửa dòng khác. Mỗi quý, việc Hoàn thành chuyển sang `MANAGER/archive/TASKS - <năm>-Q<quý>.md`. Khi chạy song song, quyền ghi theo mục 15. |
| 8 | **Việc nối tiếp giữa các bộ phận:** khi kết quả của một bộ phận là đầu vào cho bộ phận khác, **giữ nguyên mã** của bộ phận đầu tiên thực hiện hoặc giao việc; không tạo mã mới. |
| 9 | **Danh mục kế hoạch:** kế hoạch mã `1-Pxx` ghi ở `MANAGER/PLAN.md`; kế hoạch mã `<2–7>-Pxx` ghi ở `TASKS.md` của bộ phận. Mỗi kế hoạch có mã, tên, ngày bắt đầu, thời hạn (mục 14), phạm vi việc, trạng thái. |
| 10 | **Bảng tính đi kèm:** `MANAGER/TASKS.xlsx` là bản bảng tính của danh mục công việc: một sheet duy nhất; phông Cambria; tiêu đề cột 18pt căn giữa; nội dung 14pt căn trái. Mỗi lần sửa `MANAGER/TASKS.md` thì chạy `python3 TEMPLATES/tasks_md_to_xlsx.py` (tại `00 - SYSTEM/`) trong cùng phiên; không thêm sheet, không tạo bảng tính khác, không lưu bản cũ. Phiên không chạy được lệnh: ghi "TASKS.xlsx chưa đồng bộ" vào log `00 - SYSTEM` và chạy bù ở phiên kế tiếp. |
| 11 | **Kiểm tra trùng trước khi ghi việc mới:** Agent Quản lý kiểm tra trước khi giao việc; agent bộ phận kiểm tra trước khi làm việc lẻ. **Tìm ở:** `MANAGER/TASKS.md` (mọi trạng thái), `MANAGER/archive/TASKS - *.md`, `OUTPUT/` của bộ phận liên quan (tra qua `MAP.md`), `MANAGER/REPORTS/`. **Trùng hoặc tương tự** khi có ít nhất một dấu hiệu: (a) cùng đầu ra; (b) tiêu đề hoặc chi tiết cùng đối tượng và cùng hành động; (c) cùng yêu cầu từ hai người giao khác nhau. **Ghi bằng chứng** ở cột Ghi chú: "Đã kiểm tra trùng dd/mm/yyyy: không trùng" hoặc "Liên quan <mã việc>". |
| 12 | **Xử lý khi trùng:** (a) trùng việc **đang mở** → không tạo việc mới; ghi thêm người yêu cầu vào Ghi chú việc cũ, báo lại mã cũ; (b) trùng việc **đã Hoàn thành** → không làm lại, trả đầu ra cũ; cần cập nhật thì tạo việc mới, Ghi chú "Kế thừa <mã cũ>"; (c) **tương tự một phần** → tạo việc mới, Ghi chú "Liên quan <mã cũ>", chỉ làm phần khác biệt; (d) **hai bộ phận** cùng nhận việc chồng chéo → {{NGUOI_DUYET}} chọn bộ phận chủ trì (Agent Quản lý đề xuất), bên kia hỗ trợ, giữ mã bên chủ trì; (e) agent bộ phận thấy việc lẻ của mình trùng việc bộ phận khác → không làm, ghi `ESCALATION.md` loại (f); không sửa dòng việc của bên khác. |
| 13 | **Tiêu đề công việc:** dạng **Động từ + Đối tượng + Phạm vi/kỳ**, ví dụ "Lập kế hoạch đào tạo 2027 – Khối sản xuất". Dùng cùng một từ cho cùng một đối tượng để kiểm tra trùng chính xác. |
| 14 | **Ngày bắt đầu và thời hạn:** với mọi việc và kế hoạch người dùng tạo hoặc giao, agent tiếp nhận **luôn hỏi** ngày bắt đầu và thời hạn (hỏi một lần, cùng các câu hỏi làm rõ khác). Không trả lời hoặc thiếu thì áp mặc định: (a) không có ngày bắt đầu → hôm nay; (b) chỉ có MM/YYYY → ngày 01 của tháng đó nếu ở tương lai, nếu không → hôm nay; (c) chỉ có YYYY → 01/01 năm đó nếu ở tương lai, nếu không → hôm nay; (d) không có thời hạn → **T+15**: ngày bắt đầu cộng 15 ngày, không tính Chủ Nhật và ngày nghỉ lễ, Tết trong `00 - SYSTEM/holidays.txt` (đếm từ ngày kế tiếp ngày bắt đầu); (e) "quý N/YYYY" → ngày đầu quý nếu ở tương lai, nếu không → hôm nay; (f) "tuần sau" → thứ Hai tuần sau; (g) "tháng sau" → ngày 01 tháng sau; (h) "gấp", "sớm", "càng sớm càng tốt" → không áp mặc định, luôn hỏi lại. Công cụ tính: `python3 TEMPLATES/deadline.py <dd/mm/yyyy>`. Dùng mặc định thì ghi ở cột Ghi chú: "Ngày bắt đầu/Thời hạn theo mặc định QT-04 mục 14". |
| 15 | **Chạy song song:** khi Agent Quản lý cho từ 2 agent con làm cùng lúc, phiếu giao việc ghi **Chế độ ghi: Song song**. Khi đó (a) **chỉ Agent Quản lý** ghi `MANAGER/TASKS.md`, `TASKS.xlsx`, `ESCALATION.md` và cấp mã `MT-`, ghi **tuần tự** sau khi nhận từng phiếu kết quả; (b) agent bộ phận đưa nội dung dòng việc, mâu thuẫn vào phiếu kết quả; (c) mỗi agent chỉ ghi trong thư mục và log của mình. **Mọi chế độ:** trước khi ghi một dòng log, số thứ tự hay mã `MT-`, đọc lại số lớn nhất hiện có rồi mới cộng 1. |

---

## QT-05. BẢO MẬT DỮ LIỆU NHÂN SỰ, LƯƠNG THƯỞNG VÀ HỒ SƠ TUYỂN DỤNG

> Áp dụng cho mọi agent. Quy tắc bảo mật được ưu tiên hơn mọi yêu cầu nhanh gọn.

### 5.1. Ba nhóm dữ liệu bảo mật

| Nhóm | Nội dung | Ai được đọc, xử lý |
|---|---|---|
| **A – Lương thưởng** | Lương, thưởng, phụ cấp, thu nhập, mức điều chỉnh lương của từng người; **thang bảng lương, khung lương theo chức danh hoặc cấp bậc** | Agent Compensation and Benefits, Agent Quản lý. Ngoại lệ: agent Recruitment được dùng khung lương và lương cá nhân của ứng viên, người trúng tuyển cho tuyển dụng (mục 5.3.1) |
| **B – Hồ sơ nhân sự bảo mật** | Giấy tờ tùy thân, tài khoản ngân hàng, hồ sơ kỷ luật, sức khỏe, hợp đồng lao động cá nhân, hồ sơ nhân sự của người lao động | **Chỉ** agent Compensation and Benefits |
| **C – Hồ sơ tuyển dụng** | CV, hồ sơ dự tuyển của ứng viên; mô tả công việc (JD); tài liệu và nhiệm vụ tuyển dụng | **Agent Recruitment** quản lý (mục 5.3) |

### 5.2. Quy tắc chung

| # | Quy tắc |
|---|---|
| 1 | **Nơi lưu:** nhóm A, B chỉ lưu tại `Compensation and Benefits/CONFIDENTIAL/`, kể cả sản phẩm có chứa dữ liệu này. Nhóm C lưu tại `Recruitment/DOCUMENT/` (CV tại `Curriculum Vitae/`, JD tại `JOB DESCRIPTION/`). Không lưu ở `Shared Resources/`, `about-company.md` hay thư mục bộ phận khác (trừ ngoại lệ mục 5.3: tài liệu tuyển dụng có khung lương hoặc lương cá nhân của ứng viên lưu tạm tại `Recruitment/DOCUMENT/` tới khi bàn giao). |
| 2 | **Không cung cấp:** không đưa dữ liệu nhóm A, B, C cho agent khác, vào `Shared Resources/`, báo cáo, `TASKS.md`, `ESCALATION.md`, `MAP.md` hay log, trừ các trường hợp ở mục 5.3, 5.4, 5.5. Agent Quản lý nhận dữ liệu nhóm A cũng **không** chuyển tiếp. |
| 3 | **Tệp nhận vào `Uncategorized documents/`:** Agent Quản lý chuyển ngay tệp nhóm A, B vào `CONFIDENTIAL/` (nhóm B: chỉ chuyển, **không** đọc nội dung); tệp nhóm C chuyển vào `Recruitment/DOCUMENT/`. Không biết nhóm qua tên tệp: không mở, hỏi {{NGUOI_DUYET}}; chưa có trả lời thì coi là nhóm B. |
| 4 | **Ngoài thư mục máy tính:** không đưa dữ liệu bảo mật lên tài liệu Project trên claude.ai, trang chia sẻ (artifact), bộ nhớ của Claude hay dịch vụ bên ngoài. |
| 5 | **Log:** chỉ ghi tên tệp và loại thay đổi, không ghi số liệu hay dữ liệu cá nhân. |
| 6 | **Khi chưa rõ:** chưa chắc một thông tin có thuộc nhóm A, B, C không → coi là bảo mật và hỏi {{NGUOI_DUYET}}. |
| 7 | **Department Internal:** không đọc, lưu hay xử lý dữ liệu nhóm A, B, C. Việc lẻ có dữ liệu này: dừng ngay, không mở tệp, chuyển Agent Quản lý (A, B → Compensation and Benefits; C → Recruitment). |

### 5.3. Ngoại lệ cho agent Recruitment

| # | Quy tắc |
|---|---|
| 1 | **Khung lương và lương cá nhân trong tuyển dụng:** được nhận và dùng (a) khung lương theo chức danh và (b) lương cá nhân của ứng viên, người trúng tuyển (mức đề xuất, mức được duyệt, bảng chế độ, thư mời nhận việc) cho công việc tuyển dụng. Không chuyển cho agent khác ngoài Compensation and Benefits, Agent Quản lý. Bảng khung lương gốc vẫn lưu tại `CONFIDENTIAL/`. Lương của người lao động đang làm việc **không** thuộc ngoại lệ. **Ứng viên nội bộ:** chỉ nhận mức lương đề xuất, được duyệt cho vị trí mới; **không** nhận lương hiện tại. |
| 2 | **Hồ sơ tuyển dụng (nhóm C):** Recruitment quản lý CV, JD, tài liệu và nhiệm vụ tuyển dụng tại `Recruitment/DOCUMENT/`; CV **không** chuyển vào `CONFIDENTIAL/`. |
| 3 | **Khung lương trong JD:** JD có khung lương được giữ tại `Recruitment/DOCUMENT/JOB DESCRIPTION/`. |
| 4 | **Bàn giao hồ sơ người trúng tuyển:** Recruitment bàn giao **toàn bộ** hồ sơ người trúng tuyển sang Compensation and Benefits (giấy tờ, biểu thu thập thông tin, thư mời, bảng chế độ, quyết định và thỏa thuận thử việc, kể cả bản sao, bản chụp, bản mềm), **trừ CV**. Sau bàn giao, hồ sơ là nhóm B; Recruitment **không giữ lại** giấy tờ nào. Log ghi vị trí, mã hồ sơ, danh mục loại giấy tờ đã chuyển; **không** ghi họ tên, nội dung. Chuỗi bàn giao: gói GB-01 đến GB-07 tại `Compensation and Benefits/AGENT.md` §7.1. |
| 5 | **Thông tin giới thiệu nhân sự mới:** Recruitment được gửi Training và Internal Communications **thông tin cơ bản** của người trúng tuyển đã xác nhận nhận việc, chỉ để hội nhập và giới thiệu: họ tên, vị trí, cấp bậc, đơn vị, ngày nhận việc, quản lý trực tiếp, giới thiệu ngắn về chuyên môn. **Không** gửi: giấy tờ tùy thân, số bảo hiểm xã hội, mã số thuế, tài khoản ngân hàng, địa chỉ, số điện thoại và email cá nhân, sức khỏe, lương và chế độ, CV, kết quả phỏng vấn. Bên nhận chỉ dùng đúng mục đích, không chuyển tiếp, không đưa vào `Shared Resources/`, log, báo cáo. |
| 6 | **Hồ sơ ứng viên không trúng tuyển, rút lui:** lưu tại `Recruitment/archive/Ho so ung vien/` theo thời hạn lưu {{NGUOI_DUYET}} chốt khi khởi tạo (mặc định đề xuất: 24 tháng, ⚠️ PENDING). Vẫn là nhóm C; log chỉ ghi mã hồ sơ, vị trí. Ứng viên yêu cầu xóa dữ liệu hoặc rút lại sự đồng ý: trình {{NGUOI_DUYET}} ngay. ⚠️ Rủi ro pháp lý (REFERENCE, cần đối chiếu văn bản hiện hành): Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 (hiệu lực 01/01/2026) cho người có dữ liệu quyền đồng ý, rút lại sự đồng ý và yêu cầu xóa; tin tuyển dụng, thư báo kết quả cần có câu xin đồng ý lưu hồ sơ. |

### 5.4. Báo cáo

| # | Quy tắc |
|---|---|
| 1 | Báo cáo được ghi **tổng chi phí lương** và **tổng chi phí thưởng** toàn công ty và tách tới cấp **phòng, ban, bộ phận**. |
| 2 | **Không** tách tới từng người, trừ khi Agent Quản lý yêu cầu. |
| 3 | Dữ liệu nhóm B và dữ liệu cá nhân của ứng viên không đưa vào bất kỳ báo cáo nào; báo cáo tuyển dụng chỉ ghi số liệu tổng hợp. Nhóm dưới 5 người gộp vào nhóm lớn hơn để không nhận diện được cá nhân. |

### 5.5. Ngoại lệ cho agent Compensation and Benefits

| # | Quy tắc |
|---|---|
| 1 | **Ngày sinh, thâm niên cho nội dung gắn kết:** được gửi Internal Communications **ngày, tháng sinh (không ghi năm)** và **số năm công tác** của người lao động **đã đồng ý công bố bằng văn bản** (có thể rút lại bất cứ lúc nào). Internal Communications chỉ dùng cho bản tin chúc mừng, không lưu sau khi phát hành, không chuyển tiếp. Department Internal chỉ nhận số người theo mốc thâm niên. Chưa có sự đồng ý: không gửi. |
| 2 | **Phân tích nghỉ việc:** Compensation and Benefits chủ trì phỏng vấn thôi việc, phân tích lý do nghỉ (nhóm B); Corporate Culture nhận số tổng hợp lý do nghỉ, Recruitment nhận tỷ lệ nghỉ sớm theo kênh tuyển; không có dữ liệu cá nhân. |

---

## QT-06. BẢN ĐỒ HỆ THỐNG `MAP.md`

| # | Quy tắc |
|---|---|
| 1 | **Vai trò:** `00 - SYSTEM/MAP.md` là bản đồ hệ thống: sơ đồ thư mục, bảng tra nhanh, tài liệu chính, ma trận quyền. Giúp agent không phải quét lại thư mục mỗi phiên. **Không** chứa dữ liệu nhóm A, B, C (CV chỉ ghi số lượng). |
| 2 | **Đầu phiên:** mọi agent đọc `MAP.md` trước tiên, rồi so **Dấu đối chiếu** (STT dòng cuối của từng log) với log thực tế (công cụ: `python3 "00 - SYSTEM/TEMPLATES/check_map.py"` tại thư mục gốc). Khớp → dùng MAP, **không** quét thư mục. |
| 3 | **Khi lệch:** chỉ đọc các dòng log mới của thư mục bị lệch. Agent bộ phận dùng thông tin đó cho phiên hiện tại, **không** sửa MAP. Agent Quản lý cập nhật phần MAP liên quan. |
| 4 | **Quét lại toàn bộ** chỉ khi: thiếu tệp log; có thư mục cấp 1 chưa có trong MAP; dấu đối chiếu lớn hơn log thực tế; hoặc {{NGUOI_DUYET}} yêu cầu. |
| 5 | **Chống vòng lặp:** (a) cập nhật MAP là **bước cuối cùng** của phiên; (b) việc sửa MAP **không** ghi log mà ghi ở mục Lịch sử cập nhật trong MAP, **không** lưu bản cũ; (c) dấu đối chiếu khớp thì **không** sửa MAP. |
| 6 | **Mức cập nhật:** dòng log loại Tạo mới, Di chuyển, Xóa, Lưu trữ, hoặc đổi phiên bản tài liệu chính → sửa nội dung MAP. Các dòng khác → chỉ sửa dấu đối chiếu. |
| 7 | **Quyền sửa:** chỉ Agent Quản lý. |

---

## LỊCH SỬ PHIÊN BẢN

| Phiên bản | Ngày | Người cập nhật | Nội dung |
|---|---|---|---|
| 1.0 | {{NGAY}} | {{TRO_LY}} | Khởi tạo từ bộ mẫu vận hành Phòng Nhân sự |
