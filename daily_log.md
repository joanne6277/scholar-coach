# 開發日誌 (Daily Log)

## 2026-09-11

### 確認訂單畫面調整與付款情境簡化

#### 變更摘要
依照修改計畫簡化付款彈窗結構與錯誤情境測試：**收款商戶移除**、**交易編號更名為訂單編號**、**付款新增轉圈圈處理中畫面**（純 UI 過渡等待感），並將**付款未完成情境改由 Demo 面板觸發**。捨棄原本規劃之模擬支付閘道（`#payGatewayView`）及模擬 API 檔案（`js/mock/payment.js`），回歸輕量、直覺的原型展示。

#### 詳細變更清單
1. **HTML 結構調整 (`index.html`)**
   - **收款商戶移除**：刪除 `.pay-detail-box` 中的「收款商戶 / Scholar Coach (學術教練)」整列，明細精簡為「服務項目、訂單編號、應付金額」三列。
   - **交易編號更名為訂單編號**：標籤更名為「訂單編號」，元素 id 由 `payTradeNo` 改為 `payOrderNo`，預設文字前綴由 `TXN` 改為 `ORD`。
   - **付款新增轉圈圈處理中畫面**：移除原有的 `#payGatewayView` 閘道視圖，新增同層 `#payProcessingView` 視圖，內含旋轉 spinner、提示文案「付款處理中，請稍候…」與「訂單編號」顯示節點。
   - **付款未完成畫面重構 (`#payFailedView`)**：調整為共用結果容器 `.pay-result-view`，文案統一為無差別未完成說明，明細顯示訂單編號 (`#payFailedOrderNo`)，配置「重新付款 ›」(`btn-primary`) 與「返回上一步」(`btn-secondary`) 按鈕及客服信箱連結。
   - **付款未完成情境改由 Demo 面板觸發**：右下角蟲蟲面板移除原「API 未送出」與「第三方支付未完成」兩顆按鈕，合併為單一顆「(3) 付款：取消／失敗」按鈕 (`#demoPayFailed`)。

2. **CSS 視覺樣式優化 (`css/main.css`)**
   - 新增 `.pay-processing-view` 置中等待版面樣式，複用全域 `.spinner` 動畫與圓環樣式，搭配深灰標題與次級淺灰訂單編號小字。
   - 移除過渡期之 `.gw-*` 模擬閘道相關樣式。
   - 新增 `.pay-result-view` 共用結果容器樣式（置中、上下 padding 24px）、`.pay-result-title`、`.pay-result-desc`、`.pay-result-meta`、`.pay-result-actions`（支援窄螢幕 flex-wrap 換行）及 `.pay-result-contact-link`。
   - 保留 `.pay-error-icon` 與 `.gen-error-icon` 等大尺寸圓形琥珀/紅警示底色圖示樣式，維持 `.payment-card` 的 `max-width: 440px; border-radius: 18px; max-height: 90vh;` 規範不變。

3. **JavaScript 邏輯優化 (`js/ui/Member.js`, `js/ui/DemoPanel.js`)**
   - **移除模擬 API 檔案**：刪除 `js/mock/payment.js`，清空 `Member.js` 中所有 `createPaymentOrder`、`PAY_TIMEOUT_MS`、`AbortController` 與 `gatewaySettled` 殘留邏輯。
   - **訂單編號全域統一**：`currentTransaction.tradeNo` 全面更名為 `currentTransaction.orderNo`；`openPaymentModal()` 開窗時以時間戳與亂數產生一次即固定，開窗時一律呼叫 `showPayView('paySummaryView')`。
   - **View 切換工具集中化**：以 `showPayView(id)` 取代分散的樣式操作，並對外匯出 `showPaymentFailed()` 供 Demo 面板展示失敗結果。
   - **轉圈圈處理中與流程銜接**：點擊「前往付款」（`#startPayBtn`）時，發票驗證通過即寫入訂單編號並切換至 `showPayView('payProcessingView')`，經短暫延遲（800ms）後自動關閉彈窗、切換至步驟四 (`goStep(4)`)、跳出成功 Toast 並觸發 `onSuccess()` 開始生成提案。
   - **失敗返回與重新付款**：「返回上一步」或關閉彈窗清空交易狀態並停留在步驟三；「重新付款」切回明細 View，完整保留原訂單編號與已填寫發票資訊。
   - **Demo 面板整合**：`DemoPanel.js` 綁定 `#demoPayFailed`，先檢核登入狀態、切換至步驟三，開啟 30 元測試訂單後直接展示 `showPaymentFailed()` 畫面，不觸發成功與計費回呼。

---

## 2026-09-10

### 移除付款彈窗付款方式框框與重構元件配置

#### 變更摘要
移除「確認訂單」彈窗中冗餘之固定「第三方支付通道」選項框框，並重新梳理優化彈窗內交易明細、發票區塊與送出按鈕之元件佈局與視覺比例。

#### 詳細變更清單
1. **HTML 結構調整 (`index.html`)**
   - 移除 `.pay-method-section` 付款方式區塊（包含第三方支付通道框框與 Radio 按鈕）。
   - 在「前往付款」按鈕下方新增簡潔之安全支付提示 (`.pay-security-tip`)：「點擊前往付款將導向第三方安全支付閘道」。
2. **CSS 樣式與配置優化 (`css/main.css`)**
   - 將 `.payment-card` 最大寬度由 480px 精簡至 440px，圓角設為 18px，讓彈窗整體視線更集中、緊湊。
   - 微調 `.payment-body`、`.pay-detail-box`、`.invoice-section` 的 padding 與內部垂直間距。
   - 移除多餘的 `.pay-method-*` 樣式規則，保持樣式整潔。
   - 新增 `.pay-security-tip` 樣式，帶綠色鎖頭圖示，提供清晰、現代感的安全信任引導。

---

### 付款彈窗更名為「確認訂單」與新增發票資訊欄位

#### 變更摘要
依據 `docs/修訂計畫-確認訂單與發票欄位.md` 規範，將原付款彈窗調整為「確認訂單」，並於交易明細與付款方式之間新增兩層式發票資訊選擇與即時驗證功能。

#### 詳細變更清單
1. **HTML 結構調整 (`index.html`)**
   - 將 `#paymentModal` 彈窗標題從「確認付款」修改為「確認訂單」。
   - 送出按鈕 `#startPayBtn` 文字由「確認付款」修改為「前往付款」。
   - 同步修正 HTML 註解為 `<!-- Order Confirmation Modal -->`。
   - 在交易明細區塊 (`.pay-detail-box`) 與付款方式區塊 (`.pay-method-section`) 之間新增「發票資訊」區塊 (`.invoice-section`)：
     - **第一層（發票類型）**：個人電子發票（預設）、公司發票、捐贈發票等 Radio 選項。
     - **第二層（展開欄位）**：
       - 捐贈發票：捐贈碼輸入框 (`#donateCode`)。
       - 個人電子發票：載具單選（存於會員帳號（預設）、手機條碼載具、自然人憑證），以及對應的手機條碼輸入框 (`#mobileBarcode`) 或自然人憑證條碼輸入框 (`#citizenCode`)。
       - 公司發票：統一編號輸入框 (`#companyTaxId`) 與發票抬頭輸入框 (`#companyTitle`)。
     - 每一輸入框皆配置對應之行內錯誤提示節點 (`.field-error`)。

2. **CSS 視覺與互動樣式 (`css/main.css`)**
   - 將 `.payment-card` 最大寬度微調至 480px，並加上 `max-height: 90vh; overflow-y: auto;`，確保不同解析度下發票區塊展示舒適且不破版。
   - 新增 `.pay-subtitle`、`.invoice-section`、`.invoice-type-group`、`.invoice-type-card` 樣式，延續既有設計系統之圓角、陰影與精緻點擊回饋。
   - 新增 `.carrier-type-group`、`.carrier-option` 載具選項 pill/radio 樣式。
   - 新增 `.invoice-input` 輸入框樣式及其聚焦狀態、`.has-error` 錯誤紅框高亮樣式與 `.field-error` 錯誤文字提示樣式。

3. **JavaScript 邏輯與驗證機制 (`js/ui/Member.js`)**
   - 新增 `invoiceInfo` 資料模型，管理使用者當前選擇的發票類型、載具與填寫欄位。
   - 實作 `resetInvoiceState()`：每次透過 `openPaymentModal()` 開啟彈窗時，自動將發票狀態重置為預設值（個人電子發票 - 存於會員帳號），並清空所有輸入值與錯誤提示。
   - 實作 `initInvoiceEvents()`：
     - 第一層及第二層 Radio 選項切換監聽：動態切換 active 類別、展開對應面板，並即時清空非目前分支的填寫內容與錯誤訊息。
     - 即時輸入監聽（`input` 事件）：使用者重新輸入時立即清除錯誤提示，手機條碼自動轉大寫。
   - 實作 `validateInvoice()`：在點擊「前往付款」（`#startPayBtn`）時進行分支驗證：
     - 捐贈發票：檢查必填與 3–7 碼純數字格式。
     - 個人電子發票 - 手機條碼：檢查必填與 `/` 開頭加上 7 碼英數字格式。
     - 個人電子發票 - 自然人憑證：檢查必填（非空白）。
     - 公司發票：檢查統一編號與發票抬頭必填（非空白）。
     - 驗證失敗時阻擋送出流程並在相應欄位展示錯誤；驗證通過後將發票資訊暫存至 `currentTransaction.invoiceInfo` 並執行原本付款成功與生成提案流程。
