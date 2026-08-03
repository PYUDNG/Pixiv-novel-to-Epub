import i18n, { i18nKeys } from "@/i18n";
import { defineModule } from "../types";
import { createVueContent, isPixivDark, Nullable } from "@/utils";
import { downloadMerged, downloadMultiple, downloadWithUI } from "../downloader";
import { GM_registerMenuCommand, GM_unregisterMenuCommand } from "$";
import { createDialogApp } from "@/utils/helpers/popup/dialog/dialog";
import App from "./app.vue";
import MaterialSymbolsDashboardCustomize from '~icons/material-symbols/dashboard-customize';
import type { DownloadOptions } from "./download-options/download-options.vue";

const { t } = i18n.global;
const $custom = i18nKeys.$custom;

export default defineModule({
    id: 'custom',
    async enter() {
        // 创建脚本菜单
        this.context!.downloadMenuId = GM_registerMenuCommand(t($custom.$download), async () => {
            // 输入小说列表
            type CustomInput = Nullable<{
                ids: string[];
                options: DownloadOptions;
            }>;
            const { promise, resolve } = Promise.withResolvers<CustomInput>();
            const { instance } = await createDialogApp(
                createVueContent<typeof App>({
                    type: 'vue',
                    comp: App,
                    props: {},
                }),
                {
                    icon: MaterialSymbolsDashboardCustomize,
                    header: t($custom.$input.$dialog.$header),
                    dark: isPixivDark,
                    seamless: true,
                    width: '90vw',
                    height: '90vh',
                    buttons: [{
                        label: t($custom.$input.$dialog.$buttons.$ok),
                        severity: 'primary',
                        callback: (): void => resolve(
                            instance ? {
                                ids: instance.ids,
                                options: instance.options,
                            } : null
                        ),
                    }, {
                        label: t($custom.$input.$dialog.$buttons.$cancel),
                        severity: 'secondary',
                        callback: (): void => resolve(null),
                    }]
                },
            );
            const inputData = await promise;
            if (inputData === null) return;
            const { ids, options } = inputData;
            if (ids.length === 0) return;

            // 执行下载
            if (options.merge)
                downloadWithUI(downloadMerged, ids, options.filename);
            else
                downloadWithUI(downloadMultiple, ids, []);
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
