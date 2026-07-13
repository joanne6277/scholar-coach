import { goStep } from './Navigation.js';
import { showUploadError } from './Upload.js';
import { showGenerationFailure } from './Generation.js';

function ensureMainAppVisible() {
  const landingPage = document.getElementById('landingPage');
  const mainApp = document.getElementById('mainApp');
  if (landingPage && mainApp && landingPage.style.display !== 'none') {
    landingPage.style.display = 'none';
    mainApp.style.display = 'block';
  }
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
      ensureMainAppVisible();
      goStep(1);
      showUploadError('檔案格式錯誤，請上傳 PDF 格式的論文文件');
    };
  }

  const errSize = document.getElementById('demoErrSize');
  if (errSize) {
    errSize.onclick = () => {
      ensureMainAppVisible();
      goStep(1);
      showUploadError('檔案大小超過 50MB 上限，請壓縮後再試');
    };
  }

  const errGen = document.getElementById('demoErrGen');
  if (errGen) {
    errGen.onclick = () => {
      ensureMainAppVisible();
      goStep(3);
      showGenerationFailure();
    };
  }
}
