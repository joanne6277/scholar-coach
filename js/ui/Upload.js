import { disciplines } from '../config/disciplines.js';
import { state } from '../core/state.js';

export function showUploadError(msg) {
  const uploadZone = document.getElementById('uploadZone');
  const fileBadge = document.getElementById('fileBadge');
  const uploadErrorText = document.getElementById('uploadErrorText');
  const uploadErrorMsg = document.getElementById('uploadErrorMsg');

  state.fileName = '';
  if (fileBadge) fileBadge.style.display = 'none';
  if (uploadErrorMsg) uploadErrorMsg.textContent = msg;
  if (uploadErrorText) uploadErrorText.style.display = 'inline-flex';
  if (uploadZone) uploadZone.classList.add('error');
}

export function clearUploadError() {
  const uploadZone = document.getElementById('uploadZone');
  const uploadErrorText = document.getElementById('uploadErrorText');

  if (uploadErrorText) uploadErrorText.style.display = 'none';
  if (uploadZone) uploadZone.classList.remove('error');
}

// 初步分析：粗略模擬「檔案是否包含標題與摘要」的判斷依據。
// 前端無法真正解析 PDF 內容，以檔案大小作為代理指標：
// 一份包含標題、摘要與內文的學術論文，實務上不會小於此門檻。
const MIN_STRUCTURED_FILE_SIZE = 30 * 1024; // 30KB

export function checkPaperStructure(fileSize) {
  return typeof fileSize === 'number' && fileSize >= MIN_STRUCTURED_FILE_SIZE;
}

// Step2（確認論文資訊）內兩個互斥子畫面：確認標題摘要(confirm) / 分析失敗(error)
export function showStep2SubView(view) {
  const confirmView = document.getElementById('paperConfirmView');
  const errorView = document.getElementById('uploadAnalysisErrorView');

  if (confirmView) confirmView.style.display = view === 'confirm' ? 'block' : 'none';
  if (errorView) errorView.style.display = view === 'error' ? 'block' : 'none';
}

export function showStructureError() {
  showStep2SubView('error');
}

// Demo 用：依論文標題產生一段示意摘要，模擬系統初步分析後萃取的結果
export function buildDemoAbstract(subject) {
  const topic = subject || '本篇上傳論文';
  return `本文針對「${topic}」進行探討，系統性回顧其研究背景、採用之方法論與主要發現，並指出目前文獻中尚待補強之研究缺口，作為後續延伸研究之基礎。`;
}

export function showPaperConfirmView() {
  const titleInput = document.getElementById('confirmTitleInput');
  const abstractInput = document.getElementById('confirmAbstractInput');

  if (titleInput) titleInput.value = state.researchSubject;
  if (abstractInput) abstractInput.value = buildDemoAbstract(state.researchSubject);

  showStep2SubView('confirm');
}

export function renderDisciplineOptions() {
  const main = document.getElementById('mainDiscipline');
  if (!main) return;

  // 避免重複渲染
  if (main.options.length > 1) return;

  // 防禦性處理：相容一維陣列、二維物件或類別物件等多種快取/新舊資料格式
  const list = [];
  const source = Array.isArray(disciplines)
    ? disciplines
    : (disciplines && typeof disciplines === 'object' ? Object.values(disciplines).flat() : []);

  source.forEach(item => {
    if (typeof item === 'string') {
      list.push(item);
    } else if (item && typeof item === 'object') {
      if (item.name) list.push(item.name);
      else if (item.category && Array.isArray(item.items)) {
        item.items.forEach(sub => {
          if (typeof sub === 'string') list.push(sub);
          else if (sub && sub.name) list.push(sub.name);
        });
      }
    }
  });

  list.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    main.appendChild(opt);
  });
}
