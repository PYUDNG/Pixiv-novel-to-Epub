import { series, seriesContent, userNovelsBookmarks } from "@/modules/api";
import { SeriesContentAPIPageItem } from "@/modules/api/novel/types";
import { UserNovelsBookmarksWork } from "@/modules/api/user/types";
import { AbortSymbol } from "@/utils";

/**
 * 获取系列小说的全部章节id数组
 * @param id 系列ID
 * @returns 系列小说id数组
 */
export async function getSeriesNovels(
    id: string | number,
): Promise<string[] | typeof AbortSymbol> {
    // 系列数据
    const info = await series(id);
    if (info === AbortSymbol) return AbortSymbol;

    // 系列目录
    const promises: Promise<typeof AbortSymbol | SeriesContentAPIPageItem[]>[] = [];
    for (let i = 0; i < info.body.publishedContentCount; i += 30) {
        const promise = (async () => {
            const d = await seriesContent(id, 30, i, undefined);
            if (d === AbortSymbol) return AbortSymbol;
            return d.body.page.seriesContents;
        }) ();
        promises.push(promise);
    }
    const results = await Promise.all(promises);
    if (results.some(val => val === AbortSymbol)) return [];
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
 * @returns 收藏小说id数组
 */
export async function getUserNovelBookmarks(
    id: string | number,
    visibility: 'public' | 'private',
): Promise<string[] | typeof AbortSymbol> {
    const works: UserNovelsBookmarksWork[] = [];
    for (let offset = 0;;) {
        const rest = visibility === 'public' ? 'show' : 'hide';
        const page = await userNovelsBookmarks(id, {
            offset, rest,
        });
        if (page === AbortSymbol) return [];
        works.push(...page.body.works);
        if (works.length >= page.body.total) break;
    }
    return works.map(work => work.id);
}
