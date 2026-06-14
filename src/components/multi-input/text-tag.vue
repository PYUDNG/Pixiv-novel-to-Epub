<!-- 表示一个已输入字符串的组件 -->

<script setup lang="ts">
import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';

// #region props
const props = defineProps<{
    text: string;
}>();
// #endregion

// #region emits
defineEmits<{
    remove: [],
}>();
// #endregion
</script>

<template>
    <div
        class="
            flex flex-row items-center gap-0.5
            rounded-full pr-0.75 pl-1.5
            bg-surface-100 dark:bg-surface-900
        "
    >
        <!-- 左侧文字内容 -->
        <div>{{ text }}</div>

        <!-- 右侧删除按钮 -->
        <div
            class="
                flex justify-center items-center
                rounded-full aspect-square
                text-surface-900 bg-surface-400 dark:bg-surface-600 hover:bg-surface-500 active:bg-surface-500 hover:dark:bg-surface-500 active:dark:bg-surface-500
                text-sm p-0.25
                cursor-pointer
            "
            @click="$emit('remove')"
        >
            <MaterialSymbolsCloseRounded />
        </div>
    </div>
</template>