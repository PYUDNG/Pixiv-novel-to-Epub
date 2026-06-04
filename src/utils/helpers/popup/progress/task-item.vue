<!-- progress 任务条目渲染 -->

<script setup lang="ts">
import { computed, inject } from 'vue';
import { Task } from './types';
import MaterialSymbolsProgressActivity from '~icons/material-symbols/progress-activity';
import MaterialSymbolsCheck from '~icons/material-symbols/check';
import { TRANSITION_DURATION_KEY } from '../../shadowapp';

const { task } = defineProps<{
    task: Task;
}>();

/**
 * 过渡动画时长
 */
const TRANSITION_DURATION = inject(TRANSITION_DURATION_KEY)!;

/**
 * 进度百分比，向下取整
 */
const percent = computed(() => Math.floor(task.progress.finished / task.progress.total * 100));
</script>

<template>
    <div
        class="
            flex flex-col
            bg-surface-100 dark:bg-surface-900
        "
    >
        <!-- 上方主要内容 -->
        <div
            class="
                flex flex-row items-center gap-2
                p-3
            "
        >
            <!-- 左侧任务图标 -->
            <component :is="task.icon" />

            <!-- 中间任务名称 -->
            <div
                class="grow shrink truncate"
            >{{ task.name }}</div>

            <!-- 右侧完成状态图标 -->
            <MaterialSymbolsCheck v-if="task.progress.complete" class="text-green-600 dark:text-green-600" />
            <MaterialSymbolsProgressActivity v-else class="animate-spin" />
        </div>

        <!-- 底部进度条 -->
        <!-- 外层进度槽 -->
        <div
            class="
                w-full h-0.5
                flex justify-start items-stretch
            "
        >
            <!-- 内层进度条 -->
            <!-- 未完成是显示为绿色，完成后隐藏起来显示为透明 -->
            <div
                class="
                    transition-[width,background-color] duration-200 ease-in-out
                "
                :class="{
                    'bg-green-600 dark:bg-green-600': !task.progress.complete,
                    'bg-transparent': task.progress.complete,
                }"
                :style="{
                    width: `${ percent }%`,
                    transitionDuration: `${ TRANSITION_DURATION }ms`,
                }"
            ></div>
        </div>
    </div>
</template>