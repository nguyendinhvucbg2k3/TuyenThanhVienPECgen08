/**
 * PEC GEN 8 – Nhận đơn đăng ký từ website và ghi vào Google Sheet
 * Cách dùng: xem file HUONG_DAN.md
 */

// ---- Câu hỏi chung (giống Phần 1 của Google Form) ----
const COMMON = [
  ['hoTen', 'Họ và tên của bạn ?'],
  ['email', 'Email ( Chú ý viết đúng để nhận mail thông báo) ?'],
  ['sdt', 'Số điện thoại liên hệ (Ưu tiên SĐT sử dụng Zalo) ?'],
  ['facebook', 'Link Facebook cá nhân ?'],
  ['gioiTinh', 'Giới tính của bạn ?'],
  ['khoa', 'Khóa bạn đang theo học ?'],
  ['ban', 'Ban bạn muốn ứng tuyển ?'],
];

// ---- Câu hỏi theo từng ban ----
const BRANCHES = {
  vh: {
    sheet: 'Ban Vận hành',
    questions: [
      ['vh_q1', 'Theo bạn, để một giải đấu Esports diễn ra trơn chu cần phải chuẩn bị như thế nào ?'],
      ['vh_q2', 'Giả sử trong tình huống sau, bạn là BTC của một giải đấu Esports sinh viên, trong quá trình thi đấu, tuyển thủ hai đội xảy ra mâu thuẫn không đáng có, là người phải đứng ra giải quyết vấn đề trên, bạn sẽ làm gì ?'],
    ],
  },
  tt: {
    sheet: 'Ban Truyền thông & Thiết kế',
    questions: [
      ['tt_q1', 'Bạn đã từng tham gia công việc sáng tạo nội dung trên các nền tảng MXH chưa ?'],
      ['tt_q2', 'Bạn có hay đọc, theo dõi những thông tin Esports không ?'],
      ['tt_q3', 'Giả sử một ngày, bạn cạn kiệt ý tưởng, không biết phải đăng bài viết như thế nào, bạn sẽ làm gì? (Câu hỏi dành cho tiểu ban Nội dung)'],
      ['tt_q4', 'Bạn đã làm việc trên phần mềm chỉnh sửa ảnh, video, giọng nói nào chưa? (Câu hỏi dành cho tiểu ban Thiết Kế)'],
    ],
  },
  cd: {
    sheet: 'Ban Cộng đồng & Đối ngoại',
    questions: [
      ['cd_q1', 'Nếu như bạn là một thành viên của ban Cộng đồng, ngoài những nhiệm vụ được giao thì bạn có ý tưởng gì để phát triển một cộng đồng lớn mạnh ?'],
      ['cd_q2', 'Theo bạn, một Group Esports hay một Kênh Discord Esports cần những gì để thu được người tham gia và theo dõi ?'],
    ],
  },
};

const MAIN_SHEET = 'Câu trả lời biểu mẫu';
const TIME_COL = ['timestamp', 'Dấu thời gian'];

/** Cột của sheet tổng: giống hệt sheet kết quả Google Form */
function mainColumns() {
  let cols = [TIME_COL].concat(COMMON);
  Object.keys(BRANCHES).forEach(k => (cols = cols.concat(BRANCHES[k].questions)));
  return cols;
}
function branchColumns(key) {
  return [TIME_COL].concat(COMMON, BRANCHES[key].questions);
}

/** Chạy 1 lần để tạo & căn chỉnh các sheet */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone('Asia/Ho_Chi_Minh');
  formatSheet(getOrCreate(ss, MAIN_SHEET), mainColumns());
  Object.keys(BRANCHES).forEach(k => formatSheet(getOrCreate(ss, BRANCHES[k].sheet), branchColumns(k)));
  // Xoá "Trang tính1" mặc định nếu trống
  const def = ss.getSheetByName('Trang tính1') || ss.getSheetByName('Sheet1');
  if (def && def.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(def);
  ss.setActiveSheet(ss.getSheetByName(MAIN_SHEET));
  ss.moveActiveSheet(1);
}

function getOrCreate(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function formatSheet(sh, cols) {
  const n = cols.length;
  const header = sh.getRange(1, 1, 1, n);
  header.setValues([cols.map(c => c[1])])
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackground('#ff6a00')
    .setWrap(true)
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('center');
  sh.setRowHeight(1, 70);
  sh.setFrozenRows(1);
  sh.setFrozenColumns(2);

  cols.forEach((c, i) => {
    const col = i + 1;
    let w = 320; // câu trả lời dài
    if (c[0] === 'timestamp') w = 150;
    else if (['sdt', 'gioiTinh', 'khoa', 'tt_q1', 'tt_q2'].includes(c[0])) w = 140;
    else if (c[0] === 'hoTen') w = 190;
    else if (['email', 'facebook', 'ban', 'tt_q4'].includes(c[0])) w = 230;
    sh.setColumnWidth(col, w);
  });

  // Định dạng vùng dữ liệu
  const maxRows = Math.max(sh.getMaxRows(), 1000);
  if (sh.getMaxRows() < maxRows) sh.insertRowsAfter(sh.getMaxRows(), maxRows - sh.getMaxRows());
  const body = sh.getRange(2, 1, maxRows - 1, n);
  body.setWrap(true).setVerticalAlignment('top').setNumberFormat('@'); // '@' giữ số 0 đầu SĐT
  sh.getRange(2, 1, maxRows - 1, 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');

  // Xoá cột thừa
  if (sh.getMaxColumns() > n) sh.deleteColumns(n + 1, sh.getMaxColumns() - n);

  // Dải màu xen kẽ
  sh.getBandings().forEach(b => b.remove());
  sh.getRange(1, 1, maxRows, n)
    .applyRowBanding(SpreadsheetApp.BandingTheme.ORANGE, true, false)
    .setHeaderRowColor('#ff6a00')
    .setFirstRowColor('#ffffff')
    .setSecondRowColor('#fff3e8');
}

function writeRow(sh, cols, data, now) {
  const row = cols.map(c => {
    if (c[0] === 'timestamp') return now;
    let v = data[c[0]] == null ? '' : String(data[c[0]]);
    if (/^[=+\-@]/.test(v)) v = "'" + v; // chống chèn công thức
    return v;
  });
  const r = sh.getLastRow() + 1;
  sh.getRange(r, 1, 1, row.length).setValues([row]);
}

/** Nhận dữ liệu từ website */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const now = new Date();

    writeRow(getOrCreate(ss, MAIN_SHEET), mainColumns(), data, now);

    const key = Object.keys(BRANCHES).find(k => BRANCHES[k].questions.some(q => data[q[0]]));
    if (key) writeRow(getOrCreate(ss, BRANCHES[key].sheet), branchColumns(key), data, now);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, message: 'PEC Gen 8 API đang hoạt động' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
