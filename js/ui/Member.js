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

function switchPayView(viewId) {
  const views = document.querySelectorAll('.pay-view');
  views.forEach(v => v.classList.remove('active'));
  const activeView = document.getElementById(viewId);
  if (activeView) activeView.classList.add('active');
}

export function switchLpTab(tab) {
  const qrBtn = document.getElementById('lpTabQrBtn');
  const loginBtn = document.getElementById('lpTabLoginBtn');
  const qrContent = document.getElementById('lpTabQr');
  const loginContent = document.getElementById('lpTabLogin');

  if (tab === 'qr') {
    if (qrBtn) qrBtn.classList.add('active');
    if (loginBtn) loginBtn.classList.remove('active');
    if (qrContent) qrContent.style.display = 'block';
    if (loginContent) loginContent.style.display = 'none';
  } else {
    if (loginBtn) loginBtn.classList.add('active');
    if (qrBtn) qrBtn.classList.remove('active');
    if (loginContent) loginContent.style.display = 'block';
    if (qrContent) qrContent.style.display = 'none';
  }
}

// 開啟付款視窗：本服務為單次收費（非首次使用依所選模式計費）
// amount: 應付金額；desc: 服務項目說明；onSuccess: 付款成功後要執行的動作（開始生成）
export function openPaymentModal({ amount, desc, onSuccess }) {
  const paymentModal = document.getElementById('paymentModal');
  if (!paymentModal) return;

  currentTransaction = { amount, desc, onSuccess };

  showToast("已建立訂單，即將進行模擬支付...", "info", 1500);

  document.getElementById('payGoodsName').textContent = desc;
  document.getElementById('payAmount').textContent = `NT$ ${amount.toLocaleString()}`;
  document.getElementById('lpPhoneAmount').textContent = `NT$ ${amount.toLocaleString()}`;
  document.getElementById('lpReceiptGoods').textContent = desc;
  document.getElementById('lpReceiptAmount').textContent = `NT$ ${amount.toLocaleString()}`;

  // 產生模擬交易編號
  const now = new Date();
  const dateStr = now.getFullYear() +
                  String(now.getMonth() + 1).padStart(2, '0') +
                  String(now.getDate()).padStart(2, '0') +
                  String(now.getHours()).padStart(2, '0') +
                  String(now.getMinutes()).padStart(2, '0') +
                  String(now.getSeconds()).padStart(2, '0');
  const randomStr = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  document.getElementById('payTradeNo').textContent = `LP${dateStr}${randomStr}`;

  switchPayView('paySummaryView');
  switchLpTab('qr');

  paymentModal.style.display = 'flex';
}

export function closePaymentModal() {
  const paymentModal = document.getElementById('paymentModal');
  if (paymentModal) paymentModal.style.display = 'none';
}

function triggerLpConfetti() {
  const container = document.getElementById('lpConfettiContainer');
  if (!container) return;
  container.innerHTML = '';

  // LINE Pay 綠色風格的彩紙 (以綠色、金黃色、橘黃色、白色為主)
  const colors = ['#06C755', '#05b04b', '#ffd700', '#ffffff', '#e6f9ed', '#f39c12'];
  const count = 50;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    const size = Math.random() * 8 + 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const xDistance = (Math.random() * 200 - 100) + 'px';
    const rotation = (Math.random() * 720 - 360) + 'deg';
    const delay = Math.random() * 0.3;
    const duration = Math.random() * 1.2 + 0.8;

    piece.style.width = `${size}px`;
    piece.style.height = `${size}px`;
    piece.style.backgroundColor = color;
    piece.style.left = `${left}%`;
    piece.style.bottom = '0px';
    piece.style.setProperty('--x-distance', xDistance);
    piece.style.setProperty('--rotation', rotation);
    piece.style.animationDelay = `${delay}s`;
    piece.style.animationDuration = `${duration}s`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';

    container.appendChild(piece);
  }
}

export function initPaymentEvents() {
  const closePaymentBtn = document.getElementById('closePaymentBtn');
  const paymentModal = document.getElementById('paymentModal');
  const startPayBtn = document.getElementById('startPayBtn');
  const lpTabQrBtn = document.getElementById('lpTabQrBtn');
  const lpTabLoginBtn = document.getElementById('lpTabLoginBtn');
  const lpSubmitPayBtn = document.getElementById('lpSubmitPayBtn');
  const paySuccessDoneBtn = document.getElementById('paySuccessDoneBtn');

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
      switchPayView('payCheckoutView');
    };
  }

  if (lpTabQrBtn) {
    lpTabQrBtn.onclick = () => switchLpTab('qr');
  }

  if (lpTabLoginBtn) {
    lpTabLoginBtn.onclick = () => switchLpTab('login');
  }

  if (lpSubmitPayBtn) {
    lpSubmitPayBtn.onclick = () => {
      switchPayView('payProcessingView');

      // 模擬金流加載 1.8 秒（Demo 中一律模擬付款成功）
      setTimeout(() => {
        switchPayView('paySuccessView');
        triggerLpConfetti();
        showToast("付款成功！即將開始為您分析生成研究提案...", "success");
      }, 1800);
    };
  }

  if (paySuccessDoneBtn) {
    paySuccessDoneBtn.onclick = () => {
      const onSuccess = currentTransaction.onSuccess;
      currentTransaction = { amount: 0, desc: '', onSuccess: null };
      closePaymentModal();
      if (onSuccess) onSuccess();
    };
  }
}
