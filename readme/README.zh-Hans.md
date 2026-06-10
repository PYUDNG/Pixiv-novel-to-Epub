# Pixiv小说Epub合成器 / Pixiv Novel to Epub

[English](/readme/README.en.md) [简体中文](/readme/README.zh-Hans.md) [繁體中文](/readme/README.zh-Hant.md)

一个 Tampermonkey / Violentmonkey 用户脚本，可在 [Pixiv](https://www.pixiv.net) 小说页面上一键下载 EPUB 格式电子书。支持单本下载、系列合集下载，以及自定义多本小说合并下载。

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev/)

> 如遇错误或有功能建议，欢迎 [提出 issue](https://github.com/PYUDNG/pixiv-novel-to-epub/issues) 共同讨论解决

## ✨ 功能特性

### 📖 单本下载
- 在 Pixiv 单篇小说页面点击按钮，一键下载为 EPUB 文件
- 自动获取标题、作者、标签、封面等元数据
- 内容中的图片自动嵌入EPUB

### 📚 系列合集
- 在 Pixiv 小说系列页面下载整个系列，合并为一本 EPUB
- 系列封面和全部内容自动包含在内
- 自动生成完整目录

### ✂️ 自定义合集
- 通过脚本菜单手动输入多篇小说 ID
- 支持直接输入数字 ID 或粘贴完整链接
- 合并下载为一本 EPUB，自定义文件名

### 🎨 智能深色模式
- 自动跟随 Pixiv 页面主题切换
- UI 始终融合自然，无缝体验

### 🌐 国际化
- 界面支持简体中文、繁体中文、英文
- 自动匹配浏览器语言设置

### ⏳ 进度反馈
- 实时显示下载进度，每个步骤清晰可见
- 支持随时中断下载过程
- 智能缓存 Pixiv API 响应，减少重复请求

## 🚀 快速开始

### 直接安装使用（适合大多数用户）
您可以选择以下任一方式安装：
- [Greasyfork](https://greasyfork.org/scripts/483999)
- [Github Release](https://github.com/PYUDNG/pixiv-novel-to-epub/releases)

### 自行构建

#### 环境要求
> 本项目使用 npm 作为包管理器开发，其他包管理器请自行尝试
- Node.js 18+
- npm

#### 开发环境设置

1. **克隆项目**
```bash
git clone https://github.com/PYUDNG/pixiv-novel-to-epub.git
cd pixiv-novel-to-epub
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **构建用户脚本**
```bash
npm run build
```

5. **如无需代码压缩和美化，可以使用以下命令构建**
```bash
npm run build:deps && npm run build:raw
```

6. **自动化AI翻译README**
- 创建`scripts/readme-builder/openai.config.ts`（可参考同目录的`openai.config.d.ts`和`openai.congig.ts.template`），填写自己的AI API配置
- 修改`README.src.md`，使用你熟悉的语言编写README，并支持使用 `<!-- condition:xxx -->` 语法进行条件渲染，具` 语法进行条件渲染，具体格式可以参照项目内已有的`README.src.md`
- 运行以下代码自动化翻译和渲染所有语言和平台的README
```bash
npm run build:readme
```
#### 安装用户脚本

构建完成后，会在项目 `/dist/` 目录生成 `.user.js` 文件，可以通过以下步骤安装：
- 打开任一构建产物，复制其中全部代码内容
- 安装 Tampermonkey 或 Violentmonkey 浏览器扩展
- 在扩展管理器中点击"添加新脚本"
- 粘贴构建生成的用户脚本内容

## 📁 项目结构

```
pixiv-novel-to-epub/
├── src/
│   ├── components/         # UI 组件
│   │   ├── download-button.vue   # 下载按钮
│   │   └── content-renderer.vue  # 内容渲染组件
│   ├── i18n/               # 国际化（中/英）
│   ├── modules/            # 功能模块
│   │   ├── api/            # Pixiv API 请求层（含缓存与队列）
│   │   ├── novel/          # 单本小说下载页面模块
│   │   ├── series/         # 系列下载页面模块
│   │   ├── custom/         # 自定义合集下载模块
│   │   └── downloader/     # 下载引擎（EPUB 生成、进度管理）
│   ├── utils/              # 工具函数
│   │   └── helpers/        # DOM 操作、网络请求、UI 状态等
│   ├── main.ts             # 应用入口
│   └── loader.ts           # 模块加载器
├── scripts/                # 构建脚本
│   ├── readme-builder/     # README 多语言构建工具
│   ├── post-compress.js    # 后压缩处理脚本
│   └── userscript-meta.js  # Userscript 元数据解析工具
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite + vite-plugin-monkey
- **样式方案**: TailwindCSS v4
- **EPUB 生成**: jEpub
- **国际化**: vue-i18n
- **图标**: Material Symbols（通过 unplugin-icons）
- **工具库**: mitt, uuid, dedent

## 📦 构建与部署

### 开发测试
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

生产构建的产物将在 `/dist/` 中创建

## 🤝 贡献指南

您可以通过提交 Issue 和 Pull Request 参与到本项目中

### 提交 Issue
- 描述清晰的问题或功能需求
- 提供复现步骤
- 包含相关截图或日志

### 提交 Pull Request
1. Fork 项目仓库
2. 创建功能分支
3. 提交代码变更
4. 编写清晰的提交信息
5. 创建 Pull Request

### PR 规范
#### 代码规范
本项目没有硬性的代码规范要求，但是请您确保您的代码至少能做到：
- 保留有合适的注释
- 通过 TypeScript 类型检查

#### Commit 规范
每条 commit 中可以包含多个更新内容，每个更新内容应当写成一条列表项
每条更新内容应当在列表项开头处标明更新类型，并用英文冒号+空格（`: `）隔开：
| 更新类型       | 描述                                                 |
| :------------- | :--------------------------------------------------- |
| `feat`         | 新功能添加                                           |
| `improvement`  | 已有功能改进                                         |
| `code`         | 功能无变化，仅代码（包含注释）修改（代码优化等）     |
| `performance`  | 功能无变化，仅性能改进                               |
| `bug fix`      | 修复 bug                                             |
| `i18n`         | 代码无变化，仅更新语言包                             |
| `maintenance`  | 代码无变化的其他更新，如：TODO 列表更新，依赖更新等等 |
| `refactor`     | 功能无变化，代码整体重写（重构）                     |

如果一条更新对应多个类型，以其最主要的类型书写
commit 消息应当用英文（或者简体中文）书写

commit 消息示例：
```
- feat: support custom novel ID input
- improvement: debounce download button click
- bug fix: download button no response after multiple clicks
- maintenance: updated README
```

以上 commit 消息仅作示例。实际 commit 中，对于如此多的更新内容，应当尽量分多次 commit 提交

## 📄 许可证

本项目采用 [GPL-3.0](https://spdx.org/licenses/GPL-3.0-or-later.html) 许可证。

## 🎯 使用方法

### 📖 下载单篇小说
1. 打开任意 Pixiv 小说页面（`pixiv.net/novel/show.php?id=xxx`）
2. 在作者信息栏旁边会看到 **下载按钮**
3. 点击按钮，脚本将自动获取小说内容并生成 EPUB 文件

### 📚 下载系列合集
1. 打开 Pixiv 小说系列页面（`pixiv.net/novel/series/xxx`）
2. 在页面顶部信息栏会看到 **下载按钮**
3. 点击按钮，脚本将获取系列内所有小说，合并为一本 EPUB

### ✂️ 自定义合集下载
1. 在任意 Pixiv 页面，点击 Tampermonkey 菜单中的脚本名称
2. 选择 **自定义下载**
3. 在弹出的对话框中输入小说 ID（每行一个，或以逗号分隔）
4. 为合并文件指定一个名称，开始下载

> **提示：** 你可以在对话框中粘贴 Pixiv 小说链接，脚本会自动提取其中的 ID。

## 🙏 致谢

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - 用于构建用户脚本的 Vite 插件
- [jEpub](https://github.com/lelinhtinh/jepub) - EPUB 文件生成库
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [TailwindCSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Tampermonkey](https://www.tampermonkey.net/) - 流行的用户脚本管理器
- [Violentmonkey](https://violentmonkey.github.io/) - 开源的用户脚本管理器

---

**注意**: 本项目仅供学习和研究使用，请遵守 Pixiv 的相关使用条款和版权规定。
