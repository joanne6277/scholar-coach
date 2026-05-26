# Scholar Coach 事件追蹤與數據埋點規劃書 (Event Tracking Plan)

本規劃書旨在為 **Scholar Coach** (學術教練) 系統建立完整的數據追蹤體系（適用於 GA4、Amplitude、Mixpanel 或自建數據庫）。透過追蹤使用者的核心操作，優化「註冊登入」、「論文生成漏斗」與「點數儲值轉化」等三大核心流程。

---

## 一、 核心行為分析漏斗 (Conversion Funnels)

為了評估產品健康度，我們需要重點關注以下兩個核心轉化漏斗：

1. **提案生成漏斗 (AARRR - 核心功能漏斗)**
   `進入 Landing Page` ➔ `點擊開始使用` ➔ `登入/註冊成功` ➔ `成功上傳 PDF` ➔ `點擊開始生成` ➔ `成功生成提案` ➔ `複製提案/復活方向 (終點轉化)`

2. **付費儲值漏斗 (Revenue - 金流轉化漏斗)**
   `開啟會員中心` ➔ `點擊儲值套餐/送出自訂點數` ➔ `開啟 LINE Pay 收銀台` ➔ `付款成功 (扣款與增值)`

---

## 二、 詳細事件追蹤規格表 (Event Spec)

事件名稱建議採用 `蛇形命名法 (snake_case)`，並區分**事件名稱 (Event Name)** 與**事件屬性 (Event Properties)**。

### 1. 訪客與帳戶事件 (User & Auth)

| 事件名稱 (Event Name) | 觸發時機 (Trigger) | 事件屬性 (Event Properties) | 追蹤目的 (Goal) |
| :--- | :--- | :--- | :--- |
| `landing_page_click_start` | 訪客在 Landing Page 點擊「開始使用」按鈕 | - | 計算首頁對 App 的轉化率 |
| `auth_login_start` | 使用者點擊 Google 登入按鈕，開啟帳戶選擇視窗 | - | 統計登入意圖 |
| `auth_login_success` | 模擬 Google 第三方登入成功 | `login_type`: 'default' (林小明) / 'custom' (自訂帳戶)<br>`user_email`: 遮罩後的 Email | 分析註冊轉化率與新舊用戶比例 |
| `auth_logout` | 用戶點擊登出 | `remaining_points`: 登出時的剩餘點數 | 統計用戶離網狀態 |

### 2. 論文上傳與設定事件 (Upload & Config)

| 事件名稱 (Event Name) | 觸發時機 (Trigger) | 事件屬性 (Event Properties) | 追蹤目的 (Goal) |
| :--- | :--- | :--- | :--- |
| `paper_upload_success` | 成功拖放或選取 PDF 論文 | `file_size_mb`: 檔案大小<br>`file_name_length`: 檔名長度 | 分析用戶文獻上傳的成功頻率 |
| `discipline_select` | 選擇單層學科領域下拉選單 | `discipline_name`: 選擇的子學科名稱<br>`discipline_group`: 所屬的大類別 (如工程技術) | 統計最受歡迎的研究學門，作為後續精準行銷與 AI 訓練方向 |
| `package_select` | 點選「簡易/一般/進階」快速選擇套餐 | `package_type`: 'simple' / 'normal' / 'advanced' | 了解用戶對發想複雜度的預設偏好 |
| `theory_toggle` | 手動勾選或取消勾選創新理論卡片 | `theory_id`: 例如 '0-1' (大類-子項目)<br>`theory_name`: 理論名稱<br>`action`: 'select' / 'deselect' | 統計哪些學術創新理論（如：尺度轉換、類比遷移）最常被學者使用 |

### 3. 分析與生成事件 (Generation)

| 事件名稱 (Event Name) | 觸發時機 (Trigger) | 事件屬性 (Event Properties) | 追蹤目的 (Goal) |
| :--- | :--- | :--- | :--- |
| `generation_start` | 點選「開始生成」按鈕 (且通過防呆驗證) | `selected_theories_count`: 勾選理論數<br>`seeds_count`: 想法數 (5/10/15)<br>`iters_count`: 迭代次數 (1/2/3)<br>`has_custom_prompt`: 是否有填客製化條件 (true/false)<br>`points_cost`: 本次預計消耗點數 | 核心轉化指標。分析用戶的生成規格與單次平均點數消耗 |
| `generation_blocked` | 點選開始生成，但因防呆未通過被阻斷 | `block_reason`: 'not_logged_in' / 'no_file' / 'no_theory' / 'insufficient_points' | 評估阻斷原因。若 'insufficient_points' 高，代表儲值引導有優化空間 |
| `generation_success` | 1.8 秒分析結束，成功展示 Step 4 結果頁 | `duration_ms`: 生成歷時 | 統計成功率與效能監控 |

### 4. 點數儲值與金流事件 (Revenue & Recharge)

| 事件名稱 (Event Name) | 觸發時機 (Trigger) | 事件屬性 (Event Properties) | 追蹤目的 (Goal) |
| :--- | :--- | :--- | :--- |
| `recharge_click` | 點擊套餐儲值按鈕，或點擊「進行自訂點數儲值」 | `recharge_type`: 'package' (套餐) / 'custom' (自訂點數)<br>`points`: 擬儲值點數<br>`price_twd`: 應付金額 | 衡量付款意圖與金額客單價分佈 |
| `payment_checkout_start` | 在訂單確認頁點擊「確認付款 (前往 LINE Pay)」 | `trade_no`: 模擬交易單號<br>`price_twd`: 金額 | 進入模擬收銀台的比例 |
| `payment_checkout_success`| 點擊一鍵模擬付款，顯示交易成功 | `trade_no`: 交易單號<br>`points_added`: 獲得點數<br>`price_twd`: 實付金額<br>`payment_method`: 'LINE Pay' | 核心付費轉化指標 (Revenue)。計算 LTV (用戶終身價值) 與 ROI |

### 5. 提案與歷史紀錄互動事件 (Interaction)

| 事件名稱 (Event Name) | 觸發時機 (Trigger) | 事件屬性 (Event Properties) | 追蹤目的 (Goal) |
| :--- | :--- | :--- | :--- |
| `proposal_copy` | 點選「複製提案」按鈕 | `proposal_index`: 序號 (0-9)<br>`proposal_title`: 提案名稱 | 評估使用者對生成結果滿意度（複製代表有採用意圖） |
| `proposal_feedback` | 點選提案卡片下方的「正讚」或「倒讚」按鈕 | `proposal_index`: 序號 (0-9)<br>`proposal_title`: 提案名稱<br>`feedback_type`: 'like' / 'dislike' / 'none'<br>`action`: 'select' (首選) / 'change' (改選) / 'cancel' (取消) | 收集使用者對提案質量的具體偏好回饋，作為精進 AI 發想模型與創新推薦演算法的重要標籤 |
| `proposal_revive` | 點選敗部復活區的「復活此方向」 | `eliminated_index`: 序號<br>`eliminated_title`: 復活方向名稱 | 評估過濾機制（復活率越高，代表 AI 篩掉的內容中仍有許多學者想要的靈感） |
| `history_load` | 點擊側邊欄歷史紀錄進行載入 | `history_id`: 紀錄 ID<br>`history_title`: 主題 | 評估用戶留存率與回訪率 |
| `history_delete` | 點擊歷史紀錄刪除 | `history_id`: 紀錄 ID | 統計紀錄清理頻率 |

---

## 三、 關鍵業務指標 (KPIs to Monitor)

透過上述事件，產品經理 (PM) 應建立以下 Dashboard 看板：

1. **付費轉化率 (Payment Conversion Rate)**:
   `payment_checkout_success` 獨立用戶數 / `landing_page_click_start` 獨立用戶數。
2. **點數儲值偏好 (Recharge Preference)**:
   分析 `recharge_click` 中，選擇「自訂儲值」與「固定套餐（100點/500點）」的比例（評估自訂點數的設計是否受歡迎）。
3. **復活率 (Revival Rate)**:
   `proposal_revive` 觸發次數 / `generation_success` 觸發次數。評估過濾機制的準確度。
4. **提案正讚率 (Proposal Positive Feedback Rate)**:
   `proposal_feedback` (feedback_type='like') 觸發次數 / `generation_success` 觸發次數。用以評估生成內容的精準滿意度與學術實用價值。
5. **生成流失率 (Funnel Drop-off)**:
   分析 `generation_blocked` 事件中 `not_logged_in` 與 `insufficient_points` 的佔比，用以優化登入引導及降價/促銷策略。

---

## 四、 前端埋點代碼範例 (GA4 範例)

我們可以在 `js/utils/Tracker.js` 建立一個簡單的埋點工具，將其與現有的 `showToast` 或事件連動。例如：

```javascript
// js/utils/Tracker.js
// 支援 GA4 埋點的簡易封裝

export const Tracker = {
  /**
   * 發送自訂事件
   * @param {string} eventName 事件名稱
   * @param {Object} properties 事件屬性
   */
  track(eventName, properties = {}) {
    // 輸出到開發者主機，方便偵錯
    console.log(`[Event Tracking] ${eventName}`, properties);
    
    // 如果有載入 Google Analytics 4 (gtag.js)
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...properties,
        // 全局傳遞用戶目前點數餘額，利於做使用者分群
        user_points_balance: window.state?.user?.points || 0
      });
    }
  }
};
```

### 實際調用範例：
1. 當點數儲值成功時，在 `Member.js` 中調用：
```javascript
import { Tracker } from '../utils/Tracker.js';

// ... 儲值成功邏輯 ...
Tracker.track('payment_checkout_success', {
  trade_no: document.getElementById('payTradeNo').textContent,
  points_added: currentTransaction.pts,
  price_twd: currentTransaction.price,
  payment_method: 'LINE Pay'
});
```

2. 當使用者給予提案正讚評價時，在 `Results.js` 中調用：
```javascript
import { Tracker } from '../utils/Tracker.js';

// ... 正讚評價邏輯 ...
Tracker.track('proposal_feedback', {
  proposal_index: 2,
  proposal_title: '基於微型光學感測器之多模態情緒分析方法',
  feedback_type: 'like',
  action: 'select'
});
```
