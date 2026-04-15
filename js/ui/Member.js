import { state } from '../core/state.js';
import { updateUserUI } from './Navigation.js';

export function toggleMemberModal(show) {
  const modal = document.getElementById('memberModal');
  if (modal) {
    modal.style.display = show ? 'flex' : 'none';
    if (show) updateUserUI();
  }
}

export function rechargePoints(pts, price) {
  if (confirm(`確認要儲值 ${pts} 點嗎？ (模擬扣款 NT$ ${price})`)) {
    state.user.points += pts;
    updateUserUI();
    alert(`儲值成功！目前點數：${state.user.points}`);
  }
}

export function renderPointRecords() {
  const list = document.getElementById('pointRecordsList');
  if (!list) return;
  list.innerHTML = '';
  state.pointRecords.forEach(r => {
    const item = document.createElement('div');
    item.className = 'record-item';
    item.innerHTML = `
      <div class="record-desc">${r.desc}</div>
      <div class="record-pts ${r.points > 0 ? 'plus' : 'minus'}">${r.points > 0 ? '+' : ''}${r.points} Pts</div>
      <div class="record-date">${r.date}</div>
    `;
    list.appendChild(item);
  });
}
