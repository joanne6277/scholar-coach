import { theories } from './config/theories.js';
import { state } from './core/state.js';
import { goStep, updateUserUI } from './ui/Navigation.js';
import { renderTheories, updateEstimate } from './ui/Settings.js';
import { showResults } from './ui/Results.js';
import { advanceGeneration } from './ui/Generation.js';
import { toggleMemberModal, rechargePoints, openPaymentModal, closePaymentModal, initPaymentEvents } from './ui/Member.js';
import { toggleAuthModal, initAuthEvents } from './ui/Auth.js';

function init() {
  // Landing Page Start Button
  const startBtn = document.getElementById('startBtn');
  const landingPage = document.getElementById('landingPage');
  const mainApp = document.getElementById('mainApp');

  if (startBtn && landingPage && mainApp) {
    startBtn.onclick = () => {
      landingPage.style.display = 'none';
      mainApp.style.display = 'block';
    };
  }

  // Back to Landing
  const backToLanding = document.getElementById('backToLanding');
  if (backToLanding && landingPage && mainApp) {
    backToLanding.onclick = (e) => {
      e.preventDefault();
      mainApp.style.display = 'none';
      landingPage.style.display = 'flex';
    };
  }

  // Member Modal Events
  const memberBtn = document.getElementById('memberBtn');
  const loginBtn = document.getElementById('loginBtn');
  const closeMemberBtn = document.getElementById('closeMemberBtn');
  const memberModal = document.getElementById('memberModal');

  if (loginBtn) {
    loginBtn.onclick = () => {
      toggleAuthModal(true);
    };
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      state.isLoggedIn = false;
      toggleMemberModal(false);
      updateUserUI();
    };
  }

  if (memberBtn) memberBtn.onclick = () => toggleMemberModal(true);
  if (closeMemberBtn) closeMemberBtn.onclick = () => toggleMemberModal(false);
  if (memberModal) {
    memberModal.onclick = (e) => {
      if (e.target === memberModal) toggleMemberModal(false);
    };
  }

  // Subject Input Sync
  const subjectInput = document.getElementById('subjectInput');
  const resultSubjectInput = document.getElementById('resultSubjectInput');

  if (subjectInput) {
    subjectInput.oninput = (e) => {
      state.researchSubject = e.target.value;
      if (resultSubjectInput) resultSubjectInput.value = state.researchSubject;
    };
  }
  if (resultSubjectInput) {
    resultSubjectInput.oninput = (e) => {
      state.researchSubject = e.target.value;
      if (subjectInput) subjectInput.value = state.researchSubject;
    };
  }

  // Initial render
  renderTheories(updateEstimate);
  updateEstimate();
  updateUserUI();

  // Bind static events
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const fileBadge = document.getElementById('fileBadge');
  const fileName = document.getElementById('fileName');

  if (uploadZone && fileInput) {
    uploadZone.onclick = () => {
      if (!state.isLoggedIn) {
        toggleAuthModal(true);
        return;
      }
      fileInput.click();
    };
    fileInput.onchange = e => {
      if (e.target.files[0]) {
        const file = e.target.files[0];
        state.fileName = file.name;
        fileBadge.style.display = 'inline-flex';
        fileName.textContent = state.fileName;
        
        // Auto-fill subject with filename (minus extension)
        state.researchSubject = file.name.replace(/\.[^/.]+$/, "");
        const subjectInput = document.getElementById('subjectInput');
        const resultSubjectInput = document.getElementById('resultSubjectInput');
        const subjectContainer = document.getElementById('subjectContainer');
        
        if (subjectInput) subjectInput.value = state.researchSubject;
        if (resultSubjectInput) resultSubjectInput.value = state.researchSubject;
        if (subjectContainer) subjectContainer.style.display = 'block';
      }
    };
    uploadZone.addEventListener('dragover', e => { 
      e.preventDefault(); 
      if (state.isLoggedIn) uploadZone.classList.add('dragging'); 
    });
    uploadZone.addEventListener('dragleave', () => {
      if (state.isLoggedIn) uploadZone.classList.remove('dragging');
    });
    uploadZone.addEventListener('drop', e => {
      e.preventDefault();
      if (!state.isLoggedIn) return; // 未登入不可拖放
      uploadZone.classList.remove('dragging');
      if (e.dataTransfer.files[0]) {
        state.fileName = e.dataTransfer.files[0].name;
        fileBadge.style.display = 'inline-flex';
        fileName.textContent = state.fileName;
      }
    });
  }

  // Global functions exposed to HTML (or better, use event listeners)
  window.goToStep2Demo = () => {
    if (!state.isLoggedIn) {
      toggleAuthModal(true);
      return;
    }
    fileBadge.style.display = 'inline-flex';
    fileName.textContent = 'research_paper_demo.pdf';
    goStep(2);
  };

  window.setPackage = (type) => {
    let count = 0, s = 5, it = 1;
    if (type === 'simple') { count = 1; s = 5; it = 1; }
    else if (type === 'normal') { count = 3; s = 10; it = 1; }
    else if (type === 'advanced') { count = 5; s = 15; it = 2; }

    state.selectedTheories.clear();
    let added = 0;
    for (let di = 0; di < theories.length; di++) {
      for (let ti = 0; ti < theories[di].items.length; ti++) {
        if (added < count) {
          state.selectedTheories.add(`${di}-${ti}`);
          added++;
        }
      }
    }

    state.seeds = s;
    state.iters = it;

    // Update UI
    document.querySelectorAll('#seedOpts .opt-btn').forEach(b => {
      b.classList.toggle('selected', b.textContent.includes(s + ' 個'));
    });
    document.querySelectorAll('#iterOpts .opt-btn').forEach(b => {
      b.classList.toggle('selected', b.textContent.includes(it + ' 次'));
    });

    renderTheories(updateEstimate);
    updateEstimate();
  };

  const totalTheoriesCount = theories.reduce((acc, dir) => acc + dir.items.length, 0);

  window.toggleAllTheories = () => {
    if (state.selectedTheories.size === totalTheoriesCount) {
      state.selectedTheories.clear();
    } else {
      theories.forEach((dir, di) => {
        dir.items.forEach((_, ti) => {
          state.selectedTheories.add(`${di}-${ti}`);
        });
      });
    }
    renderTheories(updateEstimate);
    updateEstimate();
  };

  window.selectOpt = (type, el, val) => {
    el.parentElement.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    if (type === 'seed') state.seeds = val; else state.iters = val;
    updateEstimate();
  };

  window.goStep = (n) => goStep(n);

  window.startGeneration = () => {
    goStep(3);
    advanceGeneration(() => {
      showResults();
    });
  };

  window.toggleRevival = () => {
    const panel = document.getElementById('revivalPanel');
    if (panel) panel.classList.toggle('open');
  };

  window.rechargePoints = (pts, price) => rechargePoints(pts, price);
  window.openPaymentModal = (pts, price) => openPaymentModal(pts, price);
  window.closePaymentModal = () => closePaymentModal();
  
  // 初始化登入彈窗與支付彈窗事件
  initAuthEvents();
  initPaymentEvents();
}

document.addEventListener('DOMContentLoaded', init);
