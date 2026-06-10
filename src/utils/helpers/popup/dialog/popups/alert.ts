import i18n, { i18nKeys } from "@/i18n/index.ts";
import type { DisplayContent } from "../../../../types/index.ts";
import { dialog, DialogOptions } from "./dialog.ts";

const { t } = i18n.global;
const $dialog = i18nKeys.$popup.$dialog;

export type AlertOptions = Omit<DialogOptions, 'buttons'>

const DEFAULT_OPTIONS: Required<AlertOptions> = {
    dark: 'auto',
    header: t($dialog.$alert.$header),
    seamless: false,
    backdropDismiss: true,
};

export async function alert(content: string | DisplayContent, options: AlertOptions = DEFAULT_OPTIONS) {
    // 参数处理
    const fullOptions = Object.assign(DEFAULT_OPTIONS, options);

    // 挂载Dialog
    const { promise, resolve } = await dialog(content, {
        ...fullOptions,
        buttons: [{
            label: t($dialog.$alert.$buttons.$ok),
            serverity: 'primary',
            callback: () => resolve(),
        }],
    });

    return promise;
}