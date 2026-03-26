// ════════════════════════════════════════════════════════════════
//  app.config.js — CẤU HÌNH TRUNG TÂM
//  Khi triển khai: chỉ cần sửa file này, không đụng file khác
// ════════════════════════════════════════════════════════════════

const APP_CONFIG = {

  // ── URL Hướng dẫn sử dụng ───────────────────────────────────
  HUONG_DAN_URL: "https://drive.google.com/file/d/1VybnuP5e97OBomLTRj3zwEUpCZ9vIUei/view?usp=sharing",

  // ── Google Apps Script URL ──────────────────────────────────
  GAS_URL: "https://script.google.com/macros/s/AKfycbw-_pw_fNtWOVaFpCoNq60LtZ6okJDxxA0xEH_tTx5jRz8-OPCnDrua5CqhUa-CvTDMOg/exec",

  // ── Thư viện docx (CDN fallback) ───────────────────────────
  DOCX_CDN_PRIMARY  : "https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js",
  DOCX_CDN_FALLBACK : "https://unpkg.com/docx@8.5.0/build/index.umd.js",

  // ── Thông tin đơn vị ────────────────────────────────────────
  UNIT_NAME    : "Khoa Công nghệ Hóa học",
  UNIT_SHORT   : "KCNHH",
  SCHOOL_NAME  : "Trường Đại học Công nghiệp Thực phẩm TP.HCM",
  SCHOOL_SHORT : "HUFI",

  // ── Giá trị mặc định ────────────────────────────────────────
  DEFAULTS: {
    trinhDo : "Đại học",
    loaiHP  : "Bắt buộc",
    hpCotLoi: "no",
  },

  STATIC_OPTIONS: {},

  // ── Timeout cho GAS calls ──────────────────────────────────
  GAS_TIMEOUT_DEFAULT : 20000,
  GAS_TIMEOUT_SAVE    : 30000,

  // ── Quy định cố định ────────────────────────────────────────
  QUY_DINH: {
    dkDat_ref    : "Khoản 4, điều 30 QĐ số 4959/QĐ-DCT V/v điều chỉnh nội dung 1 số điều trong Quy chế đào tạo theo hệ thống tín chỉ.",
    dkDat_thuong : "Người học được công nhận đạt học phần khi đạt điểm tổng kết học phần từ 4,0 điểm trở lên (Theo thang 10).",
    dkDat_cotloi : "Người học được công nhận đạt học phần cốt lõi khi đáp ứng đồng thời 2 điều kiện: Đạt điểm tổng kết học phần từ 4,0 điểm trở lên (theo thang 10) và từng CLO đạt 4,0 điểm trở lên (theo thang 10).",
  },

  // ════════════════════════════════════════════════════════════
  //  RBAC — Nhãn hiển thị cho từng role (dùng trong UI)
  //  Logic phân quyền thực tế nằm trong js/rbac.js
  // ════════════════════════════════════════════════════════════
  ROLE_LABELS: {
    Admin      : '⚙ Quản trị viên',
    GiangVien  : '👨‍🏫 Giảng viên',
    ThuKy      : '📋 Thư ký',
  },

};

window.APP_CONFIG = APP_CONFIG;
