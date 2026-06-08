<!-- 下载按钮 -->

<!-- 添加一个没什么用的泛型T是为了让ComponentProps<DownloadButton>的props非readonly -->
<script setup lang="ts" generic="T">
import MaterialSymbolsDownload from '~icons/material-symbols/download';
import MaterialSymbolsProgressActivity from '~icons/material-symbols/progress-activity';
import MaterialSymbolsCheck from '~icons/material-symbols/check';

const props = defineProps<{
    /**
     * 按钮文字
     */
    label: string;

    /**
     * 按钮点击回调
     */
    callback?(this: HTMLElement, e: PointerEvent): void;

    /**
     * 按钮状态
     * - `'regular'`: 常规状态，展示一个下载图标
     * - `'loading'`: 加载中，展示一个spinner
     * - `'finished'`: 已完成，展示一个对勾
     */
    status?: 'regular' | 'loading' | 'finished';
}>()
</script>

<template>
    <div class="pr-[20px] leading-[32px] font-[700]">
        <div
            class="
                cursor-pointer
                flex flex-row items-center gap-1
                text-black dark:text-white
            "
            @click="callback"
        >
            <MaterialSymbolsDownload v-if="status === 'regular'" />
            <MaterialSymbolsProgressActivity v-else-if="status === 'loading'" class="animate-spin" />
            <MaterialSymbolsCheck v-else-if="status === 'finished'" />
            <div>{{ label }}</div>
        </div>
    </div>
</template>
