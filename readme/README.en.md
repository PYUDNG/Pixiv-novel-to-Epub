# Pixiv Novel to Epub

[English](/readme/README.en.md) [简体中文](/readme/README.zh-Hans.md) [繁體中文](/readme/README.zh-Hant.md)

A Tampermonkey / Violentmonkey userscript that lets you download novels from [Pixiv](https://www.pixiv.net) as EPUB ebooks with one click. Supports single-novel downloads, series collections, one-click download of an author's complete works, and custom merged downloads of multiple novels (including batch adding from bookmarks).

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev/)

> If you encounter bugs or have feature suggestions, feel free to [open an issue](https://github.com/PYUDNG/pixiv-novel-to-epub/issues) to discuss.

## ✨ Features

### 📖 Single Novel Download
- Click a button on any Pixiv novel page to download it as an EPUB in one click
- Automatically fetches metadata such as title, author, tags, and cover
- Images in the content are automatically embedded into the EPUB

### 📚 Series Collection
- Download an entire series from a Pixiv novel series page, merged into a single EPUB
- The series cover and all content are included automatically
- A complete table of contents is generated automatically

### ✂️ Custom Collection
- Open the custom download panel from the script menu; input area on the left, live booklist preview on the right
- ID input supports type selection: novel / series / all novels by an author / user's public bookmarks / user's private bookmarks
- Link input auto-detects: novel pages / series pages / author profile pages / user bookmark pages (public vs. private bookmarks distinguished automatically)
- The booklist supports sorting, removal, and reloading, and shows the novel count
- Supports two download modes: download each novel as its own EPUB, or merge them into a single EPUB (filename inferred automatically, editable manually or recalculated with one click)

### 👤 Download an Author's Complete Works
- Download all of an author's novels in one click from the script menu on their Pixiv profile page
- Each single novel becomes an independent EPUB, while series works are merged into one EPUB
- The work index is fetched automatically and downloaded concurrently for efficiency

### 🎨 Smart Dark Mode
- Automatically follows the Pixiv page theme
- The UI always blends in naturally for a seamless experience

### 🌐 Internationalization
- UI supports Simplified Chinese, Traditional Chinese, and English
- Automatically matches the browser language setting

### ⏳ Progress Feedback
- Real-time download progress, every step clearly visible
- The download process can be interrupted at any time
- Smart caching of Pixiv API responses reduces duplicate requests

## 🚀 Quick Start

### Install and Use Directly (recommended for most users)
Choose any of the following installation methods:
- [Greasyfork](https://greasyfork.org/scripts/483999)
- [Github Release](https://github.com/PYUDNG/pixiv-novel-to-epub/releases)

### Build It Yourself

#### Requirements
> This project is developed with npm as the package manager; other package managers are at your own discretion
- Node.js 18+
- npm

#### Development Setup

1. **Clone the repository**
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

5. **To build without code compression and beautification, use the following commands**
```bash
npm run build:deps && npm run build:raw
```

6. **Automated AI translation of the README**
- Create `scripts/readme-builder/openai.config.ts` (refer to `openai.config.d.ts` and `openai.config.ts.template` in the same directory), and fill in your own AI API configuration
- Edit `README.src.md`, write the README in the language you are familiar with, and use conditional rendering markers to control what is displayed for different platforms and languages (see the existing marker examples in `README.src.md`)
- Run the following command to automatically translate and render the README for all languages and platforms
```bash
npm run build:readme
```

#### Install the Userscript

After building, a `.user.js` file will be generated in the project's `/dist/` directory. Install it as follows:
- Open any build artifact and copy all of its code
- Install the Tampermonkey or Violentmonkey browser extension
- Click "Add New Script" in the extension manager
- Paste the built userscript content

## 📁 Project Structure

```
pixiv-novel-to-epub/
├── src/
│   ├── components/         # UI components
│   │   ├── area.vue                # Grouped area container
│   │   ├── button.vue              # Button component
│   │   ├── download-button.vue     # Download button
│   │   ├── content-renderer.vue    # Content renderer component
│   │   ├── select.vue              # Dropdown selector
│   │   ├── toggle.vue              # Toggle switch component
│   │   └── multi-input/            # Multi-text input component
│   │       ├── multi-input.vue
│   │       └── text-tag.vue
│   ├── i18n/               # Internationalization (Simplified/Traditional Chinese, English)
│   ├── modules/            # Feature modules
│   │   ├── api/            # Pixiv API request layer (with caching and queue)
│   │   │   ├── novel/      # Novel/series APIs
│   │   │   └── user/       # User profile and bookmark APIs
│   │   ├── novel/          # Single novel download page module
│   │   ├── series/         # Series download page module
│   │   ├── author/         # Author profile download module
│   │   ├── custom/         # Custom collection download module
│   │   └── downloader/     # Download engine (EPUB generation, progress management)
│   ├── utils/              # Utility functions
│   │   └── helpers/        # DOM operations, network requests, UI state, etc.
│   ├── main.ts             # Application entry
│   └── loader.ts           # Module loader
├── scripts/                # Build scripts
│   ├── readme-builder/     # README multi-language build tool
│   ├── post-compress.js    # Post-compression processing script
│   └── userscript-meta.js  # Userscript metadata parsing tool
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🛠️ Tech Stack

- **Frontend framework**: Vue 3 + TypeScript
- **Build tool**: Vite + vite-plugin-monkey
- **Styling**: TailwindCSS v4
- **EPUB generation**: jEpub
- **Internationalization**: vue-i18n
- **Icons**: Material Symbols (via unplugin-icons)
- **Libraries**: mitt, uuid, dedent

## 📦 Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

The production build output will be created in `/dist/`

## 🤝 Contributing

You can participate in this project by submitting Issues and Pull Requests

### Submitting an Issue
- Describe the problem or feature request clearly
- Provide reproduction steps
- Include relevant screenshots or logs

### Submitting a Pull Request
1. Fork the repository
2. Create a feature branch
3. Commit your code changes
4. Write clear commit messages
5. Create the Pull Request

### PR Guidelines
#### Code Standards
This project has no strict code standards, but please make sure your code at least:
- Keeps appropriate comments
- Passes the TypeScript type check

#### Commit Message Standards
Each commit may contain multiple updates, and each update should be written as a list item
Each update item should start with the update type, separated by an English colon and a space (`: `):
| Type          | Description                                                       |
| :------------ | :---------------------------------------------------------------- |
| `feat`        | Adding a new feature                                              |
| `improvement` | Improving an existing feature                                     |
| `code`        | Code-only changes (including comments) with no functional change (code optimization, etc.) |
| `performance` | Performance improvements with no functional change                 |
| `bug fix`     | Bug fixes                                                         |
| `i18n`        | Language pack updates with no code change                         |
| `maintenance` | Other updates with no code change, such as TODO list updates, dependency updates, etc. |
| `refactor`    | Complete code rewrite with no functional change                   |

If an update covers multiple types, use the most prominent one
Commit messages should be written in English (or Simplified Chinese)

Example commit messages:
```
- feat: support custom novel ID input
- improvement: debounce download button click
- bug fix: download button no response after multiple clicks
- maintenance: updated README
```

The above commit messages are examples only. In practice, for so many updates, you should try to split them into multiple commits

## 📄 License

This project is licensed under [GPL-3.0](https://spdx.org/licenses/GPL-3.0-or-later.html).

## 🎯 Usage

### 📖 Download a Single Novel
1. Open any Pixiv novel page (`pixiv.net/novel/show.php?id=xxx`)
2. You will see a **Download button** next to the author info section
3. Click the button, and the script will automatically fetch the novel content and generate the EPUB file

### 📚 Download a Series Collection
1. Open a Pixiv novel series page (`pixiv.net/novel/series/xxx`)
2. You will see a **Download button** in the info bar at the top of the page
3. Click the button, and the script will fetch all novels in the series and merge them into one EPUB

### ✂️ Custom Collection Download
1. On any Pixiv page, click the script name in the Tampermonkey menu
2. Select **Custom Download**
3. Add novels in the input area on the left: when entering an ID, choose a type from the dropdown (novel / series / all novels by an author / user's public bookmarks / user's private bookmarks); when pasting a link, the script automatically recognizes novel pages, series pages, author profile pages, and bookmark pages
4. Preview the added novels in the booklist on the right; you can sort, remove, or reload them
5. Choose the download mode in the download options: by default each novel is downloaded as its own EPUB; to merge into a single EPUB, turn on the merge toggle and confirm the filename (auto-inference and manual editing supported)
6. Click Confirm to start downloading

> **Tip:** You can paste Pixiv novel links into the input; the script will extract the ID automatically. Bookmark page links can be distinguished between public and private bookmarks via `?rest=hide`.

### 👤 Download an Author's Complete Works
1. Open any Pixiv user profile page (`pixiv.net/users/xxx`)
2. Select **Download all novels by this author** from the Tampermonkey menu
3. After confirmation, the script will automatically fetch all of the author's novels and series
4. Each single novel is saved as an independent EPUB file, while series works are merged into a single EPUB file, saved automatically

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
