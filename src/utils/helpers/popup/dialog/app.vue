<script setup lang="ts" generic="C extends Component">
import type { Component, Ref } from 'vue';
import { computed, inject, ref, useTemplateRef } from 'vue';
import type { ComponentExposed } from 'vue-component-type-helpers';
import type { Nullable, VueContent } from '../../../types';
import { OVERLAY_CONTAINER_KEY, OVERLAY_SHADOWHOST_KEY } from '../../shadowapp';
import type { ButtonProps } from '@/components/button.vue';
import Button from '@/components/button.vue';
import { addEventListener } from '@/hooks';
import MaterialSymbolsClose from '~icons/material-symbols/close';
import MaterialSymbolsHighlightMouseCursor from '~icons/material-symbols/highlight-mouse-cursor'
import { useI18n } from 'vue-i18n';
import { i18nKeys } from '@/i18n';

export interface Button extends ButtonProps {
    /**
     * 点击按钮后是否自动销毁弹窗
     * @default true
     */
    destroy?: boolean;
}

const { t } = useI18n();
const $app = i18nKeys.$popup.$dialog.$app;

// #region Props
const {
    icon = null,
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
     * 图标
     * @default null
     */
    icon: Nullable<Component>;

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
     * @default 'fit-content'
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
 * 弹窗穿透  
 * 处于穿透状态时，弹窗除标题栏外均为半透明状态且鼠标可穿透点击下方页面
 */
const clickThrough = ref(false);

/**
 * 弹窗标题栏右侧按钮  
 * 数组中从前到后对应UI中从右到左
 */
const rightBtns: {
    show?: Ref<boolean>;
    icon: Component;
    title?: string;
    active?: Ref<boolean>
    callback: (e: PointerEvent) => any;
}[] = [{
    icon: MaterialSymbolsClose,
    title: t($app.$buttons.$close),
    callback: destroy,
}, {
    show: computed(() => seamless),
    icon: MaterialSymbolsHighlightMouseCursor,
    title: t($app.$buttons.$clickThrough),
    active: clickThrough,
    callback: _e => setClickThrough(),
}];

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

/**
 * 设置弹窗是否穿透
 * @param val 是否穿透，省略或者null代表按照当前值取反
 * @returns 设置后的穿透值
 */
function setClickThrough(val: boolean | null = null) {
    return clickThrough.value = val === null ? !clickThrough.value : val;
}
// #endregion

// #region 标题栏拖动
/**
 * 弹窗主窗口
 */
const dialog = useTemplateRef('dialog');
const transform = ref('translate(-50%, -50%)');

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
                transform.value = `translate(calc(-50% + ${dragdata.translateX}px), calc(-50% + ${dragdata.translateY}px))`;
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

// #region 通用钩子事件
function mainWindowMousedown(_e: MouseEvent) {
    // 将host元素放到父元素最后，实现多个悬浮窗之间，最后点击的在最上方
    const parent = host.parentElement;
    if (parent && parent.lastChild !== host)
        parent.append(host);
}
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
            :class="{
                'pointer-events-none': clickThrough,
            }"
            :style="{
                width: typeof width === 'number' ? `calc(var(--spacing) * ${ width })` : width,
                height: typeof height === 'number' ? `calc(var(--spacing) * ${ height })` : height,
                transform: transform,
                zIndex: zIndex + 1,
            }"
            @mousedown="mainWindowMousedown"
        >
            <!-- Header -->
            <div
                class="
                    relative
                    flex flex-row justify-between items-stretch
                    bg-surface-200 dark:bg-surface-800
                    border-b border-solid border-surface-300 dark:border-surface-700
                    cursor-move
                    select-none
                    pointer-events-auto
                "
                @mousedown="dragstart"
            >
                <!-- 左侧内容 -->
                <div
                    class="
                        flex flex-row gap-3 justify-start items-center
                        grow shrink
                        px-5 py-3
                        font-bold
                    "
                >
                    <!-- 图标 -->
                    <component v-if="icon" :is="icon" />

                    <!-- 标题 -->
                    <div>{{ header }}</div>
                </div>

                <!-- 右侧按钮 -->
                <div
                    class="
                        flex flex-row-reverse gap-2
                    "
                >
                    <template v-for="btn of rightBtns">
                        <div
                            v-if="!Object.hasOwn(btn, 'show') || btn.show!.value"
                            class="
                                aspect-square text-lg
                                flex justify-center items-center
                                bg-transparent
                                cursor-pointer
                            "
                            :class="{
                                'text-surface-600 dark:text-surface-400 hover:text-surface-500 dark:hover:text-surface-300': !Object.hasOwn(btn, 'active') || !btn.active!.value,
                                'text-severity-primary': btn.active?.value,
                            }"
                            :title="btn.title"
                            @mousedown.stop
                            @click="btn.callback"
                        >
                            <component :is="btn.icon" />
                        </div>
                    </template>
                </div>
            </div>
            
            <!-- Body -->
            <div
                class="
                    grow shrink overflow-auto
                    bg-surface-100 dark:bg-surface-900
                    px-5 py-5
                "
                :class="{
                    'pointer-events-none opacity-40': clickThrough,
                }"
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
                :class="{
                    'pointer-events-none opacity-40': clickThrough,
                }"
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