// Toast 提示工具 (Premium Style)

let toastContainer = null;

function createToastContainer() {
  toastContainer = document.createElement('div');
  toastContainer.id = 'toastContainer';
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
}

/**
 * 顯示一個 Toast 提示訊息
 * @param {string} message 提示訊息內容
 * @param {'success' | 'error' | 'warning' | 'info'} type 提示類型
 * @param {number} duration 顯示時間 (ms)
 */
export function showToast(message, type = 'info', duration = 5000) {
  if (!toastContainer) {
    createToastContainer();
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  // 根據類型選擇圖示
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  else if (type === 'error') icon = '❌';
  else if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-text">${message}</span>
    <button class="toast-close">&times;</button>
  `;

  // 關閉按鈕事件
  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      removeToast(toast);
    };
  }

  toastContainer.appendChild(toast);

  // 定時自動移除
  setTimeout(() => {
    removeToast(toast);
  }, duration);
}

function removeToast(toast) {
  if (toast.classList.contains('toast-leaving')) return;
  toast.classList.add('toast-leaving');

  // 移除 forwards 動畫，確保 transition 能順利運作
  toast.style.animation = 'none';

  let removed = false;
  const doRemove = () => {
    if (removed) return;
    removed = true;
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  };

  toast.addEventListener('transitionend', doRemove);
  // 400ms 後強制移除 (CSS transition 是 0.3s)
  setTimeout(doRemove, 400);
}
