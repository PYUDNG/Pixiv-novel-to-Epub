import { SingleOrArray } from "@/utils";
import { api } from "./request";

/**
 * 单本小说
 * @param id 小说ID
 * @see https://www.pixiv.net/ajax/novel/18673574
 */
export const novel = (id: number | string) => api(`/ajax/novel/${id}`);

/**
 * 小说专属插图  
 * 即专门为小说绘制的插图，非引用已有单独发布过的插图
 * @param novelId 小说ID
 * @param illustIds 插图ID或其数组
 * @param lang 语言代码
 * @see https://www.pixiv.net/ajax/novel/7522350/insert_illusts?id%5B%5D=60139778-1&lang=zh&version=1efff679631a40a674235820806f7431d67065d9
 */
export const insertIllusts = (
    novelId: number | string,
    illustIds: SingleOrArray<string>,
    lang = 'zh'
) => {
    const pathname = `/ajax/novel/${novelId}/insert_illusts`;
    const query: Record<string, string> = { lang };
    if (Array.isArray(illustIds)) {
        for (let i = 0; i < illustIds.length; i++) {
            const id = illustIds[i];
            query[`id[${i}]`] = id;
        }
    } else {
        query[`id[]`] = illustIds;
    }
    return api(pathname, query);
};

/**
 * 系列小说信息
 * @param id 系列ID
 * @see https://www.pixiv.net/ajax/novel/series/9649276?lang=zh&version=a48f2f681629909b885608393916b81989accf5b
 */
export const series = (id: number | string, lang = 'zh') => api(`/ajax/novel/series/${id}`, { lang });

/**
 * 系列小说目录
 * @param id 系列ID
 * @param limit 每页多少篇，建议不要改
 * @param last_order 从第几篇开始（0-based，included）
 * @param order_by 未知，建议不要改
 * @see https://www.pixiv.net/ajax/novel/series_content/9649276?limit=30&last_order=0&order_by=asc
 */
export const seriesContent = (
    id: number | string,
    limit: string | number = 30,
    lastOrder: string | number = 0,
    orderBy: string = 'asc'
) => api(`/ajax/novel/series_content/${id}`, {
    limit: limit.toString(),
    last_order: lastOrder.toString(),
    order_by: orderBy
});
