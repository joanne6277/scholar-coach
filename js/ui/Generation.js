import { state } from '../core/state.js';
import { genTitles } from '../config/styles.js';
import { goStep, updateUserUI } from './Navigation.js';
import { showResults } from './Results.js';
import { showToast } from '../utils/Toast.js';

let pendingRefund = 0;

export function advanceGeneration(onComplete, cost = 0) {
  pendingRefund = cost;
  let current = 0;
  const items = document.querySelectorAll('#genSteps li');
  const genTitle = document.getElementById('genTitle');
  const genSub = document.getElementById('genSub');
  const spinner = document.getElementById('spinner');

  if (spinner) spinner.style.display = 'block';

  function step() {
    items.forEach((li, i) => {
      li.classList.remove('active', 'done');
      if (i === current) li.classList.add('active');
      else if (i < current) li.classList.add('done');
    });
    if (current < genTitles.length) {
      genTitle.textContent = genTitles[current][0];
      genSub.textContent = genTitles[current][1];
    }
    current++;
    if (current <= genTitles.length) {
      setTimeout(step, 1100);
    } else {
      spinner.style.display = 'none';
      setTimeout(onComplete, 400);
    }
  }
  step();
}

export function showGenerationFailure(cost = pendingRefund) {
  pendingRefund = cost;
  const generatingView = document.querySelector('.generating-view');
  const errorView = document.getElementById('generationErrorView');
  const spinner = document.getElementById('spinner');

  if (spinner) spinner.style.display = 'none';
  if (generatingView) generatingView.style.display = 'none';
  if (errorView) errorView.style.display = 'block';
}

function hideGenerationFailure() {
  const generatingView = document.querySelector('.generating-view');
  const errorView = document.getElementById('generationErrorView');
  const items = document.querySelectorAll('#genSteps li');

  if (errorView) errorView.style.display = 'none';
  if (generatingView) generatingView.style.display = 'block';
  items.forEach((li, i) => {
    li.classList.remove('active', 'done');
    if (i === 0) li.classList.add('active');
  });
}

function refundPendingPoints() {
  if (pendingRefund <= 0) return;
  const refunded = pendingRefund;
  pendingRefund = 0;

  state.user.points += refunded;
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  state.pointRecords.unshift({
    type: "退款",
    points: refunded,
    date: dateStr,
    desc: "生成失敗，已退還點數"
  });

  updateUserUI();
  showToast(`已退還 ${refunded} 點，返回設定頁面`, "info");
}

export function initGenerationErrorEvents() {
  const backBtn = document.getElementById('genErrorBackBtn');
  const retryBtn = document.getElementById('genErrorRetryBtn');

  if (backBtn) {
    backBtn.onclick = () => {
      hideGenerationFailure();
      refundPendingPoints();
      goStep(2);
    };
  }

  if (retryBtn) {
    retryBtn.onclick = () => {
      hideGenerationFailure();
      advanceGeneration(() => {
        pendingRefund = 0;
        showResults();
        showToast("研究提案已成功生成！", "success");
      }, pendingRefund);
    };
  }
}
