import { AbortSymbol, escapeFilename, globalLogger, htmlEncode, saveAs } from "@/utils";
import { NovelAPIBody } from "../api/novel/types";
import i18n, { i18nKeys } from "@/i18n";
import jEpub from "jepub";
import { insertIllusts, novel } from "../api";
import { AysncProgressYields, escJsStr, getPixivBlob, toEpubHTML, withProgressYields } from "./utils";

const logger = globalLogger.withPath('downloader');
const { t } = i18n.global;
const $downloader = i18nKeys.$downloader;

export type NovelImage = ({
    /** 小说封面图 */
    type: 'cover',
    /** 图片url */
    url: string;
} | {
    /** 专门为小说上传的插图，使用API数据的`.textEmbeddedImages`可以获取到url */
    type: 'embedded';
    /** 图片url */
    url: string;
} | {
    /** 在Pixiv单独发布过的插画，需要调用`insert_illusts`获取url */
    type: 'inserted';
    /** 图片PixivID */
    id: string;
    /** 小说PixivID */
    novelId: string;
}) & {
    /** 在Epub中的标记ID */
    epubImageId: string;
};

export type jEpubAddParams = {
    title: string;
    content: string;
};

export interface ParsedNovelContent {
    /**
     * html格式的带格式内容
     */
    html: string;

    /**
     * 小说的标题
     */
    title: string;

    /**
     * 小说配图列表
     */
    images: NovelImage[];
}

export interface ParseOptions {
    /**
     * 是否在开头处添加封面图
     * @default true
     */
    cover?: boolean;
    
    /**
     * 是否在开头处添加描述
     * @default true
     */
    desc?: boolean;
    
    /**
     * 是否在开头处添加小说链接
     * @default true
     */
    link?: boolean;
    
    /**
     * 是否在开头处添加tags
     * @default true
     */
    tags?: boolean;
}

/**
 * 根据小说API数据，解析内容和资源  
 * 不进行网络请求和资源获取，仅解析
 * @param data 小说API数据body
 */
export function parseContent(
    data: NovelAPIBody,
    {
        cover = true,
        desc = true,
        link = true,
        tags = true
    }: ParseOptions = {},
): ParsedNovelContent {
    let html = data.content;
    const title = data.title;
    const images: NovelImage[] = [];

    // 解析内嵌图片
    html = html.replace(/\[uploadedimage:([\d\-]+)\]/g, (_: string, id: string) => {
        const epubImageId = `embedded-${ id }`;
        const url = data.textEmbeddedImages[id].urls.original;
        images.push({
            type: 'embedded',
            url, epubImageId,
        });
        return `\n<%= image[${ escJsStr(epubImageId) }] %>\n`;
    });

    // 解析引入图片
    html = html.replace(/\[pixivimage:([\d\-]+)\]/g, (_: string, id: string) => {
        const epubImageId = `inserted-${ id }`;
        images.push({
            type: 'inserted',
            novelId: data.id,
            id, epubImageId,
        });
        return `\n<%= image[${ escJsStr(epubImageId) }] %>\n`;
    });

    // 解析 '[[rb:久世彩葉 > くぜ いろは]]' // 10618179
    html = html.replace(/\[\[rb:([^\[\]]+) *> *([^\[\]]+)\]\]/g, (_, main, desc) => {
        return `<ruby>${htmlEncode(main)}<rp>(</rp><rt>${htmlEncode(desc)}</rt><rp>)</rp></ruby>`;
    });

    // 解析 '[chapter:【プロローグ】]' // 21893883
    html = html.replace(/\[chapter: *([^\]]+)\]/g, (_, chapterName) => {
        return `<h2>${chapterName}</h2>`;
    });

    // 解析 '[[jumpuri:捕虜の待遇に関する千九百四十九年八月十二日のジュネーヴ条約（第三条約)【日本国防衛省ホームページより】 > https://www.mod.go.jp/j/presiding/treaty/geneva/geneva3.html]]' // 19912145#12
    html = html.replace(/\[\[jumpuri:([^\[\]]+) *> *([^\[\]]+)\]\]/g, (_, text, url) => {
        return `<a href=${escJsStr(url)}>${htmlEncode(text)}</a>`;
    });

    // 解析 '[jump:2]' // 22003928
    html = html.replace(/\[jump:(\d+)\]/g, (_, page) => {
        return `<a href=${escJsStr(`#ChapterPage-${page}`)}>Jump to page ${htmlEncode(page)}</a>`;
    });

    // 检查没有解析到的可能的标记
    let markers = Array.from(html.matchAll(/\[+[^\[\]]+\]+/g));
    markers = markers.filter(match => {
        // 已处理的图片会展示为 `<%= image["123456"] %>` 其中也有[]部分会被匹配进来
        // 因此这里需要排除已处理的图片标记
        const pattern = match.input.substring(match.index-9, match.index + match[0].length+3);
        const isImagePattern = pattern.startsWith('<%= image[') && pattern.endsWith('] %>');

        // 排除尚未处理的 [newpage] 标记
        const isNewpagePattern = match[0].includes('[newpage]'); // Why .include (not ===): for matches like '[xxx[[newpage]]]blabla]]'
        return !isImagePattern && !isNewpagePattern;
    });
    if (markers.length) {
        logger.simple('Warning', 'Undealed markers found');
        logger.asLevel('Warning', markers);
    }

    // 解析换行和 '[newpage]'
    // 每一行用一个<p>包裹
    // 每一页用一个<div class="ChapterBlockMarker">包裹
    const pageCounter = (start => () => start++) (1);
    html = html.split('[newpage]').map(subContent => {
        // Split html into pages and wrap each page's lines into <p>s
        return toEpubHTML(subContent);
    }).map(pageHTML => {
        const page = pageCounter();
        const page_id = `ChapterPage-${page}`;

        // Remove <br>s at beggining and ending of each page
        pageHTML = pageHTML.replaceAll(/^(<br>|\s)+/g, '').replaceAll(/(<br>|\s)+$/g, '');

        // Add page number to start and end of each page
        const pageNum = `<div class="ChapterBlockMarker">Page ${page}</div>`;
        pageHTML = `${pageNum}\n${pageHTML}\n${pageNum}`;

        // Wrap each page's html in <div id=pageID>
        return `<div id=${escJsStr(page_id)} class="ChapterContentBlock">\n${pageHTML}\n</div>`;
    }).join('\n');

    // 在开头处添加tags
    if (tags) {
        const htmlAnchors = data.tags.tags.map(tag => {
            const htmlLabel = htmlEncode(tag.tag);
            const htmlUrl = htmlEncode(`https://www.pixiv.net/tags/${ encodeURI(tag.tag) }/novels?ur=1`);
            return `<a href="${ htmlUrl }">${ htmlLabel }</a>`;
        });
        html = `<div>${ htmlAnchors.join(' ') }</div>\n` + html;
    }

    // 在开头处添加link
    if (link) {
        const htmlUrl = htmlEncode(data.extraData.meta.canonical);
        html = `<div>${ t($downloader.$epub.$link, { link: htmlUrl }) }</div>\n` + html;
    }

    // 在开头处添加描述
    if (desc) {
        let description = data.description;
        description = toEpubHTML(description, true);
        description = `<div id="ChapterDescription" class="ChapterContentBlock">${ description }</div>\n`;
        html = description + html;
    }

    // 在开头处添加封面
    if (cover) {
        const epubImageId = `ChapterCover-${ data.id }`;
        html = `\n<%= image[${ escJsStr(epubImageId) }] %>\n` + html;
        images.push({
            type: 'cover',
            url: data.coverUrl,
            epubImageId,
        });
    }

    // Add style
    html = '<style>.ChapterContentBlock { border-bottom: solid; padding: 1em 0; } .ChapterBlockMarker { font-size: 1em; text-align: right; }</style>' + html;

    return { html, title, images };
}

/**
 * 将图片资源加载到小说实例中  
 * 生成器函数，每产生一次进度就yield一次进度对象
 * @param epub 小说实例
 * @param images 图片列表
 * @param yields 进度类型
 * @param signal 请求终止信号
 */
export async function* loadImages<
    Y extends string
>(
    epub: jEpub,
    images: NovelImage[],
    yields: Y,
    signal?: AbortSignal
): AsyncGenerator<AysncProgressYields<Y>, void | typeof AbortSymbol, void> {
    return yield* withProgressYields(
        async (complete, progress) => {
            let finished = 0;
            const results = await Promise.all(images.map(async image => {
                // 根据不同的图片类别进入不同加载逻辑
                switch (image.type) {
                    case 'cover':
                    case 'embedded': {
                        const blob = await getPixivBlob(image.url, signal);
                        if (blob === AbortSymbol) return AbortSymbol;
                        epub.image(blob, image.epubImageId);
                        progress(++finished);
                        break;
                    }
                    case 'inserted': {
                        const data = await insertIllusts(image.novelId, image.id, undefined, signal);
                        if (data === AbortSymbol) return AbortSymbol;
                        const blob = await getPixivBlob(data.body[image.id].illust.images.original, signal);
                        if (blob === AbortSymbol) return AbortSymbol;
                        epub.image(blob, image.epubImageId);
                        progress(++finished);
                        break;
                    }
                }
            }));

            // 如果被取消就返回AbortSymbol，否则返回void
            return complete<typeof AbortSymbol | undefined>(
                results.some(result => result === AbortSymbol) || signal?.aborted ?
                    AbortSymbol : undefined
            );
        },
        images.length,
        yields,
    );
}

/**
 * 为Epub加载并添加封面
 * @param epub 小说实例
 * @param url 封面图url
 * @param yields 进度类型
 * @param signal 请求终止信号
 */
export async function* loadCover<
    Y extends string
>(
    epub: jEpub,
    url: string,
    yields: Y,
    signal?: AbortSignal
): AsyncGenerator<AysncProgressYields<Y>, void | typeof AbortSymbol, void> {
    return yield* withProgressYields(
        async complete => {
            const blob = await getPixivBlob(url, signal);
            if (blob === AbortSymbol || signal?.aborted) return AbortSymbol;
            epub.cover(blob);
            complete();
        },
        1,
        yields,
    );
}

/**
 * 将给定的小说列表按顺序加载到epub中，所有小说作为章节追加到epub末尾并加载好外部资源
 * @param epub jEpub实例
 * @param ids 小说id列表
 * @param yields 进度类型
 * @param signal 终止信号
 */
export async function* loadNovels<
    Y extends string
>(
    epub: jEpub,
    ids: (string | number)[],
    yields: Y,
    signal?: AbortSignal,
): AsyncGenerator<AysncProgressYields<Y>, void | typeof AbortSymbol, void> {
    return yield* withProgressYields(
        async (complete, progress) => {
            // 先加载所有小说的数据
            let finished = 0;
            const params = await Promise.all(ids.map(async id => {
                // 获取小说数据
                const dNovel = await novel(id, signal);
                if (dNovel === AbortSymbol || signal?.aborted) return AbortSymbol;

                // 解析内容
                const { html, images, title } = parseContent(dNovel.body, {
                    cover: true,
                    desc: true,
                    link: true,
                    tags: true,
                });

                // 加载所有封面和插图
                for await (const _ of loadImages(epub, images, 'images', signal)) {}
                
                // 通知已经完成本小说加载
                progress(++finished);

                // 返回epub数据
                return { title, content: html };
            }));

            // 再按顺序将所有加载好的小说追加到epub中
            try {
                // 如果被取消就不追加了
                if (params.some(p => p === AbortSymbol) || signal?.aborted) 
                    return AbortSymbol;
                // 没有取消就全部追加到epub
                else
                    (params as jEpubAddParams[]).forEach(({ title, content }) => epub.add(title, content));
            } finally {
                // 无论如何都要确保进度最终完成
                complete();
            }
        },
        ids.length,
        yields,
    );
}

/**
 * 将epub生成为blob对象  
 * 由于技术原因，此方法不支持使用AbortSignal终止
 * @param epub jEpub实例
 * @param yields 进度类型
 * @returns blob对象
 */
export async function* generateEpub<
    Y extends string
>(
    epub: jEpub,
    yields: Y,
): AsyncGenerator<AysncProgressYields<Y>, Blob | typeof AbortSymbol, void> {
    return yield* withProgressYields(
        async (complete, progress) => {
            const blob = await epub.generate('blob', meta => progress(meta.percent));
            complete();
            return blob;
        },
        100,
        yields,
    );
}

/**
 * 将Blob保存到用户的机器  
 * 由于技术限制，此操作无法终止
 * @param blob blob对象
 * @param filename 文件名
 * @param yields 进度类型
 */
export async function* saveBlob<
    Y extends string
>(
    blob: Blob,
    filename: string,
    yields: Y,
): AsyncGenerator<AysncProgressYields<Y>, void, void> {
    yield* withProgressYields(
        async complete => complete(await saveAs(blob, `${ escapeFilename(filename) }.epub`)),
        1,
        yields,
    )
}
