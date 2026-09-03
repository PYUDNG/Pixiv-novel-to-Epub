<!-- 按钮组件 -->
<script setup lang="ts">
import { alert, globalLogger, Nullable, PromiseOrRaw, SingleOrArray } from '@/utils';
import type { Severity } from './types';
import { computed } from 'vue';
import type { Component } from 'vue';
import MaterialSymbolsProgressActivity from '~icons/material-symbols/progress-activity';

export interface ButtonProps {
    /**
     * 按钮文字
     * @default null
     */
    label?: Nullable<string>;

    /**
     * 按钮图标
     * @default null
     */
    icon?: Nullable<Component>;

    /**
     * 按钮级别
     * @default 'normal'
     */
    severity?: Severity;

    /**
     * 按钮视觉风格
     * @default 'filled'
     */
    type?: 'filled' | 'outline' | 'text';

    /**
     * 按钮内边距类名  
     * 注意由于此属性值实际上会被作为类名添加到元素，理论上可以添加任意类名，但是**请不要这么做**  
     * 遵守单一职责原则是写代码的最佳实践，如需添加自定义类名，请用vue原生支持的class透传
     * @default 'px-5 py-1'
     */
    padding?: string;

    /**
     * 加载中状态
     * @default false
     */
    loading?: boolean;

    /**
     * 是否禁用
     * @default false
     */
    disabled?: boolean | string;

    /**
     * 按钮回调  
     * 接受单个回调函数或数组  
     * 以数组传入时，按照顺序执行回调（异步则`await`），返回值若为`false`，不再继续执行后续回调  
     * 注：按钮组件本身也支持常规的`click`事件，此属性仅用于中间件式处理链式回调，如需简单事件回调推荐使用`@click`
     */
    callback?: SingleOrArray<(this: HTMLElement, e: PointerEvent) => PromiseOrRaw<any>>;
}

const logger = globalLogger.withPath('components', 'button');

const {
    label = null,
    icon = null,
    severity = 'normal',
    type = 'filled',
    padding = 'px-5 py-1',
    loading = false,
    disabled = false,
    callback = [],
} = defineProps<ButtonProps>();

const emit = defineEmits<{
    /** 通常的按钮按下事件 */
    click: [e: PointerEvent];
}>();

const stylingClass = computed<string>(() => {
    let border: string, background: string, text: string;
    switch (type) {
        case 'filled': {
            border = 'border-none';
            background = `bg-severity-${ severity }`;
            text = 'text-surface-800 dark:text-surface-200';
            break;
        }
        case 'outline': {
            border = 'border border-solid border-surface-300 dark:border-surface-700';
            background = `bg-transparent`;
            text = `text-severity-${ severity }`;
            break;
        }
        case 'text': {
            border = 'border-none';
            background = `bg-transparent`;
            text = `text-severity-${ severity }`;
            break;
        }
    }
    return [border, background, text].join(' ');
});

async function onClick(this: HTMLElement, e: PointerEvent) {
    // 常规click事件冒泡
    emit('click', e);

    // callback链式回调
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
            flex justify-center items-center
            relative
            cursor-pointer select-none
        "
        :class="[
            stylingClass,
            (disabled || typeof disabled === 'string') ? 'pointer-events-none' : '',
            padding,
        ]"
        @click="onClick"
    >
        <!-- label -->
        <slot>
            <template v-if="label !== null">
                {{ label }}
            </template>
        </slot>

        <!-- loading图标 -->
        <MaterialSymbolsProgressActivity v-if="loading" class="animate-spin" />

        <!-- 图标 -->
        <component v-else-if="icon !== null" :is="icon" />

        <!-- disabled遮罩 -->
        <div
            v-if="(disabled || typeof disabled === 'string')"
            class="
                absolute left-0 top-0 w-full h-full z-1
                bg-transparent
                cursor-not-allowed
                pointer-events-auto
            "
            :class="{
                'backdrop-brightness-70': ['filled', 'outline'].includes(type)
            }"
            @click.stop="typeof disabled === 'string' && alert(disabled)"
        ></div>
    </div>
</template>