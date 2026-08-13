const STORAGE_KEY = 'cookieConsentAccepted';

export function initCookieConsent() {
  const banner = document.getElementById('cookieConsent');
  const acceptBtn = document.getElementById('cookieConsentAcceptBtn');
  if (!banner) return;

  let alreadyAccepted = false;
  try {
    alreadyAccepted = localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (e) {
    // localStorage 不可用時（例如無痕模式），每次載入都顯示提示
  }

  if (!alreadyAccepted) {
    banner.style.display = 'block';
  }

  if (acceptBtn) {
    acceptBtn.onclick = () => {
      banner.style.display = 'none';
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch (e) {
        // 忽略無法寫入的情況
      }
    };
  }
}
