import i18n, { i18nKeys } from "@/i18n/index.ts";
import type { Nullable, DisplayContent } from "../../../../../types/index.ts";
import { isSystemDark } from "../../../../ui-utils.ts";
import App from '../../app.vue';
import DialogContent from "./dialog-content.vue";
import { computed, isRef, ref, watch } from "vue";
import { userInputKey } from "./utils.ts";
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
}
const DEFAULT_OPTIONS: Required<PromptOptions> = {
    dark: 'auto',
    header: t($dialog.$prompt.$header),
    seamless: false,
    backdropDismiss: true,
    value: '',
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

    // 通过provide/inject从GUI中获取用户输入
    const userInput = ref<string>(fullOptions.value);

    // 挂载Dialog
    const { container } = await createShadowApp(App, {
        options: {
            app: {
                classes: isDark.value ? ['dark'] : [],
            },
        },
        props: {
            header: fullOptions.header,
            content: {
                type: 'vue',
                comp: DialogContent,
                props: {
                    content: content,
                    value: fullOptions.value,
                },
            },
            seamless: fullOptions.seamless,
            backdropDismiss: fullOptions.backdropDismiss,
            buttons: [{
                label: t($dialog.$prompt.$buttons.$ok),
                serverity: 'primary',
                callback: () => resolve(userInput.value),
            }, {
                label: t($dialog.$prompt.$buttons.$cancel),
                serverity: 'secondary',
                callback: () => resolve(null),
            }],
        },
        provides: {
            [userInputKey]: userInput,
        },
    });

    return promise;
}