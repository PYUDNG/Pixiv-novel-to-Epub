import i18n, { i18nKeys } from "@/i18n";
import { defineModule } from "../types";
import { $CrE, createShadowApp, detectDom, isPixivDark, Nullable } from "@/utils";
import DownloadButton from "@/components/download-button.vue";
import { downloadSeries, downloadWithUI } from "../downloader";
import { GM_registerMenuCommand, GM_unregisterMenuCommand } from "$";
import { ComponentProps } from "vue-component-type-helpers";
import { reactive, watch } from "vue";

const { t } = i18n.global;
const $series = i18nKeys.$series;

export default defineModule({
    id: 'series',
    checkers: {
        type: 'regpath',
        value: /\/novel\/series\/\d+/
    },
    async enter() {
        // 获取小说信息
        const id = location.pathname.match(/\/novel\/series\/(\d+)/)![1];

        // 响应式按钮props
        const props: ComponentProps<typeof DownloadButton> = reactive({
            label: t($series.$download),
            callback: () => download(),
            status: 'regular',
        });

        // 当页面结构加载完毕时，创建下载按钮
        detectDom('main > section > div:first-child > div:last-child:nth-of-type(3)').then(async () => {
            const toolbar = await detectDom('main > section section');
            const host = toolbar.appendChild($CrE('div'));
            const { container } = await createShadowApp(DownloadButton, {
                host, props,
                options: {
                    app: {
                        classes: isPixivDark.value ? ['dark'] : [],
                    }
                },
            });
            watch(isPixivDark, dark => dark ? container.classList.add('dark') : container.classList.remove('dark'));
        });

        // 创建脚本菜单
        this.context!.downloadMenuId = GM_registerMenuCommand(t($series.$download), () => download());

        async function download() {
            props.status = 'loading';
            await downloadWithUI(downloadSeries, id);
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
