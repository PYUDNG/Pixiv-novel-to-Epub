# Pixiv Novel to Epub

A Tampermonkey / Violentmonkey userscript that enables one-click download of EPUB ebooks from [Pixiv](https://www.pixiv.net) novel pages. Supports single novel downloads, series collection downloads, and custom multi-novel merged downloads.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev/)

> If you encounter errors or have feature suggestions, feel free to [open an issue](https://github.com/PYUDNG/pixiv-novel-to-epub/issues) for discussion and resolution.

## ✨ Features

### 📖 Single Novel Download
- Click the button on any Pixiv single novel page to download it as an EPUB file
- Automatically retrieves metadata such as title, author, tags, and cover image
- Images within the content are automatically embedded into the EPUB

### 📚 Series Collection
- Download an entire series from the Pixiv novel series page, merging it into a single EPUB
- Series cover and all content are automatically included
- A complete table of contents is automatically generated

### ✂️ Custom Collection
- Manually input multiple novel IDs via the script menu
- Supports entering numeric IDs directly or pasting full links
- Merge and download as a single EPUB with a custom filename

### 🎨 Smart Dark Mode
- Automatically follows the Pixiv page theme switching
- UI always blends naturally for a seamless experience

### 🌐 Internationalization
- Interface supports Simplified Chinese, Traditional Chinese, and English
- Automatically matches the browser language setting

### ⏳ Progress Feedback
- Real-time download progress display, with each step clearly visible
- Supports interrupting the download process at any time
- Intelligent caching of Pixiv API responses to reduce duplicate requests

## 📄 License

This project is licensed under [GPL-3.0](https://spdx.org/licenses/GPL-3.0-or-later.html).

## 🎯 Usage

### 📖 Download a Single Novel
1. Open any Pixiv novel page (`pixiv.net/novel/show.php?id=xxx`)
2. You will see a **download button** next to the author information bar
3. Click the button, and the script will automatically fetch the novel content and generate an EPUB file

### 📚 Download a Series Collection
1. Open a Pixiv novel series page (`pixiv.net/novel/series/xxx`)
2. You will see a **download button** in the information bar at the top of the page
3. Click the button, and the script will fetch all novels in the series and merge them into a single EPUB

### ✂️ Custom Collection Download
1. On any Pixiv page, click the script name in the Tampermonkey menu
2. Select **Custom Download**
3. In the dialog that appears, enter the novel IDs (one per line, or separated by commas)
4. Specify a name for the merged file and start the download

> **Tip:** You can paste Pixiv novel links into the dialog, and the script will automatically extract the IDs.

## 🙏 Acknowledgements

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - Vite plugin for building userscripts
- [jEpub](https://github.com/lelinhtinh/jepub) - EPUB file generation library
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next-generation frontend build tool
- [Tampermonkey](https://www.tampermonkey.net/) - Popular userscript manager
- [Violentmonkey](https://violentmonkey.github.io/) - Open-source userscript manager

---

**Note**: This project is for learning and research purposes only. Please comply with Pixiv's terms of use and copyright regulations.