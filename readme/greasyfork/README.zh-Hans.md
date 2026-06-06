# Pixiv小说Epub合成器 / Pixiv Novel to Epub

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
