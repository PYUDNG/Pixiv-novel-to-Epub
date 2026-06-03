import i18n, { i18nKeys } from "@/i18n";
import { defineModule } from "../types";
import { $CrE, createShadowApp, detectDom, getUrlArgv, globalLogger, isPixivDark } from "@/utils";
import DownloadButton from "@/components/download-button.vue";
import { downloadNovel } from "../downloader";

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

        // 创建下载按钮
        const toolbar = await detectDom('main>section section');
        const host = toolbar.appendChild($CrE('div'));
        createShadowApp(DownloadButton, {
            host: host,
            options: {
                app: {
                    classes: isPixivDark.value ? ['dark'] : [],
                }
            },
            props: {
                label: t($novel.$download),
                callback: () => downloadNovel(id),
            },
        });
    }
});
