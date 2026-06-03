<!-- 下载按钮 -->

<script setup lang="ts">
import MaterialSymbolsDownload from '~icons/material-symbols/download';

const props = defineProps<{
    /**
     * 按钮文字
     */
    label: string;

    /**
     * 按钮点击回调
     */
    callback?(this: HTMLElement, e: PointerEvent): void;
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
            <MaterialSymbolsDownload />
            <div>{{ label }}</div>
        </div>
    </div>
</template>
