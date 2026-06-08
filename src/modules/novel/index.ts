import i18n, { i18nKeys } from "@/i18n";
import { defineModule } from "../types";
import { $CrE, createShadowApp, detectDom, getUrlArgv, globalLogger, isPixivDark, Nullable } from "@/utils";
import DownloadButton from "@/components/download-button.vue";
import { downloadNovel, downloadWithUI } from "../downloader";
import { GM_registerMenuCommand, GM_unregisterMenuCommand } from "$";
import { ComponentProps } from "vue-component-type-helpers";
import { reactive } from "vue";

const { t } = i18n.global;
const $novel = i18nKeys.$novel;
const logger = globalLogger.withPath('novel');

export default defineModule({
    id: 'novel',
    checkers: {
        type: 'path',
        value: '/novel/show.php'
    },
    async enter() {
        // 获取小说信息
        const id = getUrlArgv('id');
        if (!id) {
            logger.simple('Error', 'url search param "id" not found');
            return;
        }
        
        // 响应式按钮props
        const props: ComponentProps<typeof DownloadButton> = reactive({
            label: t($novel.$download),
            callback: () => download(),
            status: 'regular',
        });

        // 创建下载按钮
        detectDom('main > section > div:first-child > div:last-child:first-child > div:last-child:nth-of-type(2)').then(async () => {
            const toolbar = await detectDom('main > section section');
            const host = toolbar.appendChild($CrE('div'));
            createShadowApp(DownloadButton, {
                host, props,
                options: {
                    app: {
                        classes: isPixivDark.value ? ['dark'] : [],
                    }
                },
            });
        });

        // 创建脚本菜单
        this.context!.downloadMenuId = GM_registerMenuCommand(t($novel.$download), () => download());

        async function download() {
            props.status = 'loading';
            await downloadWithUI(downloadNovel, id!);
            props.status = 'finished';
        }
    },
    leave() {
        this.context!.downloadMenuId !== null &&
            GM_unregisterMenuCommand(this.context!.downloadMenuId);
    },
    context: {
        downloadMenuId: null as Nullable<number | string>,
    },
});
