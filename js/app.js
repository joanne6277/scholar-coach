import { state } from './core/state.js';
import { goStep, updateUserUI } from './ui/Navigation.js';
import { showToast } from './utils/Toast.js';
import { updateEstimate, getGenerationPrice } from './ui/Settings.js';
import { renderDisciplineOptions, showUploadError, clearUploadError, checkPaperStructure, showStructureError, showPaperConfirmView } from './ui/Upload.js';
import { showResults } from './ui/Results.js';
import { advanceGeneration, hideGenerationError } from './ui/Generation.js';
import { toggleMemberModal, openPaymentModal, initPaymentEvents } from './ui/Member.js';
import { toggleAuthModal, initAuthEvents } from './ui/Auth.js';
import { initConfirmModal } from './utils/Confirm.js';
import { initDemoPanel } from './ui/DemoPanel.js';
import { initCookieConsent } from './ui/CookieConsent.js';

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
    state.fileSize = file.size;
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

    // 如果使用者選擇跳過，自動填入預設的模擬論文資訊（略過初步分析，視為合格範例論文）
    if (!state.fileName) {
      state.fileName = "demo_paper.pdf";
      state.fileSize = 500 * 1024; // 視為結構完整的合格範例論文
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
      paperWarningShown = false;
      showPaperConfirmView();
      goStep(2);
      return;
    }

    // 已上傳真實檔案：先進行一次初步分析，確認檔案包含標題與摘要
    paperWarningShown = false;
    showToast("正在進行初步分析...", "info", 1200);

    setTimeout(() => {
      if (!checkPaperStructure(state.fileSize)) {
        showStructureError();
        goStep(2);
        return;
      }
      showPaperConfirmView();
      goStep(2);
    }, 700);
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

  function formatNow() {
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  function runGeneration() {
    hideGenerationError();
    goStep(4);
    advanceGeneration(() => {
      showResults();
      showToast("研究提案已成功生成！", "success");
    });
  }

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

    const modeLabel = state.iters >= 3 ? "一般模式" : "簡易模式";
    const usageDesc = `${state.isRegenerating ? "重新生成研究提案" : "分析生成研究提案"}（${modeLabel}）`;
    const price = getGenerationPrice();

    // 3. 首次使用免費，直接放行生成
    if (!state.user.hasUsedFreeTrial) {
      state.user.hasUsedFreeTrial = true;
      state.usageRecords.unshift({
        type: "免費",
        amount: 0,
        date: formatNow(),
        desc: `${usageDesc}（首次免費）`
      });
      updateUserUI();
      showToast("首次使用免費，開始分析生成研究提案...", "info");
      runGeneration();
      return;
    }

    // 4. 非首次使用：點擊「開始生成」時開啟付款視窗，完成付款才開始生成
    openPaymentModal({
      amount: price,
      desc: usageDesc,
      onSuccess: () => {
        state.usageRecords.unshift({
          type: "付費",
          amount: price,
          date: formatNow(),
          desc: usageDesc
        });
        updateUserUI();
        runGeneration();
      }
    });
  };

  // 綁定「分析另一篇」按鈕事件
  const analyzeAnotherBtn = document.getElementById('analyzeAnotherBtn');
  if (analyzeAnotherBtn) {
    analyzeAnotherBtn.onclick = () => {
      // 1. 重設上傳狀態與 UI
      state.fileName = '';
      state.fileSize = 0;
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
      if (uploadSub) uploadSub.textContent = '支援 PDF 格式，最大 50MB，頁數上限 200 頁';
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

  // 綁定「初步分析失敗」畫面（Step2）的「重新上傳」按鈕事件
  const uploadAnalysisRetryBtn = document.getElementById('uploadAnalysisRetryBtn');
  if (uploadAnalysisRetryBtn) {
    uploadAnalysisRetryBtn.onclick = () => {
      state.fileName = '';
      state.fileSize = 0;
      state.researchSubject = '';

      const fileBadge = document.getElementById('fileBadge');
      const fileNameEl = document.getElementById('fileName');
      const subjectInput = document.getElementById('subjectInput');
      const resultSubjectInput = document.getElementById('resultSubjectInput');
      const subjectContainer = document.getElementById('subjectContainer');
      const fileInputEl = document.getElementById('fileInput');

      if (fileBadge) fileBadge.style.display = 'none';
      if (fileNameEl) fileNameEl.textContent = '';
      if (subjectInput) subjectInput.value = '';
      if (resultSubjectInput) resultSubjectInput.value = '';
      if (subjectContainer) subjectContainer.style.display = 'none';
      if (fileInputEl) fileInputEl.value = '';

      clearUploadError();
      goStep(1);
      showToast("請重新上傳符合條件的論文檔案", "info");
    };
  }

  // 綁定「確認論文資訊」畫面（Step2）事件
  // 標題與摘要僅供核對、無法修改，因此直接沿用分析階段已寫入 state 的內容進入 Step3
  const confirmContinueBtn = document.getElementById('confirmContinueBtn');
  if (confirmContinueBtn) {
    confirmContinueBtn.onclick = () => {
      goStep(3);
    };
  }

  const confirmBackBtn = document.getElementById('confirmBackBtn');
  if (confirmBackBtn) {
    confirmBackBtn.onclick = () => {
      goStep(1);
    };
  }

  // 綁定「重新生成」按鈕事件
  const redoBtn = document.getElementById('redoBtn');
  if (redoBtn) {
    redoBtn.onclick = () => {
      state.isRegenerating = true;
      goStep(3);
    };
  }

  // 綁定「生成中系統錯誤」畫面的「重新生成」按鈕事件：重跑 Step4 的生成動畫
  const genErrorBackBtn = document.getElementById('genErrorBackBtn');
  if (genErrorBackBtn) {
    genErrorBackBtn.onclick = () => {
      runGeneration();
    };
  }

  // 初始化登入彈窗與支付彈窗事件
  initAuthEvents();
  initPaymentEvents();
  initConfirmModal();
  initDemoPanel();
  initCookieConsent();
}

document.addEventListener('DOMContentLoaded', init);
