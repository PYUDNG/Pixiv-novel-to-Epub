import i18n, { i18nKeys } from "@/i18n/index.ts";
import type { DisplayContent, TextContent, VueContent } from "../../../../types/index.ts";
import { createDialogApp, DialogOptions } from "../dialog.ts";
import TextRenderer from "../components/text-renderer.vue";
import HTMLRenderer from "../components/html-renderer.vue";

const { t } = i18n.global;
const $dialog = i18nKeys.$popup.$dialog;

export type AlertOptions = Omit<DialogOptions, 'buttons'>

const DEFAULT_OPTIONS: Required<AlertOptions> = {
    dark: 'auto',
    header: t($dialog.$alert.$header),
    seamless: false,
    backdropDismiss: true,
};

/**
 * 弹窗展示任意自定义内容，只有一个确定按钮，返回一个在弹窗关闭后resolve的`Promise`
 * @param content 自定义弹窗内容
 * @param options 弹窗选项
 * @returns 一个在弹窗关闭后resolve的`Promise`
 */
export async function alert(content: string | DisplayContent, options: AlertOptions = DEFAULT_OPTIONS) {
    // 参数处理
    const fullOptions = Object.assign(DEFAULT_OPTIONS, options);

    if (typeof content === 'string') {
        content = {
            type: 'text',
            text: content,
        } satisfies TextContent;
    }

    let dialogContent: VueContent;
    switch (content.type) {
        case 'text': {
            dialogContent = {
                type: 'vue',
                comp: TextRenderer,
                props: { content },
            };
            break;
        }
        case 'html': {
            dialogContent = {
                type: 'vue',
                comp: HTMLRenderer,
                props: { content },
            };
            break;
        }
        case 'vue': {
            dialogContent = content;
            break;
        }
    }

    // 返回值
    const { promise, resolve } = Promise.withResolvers<void>();

    // 挂载Dialog
    await createDialogApp(dialogContent, {
        ...fullOptions,
        buttons: [{
            label: t($dialog.$alert.$buttons.$ok),
            serverity: 'primary',
            callback: () => resolve(),
        }],
    });

    return promise;
}