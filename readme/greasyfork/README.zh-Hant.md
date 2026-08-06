# Pixiv小說Epub合成器 / Pixiv Novel to Epub

一個 Tampermonkey / Violentmonkey 使用者腳本，可在 [Pixiv](https://www.pixiv.net) 小說頁面上一鍵下載 EPUB 格式電子書。支援單本下載、系列合集下載、作者全部作品一鍵下載，以及自訂多本小說合併下載（支援收藏小說批次新增）。

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev/)

> 如遇錯誤或有功能建議，歡迎 [提出 issue](https://github.com/PYUDNG/pixiv-novel-to-epub/issues) 共同討論解決

## ✨ 功能特性

### 📖 單本下載
- 在 Pixiv 單篇小說頁面點擊按鈕，一鍵下載為 EPUB 檔案
- 自動取得標題、作者、標籤、封面等中繼資料
- 內容中的圖片自動嵌入 EPUB

### 📚 系列合集
- 在 Pixiv 小說系列頁面下載整個系列，合併為一本 EPUB
- 系列封面與全部內容自動包含在內
- 自動產生完整目錄

### ✂️ 自訂合集
- 透過腳本選單開啟自訂下載面板，左側輸入、右側書單即時預覽
- ID 輸入支援類型選擇：小說 / 系列 / 作者全部小說 / 使用者公開收藏 / 使用者非公開收藏
- 連結輸入自動辨識：小說頁 / 系列頁 / 作者主頁 / 使用者收藏頁（自動區分公開與非公開收藏）
- 書單支援排序、移除、重新載入，並標註小說數量
- 支援兩種下載方式：每本小說單獨下載為一個 EPUB，或合併為一本 EPUB（檔名自動推斷，可手動編輯或一鍵重新計算）

### 👤 作者全部作品下載
- 在 Pixiv 使用者主頁透過腳本選單一鍵下載作者全部小說
- 單篇小說每篇獨立一個 EPUB，系列作品合併為一個 EPUB
- 自動取得作品索引，並發下載，快速高效

### 🎨 智慧深色模式
- 自動跟隨 Pixiv 頁面主題切換
- UI 始終融合自然，無縫體驗

### 🌐 國際化
- 介面支援簡體中文、繁體中文、英文
- 自動比對瀏覽器語言設定

### ⏳ 進度回饋
- 即時顯示下載進度，每個步驟清晰可見
- 支援隨時中斷下載過程
- 智慧快取 Pixiv API 回應，減少重複請求

## 📄 授權

本專案採用 [GPL-3.0](https://spdx.org/licenses/GPL-3.0-or-later.html) 授權。

## 🎯 使用方法

### 📖 下載單篇小說
1. 開啟任意 Pixiv 小說頁面（`pixiv.net/novel/show.php?id=xxx`）
2. 在作者資訊欄旁邊會看到 **下載按鈕**
3. 點擊按鈕，腳本將自動取得小說內容並產生 EPUB 檔案

### 📚 下載系列合集
1. 開啟 Pixiv 小說系列頁面（`pixiv.net/novel/series/xxx`）
2. 在頁面頂部資訊欄會看到 **下載按鈕**
3. 點擊按鈕，腳本將取得系列內所有小說，合併為一本 EPUB

### ✂️ 自訂合集下載
1. 在任意 Pixiv 頁面，點擊 Tampermonkey 選單中的腳本名稱
2. 選擇 **自訂下載**
3. 在左側輸入區新增小說：輸入 ID 時可透過下拉選單選擇類型（小說 / 系列 / 作者全部小說 / 使用者公開收藏 / 使用者非公開收藏）；貼上連結時會自動辨識小說頁、系列頁、作者主頁、收藏頁
4. 在右側書單中預覽已新增的小說，可排序、移除或重新載入
5. 在下載選項中選擇下載方式：預設每本小說單獨下載為一個 EPUB；如需合併為一本 EPUB，開啟合併開關並確認檔名（支援自動推斷與手動編輯）
6. 點擊確認，開始下載

> **提示：** 輸入框支援貼上 Pixiv 小說連結，腳本會自動從中取出 ID；收藏頁連結可透過 `?rest=hide` 區分公開與非公開收藏。

### 👤 下載作者全部作品
1. 開啟任意 Pixiv 使用者主頁（`pixiv.net/users/xxx`）
2. 在 Tampermonkey 選單中選擇 **下載該作者全部小說**
3. 確認後，腳本將自動取得該作者的全部小說和系列作品
4. 單篇小說每篇獨立一個 EPUB 檔案，系列作品合併為一個 EPUB 檔案，自動儲存

## 🙏 致謝

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - 用於建置使用者腳本的 Vite 外掛
- [jEpub](https://github.com/lelinhtinh/jepub) - EPUB 檔案產生函式庫
- [Vue.js](https://vuejs.org/) - 漸進式 JavaScript 框架
- [TailwindCSS](https://tailwindcss.com/) - 實用優先的 CSS 框架
- [Vite](https://vitejs.dev/) - 次世代前端建置工具
- [Tampermonkey](https://www.tampermonkey.net/) - 熱門的使用者腳本管理器
- [Violentmonkey](https://violentmonkey.github.io/) - 開放原始碼的使用者腳本管理器

---

**注意**: 本專案僅供學習和研究使用，請遵守 Pixiv 的相關使用條款與版權規定。
