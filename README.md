# 🩸 PEC Gen 8 – New Blood, New Era

Website tuyển thành viên **Gen 8** của **Phenikaa Esports Club (PEC)** – Câu lạc bộ Thể thao Điện tử trực thuộc Đại học Phenikaa.

Website tĩnh (HTML/CSS/JS thuần), triển khai trên **Vercel** (tích hợp sẵn Vercel Web Analytics & Speed Insights). Dữ liệu đăng ký được tự động ghi vào **Google Sheet** và gửi **Email bản sao câu trả lời** cho ứng viên qua **Google Apps Script**.

---

## 📅 Lịch tuyển thành viên

| Mốc | Thời gian | Hình thức |
|---|---|---|
| 📝 Vòng 1 – Sơ tuyển | 10:00 26/10/2026 – 23:59 04/11/2026 | Điền đơn online trên website |
| 🎤 Vòng 2 – Phỏng vấn | 06/11/2026 | Trực tiếp tại Đại học Phenikaa |
| 🏆 Thông báo kết quả | 10/11/2026 | Email / Fanpage |

---

## ✨ Tính năng nổi bật

- **Trang chủ** – Giới thiệu PEC & chiến dịch Gen 8, Key Visual, logo phát sáng.
- **Giới thiệu các ban** – Ban Vận hành Giải đấu Esports, Ban Truyền thông & Thiết kế, Ban Cộng đồng & Đối ngoại.
- **Timeline** – Đồng hồ đếm ngược tự chuyển mốc, lịch tháng 10–11/2026, nút thêm sự kiện vào Google Calendar / tải file `.ics`.
- **Đăng ký 4 bước thông minh:**
  1. **Bắt đầu:** Trang nền KV + trạng thái đóng/mở đơn + nút *Đăng ký ngay* (tự khóa trước `10:00 26/10/2026`).
  2. **Thông tin cá nhân:** Họ tên, Email nhận thông báo, Số điện thoại (Zalo), Link Facebook, Giới tính, Khóa học, Ban ứng tuyển.
  3. **Câu hỏi chuyên môn theo ban:** Tự động rẽ nhánh theo 3 ban + tùy chọn nhận bản sao câu trả lời qua Email.
  4. **Hoàn tất:** Thông báo cảm ơn, nút & mã QR vào **Nhóm Zalo Hỗ Trợ**, xem lại trực tiếp hoặc tải file `.html` bản sao câu trả lời về máy.
- **Tự động lưu Google Sheet & Gửi Email bản sao (`Code.gs`):**
  - Ghi vào sheet tổng `Câu trả lời biểu mẫu` và tự động phân loại sang 3 sheet riêng của từng ban (`Ban Vận hành`, `Ban Truyền thông & Thiết kế`, `Ban Cộng đồng & Đối ngoại`).
  - Tự động gửi **Email HTML** (giao diện đen – cam chuẩn thương hiệu PEC) chứa bản sao toàn bộ câu trả lời, lịch trình phỏng vấn và link Nhóm Zalo Hỗ Trợ tới email ứng viên vừa điền.
- **Chống quá tải & Bảo vệ dữ liệu (Virtual Waiting Room):**
  - **Giới hạn đồng thời 25 người (`MAX_CONCURRENT_USERS: 25`):** Tự động bật giao diện Phòng chờ khi vượt ngưỡng an toàn của Google Apps Script, tự động nhường slot khi người trước nộp đơn xong hoặc đóng tab.
  - **Chống nghẽn khi bấm gửi (`postWithRetry`):** Tự động rải nhịp ngẫu nhiên (jitter `100–600ms`), tự động thử lại tối đa **3 lần** nếu mạng chập chờn và khóa chống spam 60 giây giữa 2 lần gửi.
  - **Tự động lưu nháp (`sessionStorage`):** Giữ nguyên nội dung đang gõ nếu lỡ tay tải lại trang (F5).
- **Tối ưu đa thiết bị & Vercel CDN:**
  - Hiển thị chuẩn trên PC màn hình lớn, Laptop, Tablet và Điện thoại.
  - Cấu hình `vercel.json` lưu đệm (cache) tài nguyên tĩnh giúp tiết kiệm băng thông tối đa trên gói Vercel Hobby miễn phí.

---

## 📁 Cấu trúc thư mục

```text
website/
├── index.html          # Giao diện chính 4 bước + Phòng chờ + Vercel Analytics
├── style.css           # Giao diện đen - cam + hiệu ứng ánh sáng + Responsive đa thiết bị
├── script.js           # Đếm ngược, lịch, form 4 bước, hàng chờ, lưu nháp, tải bản sao
├── vercel.json         # Cấu hình Cache-Control cho Vercel Edge CDN
├── package.json        # Tích hợp @vercel/analytics & @vercel/speed-insights
├── assets/
│   ├── logo.png        # Logo Phenikaa Esports Club
│   ├── favicon.png     # Icon tab trình duyệt (128x128)
│   ├── kv.png          # Key Visual chính thức Gen 8 (đã tối ưu dung lượng)
│   └── zalo-qr.png     # Mã QR Nhóm Zalo Hỗ Trợ ứng viên
├── apps-script/
│   └── Code.gs         # Google Apps Script: ghi Sheet, gửi Email bản sao, điều phối hàng chờ
├── HUONG_DAN.md        # Hướng dẫn chi tiết kết nối Google Sheet, cấp quyền Mail & deploy
└── README.md
```

---

## 🚀 Bắt đầu nhanh & Cập nhật

1. **Xem thử trên máy:** Mở `index.html` bằng trình duyệt.
2. **Kết nối Google Sheet & Kích hoạt gửi Email:** Làm theo hướng dẫn chi tiết tại [HUONG_DAN.md](HUONG_DAN.md).
3. **Triển khai lên Vercel:** Đẩy thư mục `website` lên GitHub / Vercel để tự động cập nhật.

---

## ⚙️ Cấu hình (`script.js`)

```js
const CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/.../exec", // URL Web App của Apps Script
  OPEN_AT:  new Date("2026-10-26T10:00:00+07:00"),           // Mốc mở đơn Sơ tuyển (10:00 26/10)
  CLOSE_AT: new Date("2026-11-04T23:59:59+07:00"),           // Mốc đóng đơn Sơ tuyển
  INTERVIEW_START: new Date("2026-11-06T00:00:00+07:00"),    // Ngày phỏng vấn 06/11
  INTERVIEW_END:   new Date("2026-11-06T23:59:59+07:00"),
  RESULT_START:    new Date("2026-11-10T00:00:00+07:00"),    // Ngày thông báo kết quả 10/11
  RESULT_END:      new Date("2026-11-10T23:59:59+07:00"),
  LOCK_BEFORE_OPEN: true,         // Khoá nút Đăng ký ngay trước 10:00 26/10/2026
  MAX_CONCURRENT_USERS: 25,       // Giới hạn số người truy cập cùng lúc (Virtual Waiting Room)
  QUEUE_POLL_MS: 4000,            // Tự động kiểm tra lượt trống mỗi 4 giây
  HEARTBEAT_MS: 45000,            // Giữ lượt hoạt động mỗi 45 giây
  SUBMIT_COOLDOWN_SEC: 60,        // Khoảng cách tối thiểu giữa 2 lần gửi đơn (60s)
};
```

> **Đường dẫn kiểm thử dành cho Ban Tổ Chức:**
> - **Mở khóa đơn sớm để test (`TEST MODE`):** Thêm `?test=1` vào cuối URL (ví dụ: `https://ten-web.vercel.app/?test=1`).
> - **Xem thử giao diện Phòng chờ (`QUEUE DEMO`):** Thêm `?queue=1` vào cuối URL (ví dụ: `https://ten-web.vercel.app/?queue=1`).

---

## 📝 Chỉnh sửa nội dung

| Muốn sửa | Vị trí |
|---|---|
| Nội dung trang chủ / các ban / liên hệ | `index.html` |
| Câu hỏi form | `index.html` (thẻ `name="..."`), `script.js` (`QUESTION_LABELS`) **và** `apps-script/Code.gs` (`COMMON`, `BRANCHES`) |
| Nội dung Email gửi tự động | Hàm `sendBackupEmail()` trong `apps-script/Code.gs` |
| Màu sắc chủ đạo | Biến `:root` đầu `style.css` (`--orange`, `--black`...) |
| Cường độ hiệu ứng sáng | Mục `LIGHT EFFECTS` trong `style.css` |
| Ảnh KV / Logo / QR Zalo | Thay file tương ứng trong thư mục `assets/` |

> [!WARNING]
> Mỗi khi sửa file `apps-script/Code.gs`, bạn cần dán code mới vào Google Apps Script, bấm **Chạy `setup`** (nếu có thay đổi cột hoặc cấp quyền mới), sau đó vào **Triển khai → Quản lý các bản triển khai → Chỉnh sửa (✏️) → Phiên bản: Phiên bản mới → Triển khai**.

---

## 📬 Liên hệ PEC

- **Fanpage:** https://www.facebook.com/esc.phenikaa/
- **TikTok:** https://www.tiktok.com/@phenikaaesportclub
- **Group cộng đồng:** https://www.facebook.com/groups/esc.pka
- **Nhóm Zalo Hỗ Trợ Gen 8:** https://zalo.me/g/vuhn4eo5ctcch0o1qbg5
- **Email:** esc.pka@gmail.com
- **Liên hệ trực tiếp:** https://www.facebook.com/EbeBunny05/

---

**New Blood. New Energy. New Era.** 🔥
