# 🩸 PEC Gen 8 – New Blood, New Era

Website tuyển thành viên **Gen 8** của **Phenikaa Esports Club (PEC)** – Câu lạc bộ Thể thao Điện tử trực thuộc Đại học Phenikaa.

Website tĩnh (HTML/CSS/JS thuần), không cần cài đặt hay build. Dữ liệu đăng ký được tự động ghi vào **Google Sheet** qua Google Apps Script.

---

## 📅 Lịch tuyển thành viên

| Mốc | Thời gian | Hình thức |
|---|---|---|
| 📝 Vòng 1 – Sơ tuyển | 26/10/2026 – hết 04/11/2026 | Điền đơn online trên website |
| 🎤 Vòng 2 – Phỏng vấn | 06/11/2026 | Trực tiếp tại Đại học Phenikaa |
| 🏆 Thông báo kết quả | 10/11/2026 | Email / Fanpage |

---

## ✨ Tính năng

- **Trang chủ** – giới thiệu PEC & chiến dịch Gen 8, Key Visual.
- **Giới thiệu các ban** – Vận hành Giải đấu Esports, Truyền thông & Thiết kế, Cộng đồng & Đối ngoại.
- **Timeline** – đồng hồ đếm ngược tự chuyển mốc, lịch tháng 10–11/2026, nút thêm sự kiện vào Google Calendar / tải file `.ics`.
- **Đăng ký nhiều bước**
  1. Trang nền KV + nút *Đăng ký ngay*
  2. Thông tin cá nhân (họ tên, SĐT, Facebook, giới tính, khóa, ban ứng tuyển)
  3. Câu hỏi riêng theo từng ban (3 nhánh)
  4. Cảm ơn & thông báo chờ email
- **Google Sheet tự động** – mỗi câu hỏi một cột giống kết quả Google Form, kèm trang tính riêng cho từng ban.
- **Liên hệ** – Fanpage, TikTok, Group, Email, liên hệ trực tiếp.
- **Hiệu ứng ánh sáng** – nền phát sáng, đèn theo chuột, viền sáng thẻ, nút quét sáng, chữ neon.
- Responsive cho điện thoại; tự tắt animation khi bật *giảm chuyển động*.

---

## 📁 Cấu trúc thư mục

```
website/
├── index.html          # Toàn bộ nội dung trang
├── style.css           # Giao diện + hiệu ứng ánh sáng
├── script.js           # Form nhiều bước, timeline, đếm ngược, gửi dữ liệu
├── assets/
│   └── kv.png          # Key Visual
├── apps-script/
│   └── Code.gs         # Script nhận dữ liệu & ghi vào Google Sheet
├── HUONG_DAN.md        # Hướng dẫn chi tiết kết nối Google Sheet & deploy
└── README.md
```

---

## 🚀 Bắt đầu nhanh

1. **Xem thử:** mở `index.html` bằng trình duyệt.
   > Khi chưa cấu hình `SCRIPT_URL`, form vẫn chạy ở chế độ demo (dữ liệu chỉ in ra Console, chưa lưu).
2. **Kết nối Google Sheet:** làm theo [HUONG_DAN.md](HUONG_DAN.md) → dán URL Web App vào `script.js`.
3. **Đưa lên mạng:** kéo thả thư mục `website` vào [Netlify Drop](https://app.netlify.com/drop) (hoặc GitHub Pages / Firebase Hosting).

---

## ⚙️ Cấu hình (`script.js`)

```js
const CONFIG = {
  SCRIPT_URL: "",                 // URL Web App của Apps Script
  OPEN_AT:  new Date("2026-10-26T00:00:00+07:00"),   // Mở đơn Sơ tuyển
  CLOSE_AT: new Date("2026-11-04T23:59:59+07:00"),   // Đóng đơn Sơ tuyển
  INTERVIEW_START / INTERVIEW_END,                   // Ngày phỏng vấn 06/11
  RESULT_START / RESULT_END,                         // Ngày thông báo kết quả 10/11
  ENFORCE_DATES: false,           // true = chỉ cho đăng ký trong thời gian Sơ tuyển
};
```

> [!IMPORTANT]
> Trước khi chính thức mở đơn, hãy đặt `ENFORCE_DATES: true` và kiểm tra `SCRIPT_URL` đã được điền.

Khi đổi ngày, nhớ cập nhật đồng thời:
- `CONFIG` và `EVENTS` (Google Calendar / `.ics`) trong `script.js`
- Hàm `mark()` trong `renderCalendar()` (tô màu lịch)
- Các đoạn text ngày tháng trong `index.html`

---

## 📝 Chỉnh sửa nội dung

| Muốn sửa | Vị trí |
|---|---|
| Nội dung trang chủ / các ban / liên hệ | `index.html` |
| Câu hỏi form | `index.html` (thẻ `name="..."`) **và** `apps-script/Code.gs` (mảng `COMMON`, `BRANCHES`) |
| Màu sắc | biến `:root` đầu `style.css` (`--orange`, `--black`...) |
| Cường độ hiệu ứng sáng | mục `LIGHT EFFECTS` cuối `style.css` |
| Ảnh KV | thay file `assets/kv.png` |

> [!WARNING]
> Khi thêm/sửa câu hỏi, `name` trong HTML phải trùng với key trong `Code.gs`, sau đó chạy lại `setup()` và **triển khai phiên bản mới** của Web App.

---

## 📬 Liên hệ PEC

- Fanpage: https://www.facebook.com/esc.phenikaa/
- TikTok: https://www.tiktok.com/@phenikaaesportclub
- Group cộng đồng: https://www.facebook.com/groups/esc.pka
- Email: esc.pka@gmail.com
- Liên hệ trực tiếp: https://www.facebook.com/EbeBunny05/

---

**New Blood. New Energy. New Era.** 🔥
