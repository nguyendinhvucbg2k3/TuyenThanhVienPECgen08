# Hướng dẫn kết nối website với Google Sheet

## 1. Tạo Google Sheet & dán script
1. Vào https://sheets.new để tạo một Google Sheet mới (đặt tên, ví dụ: `PEC Gen 8 - Đơn đăng ký`).
2. Menu **Tiện ích mở rộng → Apps Script**.
3. Xoá hết code mặc định, dán toàn bộ nội dung file `apps-script/Code.gs` vào, rồi bấm **Lưu**.
4. Chọn hàm `setup` ở thanh công cụ rồi bấm **Chạy** → cấp quyền khi được hỏi.
   → Sheet sẽ tự tạo 4 trang tính đã căn chỉnh sẵn (tiêu đề cam, cố định hàng tiêu đề, xuống dòng, độ rộng cột):
   - `Câu trả lời biểu mẫu` – tất cả đơn, mỗi câu hỏi là một cột (giống kết quả Google Form)
   - `Ban Vận hành`, `Ban Truyền thông & Thiết kế`, `Ban Cộng đồng & Đối ngoại` – lọc riêng theo từng ban

## 2. Triển khai Web App
1. Bấm **Triển khai → Tùy chọn triển khai mới**.
2. Loại: **Ứng dụng web**.
   - Thực thi dưới dạng: **Tôi (Me)**
   - Người có quyền truy cập: **Bất kỳ ai (Anyone)**
3. Bấm **Triển khai**, copy **URL ứng dụng web** (dạng `https://script.google.com/macros/s/.../exec`).

## 3. Gắn URL vào website
Mở `script.js`, dán URL vào:
```js
SCRIPT_URL: "https://script.google.com/macros/s/XXXX/exec",
```
Muốn khoá đăng ký ngoài thời gian 26/10 – 05/11/2026 thì đặt `ENFORCE_DATES: true`.

> Nếu sửa `Code.gs` sau này: **Triển khai → Quản lý các lần triển khai → Chỉnh sửa → Phiên bản mới** (URL giữ nguyên).

## 4. Đưa website lên mạng (miễn phí)
- **Netlify Drop**: vào https://app.netlify.com/drop và kéo thả cả thư mục `website`.
- Hoặc **GitHub Pages** / **Firebase Hosting**.
