import { state } from '../core/state.js';
import { updateUserUI } from './Navigation.js';
import { showToast } from '../utils/Toast.js';

export function toggleAuthModal(show) {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.style.display = show ? 'flex' : 'none';
    if (show) {
      switchAuthView('authMainView');
      // 清空自訂輸入
      const nameInput = document.getElementById('customName');
      const emailInput = document.getElementById('customEmail');
      if (nameInput) nameInput.value = '';
      if (emailInput) emailInput.value = '';
    }
  }
}

function switchAuthView(viewId) {
  const views = document.querySelectorAll('.auth-view');
  views.forEach(v => {
    v.classList.remove('active');
  });
  const activeView = document.getElementById(viewId);
  if (activeView) {
    activeView.classList.add('active');
  }
}

// 產生彩紙碎屑效果
function triggerConfetti() {
  const container = document.getElementById('confettiContainer');
  if (!container) return;
  container.innerHTML = '';

  const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9b51e0', '#f39c12', '#27ae60'];
  const count = 60;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    
    // 隨機屬性
    const size = Math.random() * 8 + 6; // 6px - 14px
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100; // 0% - 100%
    const xDistance = (Math.random() * 200 - 100) + 'px'; // -100px 到 100px
    const rotation = (Math.random() * 720 - 360) + 'deg';
    const delay = Math.random() * 0.3; // 0s - 0.3s
    const duration = Math.random() * 1.2 + 0.8; // 0.8s - 2.0s

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

// 模擬 Google 第三方登入/註冊驗證流程
function processLogin(name, email, avatar) {
  switchAuthView('authStatusView');
  
  const spinnerWrapper = document.getElementById('authSpinnerWrapper');
  const successWrapper = document.getElementById('authSuccessWrapper');
  const statusText = document.getElementById('authStatusText');
  
  if (spinnerWrapper) spinnerWrapper.style.display = 'flex';
  if (successWrapper) successWrapper.style.display = 'none';
  if (statusText) statusText.textContent = '正在與 Google 安全連線...';

  // 階段 1：與 Google 連線
  setTimeout(() => {
    if (statusText) statusText.textContent = '正在驗證帳戶授權...';
    
    // 階段 2：完成驗證，顯示成功動畫
    setTimeout(() => {
      if (spinnerWrapper) spinnerWrapper.style.display = 'none';
      if (successWrapper) successWrapper.style.display = 'flex';
      
      const title = document.getElementById('authSuccessTitle');
      const subtitle = document.getElementById('authSuccessSubtitle');
      if (title) title.textContent = `歡迎回來，${name}！`;
      if (subtitle) subtitle.textContent = '登入成功，正在為您載入 Scholar Coach...';
      
      triggerConfetti();

      // 階段 3：更新狀態與 UI，關閉 Modal
      setTimeout(() => {
        state.isLoggedIn = true;
        state.user = {
          name: name,
          status: '專業版會員',
          points: state.user.points || 125, // 保留或重設點數
          email: email,
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
        };
        
        updateUserUI();
        toggleAuthModal(false);
        showToast(`歡迎回來，${name}！`, 'success');
      }, 1800);

    }, 1200);

  }, 1000);
}

// 初始化所有登入相關事件
export function initAuthEvents() {
  const closeBtn = document.getElementById('closeAuthBtn');
  const modal = document.getElementById('authModal');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const accountDefault = document.getElementById('googleAccountDefault');
  const accountOther = document.getElementById('googleAccountOther');
  const customBackBtn = document.getElementById('customBackBtn');
  const customForm = document.getElementById('authCustomForm');

  if (closeBtn) {
    closeBtn.onclick = () => toggleAuthModal(false);
  }

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) toggleAuthModal(false);
    };
  }

  if (googleLoginBtn) {
    googleLoginBtn.onclick = () => switchAuthView('authGoogleChooseView');
  }

  if (accountDefault) {
    accountDefault.onclick = () => {
      processLogin('林小明', 'xiaoming.lin@gmail.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
    };
  }

  if (accountOther) {
    accountOther.onclick = () => switchAuthView('authCustomAccountView');
  }

  if (customBackBtn) {
    customBackBtn.onclick = () => switchAuthView('authGoogleChooseView');
  }

  if (customForm) {
    customForm.onsubmit = (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('customName');
      const emailInput = document.getElementById('customEmail');
      
      if (nameInput && emailInput && nameInput.value.trim() && emailInput.value.trim()) {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
        processLogin(name, email, avatar);
      }
    };
  }
}
