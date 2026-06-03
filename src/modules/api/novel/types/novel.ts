import { Nullable } from "@/utils";
import { PixivAPIResponse } from "../../types";

export interface NovelAPITags {
    authorId: string;
    isLocked: boolean;
    tags: {
        tag: string;
        locked: boolean;
        deletable: boolean;
        userId: string;
        userName: string;
        translation?: {
            [i18n: string]: string;
        }
    }[];
    writable: boolean;
}

export interface NovelAPINavItem {
    title: string;
    /** 在系列中是第几篇（从1开始） */
    order: number;
    id: string;
    available: boolean;
}

export interface NovelAPINav {
    seriesType: 'novel';
    seriesId: number;
    title: string;
    isConcluded: boolean;
    isReplaceable: boolean;
    isWatched: boolean;
    isNotifying: boolean;
    /** 当前在系列中是第几篇（从1开始） */
    order: number;
    prev: Nullable<NovelAPINavItem>;
    next: Nullable<NovelAPINavItem>;
}

export interface NovelAPIUserNovel {
    id: string;
    title: string;
    xRestrict: number;
    restrict: number;
    /** 封面图URL */
    url: string;
    tags: string[];
    userId: string;
    userName: string;
    profileImageUrl: string;
    textCount: number;
    wordCount: number;
    readingTime: number;
    description: string;
    isBookmarkable: boolean;
    isOriginal: boolean;
    createDate: string;
    updateDate: string;
    aiType: number;
    seriesId: string;
    seriesTitle: string;
    /** 在系列中是第几篇（从1开始） */
    seriesContentOrder: number;
    language: string;
}

export interface NovelAPIExtraData {
    meta: NovelAPIExtraMeta;
}

export interface NovelAPIExtraMeta {
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
}
export interface NovelEmbeddedImage {
    novelImageId: string;
    sl: string;
    urls: {
        '240mw': string;
        '480mw': string;
        '1200x1200': string;
        '128x128': string;
        'original': string;
    }
}

/**
 * 非详尽的 pixiv novel api 返回值 body 类型
 */
export interface NovelAPIBody {
    bookmarkCount: number;
    commentCount: number;
    createDate: string;
    uploadDate: string;
    description: string;
    id: string;
    title: string;
    likeCount: number;
    pageCount: number;
    userId: string;
    userName: string;
    viewCount: number;
    isOriginal: boolean;
    xRestrict: number;
    restrict: number;
    content: string;
    coverUrl: string;
    isBookmarkable: boolean;
    tags: NovelAPITags;
    seriesNavData: Nullable<NovelAPINav>;
    userNovels: { [id: string]: Nullable<NovelAPIUserNovel> };
    extraData: NovelAPIExtraData;
    language: string;
    textEmbeddedImages: { [id: string]: NovelEmbeddedImage };
    commentOff: boolean;
    characterCount: number;
    wordCount: number;
    readingTime: number;
    aiType: number;
};

/**
 * 非详尽的 pixiv novel api 返回值类型
 */
export type PixivNovelAPIResponse = PixivAPIResponse<NovelAPIBody>;
