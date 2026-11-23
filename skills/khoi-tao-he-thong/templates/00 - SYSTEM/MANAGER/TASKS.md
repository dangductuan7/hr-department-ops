# DANH MỤC CÔNG VIỆC – PHÒNG NHÂN SỰ {{TEN_CONG_TY}}

> **Vai trò:** danh mục công việc **duy nhất** của hệ thống, gồm mọi mã việc (QT-04 mục 6, 7). Agent bộ phận lọc theo cột **Người nhận**.
> **Quyền ghi:** Agent Quản lý ghi việc mã 1. Agent bộ phận thêm dòng việc mang mã của mình và chỉ cập nhật Trạng thái, Ngày hoàn thành, Đầu ra, Ghi chú ở dòng mình là Người nhận. Chạy song song: chỉ Agent Quản lý ghi (QT-04 mục 15).
> **Bảng tính đi kèm:** `MANAGER/TASKS.xlsx` – chạy `python3 TEMPLATES/tasks_md_to_xlsx.py` tại `00 - SYSTEM/` sau mỗi lần sửa (QT-04 mục 10).
> **Trạng thái việc:** Chưa bắt đầu · Đang làm · Chờ duyệt · Hoàn thành · Tạm dừng
> **Ngày bắt đầu, Thời hạn:** luôn hỏi; thiếu thì áp mặc định QT-04 mục 14 (`TEMPLATES/deadline.py`). Ngày ghi dd/mm/yyyy.
> **Không** ghi dữ liệu nhóm A, B, C vào tệp này (QT-05).

| Task ID | Tiêu đề công việc | Chi tiết công việc | Loại | Người giao | Người nhận | Ngày bắt đầu | Thời hạn | Ngày hoàn thành | Trạng thái | Đầu ra (tệp) | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|---|---|
