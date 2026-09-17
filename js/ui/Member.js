import { state } from '../core/state.js';
import { goStep, updateUserUI } from './Navigation.js';
import { showToast } from '../utils/Toast.js';

let currentTransaction = {
  amount: 0,
  desc: '',
  onSuccess: null,
  orderNo: '',
  invoiceInfo: null,
  status: 'idle'
};

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

// 發票資訊資料模型
let invoiceInfo = {
  type: 'personal',          // 'personal' | 'company' | 'donate'
  donateCode: '',
  personalCarrier: 'member', // 'member' | 'mobile' | 'citizen'
  mobileBarcode: '',
  citizenCode: '',
  companyTaxId: '',
  companyTitle: '',
};

function clearFieldError(fieldId, errorId) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(errorId);
  if (input) input.classList.remove('has-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }
}

function showFieldError(fieldId, errorId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(errorId);
  if (input) input.classList.add('has-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }
}

// 重置發票表單狀態至預設值（個人電子發票 - 存於會員帳號）
export function resetInvoiceState() {
  invoiceInfo = {
    type: 'personal',
    donateCode: '',
    personalCarrier: 'member',
    mobileBarcode: '',
    citizenCode: '',
    companyTaxId: '',
    companyTitle: '',
  };

  // 清除所有錯誤
  ['donateCode', 'mobileBarcode', 'citizenCode', 'companyTaxId', 'companyTitle'].forEach(id => {
    clearFieldError(id, `${id}Error`);
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // 第一層 Radio 重置
  const typeRadios = document.querySelectorAll('input[name="invoiceType"]');
  typeRadios.forEach(radio => {
    radio.checked = radio.value === 'personal';
    const card = radio.closest('.invoice-type-card');
    if (card) {
      card.classList.toggle('active', radio.value === 'personal');
    }
  });

  // 第二層 Radio 重置
  const carrierRadios = document.querySelectorAll('input[name="personalCarrier"]');
  carrierRadios.forEach(radio => {
    radio.checked = radio.value === 'member';
    const opt = radio.closest('.carrier-option');
    if (opt) {
      opt.classList.toggle('active', radio.value === 'member');
    }
  });

  // 面板顯示重置
  const panelPersonal = document.getElementById('invoiceSubPersonal');
  const panelCompany = document.getElementById('invoiceSubCompany');
  const panelDonate = document.getElementById('invoiceSubDonate');
  if (panelPersonal) panelPersonal.style.display = 'block';
  if (panelCompany) panelCompany.style.display = 'none';
  if (panelDonate) panelDonate.style.display = 'none';

  const detailMember = document.getElementById('carrierDetailMember');
  const detailMobile = document.getElementById('carrierDetailMobile');
  const detailCitizen = document.getElementById('carrierDetailCitizen');
  if (detailMember) detailMember.style.display = 'block';
  if (detailMobile) detailMobile.style.display = 'none';
  if (detailCitizen) detailCitizen.style.display = 'none';
}

// 驗證當前發票分支欄位
function validateInvoice() {
  let isValid = true;
  const currentType = invoiceInfo.type;

  if (currentType === 'donate') {
    const donateInput = document.getElementById('donateCode');
    const val = donateInput ? donateInput.value.trim() : '';
    invoiceInfo.donateCode = val;
    if (!val) {
      showFieldError('donateCode', 'donateCodeError', '請輸入愛心碼');
      isValid = false;
    } else if (!/^\d{3,7}$/.test(val)) {
      showFieldError('donateCode', 'donateCodeError', '愛心碼格式錯誤，請輸入 3–7 碼數字');
      isValid = false;
    } else {
      clearFieldError('donateCode', 'donateCodeError');
    }
  } else if (currentType === 'personal') {
    const carrier = invoiceInfo.personalCarrier;
    if (carrier === 'mobile') {
      const mobileInput = document.getElementById('mobileBarcode');
      const val = mobileInput ? mobileInput.value.trim().toUpperCase() : '';
      invoiceInfo.mobileBarcode = val;
      if (!val) {
        showFieldError('mobileBarcode', 'mobileBarcodeError', '請輸入手機條碼');
        isValid = false;
      } else if (!/^\/[0-9A-Z]{7}$/.test(val)) {
        showFieldError('mobileBarcode', 'mobileBarcodeError', '手機條碼格式錯誤，須為 / 開頭加上 7 碼英數字（例：/ABC1234）');
        isValid = false;
      } else {
        clearFieldError('mobileBarcode', 'mobileBarcodeError');
      }
    } else if (carrier === 'citizen') {
      const citizenInput = document.getElementById('citizenCode');
      const val = citizenInput ? citizenInput.value.trim() : '';
      invoiceInfo.citizenCode = val;
      if (!val) {
        showFieldError('citizenCode', 'citizenCodeError', '請輸入自然人憑證條碼');
        isValid = false;
      } else {
        clearFieldError('citizenCode', 'citizenCodeError');
      }
    }
  } else if (currentType === 'company') {
    const taxIdInput = document.getElementById('companyTaxId');
    const titleInput = document.getElementById('companyTitle');
    const taxIdVal = taxIdInput ? taxIdInput.value.trim() : '';
    const titleVal = titleInput ? titleInput.value.trim() : '';
    invoiceInfo.companyTaxId = taxIdVal;
    invoiceInfo.companyTitle = titleVal;

    if (!taxIdVal) {
      showFieldError('companyTaxId', 'companyTaxIdError', '請輸入統一編號');
      isValid = false;
    } else {
      clearFieldError('companyTaxId', 'companyTaxIdError');
    }

    if (!titleVal) {
      showFieldError('companyTitle', 'companyTitleError', '請輸入發票抬頭（公司名稱）');
      isValid = false;
    } else {
      clearFieldError('companyTitle', 'companyTitleError');
    }
  }

  return isValid;
}

// 初始化發票相關切換與輸入監聽
export function initInvoiceEvents() {
  const typeRadios = document.querySelectorAll('input[name="invoiceType"]');
  const carrierRadios = document.querySelectorAll('input[name="personalCarrier"]');

  // 第一層發票類型切換
  typeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      invoiceInfo.type = radio.value;

      // 切換按鈕 active 樣式
      document.querySelectorAll('.invoice-type-card').forEach(c => {
        c.classList.toggle('active', c.querySelector('input').value === radio.value);
      });

      // 展開/收合面板
      const panelPersonal = document.getElementById('invoiceSubPersonal');
      const panelCompany = document.getElementById('invoiceSubCompany');
      const panelDonate = document.getElementById('invoiceSubDonate');

      if (panelPersonal) panelPersonal.style.display = radio.value === 'personal' ? 'block' : 'none';
      if (panelCompany) panelCompany.style.display = radio.value === 'company' ? 'block' : 'none';
      if (panelDonate) panelDonate.style.display = radio.value === 'donate' ? 'block' : 'none';

      // 切換即清空非目前分支之值與錯誤訊息
      if (radio.value !== 'donate') {
        const input = document.getElementById('donateCode');
        if (input) input.value = '';
        invoiceInfo.donateCode = '';
        clearFieldError('donateCode', 'donateCodeError');
      }
      if (radio.value !== 'personal') {
        const mInput = document.getElementById('mobileBarcode');
        const cInput = document.getElementById('citizenCode');
        if (mInput) mInput.value = '';
        if (cInput) cInput.value = '';
        invoiceInfo.mobileBarcode = '';
        invoiceInfo.citizenCode = '';
        clearFieldError('mobileBarcode', 'mobileBarcodeError');
        clearFieldError('citizenCode', 'citizenCodeError');
      }
      if (radio.value !== 'company') {
        const tInput = document.getElementById('companyTaxId');
        const titInput = document.getElementById('companyTitle');
        if (tInput) tInput.value = '';
        if (titInput) titInput.value = '';
        invoiceInfo.companyTaxId = '';
        invoiceInfo.companyTitle = '';
        clearFieldError('companyTaxId', 'companyTaxIdError');
        clearFieldError('companyTitle', 'companyTitleError');
      }
    });
  });

  // 第二層個人發票載具切換
  carrierRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      invoiceInfo.personalCarrier = radio.value;

      // 切換選項 active 樣式
      document.querySelectorAll('.carrier-option').forEach(c => {
        c.classList.toggle('active', c.querySelector('input').value === radio.value);
      });

      // 展開/收合詳細內容
      const detailMember = document.getElementById('carrierDetailMember');
      const detailMobile = document.getElementById('carrierDetailMobile');
      const detailCitizen = document.getElementById('carrierDetailCitizen');

      if (detailMember) detailMember.style.display = radio.value === 'member' ? 'block' : 'none';
      if (detailMobile) detailMobile.style.display = radio.value === 'mobile' ? 'block' : 'none';
      if (detailCitizen) detailCitizen.style.display = radio.value === 'citizen' ? 'block' : 'none';

      // 切換即清空非目前載具之值與錯誤訊息
      if (radio.value !== 'mobile') {
        const input = document.getElementById('mobileBarcode');
        if (input) input.value = '';
        invoiceInfo.mobileBarcode = '';
        clearFieldError('mobileBarcode', 'mobileBarcodeError');
      }
      if (radio.value !== 'citizen') {
        const input = document.getElementById('citizenCode');
        if (input) input.value = '';
        invoiceInfo.citizenCode = '';
        clearFieldError('citizenCode', 'citizenCodeError');
      }
    });
  });

  // 輸入時即時清除錯誤
  const inputMappings = [
    { id: 'donateCode', error: 'donateCodeError' },
    { id: 'mobileBarcode', error: 'mobileBarcodeError', uppercase: true },
    { id: 'citizenCode', error: 'citizenCodeError' },
    { id: 'companyTaxId', error: 'companyTaxIdError' },
    { id: 'companyTitle', error: 'companyTitleError' }
  ];

  inputMappings.forEach(({ id, error, uppercase }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        if (uppercase && el.value) {
          el.value = el.value.toUpperCase();
        }
        clearFieldError(id, error);
      });
    }
  });
}

// 切換付款彈窗中的 View
function showPayView(id) {
  document.querySelectorAll('#paymentModal .pay-view')
    .forEach(v => v.classList.toggle('active', v.id === id));

  const isNoHeaderView = id === 'payProcessingView' || id === 'payFailedView';

  const header = document.querySelector('#paymentModal .payment-header');
  if (header) header.classList.toggle('is-hidden', isNoHeaderView);

  const card = document.querySelector('#paymentModal .payment-card');
  if (card) card.classList.toggle('is-compact', isNoHeaderView);
}

// 複製文字到剪貼簿，含降級處理（非 HTTPS 或不支援 Clipboard API 時）
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // 降級方案
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

// 顯示付款未完成/失敗畫面 (供 Demo 面板或失敗情境呼叫)
export function showPaymentFailed() {
  const orderNoEl = document.getElementById('payFailedOrderNo');
  if (orderNoEl && currentTransaction.orderNo) {
    orderNoEl.textContent = currentTransaction.orderNo;
  }
  showPayView('payFailedView');

  const copyBtn = document.getElementById('payFailedOrderCopyBtn');
  if (copyBtn) {
    copyBtn.onclick = async () => {
      if (!currentTransaction.orderNo) return;
      try {
        await copyText(currentTransaction.orderNo);
        showToast('已複製訂單編號', 'success', 2000);
      } catch (err) {
        showToast('複製失敗，請手動選取複製', 'error', 3000);
      }
    };
  }
}

// 開啟付款視窗：本服務為單次收費（非首次使用依所選模式計費）
// amount: 應付金額；desc: 服務項目說明；onSuccess: 付款成功後要執行的動作（開始生成）
export function openPaymentModal({ amount, desc, onSuccess }) {
  const paymentModal = document.getElementById('paymentModal');
  if (!paymentModal) return;

  // 產生模擬訂單編號並固定存入 currentTransaction
  const now = new Date();
  const dateStr = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  const randomStr = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  const orderNo = `ORD${dateStr}${randomStr}`;

  currentTransaction = {
    amount,
    desc,
    onSuccess,
    orderNo,
    invoiceInfo: null,
    status: 'idle'
  };

  const goodsNameEl = document.getElementById('payGoodsName');
  const amountEl = document.getElementById('payAmount');
  const orderNoEl = document.getElementById('payOrderNo');

  if (goodsNameEl) goodsNameEl.textContent = desc;
  if (amountEl) amountEl.textContent = `NT$ ${amount.toLocaleString()}`;
  if (orderNoEl) orderNoEl.textContent = orderNo;

  // 還原按鈕狀態
  const startPayBtn = document.getElementById('startPayBtn');
  if (startPayBtn) {
    startPayBtn.disabled = false;
    startPayBtn.classList.remove('is-loading');
    startPayBtn.textContent = '前往付款';
  }

  // 開窗時一律先切回確認訂單明細 View
  showPayView('paySummaryView');

  // 重置發票表單至預設值
  resetInvoiceState();

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
  const payFailedBackBtn = document.getElementById('payFailedBackBtn');

  // 初始化發票事件綁定
  initInvoiceEvents();

  const cancelTransaction = () => {
    currentTransaction = {
      amount: 0,
      desc: '',
      onSuccess: null,
      orderNo: '',
      invoiceInfo: null,
      status: 'idle'
    };

    if (startPayBtn) {
      startPayBtn.disabled = false;
      startPayBtn.classList.remove('is-loading');
      startPayBtn.textContent = '前往付款';
    }

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

  // 付款未完成畫面：返回設定頁面
  if (payFailedBackBtn) {
    payFailedBackBtn.onclick = cancelTransaction;
  }

  // 點擊「前往付款」
  if (startPayBtn) {
    startPayBtn.onclick = () => {
      // 避免重複點擊
      if (currentTransaction.status !== 'idle') {
        return;
      }

      // 進行發票欄位必填與格式驗證
      if (!validateInvoice()) {
        return;
      }

      // 暫存發票資訊
      currentTransaction.invoiceInfo = { ...invoiceInfo };
      currentTransaction.status = 'processing';

      // 填入處理中畫面的訂單編號
      const procOrderNoEl = document.getElementById('payProcessingOrderNo');
      if (procOrderNoEl) procOrderNoEl.textContent = currentTransaction.orderNo;

      // 切換至付款處理中畫面（轉圈圈）
      showPayView('payProcessingView');

      /*
        正式版備註：#payProcessingView 呈現期間，正式串接時會等候金流端的付款結果 callback／查詢 API；
        收到成功結果才會執行關窗與收尾動作，若收到取消或失敗結果則改為顯示 #payFailedView
        （本次僅由 Demo 面板單獨觸發此畫面，正式流程的失敗判斷不在本次範圍）。
      */
      setTimeout(() => {
        // 若在等待期間彈窗已被取消或關閉，則不繼續執行
        if (currentTransaction.status !== 'processing') return;

        const successCb = currentTransaction.onSuccess;
        closePaymentModal();
        currentTransaction.status = 'idle';

        goStep(4);
        showToast('付款成功！開始為您分析生成研究提案...', 'success');
        if (typeof successCb === 'function') {
          successCb();
        }
      }, 3000);
    };
  }
}
