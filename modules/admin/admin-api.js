// ════════════════════════════════════════════════════════════════
//  modules/admin/admin-api.js — API calls dành cho Admin
// ════════════════════════════════════════════════════════════════

const AdminAPI = {

  _withAuth(payload) {
    return { ...payload, email: window._currentUser?.email || '' };
  },

  // ── Quản lý user ────────────────────────────────────────────
  getUsers() {
    return API.call(this._withAuth({ action: 'admin_getUsers' }));
  },

  assignRole(targetEmail, role) {
    return API.call(this._withAuth({ action: 'admin_assignRole', targetEmail, role }));
  },

  toggleUser(targetEmail, status) {
    return API.call(this._withAuth({ action: 'admin_toggleUser', targetEmail, status }));
  },

  // ✅ Bật/tắt quyền nhập/sửa đề cương cho từng user
  toggleFormAccess(targetEmail, canEditForm) {
    return API.call(this._withAuth({ action: 'admin_toggleFormAccess', targetEmail, canEditForm }));
  },

  // ── Quản lý _Register ───────────────────────────────────────
  getRegister() {
    return API.call(this._withAuth({ action: 'admin_getRegister' }));
  },

  addToRegister(name, email, msgv, role) {
    return API.call(this._withAuth({ action: 'admin_addRegister', name, email, msgv, role }));
  },

  removeFromRegister(email) {
    return API.call(this._withAuth({ action: 'admin_removeRegister', email }));
  },

  // ── Quản lý menu data ────────────────────────────────────────
  writeMenuData(sheetName, items) {
    return API.call(this._withAuth({ action: 'admin_writeMenuData', sheetName, items }));
  },
};

window.AdminAPI = AdminAPI;
