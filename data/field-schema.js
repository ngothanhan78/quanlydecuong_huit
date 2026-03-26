// ════════════════════════════════════════════════════════════════
//  field-schema.js — KHAI BÁO TẤT CẢ FIELD
//  Đây là "nguồn sự thật duy nhất" cho toàn bộ hệ thống.
//
//  ⚠  KHI TEMPLATE THAY ĐỔI: chỉ cần sửa file này.
//     form.js, export-word.js, api.js đều đọc từ đây.
//
//  Các flag mỗi field:
//    formId       : id của element HTML trong form
//    type         : 'text' | 'select' | 'checkbox' | 'date' | 'number' | 'textarea' | 'hidden' | 'calc'
//    label        : nhãn hiển thị
//    required     : true = bắt buộc khi validate
//    saveToSheet  : true = ghi vào Google Sheet khi lưu
//    exportWord   : true = xuất ra file Word đề cương chi tiết
//    exportDCTQ   : true = xuất ra file Word bản mô tả học phần
//    section      : số thứ tự mục (0-9) để validate khi chuyển trang
//    dataKey      : key trong object data (collectAllData)
//    wordBookmark : tên vị trí trong Word template (nếu dùng placeholder)
//
//  Tables (dynamic rows) khai báo riêng ở DYNAMIC_TABLES.
// ════════════════════════════════════════════════════════════════

const FIELD_SCHEMA = {

  // ══ MỤC 1: THÔNG TIN TỔNG QUÁT (section 0) ══════════════════
  tenViet       : { formId:'tenViet',      type:'text',    label:'Tên HP (Tiếng Việt)',    required:true,  saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'tenViet'     },
  tenAnh        : { formId:'tenAnh',       type:'text',    label:'Tên HP (Tiếng Anh)',     required:true,  saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'tenAnh'      },
  maHP          : { formId:'maHP',         type:'text',    label:'Mã học phần',            required:true,  saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'maHP'        },
  maTuQuan      : { formId:'maTuQuan',     type:'text',    label:'Mã tự quản',             required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'maTuQuan'    },
  hocKy         : { formId:'hocKy',        type:'select',  label:'Học kỳ đào tạo',         required:false, saveToSheet:true,  exportWord:false, exportDCTQ:false, section:0,  dataKey:'hocKy'       },
  khoaDT        : { formId:'khoaDT',       type:'select',  label:'Khóa đào tạo',           required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'khoaDT'      },
  trinhDo       : { formId:'trinhDo',      type:'select',  label:'Trình độ',               required:true,  saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'trinhDo'     },
  khoiKT        : { formId:'khoiKT',       type:'select',  label:'Thuộc khối kiến thức',   required:true,  saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:0,  dataKey:'khoiKT'      },
  loaiHP        : { formId:'loaiHP',       type:'select',  label:'Loại học phần',          required:true,  saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:0,  dataKey:'loaiHP'      },
  nganhDT       : { formId:'nganhDT',      type:'select',  label:'Ngành đào tạo',          required:false, saveToSheet:true,  exportWord:false, exportDCTQ:true,  section:0,  dataKey:'nganhDT'     },
  chuyenNganh   : { formId:'chuyenNganh',  type:'text',    label:'Chuyên ngành',           required:false, saveToSheet:true,  exportWord:false, exportDCTQ:false, section:0,  dataKey:'chuyenNganh' },
  donVi         : { formId:'donVi',        type:'text',    label:'Đơn vị phụ trách',       required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'donVi'       },

  // Tín chỉ
  tcTong        : { formId:'tcTong',       type:'number',  label:'Tổng số tín chỉ',        required:true,  saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'tcTong'      },
  tcLT          : { formId:'tcLT',         type:'number',  label:'TC Lý thuyết (X)',        required:true,  saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'tcLT'        },
  tcTH          : { formId:'tcTH',         type:'number',  label:'TC Thực hành (Y)',        required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'tcTH'        },

  // Calc fields (readonly, tính tự động)
  tietLT_val    : { formId:'tietLT_val',   type:'hidden',  label:'Số tiết LT',             required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'tietLT'      },
  tietTNTH_val  : { formId:'tietTNTH_val', type:'hidden',  label:'Số tiết TN/TH',          required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'tietTNTH'    },
  gioTuHoc_val  : { formId:'gioTuHoc_val', type:'hidden',  label:'Số giờ tự học',          required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'gioTuHoc'    },
  ects          : { formId:'ects',         type:'hidden',  label:'ECTS',                   required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:0,  dataKey:'ects'        },

  // Điều kiện
  hpTienQuyet   : { formId:'hpTienQuyet',  type:'text',    label:'HP tiên quyết',          required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'hpTienQuyet' },
  hpTruoc       : { formId:'hpTruoc',      type:'text',    label:'HP học trước',           required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'hpTruoc'     },
  hpSongHanh    : { formId:'hpSongHanh',   type:'text',    label:'HP song hành',           required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:0,  dataKey:'hpSongHanh'  },

  // Hình thức (checkbox group — đọc gộp thành mảng)
  htTrucTiep    : { formId:'htTrucTiep',   type:'checkbox', label:'Trực tiếp',             required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:0,  dataKey:'hinhThuc'    },
  htTrucTuyen   : { formId:'htTrucTuyen',  type:'checkbox', label:'Trực tuyến (online)',   required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:0,  dataKey:'hinhThuc'    },
  htThayDoi     : { formId:'htThayDoi',    type:'checkbox', label:'Thay đổi theo HK',      required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:0,  dataKey:'hinhThuc'    },

  // ══ MỤC 3: MÔ TẢ (section 2) ═════════════════════════════════
  moTa          : { formId:'moTa',         type:'textarea', label:'Mô tả học phần',        required:true,  saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:2,  dataKey:'moTa'        },

  // ══ MỤC 9: QUY ĐỊNH (section 8) ══════════════════════════════
  loaiDK        : { formId:'loaiDK',       type:'select',  label:'Loại điều kiện đạt',     required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:8,  dataKey:'loaiDK'      },
  hpCotLoi      : { formId:'hpCotLoi',     type:'select',  label:'Học phần cốt lõi',       required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:8,  dataKey:'hpCotLoi'    },

  // ══ MỤC 10-11: HƯỚNG DẪN & PHÊ DUYỆT (section 9) ════════════
  hkApDung      : { formId:'hkApDung',     type:'select',  label:'Học kỳ áp dụng',         required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:9,  dataKey:'hkApDung'    },
  namHocApDung  : { formId:'namHocApDung', type:'text',    label:'Năm học áp dụng',        required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:true,  section:9,  dataKey:'namHocApDung'},
  pdLanDau      : { formId:'pdLanDau',     type:'checkbox',label:'Phê duyệt lần đầu',      required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:9,  dataKey:'pdLanDau'    },
  pdCapNhat     : { formId:'pdCapNhat',    type:'checkbox',label:'Bản cập nhật',            required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:9,  dataKey:'pdCapNhat'   },
  pdLanThu      : { formId:'pdLanThu',     type:'text',    label:'Lần thứ (số)',            required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:9,  dataKey:'pdLanThu'    },
  ngayPD        : { formId:'ngayPD',       type:'date',    label:'Ngày phê duyệt',         required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:9,  dataKey:'ngayPD'      },
  ngayCapNhat   : { formId:'ngayCapNhat',  type:'date',    label:'Ngày cập nhật',          required:false, saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:9,  dataKey:'ngayCapNhat' },
  truongKhoa    : { formId:'truongKhoa',   type:'text',    label:'Trưởng khoa',            required:true,  saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:9,  dataKey:'truongKhoa'  },
  truongBM      : { formId:'truongBM',     type:'text',    label:'Trưởng bộ môn / Ngành', required:true,  saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:9,  dataKey:'truongBM'    },
  chunhiem      : { formId:'chunhiem',     type:'text',    label:'Chủ nhiệm học phần',     required:true,  saveToSheet:true,  exportWord:true,  exportDCTQ:false, section:9,  dataKey:'chunhiem'    },

  // Hidden computed fields
  phamViNganh   : { formId:'phamViNganh',  type:'hidden',  label:'Phạm vi ngành',          required:false, saveToSheet:true,  exportWord:false, exportDCTQ:true,  section:9,  dataKey:'phamViNganh' },
  phamVi        : { formId:'phamVi',       type:'hidden',  label:'Phạm vi áp dụng',        required:false, saveToSheet:true,  exportWord:false, exportDCTQ:true,  section:9,  dataKey:'phamVi'      },
  phamViTrinhDo : { formId:'phamViTrinhDo',type:'hidden',  label:'Phạm vi trình độ',       required:false, saveToSheet:false, exportWord:false, exportDCTQ:false, section:9,  dataKey:'phamViTrinhDo'},
};

// ── Bảng động (mỗi bảng = 1 section) ──────────────────────────
const DYNAMIC_TABLES = {
  giangVien  : { tbodyId:'gvBody',      section:1,  saveToSheet:true,  exportWord:true,  exportDCTQ:false,
                 columns:['ten','email','donvi'],
                 labels :['Họ và tên','Email','Đơn vị công tác'] },
  clo        : { tbodyId:'cloBody',     section:3,  saveToSheet:true,  exportWord:true,  exportDCTQ:false,
                 columns:['plo','clo','moTa','mucDo'],
                 labels :['CĐR CTĐT (PLO)','CĐR HP (CLO)','Mô tả CĐR','Mức độ năng lực'] },
  chuong     : { tbodyId:'chuongBody',  section:4,  saveToSheet:true,  exportWord:true,  exportDCTQ:true,
                 columns:['ten','clo','tietLT','tietTH','tuHoc','trongSo'],
                 labels :['Tên chương/bài','CLO','LT (tiết)','TN/TH (tiết)','Tự học (giờ)','Trọng số %'] },
  chiTiet    : { tbodyId:'chiTietBody', section:4,  saveToSheet:true,  exportWord:true,  exportDCTQ:true,
                 columns:['noiDung','huongDan'],
                 labels :['Nội dung chương/bài','Hướng dẫn tự học'] },
  phuongPhap : { tbodyId:'ppBody',      section:5,  saveToSheet:true,  exportWord:true,  exportDCTQ:false,
                 columns:['ppGD','ppHT','kienThuc','knCaNhan','knNhom','nlNgheNghiep'],
                 labels :['PP Giảng dạy','PP Học tập','Kiến thức','KN Cá nhân','KN Nhóm','NL Thực hành'] },
  danhGia    : { tbodyId:'dgBody',      section:6,  saveToSheet:true,  exportWord:true,  exportDCTQ:false,
                 columns:['hoatDong','ppdg','thoiDiem','chuanDauRa','tiLe','rubrics'],
                 labels :['Hoạt động','PP đánh giá','Thời điểm','Chuẩn đầu ra','Tỉ lệ %','Thang điểm/Rubrics'] },
  giaoTrinh  : { tbodyId:'gtBody',      section:7,  saveToSheet:true,  exportWord:true,  exportDCTQ:false,
                 columns:['noidung'], labels:['Tên giáo trình (tác giả, tên, NXB, năm)'] },
  taiLieu    : { tbodyId:'tlBody',      section:7,  saveToSheet:true,  exportWord:true,  exportDCTQ:false,
                 columns:['noidung'], labels:['Tên tài liệu (tác giả, tên, NXB, năm)'] },
  phanMem    : { tbodyId:'pmBody',      section:7,  saveToSheet:true,  exportWord:false, exportDCTQ:false,
                 columns:['noidung'], labels:['Tên phần mềm'] },
};

// ── Auto-detect: các field lưu sheet nhưng chưa export Word ────
// Dùng để debug / kiểm tra đầy đủ — in ra console khi load
const FIELDS_MISSING_WORD_EXPORT = Object.entries(FIELD_SCHEMA)
  .filter(([, v]) => v.saveToSheet && !v.exportWord && v.type !== 'hidden')
  .map(([k, v]) => `${k} (${v.label})`);

const TABLES_MISSING_WORD_EXPORT = Object.entries(DYNAMIC_TABLES)
  .filter(([, v]) => v.saveToSheet && !v.exportWord)
  .map(([k, v]) => `${k} (section ${v.section})`);

if (FIELDS_MISSING_WORD_EXPORT.length || TABLES_MISSING_WORD_EXPORT.length) {
  console.group('[Schema] Fields lưu sheet nhưng CHƯA export Word:');
  FIELDS_MISSING_WORD_EXPORT.forEach(f => console.warn(' • ' + f));
  TABLES_MISSING_WORD_EXPORT.forEach(t => console.warn(' • table: ' + t));
  console.groupEnd();
}

window.FIELD_SCHEMA    = FIELD_SCHEMA;
window.DYNAMIC_TABLES  = DYNAMIC_TABLES;
