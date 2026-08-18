import { theories } from '../config/theories.js';
import { usageRecords } from '../mock/usageRecords.js';
import { initialHistory } from '../mock/history.js';

// 將嵌套的理論扁平化，方便狀態管理（例如：'0-0' 代表第一個方向的第一個理論）
const allTheories = [];
theories.forEach((d, di) => {
  d.items.forEach((t, ti) => {
    allTheories.push(`${di}-${ti}`);
  });
});

export const state = {
  isLoggedIn: false,
  currentStep: 1,
  selectedTheories: new Set(allTheories),
  seeds: 15,
  iters: 3,
  fileName: '',
  fileSize: 0,
  researchSubject: '',
  isGenerating: false,
  isRegenerating: false,
  user: {
    name: '林小明',
    status: '專業版會員',
    hasUsedFreeTrial: true, // 此 demo 帳號預設已用過首次免費額度，可於右下角 Demo 面板切換情境
    email: 'xiaoming.lin@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  },
  usageRecords: [...usageRecords],
  history: [...initialHistory]
};

export function updateState(newState) {
  Object.assign(state, newState);
}
