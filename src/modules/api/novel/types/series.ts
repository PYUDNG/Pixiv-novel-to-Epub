import { PixivAPIResponse } from "../../types";

export interface SeriesAPIExtraData {
    meta: SeriesAPIExtraMeta;
}

export interface SeriesAPIExtraMeta {
    title: string;
    /** 小说的caption，但是过长的内容会被...省略 */
    description: string;
    canonical: string;
    descriptionHeader: string;
    ogp: {
        /** 小说的caption，但是过长的内容会被...省略 */
        description: string;
        image: string;
        title: string;
        type: string;
    };
    twitter: {
        /** 小说的caption，但是过长的内容会被...省略 */
        description: string;
        image: string;
        title: string;
        card: string;
        site: string;
    };
}

/**
 * 非详尽的 pixiv novel series api 返回值 body 类型
 */
export interface SeriesAPIBody {
    id: string;
    userId: string;
    userName: string;
    profileImageUrl: string;
    xRestrict: number;
    isOriginal: boolean;
    isConcluded: boolean;
    title: string;
    /** 相当于description */
    caption: string;
    language: string;
    tags: string[];
    publishedContentCount: number;
    publishedTotalCharacterCount: number;
    publishedTotalWordCount: number;
    publishedReadingTime: number;
    lastPublishedContentTimestamp: number;
    createdTimestamp: number;
    updatedTimestamp: number;
    createDate: string;
    updateDate: string;
    firstNovelId: string;
    latestNovelId: string;
    displaySeriesContentCount: number;
    shareText: string;
    total: number;
    firstEpisode: {
        /** 第一章封面图 */
        url: string;
    };
    cover: {
        urls: {
            "240mw": string;
            "480mw": string;
            "1200x1200": string;
            "128x128": string;
            "original": string;
        };
    };
    aiType: number;
    extraData: SeriesAPIExtraData;
}

/**
 * 非详尽的 pixiv novel series api 返回值类型
 */
export type PixivSeriesAPIResponse = PixivAPIResponse<SeriesAPIBody>;
