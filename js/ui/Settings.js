import { state } from '../core/state.js';

export function renderTheories() {
  // 理論由系統固定提供，無需動態渲染
}

export function updateEstimate() {
  const { seeds, iters } = state;
  const mins = Math.max(1, Math.round((10 * seeds * iters * 0.4 + 60) / 60));
  document.getElementById('timeEst').textContent = `約 ${mins} 分鐘`;

  const pts = iters >= 3 ? 2 : 1;

  if (state.isRegenerating) {
    document.getElementById('pointEst').innerHTML = `<span style="color:#e53e3e;font-weight:bold;">${pts} 點 (九折優惠)</span>`;
  } else {
    document.getElementById('pointEst').textContent = `${pts} 點`;
  }
}
