# Personal Growth OS 功能心智圖

此圖以產品功能為中心，依目前程式碼與開發計畫整理。狀態標記如下：

- ✅ 已完成：已有可操作功能。
- 🟡 部分完成：已有 MVP，但仍需補齊完整流程或可靠性。
- 🔵 規劃中：列入後續開發路線圖。

```mermaid
mindmap
  root((Personal Growth OS))
    身分與個人化
      ✅ 本機帳號
        註冊
        登入與登出
        Session 保留
        密碼加鹽雜湊
      ✅ 個人設定
        顯示名稱與介紹
        多重角色
        人生領域
      🔵 正式身分系統
        Server-side authentication
        帳號刪除
        存取控制
        多裝置同步
    規劃系統
      ✅ 快速收集
        N 快捷鍵
        快速新增視窗
        收集匣
      🟡 任務管理
        今日任務
        完成與刪除
        全部／待完成／已完成篩選
        預估與實際時間
        🔵 編輯與批次操作
        🔵 截止日與週期任務
      ✅ 優先順序
        Eisenhower Matrix
        Q1 立即做
        Q2 排程做
        Q3 減少或委派
        Q4 降低投入
      ✅ 等待與未來
        Waiting For
        Follow-up 日期
        Someday／Maybe
      ✅ 目標管理
        SMART Goal
        目前值與目標值
        期限與進度
        推進一小步
      🟡 專案管理
        狀態與進度
        所屬人生領域
        Next Action 提示
        🔵 目標與專案正式關聯
    時間與執行
      🟡 行事曆
        日視圖
        週視圖
        月視圖
        任務拖曳排程
        單次與重複事件
        🔵 動態日期與時區
        🔵 外部行事曆同步
      🟡 容量規劃
        每週可用時數
        任務預估負荷
        超載提示
        Q2 時間保護
        🔵 角色與固定承諾設定
      ✅ Focus Center
        25／45／50／90 分鐘
        綁定任務
        專注品質
        中斷原因
        完成音效
        桌面通知
        實際投入紀錄
    成長領域
      ✅ 學習與考試
        考試目標
        科目進度與信心
        模擬考
        學習時數
        答題正確率
        錯題原因與複習
      ✅ 健康與恢復
        飲水
        睡眠
        能量／壓力／心情
        運動紀錄
        體重／體脂／腰圍
        症狀紀錄
        恢復活動
      ✅ 習慣
        每週打卡
        連續天數
        類別
      ✅ 反思與知識
        日記
        心情評分
        筆記
        標籤
    工作與財務
      ✅ 工作管理
        多重工作身份
        組織與角色
        計價方式
        工時紀錄
        已收與待收款
      🟡 個人財務
        帳戶
        收入與支出
        分類
        預算
        現金流
        🔵 不可變交易流水帳
      🟡 投資
        持倉
        買入交易
        成本與市值
        投資報酬
        🔵 賣出與完整交易歷史
    回顧與洞察
      ✅ 週期回顧
        每日 Shutdown
        每週 Reset
        每月 Reflection
        Checklist
      ✅ System Health
        收集匣未釐清
        逾期任務
        無 Next Action 專案
        未完成任務
      🟡 Analytics
        任務完成率
        規劃與實際投入
        四象限分布
        考試目標差距
        健康指數
        現金流
        投資報酬
        規則式 Smart Insights
      🔵 智慧建議
        可解釋排程建議
        長期趨勢
        使用者可停用
        人工確認後才修改
    搜尋與資料
      ✅ 全域搜尋
        Ctrl／Cmd + K
        任務
        目標
        專案
        筆記與日記
      🟡 本機持久化
        localStorage
        自動保存
        Seed data
        🔵 寫入失敗回復
      🟡 備份與還原
        JSON 匯出
        JSON 匯入
        🔵 Schema validation
        🔵 Migration
        🔵 匯入預覽與 rollback
      🔵 雲端資料
        PostgreSQL
        使用者資料隔離
        跨裝置同步
        衝突處理
        自動備份
    平台與品質
      ✅ PWA 基礎
        Manifest
        Service Worker
        響應式導覽
      🟡 使用體驗
        錯誤邊界
        表單驗證
        刪除確認
        部分操作 Undo
        🔵 完整無障礙
      🟡 工程品質
        TypeScript
        ESLint
        Vitest
        Testing Library
        Production build
        🔵 Playwright E2E
        🔵 CI／CD
        🔵 監控與稽核
```

## 核心功能循環

```mermaid
flowchart LR
    A[快速收集] --> B[收集匣釐清]
    B --> C[目標與專案]
    B --> D[等待中／未來清單]
    C --> E[優先級與容量]
    E --> F[行事曆排程]
    F --> G[今日執行]
    G --> H[專注與活動紀錄]
    H --> I[每日／每週／每月回顧]
    I --> J[分析與洞察]
    J --> C
```

## 功能依賴關係

```mermaid
flowchart TD
    Identity[身分與個人設定] --> Data[資料層與同步]
    Data --> Planning[目標／專案／任務]
    Planning --> Calendar[行事曆與容量]
    Planning --> Focus[專注執行]
    Calendar --> Focus
    Focus --> Analytics[回顧與分析]
    Learning[學習] --> Analytics
    Wellness[健康] --> Analytics
    WorkMoney[工作與財務] --> Analytics
    Analytics --> Planning
    Search[全域搜尋] --> Planning
    Search --> Learning
    Search --> WorkMoney
```

> GitHub、GitLab 及支援 Mermaid 的 Markdown 閱讀器可直接渲染以上圖表；若閱讀器不支援，仍可由縮排文字理解完整層級。
