<!-- 按钮组件 -->
<script setup lang="ts">
import type { Severity } from './types';

export interface ButtonProps {
    /**
     * 按钮文字
     * @default ''
     */
    label?: string;

    /**
     * 按钮级别
     * @default 'normal'
     */
    serverity?: Severity;

    /**
     * 按钮回调
     */
    callback?(this: HTMLElement, e: PointerEvent): void;
}

const props = withDefaults(defineProps<ButtonProps>(), {
    label: '',
    serverity: 'normal',
    callback() {},
});
</script>

<template>
    <div
        class="
            px-5 py-1
            border-surface-300 dark:border-surface-700
            cursor-pointer
        "
        :class="[
            `serverity-${ serverity }`
        ]"
        @click="callback"
    >
        <slot>{{ label }}</slot>
    </div>
</template>