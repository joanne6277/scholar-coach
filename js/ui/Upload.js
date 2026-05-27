import { disciplines } from '../config/disciplines.js';

export function renderDisciplineOptions() {
  const main = document.getElementById('mainDiscipline');
  if (!main) return;

  // 避免重複渲染
  if (main.options.length > 1) return;

  // 防禦性處理：相容一維陣列、二維物件或類別物件等多種快取/新舊資料格式
  const list = [];
  const source = Array.isArray(disciplines) 
    ? disciplines 
    : (disciplines && typeof disciplines === 'object' ? Object.values(disciplines).flat() : []);
    
  source.forEach(item => {
    if (typeof item === 'string') {
      list.push(item);
    } else if (item && typeof item === 'object') {
      if (item.name) list.push(item.name);
      else if (item.category && Array.isArray(item.items)) {
        item.items.forEach(sub => {
          if (typeof sub === 'string') list.push(sub);
          else if (sub && sub.name) list.push(sub.name);
        });
      }
    }
  });

  list.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    main.appendChild(opt);
  });
}
