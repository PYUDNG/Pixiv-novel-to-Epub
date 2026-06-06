<script setup lang="ts">
import { inject, reactive, ref } from 'vue';
import { OVERLAY_CONTAINER_KEY, OVERLAY_SHADOWHOST_KEY, TRANSITION_DURATION_KEY } from '../../shadowapp';
import { Progress, Task } from './types';
import TaskItem from './task-item.vue';

// #region props
const {
    initialTasks = [],
    seamless = false,
    zIndex = 1000,
} = defineProps<{
    /**
     * 初始任务列表  
     * 后续更改请使用`add`/`progress`等方法，不要修改此prop  
     * 对于已经通过此prop传入的任务对象，后续请不要直接修改，如需修改依旧请使用`add`/`progress`等方法
     * @default []
     */
    initialTasks?: Task[];

    /**
     * 沉浸模式，不使用背景遮罩层
     * @default false
     */
    seamless?: boolean;

    /**
     * 弹窗的基础z-index值  
     * 因内部DOM结构需要有一定上下层级关系，内部DOM元素可能会上下波动+-10
     * @default 1000
     */
    zIndex?: number;
}>();
// #endregion

// #region UI杂项数据
/**
 * 销毁状态  
 * 仅用于销毁时现切换透明度以播放淡出过渡动画
 */
const desctroyed = ref<boolean>(false);
// #endregion

// #region 任务列表数据
/**
 * 任务ID生成器
 */
const nextTaskID = ((id: number) => () => id++) (1);

/**
 * 任务列表
 */
const tasks = ref<Task[]>([]);

/**
 * 任务 - ID 对应表
 */
const taskIdMap = reactive(new Map<number, Task>());

// 载入初始任务列表
initialTasks.forEach(t => add(t));
// #endregion

// #region inject环境变量
/**
 * ShadowDOM挂载元素
 */
const host = inject(OVERLAY_SHADOWHOST_KEY)!;

/**
 * Vue App挂载元素
 */
const container = inject(OVERLAY_CONTAINER_KEY)!;

/**
 * 过渡动画时长
 */
const TRANSITION_DURATION = inject(TRANSITION_DURATION_KEY)!;
// #endregion

// #region expose
defineExpose({ add, progress, complete, remove, clear, destroy });
// #endregion

// #region 任务/进度控制方法
/**
 * 添加任务  
 * 注意：添加任务后，不要对传入的task对象作任何修改，如需修改任务数据请使用`progress`等方法
 * @param task 任务
 */
function add(task: Task) {
    const id = nextTaskID();
    tasks.value.push(task);
    taskIdMap.set(id, task);
    return id;
}

/**
 * 将任务完成数量+1
 * @param id 任务ID
 */
function progress(id: number): void
/**
 * 更新任务进度
 * @param id 任务ID
 * @param finished 新的任务完成数量
 */
function progress(id: number, finished: number): void
/**
 * 更新任务进度
 * @param id 任务ID
 * @param progress 新的任务进度
 */
function progress(id: number, progress: Progress): void
function progress(id: number, progressOrFinished?: Progress | number): void {
    if (!taskIdMap.has(id)) throw new Error(`task id ${ id } not found`);
    const task = taskIdMap.get(id)!;
    
    // 根据参数对进度进行更新
    switch (typeof progressOrFinished) {
        case 'undefined': {
            task.progress.finished++;
            break;
        }
        case 'number': {
            task.progress.finished = progressOrFinished;
            break;
        }
        case 'object': {
            Object.assign(task.progress, progressOrFinished);
        }
    }
}

/**
 * 完成任务
 * @param id 
 */
function complete(id: number): void {
    if (!taskIdMap.has(id)) throw new Error(`task id ${ id } not found`);
    const task = taskIdMap.get(id)!;
    task.progress.complete = true;
}

/**
 * 移除任务
 * @param id 任务ID
 */
function remove(id: number): void {
    if (!taskIdMap.has(id)) throw new Error(`task id ${ id } not found`);
    const task = taskIdMap.get(id)!;
    const index = tasks.value.indexOf(task);
    tasks.value.splice(index, 1);
    taskIdMap.delete(id);
}

/**
 * 移除所有任务
 */
function clear(): void {
    tasks.value = [];
    taskIdMap.clear();
}
// #endregion

// #region 生命周期控制方法
/**
 * 销毁弹窗
 */
function destroy(delay: number = 0) {
    const doDestroy = () => {
        // 首先隐藏UI播放淡出动画
        desctroyed.value = true;
        // 待淡出动画完毕后移除DOM元素
        setTimeout(() => host.remove(), TRANSITION_DURATION);
    }
    delay > 0 ? setTimeout(doDestroy, delay) : doDestroy();
}
// #endregion
</script>

<template>
    <Teleport :to="container">
        <!-- 主窗口 -->
        <div
            v-bind="$attrs"
            class="
                fixed left-10 bottom-10
                w-fit h-fit max-w-[75vw] max-h-[75vh]
                shadow-sm
                overflow-y-auto overflow-x-hidden
                flex flex-col-reverse
                p-px gap-px bg-surface-300 dark:bg-surface-700
                text-surface-800 dark:text-surface-200
                transition-opacity
            "
            :style="{
                zIndex: zIndex + 1,
                transitionDuration: `${ TRANSITION_DURATION }ms`,
                opacity: desctroyed ? '0' : '100',
            }"
        >
            <TaskItem v-for="task of tasks" :task="task" />
        </div>

        <!-- 背景遮罩 -->
        <div
            v-if="!seamless"
            class="
                fixed left-0 top-0 w-screen h-screen
                bg-[color-mix(in_srgb,black_40%,transparent)]
                transition-opacity
            "
            :style="{
                zIndex: zIndex,
                opacity: desctroyed ? '0' : '100',
            }"
        ></div>
    </Teleport>
</template>