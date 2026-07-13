import { state } from './core/state.js';
import { goStep, updateUserUI } from './ui/Navigation.js';
import { showToast } from './utils/Toast.js';
import { updateEstimate } from './ui/Settings.js';
import { renderDisciplineOptions, showUploadError, clearUploadError } from './ui/Upload.js';
import { showResults } from './ui/Results.js';
import { advanceGeneration, initGenerationErrorEvents } from './ui/Generation.js';
import { toggleMemberModal, rechargePoints, openPaymentModal, closePaymentModal, initPaymentEvents } from './ui/Member.js';
import { toggleAuthModal, initAuthEvents } from './ui/Auth.js';
import { initConfirmModal } from './utils/Confirm.js';
import { initDemoPanel } from './ui/DemoPanel.js';

function init() {
  let paperWarningShown = false;

  // Landing Page Start Button
  const startBtn = document.getElementById('startBtn');
  const landingPage = document.getElementById('landingPage');
  const mainApp = document.getElementById('mainApp');

  if (startBtn && landingPage && mainApp) {
    startBtn.onclick = () => {
      landingPage.style.display = 'none';
      mainApp.style.display = 'block';
    };
  }

  // Back to Landing
  const backToLanding = document.getElementById('backToLanding');
  if (backToLanding && landingPage && mainApp) {
    backToLanding.onclick = (e) => {
      e.preventDefault();
      mainApp.style.display = 'none';
      landingPage.style.display = 'flex';
    };
  }

  // Member Modal Events
  const memberBtn = document.getElementById('memberBtn');
  const loginBtn = document.getElementById('loginBtn');
  const closeMemberBtn = document.getElementById('closeMemberBtn');
  const memberModal = document.getElementById('memberModal');

  if (loginBtn) {
    loginBtn.onclick = () => {
      toggleAuthModal(true);
    };
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      state.isLoggedIn = false;
      toggleMemberModal(false);
      updateUserUI();
      showToast("您已成功登出", "info");
    };
  }

  if (memberBtn) memberBtn.onclick = () => toggleMemberModal(true);
  if (closeMemberBtn) closeMemberBtn.onclick = () => toggleMemberModal(false);
  if (memberModal) {
    memberModal.onclick = (e) => {
      if (e.target === memberModal) toggleMemberModal(false);
    };
  }

  // Subject Input Sync
  const subjectInput = document.getElementById('subjectInput');
  const resultSubjectInput = document.getElementById('resultSubjectInput');

  if (subjectInput) {
    subjectInput.oninput = (e) => {
      state.researchSubject = e.target.value;
      if (resultSubjectInput) resultSubjectInput.value = state.researchSubject;
    };
  }
  if (resultSubjectInput) {
    resultSubjectInput.oninput = (e) => {
      state.researchSubject = e.target.value;
      if (subjectInput) subjectInput.value = state.researchSubject;
    };
  }

  // Initial render
  renderDisciplineOptions();
  updateEstimate();
  updateUserUI();

  // Bind static events
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const fileBadge = document.getElementById('fileBadge');
  const fileName = document.getElementById('fileName');

  const isValidPaperFile = (file) => {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  };

  const handleUploadedFile = (file) => {
    if (!isValidPaperFile(file)) {
      showUploadError('檔案格式錯誤，請上傳 PDF 格式的論文文件');
      return;
    }

    clearUploadError();
    state.fileName = file.name;
    state.isRegenerating = false;
    fileBadge.style.display = 'inline-flex';
    fileName.textContent = state.fileName;

    // Auto-fill subject with filename (minus extension)
    state.researchSubject = file.name.replace(/\.[^/.]+$/, "");
    const subjectInput = document.getElementById('subjectInput');
    const resultSubjectInput = document.getElementById('resultSubjectInput');
    const subjectContainer = document.getElementById('subjectContainer');

    if (subjectInput) subjectInput.value = state.researchSubject;
    if (resultSubjectInput) resultSubjectInput.value = state.researchSubject;
    if (subjectContainer) subjectContainer.style.display = 'block';
  };

  if (uploadZone && fileInput) {
    uploadZone.onclick = () => {
      if (!state.isLoggedIn) {
        toggleAuthModal(true);
        return;
      }
      fileInput.click();
    };
    fileInput.onchange = e => {
      if (e.target.files[0]) {
        handleUploadedFile(e.target.files[0]);
      }
    };
    uploadZone.addEventListener('dragover', e => {
      e.preventDefault();
      if (state.isLoggedIn) uploadZone.classList.add('dragging');
    });
    uploadZone.addEventListener('dragleave', () => {
      if (state.isLoggedIn) uploadZone.classList.remove('dragging');
    });
    uploadZone.addEventListener('drop', e => {
      e.preventDefault();
      if (!state.isLoggedIn) return; // 未登入不可拖放
      uploadZone.classList.remove('dragging');
      if (e.dataTransfer.files[0]) {
        handleUploadedFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Global functions exposed to HTML (or better, use event listeners)
  window.goToStep2Demo = () => {
    if (!state.isLoggedIn) {
      showToast("請先登入帳戶！", "warning");
      toggleAuthModal(true);
      return;
    }
    if (!state.fileName && !paperWarningShown) {
      showToast("請先上傳核心論文 PDF！", "warning");
      paperWarningShown = true;
      return;
    }

    // 如果使用者選擇跳過，自動填入預設的模擬論文資訊
    if (!state.fileName) {
      state.fileName = "demo_paper.pdf";
      state.researchSubject = "模擬研究主題";

      const fileBadge = document.getElementById('fileBadge');
      const fileName = document.getElementById('fileName');
      const subjectInput = document.getElementById('subjectInput');
      const resultSubjectInput = document.getElementById('resultSubjectInput');
      const subjectContainer = document.getElementById('subjectContainer');

      if (fileBadge) fileBadge.style.display = 'inline-flex';
      if (fileName) fileName.textContent = state.fileName;
      if (subjectInput) subjectInput.value = state.researchSubject;
      if (resultSubjectInput) resultSubjectInput.value = state.researchSubject;
      if (subjectContainer) subjectContainer.style.display = 'block';

      showToast("為您載入模擬論文數據", "info");
    }

    paperWarningShown = false;
    goStep(2);
  };

  window.setPackage = (type) => {
    state.seeds = 15;
    state.iters = type === 'normal' ? 3 : 1;

    document.querySelectorAll('.pkg-btn').forEach(b => b.classList.remove('active'));
    const target = document.getElementById(type === 'normal' ? 'pkgNormal' : 'pkgSimple');
    if (target) target.classList.add('active');

    updateEstimate();
  };

  window.selectOpt = (type, el, val) => {
    el.parentElement.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    if (type === 'seed') state.seeds = val; else state.iters = val;
    updateEstimate();
  };

  window.goStep = (n) => goStep(n);

  window.startGeneration = () => {
    // 1. 檢查登入
    if (!state.isLoggedIn) {
      showToast("請先登入帳戶！", "warning");
      toggleAuthModal(true);
      return;
    }

    // 2. 檢查論文上傳
    if (!state.fileName) {
      showToast("請先上傳核心論文 PDF！", "warning");
      return;
    }

    // 3. 計算點數消耗
    const cost = state.iters >= 3 ? 2 : 1;

    if (state.user.points < cost) {
      showToast("餘額點數不足，請先儲值！", "warning");
      toggleMemberModal(true);
      return;
    }

    // 扣除點數
    state.user.points -= cost;
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    state.pointRecords.unshift({
      type: "扣除",
      points: -cost,
      date: dateStr,
      desc: "分析生成提案"
    });

    // 更新 UI 上的點數顯示
    updateUserUI();
    showToast(`扣除 ${cost} 點，開始分析生成研究提案...`, "info");

    goStep(3);
    advanceGeneration(() => {
      showResults();
      showToast("研究提案已成功生成！", "success");
    });
  };

  // 綁定「分析另一篇」按鈕事件
  const analyzeAnotherBtn = document.getElementById('analyzeAnotherBtn');
  if (analyzeAnotherBtn) {
    analyzeAnotherBtn.onclick = () => {
      // 1. 重設上傳狀態與 UI
      state.fileName = '';
      state.researchSubject = '';
      state.isRegenerating = false;
      paperWarningShown = false;

      const fileBadge = document.getElementById('fileBadge');
      const fileName = document.getElementById('fileName');
      const uploadTitle = document.getElementById('uploadTitle');
      const uploadSub = document.getElementById('uploadSub');
      const subjectInput = document.getElementById('subjectInput');
      const resultSubjectInput = document.getElementById('resultSubjectInput');
      const subjectContainer = document.getElementById('subjectContainer');
      const mainDiscipline = document.getElementById('mainDiscipline');

      if (fileBadge) fileBadge.style.display = 'none';
      if (fileName) fileName.textContent = '';
      if (uploadTitle) uploadTitle.textContent = '拖放 PDF 論文，或點此選取';
      if (uploadSub) uploadSub.textContent = '支援 PDF 格式，最大 50MB';
      if (subjectInput) subjectInput.value = '';
      if (resultSubjectInput) resultSubjectInput.value = '';
      if (subjectContainer) subjectContainer.style.display = 'none';
      if (mainDiscipline) mainDiscipline.value = '';

      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.value = '';

      clearUploadError();

      // 2. 返回第一頁
      goStep(1);
      showToast("已重設狀態，請上傳新論文", "info");
    };
  }

  // 綁定「重新生成」按鈕事件
  const redoBtn = document.getElementById('redoBtn');
  if (redoBtn) {
    redoBtn.onclick = () => {
      state.isRegenerating = true;
      updateEstimate(); // 更新預估點數顯示九折
      goStep(2);
    };
  }

  window.rechargePoints = (pts, price) => rechargePoints(pts, price);
  window.openPaymentModal = (pts, price) => openPaymentModal(pts, price);
  window.closePaymentModal = () => closePaymentModal();

  // 初始化登入彈窗與支付彈窗事件
  initAuthEvents();
  initPaymentEvents();
  initConfirmModal();
  initGenerationErrorEvents();
  initDemoPanel();
}

document.addEventListener('DOMContentLoaded', init);
