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
            flex flex-row items-center
            rounded-full px-0.5
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
                bg-surface-300 dark:bg-surface-700 hover:bg-surface-400 hover:dark:bg-surface-600
            "
            @click="$emit('remove')"
        >
            <MaterialSymbolsCloseRounded />
        </div>
    </div>
</template>