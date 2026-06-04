import { AbortSymbol, globalLogger, htmlEncode, Queue, requestBlob } from "@/utils";
import { NovelAPIBody } from "../api/novel/types";
import i18n, { i18nKeys } from "@/i18n";
import jEpub from "jepub";
import { insertIllusts } from "../api";

// 网络常量配置
const PIXIV_HOST = 'www.pixiv.net';
const PIXIV_DEFAULT_REFERRER = 'https://www.pixiv.net';

/** 包括初始尝试和所有重试在内，最大尝试次数 */
const MAX_REQUEST_TRIES = 3;

const logger = globalLogger.withPath('downloader');
const { t } = i18n.global;
const $downloader = i18nKeys.$downloader;

/**
 * 下载blob资源的队列
 */
const queueBlob = new Queue({
    max: 5,
    sleep: 0,
});

/**
 * 异步任务选项
 */
export interface AsyncOptions {
    /**
     * 异步任务终止信号
     */
    signal?: AbortSignal;

    /**
     * 任务产生进度回调
     */
    onProgress?: Function;

    /**
     * 任务完成回调
     */
    onComplete?: Function;
}

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
}

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

    // 最长允许连续4个换行符（视觉上是3个空行）
    html = html.replaceAll(/\n{4,}/g, '\n'.repeat(4));

    // 解析换行和 '[newpage]'
    // 每一行用一个<p>包裹
    // 每一页用一个<div class="ChapterBlockMarker">包裹
    const pageCounter = (start => () => start++) (1);
    html = html.split('[newpage]').map(subContent => {
        // Split html into pages and wrap each page's lines into <p>s
        return subContent.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<br>').join('\n');
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
        html = data.tags.tags.map(tag => {
            const htmlLabel = htmlEncode(tag.tag);
            const htmlUrl = htmlEncode(`https://www.pixiv.net/tags/${ encodeURI(tag.tag) }/novels?ur=1`);
            return `<div><a href="${ htmlUrl }">${ htmlLabel }</a></div>\n`;
        }).join() + html;
    }

    // 在开头处添加link
    if (link) {
        const htmlUrl = htmlEncode(data.extraData.meta.canonical);
        const htmlAnchor = `<a href="${ htmlUrl }">${ htmlUrl }</a>`
        html = `<div>${ t($downloader.$epub.$link, { link: htmlAnchor }) }</div>\n` + html;
    }

    // 在开头处添加描述
    if (desc) {
        let description = data.description;
        description = description
            .replace(/(<br \/>)+/g, '<br>').split('<br>')
            .filter(line => line.trim().length)
            .map(line => `<p>${line}</p>`)
            .join('\n');
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
 * @param epub 小说实例
 * @param images 图片列表
 * @param signal 请求终止信号
 */
export async function loadImages(epub: jEpub, images: NovelImage[], { signal, onProgress, onComplete }: AsyncOptions = {}) {
    await Promise.all(images.map(async image => {
        switch (image.type) {
            case 'cover':
            case 'embedded': {
                const blob = await getPixivBlob(image.url, signal);
                if (blob === AbortSymbol) return;
                epub.image(blob, image.epubImageId);
                onProgress?.();
                break;
            }
            case 'inserted': {
                const data = await insertIllusts(image.novelId, image.id);
                if (data === AbortSymbol) return;
                const blob = await getPixivBlob(data.body[image.id].illust.images.original);
                if (blob === AbortSymbol) return;
                epub.image(blob, image.epubImageId);
                onProgress?.();
                break;
            }
        }
    }));
    onComplete?.();
}

/**
 * 为Epub加载并添加封面
 * @param epub 小说实例
 * @param url 封面图url
 * @param signal 请求终止信号
 */
export async function loadCover(epub: jEpub, url: string, { signal, onProgress, onComplete }: AsyncOptions = {}): Promise<void> {
    const blob = await getPixivBlob(url, signal);
    if (blob === AbortSymbol) return;
    epub.cover(blob);
    onProgress?.();
    onComplete?.();
}

/**
 * 从pixiv服务器加载blob资源
 * @param url 请求网址
 * @param signal 请求终止信号
 */
async function getPixivBlob(url: string, signal?: AbortSignal): Promise<Blob | typeof AbortSymbol > {
    // 带错误重试的网络请求：默认重试，不需要重试时使用break跳出
    for (let n = 1; n <= MAX_REQUEST_TRIES; n++) {
        try {
            return await queueBlob.enqueue(
                () => requestBlob({
                    method: 'GET', url,
                    headers: {
                        referrer: location.host === PIXIV_HOST ? location.href : PIXIV_DEFAULT_REFERRER,
                        host: PIXIV_HOST,
                    },
                }, signal),
                signal,
            );
        } catch(err) {
            // 主动取消时跳出重试逻辑
            if (err === AbortSymbol) return AbortSymbol;
        }
    }

    // 尝试次数用尽也没有成功，抛出错误
    throw new Error(`error fetching blob: ${ url }`);
}

function escJsStr(str: string) {
    return JSON.stringify(str);
}