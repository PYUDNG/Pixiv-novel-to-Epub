<!-- 带边框和边框上文字label的区域元素 -->

<script setup lang="ts">
const {} = defineProps<{
    /**
     * 标签文字
     */
    label: string;
    /**
     * 边框及标签文字颜色
     */
    color: string;
    /**
     * 内部背景颜色
     */
    bgColor: string;
}>();
</script>

<template>
    <div
        class="
            relative
            p-5 pt-12
        "
        :style="{
            backgroundColor: bgColor,
        }"
    >
        <!-- 用户内容slot -->
        <slot />

        <!-- 边框区域 -->
        <div
            class="
                absolute top-0 left-0 w-full h-full
                pointer-events-none
            "
        >
            <!-- 边框 -->
            <div
                class="
                    absolute left-0 top-5 z-1 w-full h-[calc(100%-5*var(--spacing))]
                    border border-solid
                "
                :style="{
                    borderColor: color,
                }"
            ></div>

            <!-- 文字标签 -->
            <div
                class="
                    absolute top-0 left-5 z-2
                    w-fit h-10 px-3
                    flex flex-row justify-center items-center
                "
                :style="{
                    color: color,
                    backgroundColor: bgColor,
                }"
            >{{ label }}</div>
        </div>
    </div>
</template>