import { theories, tagStyles, numStyles, proposals, eliminated, genTitles } from './data.js';
import { state } from './state.js';

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
        <div class="proposal-tag" style="background:${ts.bg};color:${ts.color}">${p.theory}</div>
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

export function updateUserUI() {
  const { user } = state;
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userStatus').textContent = user.status.replace('會員', '');
  document.getElementById('userPoints').textContent = user.points;
  document.getElementById('modalPoints').textContent = user.points;
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileStatus').textContent = user.status;
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
