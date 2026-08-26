import i18n, { i18nKeys } from "@/i18n";
import { defineModule } from "../types";
import { $CrE, createShadowApp, detectDom, getUrlArgv, globalLogger, isPixivDark, Nullable } from "@/utils";
import DownloadButton from "@/components/download-button.vue";
import { downloadNovel, downloadWithUI } from "../downloader";
import { GM_registerMenuCommand, GM_unregisterMenuCommand } from "$";
import { ComponentProps } from "vue-component-type-helpers";
import { reactive, watch } from "vue";
import type { App } from "vue";

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

        const controller = new AbortController();
        this.context!.controller?.abort();
        this.context!.controller = controller;
        const { signal } = controller;

        // 创建下载按钮
        // 由于pixiv可能会先在小说区域UI内部热更新，再重载整个小说区域UI（纯屎山来的，你敢拉我就敢吃），这里要持续监听所有toolbar出现事件
        const attachDownloadButton = async () => {
            try {
                this.context!.app?.unmount();
                this.context!.host?.remove();
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
            } catch (err) {
                // 被终止时静默退出；其余错误保持原有行为
                if (signal.aborted) return;
                throw err;
            }
        };
        this.context!.observer = detectDom({
            selector: 'main > section > div:first-child > div:last-child:first-child > div:last-child:nth-of-type(2)',
            callback: attachDownloadButton,
            signal,
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
        // 终止本次进入的全部在途异步链（含未完成的 detectDom 观察）
        this.context!.controller?.abort();
        this.context!.controller = null;
        this.context!.downloadMenuId !== null &&
            GM_unregisterMenuCommand(this.context!.downloadMenuId);
        this.context!.app?.unmount();
        this.context!.host?.remove();
        this.context!.observer?.disconnect();
        // 停止暗色模式监听，释放对已卸载container的引用
        this.context!.darkWatch?.();
        // 重置context，避免陈旧引用残留
        this.context!.downloadMenuId = null;
        this.context!.app = null;
        this.context!.host = null;
        this.context!.observer = null;
        this.context!.darkWatch = null;
    },
    context: {
        controller: null as Nullable<AbortController>,
        downloadMenuId: null as Nullable<number | string>,
        host: null as Nullable<HTMLElement>,
        app: null as Nullable<App>,
        observer: null as Nullable<MutationObserver>,
        darkWatch: null as Nullable<() => void>,
    },
});
