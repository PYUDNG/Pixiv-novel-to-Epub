import { PixivAPIResponse } from "../../types";
import { Nullable } from "@/utils";

/**
 * profile/all 响应 body 中的小说 ID 字典
 * 仅包含 key 为小说 ID 的字段，值恒为 null
 */
export type UserProfileAllNovelsDict = Record<string, null>;

export interface UserProfileAllCover {
    urls: {
        "240mw": string;
        "480mw": string;
        "1200x1200": string;
        "128x128": string;
        original: string;
    };
}

export interface UserProfileAllFirstEpisode {
    url: string;
}

/**
 * profile/all 响应 body 中的小说系列条目
 */
export interface UserProfileAllNovelSeries {
    id: string;
    userId: string;
    userName: string;
    profileImageUrl: string;
    xRestrict: number;
    isOriginal: boolean;
    isConcluded: boolean;
    genreId: string;
    title: string;
    /** 系列简介 */
    caption: string;
    language: string;
    tags: string[];
    publishedContentCount: number;
    publishedTotalCharacterCount: number;
    publishedTotalWordCount: number;
    publishedReadingTime: number;
    useWordCount: boolean;
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
    firstEpisode: Nullable<UserProfileAllFirstEpisode>;
    /** 关注数，可能为null */
    watchCount: Nullable<number>;
    maxXRestrict: Nullable<number>;
    cover: UserProfileAllCover;
    coverSettingData: unknown;
    isWatched: boolean;
    isNotifying: boolean;
    aiType: number;
}

export interface UserProfileAllTitleCaptionTranslation {
    workTitle: Nullable<string>;
    workCaption: Nullable<string>;
}

export interface UserProfileAllBookmarkCount {
    public: {
        illust: number;
        novel: number;
        collection: number;
    };
    private: {
        illust: number;
        novel: number;
    };
}

export interface UserProfileAllExternalSiteWorksStatus {
    booth: boolean;
    sketch: boolean;
    vroidHub: boolean;
}

export interface UserProfileAllRequest {
    showRequestTab: boolean;
    showRequestSentTab: boolean;
    postWorks: {
        artworks: unknown[];
        novels: unknown[];
    };
}

/**
 * profile/all 响应中 pick up 区域的小说条目
 */
export interface UserProfileAllPickupNovel {
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
    bookmarkData: Nullable<unknown>;
    bookmarkCount: number;
    isOriginal: boolean;
    marker: unknown;
    titleCaptionTranslation: UserProfileAllTitleCaptionTranslation;
    createDate: string;
    updateDate: string;
    isMasked: boolean;
    aiType: number;
    isUnlisted: boolean;
    visibilityScope: number;
    language: string;
    type: string;
    deletable: boolean;
    draggable: boolean;
    contentUrl: string;
}

/**
 * 非详尽的 /ajax/user/{userId}/profile/all 响应 body 类型
 */
export interface UserProfileAllBody {
    /** 插画 ID 字典，值恒为 null */
    illusts: Record<string, null>;
    /** 漫画 ID 列表 */
    manga: string[];
    /** 小说 ID 字典，值恒为 null */
    novels: UserProfileAllNovelsDict;
    /** 漫画系列列表 */
    mangaSeries: unknown[];
    /** 小说系列列表 */
    novelSeries: UserProfileAllNovelSeries[];
    collections: unknown[];
    collectionIds: unknown[];
    pickup: UserProfileAllPickupNovel[];
    bookmarkCount: UserProfileAllBookmarkCount;
    externalSiteWorksStatus: UserProfileAllExternalSiteWorksStatus;
    request: UserProfileAllRequest;
    shouldShowSensitiveNotice: boolean;
}

/**
 * 非详尽的 /ajax/user/{userId}/profile/all 返回值类型
 */
export type PixivUserProfileAllAPIResponse = PixivAPIResponse<UserProfileAllBody>;
