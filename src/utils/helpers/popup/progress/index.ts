import { Task } from "./types";
import { isSystemDark } from "../../ui-utils.ts";
import { computed, isRef, watch } from "vue";
import type { Component, Ref } from 'vue';
import App from "./app.vue";
import { createShadowApp } from "../../shadowapp.ts";

export interface ProgressOptions {
    /**
     * 深色模式
     * @default 'auto'
     */
    dark?: Ref<boolean> | boolean | 'auto';
    
    /**
     * 沉浸模式，不展示背景遮罩层
     * @default false
     */
    seamless?: boolean;
}
const DEFAULT_OPTIONS: Required<ProgressOptions> = {
    dark: 'auto',
    seamless: false,
};

/**
 * 创建窗口左下角进度弹窗
 * @param tasks 初始任务列表，后续请勿修改此列表或其中任务对象，如需更新任务列表或进度请使用返回值中的相应方法
 * @param options 选项
 * @returns 
 */
export async function progress(tasks: Task[], options: ProgressOptions = {}) {
    // 参数处理
    const fullOptions = Object.assign(DEFAULT_OPTIONS, options);
    const isDark = computed(() => fullOptions.dark === 'auto' ?
        isSystemDark.value :
        isRef(fullOptions.dark) ? fullOptions.dark.value : fullOptions.dark
    );
    watch(isDark, dark => dark ? container.classList.add('dark') : container.classList.remove('dark'));

    // 挂载窗口
    const { container, root } = await createShadowApp(App, {
        options: {
            app: {
                classes: isDark.value ? ['dark'] : [],
            },
        },
        props: {
            initialTasks: tasks,
            seamless: fullOptions.seamless,
        },
    });

    return root;
}

export function newTask(name: string, icon: Component, total: number): Task {
    return {
        name, icon,
        progress: {
            total,
            finished: 0,
            complete: false,
            error: false,
        },
    };
}