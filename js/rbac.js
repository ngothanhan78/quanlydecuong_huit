// ════════════════════════════════════════════════════════════════
//  rbac.js — Role-Based Access Control (Frontend)
//
//  CÁCH THÊM MODULE MỚI:
//  1. Thêm entry vào PERMISSIONS bên dưới
//  2. Đăng ký module trong App.modules (app.js)
//  3. Backend tự bảo vệ qua _requireRole() trong config.gs
// ════════════════════════════════════════════════════════════════

const RBAC = (() => {

  // ── Định nghĩa quyền XEM theo module ────────────────────────
  // canWrite của module 'form' được xử lý riêng bên dưới
  // vì nó phụ thuộc vào flag canEditForm của từng user
  const PERMISSIONS = {
    dashboard : { roles: ['Admin', 'GiangVien', 'ThuKy'] },
    library   : { roles: ['Admin', 'GiangVien', 'ThuKy'] },
    form      : { roles: ['Admin', 'GiangVien', 'ThuKy'] }, // Xem library OK, nhưng nút nhập/sửa kiểm tra canWrite
    admin     : { roles: ['Admin'] },
  };

  function currentUser() {
    try { return JSON.parse(sessionStorage.getItem('dcUser')) || null; }
    catch { return null; }
  }

  function role() {
    return currentUser()?.role || 'GiangVien';
  }

  function hasRole(requiredRole) {
    return role() === requiredRole;
  }

  // ── Kiểm tra quyền XEM module ───────────────────────────────
  function canAccess(moduleName) {
    const perm = PERMISSIONS[moduleName];
    if (!perm) return false;
    return perm.roles.includes(role());
  }

  // ── Kiểm tra quyền NHẬP/SỬA đề cương ───────────────────────
  // Logic: Admin luôn có quyền.
  //        Các role khác phụ thuộc vào flag canEditForm
  //        mà GAS trả về lúc login và được lưu trong session.
  function canWrite(moduleName) {
    if (moduleName !== 'form') {
      // Với các module khác: chỉ Admin
      return hasRole('Admin');
    }
    const user = currentUser();
    if (!user) return false;
    if (user.role === 'Admin') return true;
    // Đọc flag từ session (đã được GAS set lúc login)
    return user.canEditForm === true;
  }

  function allowedModules() {
    return Object.keys(PERMISSIONS).filter(m => canAccess(m));
  }

  // ── Áp dụng quyền lên DOM ────────────────────────────────────
  // Dùng attribute:
  //   data-require-role="Admin"         → ẩn nếu không phải role đó
  //   data-require-write="form"         → ẩn nếu canWrite('form') = false
  //   data-nav-module="admin"           → ẩn nav item nếu không có quyền xem
  function applyToDOM() {
    document.querySelectorAll('[data-require-role]').forEach(el => {
      const required = el.dataset.requireRole.split(',').map(r => r.trim());
      el.style.display = required.includes(role()) ? '' : 'none';
    });

    document.querySelectorAll('[data-require-write]').forEach(el => {
      const mod = el.dataset.requireWrite;
      el.style.display = canWrite(mod) ? '' : 'none';
    });

    document.querySelectorAll('[data-nav-module]').forEach(el => {
      const mod = el.dataset.navModule;
      el.style.display = canAccess(mod) ? '' : 'none';
    });
  }

  return { role, hasRole, canAccess, canWrite, allowedModules, applyToDOM, currentUser };

})();

window.RBAC = RBAC;
