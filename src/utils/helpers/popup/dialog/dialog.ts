import i18n, { i18nKeys } from "@/i18n/index.ts";
import type { VueContent } from "../../../types/index.ts";
import { isSystemDark } from "../../ui-utils.ts";
import App, { Button } from './app.vue';
import { computed, isRef, watch } from "vue";
import type { Component, Ref } from 'vue';
import { createShadowApp } from "../../shadowapp.ts";

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
     * @default [OK]
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
    const fullOptions = Object.assign({}, DEFAULT_OPTIONS, options);
    const isDark = computed(() => fullOptions.dark === 'auto' ?
        isSystemDark.value :
        isRef(fullOptions.dark) ? fullOptions.dark.value : fullOptions.dark
    );
    watch(isDark, dark => dark ? container.classList.add('dark') : container.classList.remove('dark'));

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
    };
}