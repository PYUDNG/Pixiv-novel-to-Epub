import { api } from "../request";
import type {
    PixivUserProfileAllAPIResponse,
    PixivUserProfileNovelsAPIResponse,
    PixivUserNovelsBookmarksAPIResponse,
} from "./types";

/**
 * 获取作者 profile 页面的全部作品列表（小说、插画、漫画、系列）
 * @param userId 作者用户ID
 * @param signal 请求终止信号
 * @see https://www.pixiv.net/ajax/user/{userId}/profile/all
 */
export const userProfileAll = (
    userId: number | string,
    signal?: AbortSignal,
) =>
    api<PixivUserProfileAllAPIResponse>(
        `/ajax/user/${userId}/profile/all`,
        { sensitiveFilterMode: 'userSetting' },
        signal,
    );

/**
 * 获取作者全部小说的详细信息
 * @param userId 作者用户ID
 * @param ids 需要获取详细信息的全部小说ID列表
 * @param signal 请求终止信号
 * @see https://www.pixiv.net/ajax/user/{userId}/profile/novels
 */
export const userProfileNovels = (
    userId: number | string,
    ids: (string | number)[],
    signal?: AbortSignal,
) => {
    const params: Record<string, string> = {};
    for (let i = 0; i < ids.length; i++) {
        params[`ids[${i}]`] = ids[i].toString();
    }
    return api<PixivUserProfileNovelsAPIResponse>(
        `/ajax/user/${userId}/profile/novels`,
        params,
        signal,
    );
};

/**
 * userNovelsBookmarks API search params
 */
export interface UserNovelsBookmarksOptions {
    /**
     * 按照标签筛选
     */
    tag?: string;

    /**
     * 分页offset
     */
    offset?: number;

    /**
     * 分页中，每页多少作品；根据pixiv网页端，应该为30
     */
    limit?: 30;

    /**
     * 公开收藏 / 匿名收藏
     */
    rest?: 'show' | 'hide';

    /**
     * 排序方式
     */
    order?: 'desc';

    /**
     * 全年龄 / R18
     */
    mode?: 'all' | 'safe' | 'r18';

    /**
     * API返回语言
     */
    lang?: string;
}

export const UserNovelsBooksmarksDefaultOptions: Required<UserNovelsBookmarksOptions> = {
    tag: '',
    offset: 0,
    limit: 30,
    rest: 'show',
    order: 'desc',
    mode: 'all',
    lang: 'zh',
};

/**
 * 获取用户小说收藏
 * @param userId 用户ID
 * @param options 获取选项
 * @param signal 请求终止信号
 * @see https://www.pixiv.net/ajax/user/{userId}/novels/bookmarks
 */
export const userNovelsBookmarks = (
    userId: number | string,
    options: UserNovelsBookmarksOptions = UserNovelsBooksmarksDefaultOptions,
    signal?: AbortSignal,
) => {
    const params = Object.assign({}, UserNovelsBooksmarksDefaultOptions, options);
    return api<PixivUserNovelsBookmarksAPIResponse>(
        `/ajax/user/${userId}/novels/bookmarks`,
        { ...params },
        signal,
    );
};
