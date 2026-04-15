import { disciplines } from '../config/disciplines.js';

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
