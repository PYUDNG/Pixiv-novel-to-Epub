import i18n, { i18nKeys } from "@/i18n";
import { defineModule } from "../types";
import { AbortSymbol, alert, createVueContent, globalLogger, isPixivDark, Nullable } from "@/utils";
import { downloadCustom, downloadWithUI } from "../downloader";
import { GM_registerMenuCommand, GM_unregisterMenuCommand } from "$";
import { novel } from "../api";
import { newTask, progress } from "@/utils/helpers/popup/progress";
import MaterialSymbolsDataObject from '~icons/material-symbols/data-object';
import { createDialogApp } from "@/utils/helpers/popup/dialog/dialog";
import App from "./app.vue";

const PROGRESS_UI_DESTROY_DELAY = 3000;

const { t } = i18n.global;
const $custom = i18nKeys.$custom;
const logger = globalLogger.withPath('custom');

export default defineModule({
    id: 'custom',
    async enter() {
        // 创建脚本菜单
        this.context!.downloadMenuId = GM_registerMenuCommand(t($custom.$download), async () => {
            // 输入小说列表
            type CustomInput = Nullable<{
                ids: string[];
                filename: string;
            }>;
            const { promise, resolve } = Promise.withResolvers<CustomInput>();
            const { instance } = await createDialogApp(
                createVueContent<typeof App>({
                    type: 'vue',
                    comp: App,
                    props: {},
                }),
                {
                    header: t($custom.$input.$header),
                    dark: isPixivDark,
                    seamless: true,
                    buttons: [{
                        label: t($custom.$input.$buttons.$ok),
                        severity: 'primary',
                        callback: (): void => resolve(
                            instance ? {
                                ids: instance.value,
                                filename: instance.filename,
                            } : null
                        ),
                    }, {
                        label: t($custom.$input.$buttons.$cancel),
                        severity: 'secondary',
                        callback: (): void => resolve(null),
                    }]
                },
            );
            const inputData = await promise;
            if (inputData === null) return;
            const { ids, filename } = inputData;
            if (ids.length === 0) return;

            // 获取所有小说数据
            let hasError = false;
            const p = await progress([], {
                dark: isPixivDark,
                seamless: true,
            });
            const taskId = p.add(newTask(t($custom.$fetchingData), MaterialSymbolsDataObject, ids.length));
            const ctrl = new AbortController();
            const promises = ids.map(async id => {
                try {
                    const data = await novel(id, ctrl.signal);
                    p.progress(taskId);
                    return data;
                } catch(err) {
                    hasError = true;
                    logger.simple('Error', 'custom download fetch novels data failed');
                    logger.asLevel('Error', err);
                    throw err;
                }
            });
            Promise.all(promises)
                .then(() => p.complete(taskId))
                .finally(() => p.destroy(PROGRESS_UI_DESTROY_DELAY));
            const novels = await Promise.all(promises).catch(err => err as never);

            if (hasError) {
                await alert(t($custom.$novelApiError.$content), {
                    header: t($custom.$novelApiError.$header),
                    backdropDismiss: false,
                });
                return;
            };
            if (novels.some(data => data === AbortSymbol)) return;

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
