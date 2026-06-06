import type { Component } from "vue";

export interface Progress {
    /**
     * 任务总量  
     */
    total: number;

    /**
     * 任务已完成量
     */
    finished: number;

    /**
     * 任务是否已完成  
     * 注意这个属性是独立于`total`/`finished`的，并非一定要是由这两个属性计算出来，可以和它们不一致
     */
    complete: boolean;

    /**
     * 任务是否出错终止  
     * 此属性和complete不能同时为true
     */
    error: boolean;
}

/**
 * Progress UI 任务
 */
export interface Task {
    /**
     * 显示名称
     */
    name: string;

    /**
     * 任务图标
     */
    icon: Component;

    /**
     * 任务进度
     */
    progress: Progress;
}