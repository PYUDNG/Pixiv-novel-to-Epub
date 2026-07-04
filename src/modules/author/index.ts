import i18n, { i18nKeys } from "@/i18n";
import { defineModule } from "../types";
import { confirm, type Nullable } from "@/utils";
import { downloadAuthor, downloadWithUI } from "../downloader";
import { GM_registerMenuCommand, GM_unregisterMenuCommand } from "$";

const { t } = i18n.global;
const $author = i18nKeys.$author;

export default defineModule({
    id: 'author',
    checkers: {
        type: 'regpath',
        value: /^\/users\/\d+(\/|$)/
    },
    async enter() {
        // 获取作者信息
        const id = location.pathname.match(/\/users\/(\d+)/)![1];

        // 创建脚本菜单
        this.context!.downloadMenuId = GM_registerMenuCommand(t($author.$download), () => download());

        async function download() {
            if (!await confirm(t($author.$confirm))) return;
            await downloadWithUI(downloadAuthor, id);
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
