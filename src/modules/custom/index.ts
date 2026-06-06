import i18n, { i18nKeys } from "@/i18n";
import { defineModule } from "../types";
import { AbortSymbol, alert, getUrlArgv, isPixivDark, Nullable, prompt } from "@/utils";
import { downloadCustom, downloadWithUI } from "../downloader";
import { GM_registerMenuCommand, GM_unregisterMenuCommand } from "$";
import { novel } from "../api";
import { newTask, progress } from "@/utils/helpers/popup/progress";
import MaterialSymbolsDataObject from '~icons/material-symbols/data-object';

const PROGRESS_UI_DESTROY_DELAY = 3000;

const { t } = i18n.global;
const $custom = i18nKeys.$custom;

export default defineModule({
    id: 'custom',
    async enter() {
        // 创建脚本菜单
        this.context!.downloadMenuId = GM_registerMenuCommand(t($custom.$download), async () => {
            // 输入小说列表
            const input = await prompt(t($custom.$input.$content), {
                dark: isPixivDark,
                header: t($custom.$input.$header),
                seamless: true,
            });
            if (input === null) return;
            const parts = input.trim().split(/[\r\n ,，]+/);
            if (parts.length === 0) return;
            if (parts.some(str => !/^\d+$/.test(str) && !getUrlArgv('id', str))) {
                alert(t($custom.$invalidInput.$content), {
                    dark: isPixivDark,
                    header: t($custom.$invalidInput.$header),
                });
                return;
            }
            const ids = parts.map(str =>
                parseInt(
                    /^\d+$/.test(str) ?
                        str :
                        getUrlArgv('id', str)!
                )
            );

            // 确定文件名
            const p = await progress([], {
                dark: isPixivDark,
                seamless: true,
            });
            const taskId = p.add(newTask(t($custom.$fetchingData), MaterialSymbolsDataObject, 1));
            const data = await novel(ids[0]);
            p.progress(taskId);
            p.complete(taskId);
            p.destroy(PROGRESS_UI_DESTROY_DELAY);
            if (data === AbortSymbol) return;
            const filename = await prompt(t($custom.$filename.$content), {
                dark: isPixivDark,
                header: t($custom.$filename.$header),
                seamless: true,
                value: data.body.title,
            });
            if (filename === null) return;

            // 执行下载
            downloadWithUI(downloadCustom, ids, filename);
        });
    },
    leave() {
        this.context!.downloadMenuId !== null &&
            GM_unregisterMenuCommand(this.context!.downloadMenuId);
    },
    context: {
        downloadMenuId: null as Nullable<number | string>,
    },
});
