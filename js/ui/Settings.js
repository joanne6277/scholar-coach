import { state } from '../core/state.js';

export const PRICE_SIMPLE = 30;
export const PRICE_NORMAL = 60;

export function renderTheories() {
  // 理論由系統固定提供，無需動態渲染
}

export function getGenerationPrice() {
  return state.iters >= 3 ? PRICE_NORMAL : PRICE_SIMPLE;
}

export function updateEstimate() {
  const { seeds, iters } = state;
  const mins = Math.max(1, Math.round((10 * seeds * iters * 0.4 + 60) / 60));
  document.getElementById('timeEst').textContent = `約 ${mins} 分鐘`;

  const pointEst = document.getElementById('pointEst');
  if (!pointEst) return;

  if (state.user.hasUsedFreeTrial) {
    pointEst.textContent = `NT$ ${getGenerationPrice()}`;
  } else {
    pointEst.innerHTML = `<span style="color:#2a7a4f;font-weight:bold;">首次免費</span>`;
  }
}
