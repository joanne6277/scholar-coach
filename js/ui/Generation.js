import { genTitles } from '../config/styles.js';

export function advanceGeneration(onComplete) {
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

// 生成過程中因網路或伺服器異常中斷（僅供 Demo 面板觸發展示，非正式流程中的隨機失敗）
export function showGenerationError() {
  const generatingView = document.getElementById('generatingView');
  const errorView = document.getElementById('generationErrorView');
  if (generatingView) generatingView.style.display = 'none';
  if (errorView) errorView.style.display = 'block';
}

export function hideGenerationError() {
  const generatingView = document.getElementById('generatingView');
  const errorView = document.getElementById('generationErrorView');
  if (errorView) errorView.style.display = 'none';
  if (generatingView) generatingView.style.display = 'block';
}
