import { PixivAPIResponse } from "../../types";

export interface SeriesContentAPIPageItem {
    id: string;
    title: string;
    aiType: number;
    bookmarkCount: number;
    characterCount: number;
    isOriginal: boolean;
    readingTime: number;
    restrict: number;
    series: {
        /** 在系列中是第几篇（从1开始） */
        contentOrder: number;
        /** 系列ID */
        id: number;
        viewableType: number;
    };
    tags: string[];
    textLength: number;
    uploadTimestamp: number;
    /** 封面图 */
    url: string;
    userId: string;
    wordCount: number;
    xRestrict: number;
}

export interface SeriesContentAPIThumbnailItem {
    aiType: number;
    bookmarkCount: number;
    createDate: string;
    description: string;
    id: string;
    isMasked: boolean;
    isOriginal: boolean;
    isUnlisted: boolean;
    language: string;
    profileImageUrl: string;
    readingTime: number;
    restrict: number;
    /** 在系列中是第几篇（从1开始） */
    seriesContentOrder: number;
    seriesId: string;
    seriesTitle: string;
    tage: string[];
    textCount: number;
    title: string;
    updateDate: string;
    /** 封面图 */
    url: string;
    userId: string;
    userName: string;
    wordCount: number;
    xRestrict: number;
}

/**
 * 非详尽的 pixiv novel series api 返回值 body 类型
 */
export interface SeriesContentAPIBody {
    page: {
        seriesContents: SeriesContentAPIPageItem[];
    };
    thumbnails: {
        novel: SeriesContentAPIThumbnailItem[];
    };
}

/**
 * 非详尽的 pixiv novel series api 返回值类型
 */
export type PixivSeriesContentAPIResponse = PixivAPIResponse<SeriesContentAPIBody>;
