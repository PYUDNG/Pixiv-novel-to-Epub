import i18n, { i18nKeys } from "@/i18n/index.ts";
import type { DisplayContent } from "../../../../types/index.ts";
import { createShadowApp, isSystemDark } from "../../../ui-utils.ts";
import App from '../app.vue';
import { computed, watch } from "vue";

const { t } = i18n.global;
const $dialog = i18nKeys.$popup.$dialog;

export interface AlertOptions {
    /**
     * 深色模式
     * @default 'auto'
     */
    dark?: boolean | 'auto';

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
}
const DEFAULT_OPTIONS: Required<AlertOptions> = {
    dark: 'auto',
    header: t($dialog.$alert.$header),
    seamless: false,
    backdropDismiss: true,
};

export async function alert(content: string | DisplayContent, options: AlertOptions = {}) {
    // 参数处理
    const fullOptions = Object.assign(DEFAULT_OPTIONS, options);
    const isDark = computed(() => fullOptions.dark === 'auto' ? isSystemDark.value : fullOptions.dark);
    watch(isDark, dark => dark ? container.classList.add('dark') : container.classList.remove('dark'));

    // 返回值
    const { promise, resolve } = Promise.withResolvers<void>();

    // 挂载Dialog
    const { container } = await createShadowApp(App, {
        options: {
            app: {
                classes: isDark.value ? ['dark'] : [],
            },
        },
        props: {
            header: fullOptions.header,
            content: content,
            buttons: [{
                label: t($dialog.$alert.$buttons.$ok),
                serverity: 'primary',
                callback: () => resolve(),
            }],
            seamless: fullOptions.seamless,
            backdropDismiss: fullOptions.backdropDismiss,
        },
    });

    return promise;
}