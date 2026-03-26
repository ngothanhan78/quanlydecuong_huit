// ════════════════════════════════════════════════════════════════
//  auth.js — Login, Signup, OTP, Đổi mật khẩu
//  Không biết gì về form đề cương, chỉ xử lý auth.
// ════════════════════════════════════════════════════════════════

const Auth = {

  // ── Helpers ─────────────────────────────────────────────────
  _v   : (id)         => (document.getElementById(id)?.value || '').trim(),
  _msg : (id, text, type) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className   = 'auth-msg ' + (type || '');
  },

  async _hash(pass) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pass));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  },

  // ── Tab switching ────────────────────────────────────────────
  switchTab(name) {
    document.querySelectorAll('.auth-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.auth-panel').forEach(p =>
      p.classList.toggle('active', p.id === 'panel-' + name));
  },

  // ── Đăng ký ─────────────────────────────────────────────────
  async signup() {
    const name  = this._v('signupName');
    const email = this._v('signupEmail');
    const msgv  = this._v('signupMsgv');
    const pass  = this._v('signupPass');
    const pass2 = this._v('signupPass2');

    if (!name)                         return this._msg('msgSignup','Vui lòng nhập họ tên.','err');
    if (!email || !email.includes('@')) return this._msg('msgSignup','Email không hợp lệ.','err');
    if (!msgv)                         return this._msg('msgSignup','Vui lòng nhập Mã số giảng viên.','err');
    if (pass.length < 6)               return this._msg('msgSignup','Mật khẩu tối thiểu 6 ký tự.','err');
    if (pass !== pass2)                return this._msg('msgSignup','Mật khẩu xác nhận không khớp.','err');
    if (!API.isConfigured())           return this._msg('msgSignup','⚠ Chưa cấu hình GAS URL.','err');

    this._msg('msgSignup','Đang kiểm tra và đăng ký...','');
    const hashed = await this._hash(pass);
    const res    = await API.signup(name, email, msgv, hashed);

    if (res && res.success) {
      // GAS trả về role từ _Register sheet
      const user = { name, email, role: res.role || 'GiangVien' };
      this._login(user);
      this._msg('msgSignup','✓ Đăng ký thành công!','ok');
      setTimeout(() => showApp(user), 700);
    } else {
      this._msg('msgSignup', res ? res.message : 'Lỗi kết nối.', 'err');
    }
  },

  // ── Đăng nhập ────────────────────────────────────────────────
  async login() {
    const email = this._v('loginEmail');
    const pass  = this._v('loginPass');

    if (!email || !pass)     return this._msg('msgLogin','Vui lòng nhập đủ email và mật khẩu.','err');
    if (!API.isConfigured()) return this._msg('msgLogin','⚠ Chưa cấu hình GAS URL.','err');

    this._msg('msgLogin','Đang đăng nhập...','');
    const hashed = await this._hash(pass);
    const res    = await API.login(email, hashed);

    if (res && res.success) {
      // ✅ Lưu role từ GAS vào session
      const user = { name: res.name || email.split('@')[0], email, role: res.role || 'GiangVien' };
      this._login(user);
      showApp(user);
    } else {
      this._msg('msgLogin', res ? res.message : 'Lỗi kết nối.', 'err');
    }
  },

  // ── Lưu session (có role) ────────────────────────────────────
  _login(user) {
    window._currentUser = user;
    sessionStorage.setItem('dcUser', JSON.stringify(user));
  },

  // ── Đăng xuất ────────────────────────────────────────────────
  signOut() {
    window._currentUser = null;
    sessionStorage.removeItem('dcUser');
    showAuth();
  },

  confirmSignOut() {
    const d = Form.collectAll();
    if (App.current === 'form' && (d.tenViet || d.maHP)) {
      if (confirm('Bạn có muốn lưu nháp trước khi thoát không?\n• OK → Lưu nháp rồi thoát\n• Hủy → Thoát không lưu'))
        FormState.saveDraft();
    }
    this.signOut();
  },

  // ── Quên mật khẩu (OTP) ──────────────────────────────────────
  async requestOTP() {
    const email = this._v('resetEmail');
    if (!email || !email.includes('@')) return this._msg('msgReset','Email không hợp lệ.','err');
    if (!API.isConfigured())            return this._msg('msgReset','⚠ Chưa cấu hình GAS URL.','err');

    this._msg('msgReset','Đang gửi mã OTP...','');
    document.getElementById('btnRequestOTP').disabled = true;
    const res = await API.requestOTP(email);
    document.getElementById('btnRequestOTP').disabled = false;

    if (res && res.success) {
      this._msg('msgReset', res.message, 'ok');
      document.getElementById('otpPanel').style.display = 'block';
    } else {
      this._msg('msgReset', res ? res.message : 'Lỗi kết nối.', 'err');
    }
  },

  async resetPass() {
    const email = this._v('resetEmail');
    const otp   = this._v('otpCode');
    const p1    = this._v('newPass1');
    const p2    = this._v('newPass2');

    if (!otp || otp.length !== 6) return this._msg('msgReset','Mã OTP phải đủ 6 số.','err');
    if (p1.length < 6)            return this._msg('msgReset','Mật khẩu mới tối thiểu 6 ký tự.','err');
    if (p1 !== p2)                return this._msg('msgReset','Mật khẩu xác nhận không khớp.','err');

    this._msg('msgReset','Đang xử lý...','');
    const hashed = await this._hash(p1);
    const res    = await API.changePass(email, { otp, newPass: hashed });

    if (res && res.success) {
      this._msg('msgReset','✓ ' + res.message + ' Vui lòng đăng nhập lại.','ok');
      document.getElementById('otpPanel').style.display = 'none';
      setTimeout(() => this.switchTab('login'), 2000);
    } else {
      this._msg('msgReset', res ? res.message : 'Lỗi kết nối.', 'err');
    }
  },

  // ── Đổi mật khẩu (trong app) ─────────────────────────────────
  openChangePass() {
    document.getElementById('modalChangePass').style.display = 'flex';
    ['cpOldPass','cpNewPass1','cpNewPass2'].forEach(id => document.getElementById(id).value = '');
    this._msg('msgChangePass','','');
  },

  closeChangePass() {
    document.getElementById('modalChangePass').style.display = 'none';
  },

  async changePass() {
    const email = window._currentUser?.email;
    const oldP  = this._v('cpOldPass');
    const p1    = this._v('cpNewPass1');
    const p2    = this._v('cpNewPass2');

    if (!oldP)       return this._msg('msgChangePass','Vui lòng nhập mật khẩu hiện tại.','err');
    if (p1.length<6) return this._msg('msgChangePass','Mật khẩu mới tối thiểu 6 ký tự.','err');
    if (p1 !== p2)   return this._msg('msgChangePass','Mật khẩu xác nhận không khớp.','err');

    this._msg('msgChangePass','Đang xử lý...','');
    const [hashedOld, hashedNew] = await Promise.all([this._hash(oldP), this._hash(p1)]);
    const res = await API.changePass(email, { oldPass: hashedOld, newPass: hashedNew });

    if (res && res.success) {
      this._msg('msgChangePass','✓ ' + res.message, 'ok');
      setTimeout(() => this.closeChangePass(), 1500);
    } else {
      this._msg('msgChangePass', res ? res.message : 'Lỗi kết nối.', 'err');
    }
  },
};

window.Auth = Auth;

// ── Shortcut toàn cục cho onclick= ──────────────────────────────
function doSignup()       { Auth.signup()        }
function doLogin()        { Auth.login()          }
function doSignOut()      { Auth.signOut()        }
function confirmSignOut() { Auth.confirmSignOut() }
function doRequestOTP()   { Auth.requestOTP()     }
function doResetPass()    { Auth.resetPass()       }
function openChangePass() { Auth.openChangePass() }
function closeChangePass(){ Auth.closeChangePass()}
function doChangePass()   { Auth.changePass()     }
function switchTab(name)  { Auth.switchTab(name)  }
