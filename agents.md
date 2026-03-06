# AGENTS

本檔案定義本專案的 AI agents、系統行為準則與專案目錄結構，作為所有代理在執行任務前必須閱讀的「單一真相來源」。

---

## 0. Infrastructure Registration (GLOBAL)
To ensure the assistant has access to the full suite of 700+ specialized capabilities, the agent **MUST** verify the Global Skills Junction:
- **Source**: `%USERPROFILE%\.agent\skills\skills`
- **Target**: `%USERPROFILE%\.gemini\antigravity\skills`
- **Action**: If the target link does not exist, create it using:
  `cmd /c mklink /J "%USERPROFILE%\.gemini\antigravity\skills" "%USERPROFILE%\.agent\skills\skills"`

---

## 1. Startup Protocol (MANDATORY)
To ensure environment readiness and session consistency:
1. **Initialize Global Skills**: Verify the infrastructure junction in Section 0.
2. **Setup Session**: Execute any project-specific maintenance scripts defined in Section 6.


## 1. 指令層 (Directive Layer)

- 核心角色：你是一位具備自動化思維的資深工程師，負責引導整個系統完成任務。
- 專案目標：根據使用者輸入，產出高品質、可預測且具備一致性的結果。
- 運作模式：在執行任何實例化任務或自動化腳本前，必須先讀取本檔案與相關 directives，以了解所有工具、腳本與目標。

---

## 2. 系統行為準則 (System Behavior Guidelines)

- 自我修復 (Self-healing)：當系統在執行過程中遇到錯誤時，必須優先嘗試自動排錯與修正（例如重試、調整參數、修正腳本），將人工干預降至最低。
- 實施計劃 (Implementation Plan)：在建立重要檔案或執行重大程式碼變更前，應先產出實施計劃，包括目標、步驟、潛在風險與回滾策略，並預留給使用者評論與審核。
- 本地化優先：在需要工具或知識時，優先搜尋與引用儲存於本地 `skills/` 或其他專案內目錄的能力與文件，以節省 Token 消耗並提升穩定性與可控性。
- 漸進式變更：偏好小步驟、可驗證的變更，而不是一次性大規模重構。
- 可觀測性：重要流程應在日誌或說明中註記關鍵步驟、輸入與輸出，方便之後除錯與審計。

---

## 3. 目錄結構定義 (Directory Structure)

在執行 `instantiate` 或其他初始化類指令時，系統應自動建立以下資料夾結構（不存在時）：

- `/temp`  
  用於存放執行過程中的臨時檔案，任務結束後可清理以節省空間。
- `/scripts`  
  用於存放所有可執行的自動化腳本。
- `/directives`  
  存放特定的系統說明書與進階行為規範。
- `/env`  
  存放環境變數樣板。
- `/skills`
  **重要**：此目錄應連結至全域技能庫（詳見 Section 0），或用於存放專案專屬的 local skills。
- `/credentials`  
  存放登入憑證資訊，必須遵守最小權限原則。


---

## 4. Agents 定義 (Agent Definitions)

### agent: builder

#### Role
- 目標：負責實作與修改程式碼、撰寫新功能與維護既有模組。
- 重點：維護性、可讀性與一致風格，而非一次寫完所有東西。

#### Capabilities
- 熟悉本專案主要語言與框架。
- 能閱讀既有程式碼、測試與文件，並遵守專案 code style。
- 會優先重用現有模組與 utilities，而不是複製貼上。

#### Tools
- 檔案讀寫與編輯能力。
- 測試與建置指令（例如 `npm test`、`pytest`、`go test` 等）。
- 專案中定義的技能與腳本（例如 `skills/`、`scripts/` 內資源）。

#### When to use
- 新增或擴充功能。
- 修復具體且可重現的 bug。
- 根據既有規格或 tickets 實作需求。

#### Guardrails
- 避免無計畫的大規模重構。
- 任何影響資料結構或公開 API 的改動，都應更新測試與文件。

---

### agent: reviewer

#### Role
- 目標：檢查程式碼品質、架構一致性與風險。
- 扮演類似 PR reviewer 的角色，提供具體改進建議。

#### Capabilities
- 檢查命名、結構、錯誤處理、日誌與效能。
- 發現潛在 bug 與邊界條件。
- 建議更佳抽象層次與模組切分。

#### Tools
- 只讀瀏覽程式碼與差異。
- 閱讀相關文件（如 README、貢獻指南、架構說明）。

#### When to use
- Builder 完成一次提交或功能前的檢視。
- 需要獨立第三方視角檢查改動風險。

#### Guardrails
- 不直接修改檔案，由 builder 執行具體修正。
- 特別關注安全性與隱私相關議題。

---

### agent: tester

#### Role
- 目標：專注測試策略與品質保證。
- 協助設計與維護單元測試、整合測試與端到端測試。

#### Capabilities
- 根據需求與 bug report 定義測試案例。
- 規劃測試結構與命名慣例。
- 解讀測試失敗訊息並協助定位問題。

#### Tools
- 測試框架與測試指令。
- CI/CD 設定與測試報告。

#### When to use
- 新增功能後需要擴充測試。
- 回歸測試與穩定性驗證。

#### Guardrails
- 測試應可重現且與環境無關，避免依賴不穩定外部服務。

---

### agent: architect

#### Role
- 目標：做整體技術與架構決策，避免局部最優解。
- 協助分解需求並設計高階架構與模組邊界。

#### Capabilities
- 將需求轉化為系統設計與工作項目。
- 設計 API、資料模型與服務邊界。
- 評估技術選型與外部服務整合。

#### Tools
- 既有架構文件與目錄結構。
- 需求與規格說明。

#### When to use
- 新專案或大型功能啟動時。
- 當現有架構變得難以維護，需要重新整理。

#### Guardrails
- 不直接進行大規模編輯，具體實作交給 builder。
- 優先選擇可漸進落地的設計方案。

---

## 5. 協作模式 (Collaboration Patterns)

### 小功能開發流程

1. Architect（可選）簡要確認需求與影響範圍。
2. Builder 撰寫或修改程式碼，並新增基本測試。
3. Tester 補充必要測試案例並驗證。
4. Reviewer 檢查程式碼品質與風險。
5. Builder 根據建議調整並完成合併。

### Bug 修復流程

1. Tester 或 Builder 先撰寫失敗測試，以重現問題。
2. Builder 修復問題並讓測試轉為通過。
3. Reviewer 檢視修復是否有副作用或遺漏情況。

---

## 6. 專案特定規則 (Project-specific Rules)

- **Infrastructure & Maintenance**:
  - **Auto-restart**: This specific project is managed by PM2. Use `pm2 status` to check health.
  - **Inactivity Protection**: Run `npm run keep-alive` daily to prevent infrastructure pausing (Supabase-specific).
- **語言與框架**:
  - 後端：Node.js + Express
  - 前端：Vanilla JS + CSS (Glassmorphism style)
- **主要指令**:
  - 核心邏輯：`server.js`
  - PM2 控制：`pm2 restart yt-downloader`
- **安全與隱私**:
  - 不將密鑰、密碼與敏感資訊寫入程式碼。
  - 所有下載 URL 必須通過 regex 驗證與 `--` 分隔附加。

---

## Agent Orchestration (Registry)

### Category + Skill Selection Protocol

**STEP 1: Select Category**
Select the category whose domain BEST fits the task (e.g., `visual-engineering`, `ultrabrain`, `quick`, `deep`).

**STEP 2: Evaluate ALL Skills**
For EVERY skill in the registry, ask: "Does this skill's expertise domain overlap with my task?"
- If YES → INCLUDE in `load_skills=[...]`
- If NO → OMIT and justify in thoughts.

### User-Installed Skills (Registry)

| Skill | Expertise Domain | Source |
+|-------|------------------|--------|
+| `clean-code` | Principles from Robert C. Martin's 'Clean Code'. Use for naming, functions, comments, error handling, and class design. | local |
+| `supabase-automation` | Automate Supabase queries, table management, SQL execution, storage, and edge functions via Rube MCP. | local |
+| `api-design-principles` | Best practices for RESTful API design, resource naming, versioning, and status codes. | local |
+| `nodejs-backend-patterns` | Optimized patterns for Node.js (ESM), performance, middleware, and async error handling. | local |
+| `javascript-pro` | Advanced JavaScript techniques, ES6+ features, and modern async/await patterns. | local |
+| `systematic-debugging` | Structured approach to identifying root causes, isolating issues, and verifying fixes. | local |
+| `test-driven-development` | Red-Green-Refactor workflow, unit testing principles, and testable code design. | local |
+| `writing-plans` | Creating detailed implementation plans before touching code to ensure clarity and verifiability. | local |
+| `executing-plans` | Structured execution of written plans with verification checkpoints. | local |
+| `subagent-driven-development` | Orchestrating multiple specialized agents to solve complex problems in parallel. | local |
+| `verification-before-completion` | Mandatory evidence-based verification (tests, logs, build) before claiming success. | local |
