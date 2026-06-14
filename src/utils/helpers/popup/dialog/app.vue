<script setup lang="ts" generic="C extends Component">
import type { Component } from 'vue';
import { inject, ref, useTemplateRef } from 'vue';
import type { Nullable, VueContent } from '../../../types';
import { OVERLAY_CONTAINER_KEY, OVERLAY_SHADOWHOST_KEY } from '../../shadowapp';
import type { ButtonProps } from '@/components/button.vue';
import Button from '@/components/button.vue';
import { addEventListener } from '@/hooks';
import MaterialSymbolsClose from '~icons/material-symbols/close';
import { ComponentExposed } from 'vue-component-type-helpers';

export interface Button extends ButtonProps {
    /**
     * 点击按钮后是否自动销毁弹窗
     * @default true
     */
    destroy?: boolean;
}


// #region Props
const {
    header = '',
    content,
    seamless = false,
    backdropDismiss = true,
    width = 130,
    height = 'fit-content',
    zIndex = 1000,
    buttons = [],
} = defineProps<{
    /**
     * 标题
     * @default ''
     */
    header?: string;

    /**
     * 内容
     * @default ''
     */
    content: VueContent<C>;

    /**
     * 沉浸模式，不展示背景遮罩层
     * @default false
     */
    seamless?: boolean;

    /**
     * 点击背景遮罩层时，是否自动关闭并销毁弹窗
     * @default true
     */
    backdropDismiss?: boolean;

    /**
     * 对话框宽度  
     * CSS字符串值，或者number*var(--spacing)
     * @default 120
     */
    width?: string | number;

    /**
     * 对话框高度  
     * CSS字符串值，或者number像素值
     * @default 90
     */
    height?: string | number;

    /**
     * 弹窗的基础z-index值  
     * 因内部DOM结构需要有一定上下层级关系，内部DOM元素可能会上下波动+-10
     * @default 1000
     */
    zIndex?: number;

    /**
     * 按钮列表  
     * 顺序为从右到左
     * @default []
     */
    buttons?: Button[];
}>();
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
// #endregion

// #region 弹窗控制
/**
 * 弹窗可见性
 */
const visible = ref(true);

/**
 * 显示弹窗
 */
function show() {
    visible.value = true;
}

/**
 * 隐藏弹窗
 */
function hide() {
    visible.value = false;
}

/**
 * 切换弹窗可见性
 */
function toggle() {
    visible.value = !visible.value;
}

/**
 * 销毁弹窗
 */
function destroy() {
    visible.value = false;
    host.remove();
}
// #endregion

// #region 标题栏拖动
/**
 * 弹窗主窗口
 */
const dialog = useTemplateRef('dialog');

// 存储拖拽的核心状态
const dragdata = {
    /** 鼠标按下时的初始 clientX */
    startX: 0,
    /** 鼠标按下时的初始 clientY */
    startY: 0,
    /** 当前已经累积的 X 轴位移 */
    translateX: 0,
    /** 当前已经累积的 Y 轴位移 */
    translateY: 0,
    /** 上一次拖拽结束后的 X 轴位移 */
    lastTranslateX: 0,
    /** 上一次拖拽结束后的 Y 轴位移 */
    lastTranslateY: 0,
    /** rAF 状态锁 */
    ticking: false,
    /** 用于解除绑定事件处理器 */
    ctrl: new AbortController(),
};

/**
 * 鼠标按下标题栏处理器
 */
function dragstart(e: MouseEvent) {
    // 记录鼠标按下的起始坐标
    dragdata.startX = e.clientX;
    dragdata.startY = e.clientY;
    
    dragdata.ctrl = new AbortController();

    // 监听全局鼠标移动
    addEventListener.call(
        document,
        'mousemove',
        moveEvent => dragmove(moveEvent as MouseEvent),
        { signal: dragdata.ctrl.signal },
    );

    // 监听全局鼠标抬起，释放事件
    addEventListener.call(
        document,
        'mouseup',
        () => {
            // 记录下当前的位移作为下一次拖拽的起点基准
            dragdata.lastTranslateX = dragdata.translateX;
            dragdata.lastTranslateY = dragdata.translateY;
            // 取消事件绑定
            dragdata.ctrl.abort();
        },
        { signal: dragdata.ctrl.signal },
    );
}

/**
 * 鼠标按住移动处理器
 */
function dragmove(e: MouseEvent) {
    // 1. 计算鼠标当前位置相对于按下时位置的相对偏移量
    const deltaX = e.clientX - dragdata.startX;
    const deltaY = e.clientY - dragdata.startY;

    // 2. 将相对偏移量累加到上一次停放的位置上
    dragdata.translateX = dragdata.lastTranslateX + deltaX;
    dragdata.translateY = dragdata.lastTranslateY + deltaY;

    // 3. rAF 节流核心锁：若当前帧尚未渲染，则申请动画帧
    if (!dragdata.ticking) {
        dragdata.ticking = true;
        
        requestAnimationFrame(() => {
            if (dialog.value) {
                // 特别注意：由于原本有 -translate-x-1/2 -translate-y-1/2 居中
                // 我们在保留原居中变形的基础上，叠加拖拽的 px 像素位移
                dialog.value.style.transform = `translate(calc(-50% + ${dragdata.translateX}px), calc(-50% + ${dragdata.translateY}px))`;
            }
            // 渲染完毕，解锁允许下一帧更新
            dragdata.ticking = false;
        });
    }
}
// #endregion

// #region Expose
const body = useTemplateRef('body') as Nullable<ComponentExposed<C>>;
const btns = useTemplateRef('buttons');
defineExpose({
    show, hide, toggle, destroy,
    content: body, buttons: btns,
});
// #endregion
</script>

<template>
    <Teleport :to="container">
        <!-- 主窗口 -->
        <div
            v-show="visible"
            v-bind="$attrs"
            ref="dialog"
            class="
                fixed left-1/2 top-1/2
                flex flex-col
                text-surface-800 dark:text-surface-200
                border border-solid border-surface-300 dark:border-surface-700
                shadow-sm shadow-gray-500 dark:shadow-black
            "
            :style="{
                width: typeof width === 'number' ? `calc(var(--spacing) * ${ width })` : width,
                height: typeof height === 'number' ? `calc(var(--spacing) * ${ height })` : height,
                transform: 'translate(-50%, -50%)',
                zIndex: zIndex + 1,
            }"
        >
            <!-- Header -->
            <div
                class="
                    relative
                    flex flex-row justify-between items-center
                    bg-surface-200 dark:bg-surface-800
                    border-b border-solid border-surface-300 dark:border-surface-700
                    cursor-move
                    select-none
                "
                @mousedown="dragstart"
            >
                <!-- 文字部分 -->
                <div
                    class="
                        flex flex-row justify-start items-center
                        grow shrink
                        px-5 py-3
                        font-bold
                    "
                >
                    {{ header }}
                </div>
                <div
                    class="
                        absolute right-0 h-full aspect-square text-lg
                        flex justify-center items-center
                        bg-transparent text-surface-400 hover:text-surface-300
                        cursor-pointer
                    "
                    @mousedown.stop
                    @click="destroy"
                >
                    <MaterialSymbolsClose />
                </div>
            </div>
            
            <!-- Body -->
            <div
                class="
                    grow shrink
                    bg-surface-100 dark:bg-surface-900
                    px-5 py-5
                "
            >
                <component ref="body" :is="content.comp" v-bind="content.props" />
            </div>

            <!-- Footer -->
            <div
                class="
                    flex flex-row-reverse justify-start gap-2
                    bg-surface-200 dark:bg-surface-800
                    border-t border-solid border-surface-300 dark:border-surface-700
                    px-5 py-3
                "
            >
                <Button
                    v-for="btn of buttons"
                    ref="buttons"
                    v-bind="btn"
                    :callback="[
                        ...(
                            Array.isArray(btn.callback)
                                ? btn.callback
                                : [btn.callback ?? (() => {})]
                        ), () => { (btn.destroy ?? true) && destroy() }
                    ]"
                />
            </div>
        </div>

        <!-- 背景遮罩层 -->
        <div
            v-if="!seamless"
            class="
                fixed top-0 left-0 w-screen h-screen
                bg-[color-mix(in_srgb,black_40%,transparent)]
            "
            :style="{
                zIndex: zIndex
            }"
            @click="backdropDismiss && destroy()"
        ></div>
    </Teleport>
</template>