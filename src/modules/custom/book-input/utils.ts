import { series, seriesContent } from "@/modules/api";
import { SeriesContentAPIPageItem } from "@/modules/api/novel/types";
import { AbortSymbol } from "@/utils";

/**
 * 获取系列小说的全部章节id数组
 * @param id 系列ID
 * @returns 
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