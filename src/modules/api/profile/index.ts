import { api } from "../request";
import type {
    PixivUserProfileAllAPIResponse,
    PixivUserProfileNovelsAPIResponse,
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
