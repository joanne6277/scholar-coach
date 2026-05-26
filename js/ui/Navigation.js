import { state } from '../core/state.js';
import { renderHistory } from './History.js';
import { renderDisciplineOptions } from './Upload.js';

export function goStep(n) {
  state.currentStep = n;
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const targetStep = document.getElementById('step' + n);
  if (targetStep) targetStep.classList.add('active');

  ['ps1', 'ps2', 'ps3', 'ps4'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active', 'done');
    if (i + 1 === n) el.classList.add('active');
    else if (i + 1 < n) el.classList.add('done');
  });
  window.scrollTo(0, 0);
}

export function updateUserUI() {
  const { user, isLoggedIn } = state;
  const loginBtn = document.getElementById('loginBtn');
  const memberBtn = document.getElementById('memberBtn');
  const historyContainer = document.getElementById('historyContainer');
  const uploadZone = document.getElementById('uploadZone');
  const uploadTitle = document.getElementById('uploadTitle');
  const uploadSub = document.getElementById('uploadSub');
  const uploadIcon = document.getElementById('uploadIcon');
  const step1Cta = document.getElementById('step1Cta');
  const step1Note = document.getElementById('step1Note');

  if (isLoggedIn) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (memberBtn) memberBtn.style.display = 'flex';
    if (historyContainer) historyContainer.style.display = 'block';
    
    if (uploadZone) uploadZone.classList.remove('locked');
    if (uploadTitle) uploadTitle.textContent = '拖放 PDF 論文，或點此選取';
    if (uploadSub) uploadSub.textContent = '支援 PDF 格式，最大 50MB';
    if (uploadIcon) {
      uploadIcon.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style="margin:0 auto 1rem;display:block;opacity:0.3">
          <rect x="8" y="4" width="18" height="26" rx="2" stroke="#1a1a18" stroke-width="1.5" />
          <path d="M20 4v6h6" stroke="#1a1a18" stroke-width="1.5" />
          <path d="M20 20v10M20 30l-4-4M20 30l4-4" stroke="#1a1a18" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      `;
    }

    if (step1Cta) step1Cta.style.display = 'flex';
    if (step1Note) step1Note.style.display = 'block';

    document.getElementById('userName').textContent = user.name;
    const userStatusEl = document.getElementById('userStatus');
    if (userStatusEl) {
      userStatusEl.textContent = user.status.replace('會員', '');
    }
    document.getElementById('userPoints').textContent = user.points;
    document.getElementById('modalPoints').textContent = user.points;
    document.getElementById('profileName').textContent = user.name;
    
    if (window.renderPointRecords) {
      window.renderPointRecords();
    }
    renderHistory();
    renderDisciplineOptions();
  } else {
    if (loginBtn) loginBtn.style.display = 'flex';
    if (memberBtn) memberBtn.style.display = 'none';
    if (historyContainer) historyContainer.style.display = 'none';
    
    if (uploadZone) uploadZone.classList.add('locked');
    if (uploadTitle) uploadTitle.textContent = '請先登入以解鎖上傳功能';
    if (uploadSub) uploadSub.textContent = '登入後即可拖放 PDF 論文，或點此選取';
    if (uploadIcon) {
      uploadIcon.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 1rem;display:block;opacity:0.3">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      `;
    }

    if (step1Cta) step1Cta.style.display = 'none';
    if (step1Note) step1Note.style.display = 'none';
  }
}
