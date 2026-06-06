import { GM_registerMenuCommand } from "$";
import i18n, { i18nKeys } from "@/i18n";
import { defineModule } from "../types";
import { clearCache } from "./request";
import { alert, isPixivDark } from "@/utils";

const { t } = i18n.global;
const $api = i18nKeys.$api;

export default defineModule({
    id: 'api',
    name: 'api',
});

export * from './request';
export * from './novel';

// 创建脚本菜单：清空缓存
GM_registerMenuCommand(t($api.$clearCache), () => {
    clearCache();
    alert(t($api.$cacheCleared.$content), {
        header: t($api.$cacheCleared.$header),
        dark: isPixivDark,
    });
});
