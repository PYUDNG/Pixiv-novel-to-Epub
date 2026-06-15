<!-- 小说预览项目 -->
<script setup lang="ts">
import { Severity } from '@/components/types';
import { Nullable } from '@/utils';
import type { Component } from 'vue';
import MaterialSymbolsDeleteOutline from '~icons/material-symbols/delete-outline';
import MaterialSymbolsKeyboardArrowUp from '~icons/material-symbols/keyboard-arrow-up';
import MaterialSymbolsKeyboardArrowDown from '~icons/material-symbols/keyboard-arrow-down';

// #region props
const { id } = defineProps<{
    /**
     * 小说ID
     */
    id: string;

    /**
     * 序号
     */
    num: number;
    
    /**
     * 封面图url
     */
    cover: string;

    /**
     * 标题
     */
    title: string;

    /**
     * 描述
     */
    desc: string;

    /**
     * 小说url
     */
    url: string;

    /**
     * 作者信息
     */
    author: {
        /**
         * 名称
         */
        name: string;

        /**
         * 主页url
         */
        url: string;

        /**
         * 头像
         */
        avatar: Nullable<string>;
    };
}>();
// #endregion

// #region emits
const emit = defineEmits<{
    /** 移除 */
    remove: [id: string];
    /** 前移 */
    forward: [id: string];
    /** 后移 */
    backward: [id: string];
}>();
// #endregion

// #region 操作按钮
interface Button {
    icon: Component;
    severity: Severity;
    callback: (this: HTMLElement, e: PointerEvent) => void;
}
const buttons: Button[] = [{
    icon: MaterialSymbolsKeyboardArrowUp,
    severity: 'normal',
    callback: () => emit('forward', id),
}, {
    icon: MaterialSymbolsDeleteOutline,
    severity: 'primary',
    callback: () => emit('remove', id),
}, {
    icon: MaterialSymbolsKeyboardArrowDown,
    severity: 'normal',
    callback: () => emit('backward', id),
}];
// #endregion
</script>

<template>
    <div
        class="
            relative
            flex flex-row gap-px items-stretch
            bg-surface-300 dark:bg-surface-700
        "
    >
        <!-- 左侧序号 -->
        <div
            class="
                flex justify-center items-center
                bg-surface-100 dark:bg-surface-900
                p-1
            "
        >
            {{ num }}
        </div>

        <!-- 中间内容 -->
        <div
            class="
                grow shrink
                flex flex-row gap-5 items-stretch
                bg-surface-100 dark:bg-surface-900
                px-3 py-2
            "
        >
            <!-- 左侧封面图 -->
            <div
                class="
                    flex-1
                    flex justify-center items-center
                "
            >
                <img
                    class="max-w-full max-h-full"
                    :src="cover"
                >
            </div>
            
            <!-- 右侧小说信息 -->
            <div
                class="
                    flex-3 overflow-hidden
                    flex flex-col items-stretch gap-2
                "
            >
                <!-- 小说标题 -->
                <div class="text-md font-bold">
                    <a :href="url" target="_blank">{{ title }}</a>
                </div>

                <!-- 小说作者 -->
                <div
                    class="
                        flex flex-row gap-2 items-center
                        text-sm
                    "
                >
                    <a v-if="author.avatar !== null" :href="author.url" target="_blank">
                        <img
                            :src="author.avatar"
                            class="rounded-full w-6 h-6"
                        >
                    </a>
                    <a :href="author.url" target="_blank">{{ author.name }}</a>
                </div>

                <!-- 小说描述 -->
                <div
                    class="
                        whitespace-pre-wrap text-sm
                        grow shrink h-max
                        overflow-y-auto
                    "
                    :title="desc"
                    v-html="desc"
                ></div>
            </div>
        </div>

        <!-- 右侧操作按钮 -->
        <div
            class="
                flex flex-col justify-evenly items-center
                bg-surface-100 dark:bg-surface-900
                p-1
            "
        >
            <div
                v-for="button of buttons"
                class="
                    flex justify-center items-center
                    text-lg
                    cursor-pointer
                "
                :class="[`text-severity-${ button.severity }`]"
                @click="button.callback"
            >
                <component :is="button.icon" />
            </div>
        </div>
    </div>
</template>