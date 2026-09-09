# 描描｜相機描圖

用手機相機觀看畫紙，疊上本機參考圖片，再在真正的紙上描繪。
支援單指移動、雙指縮放與旋轉、透明度調整、鎖定，以及 4:3 相機畫面。
相機以等比例裁切填滿工作區；不會將圖案投影到紙上。

## GitHub Pages 開發與部署

需要 Node.js 24 與 pnpm 10.4.1。

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev:pages
```

驗證與建置：

```sh
pnpm test
pnpm typecheck
pnpm build:pages
node scripts/verify-pages.mjs
pnpm preview:pages
```

GitHub 儲存庫的 Settings → Pages → Build and deployment → Source 選 **GitHub Actions**。
推送 `main` 後，`Pages CI and deploy` 會測試、檢查型別、產生靜態產物，再部署。
Pull request 只執行測試與建置，不取得部署權限。
部署不需要 PAT、SSH 私鑰或自訂 Actions secret。

Pages 的產物只包含 `dist-pages/`；原始碼、Sites 設定與 node_modules 不會被當作網站上傳。
使用相對資源路徑，可放在 `https://帳號.github.io/儲存庫/`。
用手機的 Safari／Chrome 直接開啟 HTTPS 網站並允許相機。

## 後續維護

1. 開分支修改程式，提出 PR。
2. 確認 `Test and build` 通過，再在手機測試相機、雙指手勢與鎖定。
3. 合併至 `main`；Actions 成功後重新整理網站。
4. 回復問題版本：對有問題的提交執行 `git revert`，走同樣的 PR 流程。避免強制推送。

給 Codex 的維護指示範例：
「請在這個 GitHub repo 開分支修正問題，執行測試與 Pages 建置，提出 PR；先不要合併。」
Codex 仍需當次工作環境具備該 repo 的存取權，網站公開不代表授權自動修改 repo。

## 專案結構

- `app/page.tsx`：相機與圖片操作介面。
- `app/globals.css`：樣式與 4:3 工作區。
- `lib/gesture.ts`、`lib/gesture.test.mjs`：手勢計算與測試。
- `pages/`、`vite.pages.config.ts`：純靜態 Pages 入口。
- `.github/workflows/pages.yml`：CI/CD。
- `SECURITY.md`：安全設計、管理與尚需確認的設定。

原本 Sites 的 `dev`、`build` 設定保留；GitHub Pages 使用 `dev:pages`、`build:pages`。
兩者共用同一份 UI。GitHub 更新不會自動重新發布原本 Sites 網址。
