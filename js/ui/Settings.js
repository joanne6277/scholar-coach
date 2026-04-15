import { theories } from '../config/theories.js';
import { state } from '../core/state.js';

export function renderTheories(onSelect) {
  const g = document.getElementById('theoryGrid');
  if (!g) return;
  g.innerHTML = '';
  
  theories.forEach((dir, di) => {
    // 建立方向標題與說明
    const dirContainer = document.createElement('div');
    dirContainer.className = 'theory-direction-group';
    dirContainer.innerHTML = `
      <div class="dir-header">
        <div class="dir-title">${dir.direction}</div>
        <div class="dir-desc">${dir.directionDesc}</div>
      </div>
      <div class="dir-items"></div>
    `;
    
    const itemsGrid = dirContainer.querySelector('.dir-items');
    
    dir.items.forEach((t, ti) => {
      const key = `${di}-${ti}`;
      const c = document.createElement('div');
      c.className = 'theory-card' + (state.selectedTheories.has(key) ? ' selected' : '');
      c.innerHTML = `
        <div class="t-name">${t.name}</div>
        <div class="t-subname">${t.subName}</div>
        <div class="t-desc">${t.desc}</div>
      `;
      c.onclick = () => {
        if (state.selectedTheories.has(key)) state.selectedTheories.delete(key);
        else state.selectedTheories.add(key);
        renderTheories(onSelect);
        onSelect();
      };
      itemsGrid.appendChild(c);
    });
    
    g.appendChild(dirContainer);
  });
  
  document.getElementById('theoryCount').textContent = `已選 ${state.selectedTheories.size} 種`;
}

export function updateEstimate() {
  const n = state.selectedTheories.size;
  const { seeds, iters } = state;
  const mins = Math.max(1, Math.round((n * seeds * iters * 0.4 + 60) / 60));
  document.getElementById('timeEst').textContent = `約 ${mins} 分鐘`;
  document.getElementById('estDetail').textContent = `${n} 理論 × ${seeds} 想法 × ${iters} 迭代`;

  let pts = n + Math.max(0, (seeds / 5) - 1) + (iters - 1);
  if (pts < 0) pts = 0;
  document.getElementById('pointEst').textContent = `共花費 ${pts} 點`;

  document.querySelectorAll('.pkg-btn').forEach(b => b.classList.remove('active'));
  // 由於數據結構改變，套裝方案的 logic 也需要調整，此處暫不更動以維持原意，僅更新 UI 狀態
}
