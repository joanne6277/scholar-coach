# Daily Log

## 2026-05-27
- **修復 404 圖片載入錯誤與學科下拉選單 Crash Bug**：
  - **背景圖片路徑修復**：修正 `css/main.css` 中 Landing Page 背景圖指向不存在的 `566912.jpg` 問題，改為使用正確存在的品牌圖片 `566916.jpg`，解決 404 資源載入失敗。
  - **學科選單防禦性相容機制**：為避免瀏覽器快取舊的 `disciplines.js` 資料結構（例如鍵值對物件）導致原生 ES Modules 環境下出現 `TypeError: disciplines.forEach is not a function` 阻塞主程式運作的狀況，重構了 `js/ui/Upload.js` 中的 `renderDisciplineOptions`。加入防禦性剖析邏輯，同時相容一維陣列、分類巢狀物件等多種結構，扁平化轉換後安全輸出至學科選單，徹底消除系統崩潰。
- **實作「重新生成」選項定價九折優惠**：
  - **計算點數折算與狀態管理**：於 `js/core/state.js` 新增 `isRegenerating` 旗標；並在 `index.html` 的「重新生成」按鈕設定 `id="redoBtn"`，由 `js/app.js` 進行事件綁定。點選重新生成時將 `isRegenerating` 設為 `true`。若重新上傳、拖放檔案或點擊分析另一篇時，自動重設為 `false`。
  - **點數與明細折價套用**：在 `js/app.js` 的 `startGeneration` 中，當判定為重新生成時，扣除點數改為原本計算點數的 90%（四捨五入計算），並在扣點歷史明細備註中加上「(九折優惠)」。
  - **預估點數 UI 強化**：修改 `js/ui/Settings.js` 的 `updateEstimate` 函式，若處於重新生成狀態，介面上的預估扣除點數將以灰色刪除線標示原價，並高亮紅字顯示九折後的點數與「(重新生成九折)」字樣，提供清晰的優惠提示。
  - **按鈕折扣標籤引導**：於 `index.html` 的「重新生成」按鈕內新增紅底白字「9折」的優惠指引標籤（`.redo-discount-badge`），並在 `css/main.css` 中實作其樣式，讓使用者在結果頁時能直觀了解重新生成的折扣優惠。
- **修復與優化 Toast 自動關閉機制**：
  - **修復消失動畫卡死 Bug**：在 `js/utils/Toast.js` 的 `removeToast` 函式中，修復了因 CSS 動畫 `toast-entrance` forwards 凍結屬性導致 transition 屬性不生效、進而使 `transitionend` 事件未觸發而導致 Toast 無法自動移除的 Bug。現在在移除時，會動態清空 element 的 animation（`style.animation = 'none'`），並加入 400 毫秒的 `setTimeout` 雙重保險強制移出 DOM，確保 Toast 絕對能準確消失。
  - **重設預設顯示時長**：將預設的關閉時間（`duration`）設定為 3 秒（3000ms），符合使用者一般的閱讀習慣。
- **優化 Demo 論文上傳驗證繞過體驗**：
  - **按兩次繞過限制**：修改 `js/app.js` 中的 `goToStep2Demo` 函式，若使用者第一次沒有上傳論文時點擊「繼續設定條件」，會顯示 Toast 提示；若第二次點擊，則會跳過限制直接進入條件篩選頁面。
  - **自動填充模擬數據**：繞過限制後自動在後台設定模擬的 `fileName` (`demo_paper.pdf`) 與 `researchSubject` (`模擬研究主題`)，並同步渲染 UI，確保後續生成及結果頁面（Step 2/3/4）流程能順暢運行不受阻礙。
- **實作全面 Responsive Web Design (RWD) 響應式佈局調整**：
  - **主程式與佈局自適應**：於 `css/main.css` 針對 `768px` 以下螢幕將左右雙欄佈局（`.layout-container`）轉換為垂直疊加，設定側邊欄與主內容區寬度為 `100%`，並隱藏導覽列中過長的子標題（`.nav-subtitle`）防止溢出，提供順暢的行動裝置閱讀體驗。
  - **步驟進度條優化**：於 `520px` 以下螢幕隱藏非當前進行中步驟的文字（`span`），僅顯示 active 步驟文字，簡化連接線與數字間距，避免在極窄螢幕下發生排版重疊。
  - **卡片與表單網格優化**：
    - 將簡易/一般/進階套餐卡片列（`.pkg-row`）在 `640px` 以下調整為單欄（`1fr`）堆疊。
    - 將學術理論選單網格（`.dir-items`）在 `768px` 以下調整為單欄排列，避免小螢幕時文字擠壓變形。
    - 將自訂儲值點數的快捷按鈕（`.custom-quick-selectors`）、自訂金額列（`.custom-recharge-row`）以及套餐級距卡片網格（`.custom-tier-grid`）在小於 `520px`/`480px` 的窄螢幕下轉換為自適應折行與單欄堆疊，並將提案詳情卡片的數據欄位（`.proposal-stats`）改為垂直排列。
  - **彈窗小螢幕滾動防護**：針對會員中心 Modal（`.modal-card`）在 `520px` 以下設定 `max-height: calc(100vh - 32px)` 並開啟 `overflow-y: auto` 垂直滾動，同時限制 LINE Pay 模擬金流彈窗（`.payment-card`）之寬度與邊距，解決行動裝置因高度溢出而無法點擊或關閉的問題。
  - **提案交互動作列響應化**：在 `480px` 以下將提案結果底部動作按鈕（正讚、倒讚、複製提案）調整為垂直排列並設定滿寬度（`100%`），最佳化大拇指觸控點擊範圍。

## 2026-05-26
- **修復學科配置一維陣列相容與優化系統上傳/跳轉流程**：
  - **學科選單配置修復**：配合 `disciplines.js` 資料結構變更為一維陣列，修改 `js/ui/Upload.js` 移除了 `optgroup` 邏輯，改為直接迭代渲染 `option`，排除前端 JS 因找不到 category 而阻塞之 Bug。
  - **上傳驗證前提**：於 `js/app.js` 的 `goToStep2Demo` 中重構邏輯，禁止無論文時直接略過 Demo 進入 Step 2 的預設檔名帶入，並在此時即時阻擋並拋出「請先上傳核心論文 PDF！」之 Toast 提示，使流程檢查前提更符合邏輯；同時移除 `index.html` 中的 Demo 略過文字提示。
  - **移除敗部復活並重組結果頁底部按鈕**：於 `index.html` 及 `css/main.css` 中完全移除敗部復活按鈕、面板相關 DOM 與 CSS 樣式。將「重新生成」按鈕移至左邊；右邊新增「分析另一篇」按鈕（`.analyze-another-btn`），並在 `js/app.js` 中綁定事件——點擊後重設 PDF 狀態、檔名、研究主題與學科下拉值，呼叫 `goStep(1)` 返回上傳頁面並拋出重設 Toast，提供連貫的連續分析體驗；同時於 `js/ui/Results.js` 中移除已淘汰方向的渲染與復活按鈕綁定邏輯。
- **優化結果頁提案展示預設展開狀態**：
  - **預設展開第一個卡片**：於 `js/ui/Results.js` 的 `showResults` 結尾加入延遲 100 毫秒自動展開第一個卡片（`toggleProposal(0)`）之邏輯，協助用戶直接看見展開後的提案內容與底部的正/倒讚及複製按鈕，解決收合時不易察覺該組按鈕的問題。
- **於事件追蹤規劃中整合使用者評價**：
  - **規劃評價事件與指標**：於 [event_tracking_plan.md](file:///d:/A11277/Documents/02-產品/蟑螂/event_tracking_plan.md) 中新增 `proposal_feedback` 事件追蹤規格（包含序號、名稱、正讚/倒讚/取消類型以及操作動作等屬性規格）。同時在 KPIs 指標看板增設「提案正讚率」，並於範例代碼中追加評價點讚的前端 GA4 埋點呼叫示範。
- **提案結果卡片新增正/倒讚按鈕與微動態回饋**：
  - **按鈕結構與交互**：於 `js/ui/Results.js` 中為每個提案卡片渲染底部的評價按鈕組 (`.feedback-actions`)，提供👍正讚與👎倒讚按鈕，並實作 `handleFeedback` 邏輯：正讚與倒讚互斥、再次點選取消高亮，並連動全局 Toast 系統發送感謝提示。
  - **樣式與彈跳微動畫**：於 `css/main.css` 中重構底部的 `.card-actions` 為雙向排版。設計正/倒讚按鈕的現代化卡片式 Hover/Active 視覺色彩轉場，並以 `@keyframes fb-icon-pop` 實作點選高亮時的 Thumbs 圖示彈跳放大微動畫，強化按鍵回饋感。
- **建立數據事件追蹤規格文件**：
  - **規劃事件追蹤規格**：於根目錄新建 [event_tracking_plan.md](file:///d:/A11277/Documents/02-產品/蟑螂/event_tracking_plan.md)，針對 Scholar Coach 的核心漏斗（登入、上傳、生成、儲值）提供詳盡的事件名稱、觸發時機、事件屬性規格；並規劃了關鍵業務 KPI 指標與前端埋點（GA4 規格）的實作代碼範例。
- **實作全局 Premium 級 Toast 提示系統與流程優化**：
  - **新增 Toast 元件**：新建 `js/utils/Toast.js` 檔案，實作 Vanilla JS Toast 控制器，提供 `showToast(message, type, duration)` 全局呼叫介面，支援定時自動關閉與手動關閉。
  - **樣式視覺升級**：於 `css/main.css` 中，實作具備磨砂玻璃效果（`backdrop-filter: blur(12px)`）的 Toast 容器與卡片，設計向右彈性滑入登場與漸變滑出淡出動畫；並針對 `success`、`error`、`warning`、`info` 四種狀態配置對應的品牌前綴圖示與左側強調線配色。
  - **流程互動提示整合**：
    - **登入 / 註冊 / 登出**：`Auth.js` 與 `app.js` 中分別在登入成功時提示「歡迎回來，{姓名}！」以及登出成功時提示「您已成功登出」。
    - **點數儲值與金流**：`Member.js` 中於點擊快捷累加按鈕時提示目前點數餘額；自訂點數送出與點選套餐儲值時提示「即將導向模擬支付」；付款成功時提示「儲值成功！已存入 X 點數」。
    - **生成防呆驗證與扣點流程**：於 `app.js` 中重構 `startGeneration`。置入完整的「未登入」、「未上傳論文」、「未勾選理論」、「點數不足」四大防呆警告 Toast 阻斷；若檢驗通過，自動扣除對應點數並新增消費紀錄，隨後提示「開始分析生成...」，並在生成完畢時彈出成功 Toast。
    - **歷史紀錄與提案操作**：`History.js` 中將原本粗糙的歷史紀錄載入 `alert()` 替換為成功 Toast，並在刪除歷史紀錄時提示「歷史紀錄已刪除」；`Results.js` 中在複製提案成功時提示「提案已複製到剪貼簿！」，以及復活提案方向時提示「已成功將該方向復活...」。
- **簡化學科領域選擇選單與移除專業版標籤**：
  - **選單結構簡化**：在 `index.html` 移除子學科選擇器（`#subDiscipline`），並於 `js/ui/Upload.js` 將原有的雙層下拉連動改為單層 `<optgroup>` 與 `<option>` 分組結構，優化使用者的選單點擊效率。
  - **已登入狀態標籤優化**：在 `index.html` 移除已登入狀態按鈕（`#memberBtn`）上的 `#userStatus`（專業版）標籤；同時在 `js/ui/Navigation.js` 中對該 DOM 的操作加入 null 判定防護，以確保系統穩定運作。
- **優化自訂點數儲值樣式與互動體驗**：
  - **HTML 結構升級**：在 `index.html` 的自訂點數儲值區新增快捷點數選擇按鈕容器 (`.custom-quick-selectors`)、動態省錢提示標籤 (`#customSavingsBadge`)，並將傳統純文字提示替換為三欄式階梯級距卡片 (`#tierBronze`、`#tierSilver`、`#tierGold`)。
  - **CSS 樣式 Premium 化**：於 `css/main.css` 中重構自訂點數儲值樣式。實作磨砂玻璃與漸層背景卡片、`:focus-within` 焦點連動發光外框；設計快捷選擇按鈕 Hover/Active 微懸浮轉場；實作大字級 NT$ 價格藍紫漸層色；增加動態省錢標籤 bounceIn 動畫與級距卡片高亮狀態 (`.active`) 的品牌色投影；為儲值按鈕新增金屬流光掃過 (`button-shine`) 動畫。
  - **JavaScript 互動邏輯擴充**：於 `js/ui/Member.js` 中實現快捷按鈕點擊累加與即時計價；實作 `highlightTier()` 動態判定並高亮對應的級距卡片；新增即時計算與切換顯示省錢效益；並在開啟/關閉會員 Modal 時重設快捷按鈕、高亮狀態與省錢提示。
- **實作自訂點數儲值與金流串接**：
  - **HTML 結構擴充**：於 `index.html` 的 `#memberModal` 內新增自訂儲值點數區（包含輸入框、估算金額、階梯優惠提示與儲值確認按鈕）。
  - **CSS 樣式升級**：於 `css/main.css` 中實作自訂點數儲值區樣式，包括分隔線、隱藏原生數字微調按鈕、輸入框 Focus 與按鈕啟用/停用之視覺轉場，維持與原介面一致的 Premium 質感。
  - **金流邏輯與計價模型**：於 `js/ui/Member.js` 中擴充 `toggleMemberModal()` 確保關閉/開啟時自動清空暫存數據；並在 `initPaymentEvents()` 中實作即時監聽與防呆（自動向下取整數、過濾小於等於 0 之無效輸入），套用階梯優惠（1-99點 NT$3/點；100-499點 NT$2.8/點；500點以上 NT$2.4/點）動態折算實付金額，點擊時直接串接至現有 LINE Pay 模擬金流流程。
- **修復模組循環依賴導致首頁「開始使用」按鈕無反應之問題**：
  - **修復 Navigation.js 與 Member.js 的循環導入**：移除 `js/ui/Navigation.js` 中對 `js/ui/Member.js` 的直接導入，將 `renderPointRecords()` 的調用改為動態檢測 `window.renderPointRecords` 屬性。
  - **全域屬性掛載**：在 `js/ui/Member.js` 中將 `renderPointRecords` 函數掛載至 `window` 全域物件，徹底解除模組間的循環引用，修復 JS 載入阻塞並恢復完整的頁面初始化流程。
- **實作 LINE Pay 模擬儲值金流流程**：
  - **HTML 結構擴充**：於 `index.html` 中新增 `#paymentModal`（LINE Pay 模擬收銀台彈窗），包含「訂單確認」、「LINE Pay 手機模擬器（QR Code 掃描/帳密登入）」、「付款處理中」及「付款成功」四個子畫面。
  - **CSS 樣式升級**：於 `css/main.css` 中實作 LINE Pay 專屬綠色品牌視覺，包含手機外框模擬、動態 QR Code 綠色雷射掃描線動畫、指紋按鈕脈衝特效、付款加載 Spinner 及儲值成功收據樣式。
  - **金流與狀態邏輯實作**：於 `js/ui/Member.js` 中重構 `rechargePoints()` 並實作 `openPaymentModal()`、`closePaymentModal()`、`switchLpTab()` 及 `initPaymentEvents()` 等核心流程。模擬扣款完成後自動增值 `state.user.points`，並在點數明細中即時插入帶有當前時間的儲值紀錄。
  - **全域事件註冊**：於 `js/app.js` 中導入並註冊 window 級金流控制函數，並初始化金流事件監聽。
- **實作 Google 第三方登入/註冊流程**：
  - **HTML 結構擴充**：於 `index.html` 尾部新增 Google 登入/註冊彈窗 (`#authModal`)，設計包含主登入畫面、選擇帳戶面板、自訂模擬帳戶表單以及載入狀態等 4 個步驟的子視圖結構。
  - **CSS 樣式升級**：於 `css/main.css` 中實作了符合 Google 設計規範的 G 圖示登入按鈕、Google 帳戶選擇卡片、四色流光載入 Spinner，以及極具視覺效果的噴射 Confetti (彩紙花) 成功動畫。
  - **新建 Auth UI 模組**：建立 `js/ui/Auth.js` 以控制登入彈窗轉場邏輯。支援點擊預設帳戶「林小明」快速登入，或選擇「使用其他帳戶」讓使用者自訂姓名與 Google 信箱，模擬真實註冊情境。
  - **互動體驗優化**：修改 `js/app.js`，將原有的點擊登入按鈕改為啟動 Google 登入流程；優化「上傳論文鎖定區」與「繼續設定條件」按鈕，若訪客未登入點擊時，改為引導開啟登入彈窗，而非原本簡單的瀏覽器警告。

## 2026-04-24
- **替換 Demo 結果為 Base Results 資料**：
  - 將 `js/mock/proposals.js` 中的 10 個研究提案替換為來自 `demo附圖/base_results/result.md` 的繼承法相關研究提案。
  - 調整各提案的欄位對應，包含：標題、問題陳述、現有方法比較、研究動機、提出方法、實驗計畫、勝場數及新穎性。
  - 根據提案內容提取並設定對應的「方法論」與「理論」標籤。
  - 更新「已淘汰」清單，改為與繼承法主題相關的淘汰研究方向。

## 2026-04-16
- **優化 Landing Page 視覺平衡與排版細節**：
  - **Hero 區域精緻化**：
    - 將品牌主視覺圖片（`566916.jpg`）最大寬度調整為 `700px`，避免過大造成的壓迫感。
    - 縮減圖片與「開始使用」按鈕間距至 `20px`，強化視覺引導的緊湊性。
  - **特色卡片樣式升級**：
    - 增加卡片上下內距至 `48px`，並改為置中佈局，提升資訊閱讀的穩定感。
    - 優化卡片背景透明度與細微陰影，營造更輕盈的層次感。
  - **全站品牌視覺統一**：
    - 標題與導覽列 Logo 統一使用 `SCHOLAR C<span class="brand-o">O</span>ACH` 樣式，並實作 CSS 蟑螂意象觸角特效。
- **整合主視覺與背景特效**：
  - 將 `566912.jpg` 設為 Landing Page 全螢幕背景，並搭配毛玻璃特效與 1200px 寬度的內容容器。
- **新增按鈕功能說明**：為「敗部復活」與「重新生成」按鈕新增了詳細的文字說明與視覺引導。

## 2026-04-15
- **深度模組化架構重構**：將專案結構進行了深層次的模組化拆解，優化可維護性。

## 2026-04-14
- **研究結果參數擴充**：為研究提案新增評估指標欄位（勝場數、新穎性、方法論）。

## 2026-04-13
- **新增會員系統與 Landing Page**：實作了包含會員中心、模擬儲值及 Landing Page 的完整流程。
- **新增自訂主題功能**：實作了跨頁面的研究主題命名與編輯功能。
