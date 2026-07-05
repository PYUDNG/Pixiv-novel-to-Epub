# Pixiv Novel to Epub

A Tampermonkey / Violentmonkey user script that allows one-click download of EPUB e-books on [Pixiv](https://www.pixiv.net) novel pages. Supports single novel download, series collection download, and custom multi-novel merged download.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev/)

> If you encounter any errors or have feature suggestions, feel free to [submit an issue](https://github.com/PYUDNG/pixiv-novel-to-epub/issues) for discussion and resolution.

## ✨ Features

### 📖 Single Novel Download
- Click the button on a single Pixiv novel page to download it as an EPUB file with one click.
- Automatically retrieves metadata such as title, author, tags, and cover.
- Images within the content are automatically embedded into the EPUB.

### 📚 Series Collection
- Download an entire series from the Pixiv novel series page and merge it into a single EPUB.
- The series cover and all content are automatically included.
- A complete table of contents is automatically generated.

### ✂️ Custom Collection
- Manually input multiple novel IDs via the script menu.
- Supports directly entering numeric IDs or pasting full links.
- Merge and download as a single EPUB, with a custom file name.

### 👤 Download All Works by an Author
- On a Pixiv user profile page, use the script menu to download all novels by the author with one click.
- Each single novel is saved as an independent EPUB, while series works are merged into one EPUB.
- Automatically fetches the work index and downloads concurrently for efficiency.

### 🎨 Smart Dark Mode
- Automatically follows the Pixiv page theme switching.
- The UI always blends in naturally for a seamless experience.

### 🌐 Internationalization
- The interface supports Simplified Chinese, Traditional Chinese, and English.
- Automatically matches the browser language settings.

### ⏳ Progress Feedback
- Displays download progress in real time, with each step clearly visible.
- Supports interrupting the download process at any time.
- Intelligently caches Pixiv API responses to reduce duplicate requests.

## 📄 License

This project is licensed under the [GPL-3.0](https://spdx.org/licenses/GPL-3.0-or-later.html) license.

## 🎯 Usage

### 📖 Download a Single Novel
1. Open any Pixiv novel page (`pixiv.net/novel/show.php?id=xxx`).
2. You will see a **download button** next to the author information bar.
3. Click the button, and the script will automatically fetch the novel content and generate an EPUB file.

### 📚 Download a Series Collection
1. Open a Pixiv novel series page (`pixiv.net/novel/series/xxx`).
2. You will see a **download button** in the information bar at the top of the page.
3. Click the button, and the script will fetch all novels in the series and merge them into a single EPUB.

### ✂️ Custom Collection Download
1. On any Pixiv page, click the script name in the Tampermonkey menu.
2. Select **Custom Download**.
3. In the dialog that appears, enter the novel IDs (one per line, or separated by commas).
4. Specify a name for the merged file and start the download.

> **Tip:** You can paste Pixiv novel links into the dialog, and the script will automatically extract the IDs.

### 👤 Download All Works by an Author
1. Open any Pixiv user profile page (`pixiv.net/users/xxx`).
2. In the Tampermonkey menu, select **Download All Novels by This Author**.
3. After confirmation, the script will automatically fetch all novels and series works by the author.
4. Each single novel is saved as an independent EPUB file, while series works are merged into one EPUB file, all saved automatically.

## 🙏 Acknowledgments

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - A Vite plugin for building user scripts.
- [jEpub](https://github.com/lelinhtinh/jepub) - An EPUB file generation library.
- [Vue.js](https://vuejs.org/) - A progressive JavaScript framework.
- [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework.
- [Vite](https://vitejs.dev/) - A next-generation frontend build tool.
- [Tampermonkey](https://www.tampermonkey.net/) - A popular user script manager.
- [Violentmonkey](https://violentmonkey.github.io/) - An open-source user script manager.

---

**Note**: This project is for learning and research purposes only. Please comply with Pixiv's terms of service and copyright regulations.