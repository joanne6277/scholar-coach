let confirmCallback = null;

export function initConfirmModal() {
  const modal = document.getElementById('confirmModal');
  const cancelBtn = document.getElementById('confirmCancelBtn');
  const okBtn = document.getElementById('confirmOkBtn');
  if (!modal) return;

  const close = () => {
    modal.style.display = 'none';
    confirmCallback = null;
  };

  if (cancelBtn) cancelBtn.onclick = close;
  if (okBtn) {
    okBtn.onclick = () => {
      const cb = confirmCallback;
      close();
      if (cb) cb();
    };
  }
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}

export function showConfirm(message, onConfirm, title = '確定要執行此操作嗎？') {
  const modal = document.getElementById('confirmModal');
  if (!modal) {
    if (onConfirm) onConfirm();
    return;
  }
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmDesc').textContent = message;
  confirmCallback = onConfirm;
  modal.style.display = 'flex';
}
