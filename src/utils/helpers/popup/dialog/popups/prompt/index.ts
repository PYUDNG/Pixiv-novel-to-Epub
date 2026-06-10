import i18n, { i18nKeys } from "@/i18n/index.ts";
import type { Nullable, DisplayContent } from "../../../../../types/index.ts";
import DialogContent from "./dialog-content.vue";
import { dialog, DialogOptions } from "../dialog.ts";

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

export async function prompt(content: string | DisplayContent, options: PromptOptions = DEFAULT_OPTIONS) {
    // 参数处理
    const fullOptions = Object.assign({}, DEFAULT_OPTIONS, options);

    // 返回值
    const {  } = Promise.withResolvers<Nullable<string>>();

    // Dialog内容
    const dialogContent = {
        type: 'vue' as const,
        comp: DialogContent,
        props: {
            content: content,
            value: fullOptions.value,
            aspectRatio: fullOptions.aspectRatio,
        },
    } satisfies DisplayContent<typeof DialogContent>;

    // 创建Dialog
    const { promise, resolve, root } = await dialog<
        Nullable<string>, typeof dialogContent
    >(dialogContent, {
        dark: fullOptions.dark,
        header: fullOptions.header,
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
    });

    return promise;
}