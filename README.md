# Scholar Coach

Scholar Coach（學術教練）是一個前端原型（Prototype），讓使用者上傳單篇論文 PDF 後，自動分析其理論與方法論結構，並依據使用者選擇的創新路徑（理論模板、學科領域、生成深度等）產出多份具創新性的後續研究提案。

目前為純前端 Demo／原型階段，資料流程（登入、生成結果、扣點、金流）皆以模擬資料（Mock）與模擬互動實作，尚未串接真實後端與金流服務。

## 功能特色

- **上傳分析**：上傳核心論文 PDF，模擬讀取其理論結構與研究侷限
- **創新路徑配置**：可選擇學科領域、學術理論模板、寫作風格與生成深度
- **提案生成**：一鍵生成多份具完整邏輯架構的研究提案大綱，支援「重新生成」（享九折點數優惠）
- **提案互動**：提案卡片可展開/收合，支援正讚／倒讚回饋與一鍵複製
- **會員與點數系統**：Google 模擬登入、點數儲值（含快捷加值、階梯優惠）、LINE Pay 模擬金流收銀台
- **歷史紀錄**：檢視與刪除過往生成紀錄
- **事件追蹤**：整合 Google Tag Manager 與 Mixpanel，詳見 [docs/event_tracking_plan.md](docs/event_tracking_plan.md)
- **RWD 響應式設計**：支援手機、平板等不同螢幕尺寸

## 專案結構

```
.
├── index.html              # 主應用頁面（Landing Page + 主流程 App，Demo 用）
├── css/
│   ├── main.css              # 全站樣式
│   └── img/566916.jpg        # 品牌主視覺圖（首頁、promo 頁共用）
├── js/
│   ├── app.js                # 應用進入點，流程控制與事件綁定
│   ├── core/
│   │   └── state.js           # 全域狀態管理
│   ├── config/                # 學科、理論、風格等設定資料
│   ├── mock/                  # 模擬資料（提案、歷史紀錄、點數紀錄）
│   ├── ui/                    # 各功能模組的 UI 邏輯（登入、上傳、生成、結果、會員中心等）
│   └── utils/                 # 共用工具（Toast 提示、確認彈窗）
├── promo/                   # 上線前導廣告頁（獨立打包，供 IT 部署用）
│   ├── index.html
│   └── img/566916.jpg
└── docs/                    # 專案文件與素材
    ├── event_tracking_plan.md      # 事件追蹤與數據埋點規劃書
    ├── daily_log.md                 # 開發日誌
    ├── demo截圖/                    # 早期 MyIdea 概念demo 與現行 Landing Page 截圖
    ├── 測試結果與交付/
    │   ├── baseline-遺囑處分特留分扣減/  # 單篇論文的基準測試結果
    │   └── 模型比較測試-20260618/        # 多模型（GPT/Gemini/DeepSeek）跨論文比較測試交付包
    └── 簡報/                        # 產品介紹、行銷頁說明、產學合作成果報告等簡報檔
```

> `promo/` 是完全獨立、自包含的靜態頁面（CSS/JS 皆內嵌於 `index.html`），可以整個資料夾單獨打包交給 IT 部署，不依賴專案其他部分。
>
> 根目錄其餘檔案（`index.html`、`css/`、`js/`）為主流程的 Demo 原型，僅供內部展示，不對外上線。
>
> `docs/` 下除了兩份規劃文件外，其餘都是內部素材（demo 截圖、測試交付成果、簡報），僅供團隊/IT 參考，不是程式碼的一部分。
>
> `.claude/` 為 Claude Code 工具設定（本地開發伺服器啟動設定等），非專案功能程式碼，一般會被作業系統/編輯器視為隱藏資料夾。

## 技術棧

純 Vanilla JavaScript（ES Modules），無框架、無建置工具依賴。

## 開始使用

本專案為純靜態網站，需透過本地伺服器啟動（因使用 ES Modules，直接開啟 `index.html` 檔案會受瀏覽器 CORS 限制）。

```bash
npx serve . -p 5500
```

啟動後於瀏覽器開啟 `http://localhost:5500` 即可。

## 上線導廣告頁（promo）

`promo/` 資料夾是完全獨立的靜態頁面，交給 IT 時可直接把整個資料夾（或其內容）當作網站根目錄部署：

```bash
npx serve promo -p 5501
```

## 相關文件

- [docs/event_tracking_plan.md](docs/event_tracking_plan.md) — 事件追蹤與數據埋點規劃書
- [docs/daily_log.md](docs/daily_log.md) — 開發日誌，記錄各功能實作與修復細節
