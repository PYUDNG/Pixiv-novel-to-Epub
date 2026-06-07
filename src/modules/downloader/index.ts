import { AbortSymbol, alert, AsyncQueue, escapeFilename, globalLogger, htmlEncode, isPixivDark, mergeAsyncGenerators, saveAs } from "@/utils";
import { novel, series, seriesContent } from "../api";
import { defineModule } from "../types";
import i18n, { i18nKeys } from "@/i18n";
import jEpub from "jepub";
import { v4 as uuid } from "uuid";
import { generateEpub, loadCover, loadImages, loadNovels, parseContent, saveBlob } from "./common";
import { newTask, progress } from "@/utils/helpers/popup/progress";
import MaterialSymbolsDataObject from '~icons/material-symbols/data-object';
import MaterialSymbolsListAltOutline from '~icons/material-symbols/list-alt-outline'
import MaterialSymbolsImageOutline from '~icons/material-symbols/image-outline'
import MaterialSymbolsBook from '~icons/material-symbols/book';
import MaterialSymbolsFileSaveOutline from '~icons/material-symbols/file-save-outline';
import type { Component } from "vue";
import { AysncProgressYields, toEpubHTML, tojEpubLang, withProgressYields } from "./utils";
import { GM_info } from "$";
import { SeriesContentAPIPageItem } from "../api/novel/types";

const PROGRESS_UI_DESTROY_DELAY = 3000;

const logger = globalLogger.withPath('downloader');
const { t } = i18n.global;
const $downloader = i18nKeys.$downloader;
const $progress = $downloader.$progress;

export default defineModule({
    id: 'downloader',
});

/**
 * 下载进度报告类型
 */
export type DownloadProgressType =
    | 'novel-api'
    | 'series-api'
    | 'series-index'
    | 'series-novel'
    | 'cover'
    | 'images'
    | 'generate'
    | 'save';

/**
 * 下载进度报告类型 - 进度UI名称 对照表
 */
export const TypeNameMap: Record<DownloadProgressType, string> = {
    'novel-api': $progress.$novelApi,
    'series-api': $progress.$seriesApi,
    'series-index': $progress.$seriesIndex,
    'series-novel': $progress.$seriesNovel,
    cover: $progress.$cover,
    images: $progress.$images,
    generate: $progress.$generate,
    save: $progress.$save,
};

/**
 * 下载进度报告类型 - 进度UI图标 对照表
 */
export const TypeIconMap: Record<DownloadProgressType, Component> = {
    'novel-api': MaterialSymbolsDataObject,
    'series-api': MaterialSymbolsDataObject,
    'series-index': MaterialSymbolsListAltOutline,
    'series-novel': MaterialSymbolsBook,
    cover: MaterialSymbolsImageOutline,
    images: MaterialSymbolsImageOutline,
    generate: MaterialSymbolsBook,
    save: MaterialSymbolsFileSaveOutline,
};

/**
 * 下载单本小说为Epub
 * @param id 小说ID
 * @param signal 下载终止信号
 * @returns 下载成功true，下载被取消false，出错时直接抛出错误
 */
export async function* downloadNovel(
    id: string | number,
    signal?: AbortSignal
): AsyncGenerator<AysncProgressYields<DownloadProgressType>, boolean, void> {
    // 创建Epub
    const epub = new jEpub();

    // 获取小说数据
    const idData = uuid();
    yield {
        id: idData,
        type: 'novel-api',
        finished: 0,
        total: 1,
    };
    const data = await novel(id, signal);
    if (data === AbortSymbol || signal?.aborted) {
        logger.simple('Info', 'download aborted');
        return false;
    }
    yield {
        id: idData,
        type: 'novel-api',
        finished: 1,
        total: 1,
    };

    // 初始化Epub
    epub.init({
        i18n: tojEpubLang(data.body.language),
        author: data.body.userName,
        publisher: 'pixiv',
        title: data.body.title,
        description: toEpubHTML(data.body.description, true),
        tags: data.body.tags.tags.map(tag => tag.tag),
        customMetadata: [{
            name: 'dc:source',
            value: data.body.extraData.meta.canonical,
            renderInTitlePage(item) {
                const htmlUrl = htmlEncode(item.value);
                return `<div>${ t($downloader.$epub.$link, { link: htmlUrl }) }</div>`;
            },
        }],
    });
    epub.date(new Date(data.body.createDate));
    epub.notes(t($downloader.$epub.$notes, {
        link: htmlEncode(data.body.extraData.meta.canonical),
        scriptUrl: htmlEncode(__GREASYFORK_URL__),
        scriptName: htmlEncode(GM_info.script.name),
        authorUrl: htmlEncode(__GREASYFORK_AUTHOR_URL__),
        authorName: htmlEncode(GM_info.script.author),
    }));

    // 解析内容
    const { html, title, images } = parseContent(data.body, {
        // 单本小说下载，相关信息已经写在书籍属性中了，不需要再单独写一遍
        cover: false,
        desc: false,
        link: false,
        tags: false,
    });

    // 异步操作
    yield* mergeAsyncGenerators<
        AysncProgressYields<DownloadProgressType>, void | typeof AbortSymbol, void
    >(
        // 加载封面图
        loadCover(epub, data.body.coverUrl, 'cover', signal),
        // 加载图片资源
        loadImages(epub, images, 'images', signal),
    );

    // 添加章节内容
    epub.add(title, html);

    // 由于jEpub.generate无法主动终止，因此提前检查下载终止信号
    if (signal?.aborted) {
        logger.simple('Info', 'download aborted');
        return false;
    };

    // 生成Epub文件
    const idEpub = uuid();
    yield {
        id: idEpub,
        type: 'generate',
        finished: 0,
        total: 100,
    };
    const queue = new AsyncQueue<number>();
    const blobPromise = epub
        .generate('blob', meta => queue.push(meta.percent))
        .then(blob => {
            queue.close();
            return blob;
        });
    for await (const percent of queue) yield {
        id: idEpub,
        type: 'generate',
        finished: percent,
        total: 100,
    };
    const blob = await blobPromise;

    // 检查下载终止信号
    if (signal?.aborted) {
        logger.simple('Info', 'download aborted');
        return false;
    };

    // 交付Epub文件
    const idSave = uuid();
    yield {
        id: idSave,
        type: 'save',
        finished: 0,
        total: 1,
    };
    await saveAs(blob, `${ escapeFilename(title) }.epub`);
    yield {
        id: idSave,
        type: 'save',
        finished: 1,
        total: 1,
    };

    return true;
}

/**
 * 下载系列小说为Epub
 * @param id 系列ID
 * @param signal 下载终止信号
 * @returns 下载成功true，下载被取消false，出错时直接抛出错误
 */
export async function* downloadSeries(
    id: string | number,
    signal?: AbortSignal,
): AsyncGenerator<AysncProgressYields<DownloadProgressType>, boolean, void> {
    // 创建Epub
    const epub = new jEpub();

    // 获取系列数据
    const data = yield* withProgressYields(
        async complete => complete(await series(id, undefined, signal)),
        1,
        'series-api',
    );
    if (data === AbortSymbol || signal?.aborted) {
        logger.simple('Info', 'download aborted');
        return false;
    }

    // 初始化epub
    epub.init({
        i18n: tojEpubLang(data.body.language),
        author: data.body.userName,
        publisher: 'pixiv',
        title: data.body.title,
        description: toEpubHTML(data.body.caption, true),
        tags: data.body.tags,
        customMetadata: [{
            name: 'dc:source',
            value: data.body.extraData.meta.canonical,
            renderInTitlePage(item) {
                const htmlUrl = htmlEncode(item.value);
                return `<div>${ t($downloader.$epub.$link, { link: htmlUrl }) }</div>`;
            },
        }],
    });
    epub.date(new Date(data.body.createDate));
    epub.notes(t($downloader.$epub.$notes, {
        link: htmlEncode(data.body.extraData.meta.canonical),
        scriptUrl: htmlEncode(__GREASYFORK_URL__),
        scriptName: htmlEncode(GM_info.script.name),
        authorUrl: htmlEncode(__GREASYFORK_AUTHOR_URL__),
        authorName: htmlEncode(GM_info.script.author),
    }));

    // 获取目录
    const requestCount = Math.ceil(data.body.publishedContentCount / 30);
    const index = yield* withProgressYields(
        async (complete, progress) => {
            const index: SeriesContentAPIPageItem[] = [];
            const promises: Promise<typeof AbortSymbol | undefined>[] = [];
            for (let i = 0; i < data.body.publishedContentCount; i += 30) {
                const promise = (async () => {
                    const d = await seriesContent(id, 30, i, undefined, signal);
                    if (d === AbortSymbol || signal?.aborted) return AbortSymbol;
                    for (let j = 0; j < d.body.page.seriesContents.length; j++)
                        index[i+j] = d.body.page.seriesContents[j];
                    progress()
                }) ();
                promises.push(promise);
            }
            const results = await Promise.all(promises);
            return complete(
                results.some(item => item === AbortSymbol) || signal?.aborted ?
                    AbortSymbol : index
            );
        },
        requestCount,
        'series-index'
    );
    if (index === AbortSymbol || signal?.aborted) {
        logger.simple('Info', 'download aborted');
        return false;
    }

    // 同时进行 加载每一本小说 和 加载系列封面
    yield* mergeAsyncGenerators<
        AysncProgressYields<DownloadProgressType>, void | typeof AbortSymbol, void
    >(
        loadNovels(epub, index.map(n => n.id), 'series-novel', signal),
        loadCover(epub, data.body.cover.urls.original, 'cover', signal),
    );

    // 生成Epub文件
    const blob = yield* generateEpub(epub, 'generate');
    if (blob === AbortSymbol || signal?.aborted) {
        logger.simple('Info', 'download aborted');
        return false;
    }

    // 交付Epub文件
    yield* saveBlob(blob, data.body.title, 'save');

    return true;
}

/**
 * 合并下载多篇小说为Epub
 * @param ids 小说ID列表
 * @param filename 下载文件名，不包括`.epub`扩展名部分；省略时默认使用第一本小说的标题
 * @param signal 下载终止信号
 * @returns 下载成功true，下载被取消false，出错时直接抛出错误
 */
export async function* downloadCustom(
    ids: (string | number)[],
    filename?: string,
    signal?: AbortSignal,
): AsyncGenerator<AysncProgressYields<DownloadProgressType>, boolean, void> {
    // 创建Epub
    const epub = new jEpub();

    // 获取第一本书数据
    const data = yield* withProgressYields(
        async complete => complete(novel(ids[0])),
        1,
        'novel-api',
    );
    if (data === AbortSymbol || signal?.aborted) {
        logger.simple('Info', 'download aborted');
        return false;
    }

    // 初始化Epub
    epub.init({
        title: data.body.title,
        description: toEpubHTML(data.body.description, true),
        author: data.body.userName,
        publisher: 'pixiv',
        i18n: tojEpubLang(data.body.language),
        tags: data.body.tags.tags.map(tag => tag.tag),
        customMetadata: [{
            name: 'dc:source',
            value: data.body.extraData.meta.canonical,
            renderInTitlePage(item) {
                const htmlUrl = htmlEncode(item.value);
                return `<div>${ t($downloader.$epub.$link, { link: htmlUrl }) }</div>`;
            },
        }],
    });
    epub.date(new Date(data.body.createDate));
    epub.notes(t($downloader.$epub.$notes, {
        link: htmlEncode(data.body.extraData.meta.canonical),
        scriptUrl: htmlEncode(__GREASYFORK_URL__),
        scriptName: htmlEncode(GM_info.script.name),
        authorUrl: htmlEncode(__GREASYFORK_AUTHOR_URL__),
        authorName: htmlEncode(GM_info.script.author),
    }));

    // 同时进行 加载每一本小说 和 加载系列封面
    yield* mergeAsyncGenerators<
        AysncProgressYields<DownloadProgressType>, void | typeof AbortSymbol, void
    >(
        loadNovels(epub, ids, 'series-novel', signal),
        loadCover(epub, data.body.coverUrl, 'cover', signal),
    );

    // 生成Epub文件
    const blob = yield* generateEpub(epub, 'generate');
    if (blob === AbortSymbol || signal?.aborted) {
        logger.simple('Info', 'download aborted');
        return false;
    }

    // 交付Epub文件
    yield* saveBlob(blob, filename ?? data.body.title, 'save');

    return true;
}

/**
 * 带进度UI地下载
 * @param downloadFunc 下载逻辑函数，要求函数签名的最后一个参数必须是负责终止/取消整个下载流程的{@link AbortSignal}（可以为必选参数，也可以为可选参数）
 * @param args 对下载逻辑函数传入的参数
 */
export async function downloadWithUI<
    Params extends any[]
>(
    downloadFunc: (...args: Params) => AsyncGenerator<AysncProgressYields<DownloadProgressType>, boolean, void>,
    ...args: Params
) {
    /** 内部的中断信号，用于同时处理外部传入信号中断与内部错误捕获自动中断 */
    const internalAbortController = new AbortController();
    // 修改args以应用内部中断信号
    if (args[args.length-1] instanceof AbortSignal) {
        // 原传入实参中传了AbortSignal
        // 注意这里有个未处理的Edge Case: 如果函数签名中最后有大于一个连续的参数都是AbortSignal，而传参时省略了最后一个我们需要的Signal，
        // 这里判断不出来，会依然以为传了该信号；实践中，不要把函数签名最后设计大于一个连续的AbortSignal，有一个用于中断整个下载流程的就够了
        const externalSignal = args[args.length-1] as AbortSignal;
        args[args.length-1] = internalAbortController.signal;
        externalSignal.addEventListener('abort', () => internalAbortController.abort());
    } else {
        // 原传入实参中省略了AbortSignal
        args.push(internalAbortController.signal);
    }

    /**
     * 执行下载生成器函数得到的进度生成器对象
     */
    const progressGenerator = downloadFunc(...args);
    /**
     * 生成器函数返回的进度ID - ProgressUI的任务ID 对照表
     */
    const idTaskMap = new Map<string, number>();
    /**
     * 进度UI对象
     */
    const p = await progress([], {
        dark: isPixivDark,
        seamless: true,
    });

    // 迭代进度生成器对象，根据进度通知创建和更新进度UI
    try {
        for await (const { id, type, finished, total } of progressGenerator) {
            const taskId = idTaskMap.has(id) ?
                idTaskMap.get(id)! :
                p.add(newTask(
                    t(TypeNameMap[type]),
                    TypeIconMap[type],
                    total,
                ));
            p.progress(taskId, {
                complete: total === finished,
                error: false,
                finished, total,
            });
            idTaskMap.set(id, taskId);
        }
    } catch (err) {
        // 出错时立即中断下载
        internalAbortController.abort();

        logger.simple('Error', 'download error');
        logger.asLevel('Error', err);

        alert(t($downloader.$error.$message), {
            backdropDismiss: false,
            dark: isPixivDark,
            header: t($downloader.$error.$header),
        });
    }

    // 下载函数执行完毕，销毁进度UI
    p.destroy(PROGRESS_UI_DESTROY_DELAY);
}
