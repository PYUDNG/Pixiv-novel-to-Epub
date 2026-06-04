import { AbortSymbol, globalLogger, isPixivDark, saveAs } from "@/utils";
import { novel } from "../api";
import { defineModule } from "../types";
import i18n, { i18nKeys } from "@/i18n";
import jEpub from "jepub";
import { loadCover, loadImages, parseContent } from "./common";
import { progress } from "@/utils/helpers/popup/progress";
import MaterialSymbolsDataObject from '~icons/material-symbols/data-object';
import MaterialSymbolsImageOutline from '~icons/material-symbols/image-outline'
import MaterialSymbolsBook from '~icons/material-symbols/book';

const PROGRESS_UI_DESTROY_DELAY = 1000;

const logger = globalLogger.withPath('downloader');
const { t } = i18n.global;
const $novel = i18nKeys.$downloader.$novel;

export default defineModule({
    id: 'downloader',
});

/**
 * 下载单本小说为Epub
 * @param id 小说ID
 * @param signal 下载终止信号
 */
export async function downloadNovel(id: string | number, signal?: AbortSignal): Promise<void> {
    // 进度UI
    const p = await progress([], {
        dark: isPixivDark,
        seamless: true,
    });
    const $progress = $novel.$progress;

    // 创建Epub
    const epub = new jEpub();

    // 获取小说数据
    const pApi = p.add({
        icon: MaterialSymbolsDataObject,
        name: t($progress.$api),
        progress: {
            complete: false,
            finished: 0,
            total: 1,
        },
    });
    const data = await novel(id, signal);
    if (data === AbortSymbol) {
        logger.simple('Info', 'download aborted');
        p.destroy(PROGRESS_UI_DESTROY_DELAY);
        return;
    }
    p.progress(pApi);
    p.complete(pApi);

    // 初始化Epub
    epub.init({
        i18n: data.body.language,
        author: data.body.userName,
        title: data.body.title,
        description: data.body.description,
        tags: data.body.tags.tags.map(tag => tag.tag),
    });
    epub.date(new Date(data.body.createDate));

    // 解析内容
    const { html, title, images } = parseContent(data.body, {
        // 单本小说下载，相关信息已经写在书籍属性中了，不需要再单独写一遍
        cover: false,
        desc: false,
        link: false,
        tags: false,
    });

    // 异步操作
    const pCover = p.add({
        name: t($progress.$cover),
        icon: MaterialSymbolsImageOutline,
        progress: {
            complete: false,
            finished: 0,
            total: 1,
        },
    });
    const pImages = p.add({
        name: t($progress.$images),
        icon: MaterialSymbolsImageOutline,
        progress: {
            complete: false,
            finished: 0,
            total: images.length,
        },
    });
    await Promise.all([
        // 加载封面图
        loadCover(epub, data.body.coverUrl, {
            signal,
            onProgress: () => p.progress(pCover),
            onComplete: () => p.complete(pCover),
        }),
        // 加载图片资源
        loadImages(epub, images, {
            signal,
            onProgress: () => p.progress(pImages),
            onComplete: () => p.complete(pImages),
        }),
    ]);

    // 添加章节内容
    epub.add(title, html);

    // 由于jEpub.generate无法主动终止，因此提前检查下载终止信号
    if (signal?.aborted) {
        logger.simple('Info', 'download aborted');
        p.destroy(PROGRESS_UI_DESTROY_DELAY);
        return;
    };

    // 生成Epub文件
    const pGenerate = p.add({
        name: t($progress.$generate),
        icon: MaterialSymbolsBook,
        progress: {
            complete: false,
            finished: 0,
            total: 1,
        },
    });
    const blob = await epub.generate('blob');
    p.progress(pGenerate);
    p.complete(pGenerate);

    // 检查下载终止信号
    if (signal?.aborted) {
        logger.simple('Info', 'download aborted');
        p.destroy(PROGRESS_UI_DESTROY_DELAY);
        return;
    };

    // 交付Epub文件
    const pSave = p.add({
        name: t($progress.$save),
        icon: MaterialSymbolsBook,
        progress: {
            complete: false,
            finished: 0,
            total: 1,
        },
    });
    await saveAs(blob, `${title}.epub`);
    p.progress(pSave);
    p.complete(pSave);

    // 销毁进度UI
    p.destroy(PROGRESS_UI_DESTROY_DELAY);
}