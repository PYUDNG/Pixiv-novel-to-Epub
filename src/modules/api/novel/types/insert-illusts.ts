import { PixivAPIResponse } from "../../types";

export interface InsertIllustIllust {
    description: string;
    images: {
        medium: string;
        small: string;
        original: string;
    };
    isLoginOnly: boolean;
    restrict: number;
    tags: {
        tag: string;
        userId: string;
    }[];
    /** 只是一个普通的描述性文本，不代表小说的标题 */
    title: string;
    xRestrict: number;
}

export interface InsertIllustUser {
    id: string;
    image: string;
    name: string;
}

export interface InsertIllustData {
    /** 注意这个id和 {@link InsertIllustsAPIBody} 中用作键的id不同，这个id不带`-n`后缀 */
    id: string;
    visible: boolean;
    illust: InsertIllustIllust;
    page: number;
    user: InsertIllustUser;
}

export interface InsertIllustsAPIBody {
    [idNum: string]: InsertIllustData;
}

/**
 * 非详尽的 pixiv insert_illusts api 返回值类型
 */
export type PixivInsertIllustsAPIResponse = PixivAPIResponse<InsertIllustsAPIBody>;
