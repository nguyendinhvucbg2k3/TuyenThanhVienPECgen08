/* =========================================================
   CẤU HÌNH – chỉnh sửa tại đây
   ========================================================= */
const CONFIG = {
  // Dán URL Web App của Google Apps Script vào đây (xem HUONG_DAN.md)
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzg_bjdjLl2EDc7fy94j4VjlriikkFt0TwyLQYYVHxMS2nlVGXhlemsud7a6nnxDVbhmA/exec",

  // Vòng 1 – Sơ tuyển (mở / đóng đơn, giờ Việt Nam)
  OPEN_AT: new Date("2026-10-26T10:00:00+07:00"),
  CLOSE_AT: new Date("2026-11-04T23:59:59+07:00"),

  // Vòng 2 – Phỏng vấn (cả ngày 06/11/2026)
  INTERVIEW_START: new Date("2026-11-06T00:00:00+07:00"),
  INTERVIEW_END: new Date("2026-11-06T23:59:59+07:00"),

  // Thông báo kết quả (cả ngày 10/11/2026)
  RESULT_START: new Date("2026-11-10T00:00:00+07:00"),
  RESULT_END: new Date("2026-11-10T23:59:59+07:00"),

  // true = khoá nút "Đăng ký ngay" cho đến đúng OPEN_AT (10:00 26/10/2026)
  LOCK_BEFORE_OPEN: true,

  // Giới hạn số người truy cập đồng thời để chống quá tải hệ thống & Google Sheet
  MAX_CONCURRENT_USERS: 25,
  QUEUE_POLL_MS: 4000,
  HEARTBEAT_MS: 45000,
  SUBMIT_COOLDOWN_SEC: 60,
};

// Ban tổ chức muốn test trước giờ mở đơn: thêm ?test=1 vào cuối link website
// Xem thử giao diện phòng chờ quá tải: thêm ?queue=1 vào cuối link website
const URL_PARAMS = new URLSearchParams(location.search);
const TEST_MODE = URL_PARAMS.has("test");
const QUEUE_DEMO = URL_PARAMS.has("queue");

// Mã phiên truy cập duy nhất cho mỗi tab trình duyệt
const CLIENT_ID = (() => {
  try {
    let id = sessionStorage.getItem("pec_cid");
    if (!id) {
      id = "u_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem("pec_cid", id);
    }
    return id;
  } catch (_) {
    return "u_" + Math.random().toString(36).slice(2, 10);
  }
})();

/* ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const form = $("#regForm");
let currentBranch = null;

/* ---------- Menu mobile / tablet ---------- */
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");
function setMenuOpen(open) {
  navLinks.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.textContent = open ? "✕" : "☰";
}
navToggle.addEventListener("click", () => setMenuOpen(!navLinks.classList.contains("open")));
$$("#navLinks a").forEach((a) => a.addEventListener("click", () => setMenuOpen(false)));
document.addEventListener("click", (e) => {
  if (navLinks.classList.contains("open") && !e.target.closest(".nav")) setMenuOpen(false);
});
addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenuOpen(false);
});
addEventListener("resize", () => {
  if (innerWidth > 920 && navLinks.classList.contains("open")) setMenuOpen(false);
});

/* ---------- Trạng thái đợt tuyển ---------- */
function regState() {
  const now = new Date();
  if (now < CONFIG.OPEN_AT) return "soon";
  if (now > CONFIG.CLOSE_AT) return "closed";
  return "open";
}

function isLocked() {
  if (TEST_MODE) return false;
  return regState() === "soon" && CONFIG.LOCK_BEFORE_OPEN;
}

function renderStatus() {
  const st = regState();
  const el = $("#regStatus");
  const fmt = (ms) => {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${d} ngày ${h} giờ ${m} phút ${s} giây`;
  };
  if (st === "soon") {
    el.innerHTML = `<span class="pill pill--soon">Sắp mở đơn Sơ tuyển</span> Còn ${fmt(CONFIG.OPEN_AT - new Date())}`;
  } else if (st === "open") {
    el.innerHTML = `<span class="pill pill--open">Đang mở đơn Sơ tuyển</span> Đóng sau ${fmt(CONFIG.CLOSE_AT - new Date())}`;
  } else {
    el.innerHTML = `<span class="pill pill--closed">Đã đóng đơn Sơ tuyển</span> Cảm ơn bạn đã quan tâm!`;
  }
  if (TEST_MODE) el.innerHTML += ` <span class="pill pill--soon">TEST MODE</span>`;

  const locked = isLocked();
  const btn = $("#btnStart");
  btn.disabled = locked;
  btn.textContent = !locked ? "Đăng ký ngay!" : "🔒 Mở đơn lúc 10:00 – 26/10/2026";
  $$("[data-start-register]").forEach((a) => a.classList.toggle("is-locked", locked));
}
renderStatus();
setInterval(renderStatus, 1000);

/* ---------- Timeline: đếm ngược + lịch + thêm sự kiện ---------- */
const EVENTS = {
  r1: {
    title: "PEC Gen 8 – Vòng Sơ tuyển (mở đơn đăng ký)",
    start: "20261026", end: "20261105", // ngày kết thúc không tính (all-day)
    details: "Điền đơn đăng ký tuyển thành viên Phenikaa Esports Club Gen 8 – New Blood, New Era. Mở đơn lúc 10:00 ngày 26/10/2026, hạn chót: hết ngày 04/11/2026.",
    location: "Online",
  },
  r2: {
    title: "PEC Gen 8 – Vòng Phỏng vấn",
    start: "20261106", end: "20261107",
    details: "Vòng Phỏng vấn tuyển thành viên Phenikaa Esports Club Gen 8 – New Blood, New Era.",
    location: "Đại học Phenikaa",
  },
  r3: {
    title: "PEC Gen 8 – Thông báo kết quả",
    start: "20261110", end: "20261111",
    details: "Công bố kết quả tuyển thành viên Phenikaa Esports Club Gen 8 – New Blood, New Era. Theo dõi email và Fanpage PEC.",
    location: "Email / Fanpage Phenikaa Esports Club",
  },
};

function gcalUrl(ev) {
  const p = new URLSearchParams({
    action: "TEMPLATE", text: ev.title, dates: `${ev.start}/${ev.end}`,
    details: ev.details + "\nFanpage: https://www.facebook.com/esc.phenikaa/", location: ev.location, ctz: "Asia/Ho_Chi_Minh",
  });
  return "https://calendar.google.com/calendar/render?" + p.toString();
}
$$("[data-gcal]").forEach((a) => (a.href = gcalUrl(EVENTS[a.dataset.gcal])));

function downloadIcs(keys) {
  const esc = (s) => s.replace(/[,;\\]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const body = keys.map((k) => {
    const ev = EVENTS[k];
    return [
      "BEGIN:VEVENT", `UID:pec-gen8-${k}@esc.phenikaa`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ev.start}`, `DTEND;VALUE=DATE:${ev.end}`,
      `SUMMARY:${esc(ev.title)}`, `DESCRIPTION:${esc(ev.details)}`, `LOCATION:${esc(ev.location)}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${esc(ev.title)}`, "END:VALARM",
      "END:VEVENT",
    ].join("\r\n");
  });
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PEC//Gen8//VI", "CALSCALE:GREGORIAN", ...body, "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  a.download = keys.length > 1 ? "PEC-Gen8-Timeline.ics" : `PEC-Gen8-${k2name(keys[0])}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const k2name = (k) => ({ r1: "So-tuyen", r2: "Phong-van", r3: "Ket-qua" }[k]);
$$("[data-ics]").forEach((b) =>
  b.addEventListener("click", () => downloadIcs(b.dataset.ics === "all" ? ["r1", "r2", "r3"] : [b.dataset.ics]))
);

// Đếm ngược theo mốc tiếp theo
function tickCountdown() {
  const now = new Date();
  let label, target;
  if (now < CONFIG.OPEN_AT) { label = "🔓 Vòng Sơ tuyển mở đơn sau"; target = CONFIG.OPEN_AT; }
  else if (now <= CONFIG.CLOSE_AT) { label = "⏰ Vòng Sơ tuyển đóng đơn sau"; target = CONFIG.CLOSE_AT; }
  else if (now < CONFIG.INTERVIEW_START) { label = "🎤 Vòng Phỏng vấn bắt đầu sau"; target = CONFIG.INTERVIEW_START; }
  else if (now <= CONFIG.INTERVIEW_END) { label = "🔥 Vòng Phỏng vấn đang diễn ra tại Đại học Phenikaa!"; }
  else if (now < CONFIG.RESULT_START) { label = "🏆 Thông báo kết quả sau"; target = CONFIG.RESULT_START; }
  else if (now <= CONFIG.RESULT_END) { label = "🏆 Kết quả đã được công bố – kiểm tra email của bạn nhé!"; }
  else { label = "🏁 Đợt tuyển thành viên Gen 8 đã kết thúc. Hẹn gặp lại!"; }

  const ms = target ? Math.max(0, target - now) : 0;
  const pad = (n) => String(n).padStart(2, "0");
  $("#cdLabel").textContent = label;
  $("#cdD").textContent = pad(Math.floor(ms / 86400000));
  $("#cdH").textContent = pad(Math.floor((ms % 86400000) / 3600000));
  $("#cdM").textContent = pad(Math.floor((ms % 3600000) / 60000));
  $("#cdS").textContent = pad(Math.floor((ms % 60000) / 1000));

  // Trạng thái từng vòng
  const setRound = (id, start, end) => {
    const el = $("#" + id), tag = $(".round__state", el);
    const state = now < start ? "soon" : now <= end ? "active" : "done";
    el.classList.toggle("is-active", state === "active");
    el.classList.toggle("is-done", state === "done");
    tag.className = "round__state pill " + { soon: "pill--soon", active: "pill--open", done: "pill--closed" }[state];
    tag.textContent = { soon: "Sắp diễn ra", active: "Đang diễn ra", done: "Đã kết thúc" }[state];
  };
  setRound("round1", CONFIG.OPEN_AT, CONFIG.CLOSE_AT);
  setRound("round2", CONFIG.INTERVIEW_START, CONFIG.INTERVIEW_END);
  setRound("round3", CONFIG.RESULT_START, CONFIG.RESULT_END);
}
tickCountdown();
setInterval(tickCountdown, 1000);

// Lịch tháng 10 & 11/2026
function renderCalendar() {
  const vn = new Date(Date.now() + 7 * 3600000); // giờ Việt Nam
  const today = { y: vn.getUTCFullYear(), m: vn.getUTCMonth(), d: vn.getUTCDate() };
  const months = [{ y: 2026, m: 9 }, { y: 2026, m: 10 }];
  const dows = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const mark = (m, d) => {
    if ((m === 9 && d >= 26) || (m === 10 && d <= 4)) return ["r1", "Vòng Sơ tuyển"];
    if (m === 10 && d === 6) return ["r2", "Vòng Phỏng vấn – Đại học Phenikaa"];
    if (m === 10 && d === 10) return ["r3", "Thông báo kết quả"];
    return null;
  };
  $("#calendar").innerHTML = months.map(({ y, m }) => {
    const first = (new Date(y, m, 1).getDay() + 6) % 7; // T2 = 0
    const days = new Date(y, m + 1, 0).getDate();
    let cells = dows.map((d) => `<div class="dow">${d}</div>`).join("");
    cells += '<div class="day empty"></div>'.repeat(first);
    for (let d = 1; d <= days; d++) {
      const mk = mark(m, d);
      const isToday = today.y === y && today.m === m && today.d === d;
      cells += `<div class="day ${mk ? mk[0] : ""} ${isToday ? "today" : ""}"${mk ? ` title="${mk[1]}"` : ""}>${d}</div>`;
    }
    return `<div class="month"><h4>Tháng ${m + 1}/${y}</h4><div class="month__grid">${cells}</div></div>`;
  }).join("");
}
renderCalendar();

/* ---------- Điều hướng các bước ---------- */
function goStep(n) {
  $$(".panel").forEach((p) => p.classList.remove("active"));
  $("#step" + n).classList.add("active");
  $$("#steps li").forEach((li) => {
    const s = +li.dataset.step;
    li.classList.toggle("active", s === n);
    li.classList.toggle("done", s < n);
  });
  $("#tuyen").scrollIntoView({ behavior: "smooth" });
}

$("#btnStart").addEventListener("click", () => {
  if (isLocked()) return;
  goStep(2);
});
$$("[data-go]").forEach((b) => b.addEventListener("click", () => goStep(+b.dataset.go)));

// Các nút "Đăng ký ngay" ở trang chủ -> về bước 1 của phần tuyển
$$("[data-start-register]").forEach((a) =>
  a.addEventListener("click", () => {
    if (!$("#step4").classList.contains("active")) goStep(1);
  })
);

/* ---------- Validate ---------- */
function setError(field, msg) {
  field.classList.add("invalid");
  let e = $(".err", field);
  if (!e) {
    e = document.createElement("p");
    e.className = "err";
    field.appendChild(e);
  }
  e.textContent = msg;
}
function clearError(field) {
  field.classList.remove("invalid");
  $(".err", field)?.remove();
}

function validateScope(scope) {
  let ok = true;
  $$(".field", scope).forEach((field) => {
    clearError(field);
    const group = field.dataset.group;
    if (group) {
      const checked = $$(`input[name="${group}"]:checked`, field);
      if (!checked.length) {
        setError(field, "Vui lòng chọn ít nhất một đáp án.");
        ok = false;
      } else if (group === "tt_q4" && $("#tt_q4_other_chk").checked && !$("#tt_q4_other").value.trim()) {
        setError(field, "Vui lòng ghi rõ phần mềm ở mục khác.");
        ok = false;
      }
      return;
    }
    const input = $("input, textarea", field);
    const v = input.value.trim();
    if (!v) {
      setError(field, "Đây là câu hỏi bắt buộc.");
      ok = false;
    } else if (input.id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setError(field, "Email chưa đúng định dạng (ví dụ: tenban@gmail.com).");
      ok = false;
    } else if (input.id === "sdt" && !/^(0|\+84)\d{9,10}$/.test(v.replace(/[\s.-]/g, ""))) {
      setError(field, "Số điện thoại chưa hợp lệ.");
      ok = false;
    }
  });
  if (!ok) $(".field.invalid", scope)?.scrollIntoView({ behavior: "smooth", block: "center" });
  return ok;
}

// Xoá lỗi khi người dùng nhập lại
form.addEventListener("input", (e) => {
  const f = e.target.closest(".field");
  if (f) clearError(f);
});
$("#tt_q4_other").addEventListener("input", (e) => {
  $("#tt_q4_other_chk").checked = e.target.value.trim() !== "";
});

/* ---------- B2 -> B3 ---------- */
$("#btnNext").addEventListener("click", () => {
  if (!validateScope($("#step2"))) return;
  currentBranch = $('input[name="ban"]:checked').dataset.branch;
  $$(".branch").forEach((b) => b.classList.toggle("active", b.dataset.branch === currentBranch));
  goStep(3);
});

/* ---------- Tự động lưu nháp form (chống mất dữ liệu khi rớt mạng/F5) ---------- */
const DRAFT_KEY = "pec_gen8_draft";
function saveDraft() {
  try {
    const draft = {};
    $$("input, textarea", form).forEach((el) => {
      if (el.type === "radio" || el.type === "checkbox") {
        if (el.checked) draft[el.name + ":" + el.value] = 1;
      } else if (el.id) {
        draft[el.id] = el.value;
      }
    });
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (_) {}
}
function restoreDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    $$("input, textarea", form).forEach((el) => {
      if (el.type === "radio" || el.type === "checkbox") {
        if (draft[el.name + ":" + el.value]) el.checked = true;
      } else if (el.id && draft[el.id] != null) {
        el.value = draft[el.id];
      }
    });
  } catch (_) {}
}
restoreDraft();
form.addEventListener("input", saveDraft);

/* ---------- Hàng chờ giới hạn người truy cập cùng thời điểm ---------- */
const queueOverlay = $("#queueOverlay");
let slotGranted = false;
let queueTimer = null;

function setQueueModal(visible, info = {}) {
  queueOverlay.classList.toggle("active", visible);
  queueOverlay.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    $("#qPos").textContent = "#" + (info.position || 1);
    $("#qActive").textContent = `${info.active || CONFIG.MAX_CONCURRENT_USERS}/${info.max || CONFIG.MAX_CONCURRENT_USERS}`;
    $("#qEta").textContent = `~${Math.max(4, info.etaSec || 8)} giây`;
  }
}

async function pingTrafficQueue(action = "heartbeat") {
  if (!CONFIG.SCRIPT_URL) return { granted: true };
  const url = `${CONFIG.SCRIPT_URL}?action=${encodeURIComponent(action)}&cid=${encodeURIComponent(CLIENT_ID)}&max=${CONFIG.MAX_CONCURRENT_USERS}&_t=${Date.now()}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { method: "GET", cache: "no-store", signal: ctrl.signal });
    const data = await res.json();
    // Nếu Apps Script bản cũ chưa có trường 'granted' thì mặc định cho qua để không khoá nhầm
    if (typeof data.granted !== "boolean") return { granted: true };
    return data;
  } catch (_) {
    // Nếu mạng chập chờn hoặc lỗi CORS tạm thời, ưu tiên cho người dùng truy cập
    return { granted: true };
  } finally {
    clearTimeout(timer);
  }
}

function releaseTrafficSlot() {
  if (!CONFIG.SCRIPT_URL || !slotGranted) return;
  slotGranted = false;
  const url = `${CONFIG.SCRIPT_URL}?action=leave&cid=${encodeURIComponent(CLIENT_ID)}&_t=${Date.now()}`;
  try {
    fetch(url, { method: "GET", mode: "no-cors", keepalive: true });
  } catch (_) {}
}

async function checkTrafficSlot() {
  if (QUEUE_DEMO) {
    setQueueModal(true, { position: 3, active: CONFIG.MAX_CONCURRENT_USERS, max: CONFIG.MAX_CONCURRENT_USERS, etaSec: 15 });
    return;
  }
  if (TEST_MODE) {
    slotGranted = true;
    setQueueModal(false);
    return;
  }
  const status = await pingTrafficQueue("heartbeat");
  if (status.granted) {
    slotGranted = true;
    setQueueModal(false);
    clearInterval(queueTimer);
    queueTimer = setInterval(() => {
      if (document.visibilityState === "visible" && !$("#step4").classList.contains("active")) {
        pingTrafficQueue("heartbeat");
      }
    }, CONFIG.HEARTBEAT_MS);
  } else {
    slotGranted = false;
    setQueueModal(true, status);
    clearInterval(queueTimer);
    queueTimer = setInterval(checkTrafficSlot, CONFIG.QUEUE_POLL_MS);
  }
}

checkTrafficSlot();
addEventListener("pagehide", releaseTrafficSlot);

/* ---------- Gửi form (kèm chống spam, chống nghẽn & tự động thử lại 3 lần) ---------- */
function collectData() {
  const val = (n) => ($(`[name="${n}"]:checked`) || $(`[name="${n}"]`))?.value.trim() || "";
  const data = {
    _cid: CLIENT_ID,
    sendCopy: $("#sendCopy") ? $("#sendCopy").checked : true,
    hoTen: val("hoTen"),
    email: val("email"),
    sdt: val("sdt"),
    facebook: val("facebook"),
    gioiTinh: val("gioiTinh"),
    khoa: val("khoa"),
    ban: val("ban"),
  };
  if (currentBranch === "vh") {
    data.vh_q1 = val("vh_q1");
    data.vh_q2 = val("vh_q2");
  } else if (currentBranch === "tt") {
    data.tt_q1 = val("tt_q1");
    data.tt_q2 = val("tt_q2");
    data.tt_q3 = val("tt_q3");
    data.tt_q4 = $$('input[name="tt_q4"]:checked')
      .map((c) => (c.value === "__other" ? $("#tt_q4_other").value.trim() : c.value))
      .filter(Boolean)
      .join(", ");
  } else if (currentBranch === "cd") {
    data.cd_q1 = val("cd_q1");
    data.cd_q2 = val("cd_q2");
  }
  return data;
}

const QUESTION_LABELS = {
  hoTen: "Họ và tên của bạn ?",
  email: "Email nhận thông báo ?",
  sdt: "Số điện thoại liên hệ (Ưu tiên SĐT sử dụng Zalo) ?",
  facebook: "Link Facebook cá nhân ?",
  gioiTinh: "Giới tính của bạn ?",
  khoa: "Khóa bạn đang theo học ?",
  ban: "Ban bạn muốn ứng tuyển ?",
  vh_q1: "Theo bạn, để một giải đấu Esports diễn ra trơn chu cần phải chuẩn bị như thế nào ?",
  vh_q2: "Giả sử trong tình huống sau, bạn là BTC của một giải đấu Esports sinh viên, trong quá trình thi đấu, tuyển thủ hai đội xảy ra mâu thuẫn không đáng có, là người phải đứng ra giải quyết vấn đề trên, bạn sẽ làm gì ?",
  tt_q1: "Bạn đã từng tham gia công việc sáng tạo nội dung trên các nền tảng MXH chưa ?",
  tt_q2: "Bạn có hay đọc, theo dõi những thông tin Esports không ?",
  tt_q3: "Giả sử một ngày, bạn cạn kiệt ý tưởng, không biết phải đăng bài viết như thế nào, bạn sẽ làm gì? (Câu hỏi dành cho tiểu ban Nội dung)",
  tt_q4: "Bạn đã làm việc trên phần mềm chỉnh sửa ảnh, video, giọng nói nào chưa? (Câu hỏi dành cho tiểu ban Thiết Kế)",
  cd_q1: "Nếu như bạn là một thành viên của ban Cộng đồng, ngoài những nhiệm vụ được giao thì bạn có ý tưởng gì để phát triển một cộng đồng lớn mạnh ?",
  cd_q2: "Theo bạn, một Group Esports hay một Kênh Discord Esports cần những gì để thu được người tham gia và theo dõi ?",
};

let lastSubmittedBackup = null;

function buildBackupPairs(data) {
  const nowStr = new Date().toLocaleString("vi-VN");
  const keys = ["hoTen", "email", "sdt", "facebook", "gioiTinh", "khoa", "ban"];
  if (data.vh_q1 !== undefined) keys.push("vh_q1", "vh_q2");
  if (data.tt_q1 !== undefined) keys.push("tt_q1", "tt_q2", "tt_q3", "tt_q4");
  if (data.cd_q1 !== undefined) keys.push("cd_q1", "cd_q2");
  const pairs = [["Thời gian nộp đơn", nowStr]];
  keys.forEach((k) => pairs.push([QUESTION_LABELS[k] || k, data[k] || ""]));
  return pairs;
}

function renderBackupOnStep4(data) {
  const pairs = buildBackupPairs(data);
  lastSubmittedBackup = { data, pairs };
  const listEl = $("#backupList");
  if (listEl) {
    listEl.innerHTML = "";
    pairs.forEach(([q, a]) => {
      const item = document.createElement("div");
      item.className = "backup-item";
      const span = document.createElement("span");
      span.textContent = q;
      const strong = document.createElement("strong");
      strong.textContent = a;
      item.append(span, strong);
      listEl.appendChild(item);
    });
  }
  const mailNote = $("#thanksMailNote");
  const emailEl = $("#thanksEmail");
  if (emailEl) emailEl.textContent = data.email;
  if (mailNote) mailNote.style.display = data.sendCopy ? "block" : "none";
}

$("#btnDownloadCopy")?.addEventListener("click", () => {
  if (!lastSubmittedBackup) return;
  const { data, pairs } = lastSubmittedBackup;
  const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
  const rows = pairs
    .map(
      ([q, a]) =>
        `<tr><td style="padding:12px 14px;border-bottom:1px solid #26262c;color:#a8a8b3;width:38%;vertical-align:top;font-weight:600">${esc(q)}</td>` +
        `<td style="padding:12px 14px;border-bottom:1px solid #26262c;color:#f5f5f7;line-height:1.6;vertical-align:top">${esc(a)}</td></tr>`
    )
    .join("");
  const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Bản sao đơn đăng ký PEC Gen 8 – ${esc(data.hoTen)}</title></head>
<body style="margin:0;background:#0a0a0c;padding:32px 16px;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#f5f5f7">
  <div style="max-width:680px;margin:0 auto;background:#141418;border:1px solid #2a2a32;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#ff6a00,#cc4400);padding:24px;text-align:center">
      <div style="font-size:12px;font-weight:800;letter-spacing:2px;color:#fff2e6">PHENIKAA ESPORTS CLUB · GEN 8</div>
      <h1 style="margin:6px 0 0;font-size:22px;color:#fff;text-transform:uppercase">Bản sao lưu câu trả lời ứng tuyển</h1>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;background:#101014;border:1px solid #26262c;border-radius:10px;overflow:hidden">${rows}</table>
      <p style="margin:18px 0 0;font-size:13px;color:#8e8e99;text-align:center">© 2026 Phenikaa Esports Club · Nhóm Zalo Hỗ Trợ: <a href="https://zalo.me/g/vuhn4eo5ctcch0o1qbg5" style="color:#ff8533">https://zalo.me/g/vuhn4eo5ctcch0o1qbg5</a></p>
    </div>
  </div>
</body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Ban-Sao-Dang-Ky-PEC-Gen8-${(data.hoTen || "UngVien").replace(/\s+/g, "-")}.html`;
  a.click();
});

async function postWithRetry(url, payload, onRetry) {
  // Thêm độ trễ ngẫu nhiên nhỏ (100–600ms) để phân tán tải nếu hàng chục người bấm cùng 1 giây
  await new Promise((r) => setTimeout(r, 100 + Math.floor(Math.random() * 500)));

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      return;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      onRetry?.(attempt + 1, maxAttempts);
      await new Promise((r) => setTimeout(r, attempt * 1800 + Math.floor(Math.random() * 600)));
    }
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const scope = $(`.branch[data-branch="${currentBranch}"]`);
  if (!validateScope(scope)) return;
  if (isLocked()) {
    $("#submitError").textContent = "Hiện chưa trong thời gian nhận đơn Sơ tuyển (Mở đơn lúc 10:00 – 26/10/2026).";
    return;
  }

  // Chống bấm gửi liên tục (cooldown)
  try {
    const lastSent = Number(localStorage.getItem("pec_last_submit") || 0);
    const waitSec = Math.ceil((CONFIG.SUBMIT_COOLDOWN_SEC * 1000 - (Date.now() - lastSent)) / 1000);
    if (!TEST_MODE && waitSec > 0) {
      $("#submitError").textContent = `Bạn vừa gửi đơn xong. Vui lòng đợi ${waitSec} giây nếu muốn gửi lại.`;
      return;
    }
  } catch (_) {}

  const btn = $("#btnSubmit");
  const errEl = $("#submitError");
  errEl.textContent = "";
  btn.disabled = true;
  btn.textContent = "Đang gửi...";

  const data = collectData();
  try {
    if (CONFIG.SCRIPT_URL) {
      await postWithRetry(CONFIG.SCRIPT_URL, data, (attempt, max) => {
        btn.textContent = `Đang thử lại (${attempt}/${max})...`;
      });
    } else {
      console.warn("[PEC] Chưa cấu hình SCRIPT_URL – dữ liệu chưa được lưu vào Google Sheet:", data);
      await new Promise((r) => setTimeout(r, 600));
    }
    try {
      localStorage.setItem("pec_last_submit", String(Date.now()));
      sessionStorage.removeItem(DRAFT_KEY);
    } catch (_) {}
    releaseTrafficSlot();
    clearInterval(queueTimer);

    $("#thanksName").textContent = data.hoTen;
    $("#thanksBan").textContent = data.ban;
    renderBackupOnStep4(data);
    form.reset();
    goStep(4);
  } catch (err) {
    console.error(err);
    errEl.textContent = "Hệ thống đang bận hoặc mất kết nối mạng. Dữ liệu của bạn vẫn được giữ nguyên, vui lòng bấm gửi lại sau vài giây!";
  } finally {
    btn.disabled = false;
    btn.textContent = "Gửi đơn đăng ký 🚀";
  }
});


/* ---------- Light effects ---------- */
(function lightFx() {
  // Viền sáng theo chuột trên các thẻ
  $$(".card, .team, .round, .form-card, .contact, .countdown, .landing, .calendar-wrap").forEach((el) => {
    el.classList.add("glow");
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Đèn theo con trỏ
  if (!matchMedia("(hover: hover)").matches) return;
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);
  let x = 0, y = 0, cx = 0, cy = 0, raf = null;
  const loop = () => {
    cx += (x - cx) * 0.15;
    cy += (y - cy) * 0.15;
    glow.style.transform = `translate(${cx}px, ${cy}px)`;
    raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(loop) : null;
  };
  addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
    glow.classList.add("on");
    if (!raf) raf = requestAnimationFrame(loop);
  });
  document.addEventListener("pointerleave", () => glow.classList.remove("on"));
})();
