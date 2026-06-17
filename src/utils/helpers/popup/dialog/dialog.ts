import i18n, { i18nKeys } from "@/i18n/index.ts";
import type { PromiseOrRaw, VueContent } from "../../../types/index.ts";
import { isSystemDark } from "../../ui-utils.ts";
import App, { Button } from './app.vue';
import { computed, isRef, reactive, watch } from "vue";
import type { Component, InjectionKey, Ref } from 'vue';
import { createShadowApp } from "../../shadowapp.ts";

// #region DialogApp provide / inject keys
/**
 * provide / inject key: 弹窗按钮控制器
 */
export const BUTTON_CONTROLLER_KEY = Symbol('dialog-app-button-controller') as InjectionKey<DialogButtonController>;
// #endregion

const { t } = i18n.global;
const $dialog = i18nKeys.$popup.$dialog;

export interface DialogOptions {
    /**
     * 深色模式
     * @default 'auto'
     */
    dark?: Ref<boolean> | boolean | 'auto';

    /**
     * 标题文字
     * @default '提示'
     */
    header?: string;
    
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
     * 对话框按钮列表
     */
    buttons: Button[];
}
const DEFAULT_OPTIONS: Required<DialogOptions> = {
    dark: 'auto',
    header: t($dialog.$dialog.$header),
    seamless: false,
    backdropDismiss: true,
    buttons: [],
};

export interface DialogButtonController {
    /**
     * 禁用按钮
     * @param index 第几个按钮（从0开始）
     */
    disable(index: number): void;
    
    /**
     * 启用按钮
     * @param index 第几个按钮（从0开始）
     */
    enable(index: number): void;

    /**
     * 设置加载状态
     * @param index 第几个按钮（从0开始）
     * @param loading 是否处于加载中状态
     */
    loading(index: number, loading: boolean): void;

    /**
     * 注册click事件监听器  
     * 该监听器将会在调用{@link createDialogApp}时声明的按钮回调之前优先执行  
     * 多次调用本方法，将按照调用顺序执行
     * @param index 第几个按钮（从0开始）
     * @param callback 点击事件监听器
     */
    onClick(index: number, callback: (this: HTMLElement, e: PointerEvent) => PromiseOrRaw<any>): void;
}

/**
 * 使用 {@link createShadowApp} 创建悬浮窗口，并在其中渲染你的 Vue App
 * @param content 对话框内容
 * @param options 对话框选项
 * @returns 创建的Vue app、根组件实例、Vue挂载容器和ShadowDOM宿主
 */
export async function createDialogApp<
    C extends Component,
>(content: VueContent<C>, options: DialogOptions = DEFAULT_OPTIONS) {
    // 参数处理
    const fullOptions = reactive(Object.assign({}, DEFAULT_OPTIONS, options));
    const isDark = computed(() => fullOptions.dark === 'auto' ?
        isSystemDark.value :
        isRef(fullOptions.dark) ? fullOptions.dark.value : fullOptions.dark
    );
    watch(isDark, dark => dark ? container.classList.add('dark') : container.classList.remove('dark'));

    // provides
    const buttons: DialogButtonController = {
        disable(index) {
            fullOptions.buttons[index].disabled = true;
        },
        enable(index) {
            fullOptions.buttons[index].disabled = false;
        },
        loading(index, loading) {
            fullOptions.buttons[index].loading = loading;
        },
        onClick(index, callback) {
            if (Array.isArray(fullOptions.buttons[index].callback)) {
                // 插入到数组倒数第二位
                const callbacks = fullOptions.buttons[index].callback;
                callbacks.splice(Math.max(0, callbacks.length - 1), 0, callback);
            } else {
                // 转化为数组
                fullOptions.buttons[index].callback = [
                    callback,
                    typeof fullOptions.buttons[index].callback !== 'undefined'
                        ? fullOptions.buttons[index].callback
                        : () => {},
                ];
            }
        }
    };
    const provides: Record<string | symbol, any> = {
        [BUTTON_CONTROLLER_KEY]: buttons,
    };

    // 挂载Dialog
    type InstantiatedApp = typeof App<C>;
    const { container, root, app, host } = await createShadowApp<InstantiatedApp>(App, {
        options: {
            app: {
                classes: isDark.value ? ['dark'] : [],
            },
        },
        props: {
            header: fullOptions.header,
            content: content,
            seamless: fullOptions.seamless,
            backdropDismiss: fullOptions.backdropDismiss,
            buttons: fullOptions.buttons,
        },
        provides,
    });

    // @ts-expect-error 这里VueContent仅用于JSDoc注释，因此期望出现一个 未使用的导入 错误
    type VueContent = import('../../../../types/index.ts').VueContent;
    
    return {
        /**
         * 对话框根组件实例，暴露了多项对话框数据与控制方法  
         * 注意：这个是对话框整体App的根组件实例，不是传入的对话框内容组件的实例  
         * 其中`.content`为传入的content的对外暴露值：
         * - 如果传入content为{@link VueContent}，`.content`值就是传入Vue组件的暴露对象
         * - 如果不是，`.content`值就是`null`
         */
        root,

        /**
         * 传入的内容组件的实例  
         * 注意：由于组件初始创建期间可能尚未渲染完成，极短时间内可能为`null`
         */
        instance: root.content,

        /**
         * 挂载 Vue App 的宿主元素
         */
        container,

        /**
         * 挂载的 Vue App 实例
         */
        app,

        /**
         * 挂载 Shadow DOM 结构的宿主元素
         */
        host,

        /**
         * 对话框按钮控制器
         */
        buttons,
    };
}