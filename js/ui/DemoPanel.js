import { state } from '../core/state.js';
import { goStep, updateUserUI } from './Navigation.js';
import { showUploadError, showStructureError } from './Upload.js';
import { showGenerationFailure } from './Generation.js';
import { getGenerationCost } from './Settings.js';

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

  const errStructure = document.getElementById('demoErrStructure');
  if (errStructure) {
    errStructure.onclick = () => {
      ensureMainAppVisible();
      goStep(1);
      showStructureError();
    };
  }

  const errGen = document.getElementById('demoErrGen');
  if (errGen) {
    errGen.onclick = () => {
      ensureMainAppVisible();
      const cost = getGenerationCost();

      // 模擬真實生成流程：先扣點，失敗後才由「返回設定」退還
      if (state.user.points >= cost) {
        state.user.points -= cost;
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
        state.pointRecords.unshift({
          type: "扣除",
          points: -cost,
          date: dateStr,
          desc: "分析生成提案"
        });
        updateUserUI();
      }

      goStep(3);
      showGenerationFailure(cost);
    };
  }
}
