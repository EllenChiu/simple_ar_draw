# 安全與管理

## 2026-09-09 套件檢查

原始依賴掃描有 22 筆公告（11 high、8 moderate、3 low）。已更新 React、Vite 與可用的間接依賴修補版本；重新掃描剩下 `image-size` 的 2 筆 high 公告，套件來源當時尚無可安裝的修補版。

`image-size` 由保留的 Vinext／Sites 工具鏈帶入。GitHub Pages 使用獨立 Vite 靜態入口，不會啟動 Vinext 伺服器、不會將此圖片解析器部署到瀏覽器，也不會把使用者照片交给它解析。因此這兩項伺服器圖片解析 DoS 在目前 Pages 路徑不會觸發；這是影響範圍判斷，不代表套件已修補。避免把不可信圖片交給 Sites 的伺服器圖片功能，修補版本發布後應重新更新與掃描。

直接執行 `pnpm audit` 可取得最新結果。已知公告隨時間改變；建置通過不能替代漏洞檢查。

## 應用程式安全設計

- 參考照片以瀏覽器 `blob:` URL 處理；相機不錄影、不上傳。不使用分析追蹤、資料庫或外部 API。
- GitHub Pages 仍會接收一般網站連線資訊，例如 IP 與 HTTP 請求；「照片不上傳」不等於主機完全沒有連線紀錄。
- Pages 入口設定 CSP：只載入同站程式、禁止 fetch/XHR/WebSocket 連線、外掛與表單提交。
- 圖片限 25 MB。檔案大小限制不能完全避免高解析度圖片耗用記憶體。
- CSP 的 inline style 用於圖片座標、旋轉及透明度。沒有允許 inline script 或 eval。
- GitHub Pages 無法由 repo 自訂所有 HTTP 安全標頭；CSP meta 不能取代 `frame-ancestors` 或 Permissions-Policy 標頭。
- Pages 版本沒有登入防護。即使原始碼 repo 私人，Pages 網站通常仍公開；前端程式永遠不能放秘密。

## CI/CD 已納入的控制

- 官方 Actions 固定完整 commit SHA，由 Dependabot 每週提出更新。
- pnpm 固定版本、使用 lockfile，安裝關閉套件生命週期腳本。
- 建置 job 只有 contents:read，checkout 不保留認證。
- PR 不發布；僅 main 的 push 或 main 上手動執行能部署。
- 部署 job 只取得 pages:write 與 id-token:write，使用短效 GitHub token／OIDC。
- 僅上傳靜態產物，保留一天；不包含 source map、Sites 設定或金鑰。
- 手勢測試、型別檢查、靜態產物驗證失敗即停止部署。
- 不自動合併 Dependabot PR。請閱讀更新內容並驗證後再合併。

## 帳號與儲存庫管理

下列是應檢查／設定的項目；是否已完成請以實際 GitHub 設定與交付紀錄為準：

1. 帳號啟用 passkey 或 2FA；離線保管 recovery codes。
2. Settings → Rules → Rulesets：保護 main，要求 PR 與 `Test and build` 成功，禁止強制推送與刪除。
   個人專案可不要求他人審核，避免唯一維護者無法合併；組織專案建議一位以上 reviewer。
3. Settings → Environments → github-pages：只允許 main 部署。依需求加入人工 approval；會影響全自動部署。
4. Settings → Actions → General：預設 token 採唯讀；不要允許 Actions 建立並核准 PR。需要的部署權限已在 workflow 明列。
5. Settings → Security／Code security：啟用 Dependabot alerts 與 security updates；啟用帳號方案支援的 secret scanning、push protection。
6. 定期檢查 collaborators、GitHub Apps 與 OAuth Apps，移除不再使用的權限。
7. Settings → Pages：確認 HTTPS 啟用；先使用 github.io 預設網域。

## 金鑰處理

日常部署不需要個人金鑰。首次推送使用瀏覽器登入、Git Credential Manager 或 `gh auth login`。
不要把 token 貼到聊天、README、程式碼、Git remote URL 或 workflow。
若不得不使用 fine-grained PAT，僅授權目標 repo、設定短期限，只開工作所需權限，透過本機安全認證介面保存。
Contents write 用於推送；修改 workflow 需 Workflows write；設定 Pages／規則可能需要 Pages／Administration write。
權限不足可由 repo 擁有者在 GitHub 網頁手動設定，不需要交出整個帳號的 token。

## 發現洩漏或漏洞

先撤銷受影響 token，再移除程式碼／紀錄中的秘密；只刪除最新檔案不能清除 Git 歷史。
檢查 Actions 紀錄與最近提交，更新依賴，重建部署。若已啟用 Private vulnerability reporting，請透過 Security 頁面回報漏洞，不在公開 issue 貼敏感資訊。
