/* =========================================================
   CẤU HÌNH – chỉnh sửa tại đây
   ========================================================= */
const CONFIG = {
  // Dán URL Web App của Google Apps Script vào đây (xem HUONG_DAN.md)
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzg_bjdjLl2EDc7fy94j4VjlriikkFt0TwyLQYYVHxMS2nlVGXhlemsud7a6nnxDVbhmA/exec",

  // Thời gian mở / đóng đơn (giờ Việt Nam)
  OPEN_AT: new Date("2026-10-26T00:00:00+07:00"),
  CLOSE_AT: new Date("2026-11-05T23:59:59+07:00"),

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
    el.innerHTML = `<span class="pill pill--soon">Sắp mở đơn</span> Còn ${fmt(CONFIG.OPEN_AT - new Date())}`;
  } else if (st === "open") {
    el.innerHTML = `<span class="pill pill--open">Đang mở đơn</span> Đóng sau ${fmt(CONFIG.CLOSE_AT - new Date())}`;
  } else {
    el.innerHTML = `<span class="pill pill--closed">Đã đóng đơn</span> Cảm ơn bạn đã quan tâm!`;
  }
  $("#btnStart").disabled = CONFIG.ENFORCE_DATES && st !== "open";
}
renderStatus();
setInterval(renderStatus, 30000);

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
