import { disciplines } from '../config/disciplines.js';

export function renderDisciplineOptions() {
  const main = document.getElementById('mainDiscipline');
  if (!main) return;

  // 避免重複渲染
  if (main.options.length > 1) return;

  Object.keys(disciplines).forEach(category => {
    const group = document.createElement('optgroup');
    group.label = category;
    
    disciplines[category].forEach(subDiscipline => {
      const opt = document.createElement('option');
      opt.value = subDiscipline;
      opt.textContent = subDiscipline;
      group.appendChild(opt);
    });
    
    main.appendChild(group);
  });
}
