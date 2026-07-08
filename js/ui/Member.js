import { state } from '../core/state.js';
import { updateUserUI } from './Navigation.js';
import { showToast } from '../utils/Toast.js';

let currentTransaction = { pts: 0, price: 0 };

export function toggleMemberModal(show) {
  const modal = document.getElementById('memberModal');
  if (modal) {
    modal.style.display = show ? 'flex' : 'none';
    if (show) {
      updateUserUI();
    }
  }
}

export function rechargePoints(pts, price) {
  // 轉接至新版金流彈窗
  openPaymentModal(pts, price);
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
window.renderPointRecords = renderPointRecords;

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

export function openPaymentModal(pts, price) {
  // 1. 關閉會員 Modal
  toggleMemberModal(false);
  
  // 2. 顯示支付 Modal 並重設各步驟視圖
  const paymentModal = document.getElementById('paymentModal');
  if (!paymentModal) return;
  
  // 紀錄當前交易狀態到臨時變數，以便付款完成後使用
  currentTransaction = { pts, price };
  
  showToast("已建立儲值訂單，即將進行模擬支付...", "info", 1500);
  
  // 填寫交易明細
  document.getElementById('payGoodsName').textContent = `儲值 ${pts} 點數`;
  document.getElementById('payAmount').textContent = `NT$ ${price.toLocaleString()}`;
  document.getElementById('lpPhoneAmount').textContent = `NT$ ${price.toLocaleString()}`;
  document.getElementById('lpSuccessPts').textContent = pts;
  document.getElementById('lpReceiptGoods').textContent = `儲值 ${pts} 點數`;
  document.getElementById('lpReceiptAmount').textContent = `NT$ ${price.toLocaleString()}`;
  
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
  
  // 重設為第一個視圖
  switchPayView('paySummaryView');
  
  // 重設 LINE Pay tab 為 QR 掃描
  switchLpTab('qr');
  
  // 顯示 Modal
  paymentModal.style.display = 'flex';
}

export function closePaymentModal() {
  const paymentModal = document.getElementById('paymentModal');
  if (paymentModal) paymentModal.style.display = 'none';
  // 重新開啟會員帳戶中心，好讓使用者看到更新後的點數
  toggleMemberModal(true);
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

  if (closePaymentBtn) {
    closePaymentBtn.onclick = () => {
      if (paymentModal) paymentModal.style.display = 'none';
      toggleMemberModal(true);
    };
  }

  if (paymentModal) {
    paymentModal.onclick = (e) => {
      if (e.target === paymentModal) {
        paymentModal.style.display = 'none';
        toggleMemberModal(true);
      }
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
      
      // 模擬金流加載 1.8 秒
      setTimeout(() => {
        state.user.points += currentTransaction.pts;
        
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
        
        state.pointRecords.unshift({
          type: "儲值",
          points: currentTransaction.pts,
          date: dateStr,
          desc: `LINE Pay 儲值 ${currentTransaction.pts} 點`
        });
        
        updateUserUI();
        switchPayView('paySuccessView');
        triggerLpConfetti();
        showToast(`儲值成功！已存入 ${currentTransaction.pts} 點數`, "success");
      }, 1800);
    };
  }

  if (paySuccessDoneBtn) {
    paySuccessDoneBtn.onclick = () => {
      closePaymentModal();
    };
  }
}

