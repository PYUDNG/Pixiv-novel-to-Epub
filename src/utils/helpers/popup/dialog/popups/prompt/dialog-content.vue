<!-- 创建prompt dialog的content组件 -->

<script setup lang="ts">
import type { DisplayContent } from '@/utils/types';
import ContentRenderer from '../../components/content-renderer.vue';
import { inject } from 'vue';
import { userInputKey } from './utils.ts';

const props = withDefaults(defineProps<{
    /**
     * 显示内容
     */
    content?: string | DisplayContent;

    /**
     * 初始输入值
     */
    value?: string;
}>(), {
    content: '',
    value: '',
});

const userInput = inject(userInputKey)!;
</script>

<template>
    <div
        class="
            w-full h-full flex flex-col gap-3
        "
    >
        <!-- 显示内容 -->
        <ContentRenderer :content="content" />

        <!-- 输入框 -->
        <textarea
            class="
                w-full
                text-surface-800 dark:text-surface-200
                bg-surface-100 dark:bg-surface-800
                border border-solid border-surface-300 dark:border-surface-700
                focus-visible:outline-none focus-visible:border-primary-400
                p-2
            "
            v-model="userInput"
        ></textarea>
    </div>
</template>