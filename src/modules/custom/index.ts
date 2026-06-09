import i18n, { i18nKeys } from "@/i18n";
import { defineModule } from "../types";
import { AbortSymbol, alert, getUrlArgv, globalLogger, isPixivDark, Nullable, prompt } from "@/utils";
import { downloadCustom, downloadWithUI } from "../downloader";
import { GM_registerMenuCommand, GM_unregisterMenuCommand } from "$";
import { novel } from "../api";
import { newTask, progress } from "@/utils/helpers/popup/progress";
import MaterialSymbolsDataObject from '~icons/material-symbols/data-object';
import { PixivNovelAPIResponse } from "../api/novel/types";

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

            // 获取所有小说数据
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
                    logger.simple('Error', 'custom download fetch novels data failed');
                    logger.asLevel('Error', err);
                    throw err;
                }
            });
            Promise.all(promises).then(() => {
                p.complete(taskId);
                p.destroy(PROGRESS_UI_DESTROY_DELAY);
            });
            const novels = await Promise.all(promises);
            if (novels.some(data => data === AbortSymbol)) return;

            // 根据小说数据确定文件名
            const filename = await prompt(t($custom.$filename.$content), {
                dark: isPixivDark,
                header: t($custom.$filename.$header),
                seamless: true,
                value: inferCommonName(
                    (novels as PixivNovelAPIResponse[]).map(data => data.body.title), 3
                ) ?? (novels[0] as PixivNovelAPIResponse).body.title,
                aspectRatio: '5/1',
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

/**
 * 从一系列字符串名称中查找并返回它们的最长共同部分  
 * @param names 名称数组
 * @param minLen 最短长度要求，长度小于此数值的共同部分将被忽略；省略此参数时默认为0，即接受任意长度共同部分
 * @returns 最长共同部分（如果有）；null（如果没有找到）
 */
function inferCommonName(names: string[], minLen: number = 0): Nullable<string> {
    // 1. 边界条件：数组为空或长度为0，直接返回 null
    if (!names || names.length === 0) return null;

    // 2. 找出长度最短的字符串作为基准，减少后续穷举的次数
    let shortest = names[0];
    for (const name of names) {
        if (name.length < shortest.length) {
            shortest = name;
        }
    }

    const maxPossibleLen = shortest.length;

    // 3. 从最长可能长度开始向下穷举（外层循环控制子串长度）
    // 长度必须大于等于 minLen 且大于 0
    for (let len = maxPossibleLen; len >= Math.max(minLen, 1); len--) {
        // 内层循环控制子串的起始位置
        for (let start = 0; start <= maxPossibleLen - len; start++) {
            const subStr = shortest.substring(start, start + len);

            // 4. 验证这个子串是否在所有字符串中都存在
            const isCommon = names.every(name => name.includes(subStr));

            // 5. 因为是从最长开始找的，第一个找到的就是“最长公共子串”
            if (isCommon) return subStr;
        }
    }

    // 6. 如果循环结束仍未找到，或者找到的长度小于 minLen，返回 null
    return null;
}
