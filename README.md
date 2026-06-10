# Pixiv Novel to Epub

[English](/readme/README.en.md) [简体中文](/readme/README.zh-Hans.md) [繁體中文](/readme/README.zh-Hant.md)

A Tampermonkey / Violentmonkey user script that enables one-click download of EPUB ebooks from [Pixiv](https://www.pixiv.net) novel pages. Supports single novel download, series collection download, and custom multi-novel merge download.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev/)

> If you encounter errors or have feature suggestions, feel free to [open an issue](https://github.com/PYUDNG/pixiv-novel-to-epub/issues) for discussion.

## ✨ Features

### 📖 Single Novel Download
- Click the button on any Pixiv single novel page to download as an EPUB file
- Automatically retrieves metadata such as title, author, tags, and cover
- Images within the content are embedded into the EPUB

### 📚 Series Collection
- Download an entire series from a Pixiv novel series page, merged into a single EPUB
- Series cover and all content are automatically included
- A complete table of contents is generated automatically

### ✂️ Custom Collection
- Manually input multiple novel IDs via the script menu
- Supports direct input of numeric IDs or pasting full links
- Merged into a single EPUB download with a custom filename

### 🎨 Smart Dark Mode
- Automatically follows the Pixiv page theme switch
- UI always blends naturally for a seamless experience

### 🌐 Internationalization
- Interface supports Simplified Chinese, Traditional Chinese, and English
- Automatically matches the browser language setting

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

#### Development Environment Setup

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

4. **Build the user script**
```bash
npm run build
```

5. **If code compression and beautification are not needed, you can build with the following command**
```bash
npm run build:deps && npm run build:raw
```

6. **Automated AI translation of README**
- Create `scripts/readme-builder/openai.config.ts` (refer to `openai.config.d.ts` and `openai.config.ts.template` in the same directory) and fill in your own AI API configuration
- Modify `README.src.md`, write the README in your preferred language, and support conditional rendering using the `<!-- condition:xxx -->` syntax. For specific formatting, refer to the existing `README.src.md` in the project.
- Run the following command to automatically translate and render the README for all languages and platforms
```bash
npm run build:readme
```

#### Installing the User Script

After building, a `.user.js` file will be generated in the `/dist/` directory. You can install it by following these steps:
- Open any build artifact and copy all the code content
- Install the Tampermonkey or Violentmonkey browser extension
- Click "Add new script" in the extension manager
- Paste the built user script content## 📁 Project Structure

```
pixiv-novel-to-epub/
├── src/
│   ├── components/         # UI Components
│   │   ├── download-button.vue   # Download Button
│   │   └── content-renderer.vue  # Content Renderer Component
│   ├── i18n/               # Internationalization (Chinese/English)
│   ├── modules/            # Feature Modules
│   │   ├── api/            # Pixiv API Request Layer (with Cache & Queue)
│   │   ├── novel/          # Single Novel Download Page Module
│   │   ├── series/         # Series Download Page Module
│   │   ├── custom/         # Custom Collection Download Module
│   │   └── downloader/     # Download Engine (EPUB Generation, Progress Management)
│   ├── utils/              # Utility Functions
│   │   └── helpers/        # DOM Operations, Network Requests, UI State, etc.
│   ├── main.ts             # Application Entry Point
│   └── loader.ts           # Module Loader
├── scripts/                # Build Scripts
│   ├── readme-builder/     # README Multilingual Build Tool
│   ├── post-compress.js    # Post-Compression Processing Script
│   └── userscript-meta.js  # Userscript Metadata Parsing Tool
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🛠️ Tech Stack

- **Frontend Framework**: Vue 3 + TypeScript
- **Build Tool**: Vite + vite-plugin-monkey
- **Styling Solution**: TailwindCSS v4
- **EPUB Generation**: jEpub
- **Internationalization**: vue-i18n
- **Icons**: Material Symbols (via unplugin-icons)
- **Utility Libraries**: mitt, uuid, dedent

## 📦 Build & Deployment

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

You can participate in this project by submitting Issues and Pull Requests.

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
This project does not have strict code standards, but please ensure your code at least meets the following:
- Includes appropriate comments
- Passes TypeScript type checking

#### Commit Standards
Each commit can contain multiple updates, and each update should be written as a list item.
Each update should indicate the update type at the beginning of the list item, separated by an English colon and space (`: `):
| Update Type     | Description                                          |
| :-------------- | :--------------------------------------------------- |
| `feat`          | New feature addition                                 |
| `improvement`   | Improvement of existing features                     |
| `code`          | No functional change, only code (including comments) modification (code optimization, etc.) |
| `performance`   | No functional change, only performance improvement   |
| `bug fix`       | Bug fix                                              |
| `i18n`          | No code change, only language pack update            |
| `maintenance`   | Other updates with no code change, e.g., TODO list update, dependency update, etc. |
| `refactor`      | No functional change, complete code rewrite (refactoring) |

If an update corresponds to multiple types, use the most primary type.
Commit messages should be written in English (or Simplified Chinese).

Commit message example:
```
- feat: support custom novel ID input
- improvement: debounce download button click
- bug fix: download button no response after multiple clicks
- maintenance: updated README
```

The above commit messages are only examples. In actual commits, for such a large number of updates, they should be submitted in multiple separate commits as much as possible.

## 📄 License

This project is licensed under the [GPL-3.0](https://spdx.org/licenses/GPL-3.0-or-later.html) license.

## 🎯 Usage Guide

### 📖 Downloading a Single Novel
1. Open any Pixiv novel page (`pixiv.net/novel/show.php?id=xxx`)
2. You will see a **Download Button** next to the author information bar
3. Click the button, and the script will automatically fetch the novel content and generate an EPUB file

### 📚 Downloading a Series Collection
1. Open a Pixiv novel series page (`pixiv.net/novel/series/xxx`)
2. You will see a **Download Button** in the information bar at the top of the page
3. Click the button, and the script will fetch all novels in the series and merge them into one EPUB

### ✂️ Custom Collection Download
1. On any Pixiv page, click the script name in the Tampermonkey menu
2. Select **Custom Download**
3. In the popup dialog, enter the novel IDs (one per line, or separated by commas)
4. Specify a name for the merged file and start the download

> **Tip:** You can paste Pixiv novel links into the dialog, and the script will automatically extract the IDs.## 🙏 Acknowledgements

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - Vite plugin for building user scripts
- [jEpub](https://github.com/lelinhtinh/jepub) - EPUB file generation library
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next-generation frontend build tool
- [Tampermonkey](https://www.tampermonkey.net/) - Popular user script manager
- [Violentmonkey](https://violentmonkey.github.io/) - Open-source user script manager

---

**Note**: This project is for learning and research purposes only. Please comply with Pixiv's terms of use and copyright regulations.