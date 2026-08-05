import i18n, { i18nKeys } from "@/i18n/index.ts";
import type { Nullable, DisplayContent } from "../../../../../types/index.ts";
import { createVueContent } from "../../../../../types/index.ts";
import DialogContent, { SelectProps } from "./dialog-content.vue";
import { createDialogApp } from "../../dialog.ts";
import type { DialogOptions } from "../../dialog.ts";

const { t } = i18n.global;
const $dialog = i18nKeys.$popup.$dialog;

export type SelectOptions<V> = Omit<DialogOptions, 'buttons'> & Omit<SelectProps<V>, 'content'>;
export type RequiredSelectOptionKeys = 'options';
const DEFAULT_OPTIONS: Required<Omit<SelectOptions<any>, RequiredSelectOptionKeys>> = {
    dark: 'auto',
    header: t($dialog.$select.$header),
    seamless: false,
    backdropDismiss: true,
    value: undefined,
    icon: null,
    width: 120,
    height: 'fit-content',
};

/**
 * 弹窗下拉选项，支持提示任意自定义内容、任意自定义选项，包含确定和取消两个按钮，返回一个在弹窗关闭后resolve的`Promise`
 * @param content 自定义弹窗提示内容
 * @param options 弹窗选项
 * @returns 一个`Promise`，当点击确定时resolve为字符串内容，当直接关闭弹窗或点击取消时resolve为`null`
 */
export async function select<V>(content: string | DisplayContent, options: SelectOptions<V>) {
    // 参数处理
    const fullOptions = Object.assign({}, DEFAULT_OPTIONS, options);

    // 返回值
    const { promise, resolve } = Promise.withResolvers<Nullable<V>>();

    // 创建Dialog
    type InitializedApp = typeof DialogContent<V>
    const { instance } = await createDialogApp<InitializedApp>(
        createVueContent<typeof DialogContent>({
            type: 'vue',
            comp: DialogContent,
            props: {
                content: content,
                options: fullOptions.options,
                value: fullOptions.value,
            },
        }), {
            dark: fullOptions.dark,
            header: fullOptions.header,
            seamless: fullOptions.seamless,
            backdropDismiss: fullOptions.backdropDismiss,
            buttons: [{
                label: t($dialog.$select.$buttons.$ok),
                severity: 'primary',
                callback: () => resolve(instance?.value ?? null),
            }, {
                label: t($dialog.$select.$buttons.$cancel),
                severity: 'secondary',
                callback: () => resolve(null),
            }],
        }
    );

    return promise;
}