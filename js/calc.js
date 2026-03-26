// ════════════════════════════════════════════════════════════════
//  calc.js — Tính toán tự động cho các field
//  Khi công thức thay đổi: chỉ sửa file này.
// ════════════════════════════════════════════════════════════════

const Calc = {

  // ── Tính tín chỉ & giờ học từ tcLT và tcTH ──────────────────
  //  X = TC Lý thuyết, Y = TC Thực hành
  //  Công thức theo quy định hiện hành HUFI:
  //    Tiết LT     = X × 15
  //    Tiết TN/TH  = Y × 30
  //    Giờ tự học  = X×35 + Y×20
  //    ECTS        = X×1.73 + Y×1.64
  calcTC() {
    const lt = parseFloat(document.getElementById('tcLT')?.value) || 0;
    const th = parseFloat(document.getElementById('tcTH')?.value) || 0;

    const tong      = lt + th;
    const tietLT    = lt * 15;
    const tietTNTH  = th * 30;
    const gioTuHoc  = lt * 35 + th * 20;
    const ects      = +(lt * 1.73 + th * 1.64).toFixed(2);
    const hasInput  = lt > 0 || th > 0;

    // Tổng TC (readonly)
    const tcTongEl = document.getElementById('tcTong');
    if (tcTongEl && tong > 0) tcTongEl.value = tong;

    // Helper: set display + hidden value
    const setCalc = (id, val, unit) => {
      const display = document.getElementById(id);
      const hidden  = document.getElementById(id + '_val');
      if (display) display.textContent = hasInput ? (val || 0) + ' ' + unit : '—';
      if (hidden)  hidden.value        = hasInput ? (val || 0) : '';
    };

    setCalc('tietLT',   tietLT,   'tiết');
    setCalc('tietTNTH', tietTNTH, 'tiết');
    setCalc('gioTuHoc', gioTuHoc, 'giờ');

    const ectsDisplay = document.getElementById('ectsDisplay');
    const ectsHidden  = document.getElementById('ects');
    if (ectsDisplay) ectsDisplay.textContent = (lt || th) ? ects : '—';
    if (ectsHidden)  ectsHidden.value        = (lt || th) ? ects : '';
  },

  // ── Tính tự học cho 1 dòng bảng Chương ──────────────────────
  //  Tiết → TC: LT/15, TH/30
  //  Giờ tự học = tcLT×35 + tcTH×20
  calcChuongRow(el) {
    const tr   = el.closest('tr');
    const tds  = tr.querySelectorAll('input[type=number]');
    // tds: [0]=Số tiết LT, [1]=Số tiết TH, [2]=Tự học(readonly), [3]=Trọng số
    const lt   = parseFloat(tds[0]?.value) || 0;
    const th   = parseFloat(tds[1]?.value) || 0;
    const tuHoc = (lt / 15) * 35 + (th / 30) * 20;
    if (tds[2]) tds[2].value = tuHoc ? +tuHoc.toFixed(1) : '';
  },

  // ── Cập nhật dòng tổng kết của bảng Chương ──────────────────
  updateChuongSum() {
    const tbody = document.getElementById('chuongBody');
    if (!tbody) return;
    let sumLT = 0, sumTH = 0, sumTuHoc = 0, sumTS = 0;

    tbody.querySelectorAll('tr').forEach(tr => {
      const inputs = tr.querySelectorAll('input[type=number]');
      sumLT    += parseFloat(inputs[0]?.value) || 0;
      sumTH    += parseFloat(inputs[1]?.value) || 0;
      sumTuHoc += parseFloat(inputs[2]?.value) || 0;
      sumTS    += parseFloat(inputs[3]?.value) || 0;
    });

    const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v || 0; };
    s('sumLT',      sumLT);
    s('sumTH',      sumTH);
    s('sumTuHoc',   sumTuHoc ? Math.round(sumTuHoc) : 0);
    s('sumTrongSo', sumTS);
  },

  // ── Cập nhật hiển thị text Quy định ─────────────────────────
  updateQuyDinh() {
    const el       = document.getElementById('quyDinhDK');
    const isCotLoi = document.getElementById('hpCotLoi')?.value === 'yes';
    const cfg      = APP_CONFIG.QUY_DINH;
    if (!el) return;

    if (!isCotLoi) {
      // Không phải cốt lõi → chỉ hiện điều kiện thường
      el.innerHTML = '<b>Điều kiện đạt học phần:</b> ' + cfg.dkDat_ref + '<br>- ' + cfg.dkDat_thuong;
    } else {
      // Cốt lõi → hiện cả 2
      el.innerHTML = '<b>Điều kiện đạt học phần:</b> ' + cfg.dkDat_ref
        + '<br>- ' + cfg.dkDat_thuong
        + '<br>- ' + cfg.dkDat_cotloi;
    }
  },

  // ── Cập nhật đoạn Hướng dẫn thực hiện (section 9) ───────────
  updateHuongDan() {
    const el      = document.getElementById('hdText');
    if (!el) return;
    const trinhDo  = document.getElementById('trinhDo')?.value   || '<trình độ>';
    const nganh    = document.getElementById('nganhDT')?.value   || '<tên ngành>';
    const khoa     = document.getElementById('khoaDT')?.value    || '<Khóa>';
    const hk       = document.getElementById('hkApDung')?.value  || '<Học kỳ>';
    const namHoc   = document.getElementById('namHocApDung')?.value || '<Năm học>';
    const thoiDiem = (hk && namHoc) ? hk + ' năm học ' + namHoc : (hk || namHoc || '<Thời điểm>');

    el.innerHTML = `
      <b>- Phạm vi áp dụng:</b> Đề cương này được áp dụng cho chương trình đào tạo
      <strong>${trinhDo}</strong> ngành <strong>${nganh}</strong>,
      từ <strong>${khoa}</strong>, năm học <strong>${thoiDiem}</strong>;<br>
      <b>- Giảng viên:</b> sử dụng đề cương này để làm cơ sở cho việc chuẩn bị bài giảng,
      lên kế hoạch giảng dạy và đánh giá kết quả học tập của người học;<br>
      <b>- Lưu ý:</b> Trước khi giảng dạy, giảng viên cần nêu rõ các nội dung chính
      của đề cương học phần cho người học;<br>
      <b>- Người học:</b> sử dụng đề cương này làm cơ sở để nắm được thông tin chi tiết
      về học phần, từ đó xác định phương pháp học tập phù hợp.
    `;
  },

  // ── Sync ngành → hidden fields ──────────────────────────────
  syncNganh(val) {
    const el = document.getElementById('phamViNganh');
    if (el)  el.value = val;
    const disp = document.getElementById('phamViNganhDisplay');
    if (disp) disp.textContent = val || '— (lấy từ Ngành đào tạo)';
  },

  // ── Toggle hiện/ẩn field Loại ĐK theo HP cốt lõi ────────────
  toggleLoaiDK() {
    const isCotLoi = document.getElementById('hpCotLoi')?.value === 'yes';
    const field    = document.getElementById('fieldLoaiDK');
    const loaiDK   = document.getElementById('loaiDK');
    if (!field) return;

    if (isCotLoi) {
      // Có cốt lõi → hiện field, tự động chọn option thứ 2
      field.style.display = '';
      if (loaiDK) loaiDK.value = 'cotloi';
    } else {
      // Không cốt lõi → ẩn field, reset về thuong
      field.style.display = 'none';
      if (loaiDK) loaiDK.value = 'thuong';
    }
    this.updateQuyDinh();
  },
  autoFillHocphan(tenViet) {
    const map  = window._hocphanMap || {};
    const info = map[tenViet.trim()];
    if (!info) return;
    if (info.tenAnh)   document.getElementById('tenAnh').value   = info.tenAnh;
    if (info.maHP)     document.getElementById('maHP').value     = info.maHP;
    if (info.maTuQuan) document.getElementById('maTuQuan').value = info.maTuQuan;
  },
};

window.Calc = Calc;

// ── Shortcut toàn cục cho oninput= ──────────────────────────────
function calcTC()               { Calc.calcTC()            }
function calcChuongRow(el)      { Calc.calcChuongRow(el); Calc.updateChuongSum() }
function updateChuongSum()      { Calc.updateChuongSum()   }
function updateQuyDinh()        { Calc.updateQuyDinh()     }
function updateHuongDan()       { Calc.updateHuongDan()    }
function syncNganh(val)         { Calc.syncNganh(val)      }
function toggleLoaiDK()         { Calc.toggleLoaiDK()     }
function autoFillHocphan(val)   { Calc.autoFillHocphan(val)}

// togglePheduyet — không còn logic exclusive, cả 2 checkbox độc lập nhau
function togglePheduyet() {
  // Không làm gì — 2 checkbox pdLanDau & pdCapNhat hoạt động độc lập,
  // fieldNgayPD và fieldNgayCapNhat luôn hiển thị (không ẩn theo điều kiện).
}
