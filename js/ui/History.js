import { state } from '../core/state.js';
import { showToast } from '../utils/Toast.js';

export function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  list.innerHTML = '';
  if (state.history.length === 0) {
    list.innerHTML = '<li class="history-item" style="color:#aaa; cursor:default; justify-content:center">尚無紀錄</li>';
    return;
  }
  state.history.forEach(h => {
    const item = document.createElement('li');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-content">
        <div>${h.title}</div>
        <div style="font-size:11px;color:#aaa;margin-top:4px">${h.time}</div>
      </div>
      <button class="history-delete-btn" data-id="${h.id}">&#10005;</button>
    `;
    item.onclick = () => {
       // Demo: Load this history
       showToast(`已成功載入歷史紀錄：${h.title}`, "success");
    };
    const delBtn = item.querySelector('.history-delete-btn');
    delBtn.onclick = (e) => {
      e.stopPropagation();
      state.history = state.history.filter(item => item.id !== h.id);
      renderHistory();
      showToast("歷史紀錄已刪除", "info");
    };
    list.appendChild(item);
  });
}
