/* =========================================================
   CẤU HÌNH – chỉnh sửa tại đây
   ========================================================= */
const CONFIG = {
  // Dán URL Web App của Google Apps Script vào đây (xem HUONG_DAN.md)
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzg_bjdjLl2EDc7fy94j4VjlriikkFt0TwyLQYYVHxMS2nlVGXhlemsud7a6nnxDVbhmA/exec",

  // Vòng 1 – Sơ tuyển (mở / đóng đơn, giờ Việt Nam)
  OPEN_AT: new Date("2026-10-26T00:00:00+07:00"),
  CLOSE_AT: new Date("2026-11-04T23:59:59+07:00"),

  // Vòng 2 – Phỏng vấn (cả ngày 06/11/2026)
  INTERVIEW_START: new Date("2026-11-06T00:00:00+07:00"),
  INTERVIEW_END: new Date("2026-11-06T23:59:59+07:00"),

  // Thông báo kết quả (cả ngày 10/11/2026)
  RESULT_START: new Date("2026-11-10T00:00:00+07:00"),
  RESULT_END: new Date("2026-11-10T23:59:59+07:00"),

  // true = chỉ cho đăng ký trong khoảng thời gian trên
  // false = luôn cho đăng ký (tiện để test)
  ENFORCE_DATES: false,
};

/* ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const form = $("#regForm");
let currentBranch = null;

/* ---------- Menu mobile ---------- */
$("#navToggle").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
$$("#navLinks a").forEach((a) => a.addEventListener("click", () => $("#navLinks").classList.remove("open")));

/* ---------- Trạng thái đợt tuyển ---------- */
function regState() {
  const now = new Date();
  if (now < CONFIG.OPEN_AT) return "soon";
  if (now > CONFIG.CLOSE_AT) return "closed";
  return "open";
}

function renderStatus() {
  const st = regState();
  const el = $("#regStatus");
  const fmt = (ms) => {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${d} ngày ${h} giờ ${m} phút`;
  };
  if (st === "soon") {
    el.innerHTML = `<span class="pill pill--soon">Sắp mở đơn Sơ tuyển</span> Còn ${fmt(CONFIG.OPEN_AT - new Date())}`;
  } else if (st === "open") {
    el.innerHTML = `<span class="pill pill--open">Đang mở đơn Sơ tuyển</span> Đóng sau ${fmt(CONFIG.CLOSE_AT - new Date())}`;
  } else {
    el.innerHTML = `<span class="pill pill--closed">Đã đóng đơn Sơ tuyển</span> Cảm ơn bạn đã quan tâm!`;
  }
  $("#btnStart").disabled = CONFIG.ENFORCE_DATES && st !== "open";
}
renderStatus();
setInterval(renderStatus, 30000);

/* ---------- Timeline: đếm ngược + lịch + thêm sự kiện ---------- */
const EVENTS = {
  r1: {
    title: "PEC Gen 8 – Vòng Sơ tuyển (mở đơn đăng ký)",
    start: "20261026", end: "20261105", // ngày kết thúc không tính (all-day)
    details: "Điền đơn đăng ký tuyển thành viên Phenikaa Esports Club Gen 8 – New Blood, New Era. Hạn chót: hết ngày 04/11/2026.",
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

$("#btnStart").addEventListener("click", () => goStep(2));
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

/* ---------- Gửi form ---------- */
function collectData() {
  const val = (n) => ($(`[name="${n}"]:checked`) || $(`[name="${n}"]`))?.value.trim() || "";
  const data = {
    hoTen: val("hoTen"),
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const scope = $(`.branch[data-branch="${currentBranch}"]`);
  if (!validateScope(scope)) return;

  const btn = $("#btnSubmit");
  const errEl = $("#submitError");
  errEl.textContent = "";
  btn.disabled = true;
  btn.textContent = "Đang gửi...";

  const data = collectData();
  try {
    if (CONFIG.SCRIPT_URL) {
      await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
      });
    } else {
      console.warn("[PEC] Chưa cấu hình SCRIPT_URL – dữ liệu chưa được lưu vào Google Sheet:", data);
      await new Promise((r) => setTimeout(r, 600));
    }
    $("#thanksName").textContent = data.hoTen;
    $("#thanksBan").textContent = data.ban;
    form.reset();
    goStep(4);
  } catch (err) {
    console.error(err);
    errEl.textContent = "Gửi đơn thất bại, vui lòng kiểm tra kết nối mạng và thử lại.";
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
