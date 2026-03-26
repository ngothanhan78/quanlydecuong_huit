// ════════════════════════════════════════════════════════════════
//  dynamic-rows.js — Quản lý bảng động (thêm / xóa dòng)
//  Khi thêm cột mới cho 1 bảng: chỉ sửa hàm addXxx tương ứng.
//  Template HTML của mỗi dòng nằm ở đây, không nằm trong index.html
// ════════════════════════════════════════════════════════════════

const DynRows = {

  // ── Helper chung ─────────────────────────────────────────────
  _add(tbodyId, cellsFn) {
    const tb = document.getElementById(tbodyId);
    const tr = document.createElement('tr');
    tr.innerHTML = cellsFn(tb.rows.length + 1);
    tb.appendChild(tr);
  },

  del(btn) {
    btn.closest('tr').remove();
    // Cập nhật tổng nếu là bảng chương
    if (document.getElementById('chuongBody')) Calc.updateChuongSum();
  },

  // ── Bảng Giảng viên ─────────────────────────────────────────
  addGV() {
    this._add('gvBody', idx => `
      <td class="col-center">${idx}</td>
      <td class="col-left">
        <input type="text" class="gv-ten" placeholder="Họ và tên" list="dl-gv" autocomplete="off"
          oninput="DynRows.onGVTenInput(this)"/>
      </td>
      <td class="col-right"><input type="email" class="gv-email" placeholder="email@..." readonly style="background:#f8fafc;color:var(--accent)"/></td>
      <td class="col-right"><input type="text" class="gv-donvi" placeholder="Tự động điền" readonly style="background:#f8fafc;color:var(--accent)"/></td>
      <td><button class="btn-del" onclick="DynRows.del(this)">✕</button></td>
    `);
  },

  // ── Auto-lookup email + đơn vị khi nhập tên GV ───────────────
  onGVTenInput(inputEl) {
    const ten = (inputEl.value || '').trim();
    const tr  = inputEl.closest('tr');
    if (!tr) return;
    const emailEl = tr.querySelector('.gv-email');
    const donviEl = tr.querySelector('.gv-donvi');
    if (!emailEl || !donviEl) return;
    const map = window._giangVienMap || {};
    if (map[ten]) {
      emailEl.value = map[ten].email || '';
      donviEl.value = map[ten].donvi || '';
    } else {
      emailEl.value = '';
      donviEl.value = '';
    }
  },

  // ── Bảng CLO ────────────────────────────────────────────────
  addCLO() {
    // Dùng options từ GAS nếu đã load, fallback về rỗng (chờ GAS load)
    const ploOpts = window._ploOptions || '<option value="">PLO</option>';

    this._add('cloBody', idx => `
      <td class="col-center">
        <select style="width:75px">${ploOpts}</select>
      </td>
      <td class="col-center">
        <input type="text" placeholder="CLO${idx}" style="width:65px"
          oninput="DynRows.validateCLO(this)"/>
      </td>
      <td class="col-left"><textarea placeholder="Người học có khả năng..."></textarea></td>
      <td class="col-center"><input type="text" placeholder="C3" style="width:60px"/></td>
      <td><button class="btn-del" onclick="DynRows.del(this)">✕</button></td>
    `);
  },

  validateCLO(el) {
    if (/[,:]/.test(el.value)) {
      el.value = el.value.replace(/[,:]/g, '');
      el.style.borderColor = 'var(--danger)';
      el.title = 'Chỉ được nhập 1 CLO, không dùng dấu phẩy hoặc dấu hai chấm!';
      UI.toast('⚠️ Mỗi dòng chỉ được nhập 1 CLO — không dùng dấu phẩy hoặc dấu hai chấm!', 'err');
      setTimeout(() => { el.style.borderColor = ''; el.title = ''; }, 2500);
    }
  },

  // ── Bảng Chương (5.1) ────────────────────────────────────────
  addChuong() {
    this._add('chuongBody', idx => `
      <td class="col-center">${idx}</td>
      <td class="col-left"><input type="text" placeholder="Tên chương/bài"/></td>
      <td class="col-center"><input type="text" placeholder="CLO1, CLO2"/></td>
      <td class="col-center">
        <input type="number" min="0" style="width:55px"
          oninput="calcChuongRow(this)" placeholder="0"/>
      </td>
      <td class="col-center">
        <input type="number" min="0" style="width:55px"
          oninput="calcChuongRow(this)" placeholder="0"/>
      </td>
      <td class="col-center">
        <input type="number" min="0" style="width:55px;background:#f1f5f9;color:var(--accent);font-weight:700"
          readonly placeholder="0"/>
      </td>
      <td class="col-center">
        <input type="number" min="0" style="width:55px"
          oninput="updateChuongSum()" placeholder="0"/>
      </td>
      <td><button class="btn-del" onclick="DynRows.del(this)">✕</button></td>
    `);
  },

  // ── Bảng Nội dung chi tiết (5.2) ────────────────────────────
  addChiTiet() {
    this._add('chiTietBody', _ => `
      <td class="col-left">
        <textarea placeholder="Chương 1. xx&#10;1.1. xx..."></textarea>
      </td>
      <td class="col-left">
        <textarea placeholder="Đọc tài liệu [1] trang..."></textarea>
      </td>
      <td><button class="btn-del" onclick="DynRows.del(this)">✕</button></td>
    `);
  },

  // ── Bảng Phương pháp (6) ────────────────────────────────────
  addPP() {
    this._add('ppBody', _ => `
      <td class="col-left">
        <input type="text" placeholder="Thuyết trình" list="dl-ppgd" autocomplete="off"/>
      </td>
      <td class="col-left">
        <input type="text" placeholder="Đọc trước tài liệu" list="dl-ppht" autocomplete="off"/>
      </td>
      <td class="col-center"><input type="text" placeholder="CLO1"/></td>
      <td class="col-center"><input type="text" placeholder="CLO2"/></td>
      <td class="col-center"><input type="text" placeholder="CLO3"/></td>
      <td class="col-center"><input type="text" placeholder="CLO4"/></td>
      <td><button class="btn-del" onclick="DynRows.del(this)">✕</button></td>
    `);
  },

  // ── Bảng Đánh giá (7) ───────────────────────────────────────
  addDG() {
    // Dùng options từ GAS nếu đã load, fallback về rỗng (chờ GAS load)
    const hdOpts = (window._hdDanhGia || [])
      .map(v => `<option>${v}</option>`).join('');

    this._add('dgBody', _ => `
      <td class="col-left">
        <select><option value="">-- Chọn --</option>${hdOpts}</select>
      </td>
      <td class="col-left">
        <input type="text" placeholder="Chọn PP..." list="dl-ppdg" autocomplete="off"/>
      </td>
      <td class="col-center"><input type="text" placeholder="Tuần 8"/></td>
      <td class="col-center"><input type="text" placeholder="CLO1, CLO2"/></td>
      <td class="col-center">
        <input type="number" placeholder="%" style="width:55px"/>
      </td>
      <td class="col-left">
        <input type="text" placeholder="Theo đáp án / Rubrics số..."/>
      </td>
      <td><button class="btn-del" onclick="DynRows.del(this)">✕</button></td>
    `);
  },

  // ── Nguồn học liệu (8.1, 8.2, 8.3) ─────────────────────────
  addGT() {
    this._add('gtBody', idx => `
      <td>[${idx}]</td>
      <td><input type="text" placeholder="Tên tác giả, Tên giáo trình, Tên nhà xuất bản, Năm xuất bản"/></td>
      <td><button class="btn-del" onclick="DynRows.del(this)">✕</button></td>
    `);
  },

  addTL() {
    this._add('tlBody', idx => `
      <td>[${idx}]</td>
      <td><input type="text" placeholder="Tên tác giả, Tên tài liệu tham khảo, Tên nhà xuất bản, Năm xuất bản"/></td>
      <td><button class="btn-del" onclick="DynRows.del(this)">✕</button></td>
    `);
  },

  addPM() {
    this._add('pmBody', idx => `
      <td>[${idx}]</td>
      <td><input type="text" placeholder="Tên phần mềm"/></td>
      <td><button class="btn-del" onclick="DynRows.del(this)">✕</button></td>
    `);
  },

  // ── Init mặc định khi mở form mới ───────────────────────────
  initDefault() {
    this.addGV(); this.addGV();
    this.addCLO(); this.addCLO(); this.addCLO();
    this.addChuong(); this.addChuong();
    this.addChiTiet();
    this.addPP();
    this.addDG(); this.addDG();
    this.addGT(); this.addTL();
  },

  // ── Clear tất cả bảng ────────────────────────────────────────
  clearAll() {
    ['gvBody','cloBody','chuongBody','chiTietBody','ppBody','dgBody','gtBody','tlBody','pmBody']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
      });
  },
};

window.DynRows = DynRows;

// ── Shortcut toàn cục cho onclick= ──────────────────────────────
function addGV()      { DynRows.addGV()      }
function addCLO()     { DynRows.addCLO()     }
function addChuong()  { DynRows.addChuong()  }
function addChiTiet() { DynRows.addChiTiet() }
function addPP()      { DynRows.addPP()      }
function addDG()      { DynRows.addDG()      }
function addGT()      { DynRows.addGT()      }
function addTL()      { DynRows.addTL()      }
function addPM()      { DynRows.addPM()      }
function delRow(btn)  { DynRows.del(btn)     }
function validateCLOInput(el) { DynRows.validateCLO(el) }
