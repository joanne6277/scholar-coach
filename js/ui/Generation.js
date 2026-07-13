import { genTitles } from '../config/styles.js';
import { goStep } from './Navigation.js';
import { showResults } from './Results.js';
import { showToast } from '../utils/Toast.js';

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

export function showGenerationFailure() {
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

export function initGenerationErrorEvents() {
  const backBtn = document.getElementById('genErrorBackBtn');
  const retryBtn = document.getElementById('genErrorRetryBtn');

  if (backBtn) {
    backBtn.onclick = () => {
      hideGenerationFailure();
      goStep(2);
    };
  }

  if (retryBtn) {
    retryBtn.onclick = () => {
      hideGenerationFailure();
      advanceGeneration(() => {
        showResults();
        showToast("研究提案已成功生成！", "success");
      });
    };
  }
}
