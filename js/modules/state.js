import { theories } from './data.js';

export const state = {
  currentStep: 1,
  selectedTheories: new Set(theories.map((_, i) => i)),
  seeds: 10,
  iters: 1,
  fileName: '',
  researchSubject: '',
  isGenerating: false,
  user: {
    name: '林小明',
    status: '專業版會員',
    points: 125,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  }
};

export function updateState(newState) {
  Object.assign(state, newState);
}
