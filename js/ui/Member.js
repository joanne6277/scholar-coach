import { state } from '../core/state.js';
import { updateUserUI } from './Navigation.js';
import { showToast } from '../utils/Toast.js';

let currentTransaction = { amount: 0, desc: '', onSuccess: null };

export function toggleMemberModal(show) {
  const modal = document.getElementById('memberModal');
  if (modal) {
    modal.style.display = show ? 'flex' : 'none';
    if (show) {
      updateUserUI();
    }
  }
}

export function renderUsageRecords() {
  const list = document.getElementById('usageRecordsList');
  if (!list) return;
  list.innerHTML = '';
  state.usageRecords.forEach(r => {
    const item = document.createElement('div');
    item.className = 'record-item';
    const isFree = r.type === '免費';
    const amountLabel = isFree ? '免費使用' : `-NT$ ${r.amount}`;
    item.innerHTML = `
      <div class="record-desc">${r.desc}</div>
      <div class="record-pts ${isFree ? 'plus' : 'minus'}">${amountLabel}</div>
      <div class="record-date">${r.date}</div>
    `;
    list.appendChild(item);
  });
}
window.renderUsageRecords = renderUsageRecords;

// 開啟付款視窗：本服務為單次收費（非首次使用依所選模式計費）
// amount: 應付金額；desc: 服務項目說明；onSuccess: 付款成功後要執行的動作（開始生成）
export function openPaymentModal({ amount, desc, onSuccess }) {
  const paymentModal = document.getElementById('paymentModal');
  if (!paymentModal) return;

  currentTransaction = { amount, desc, onSuccess };

  document.getElementById('payGoodsName').textContent = desc;
  document.getElementById('payAmount').textContent = `NT$ ${amount.toLocaleString()}`;

  // 產生模擬交易編號
  const now = new Date();
  const dateStr = now.getFullYear() +
                  String(now.getMonth() + 1).padStart(2, '0') +
                  String(now.getDate()).padStart(2, '0') +
                  String(now.getHours()).padStart(2, '0') +
                  String(now.getMinutes()).padStart(2, '0') +
                  String(now.getSeconds()).padStart(2, '0');
  const randomStr = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  document.getElementById('payTradeNo').textContent = `TXN${dateStr}${randomStr}`;

  paymentModal.style.display = 'flex';
}

export function closePaymentModal() {
  const paymentModal = document.getElementById('paymentModal');
  if (paymentModal) paymentModal.style.display = 'none';
}

export function initPaymentEvents() {
  const closePaymentBtn = document.getElementById('closePaymentBtn');
  const paymentModal = document.getElementById('paymentModal');
  const startPayBtn = document.getElementById('startPayBtn');

  const cancelTransaction = () => {
    currentTransaction = { amount: 0, desc: '', onSuccess: null };
    closePaymentModal();
  };

  if (closePaymentBtn) {
    closePaymentBtn.onclick = cancelTransaction;
  }

  if (paymentModal) {
    paymentModal.onclick = (e) => {
      if (e.target === paymentModal) cancelTransaction();
    };
  }

  if (startPayBtn) {
    startPayBtn.onclick = () => {
      const onSuccess = currentTransaction.onSuccess;
      currentTransaction = { amount: 0, desc: '', onSuccess: null };
      closePaymentModal();
      showToast("付款成功！開始為您分析生成研究提案...", "success");
      if (onSuccess) onSuccess();
    };
  }
}
