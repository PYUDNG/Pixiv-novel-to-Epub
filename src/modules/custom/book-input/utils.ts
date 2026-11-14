import { series, seriesContent, userNovelsBookmarks, UserNovelsBooksmarksDefaultOptions } from "@/modules/api";
import { SeriesContentAPIPageItem } from "@/modules/api/novel/types";
import { PixivUserNovelsBookmarksAPIResponse } from "@/modules/api/user/types";
import { AbortSymbol } from "@/utils";

/**
 * 获取系列小说的全部章节id数组
 * @param id 系列ID
 * @param signal 请求终止信号
 * @returns 系列小说id数组
 */
export async function getSeriesNovels(
    id: string | number,
    signal?: AbortSignal,
): Promise<string[] | typeof AbortSymbol> {
    // 系列数据
    const info = await series(id);
    if (info === AbortSymbol) return AbortSymbol;

    // 系列目录
    const promises: Promise<typeof AbortSymbol | SeriesContentAPIPageItem[]>[] = [];
    for (let i = 0; i < info.body.publishedContentCount; i += 30) {
        const promise = (async () => {
            const d = await seriesContent(id, 30, i, undefined, signal);
            if (d === AbortSymbol) return AbortSymbol;
            return d.body.page.seriesContents;
        }) ();
        promises.push(promise);
    }
    const results = await Promise.all(promises);
    if (results.some(val => val === AbortSymbol)) return AbortSymbol;
    return (results as SeriesContentAPIPageItem[][]).reduce<string[]>(
        (ids, items) => {
            ids.push(...items.map(item => item.id));
            return ids;
        }, []
    );
}

/**
 * 获取用户收藏小说id数组
 * @param id 用户ID
 * @param visibility 公开收藏 / 非公开收藏
 * @param signal 请求终止信号
 * @returns 收藏小说id数组
 */
export async function getUserNovelBookmarks(
    id: string | number,
    visibility: 'public' | 'private',
    signal?: AbortSignal,
): Promise<string[] | typeof AbortSymbol> {
    const rest = visibility === 'public' ? 'show' : 'hide';
    let offset = 0;

    // 获取第一页，根据第一页内容取得每页作品数量
    const firstPage = await userNovelsBookmarks(id, { offset, rest });
    if (firstPage === AbortSymbol) return AbortSymbol;
    if (firstPage.body.works.length === 0) return AbortSymbol;
    const step = UserNovelsBooksmarksDefaultOptions.limit;
    const total = firstPage.body.total;

    // 并行取得后续所有页内容
    const promises: ReturnType<typeof userNovelsBookmarks>[] = [];
    for (offset = step; offset < total; offset += step) {
        promises.push(userNovelsBookmarks(id, { offset, rest }, signal));
    }
    const data = await Promise.all(promises);
    if (data.some(page => page === AbortSymbol)) return AbortSymbol;
    const pages = data as PixivUserNovelsBookmarksAPIResponse[];

    // 将所有页所有作品转化为字符串id列表返回
    const ids: string[] = [];
    [firstPage, ...pages].forEach(page => page.body.works.forEach(work => ids.push(work.id)));
    return ids;
}
