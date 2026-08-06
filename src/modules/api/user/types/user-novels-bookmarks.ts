import { Nullable } from "@/utils";
import { PixivAPIResponse } from "../../types";

export interface UserNovelsBookmarksTitleCaptionTranslation {
    workTitle: Nullable<string>;
    workCaption: Nullable<string>;
}

export interface UserNovelsBookmarksWorkBookmarkData {
    id: string;
    private: boolean;
}

/**
 * novels/bookmarks 响应 works 中的单个小说条目
 */
export interface UserNovelsBookmarksWork {
    id: string;
    title: string;
    genre: string;
    xRestrict: number;
    restrict: number;
    url: string;
    tags: string[];
    userId: string;
    userName: string;
    profileImageUrl: string;
    textCount: number;
    wordCount: number;
    readingTime: number;
    useWordCount: boolean;
    description: string;
    isBookmarkable: boolean;
    bookmarkData: Nullable<UserNovelsBookmarksWorkBookmarkData>;
    bookmarkCount: number;
    isOriginal: boolean;
    marker: unknown;
    titleCaptionTranslation: UserNovelsBookmarksTitleCaptionTranslation;
    createDate: string;
    updateDate: string;
    isMasked: boolean;
    aiType: number;
    /** 若属于某系列则有值 */
    seriesId?: string;
    /** 若属于某系列则有值 */
    seriesTitle?: string;
    /** 若属于某系列则有值，在系列中是第几篇（从1开始） */
    seriesContentOrder?: number;
    isUnlisted: boolean;
    visibilityScope: number;
    language: string;
}

export interface UserNovelsBookmarksExtraMeta {
    title: string;
    description: string;
    canonical: string;
    descriptionHeader: string;
    ogp: {
        description: string;
        image: string;
        title: string;
        type: string;
    };
    twitter: {
        description: string;
        image: string;
        title: string;
        card: string;
    };
    alternateLanguages: Record<string, string>;
}

export interface UserNovelsBookmarksExtraData {
    meta: UserNovelsBookmarksExtraMeta;
}

/**
 * 非详尽的 /ajax/user/{userId}/novels/bookmarks 响应 body 类型
 */
export interface UserNovelsBookmarksBody {
    extraData: UserNovelsBookmarksExtraData;
    /** 共有多少收藏的小说 */
    total: number;
    /** 收藏的小说列表 */
    works: UserNovelsBookmarksWork[];
}

/**
 * 非详尽的 /ajax/user/{userId}/novels/bookmarks 返回值类型
 */
export type PixivUserNovelsBookmarksAPIResponse = PixivAPIResponse<UserNovelsBookmarksBody>;