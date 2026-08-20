import { state } from '../core/state.js';
import { goStep, updateUserUI } from './Navigation.js';
import { showUploadError, showStructureError } from './Upload.js';
import { showGenerationError } from './Generation.js';
import { toggleAuthModal } from './Auth.js';
import { showToast } from '../utils/Toast.js';

function ensureMainAppVisible() {
  const landingPage = document.getElementById('landingPage');
  const mainApp = document.getElementById('mainApp');
  if (landingPage && mainApp && landingPage.style.display !== 'none') {
    landingPage.style.display = 'none';
    mainApp.style.display = 'block';
  }
}

// 上傳錯誤情境的前提都是使用者已登入（左上角登入區塊），未登入時導向登入並中止
function requireLoginForDemo() {
  ensureMainAppVisible();
  if (state.isLoggedIn) return true;
  showToast('請先於左上角登入後再測試此情境', 'warning');
  toggleAuthModal(true);
  return false;
}

export function initDemoPanel() {
  const toggle = document.getElementById('demoPanelToggle');
  const panel = document.getElementById('demoPanel');
  if (toggle && panel) {
    toggle.onclick = () => panel.classList.toggle('collapsed');
  }

  const errPdf = document.getElementById('demoErrPdf');
  if (errPdf) {
    errPdf.onclick = () => {
      if (!requireLoginForDemo()) return;
      goStep(1);
      showUploadError('檔案格式錯誤，請上傳 PDF 格式的論文文件');
    };
  }

  const errSize = document.getElementById('demoErrSize');
  if (errSize) {
    errSize.onclick = () => {
      if (!requireLoginForDemo()) return;
      goStep(1);
      showUploadError('檔案大小超過 50MB 上限，請壓縮後再試');
    };
  }

  const errPages = document.getElementById('demoErrPages');
  if (errPages) {
    errPages.onclick = () => {
      if (!requireLoginForDemo()) return;
      goStep(1);
      showUploadError('檔案頁數超過 200 頁上限，請確認為單篇論文後再試');
    };
  }

  const errStructure = document.getElementById('demoErrStructure');
  if (errStructure) {
    errStructure.onclick = () => {
      if (!requireLoginForDemo()) return;
      showStructureError();
      goStep(2);
    };
  }

  const errGenNetwork = document.getElementById('demoErrGenNetwork');
  if (errGenNetwork) {
    errGenNetwork.onclick = () => {
      if (!requireLoginForDemo()) return;
      goStep(4);
      showGenerationError();
    };
  }

  const freeTrialBtn = document.getElementById('demoFreeTrial');
  if (freeTrialBtn) {
    freeTrialBtn.onclick = () => {
      ensureMainAppVisible();
      state.user.hasUsedFreeTrial = false;
      state.usageRecords = [];
      updateUserUI();
      goStep(1);
    };
  }

  const paidUserBtn = document.getElementById('demoPaidUser');
  if (paidUserBtn) {
    paidUserBtn.onclick = () => {
      ensureMainAppVisible();
      state.user.hasUsedFreeTrial = true;
      updateUserUI();
    };
  }
}
