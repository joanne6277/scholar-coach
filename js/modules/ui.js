import { theories, tagStyles, numStyles, proposals, eliminated, genTitles, disciplines } from './data.js';
import { state } from './state.js';

export function renderDisciplineOptions() {
  const main = document.getElementById('mainDiscipline');
  const sub = document.getElementById('subDiscipline');
  if (!main || !sub) return;

  // 避免重複渲染
  if (main.options.length > 1) return;

  Object.keys(disciplines).forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    main.appendChild(opt);
  });

  main.onchange = () => {
    const val = main.value;
    sub.innerHTML = '<option value="">請選擇子學科</option>';
    if (val && disciplines[val]) {
      sub.disabled = false;
      disciplines[val].forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        sub.appendChild(opt);
      });
    } else {
      sub.disabled = true;
    }
  };
}

export function renderConditions() {
  const banner = document.getElementById('generationConditions');
  if (!banner) return;
  const { selectedTheories, seeds, iters } = state;
  const theoryNames = Array.from(selectedTheories).map(i => theories[i].name).join('、');
  banner.innerHTML = `
    <div class="condition-item"><span class="condition-label">所選理論：</span><span class="condition-value">${theoryNames}</span></div>
    <div class="condition-item"><span class="condition-label">種子數：</span><span class="condition-value">${seeds} 個</span></div>
    <div class="condition-item"><span class="condition-label">迭代次數：</span><span class="condition-value">${iters} 次</span></div>
  `;
}


export function renderTheories(onSelect) {
  const g = document.getElementById('theoryGrid');
  if (!g) return;
  g.innerHTML = '';
  theories.forEach((t, i) => {
    const c = document.createElement('div');
    c.className = 'theory-card' + (state.selectedTheories.has(i) ? ' selected' : '');
    c.innerHTML = `<div class="t-name">${t.name}</div><div class="t-desc">${t.desc}</div>`;
    c.onclick = () => {
      if (state.selectedTheories.has(i)) state.selectedTheories.delete(i);
      else state.selectedTheories.add(i);
      renderTheories(onSelect);
      onSelect();
    };
    g.appendChild(c);
  });
  document.getElementById('theoryCount').textContent = `已選 ${state.selectedTheories.size} 種`;
}

export function updateEstimate() {
  const n = state.selectedTheories.size;
  const { seeds, iters } = state;
  const mins = Math.max(1, Math.round((n * seeds * iters * 0.4 + 60) / 60));
  document.getElementById('timeEst').textContent = `約 ${mins} 分鐘`;
  document.getElementById('estDetail').textContent = `${n} 理論 × ${seeds} 想法 × ${iters} 迭代`;

  let pts = n + Math.max(0, (seeds / 5) - 1) + (iters - 1);
  if (pts < 0) pts = 0;
  document.getElementById('pointEst').textContent = `共花費 ${pts} 點`;

  document.querySelectorAll('.pkg-btn').forEach(b => b.classList.remove('active'));
  if (n === 1 && seeds === 5 && iters === 1) document.getElementById('pkgSimple').classList.add('active');
  else if (n === 3 && seeds === 10 && iters === 1) document.getElementById('pkgNormal').classList.add('active');
  else if (n === 5 && seeds === 15 && iters === 2) document.getElementById('pkgAdvanced').classList.add('active');
}

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

export function showResults() {
  goStep(4);
  renderConditions();
  const paperDisplay = document.getElementById('displayPaperName');
  if (paperDisplay) paperDisplay.textContent = state.fileName || 'research_paper_demo.pdf';
  
  const resultSubjectInput = document.getElementById('resultSubjectInput');
  if (resultSubjectInput) resultSubjectInput.value = state.researchSubject || '未命名研究主題';

  document.getElementById('filteredCount').textContent = eliminated.length + 19;
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
    };
  });
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
  setTimeout(() => {
    btn.classList.remove('copied');
    btn.innerHTML = '<span>&#10697;</span> 複製提案';
  }, 2000);
}

export function renderPointRecords() {
  const list = document.getElementById('pointRecordsList');
  if (!list) return;
  list.innerHTML = '';
  state.pointRecords.forEach(r => {
    const item = document.createElement('div');
    item.className = 'record-item';
    const ptsClass = r.points > 0 ? 'plus' : 'minus';
    const ptsSign = r.points > 0 ? '+' : '';
    item.innerHTML = `
      <div class="record-desc">${r.desc}</div>
      <div class="record-pts ${r.points > 0 ? 'plus' : 'minus'}">${r.points > 0 ? '+' : ''}${r.points} Pts</div>
      <div class="record-date">${r.date}</div>
    `;
    list.appendChild(item);
  });
}

export function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  list.innerHTML = '';
  if (state.history.length === 0) {
    list.innerHTML = '<li class="history-item" style="color:#aaa; cursor:default; justify-content:center">尚無紀錄</li>';
    return;
  }
  state.history.forEach(h => {
    const item = document.createElement('li');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-content">
        <div>${h.title}</div>
        <div style="font-size:11px;color:#aaa;margin-top:4px">${h.time}</div>
      </div>
      <button class="history-delete-btn" data-id="${h.id}">&#10005;</button>
    `;
    item.onclick = () => {
       // Demo: Load this history
       alert(`載入歷史紀錄：${h.title}`);
    };
    const delBtn = item.querySelector('.history-delete-btn');
    delBtn.onclick = (e) => {
      e.stopPropagation();
      state.history = state.history.filter(item => item.id !== h.id);
      renderHistory();
    };
    list.appendChild(item);
  });
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
    document.getElementById('userStatus').textContent = user.status.replace('會員', '');
    document.getElementById('userPoints').textContent = user.points;
    document.getElementById('modalPoints').textContent = user.points;
    document.getElementById('profileName').textContent = user.name;
    
    renderPointRecords();
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

export function toggleMemberModal(show) {
  const modal = document.getElementById('memberModal');
  if (modal) {
    modal.style.display = show ? 'flex' : 'none';
    if (show) updateUserUI();
  }
}

export function rechargePoints(pts, price) {
  if (confirm(`確認要儲值 ${pts} 點嗎？ (模擬扣款 NT$ ${price})`)) {
    state.user.points += pts;
    updateUserUI();
    alert(`儲值成功！目前點數：${state.user.points}`);
  }
}

export function advanceGeneration(onComplete) {
  let current = 0;
  const items = document.querySelectorAll('#genSteps li');
  const genTitle = document.getElementById('genTitle');
  const genSub = document.getElementById('genSub');
  const spinner = document.getElementById('spinner');

  if (spinner) spinner.style.display = 'block';

  function step() {
    items.forEach((li, i) => {
      li.classList.remove('active', 'done');
      if (i === current) li.classList.add('active');
      else if (i < current) li.classList.add('done');
    });
    if (current < genTitles.length) {
      genTitle.textContent = genTitles[current][0];
      genSub.textContent = genTitles[current][1];
    }
    current++;
    if (current <= genTitles.length) {
      setTimeout(step, 1100);
    } else {
      spinner.style.display = 'none';
      setTimeout(onComplete, 400);
    }
  }
  step();
}
