import { PixivAPIResponse } from "../../types";
import { Nullable } from "@/utils";

export interface UserProfileNovelsTitleCaptionTranslation {
    workTitle: Nullable<string>;
    workCaption: Nullable<string>;
}

export interface UserProfileNovelsBookmarkData {
    id: string;
    private: boolean;
}

/**
 * profile/novels 响应 works 中的单个小说条目
 */
export interface UserProfileNovelsWork {
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
    bookmarkData: Nullable<UserProfileNovelsBookmarkData>;
    bookmarkCount: number;
    isOriginal: boolean;
    marker: unknown;
    titleCaptionTranslation: UserProfileNovelsTitleCaptionTranslation;
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

export interface UserProfileNovelsExtraMeta {
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

export interface UserProfileNovelsExtraData {
    meta: UserProfileNovelsExtraMeta;
}

export interface UserProfileNovelsZoneConfig {
    header: { url: string };
    footer: { url: string };
    [zone: string]: { url: string };
}

/**
 * 非详尽的 /ajax/user/{userId}/profile/novels 响应 body 类型
 */
export interface UserProfileNovelsBody {
    /** 小说 ID → 小说详情的字典 */
    works: Record<string, UserProfileNovelsWork>;
    zoneConfig: UserProfileNovelsZoneConfig;
    extraData: UserProfileNovelsExtraData;
}

/**
 * 非详尽的 /ajax/user/{userId}/profile/novels 返回值类型
 */
export type PixivUserProfileNovelsAPIResponse = PixivAPIResponse<UserProfileNovelsBody>;
