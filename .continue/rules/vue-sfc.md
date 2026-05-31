---
description: Vue SFC 格式要求
globs: "**/*.vue"
---

遵照此示例：
``` vue
<!-- 一行简短的对该文件的描述 -->

<script setup lang="ts">
// script 块内部无需初始缩进，直接写代码即可
// imports... 记住import行末尾也必须有分号;
// 导入时，将类型导入和值导入分开写：从同一个来源中既导入类型又导入值时，份两行写：
import type { Component } from 'vue';
import { watch, computed } from 'vue';

// 类型定义

// props
// 可以使用解构赋值替换props以获取单独的传入属性，高版本Vue中这些解构赋值的变量也会自动是响应式的
// 没有属性需要默认值时，可以省略withDefaults嵌套
const props = withDefaults(defineProps<{
    /**
     * 对属性的描述：这是什么属性，用来干什么，有什么仅ts类型约束无法表达的特殊格式/类型要求  
     * 如需换行，记得在上一行结尾处添加两个空格  
     * 就像这样  
     * 最后一行结尾处没有空格
     * @default '这里写默认值（如果有）'
     */
    ...;
}>(), {
    // 这里写实际的默认值
    ...;
});

// model
// 如果有组件模型值，在这里定义，变量命名可以自行决定，但最好能看出来这是当前组件的模型值
// 如果不需要默认值，可以把默认值参数去掉
const model = defineModel<...>({ default: '默认值写在这里' });

// 组件逻辑，比较复杂时分多个region写（参考下方VSCode #region注释格式），更复杂时拆分到多个vue组件中（除非用户明确要求写到一个组件内，不确定是否拆分时向用户询问）
// #region 逻辑部分名称
// ... 逻辑实现 ...
// #endregion

// #region 逻辑部分名称
// ... 逻辑实现 ...
// #endregion

// ... 更多逻辑region

// expose
// 在最后写对外暴露内容
defineExpose({ ... });
</script>

<!-- 绝大多数情况是不需要写style块的，因为我们使用了TailwindCSS；实在需要写样式时，放在这里写，绝大多数情况也都是scoped样式，如果需要写非scoped样式，先询问用户、说明情况 -->
<style lang="css" scoped></style>

<template>
    <!-- 绝大多数情况都要保证一个组件内部有唯一顶级元素，如果没有，就用<div>包裹；不能做到时（比如：需要应用或透传特定样式等情况），先询问用户、说明情况 -->
    <div class="flex flex-row">
        <!-- 每一部分UI，都用一行简短的注释标明这是什么部分，不同部分之间用空行分隔，比如： -->
        <!-- 左侧图标 -->
        <v-icon></v-icon>

        <!-- 中间文字 -->
        <div>
            <slot>
                <span>{{ label }}</span>
            </slot>
        </div>

        <!-- 右侧操作按钮 -->
        <div>
            <!-- 可以看到，嵌套的层级中，也可以分小部分注释并实现 -->
            <!-- 前置按钮 -->
            <v-btn v-for="btn of leftButtons"></v-btn>
            
            <!-- v-for 我更喜欢用 of 关键字而不是 in 关键字 -->
            <!-- 后置按钮 -->
            <v-btn v-for="btn of rightButtons"></v-btn>
        </div>
    </div>
</template>
```