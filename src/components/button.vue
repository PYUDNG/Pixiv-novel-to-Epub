<!-- 按钮组件 -->
<script setup lang="ts">
import { globalLogger, PromiseOrRaw, SingleOrArray } from '@/utils';
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
    severity?: Severity;

    /**
     * 是否禁用
     * @default false
     */
    disabled?: boolean;

    /**
     * 按钮回调  
     * 接受单个回调函数或数组  
     * 以数组传入时，按照顺序执行回调（异步则`await`），返回值若为`false`，不再继续执行后续回调
     */
    callback?: SingleOrArray<(this: HTMLElement, e: PointerEvent) => PromiseOrRaw<any>>;
}

const logger = globalLogger.withPath('components', 'button');

const {
    label = '',
    severity = 'normal',
    callback = [],
} = defineProps<ButtonProps>();

async function onClick(this: HTMLElement, e: PointerEvent) {
    const funcs = Array.isArray(callback) ? callback : [callback];
    for (const cb of funcs) {
        try {
            const ret = await cb.call(this, e);
            if (ret === false) break;
        } catch(err) {
            logger.simple('Error', 'button onclick error');
            logger.asLevel('Error', err);
        }
    }
}
</script>

<template>
    <div
        class="
            px-5 py-1 relative
            border-surface-300 dark:border-surface-700
            cursor-pointer
        "
        :class="[
            `bg-severity-${ severity }`,
            disabled ? 'pointer-events-none' : '',
        ]"
        @click="onClick"
    >
        <!-- label -->
        <slot>{{ label }}</slot>

        <!-- label -->
        <div
            v-if="disabled"
            class="
                absolute left-0 top-0 w-full h-full z-1
                bg-transparent
                backdrop-brightness-70 cursor-not-allowed
                pointer-events-auto
            "
            @click.stop
        ></div>
    </div>
</template>