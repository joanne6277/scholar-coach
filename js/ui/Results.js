import { tagStyles, numStyles } from '../config/styles.js';
import { proposals, eliminated } from '../mock/proposals.js';
import { state } from '../core/state.js';
import { goStep } from './Navigation.js';
import { showToast } from '../utils/Toast.js';

export function showResults() {
  goStep(4);
  const paperDisplay = document.getElementById('displayPaperName');
  if (paperDisplay) paperDisplay.textContent = state.fileName || 'research_paper_demo.pdf';

  const resultSubjectInput = document.getElementById('resultSubjectInput');
  if (resultSubjectInput) resultSubjectInput.value = state.researchSubject || '未命名研究主題';

  const list = document.getElementById('proposalList');
  if (!list) return;
  list.innerHTML = '';
  proposals.forEach((p, i) => {
    const ts = tagStyles[i % tagStyles.length];
    const ns = numStyles[i % numStyles.length];
    const card = document.createElement('div');
    card.className = 'proposal-card';
    card.innerHTML = `
      <div class="proposal-header" data-index="${i}">
        <div class="proposal-num" style="background:${ns.bg};color:${ns.color}">${i + 1}</div>
        <div class="proposal-title">${p.title}</div>
        <span class="chevron" id="chev${i}">›</span>
      </div>
      <div class="proposal-body" id="body${i}">
        <div class="proposal-stats">
          <div class="stat-item">
            <div class="stat-label">勝場數</div>
            <div class="stat-value">${p.wins}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">新穎性</div>
            <div class="stat-value">${p.novelty}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">方法論</div>
            <div class="stat-value" style="font-size:11px">${p.methodology}</div>
          </div>
        </div>
        <div class="proposal-section"><div class="ps-label">問題闡述</div><div class="ps-text">${p.problem}</div></div>
        <div class="proposal-section"><div class="ps-label">現有方法比較</div><div class="ps-text">${p.comparison}</div></div>
        <div class="proposal-section"><div class="ps-label">研究動機</div><div class="ps-text">${p.motivation}</div></div>
        <div class="proposal-section"><div class="ps-label">提案方法</div><div class="ps-text">${p.method}</div></div>
        <div class="proposal-section"><div class="ps-label">試驗計畫</div><div class="ps-text">${p.experiment}</div></div>
        <div class="proposal-section">
          <div class="ps-label">參考文獻</div>
          <div class="ref-container">
            <button class="ref-toggle-btn" data-index="${i}">
              顯示參考文獻 (2) <span class="ref-chevron" id="refChev${i}">›</span>
            </button>
            <ul class="ref-list" id="refList${i}">
              <li>Smith, J. et al. (2023). Multi-modal sensing for mental health. <i>Nature Digital Medicine</i>.</li>
              <li>Chen, L. (2022). Heart rate variability as a biomarker for depression. <i>Journal of Affective Disorders</i>.</li>
            </ul>
          </div>
        </div>
        <div class="card-actions">
          <div class="feedback-actions">
            <button class="like-btn" id="likebtn${i}" data-index="${i}">
              <svg class="fb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h6.29a2 2 0 0 1 1.94 2.5l-2.66 8A2 2 0 0 1 17.63 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h.94a2 2 0 0 1 2 2.1z"/></svg>
              <span>有幫助</span>
            </button>
            <button class="dislike-btn" id="dislikebtn${i}" data-index="${i}">
              <svg class="fb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H3.71a2 2 0 0 1-1.94-2.5l2.66-8A2 2 0 0 1 6.37 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h-.94a2 2 0 0 1-2-2.1z"/></svg>
              <span>沒幫助</span>
            </button>
          </div>
          <button class="copy-btn" id="copybtn${i}" data-index="${i}">
            <span>&#10697;</span> 複製提案
          </button>
        </div>
      </div>`;
    list.appendChild(card);
  });

  // Event delegation or direct binding
  list.querySelectorAll('.proposal-header').forEach(header => {
    header.onclick = () => toggleProposal(header.dataset.index);
  });
  list.querySelectorAll('.copy-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      copyProposal(btn.dataset.index);
    };
  });
  list.querySelectorAll('.like-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      handleFeedback(btn.dataset.index, 'like');
    };
  });
  list.querySelectorAll('.dislike-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      handleFeedback(btn.dataset.index, 'dislike');
    };
  });
  list.querySelectorAll('.ref-toggle-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      toggleReferences(btn.dataset.index);
    };
  });

  const elList = document.getElementById('eliminatedList');
  if (!elList) return;
  elList.innerHTML = '';
  eliminated.forEach((e, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span style="font-size:10px;background:#fde8e8;color:#a32d2d;padding:2px 6px;border-radius:4px;white-space:nowrap">已淘汰</span> ${e} <button class="revive-btn" data-index="${i}">復活此方向</button>`;
    elList.appendChild(li);
  });
  elList.querySelectorAll('.revive-btn').forEach(btn => {
    btn.onclick = () => {
      btn.textContent = '已加入提案';
      btn.style.color = '#2a7a4f';
      btn.style.borderColor = '#7fc99a';
      btn.disabled = true;
      showToast("已成功將該方向復活，加入研究提案列表！", "success");
    };
  });

  // 預設展開第一個提案卡片，方便使用者直接看見正/倒讚與複製按鈕
  setTimeout(() => {
    toggleProposal(0);
  }, 100);
}

export function toggleProposal(i) {
  const body = document.getElementById('body' + i);
  const chev = document.getElementById('chev' + i);
  if (!body || !chev) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chev.style.transform = isOpen ? '' : 'rotate(90deg)';
}

export function toggleReferences(i) {
  const list = document.getElementById('refList' + i);
  const chev = document.getElementById('refChev' + i);
  if (!list || !chev) return;
  const isOpen = list.classList.contains('open');
  list.classList.toggle('open', !isOpen);
  chev.style.transform = isOpen ? '' : 'rotate(90deg)';

  const btn = document.querySelector(`.ref-toggle-btn[data-index="${i}"]`);
  if (btn) {
    btn.firstChild.textContent = isOpen ? '顯示參考文獻 (2) ' : '隱藏參考文獻 ';
  }
}

export function copyProposal(i) {
  const p = proposals[i];
  const text = `【${p.title}】\n\n問題闡述：${p.problem}\n\n現有方法比較：${p.comparison}\n\n研究動機：${p.motivation}\n\n提案方法：${p.method}\n\n試驗計畫：${p.experiment}`;
  navigator.clipboard.writeText(text).catch(() => { });
  const btn = document.getElementById('copybtn' + i);
  if (!btn) return;
  btn.classList.add('copied');
  btn.innerHTML = '<span>&#10003;</span> 已複製';
  showToast("提案已複製到剪貼簿！", "success");
  setTimeout(() => {
    btn.classList.remove('copied');
    btn.innerHTML = '<span>&#10697;</span> 複製提案';
  }, 2000);
}

export function handleFeedback(index, type) {
  const likeBtn = document.getElementById('likebtn' + index);
  const dislikeBtn = document.getElementById('dislikebtn' + index);
  if (!likeBtn || !dislikeBtn) return;

  if (type === 'like') {
    if (likeBtn.classList.contains('active')) {
      likeBtn.classList.remove('active');
    } else {
      likeBtn.classList.add('active');
      dislikeBtn.classList.remove('active');
      showToast("感謝您的正讚回饋！", "success", 2000);
    }
  } else if (type === 'dislike') {
    if (dislikeBtn.classList.contains('active')) {
      dislikeBtn.classList.remove('active');
    } else {
      dislikeBtn.classList.add('active');
      likeBtn.classList.remove('active');
      showToast("已收到您的倒讚回饋，我們將持續優化生成品質！", "info", 2000);
    }
  }
}
