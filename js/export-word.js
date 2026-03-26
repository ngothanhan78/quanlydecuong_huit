// ════════════════════════════════════════════════════════════════
//  export-word.js — Xuất file Word: Đề cương chi tiết học phần
//  v2.1 — fix BorderStyle, VerticalAlign, ECTS, tenViet case
//
//  ⚠  KHI TEMPLATE THAY ĐỔI (thêm mục, đổi bảng):
//     Chỉ sửa trong file này. Logic collect data (form.js)
//     và khai báo field (field-schema.js) không cần đụng.
//
//  Cấu trúc file:
//    WordHelper  — helper functions dùng chung (run, para, cell...)
//    WordDecuong — build nội dung đề cương chi tiết
//    WordDCTQ    — build nội dung bản mô tả học phần (DCTQ)
// ════════════════════════════════════════════════════════════════

// ── Đợi thư viện docx ───────────────────────────────────────────
async function _waitDocx() {
  let retries = 0;
  while (!window._docxReady && retries < 25) {
    await new Promise(r => setTimeout(r, 300));
    retries++;
  }
  if (!window._docxReady || !window.docx)
    throw new Error('Thư viện docx chưa tải, thử lại sau vài giây.');
}

// ════════════════════════════════════════════════════════════════
//  WordHelper — các hàm helper tái sử dụng
//  Khi đổi font/cỡ chữ: chỉ sửa FONT và SZ ở đây
// ════════════════════════════════════════════════════════════════
function _buildWordHelper() {
  const {
    Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, WidthType, BorderStyle, ShadingType,
    VerticalAlign,
  } = window.docx;

  const FONT       = 'Times New Roman';
  const SZ         = 26;   // half-points = 13pt
  const SZ_TITLE   = 32;   // 16pt

  const bdr = (color = '000000') => ({
    top    : { style: BorderStyle.SINGLE, size: 4, color },
    bottom : { style: BorderStyle.SINGLE, size: 4, color },
    left   : { style: BorderStyle.SINGLE, size: 4, color },
    right  : { style: BorderStyle.SINGLE, size: 4, color },
  });

  const run = (text, opts = {}) => new TextRun({
    text    : String(text || ''),
    font    : FONT,
    size    : opts.size   || SZ,
    bold    : opts.bold   || false,
    italics : opts.italic || false,
    color   : opts.color  || undefined,
  });

  const para = (runs, opts = {}) => {
    const r = Array.isArray(runs) ? runs : [runs];
    return new Paragraph({
      alignment : opts.align  || AlignmentType.LEFT,
      indent    : opts.indent ? { left: opts.indent } : undefined,
      spacing   : { before: opts.before || 0, after: opts.after || 60 },
      children  : r.map(x => typeof x === 'string' ? run(x, opts) : x),
    });
  };

  const heading = (text) =>
    para(run(text, { bold: true, size: SZ }), { before: 120, after: 60 });

  const cell = (content, w, opts = {}) => {
    let children;
    if (Array.isArray(content)) {
      children = content;
    } else if (typeof content === 'string' && content.includes('\n')) {
      children = content.split('\n').map(line =>
        para(run(line, { bold: opts.bold, size: opts.size || SZ }),
          { align: opts.align || AlignmentType.LEFT }));
    } else {
      const c = typeof content === 'number' ? String(content) : content;
      children = [para(
        typeof c === 'string' ? run(c, { bold: opts.bold, size: opts.size || SZ }) : c,
        { align: opts.align || (opts.bold || opts.center ? AlignmentType.CENTER : AlignmentType.LEFT) }
      )];
    }
    return new TableCell({
      width         : { size: w, type: WidthType.DXA },
      borders       : bdr(),
      verticalAlign : VerticalAlign.CENTER,
      margins       : { top: 40, bottom: 40, left: 80, right: 80 },
      shading       : opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR, color: 'auto' } : undefined,
      children,
    });
  };

  const cellSpan = (content, w, span, opts = {}) => new TableCell({
    width       : { size: w, type: WidthType.DXA },
    columnSpan  : span || 1,
    borders     : bdr(),
    verticalAlign: VerticalAlign.CENTER,
    margins     : { top: 40, bottom: 40, left: 80, right: 80 },
    shading     : opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    children    : [para(
      run(String(content || ''), { bold: opts.bold !== false, size: opts.size || SZ }),
      { align: opts.align || AlignmentType.CENTER }
    )],
  });

  const bul1 = (text, after = 80) => new Paragraph({
    children  : [new TextRun({ text, size: SZ })],
    bullet    : { level: 0 },
    alignment : AlignmentType.BOTH,
    spacing   : { after },
  });

  const bul2 = (text, after = 60) => new Paragraph({
    children  : [new TextRun({ text, size: SZ })],
    bullet    : { level: 1 },
    alignment : AlignmentType.BOTH,
    spacing   : { after },
  });

  return { run, para, heading, cell, cellSpan, bul1, bul2, FONT, SZ, SZ_TITLE };
}

// ════════════════════════════════════════════════════════════════
//  exportWord — Xuất Đề cương chi tiết học phần
// ════════════════════════════════════════════════════════════════
async function exportWord() {
  await _waitDocx();

  const { Document, Packer, Table, TableRow, AlignmentType, WidthType, PageBreak, VerticalAlign, BorderStyle, TabStopType } = window.docx;
  const H = _buildWordHelper();
  const d = Form.collectAll();
  const children = [];

  // ── Tiêu đề ──────────────────────────────────────────────────
  children.push(H.para(H.run('ĐỀ CƯƠNG HỌC PHẦN', { bold: true, size: H.SZ_TITLE }),
    { align: AlignmentType.CENTER, after: 60 }));
  children.push(H.para(H.run((d.tenViet || '<TÊN HỌC PHẦN>').toUpperCase(), { bold: true, size: H.SZ_TITLE }),
    { align: AlignmentType.CENTER, after: 200 }));

  // ── 1. Thông tin tổng quát ────────────────────────────────────
  children.push(H.heading('1. THÔNG TIN TỔNG QUÁT'));
  children.push(H.para([H.run('Tên học phần (tiếng Việt): ',{bold:true}), H.run(d.tenViet||'',{bold:true})], {indent:270}));
  children.push(H.para([H.run('Tên học phần (tiếng Anh): ',{bold:true}),  H.run(d.tenAnh||'',{bold:true})],  {indent:270}));
  children.push(H.para([H.run('Trình độ: ',{bold:true}), H.run(d.trinhDo)], {indent:270}));

  // Helper format ngày dd/mm/yyyy
  const fmtDate = (val) => {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return val;
  };

  // Dùng spaces để canh cột — đơn giản, hoạt động cả Word lẫn Google Doc
  const SP = '          '; // 10 spaces
  const inlinePara = (label1, val1, label2, val2) => H.para([
    H.run(label1, {bold:true}),
    H.run(String(val1||'')),
    H.run(SP),
    H.run(label2, {bold:true}),
    H.run(String(val2||'')),
  ], {indent:270});

  children.push(inlinePara('Mã học phần: ', d.maHP, 'Mã tự quản: ', d.maTuQuan));
  children.push(inlinePara('Thuộc khối kiến thức: ', d.khoiKT, 'Loại học phần: ', d.loaiHP));
  children.push(inlinePara('Số tín chỉ: ', `${d.tcTong||0} (${d.tcLT||0},${d.tcTH||0})`, 'ECTS: ', String(d.ects||'')));

  children.push(H.para([H.run('Đơn vị phụ trách: ',{bold:true}), H.run(d.donVi)], {indent:270}));

  children.push(H.para(H.run('Phân bố thời gian:', {bold:true}), {indent:270}));
  children.push(new window.docx.Paragraph({ children:[new window.docx.TextRun({text:'• Số tiết lý thuyết: '+(d.tietLT||'0')+' tiết', size:H.SZ})], indent:{left:450}, spacing:{after:40} }));
  children.push(new window.docx.Paragraph({ children:[new window.docx.TextRun({text:'• Số tiết thí nghiệm/thực hành (TN/TH): '+(d.tietTNTH||'0')+' tiết', size:H.SZ})], indent:{left:450}, spacing:{after:40} }));
  children.push(new window.docx.Paragraph({ children:[new window.docx.TextRun({text:'• Số giờ tự học: '+(d.gioTuHoc||'0')+' giờ', size:H.SZ})], indent:{left:450}, spacing:{after:60} }));

  children.push(H.para(H.run('Điều kiện tham gia học tập học phần:', {bold:true}), {indent:270}));
  children.push(new window.docx.Paragraph({ children:[new window.docx.TextRun({text:'• Học phần tiên quyết: '+(d.hpTienQuyet||'(không)'), size:H.SZ})], indent:{left:450}, spacing:{after:40} }));
  children.push(new window.docx.Paragraph({ children:[new window.docx.TextRun({text:'• Học phần học trước: '+(d.hpTruoc||'(không)'), size:H.SZ})], indent:{left:450}, spacing:{after:40} }));
  children.push(new window.docx.Paragraph({ children:[new window.docx.TextRun({text:'• Học phần song hành: '+(d.hpSongHanh||'(không)'), size:H.SZ})], indent:{left:450}, spacing:{after:60} }));

  const htRuns = [H.run('Hình thức giảng dạy: ', {bold:true})];
  ['Trực tiếp','Trực tuyến (online)','Thay đổi theo HK'].forEach(ht => {
    htRuns.push(H.run(d.hinhThuc.includes(ht) ? '☒ ' : '☐ '));
    htRuns.push(H.run(ht + '    '));
  });
  children.push(H.para(htRuns, {indent:270, after:200}));

  // ── 2. Giảng viên ─────────────────────────────────────────────
  children.push(H.heading('2. THÔNG TIN GIẢNG VIÊN'));
  const gvW = [670, 3211, 2630, 2826];
  const gvRows = [
    new TableRow({ children: ['TT','Họ và tên','Email','Đơn vị công tác'].map((t,i) => H.cell(t, gvW[i], {bold:true})) }),
    ...(d.giangVien.length
      ? d.giangVien.map((r, i) => new TableRow({ children: [
          H.cell(i+1, gvW[0], {center:true}),
          H.cell(r[1] || '', gvW[1]),
          H.cell(r[2] || '', gvW[2]),
          H.cell(r[3] || '', gvW[3]),
        ]}))
      : [new TableRow({ children: gvW.map(w => H.cell('', w)) })]
    ),
  ];
  children.push(new Table({ width:{size:9337,type:WidthType.DXA}, columnWidths:gvW, rows:gvRows }));
  children.push(H.para('', {after:120}));

  // ── 3. Mô tả ──────────────────────────────────────────────────
  children.push(H.heading('3. MÔ TẢ HỌC PHẦN'));
  (d.moTa || '').split('\n').forEach(line => children.push(H.para(H.run(line), {indent:270})));
  children.push(H.para('', {after:120}));

  // ── 4. CLO ────────────────────────────────────────────────────
  children.push(H.heading('4. CHUẨN ĐẦU RA HỌC PHẦN'));
  children.push(H.para(H.run('Chuẩn đầu ra (CĐR) chi tiết của học phần như sau:'), {indent:270}));
  const cloW = [864, 1046, 1104, 4861, 1187];
  const cloRows = [
    new TableRow({ children: [
      H.cellSpan('CĐR của CTĐT', cloW[0], 1, {bold:true}),
      H.cellSpan('CĐR học phần', cloW[1]+cloW[2], 2, {bold:true}),
      H.cellSpan('Mô tả CĐR',    cloW[3], 1, {bold:true}),
      H.cellSpan('Mức độ năng lực', cloW[4], 1, {bold:true}),
    ]}),
    ...(d.clo.length
      ? d.clo.map(r => new TableRow({ children: [
          H.cell(r[0]||'',cloW[0]), H.cell(r[1]||'',cloW[1]), H.cell('',cloW[2]),
          H.cell(r[2]||'',cloW[3]), H.cell(r[3]||'',cloW[4]),
        ]}))
      : [new TableRow({ children: cloW.map(w => H.cell('',w)) })]
    ),
  ];
  children.push(new Table({ width:{size:9062,type:WidthType.DXA}, columnWidths:cloW, rows:cloRows }));
  children.push(H.para('', {after:120}));

  // ── 5. Nội dung học phần ──────────────────────────────────────
  children.push(H.heading('5. NỘI DUNG HỌC PHẦN'));
  children.push(H.para(H.run('5.1. Phân bố thời gian tổng quát', {bold:true}), {indent:270}));
  const chW = [693, 2270, 2274, 1086, 958, 1136, 1140];
  const chTotalW = chW[3]+chW[4]+chW[5]+chW[6];
  const chRows = [
    new TableRow({ children: [
      H.cellSpan('STT',chW[0],1,{bold:true}),
      H.cellSpan('Tên chương/bài',chW[1],1,{bold:true}),
      H.cellSpan('Chuẩn đầu ra của học phần',chW[2],1,{bold:true}),
      H.cellSpan('Phân bố thời gian (tiết/giờ)',chTotalW,4,{bold:true}),
    ]}),
    new TableRow({ children: [
      H.cell('',chW[0]),H.cell('',chW[1]),H.cell('',chW[2]),
      H.cell('Lý thuyết',chW[3],{bold:true}),H.cell('TN/TH',chW[4],{bold:true}),
      H.cell('Tự học',chW[5],{bold:true}),H.cell('Trọng số %',chW[6],{bold:true}),
    ]}),
    ...(d.chuong.length
      ? d.chuong.map((r,i) => new TableRow({ children: [
          H.cell(i+1,chW[0],{center:true}), H.cell(r[0]||'',chW[1]),H.cell(r[1]||'',chW[2]),
          H.cell(r[2]||'',chW[3],{center:true}),H.cell(r[3]||'',chW[4],{center:true}),
          H.cell(r[4]||'',chW[5],{center:true}),H.cell(r[5]||'',chW[6],{center:true}),
        ]}))
      : [new TableRow({ children: chW.map(w => H.cell('',w)) })]
    ),
    new TableRow({ children: [
      H.cellSpan('Tổng',chW[0]+chW[1],2,{bold:true}), H.cell('',chW[2]),
      H.cell(String(d.chuong.reduce((s,r)=>s+Number(r[2]||0),0)||''),chW[3],{center:true}),
      H.cell(String(d.chuong.reduce((s,r)=>s+Number(r[3]||0),0)||''),chW[4],{center:true}),
      H.cell(String(Math.round(d.chuong.reduce((s,r)=>s+Number(r[4]||0),0))||''),chW[5],{center:true}),
      H.cell('',chW[6]),
    ]}),
  ];
  children.push(new Table({ width:{size:9557,type:WidthType.DXA}, columnWidths:chW, rows:chRows }));
  children.push(H.para(''));
  children.push(H.para(H.run('5.2. Nội dung chi tiết', {bold:true}), {indent:270}));
  const ctW = [4716, 4824];
  const ctRows = [
    new TableRow({ children: [H.cell('Nội dung chương/bài',ctW[0],{bold:true}), H.cell('Hướng dẫn tự học/Hướng dẫn học',ctW[1],{bold:true})] }),
    ...(d.chiTiet.length
      ? d.chiTiet.map(r => new TableRow({ children: [H.cell(r[0]||'',ctW[0]), H.cell(r[1]||'',ctW[1])] }))
      : [new TableRow({ children: ctW.map(w => H.cell('',w)) })]
    ),
  ];
  children.push(new Table({ width:{size:9540,type:WidthType.DXA}, columnWidths:ctW, rows:ctRows }));
  children.push(H.para('', {after:120}));

  // ── 6. Phương pháp dạy và học ────────────────────────────────
  children.push(H.heading('6. PHƯƠNG PHÁP DẠY VÀ HỌC'));
  const ppW = [2836, 2520, 986, 990, 1136, 1417];
  const ppRows = [
    new TableRow({ children: [
      H.cellSpan('Phương pháp giảng dạy',ppW[0],1,{bold:true}),
      H.cellSpan('Phương pháp học tập',ppW[1],1,{bold:true}),
      H.cellSpan('Nhóm CĐR của học phần',ppW[2]+ppW[3]+ppW[4]+ppW[5],4,{bold:true}),
    ]}),
    new TableRow({ children: [
      H.cell('',ppW[0]),H.cell('',ppW[1]),
      H.cell('Kiến thức',ppW[2],{bold:true}),H.cell('Kỹ năng cá nhân',ppW[3],{bold:true}),
      H.cell('Kỹ năng tương tác/nhóm',ppW[4],{bold:true}),H.cell('Năng lực thực hành nghề nghiệp',ppW[5],{bold:true}),
    ]}),
    ...(d.phuongPhap.length
      ? d.phuongPhap.map(r => new TableRow({ children: [
          H.cell(r[0]||'',ppW[0]),H.cell(r[1]||'',ppW[1]),
          ...[2,3,4,5].map(i => H.cell(r[i]||'',ppW[i],{center:true})),
        ]}))
      : [new TableRow({ children: ppW.map(w => H.cell('',w)) })]
    ),
  ];
  children.push(new Table({ width:{size:9885,type:WidthType.DXA}, columnWidths:ppW, rows:ppRows }));
  children.push(H.para('', {after:120}));

  // ── 7. Đánh giá học phần ─────────────────────────────────────
  children.push(H.heading('7. ĐÁNH GIÁ HỌC PHẦN'));
  children.push(H.para(H.run('Thang điểm đánh giá: 10/10'), {indent:270}));
  children.push(H.para(H.run('Kế hoạch đánh giá học phần cụ thể như sau:'), {indent:270}));
  const dgSTT = 400;
  const dgW   = [2744, 1500, 1267, 2244, 900, 1338];
  const dgRows = [
    new TableRow({ children: [
      H.cell('STT',dgSTT,{bold:true}),H.cell('Hoạt động đánh giá',dgW[0],{bold:true}),
      H.cell('Thời điểm',dgW[1],{bold:true}),H.cell('Chuẩn đầu ra',dgW[2],{bold:true}),
      H.cell('Tỉ lệ (%)',dgW[3],{bold:true}),H.cell('Thang điểm/ Rubrics',dgW[4],{bold:true}),
    ]}),
    ...(d.danhGia.length
      ? d.danhGia.map((r,i) => new TableRow({ children: [
          H.cell(i+1,dgSTT,{center:true}),H.cell(r[0]||'',dgW[0]),
          H.cell(r[2]||'',dgW[1],{center:true}),H.cell(r[3]||'',dgW[2],{center:true}),
          H.cell(r[4]||'',dgW[3],{center:true}),H.cell(r[5]||'',dgW[4]),
        ].flat()}))
      : [new TableRow({ children: [H.cell('',dgSTT), ...dgW.map(w => H.cell('',w))] })]
    ),
  ];
  children.push(new Table({ width:{size:10040,type:WidthType.DXA}, columnWidths:[dgSTT,...dgW], rows:dgRows }));
  children.push(H.para('', {after:120}));

  // ── 8. Nguồn học liệu ────────────────────────────────────────
  children.push(H.heading('8. NGUỒN HỌC LIỆU'));
  children.push(H.para(H.run('8.1. Sách, giáo trình chính', {bold:true}), {indent:270}));
  if (d.giaoTrinh.length) d.giaoTrinh.forEach((r,i) => children.push(H.para([H.run(`[${i+1}] `), H.run(typeof r==='string'?r:r[1]||'')], {indent:270})));
  else children.push(H.para(H.run('[1]'), {indent:270}));
  children.push(H.para(H.run('8.2. Tài liệu tham khảo', {bold:true}), {indent:270}));
  if (d.taiLieu.length)   d.taiLieu.forEach((r,i) => children.push(H.para([H.run(`[${i+1}] `), H.run(typeof r==='string'?r:r[1]||'')], {indent:270})));
  else children.push(H.para(H.run('[2]'), {indent:270}));
  children.push(H.para(H.run('8.3. Phần mềm', {bold:true}), {indent:270}));
  if (d.phanMem.length)   d.phanMem.forEach((r,i) => children.push(H.para([H.run(`[${i+1}] `), H.run(typeof r==='string'?r:r[1]||'')], {indent:270})));
  else children.push(H.para(H.run('[1]'), {indent:270}));
  children.push(H.para('', {after:120}));

  // ── 9. Quy định ──────────────────────────────────────────────
  children.push(H.heading('9. QUY ĐỊNH CỦA HỌC PHẦN'));
  const cfg = APP_CONFIG.QUY_DINH;
  children.push(H.para(H.run('Người học có nhiệm vụ:', {bold:true}), {indent:270, align:AlignmentType.BOTH}));
  children.push(H.bul1('"Tham dự trên 75% giờ học lý thuyết" hoặc "Tham dự 100% giờ thực hành - thí nghiệm";'));
  children.push(H.bul1('Chủ động lên kế hoạch học tập:', 40));
  children.push(H.bul2('Tích cực khai thác các tài nguyên trong thư viện của trường và trên mạng để phục vụ cho việc tự học, tự nghiên cứu và các hoạt động thảo luận;'));
  children.push(H.bul2('Đọc trước tài liệu do giảng viên cung cấp hoặc yêu cầu;'));
  children.push(H.bul2('Ôn tập các nội dung đã học; tự kiểm tra kiến thức bằng cách làm các bài trắc nghiệm kiểm tra hoặc bài tập được giảng viên cung cấp.', 80));
  children.push(H.bul1('Tích cực tham gia các hoạt động thảo luận, trình bày, vấn đáp trên lớp và hoạt động nhóm;'));
  if (parseFloat(d.tcTH) > 0) {
    children.push(H.bul1('Tham gia các hoạt động thực hành theo hướng dẫn của giảng viên và các yêu cầu về an toàn lao động, nội quy phòng thí nghiệm và/hoặc yêu cầu của nơi thực tập;'));
  }
  children.push(H.bul1('Chủ động hoàn thành đầy đủ, trung thực các bài tập cá nhân, bài tập nhóm theo yêu cầu;'));
  children.push(H.bul1('Dự kiểm tra trên lớp (nếu có) và thi cuối kỳ.', 120));
  children.push(H.para([H.run('Điều kiện đạt học phần: ',{bold:true,size:H.SZ}), H.run(cfg.dkDat_ref,{size:H.SZ})], {indent:270,align:AlignmentType.BOTH}));
  children.push(H.bul1(cfg.dkDat_thuong));
  if (d.hpCotLoi === 'yes') children.push(H.bul1(cfg.dkDat_cotloi));
  children.push(H.para('', {after:120}));

  // ── 10. Hướng dẫn thực hiện ──────────────────────────────────
  children.push(H.heading('10. HƯỚNG DẪN THỰC HIỆN'));
  const _td  = d.trinhDo  || '[trình độ]';
  const _ng  = d.nganhDT  || d.phamViNganh || '[tên ngành]';
  const _kh  = d.khoaDT   || '[Khóa]';
  const _hk  = d.hkApDung || '';
  const _nm  = d.namHocApDung || '';

  // Helper: canh đều 2 biên, không bullet
  const bul2 = (runs) => new window.docx.Paragraph({
    alignment : AlignmentType.BOTH,
    indent    : { left: 270 },
    spacing   : { after: 80 },
    children  : Array.isArray(runs) ? runs : [new window.docx.TextRun({ text: String(runs||''), font: 'Times New Roman', size: H.SZ })],
  });

  children.push(bul2([
    new window.docx.TextRun({text:'Phạm vi áp dụng: Đề cương này được áp dụng cho chương trình đào tạo ',font:'Times New Roman',size:H.SZ}),
    new window.docx.TextRun({text:_td,font:'Times New Roman',size:H.SZ,bold:true}),
    new window.docx.TextRun({text:' ngành ',font:'Times New Roman',size:H.SZ}),
    new window.docx.TextRun({text:_ng,font:'Times New Roman',size:H.SZ,bold:true}),
    new window.docx.TextRun({text:', từ khóa ',font:'Times New Roman',size:H.SZ}),
    new window.docx.TextRun({text:_kh,font:'Times New Roman',size:H.SZ,bold:true}),
    new window.docx.TextRun({text:' - ',font:'Times New Roman',size:H.SZ}),
    new window.docx.TextRun({text:_hk,font:'Times New Roman',size:H.SZ,bold:true}),
    new window.docx.TextRun({text:' - Năm học ',font:'Times New Roman',size:H.SZ}),
    new window.docx.TextRun({text:_nm,font:'Times New Roman',size:H.SZ,bold:true}),
    new window.docx.TextRun({text:';',font:'Times New Roman',size:H.SZ}),
  ]));
  children.push(bul2('Giảng viên: sử dụng đề cương này để làm cơ sở cho việc chuẩn bị bài giảng, lên kế hoạch giảng dạy và đánh giá kết quả học tập của người học;'));
  children.push(bul2('Lưu ý: Trước khi giảng dạy, giảng viên cần nêu rõ các nội dung chính của đề cương học phần cho người học – bao gồm chuẩn đầu ra, nội dung, phương pháp dạy và học chủ yếu, phương pháp đánh giá và tài liệu tham khảo dùng cho học phần;'));
  children.push(bul2('Người học: sử dụng đề cương này làm cơ sở để nắm được các thông tin chi tiết về học phần, từ đó xác định được phương pháp học tập phù hợp để đạt được kết quả mong đợi.'));
  children.push(H.para('', {after:200}));

  // ── 11. Phê duyệt ─────────────────────────────────────────────
  children.push(H.heading('11. PHÊ DUYỆT'));

  // Dòng checkbox — luôn hiển thị cả 2
  const pdRuns = [];
  pdRuns.push(H.run(d.pdLanDau ? '☒ ' : '☐ '));
  pdRuns.push(H.run('Phê duyệt lần đầu'));
  pdRuns.push(H.run('          '));
  pdRuns.push(H.run(d.pdCapNhat ? '☒ ' : '☐ '));
  pdRuns.push(H.run('Bản cập nhật lần thứ'));
  if (d.pdLanThu) { pdRuns.push(H.run(' ')); pdRuns.push(H.run(String(d.pdLanThu), {bold:true})); }
  children.push(H.para(pdRuns, {indent:270}));

  // Ngày phê duyệt — luôn hiển thị
  children.push(H.para([H.run('Ngày phê duyệt: ',{bold:true}), H.run(fmtDate(d.ngayPD))], {indent:270}));
  // Ngày cập nhật — luôn hiển thị
  children.push(H.para([H.run('Ngày cập nhật: ', {bold:true}), H.run(fmtDate(d.ngayCapNhat))], {indent:270}));

  // Bảng ký tên — không border, 2 dòng trắng để ký
  const kW = [3000, 3000, 3337];
  const {
    TableCell: TC, Paragraph: Para, TextRun: TR,
    WidthType: WT, VerticalAlign: VA,
  } = window.docx;

  const noBorderStyle = { style: 'nil', size: 0, color: 'auto' };
  const noBorders = { top: noBorderStyle, bottom: noBorderStyle, left: noBorderStyle, right: noBorderStyle };

  const makeKCell = (lines, w) => new TC({
    width         : { size: w, type: WT.DXA },
    borders       : noBorders,
    verticalAlign : VA.CENTER,
    margins       : { top: 60, bottom: 60, left: 80, right: 80 },
    children      : lines.map(txt => new Para({
      alignment : AlignmentType.CENTER,
      spacing   : { after: 60 },
      children  : [new TR({ text: String(txt||''), font: 'Times New Roman', size: H.SZ })],
    })),
  });

  const kRows = [
    // Dòng 1: tiêu đề (Trưởng khoa, Trưởng BM, Chủ nhiệm)
    new TableRow({ children: [
      makeKCell(['Trưởng khoa'], kW[0]),
      makeKCell(['Trưởng bộ môn / Trưởng ngành'], kW[1]),
      makeKCell(['Chủ nhiệm học phần'], kW[2]),
    ]}),
    // Dòng 2: 2 dòng trắng để ký + tên
    new TableRow({ children: [
      makeKCell(['', '', d.truongKhoa||''], kW[0]),
      makeKCell(['', '', d.truongBM  ||''], kW[1]),
      makeKCell(['', '', d.chunhiem  ||''], kW[2]),
    ]}),
  ];
  children.push(new Table({ width:{size:9337, type:WidthType.DXA}, columnWidths:kW, rows:kRows }));

  // ── Build & Download ──────────────────────────────────────────
  const doc  = new Document({ sections: [{ properties: { page: {
    size   : { width: 11907, height: 16840 },
    margin : { top: 851, right: 1134, bottom: 284, left: 1701 },
  }}, children }] });

  const blob    = await Packer.toBlob(doc);
  const now     = new Date();
  const today   = now.toISOString().slice(0,10).replace(/-/g,'');
  const ts      = now.toTimeString().slice(0,8).replace(/:/g,''); // HHmmss
  const tenMon  = (d.tenViet || 'DeCuong').replace(/\s+/g,'_').substring(0,30);
  const maHP    = (d.maHP || 'XX').replace(/\s+/g,'');
  const ver     = window._lastSavedVersion ? '_v' + window._lastSavedVersion : '_v1';
  const fileName = `DC_${tenMon}_${maHP}_${today}_${ts}${ver}.docx`;

  _downloadBlob(blob, fileName);

  // Upload file .docx lên Drive
  if (API.isConfigured()) {
    const tenMon = d.tenViet || '';
    const sheetId = window._lastSavedSheetId || '';
    API.uploadDocx(blob, fileName, 'sheet', tenMon, sheetId)
      .then(res => { if (res && res.success) UI.toast('☁ Đã lưu file Word DC lên Drive!', 'ok'); })
      .catch(() => {});
  }

  return { blob, fileName };
}

// ════════════════════════════════════════════════════════════════
//  exportWordDCTQ — Xuất Bản mô tả học phần
// ════════════════════════════════════════════════════════════════
async function exportWordDCTQ() {
  await _waitDocx();

  const { Document, Packer, Table, TableRow, AlignmentType, WidthType } = window.docx;
  const H = _buildWordHelper();
  const d = Form.collectAll();
  const children = [];
  const indent = 270;

  // ── Tiêu đề ──────────────────────────────────────────────────
  children.push(H.para(H.run('BẢN MÔ TẢ HỌC PHẦN', {bold:true,size:H.SZ_TITLE}), {align:AlignmentType.CENTER,after:60}));
  children.push(H.para(H.run((d.tenViet||'<TÊN HỌC PHẦN>').toUpperCase(), {bold:true,size:H.SZ_TITLE}), {align:AlignmentType.CENTER,after:200}));

  // ── 1. Thông tin tổng quát ────────────────────────────────────
  children.push(H.heading('1. THÔNG TIN TỔNG QUÁT'));
  const info = (label, value, italic=true) =>
    H.para([H.run(label,{bold:true,size:H.SZ}), H.run(value||'',{italic,size:H.SZ})], {indent});

  children.push(info('Tên học phần (tiếng Việt): ', d.tenViet||'', false));
  children.push(info('Tên học phần (tiếng Anh): ',  d.tenAnh||''));
  children.push(info('Trình độ: ',                   d.trinhDo||''));
  children.push(info('Mã học phần: ',                d.maHP||''));
  children.push(info('Mã tự quản: ',                 d.maTuQuan||''));
  children.push(info('Thuộc khối kiến thức: ',       d.khoiKT||''));
  children.push(info('Loại học phần: ',              d.loaiHP||''));
  children.push(info('Đơn vị phụ trách: ',           d.donVi||''));
  const tcStr = d.tcTong
    ? `${d.tcTong} (${d.tcLT||0},${d.tcTH||0})`
    : `${(Number(d.tcLT)||0)+(Number(d.tcTH)||0)} (${d.tcLT||0},${d.tcTH||0})`;
  children.push(info('Số tín chỉ: ', tcStr));
  children.push(H.para(H.run('Phân bố thời gian:', {bold:true}), {indent}));
  children.push(H.para([H.run('Số tiết lý thuyết: '), H.run((d.tietLT||'0')+' tiết',{italic:true})], {indent:indent*2}));
  children.push(H.para([H.run('Số tiết thí nghiệm/thực hành (TN/TH): '), H.run((d.tietTNTH||'0')+' tiết',{italic:true})], {indent:indent*2}));
  children.push(H.para([H.run('Số giờ tự học: '), H.run((d.gioTuHoc||'0')+' giờ',{italic:true})], {indent:indent*2}));
  children.push(H.para(H.run('Điều kiện tham gia học tập học phần:',{bold:true}), {indent}));
  children.push(H.para([H.run('Học phần tiên quyết: '), H.run(d.hpTienQuyet||'(không)',{italic:true})], {indent:indent*2}));
  children.push(H.para([H.run('Học phần học trước: '),  H.run(d.hpTruoc||'(không)',{italic:true})], {indent:indent*2}));
  children.push(H.para([H.run('Học phần song hành: '),  H.run(d.hpSongHanh||'(không)',{italic:true})], {indent:indent*2}));

  // ── 2. Mô tả ──────────────────────────────────────────────────
  children.push(H.heading('2. MÔ TẢ HỌC PHẦN'));
  const moTaLines = (d.moTa || '').split('\n').filter(l => l.trim());
  if (moTaLines.length) moTaLines.forEach(line => children.push(H.para(H.run(line), {indent})));
  else children.push(H.para(H.run('[Chưa nhập mô tả học phần]', {italic:true}), {indent}));

  // ── 3. Nội dung học phần ─────────────────────────────────────
  children.push(H.heading('3. NỘI DUNG HỌC PHẦN'));
  if (d.chuong && d.chuong.length) {
    d.chuong.forEach((r, i) => {
      children.push(H.para(H.run(`Chương ${i+1}. ${r[0]||''}`, {bold:true}), {indent}));
      const ct = d.chiTiet && d.chiTiet[i] ? d.chiTiet[i][0] || '' : '';
      if (ct) ct.split('\n').forEach((line, j) => {
        if (line.trim()) children.push(H.para(H.run(`${i+1}.${j+1}. ${line.trim()}`), {indent:indent*2}));
      });
    });
  } else {
    children.push(H.para(H.run('[Chưa nhập nội dung học phần]', {italic:true}), {indent}));
  }

  // ── 4. Phạm vi áp dụng ───────────────────────────────────────
  children.push(H.heading('4. PHẠM VI ÁP DỤNG'));
  const nganh   = d.nganhDT  || '[tên ngành]';
  const trinhDo = d.trinhDo  || '[trình độ]';
  const khoa    = d.khoaDT   || '[Khóa]';
  const hk      = d.hkApDung || '';
  const nm      = d.namHocApDung || '';
  const tg      = (hk && nm) ? hk + ' năm học ' + nm : (hk || nm || '[Thời điểm]');
  children.push(H.para(H.run(
    `Bản mô tả học phần này được áp dụng cho chương trình đào tạo trình độ ${trinhDo} ngành ${nganh}, từ ${khoa}, bắt đầu từ ${tg}.`
  ), {indent}));

  // ── Build & Download ──────────────────────────────────────────
  const doc      = new Document({ sections: [{ properties: { page: {
    size   : { width: 11907, height: 16840 },
    margin : { top: 851, right: 992, bottom: 1080, left: 1701 },
  }}, children }] });
  const blob     = await Packer.toBlob(doc);
  const now      = new Date();
  const today    = now.toISOString().slice(0,10).replace(/-/g,'');
  const ts       = now.toTimeString().slice(0,8).replace(/:/g,''); // HHmmss
  const tenMon   = (d.tenViet || 'BanMoTa').replace(/\s+/g,'_').substring(0,30);
  const maHP     = (d.maHP || 'XX').replace(/\s+/g,'');
  const ver      = window._lastSavedVersion ? '_v' + window._lastSavedVersion : '_v1';
  const fileName = `DCTQ_${tenMon}_${maHP}_${today}_${ts}${ver}.docx`;

  _downloadBlob(blob, fileName);

  // Upload file .docx DCTQ lên Drive
  if (API.isConfigured()) {
    const tenMon  = d.tenViet || '';
    const sheetId = window._lastSavedSheetId || '';
    API.uploadDocx(blob, fileName, 'dctq', tenMon, sheetId).catch(() => {});
  }

  return { blob, fileName };
}

// ── Helper download ──────────────────────────────────────────────
function _downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url; a.download = fileName;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
