# Pixiv Novel to Epub

A Tampermonkey / Violentmonkey userscript that enables one-click EPUB download on [Pixiv](https://www.pixiv.net) novel pages. Supports single novel download, series collection download, and custom multi-novel merge download.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev/)

> If you encounter errors or have feature suggestions, feel free to [open an issue](https://github.com/PYUDNG/pixiv-novel-to-epub/issues) for discussion.

## ✨ Features

### 📖 Single Novel Download
- Click the button on a single Pixiv novel page to download it as an EPUB file
- Automatically retrieves metadata such as title, author, tags, and cover
- Images within the content are automatically embedded into the EPUB

### 📚 Series Collection
- Download an entire series from a Pixiv novel series page, merged into one EPUB
- Series cover and all content are automatically included
- Generates a complete table of contents automatically

### ✂️ Custom Collection
- Manually input multiple novel IDs via the script menu
- Supports direct input of numeric IDs or pasting full links
- Merges and downloads as one EPUB with a custom filename

### 🎨 Smart Dark Mode
- Automatically follows the Pixiv page theme switch
- UI always blends naturally for a seamless experience

### 🌐 Internationalization
- Interface supports Simplified Chinese, Traditional Chinese, and English
- Automatically matches browser language settings

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
3. Click the button, and the script will fetch all novels in the series and merge them into one EPUB

### ✂️ Custom Collection Download
1. On any Pixiv page, click the script name in the Tampermonkey menu
2. Select **Custom Download**
3. In the dialog that appears, enter the novel IDs (one per line, or separated by commas)
4. Specify a name for the merged file and start the download

> **Tip:** You can paste Pixiv novel links into the dialog, and the script will automatically extract the IDs.

## 🙏 Acknowledgments

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - Vite plugin for building userscripts
- [jEpub](https://github.com/lelinhtinh/jepub) - EPUB file generation library
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next-generation frontend build tool
- [Tampermonkey](https://www.tampermonkey.net/) - Popular userscript manager
- [Violentmonkey](https://violentmonkey.github.io/) - Open-source userscript manager

---

**Note**: This project is for learning and research purposes only. Please comply with Pixiv's terms of use and copyright regulations.