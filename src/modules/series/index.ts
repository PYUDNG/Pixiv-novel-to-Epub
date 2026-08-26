import i18n, { i18nKeys } from "@/i18n";
import { defineModule } from "../types";
import { $CrE, createShadowApp, detectDom, isPixivDark, Nullable } from "@/utils";
import DownloadButton from "@/components/download-button.vue";
import { downloadSeries, downloadWithUI } from "../downloader";
import { GM_registerMenuCommand, GM_unregisterMenuCommand } from "$";
import { ComponentProps } from "vue-component-type-helpers";
import { reactive, watch } from "vue";
import type { App } from "vue";

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

        const controller = new AbortController();
        this.context!.controller?.abort();
        this.context!.controller = controller;
        const { signal } = controller;

        // 创建脚本菜单
        this.context!.downloadMenuId = GM_registerMenuCommand(t($series.$download), () => download());

        async function download() {
            props.status = 'loading';
            await downloadWithUI(downloadSeries, id);
            props.status = 'finished';
        }

        // 当页面结构加载完毕时，创建下载按钮（异步链可被 leave 通过 signal 终止）
        detectDom('main > section > div:first-child > div:last-child:nth-of-type(3)', { signal })
            .then(async () => {
                const toolbar = await detectDom('main > section section', { signal });
                const host = this.context!.host = toolbar.appendChild($CrE('div'));
                const { container, app } = await createShadowApp(DownloadButton, {
                    host, props,
                    options: {
                        app: {
                            classes: isPixivDark.value ? ['dark'] : [],
                        }
                    },
                });
                if (signal.aborted) {
                    // 创建完成后才发现已被终止，立即清理
                    app.unmount();
                    host.remove();
                    return;
                }
                this.context!.app = app;
                // 停止上一次的暗色模式监听，避免回调闭包持有已卸载的container造成泄漏
                this.context!.darkWatch?.();
                this.context!.darkWatch = watch(isPixivDark, dark => dark ? container.classList.add('dark') : container.classList.remove('dark'));
            })
            .catch(err => {
                // 被外部终止时静默退出；其余错误保持原有行为
                if (!signal.aborted) throw err;
            });
    },
    leave() {
        // 终止本次进入的全部在途异步链（含未完成的 detectDom 观察）
        this.context!.controller?.abort();
        this.context!.controller = null;
        this.context!.downloadMenuId !== null &&
            GM_unregisterMenuCommand(this.context!.downloadMenuId);
        this.context!.app?.unmount();
        this.context!.host?.remove();
        // 停止暗色模式监听，释放对已卸载container的引用
        this.context!.darkWatch?.();
        // 重置context，避免陈旧引用残留
        this.context!.downloadMenuId = null;
        this.context!.app = null;
        this.context!.host = null;
        this.context!.darkWatch = null;
    },
    context: {
        controller: null as Nullable<AbortController>,
        downloadMenuId: null as Nullable<number | string>,
        host: null as Nullable<HTMLElement>,
        app: null as Nullable<App>,
        darkWatch: null as Nullable<() => void>,
    },
});
