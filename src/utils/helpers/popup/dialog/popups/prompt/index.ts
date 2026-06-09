import i18n, { i18nKeys } from "@/i18n/index.ts";
import type { Nullable, DisplayContent } from "../../../../../types/index.ts";
import { isSystemDark } from "../../../../ui-utils.ts";
import App from '../../app.vue';
import DialogContent from "./dialog-content.vue";
import { computed, isRef, watch } from "vue";
import type { Ref } from 'vue';
import { createShadowApp } from "../../../../shadowapp.ts";

const { t } = i18n.global;
const $dialog = i18nKeys.$popup.$dialog;

export interface PromptOptions {
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
     * 预填充文字 / 默认值
     */
    value?: string;
    
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
     * 输入框宽高比  
     * 因为宽度依对话框可用宽度而定，因此此项调整的就是高度
     * @default '7/3'
     */
    aspectRatio?: string;
}
const DEFAULT_OPTIONS: Required<PromptOptions> = {
    dark: 'auto',
    header: t($dialog.$prompt.$header),
    seamless: false,
    backdropDismiss: true,
    value: '',
    aspectRatio: '7/3',
};

export async function prompt(content: string | DisplayContent, options: PromptOptions = {}) {
    // 参数处理
    const fullOptions = Object.assign({}, DEFAULT_OPTIONS, options);
    const isDark = computed(() => fullOptions.dark === 'auto' ?
        isSystemDark.value :
        isRef(fullOptions.dark) ? fullOptions.dark.value : fullOptions.dark
    );
    watch(isDark, dark => dark ? container.classList.add('dark') : container.classList.remove('dark'));

    // 返回值
    const { promise, resolve } = Promise.withResolvers<Nullable<string>>();

    // 挂载Dialog
    const propsContent = {
        type: 'vue' as const,
        comp: DialogContent,
        props: {
            content: content,
            value: fullOptions.value,
            aspectRatio: fullOptions.aspectRatio,
        },
    } satisfies DisplayContent<typeof DialogContent>;
    type InstantiatedApp = typeof App<typeof propsContent>;
    const { container, root } = await createShadowApp<InstantiatedApp>(App, {
        options: {
            app: {
                classes: isDark.value ? ['dark'] : [],
            },
        },
        props: {
            header: fullOptions.header,
            content: propsContent,
            seamless: fullOptions.seamless,
            backdropDismiss: fullOptions.backdropDismiss,
            buttons: [{
                label: t($dialog.$prompt.$buttons.$ok),
                serverity: 'primary',
                callback: () => resolve(root.content?.value!),
            }, {
                label: t($dialog.$prompt.$buttons.$cancel),
                serverity: 'secondary',
                callback: () => resolve(null),
            }],
        },
    });

    return promise;
}