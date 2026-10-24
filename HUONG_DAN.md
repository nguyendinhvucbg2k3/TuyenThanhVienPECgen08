# Hướng dẫn kết nối Website với Google Sheet & Gửi Email tự động

## 1. Tạo Google Sheet & dán Apps Script
1. Mở Google Sheet nhận đơn đăng ký của bạn (hoặc vào https://sheets.new tạo mới).
2. Trên thanh menu chọn **Tiện ích mở rộng (Extensions) → Apps Script**.
3. Xoá hết code mặc định, copy toàn bộ nội dung trong file `apps-script/Code.gs` dán vào, rồi bấm **Lưu (💾)**.
4. Chọn hàm **`setup`** ở thanh công cụ phía trên rồi bấm **Chạy (Run)**.
5. **Cấp quyền cho Script** (chỉ cần làm 1 lần):
   - Bấm **Xem lại quyền (Review permissions)** → Chọn tài khoản Gmail của bạn.
   - Bấm **Nâng cao (Advanced)** → **Đi tới ... (unsafe)** → **Cho phép (Allow)** (bao gồm quyền ghi Google Sheet và quyền gửi Email bản sao câu trả lời cho ứng viên).
   - Sau khi chạy xong, Google Sheet sẽ tự động tạo & căn chỉnh 4 trang tính:
     - `Câu trả lời biểu mẫu` – Tất cả đơn đăng ký (mỗi câu hỏi là 1 cột).
     - `Ban Vận hành`, `Ban Truyền thông & Thiết kế`, `Ban Cộng đồng & Đối ngoại` – Tự động lọc riêng theo từng ban.

## 2. Triển khai (hoặc Cập nhật) Web App
- **Nếu triển khai lần đầu:**
  1. Bấm **Triển khai (Deploy) → Tùy chọn triển khai mới (New deployment)**.
  2. Chọn loại: **Ứng dụng web (Web app)**.
     - Thực thi dưới dạng: **Tôi (Me)**
     - Người có quyền truy cập: **Bất kỳ ai (Anyone)**
  3. Bấm **Triển khai**, copy **URL ứng dụng web** (`https://script.google.com/macros/s/.../exec`) dán vào `SCRIPT_URL` trong file `script.js`.

- **Nếu cập nhật lại code `Code.gs` trên Web App đã có:**
  1. Bấm **Triển khai (Deploy) → Quản lý các bản triển khai (Manage deployments)**.
  2. Bấm biểu tượng **Chỉnh sửa (✏️)** ở bản triển khai hiện tại.
  3. Tại mục **Phiên bản (Version)**, chọn **Phiên bản mới (New version)**.
  4. Bấm **Triển khai (Deploy)** (URL giữ nguyên, không cần sửa lại `script.js`).

## 3. Các tham số kiểm thử nhanh cho Ban Tổ Chức
- **Test điền đơn trước giờ mở (`10:00 26/10/2026`):** Thêm `?test=1` vào cuối link website (ví dụ: `https://ten-web.vercel.app/?test=1`).
- **Test giao diện Phòng chờ chống quá tải:** Thêm `?queue=1` vào cuối link website (ví dụ: `https://ten-web.vercel.app/?queue=1`).
