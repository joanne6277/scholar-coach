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

  const isFree = !state.user.hasUsedFreeTrial;

  const pointEst = document.getElementById('pointEst');
  if (pointEst) {
    if (isFree) {
      pointEst.innerHTML = `<span style="color:#2a7a4f;font-weight:bold;">首次免費</span>`;
    } else {
      pointEst.textContent = `NT$ ${getGenerationPrice()}`;
    }
  }

  // 首次免費情境下，兩個方案卡片同時保留原價（劃線）與特價 $0
  updatePkgPriceDisplay('pkgSimple', PRICE_SIMPLE, isFree);
  updatePkgPriceDisplay('pkgNormal', PRICE_NORMAL, isFree);
}

function updatePkgPriceDisplay(prefix, price, isFree) {
  const originalEl = document.getElementById(`${prefix}PriceOriginal`);
  const specialEl = document.getElementById(`${prefix}PriceSpecial`);
  if (!originalEl || !specialEl) return;

  originalEl.textContent = `$${price}`;
  originalEl.classList.toggle('struck', isFree);
  specialEl.style.display = isFree ? 'inline' : 'none';
}
