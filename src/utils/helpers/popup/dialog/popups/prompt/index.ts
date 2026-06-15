import i18n, { i18nKeys } from "@/i18n/index.ts";
import type { Nullable, DisplayContent } from "../../../../../types/index.ts";
import { createVueContent } from "../../../../../types/index.ts";
import DialogContent from "./dialog-content.vue";
import { createDialogApp } from "../../dialog.ts";
import type { DialogOptions } from "../../dialog.ts";

const { t } = i18n.global;
const $dialog = i18nKeys.$popup.$dialog;

export type PromptOptions = Omit<DialogOptions, 'buttons'> & {
    /**
     * 预填充文字 / 默认值
     */
    value?: string;
    
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

/**
 * 弹窗输入文本，支持提示任意自定义内容，包含确定和取消两个按钮，返回一个在弹窗关闭后resolve的`Promise`
 * @param content 自定义弹窗提示内容
 * @param options 弹窗选项
 * @returns 一个`Promise`，当点击确定时resolve为字符串内容，当直接关闭弹窗或点击取消时resolve为`null`
 */
export async function prompt(content: string | DisplayContent, options: PromptOptions = DEFAULT_OPTIONS) {
    // 参数处理
    const fullOptions = Object.assign({}, DEFAULT_OPTIONS, options);

    // 返回值
    const { promise, resolve } = Promise.withResolvers<Nullable<string>>();

    // 创建Dialog
    const { instance } = await createDialogApp(
        createVueContent<typeof DialogContent>({
            type: 'vue',
            comp: DialogContent,
            props: {
                content: content,
                value: fullOptions.value,
                aspectRatio: fullOptions.aspectRatio,
            },
        }), {
            dark: fullOptions.dark,
            header: fullOptions.header,
            seamless: fullOptions.seamless,
            backdropDismiss: fullOptions.backdropDismiss,
            buttons: [{
                label: t($dialog.$prompt.$buttons.$ok),
                severity: 'primary',
                callback: () => resolve(instance?.value ?? ''),
            }, {
                label: t($dialog.$prompt.$buttons.$cancel),
                severity: 'secondary',
                callback: () => resolve(null),
            }],
        }
    );

    return promise;
}