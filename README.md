# 灣day（Personal Growth OS）

灣day 是一套以 React、TypeScript 與 Vite 製作的個人成長管理 PWA。它把任務、目標、專案、行程、專注、學習、健康、工作、財務、投資與每日反思集中在同一個本機優先（local-first）介面中。

> 文件狀態：依 2026-08-20 的現有原始碼整理。此專案目前是前端原型，帳號與使用資料只保存在目前瀏覽器，沒有後端同步。

## 功能總覽

### 帳號、初始設定與個人化

- 本機註冊、登入、登出與 session 管理；密碼至少 8 個字元，使用 Web Crypto SHA-256 處理。
- 新使用者 onboarding：設定名稱、人生角色與生活模組。
- 個人設定可控制啟用模組、顯示偏好與深色／淺色主題。
- 不同本機帳號使用獨立的資料儲存範圍。

### 今天

- 顯示今日日期、主要人生角色與個人化問候。
- 從今日未完成的 Q1／Q2 任務選出 Today Top 3。
- 依睡眠、能量、壓力及任務預估時間計算今日可用容量與超載差額。
- Readiness Check-in：調整能量、壓力與心情。
- 從目前最重要的任務直接進入專注模式。

### 計畫、任務、目標與專案

- 快速收集任務至收集匣；支援新增、編輯、完成、刪除及刪除復原。
- 管理分類、專案、人生角色、負責人、期限、預估／實際分鐘、能量需求、優先級、狀態、進度與下一步行動。
- Eisenhower 四象限（Q1–Q4）與分類篩選。
- GTD 清單：Waiting For（等待中）與 Someday / Maybe（以後再做），支援完成、跟進日期及刪除。
- Restart Panel 協助從停滯狀態重新開始。
- SMART 目標可記錄領域、目前值、目標值、單位、期限、重要原因及相關專案。
- 專案可設定領域、人生角色、成果、負責人、起迄日、每週容量、狀態及風險。
- 專案工作區提供整體進度、逾期項目、投入工時、容量警告，以及看板／清單檢視。
- 任務流程包含待辦、進行中、審核、完成；另有專案生命週期檢視。

### 行程與容量

- 月曆／日期檢視與事件新增。
- 行程可記錄日期、開始與結束時間、分類、重複規則及地點／備註。
- 支援每天、每週、每月的重複事件展開。
- 每週容量依睡眠、能量、壓力動態調整，顯示已安排時數與超載風險。
- 顯示人生角色投入分布，並提醒單一角色占比過高。
- 顯示 Q2（重要但不緊急）時間投入，協助保護長期成長時間。

### 專注中心

- 支援 25、45、60、90 分鐘倒數專注。
- 可綁定任務、專案、學習、工作或自訂主題。
- 記錄專注品質與中斷原因，可選擇完成提示音與瀏覽器通知。
- 完成後自動建立 FocusLog，並同步實際投入至對應任務、學習紀錄或工作紀錄。

### 學習與考試

- 學習模式可設定今日目標、選擇科目並開始專注。
- 管理考試名稱、類型、日期、目前分數、目標分數與科目。
- 記錄學習分鐘、完成題數、答對題數、正確率與模擬考成績。
- 錯題紀錄包含來源、錯誤原因與正確概念，並可切換複習狀態。
- 提供學習趨勢與進度指標。

### 健康與恢復

- 每日健康狀態：睡眠、能量、壓力與心情。
- 運動紀錄：類型、分鐘、強度與日期。
- 睡眠紀錄：時數、主觀品質與日期。
- 身體紀錄：體重、體脂、腰圍與日期。
- 症狀紀錄與恢復活動紀錄。
- 綜合健康分數會納入成長分析與容量估算。

### 工作、財務與投資

- 管理多個工作身份：組織／客戶、角色、工作類型、費率與計價單位。
- 記錄工作日期、工時、內容、收入與收款狀態。
- 管理現金、銀行、電子支付與投資帳戶。
- 記錄收入／支出並同步更新帳戶餘額；提供預算與現金流檢視。
- 管理 ETF、股票、債券、Crypto、基金等持倉。
- 記錄投資交易、成本、現值與報酬率。

### 習慣、日記與筆記

- 習慣建立、分類及每日完成狀態。
- 日記可記錄類型、心情、標題與內容。
- 筆記可記錄標題、標籤與內容，並支援刪除復原。
- 全域搜尋可查找任務、目標、專案、筆記等資料。
- 快捷鍵 `Ctrl/Cmd + K` 開啟搜尋。

### 一起、回顧與分析

- 「一起」頁面以匿名／示意社群資料呈現共同努力、連續紀錄及互相支持指標。
- 每日、每週、每月回顧 checklist。
- System Health 檢查收集匣、逾期任務、缺少 Next Action 的專案及未完成任務量。
- 成長報告整合任務完成率、規劃時數、健康分數、資產報酬、四象限分布、考試進度與現金流。
- Smart Insights 依任務、專注、學習、健康與社群資料產生規則式建議。
- Recharts 圖表採 lazy loading，載入期間顯示 skeleton。

### 資料、離線與易用性

- 所有主要狀態透過 `usePersistentState` 寫入瀏覽器 `localStorage`。
- 可匯出完整 JSON 備份並重新匯入。
- 內建 seed data，首次使用即可瀏覽完整情境。
- Web App Manifest 與 Service Worker 提供可安裝及基本離線能力。
- 支援響應式版面、鍵盤操作、dialog focus 管理、Escape 關閉與 `prefers-reduced-motion`。
- 全域錯誤邊界、操作 toast、確認刪除與局部 undo。

## 系統保存的紀錄

| 類別 | 紀錄內容 |
| --- | --- |
| 身分 | 本機使用者、session、Profile、角色、模組與偏好 |
| 計畫 | Task、Goal、Project、WaitingItem、Habit |
| 行程 | CalendarEvent、重複規則、容量配置 |
| 專注 | FocusLog、分鐘、品質、中斷原因、關聯項目 |
| 學習 | Exam、Subject、StudyLog、MockExam、Mistake |
| 健康 | Health、ExerciseLog、SleepLog、BodyLog、WellnessLog |
| 工作 | WorkProfile、WorkLog、費率、工時、收入與收款狀態 |
| 財務 | Account、Budget、FinanceTransaction |
| 投資 | Holding、InvestmentTransaction |
| 反思 | JournalEntry、Note、每日／每週／每月回顧狀態 |

匯出檔目前使用資料格式版本 `4`，並包含匯出時間。匯入時會逐類別還原存在且格式為陣列／物件的資料。

## 技術架構

| 項目 | 技術 |
| --- | --- |
| UI | React、TypeScript、Lucide React、CSS |
| 建置 | Vite、TypeScript project references |
| 圖表 | Recharts |
| 狀態與保存 | React state、Context、localStorage |
| 測試 | Vitest、Testing Library、jsdom |
| 品質 | ESLint、TypeScript compiler |
| PWA | Web App Manifest、Service Worker |

主要目錄：

```text
public/                 PWA 圖示、manifest、Service Worker
scripts/                UI 文字匯出、試算表檢查及品牌色遷移工具
src/
├─ components/          共用 UI、圖表、Modal、錯誤邊界
├─ config/              導覽、表單與顏色設定
├─ domain/              型別與初始資料
├─ features/            auth、planning、projects、calendar、capacity、
│                       focus、learning、social、insights、search、onboarding
├─ hooks/               持久化狀態、dialog 與 storage scope
├─ lib/                 storage、calendar、audio 工具
├─ App.tsx              應用狀態與頁面協調
└─ main.tsx             應用入口
```

完整功能關聯心智圖另見 [docs/functional-mindmap.md](docs/functional-mindmap.md)。

## 安裝與執行

需求：Node.js 20 或相容版本、npm。

```bash
npm install
npm run dev
```

```bash
npm run build     # TypeScript 檢查並建立 production build
npm run preview   # 預覽 production build
npm run lint      # 執行 ESLint
npm run test      # 執行 Vitest 測試
```

## 測試紀錄

現有自動化測試涵蓋：

- 本機帳號註冊、登入與 session 保存。
- localStorage 讀寫失敗 fallback 及使用者資料隔離。
- `usePersistentState` 初始化與更新。
- 行事曆日期運算與重複事件。
- Modal 表單驗證、focus trap 與 Escape 關閉。
- 專注紀錄建立與關聯項目解析。
- 學習與社群指標。
- Smart Insights 規則。

## 目前限制

- 沒有伺服器、雲端同步、多裝置同步或正式多人協作。
- 本機登入只用於裝置內資料分區，不等同正式安全驗證；清除瀏覽器資料會移除帳號與紀錄。
- 「一起」目前使用本機／示意資料，沒有即時社群後端。
- 財務、投資與健康功能只供個人追蹤，不構成財務、投資或醫療建議。
- JSON 匯入目前採寬鬆欄位檢查，尚未提供完整 schema validation、migration UI 或 rollback。
- 尚未配置 Playwright E2E 與 CI/CD。

## 開發紀錄

### 2026-08-20 — 目前版本

- 完成主要資訊架構：今天、計畫、行程、生活、一起。
- 補齊 Today Top 3、動態容量、專案工作區、任務看板／清單與專案生命週期。
- 加入專注紀錄同步、學習模式、社群指標與 Smart Insights。
- 完成本機帳號資料隔離、onboarding、JSON 匯入／匯出、PWA、主題與無障礙基礎。
- 建立 auth、storage、calendar、focus、learning、social、insights、modal 等單元／元件測試。
- 更新品牌名稱、色彩與台灣繁體中文介面文字；提供 UI 文字匯出與微調工具。

### 專案基線

- React + TypeScript + Vite 單頁應用。
- 以 localStorage 與 seed data 建立可操作 MVP。
- 建立任務、目標、專案、行事曆、學習、健康、工作、財務、投資、習慣、日記、筆記、回顧及分析頁面。

## 資料安全提醒

請定期從個人設定匯出 JSON 備份。若使用共用電腦，請注意瀏覽器中仍保存本機資料；在沒有後端與加密資料庫的現況下，不建議存放高度敏感的醫療、財務或身分資訊。
