---
globs: src/**/*.{ts,vue}
description: 文件命名约定、导入路径规则、代码区组织方式
alwaysApply: true
---

## 文件命名
- 普通工具/逻辑文件：kebab-case（`dom-utils.ts`、`network-utils.ts`、`item-renderer.vue`）
- Composables：`useXxxYyy.ts` 的 camelCase 格式
- 类型定义文件：短名（`item.ts`、`module.ts`、`common.ts`）

## 导入规范
- 导入路径**不加 `.js` 扩展名**（Vite/TypeScript 自动解析）
- 跨目录使用 `@/` 别名路径，模块内部文件间用相对路径
- **模块目录的统一导出文件必须用 `index.ts`**，不可用 `main.ts` 或其他名字
- **外部导入模块**时，直接写目录路径，不写 `index`：`import { xxx } from 'path/to/module'`
- **模块内部文件**互相导入时，直接从同级别实现文件导入，**不从本模块的 `index.ts` 中导入**
- 从同一来源既导入类型又导入值时，分两行写：
```ts
import type { Component, Ref } from 'vue';
import { ref, watch, computed } from 'vue';
```

## 代码组织
- 复杂逻辑用 VSCode `// #region 名称` / `// #endregion` 组织
- 不同逻辑区域之间用空行分隔
- defineExpose 写在最后

## UI开发
- Vue SFC规范遵循另外说明的 `Vue SFC 格式要求`
- 开发UI时，尽可能地多用Vuetify组件，而不是自行实现，可查询Vuetify MCP以获取相关文档和帮助
- 所有Vue挂载，均应走 [ui-utils.ts] (src/utils/helpers/ui-utils.ts)（从 `src/utils` 中导入）中的`createShadowApp`函数
