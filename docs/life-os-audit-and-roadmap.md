# 灣day Life OS：現況盤點與相容升級路線

更新日期：2026-08-21。原則是保留既有頁面、資料與操作習慣，以小步 migration 改善，不做破壞式重構。

## A. Audit Report

### 現有架構

- React + TypeScript + Vite 單頁 PWA；`App.tsx` 負責頁面協調與大多數 domain state。
- 主要導覽為「今天、計畫、行程、生活、一起」，進階功能由 hub 與設定揭露。
- 資料透過 `usePersistentState` 儲存在以帳號 scope 隔離的 localStorage；支援 JSON 匯入／匯出。
- Supabase client 已存在，但產品資料仍以 local-first 為主；登入是本機 session，不是正式後端 auth。
- 設計系統集中於 CSS variables、`config/colors.ts`、共用 Card／Modal／PageTitle／EmptyState；具深色模式、RWD、鍵盤與基本無障礙。

### 已有功能

任務與四象限、收集匣、等待／以後再做、目標、專案、Next Action、專案生命週期、行事曆、容量、Top 3、專注、學習／考試／錯題、健康、工作身分、財務／投資、習慣、日記、筆記、回顧、搜尋、社群示意、onboarding、模組開關、PWA 與備份皆已存在。

### 主要問題

1. `App.tsx` 同時承擔 repository、domain service、頁面路由與 UI，新增跨模組 relation 的風險偏高。
2. Task／Project 多以名稱字串關聯，重新命名會斷鏈；缺少穩定的 `projectId → goalId → areaId`。
3. Goal 仍偏 SMART 數值模型，無法自然表達探索型目標；Objective／KR 尚未獨立。
4. 收集匣底層只存 Task，無法保留「可能是電影、筆記、財務」的判斷與確認流程。
5. 今日推薦主要依 Q1/Q2 順序，尚未完整納入可用時間、context、deadline distance、拆分能力與負荷。
6. Capacity 有整體估算，但沒有可執行的延後、拆分或移日方案。
7. 多個模組各自持有資料，跨模組洞察依賴臨時查找，尚無一致的 archive、relation 與 migration 策略。
8. 自動測試涵蓋 domain utilities 與部分元件，但缺少關鍵 journey E2E；lint 基線仍有 LearningPage effect 問題。

## B. Gap Analysis

| 能力 | 現況 | 下一步 |
| --- | --- | --- |
| Capture / Inbox | 已有；原本需先選分類與象限 | 已在 Phase 1 改為單欄自然語言、規則式預判、仍先進收集匣 |
| Clarify / Organize | 可改分類、象限與任務細節 | 加入確認預判、轉型為 Event／Note／Finance／Someday |
| Goal / OKR | 有 Goal，缺 Objective／KR 與探索型 | 拆出 goal kind、Objective、KeyResult 與 progress source |
| Project / Next Action | 已有 nextAction、risk、waiting | 改用 ID relation，加入無下一步／停滯偵測 |
| Time / Energy | 有 estimate、energy、capacity | 補 min session、split、context、available windows |
| Recommendation | 有 Top 3 與 insights | 建立可解釋的統一 ranking engine |
| Weekly Review | 有 checklist 與 system health | 改為 2–5 分鐘摘要、Top 3 產出與歷史 Review |
| Habit | 基本 streak 與日曆 | 補提示情境、接續習慣、7/30 日完成率 |
| Learning | 考試、學習、錯題已具備 | 補 LearningItem、複習上限與間隔排程 |
| Finance | 帳戶、交易、預算、投資已具備 | 補自訂比例、基金、訂閱、非責備洞察 |
| Knowledge / Collection | 筆記、日記已具備 | 補 pin、relation、轉型、書籍／電影 entity |
| SEO / Content | 尚未形成專屬模型 | 只對內容型專案啟用 pipeline 與 metrics |
| Archive | Project 有欄位，未統一 | 所有核心 entity 採一致 archivedAt 與全域搜尋 |

## C. Data Model Upgrade

採 additive migration，先加 optional ID 與 metadata，再背景補值，最後才停止寫入舊字串欄位。

```text
Area ← Goal ← Objective ← KeyResult
  ↑      ↑          ↑
  └── Project ← Task / Event / Habit
         ↑       ↑
       Note   FocusLog

InboxItem --confirm--> Task | Event | Note | Resource | FinanceTransaction |
                       Book | Movie | SomedayItem
```

優先欄位：

- 共用：`id`、`createdAt`、`updatedAt`、`archivedAt`、`areaId`、`tags`。
- InboxItem：`sourceText`、`suggestedType`、`confidence`、`parsedFields`、`confirmedAt`。
- Task：`projectId`、`goalId`、`minSessionMinutes`、`splittable`、`contexts`、`blockedByIds`、`waitingFor`。
- Goal：`kind: outcome | exploration`、`direction`、`nextStep`；量化資料只在 outcome 使用。
- Objective／KeyResult：獨立 ID；KR 支援 manual、task、habit、finance 等 progress source。
- Review：`period`、`summary`、`topThree`、`answers`、`generatedSignals`。
- Knowledge：Note／Resource 關聯採 typed relation，不強迫雙向連結。

每次 export 增加 schema version；import 先 validation，再 migration，失敗不得覆蓋現有資料。

## D. UX Optimization Plan

- 首頁固定回答四件事：今天行程、現在適合做、Top 3、是否過載；其他卡片降為次層。
- 快速新增永遠以單一輸入為主，系統只顯示可修改的推測，不阻擋送出。
- 收集匣改成「確認建議」而非填表；低信心時只問一個會改變去向的問題。
- 專案頁將「下一步」放在進度前；卡住時提供拆小、等待、改期三個選項。
- 目標新增先問自然語句，再判斷成果型或探索型；SMART／OKR 為背景檢查。
- 所有警示使用可恢復、無責備文案，並附一個立即可做的調整。
- 進階欄位以 progressive disclosure 收合；角色／模組設定可隨時返回修改。

## E. Implementation Phases

1. **資料模型與 Inbox / GTD**：單欄 capture、解析 metadata、InboxItem、typed conversion、schema migration。
2. **Goal / OKR / Project**：Area 與 ID relation、探索型目標、Objective／KR、專案停滯偵測。
3. **Time / Energy / Capacity**：min session、context、flexible blocks、負荷調整建議。
4. **Weekly Review / Habit**：短回顧、Top 3、habit stacking、完成率取代 streak 壓力。
5. **Learning System**：LearningItem、active recall eligibility、review cap、spaced repetition。
6. **Finance System**：可調比例、輕量零基預算、Sinking Fund、訂閱與溫和洞察。
7. **Knowledge / Notes / Collection**：relation、轉型、書籍／電影與漸進摘要。
8. **SEO / Content**：內容型專案模板、pipeline、發布後 metrics；其他專案不顯示。
9. **AI Recommendation**：以規則引擎作可測基線，再接可選 AI；所有建議可解釋、可忽略。
10. **UX polish**：首頁減量、文案、動效、無障礙、空狀態與完整 E2E journey。

每一階段都必須通過既有 unit tests、TypeScript build、lint，並手動驗證新增／編輯／刪除／備份還原與手機版主要流程。任何 migration 先雙寫、可回復，再淘汰舊欄位。
