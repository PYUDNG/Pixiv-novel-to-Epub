# Pixiv小說Epub合成器 / Pixiv Novel to Epub

[English](/readme/README.en.md) [简体中文](/readme/README.zh-Hans.md) [繁體中文](/readme/README.zh-Hant.md)

一個 Tampermonkey / Violentmonkey 使用者腳本，可在 [Pixiv](https://www.pixiv.net) 小說頁面上一鍵下載 EPUB 格式電子書。支援單本下載、系列合集下載，以及自訂多本小說合併下載。

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev/)

> 如遇錯誤或有功能建議，歡迎 [提出 issue](https://github.com/PYUDNG/pixiv-novel-to-epub/issues) 共同討論解決

## ✨ 功能特性

### 📖 單本下載
- 在 Pixiv 單篇小說頁面點擊按鈕，一鍵下載為 EPUB 檔案
- 自動獲取標題、作者、標籤、封面等元資料
- 內容中的圖片自動嵌入EPUB

### 📚 系列合集
- 在 Pixiv 小說系列頁面下載整個系列，合併為一本 EPUB
- 系列封面和全部內容自動包含在內
- 自動生成完整目錄

### ✂️ 自訂合集
- 透過腳本選單手動輸入多篇小說 ID
- 支援直接輸入數字 ID 或貼上完整連結
- 合併下載為一本 EPUB，自訂檔案名稱

### 🎨 智慧深色模式
- 自動跟隨 Pixiv 頁面主題切換
- UI 始終融合自然，無縫體驗

### 🌐 國際化
- 介面支援簡體中文、繁體中文、英文
- 自動匹配瀏覽器語言設定

### ⏳ 進度回饋
- 即時顯示下載進度，每個步驟清晰可見
- 支援隨時中斷下載過程
- 智慧快取 Pixiv API 回應，減少重複請求

## 🚀 快速開始

### 直接安裝使用（適合大多數使用者）
您可以選擇以下任一方式安裝：
- [Greasyfork](https://greasyfork.org/scripts/483999)
- [Github Release](https://github.com/PYUDNG/pixiv-novel-to-epub/releases)

### 自行建置

#### 環境需求
> 本專案使用 npm 作為套件管理器開發，其他套件管理器請自行嘗試
- Node.js 18+
- npm

#### 開發環境設定

1. **克隆專案**
```bash
git clone https://github.com/PYUDNG/pixiv-novel-to-epub.git
cd pixiv-novel-to-epub
```

2. **安裝依賴**
```bash
npm install
```

3. **啟動開發伺服器**
```bash
npm run dev
```

4. **建置使用者腳本**
```bash
npm run build
```

5. **如無需程式碼壓縮和美化，可以使用以下命令建置**
```bash
npm run build:deps && npm run build:raw
```

6. **自動化AI翻譯README**
- 建立`scripts/readme-builder/openai.config.ts`（可參考同目錄的`openai.config.d.ts`和`openai.congig.ts.template`），填寫自己的AI API配置
- 修改`README.src.md`，使用您熟悉的語言編寫README，並支援使用 `<!-- condition:xxx -->` 語法進行條件渲染，具體格式可以參照專案內已有的`README.src.md`
- 執行以下程式碼自動化翻譯和渲染所有語言和平台的README
```bash
npm run build:readme
```
#### 安裝使用者腳本

建置完成後，會在專案 `/dist/` 目錄產生 `.user.js` 檔案，可以透過以下步驟安裝：
- 開啟任一建置產物，複製其中全部程式碼內容
- 安裝 Tampermonkey 或 Violentmonkey 瀏覽器擴充功能
- 在擴充功能管理器中點擊"新增新腳本"
- 貼上建置產生的使用者腳本內容## 📁 專案結構

```
pixiv-novel-to-epub/
├── src/
│   ├── components/         # UI 元件
│   │   ├── download-button.vue   # 下載按鈕
│   │   └── content-renderer.vue  # 內容渲染元件
│   ├── i18n/               # 國際化（中/英）
│   ├── modules/            # 功能模組
│   │   ├── api/            # Pixiv API 請求層（含快取與佇列）
│   │   ├── novel/          # 單本小說下載頁面模組
│   │   ├── series/         # 系列下載頁面模組
│   │   ├── custom/         # 自訂合集下載模組
│   │   └── downloader/     # 下載引擎（EPUB 生成、進度管理）
│   ├── utils/              # 工具函式
│   │   └── helpers/        # DOM 操作、網路請求、UI 狀態等
│   ├── main.ts             # 應用程式進入點
│   └── loader.ts           # 模組載入器
├── scripts/                # 建置腳本
│   ├── readme-builder/     # README 多語言建置工具
│   ├── post-compress.js    # 後壓縮處理腳本
│   └── userscript-meta.js  # Userscript 元資料解析工具
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🛠️ 技術棧

- **前端框架**: Vue 3 + TypeScript
- **建置工具**: Vite + vite-plugin-monkey
- **樣式方案**: TailwindCSS v4
- **EPUB 生成**: jEpub
- **國際化**: vue-i18n
- **圖示**: Material Symbols（透過 unplugin-icons）
- **工具庫**: mitt, uuid, dedent

## 📦 建置與部署

### 開發測試
```bash
npm run dev
```

### 生產建置
```bash
npm run build
```

生產建置的產物將在 `/dist/` 中建立

## 🤝 貢獻指南

您可以透過提交 Issue 和 Pull Request 參與到本專案中

### 提交 Issue
- 描述清晰的問題或功能需求
- 提供重現步驟
- 包含相關截圖或日誌

### 提交 Pull Request
1. Fork 專案倉庫
2. 建立功能分支
3. 提交程式碼變更
4. 撰寫清晰的提交資訊
5. 建立 Pull Request

### PR 規範
#### 程式碼規範
本專案沒有硬性的程式碼規範要求，但是請您確保您的程式碼至少能做到：
- 保留有合適的註解
- 通過 TypeScript 型別檢查

#### Commit 規範
每條 commit 中可以包含多個更新內容，每個更新內容應當寫成一條列表項
每條更新內容應當在列表項開頭處標明更新類型，並用英文冒號+空格（`: `）隔開：
| 更新類型       | 描述                                                 |
| :------------- | :--------------------------------------------------- |
| `feat`         | 新功能新增                                           |
| `improvement`  | 既有功能改進                                         |
| `code`         | 功能無變化，僅程式碼（包含註解）修改（程式碼最佳化等）     |
| `performance`  | 功能無變化，僅效能改進                               |
| `bug fix`      | 修復 bug                                             |
| `i18n`         | 程式碼無變化，僅更新語言包                             |
| `maintenance`  | 程式碼無變化的其他更新，如：TODO 列表更新，依賴更新等等 |
| `refactor`     | 功能無變化，程式碼整體重寫（重構）                     |

如果一條更新對應多個類型，以其最主要的類型書寫
commit 訊息應當用英文（或者繁體中文）書寫

commit 訊息範例：
```
- feat: support custom novel ID input
- improvement: debounce download button click
- bug fix: download button no response after multiple clicks
- maintenance: updated README
```

以上 commit 訊息僅作範例。實際 commit 中，對於如此多的更新內容，應當盡量分多次 commit 提交

## 📄 授權條款

本專案採用 [GPL-3.0](https://spdx.org/licenses/GPL-3.0-or-later.html) 授權條款。

## 🎯 使用方法

### 📖 下載單篇小說
1. 開啟任意 Pixiv 小說頁面（`pixiv.net/novel/show.php?id=xxx`）
2. 在作者資訊欄旁邊會看到 **下載按鈕**
3. 點擊按鈕，腳本將自動取得小說內容並生成 EPUB 檔案

### 📚 下載系列合集
1. 開啟 Pixiv 小說系列頁面（`pixiv.net/novel/series/xxx`）
2. 在頁面頂部資訊欄會看到 **下載按鈕**
3. 點擊按鈕，腳本將取得系列內所有小說，合併為一本 EPUB

### ✂️ 自訂合集下載
1. 在任意 Pixiv 頁面，點擊 Tampermonkey 選單中的腳本名稱
2. 選擇 **自訂下載**
3. 在彈出的對話框中輸入小說 ID（每行一個，或以逗號分隔）
4. 為合併檔案指定一個名稱，開始下載

> **提示：** 你可以在對話框中貼上 Pixiv 小說連結，腳本會自動提取其中的 ID。## 🙏 致謝

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - 用於建構使用者腳本的 Vite 插件
- [jEpub](https://github.com/lelinhtinh/jepub) - EPUB 檔案生成函式庫
- [Vue.js](https://vuejs.org/) - 漸進式 JavaScript 框架
- [TailwindCSS](https://tailwindcss.com/) - 實用優先的 CSS 框架
- [Vite](https://vitejs.dev/) - 下一代前端建構工具
- [Tampermonkey](https://www.tampermonkey.net/) - 流行的使用者腳本管理器
- [Violentmonkey](https://violentmonkey.github.io/) - 開源的使用者腳本管理器

---

**注意**: 本專案僅供學習與研究使用，請遵守 Pixiv 的相關使用條款與版權規定。