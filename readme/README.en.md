# Pixiv Novel to Epub

[English](/readme/README.en.md) [简体中文](/readme/README.zh-Hans.md) [繁體中文](/readme/README.zh-Hant.md)

A Tampermonkey / Violentmonkey userscript that allows one-click download of EPUB ebooks from [Pixiv](https://www.pixiv.net) novel pages. Supports single novel downloads, series collection downloads, and custom multi-novel merged downloads.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev/)

> If you encounter any errors or have feature suggestions, feel free to [open an issue](https://github.com/PYUDNG/pixiv-novel-to-epub/issues) for discussion.

## ✨ Features

### 📖 Single Novel Download
- Click a button on any Pixiv single novel page to download as an EPUB file
- Automatically retrieves metadata such as title, author, tags, and cover
- Images within the content are embedded into the EPUB

### 📚 Series Collection
- Download an entire series from a Pixiv novel series page, merged into one EPUB
- Series cover and all content are automatically included
- Generates a complete table of contents

### ✂️ Custom Collection
- Manually input multiple novel IDs via the script menu
- Supports direct input of numeric IDs or pasting full links
- Merges and downloads as a single EPUB with a custom filename

### 🎨 Smart Dark Mode
- Automatically follows the Pixiv page theme switching
- UI always blends in naturally for a seamless experience

### 🌐 Internationalization
- Interface supports Simplified Chinese, Traditional Chinese, and English
- Automatically matches browser language settings

### ⏳ Progress Feedback
- Real-time download progress display, with each step clearly visible
- Supports interrupting the download process at any time
- Intelligent caching of Pixiv API responses to reduce duplicate requests

## 🚀 Quick Start

### Direct Installation (Suitable for Most Users)
You can install via any of the following methods:
- [Greasyfork](https://greasyfork.org/scripts/483999)
- [Github Release](https://github.com/PYUDNG/pixiv-novel-to-epub/releases)

### Build from Source

#### Prerequisites
> This project uses npm as the package manager for development. Please try other package managers on your own.
- Node.js 18+
- npm

#### Development Setup

1. **Clone the project**
```bash
git clone https://github.com/PYUDNG/pixiv-novel-to-epub.git
cd pixiv-novel-to-epub
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Build the userscript**
```bash
npm run build
```

5. **Post-processing (beautify + compress)**
```bash
npm run build:dist
```

#### Install the Userscript

After building, a `.user.js` file will be generated in the `/dist/` directory. You can install it by following these steps:
- Open any build artifact and copy all the code content
- Install the Tampermonkey or Violentmonkey browser extension
- Click "Add new script" in the extension manager
- Paste the generated userscript content

## 📁 Project Structure

```
pixiv-novel-to-epub/
├── src/
│   ├── components/         # UI Components
│   │   ├── download-button.vue   # Download button
│   │   └── content-renderer.vue  # Content renderer component
│   ├── i18n/               # Internationalization (Chinese/English)
│   ├── modules/            # Feature modules
│   │   ├── api/            # Pixiv API request layer (with cache and queue)
│   │   ├── novel/          # Single novel download page module
│   │   ├── series/         # Series download page module
│   │   ├── custom/         # Custom collection download module
│   │   └── downloader/     # Download engine (EPUB generation, progress management)
│   ├── utils/              # Utility functions
│   │   └── helpers/        # DOM operations, network requests, UI state, etc.
│   ├── main.ts             # Application entry point
│   └── loader.ts           # Module loader
├── scripts/                # Build scripts
│   ├── readme-builder/     # README multilingual build tool
│   ├── post-compress.js    # Post-compression processing script
│   └── userscript-meta.js  # Userscript metadata parsing tool
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🛠️ Tech Stack

- **Frontend Framework**: Vue 3 + TypeScript
- **Build Tool**: Vite + vite-plugin-monkey
- **Styling**: TailwindCSS v4
- **EPUB Generation**: jEpub
- **Internationalization**: vue-i18n
- **Icons**: Material Symbols (via unplugin-icons)
- **Utilities**: mitt, uuid, dedent## 📦 Build & Deployment

### Development Testing
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

The production build output will be created in `/dist/`

## 🤝 Contribution Guide

You can contribute to this project by submitting Issues and Pull Requests

### Submitting an Issue
- Clearly describe the problem or feature request
- Provide steps to reproduce
- Include relevant screenshots or logs

### Submitting a Pull Request
1. Fork the project repository
2. Create a feature branch
3. Commit your code changes
4. Write clear commit messages
5. Create a Pull Request

### PR Guidelines
#### Code Standards
This project does not have strict code standards, but please ensure your code at least:
- Contains appropriate comments
- Passes TypeScript type checking

#### Commit Standards
Each commit can contain multiple updates, each update should be written as a list item
Each update should indicate the update type at the beginning of the list item, separated by an English colon and space (`: `):
| Update Type     | Description                                          |
| :------------- | :--------------------------------------------------- |
| `feat`         | New feature addition                                 |
| `improvement`  | Improvement of existing features                     |
| `code`         | No functional changes, only code (including comments) modifications (code optimization, etc.) |
| `performance`  | No functional changes, only performance improvements |
| `bug fix`      | Bug fixes                                            |
| `i18n`         | No code changes, only language pack updates          |
| `maintenance`  | Other updates without code changes, such as: TODO list updates, dependency updates, etc. |
| `refactor`     | No functional changes, complete code rewrite (refactoring) |

If an update corresponds to multiple types, use the most primary type
Commit messages should be written in English (or Simplified Chinese)

Commit message example:
```
- feat: support custom novel ID input
- improvement: debounce download button click
- bug fix: download button no response after multiple clicks
- maintenance: updated README
```

The above commit messages are just examples. In actual commits, for such many updates, try to submit them in multiple separate commits

## 📄 License

This project is licensed under the [GPL-3.0](https://spdx.org/licenses/GPL-3.0-or-later.html) license.

## 🎯 Usage

### 📖 Download a Single Novel
1. Open any Pixiv novel page (`pixiv.net/novel/show.php?id=xxx`)
2. You will see a **download button** next to the author information bar
3. Click the button, the script will automatically fetch the novel content and generate an EPUB file

### 📚 Download a Series Collection
1. Open a Pixiv novel series page (`pixiv.net/novel/series/xxx`)
2. You will see a **download button** in the information bar at the top of the page
3. Click the button, the script will fetch all novels in the series and merge them into one EPUB

### ✂️ Custom Collection Download
1. On any Pixiv page, click the script name in the Tampermonkey menu
2. Select **Custom Download**
3. In the popup dialog, enter the novel IDs (one per line, or separated by commas)
4. Specify a name for the merged file and start the download

> **Tip:** You can paste Pixiv novel links into the dialog, and the script will automatically extract the IDs.

## 🙏 Acknowledgements

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - Vite plugin for building user scripts
- [jEpub](https://github.com/lelinhtinh/jepub) - EPUB file generation library
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next-generation frontend build tool
- [Tampermonkey](https://www.tampermonkey.net/) - Popular user script manager
- [Violentmonkey](https://violentmonkey.github.io/) - Open-source user script manager

---

**Note**: This project is for learning and research purposes only. Please comply with Pixiv's terms of use and copyright regulations.