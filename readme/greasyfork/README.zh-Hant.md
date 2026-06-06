# Pixiv小說Epub合成器 / Pixiv Novel to Epub

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
- 內容中的圖片自動嵌入 EPUB

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

## 📄 許可證

本專案採用 [GPL-3.0](https://spdx.org/licenses/GPL-3.0-or-later.html) 許可證。

## 🎯 使用方法

### 📖 下載單篇小說
1. 開啟任意 Pixiv 小說頁面（`pixiv.net/novel/show.php?id=xxx`）
2. 在作者資訊欄旁邊會看到 **下載按鈕**
3. 點擊按鈕，腳本將自動獲取小說內容並生成 EPUB 檔案

### 📚 下載系列合集
1. 開啟 Pixiv 小說系列頁面（`pixiv.net/novel/series/xxx`）
2. 在頁面頂部資訊欄會看到 **下載按鈕**
3. 點擊按鈕，腳本將獲取系列內所有小說，合併為一本 EPUB

### ✂️ 自訂合集下載
1. 在任意 Pixiv 頁面，點擊 Tampermonkey 選單中的腳本名稱
2. 選擇 **自訂下載**
3. 在彈出的對話框中輸入小說 ID（每行一個，或以逗號分隔）
4. 為合併檔案指定一個名稱，開始下載

> **提示：** 你可以在對話框中貼上 Pixiv 小說連結，腳本會自動提取其中的 ID。

## 🙏 致謝

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - 用於建置使用者腳本的 Vite 插件
- [jEpub](https://github.com/lelinhtinh/jepub) - EPUB 檔案生成函式庫
- [Vue.js](https://vuejs.org/) - 漸進式 JavaScript 框架
- [TailwindCSS](https://tailwindcss.com/) - 實用優先的 CSS 框架
- [Vite](https://vitejs.dev/) - 下一代前端建置工具
- [Tampermonkey](https://www.tampermonkey.net/) - 流行的使用者腳本管理器
- [Violentmonkey](https://violentmonkey.github.io/) - 開源的使用者腳本管理器

---

**注意**: 本專案僅供學習和研究使用，請遵守 Pixiv 的相關使用條款和版權規定。