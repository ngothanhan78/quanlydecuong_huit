// ════════════════════════════════════════════════════════════════
//  modules/admin/admin.js — UI quản trị
//  Tab: Users | Register | Menu Data
// ════════════════════════════════════════════════════════════════

const AdminPanel = {

  _currentTab: 'users',

  open() {
    App.show('admin');
    this.switchTab('users');
  },

  switchTab(tab) {
    this._currentTab = tab;
    document.querySelectorAll('.admin-tab').forEach(el =>
      el.classList.toggle('active', el.dataset.tab === tab));
    document.querySelectorAll('.admin-panel').forEach(el =>
      el.classList.toggle('active', el.id === 'adminPanel-' + tab));

    if (tab === 'users')    this.loadUsers();
    if (tab === 'register') this.loadRegister();
    if (tab === 'menudata') this.loadMenuData();
  },

  // ════════════════════════════════════════════════════════════
  //  TAB 1: Quản lý User
  // ════════════════════════════════════════════════════════════
  async loadUsers() {
    this._setTableState('usersBody', 'loading');
    const res = await AdminAPI.getUsers();
    if (!res || !res.success) {
      this._setTableState('usersBody', 'error', res?.message);
      return;
    }
    this._renderUsers(res.users || []);
  },

  _renderUsers(users) {
    const tbody = document.getElementById('usersBody');
    if (!tbody) return;
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted)">Chưa có tài khoản nào</td></tr>';
      return;
    }

    const roleLabels   = { Admin: '⚙ Admin', GiangVien: 'Giảng viên', ThuKy: 'Thư ký' };
    const statusLabels = { Active: '✅ Active', Disabled: '🚫 Disabled' };
    const isAdmin      = email => email?.toLowerCase() === (window._currentUser?.email || '').toLowerCase();

    tbody.innerHTML = users.map(u => {
      const isMainAdmin = isAdmin(u.email);
      // Toggle nhập/sửa: Admin luôn bật và không cho tắt
      const toggleCell = u.role === 'Admin'
        ? `<span class="form-access-on" title="Admin luôn có quyền này">✅ Luôn bật</span>`
        : `<label class="toggle-switch" title="${u.canEditForm ? 'Tắt quyền nhập/sửa' : 'Bật quyền nhập/sửa'}">
             <input type="checkbox" ${u.canEditForm ? 'checked' : ''}
               onchange="AdminPanel.toggleFormAccess('${u.email}', this.checked)">
             <span class="toggle-slider"></span>
           </label>`;

      return `<tr>
        <td>${u.name}</td>
        <td style="font-size:12px;color:var(--muted)">${u.email}</td>
        <td>
          <select class="admin-select" onchange="AdminPanel.changeRole('${u.email}', this.value)"
            ${isMainAdmin ? 'disabled title="Không thể đổi role Admin chính"' : ''}>
            ${['Admin','GiangVien','ThuKy'].map(r =>
              `<option value="${r}" ${u.role === r ? 'selected' : ''}>${roleLabels[r]}</option>`
            ).join('')}
          </select>
        </td>
        <td>${toggleCell}</td>
        <td>
          <span class="status-pill ${u.status === 'Active' ? 'active' : 'disabled'}">
            ${statusLabels[u.status] || u.status}
          </span>
        </td>
        <td>
          ${isMainAdmin
            ? `<span style="font-size:11px;color:var(--muted)">—</span>`
            : (u.status === 'Active'
              ? `<button class="admin-btn danger-sm" onclick="AdminPanel.toggleUser('${u.email}','Disabled')">Vô hiệu hóa</button>`
              : `<button class="admin-btn" onclick="AdminPanel.toggleUser('${u.email}','Active')">Kích hoạt</button>`)
          }
        </td>
      </tr>`;
    }).join('');
  },

  async changeRole(email, role) {
    const res = await AdminAPI.assignRole(email, role);
    if (res && res.success) { UI.toast('✅ ' + res.message, 'ok'); this.loadUsers(); }
    else UI.toast('❌ ' + (res?.message || 'Lỗi'), 'err');
  },

  async toggleUser(email, status) {
    const msg = status === 'Disabled'
      ? `Vô hiệu hóa tài khoản "${email}"?`
      : `Kích hoạt lại tài khoản "${email}"?`;
    if (!confirm(msg)) return;
    const res = await AdminAPI.toggleUser(email, status);
    if (res && res.success) { UI.toast('✅ ' + res.message, 'ok'); this.loadUsers(); }
    else UI.toast('❌ ' + (res?.message || 'Lỗi'), 'err');
  },

  // ✅ Toggle quyền nhập/sửa đề cương cho từng user
  async toggleFormAccess(email, canEditForm) {
    const res = await AdminAPI.toggleFormAccess(email, canEditForm);
    if (res && res.success) UI.toast('✅ ' + res.message, 'ok');
    else {
      UI.toast('❌ ' + (res?.message || 'Lỗi'), 'err');
      // Reload để revert trạng thái checkbox nếu lỗi
      this.loadUsers();
    }
  },

  // ════════════════════════════════════════════════════════════
  //  TAB 2: Danh sách đăng ký (_Register)
  // ════════════════════════════════════════════════════════════
  async loadRegister() {
    this._setTableState('registerBody', 'loading');
    const res = await AdminAPI.getRegister();
    if (!res || !res.success) {
      this._setTableState('registerBody', 'error', res?.message);
      return;
    }
    this._renderRegister(res.list || []);
  },

  _renderRegister(list) {
    const tbody = document.getElementById('registerBody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted)">Danh sách trống</td></tr>';
      return;
    }
    tbody.innerHTML = list.map((r, i) => `
      <tr>
        <td style="text-align:center;color:var(--muted)">${i+1}</td>
        <td>${r.name}</td>
        <td style="font-size:12px">${r.email}</td>
        <td>${r.msgv}</td>
        <td>${r.role || 'GiangVien'}</td>
        <td>
          <button class="admin-btn danger-sm" onclick="AdminPanel.removeRegister('${r.email}','${r.name}')">Xóa</button>
        </td>
      </tr>
    `).join('');
  },

  async addRegister() {
    const name  = document.getElementById('regName')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim().toLowerCase();
    const msgv  = document.getElementById('regMsgv')?.value.trim();
    const role  = document.getElementById('regRole')?.value || 'GiangVien';

    if (!name || !email || !msgv) return UI.toast('Vui lòng nhập đủ thông tin.', 'err');
    if (!email.includes('@'))     return UI.toast('Email không hợp lệ.', 'err');

    const res = await AdminAPI.addToRegister(name, email, msgv, role);
    if (res && res.success) {
      UI.toast('✅ ' + res.message, 'ok');
      ['regName','regEmail','regMsgv'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      this.loadRegister();
    } else {
      UI.toast('❌ ' + (res?.message || 'Lỗi'), 'err');
    }
  },

  async removeRegister(email, name) {
    if (!confirm(`Xóa "${name}" (${email}) khỏi danh sách đăng ký?`)) return;
    const res = await AdminAPI.removeFromRegister(email);
    if (res && res.success) { UI.toast('✅ ' + res.message, 'ok'); this.loadRegister(); }
    else UI.toast('❌ ' + (res?.message || 'Lỗi'), 'err');
  },

  // ════════════════════════════════════════════════════════════
  //  TAB 3: Quản lý Menu Data
  // ════════════════════════════════════════════════════════════
  _menuSheets: [
    { key: 'TrinhDo',    label: 'Trình độ đào tạo' },
    { key: 'KhoiKT',     label: 'Khối kiến thức' },
    { key: 'LoaiHP',     label: 'Loại học phần' },
    { key: 'HocKy',      label: 'Học kỳ' },
    { key: 'KhoaDT',     label: 'Khóa đào tạo' },
    { key: 'HinhThucGD', label: 'Hình thức giảng dạy' },
    { key: 'PPGD',       label: 'PP giảng dạy' },
    { key: 'PPHT',       label: 'PP học tập' },
    { key: 'PPDG',       label: 'PP đánh giá' },
    { key: 'HoatDongDG', label: 'Hoạt động đánh giá' },
  ],

  _selectedSheet: null,

  loadMenuData() {
    const container = document.getElementById('menuSheetList');
    if (!container) return;
    container.innerHTML = this._menuSheets.map(s => `
      <button class="sheet-pill" data-key="${s.key}" onclick="AdminPanel.selectMenuSheet('${s.key}','${s.label}')">
        ${s.label}
      </button>
    `).join('');
    document.getElementById('menuEditor').style.display = 'none';
  },

  selectMenuSheet(key, label) {
    this._selectedSheet = key;
    document.querySelectorAll('.sheet-pill').forEach(el =>
      el.classList.toggle('active', el.dataset.key === key));
    const editor = document.getElementById('menuEditor');
    if (editor) {
      editor.style.display = 'block';
      document.getElementById('menuEditorTitle').textContent = 'Chỉnh sửa: ' + label;
    }
    API.getMenuData().then(res => {
      if (!res || !res.success) return;
      const keyMap = {
        TrinhDo    : 'trinhDo',    KhoiKT  : 'khoiKT',
        LoaiHP     : 'loaiHP',     HocKy   : 'hocKy',
        KhoaDT     : 'khoaDT',     HinhThucGD: 'hinhThucGD',
        PPGD       : 'ppgd',       PPHT    : 'ppht',
        PPDG       : 'ppdg',       HoatDongDG: 'hdDanhGia',
      };
      const items = (keyMap[key] && res.data[keyMap[key]]) || [];
      document.getElementById('menuTextarea').value = items.join('\n');
    });
  },

  async saveMenuSheet() {
    if (!this._selectedSheet) return UI.toast('Chưa chọn sheet.', 'err');
    const raw   = document.getElementById('menuTextarea')?.value || '';
    const items = raw.split('\n').map(s => s.trim()).filter(Boolean);
    if (!items.length) return UI.toast('Danh sách trống, không lưu.', 'err');

    const res = await AdminAPI.writeMenuData(this._selectedSheet, items);
    if (res && res.success) {
      UI.toast('✅ ' + res.message, 'ok');
      await loadMenuData();
    } else {
      UI.toast('❌ ' + (res?.message || 'Lỗi'), 'err');
    }
  },

  _setTableState(tbodyId, state, msg) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const colspan = tbodyId === 'usersBody' ? 6 : 6;
    if (state === 'loading')
      tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center;color:var(--muted);padding:20px">⏳ Đang tải...</td></tr>`;
    else if (state === 'error')
      tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center;color:var(--danger);padding:20px">❌ ${msg || 'Lỗi'}</td></tr>`;
  },
};

window.AdminPanel = AdminPanel;

function openAdmin()          { AdminPanel.open()            }
function adminSwitchTab(t)    { AdminPanel.switchTab(t)      }
function adminAddRegister()   { AdminPanel.addRegister()     }
function adminSaveMenuSheet() { AdminPanel.saveMenuSheet()   }
