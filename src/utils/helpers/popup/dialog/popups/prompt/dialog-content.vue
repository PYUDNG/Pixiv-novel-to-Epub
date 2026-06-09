<!-- 创建prompt dialog的content组件 -->

<script setup lang="ts">
import type { DisplayContent } from '@/utils/types';
import ContentRenderer from '@/components/content-renderer.vue';
import { ref } from 'vue';

const {
    content = '',
    value = '',
    aspectRatio = '7/3',
} = defineProps<{
    /**
     * 显示内容
     */
    content?: string | DisplayContent;

    /**
     * 初始输入值
     */
    value?: string;

    /**
     * 输入框宽高比  
     * 因为宽度依对话框可用宽度而定，因此此项调整的就是高度
     * @default '7/3'
     */
    aspectRatio?: string;
}>();

const userInput = ref(value);

defineExpose({ value: userInput });
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
                w-full min-h-8
                text-surface-800 dark:text-surface-200
                bg-surface-100 dark:bg-surface-800
                border border-solid border-surface-300 dark:border-surface-700
                focus-visible:outline-none focus-visible:border-primary-400
                p-2
            "
            :style="{
                aspectRatio: aspectRatio,
            }"
            v-model="userInput"
        ></textarea>
    </div>
</template>