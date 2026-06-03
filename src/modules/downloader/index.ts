import { AbortSymbol, globalLogger, saveAs } from "@/utils";
import { novel } from "../api";
import { defineModule } from "../types";
import jEpub from "jepub";
import { loadCover, loadImages, parseContent } from "./common";

const logger = globalLogger.withPath('downloader');

export default defineModule({
    id: 'downloader',
});

/**
 * 下载单本小说为Epub
 * @param id 小说ID
 * @param signal 下载终止信号
 */
export async function downloadNovel(id: string | number, signal?: AbortSignal): Promise<void> {
    // 创建Epub
    const epub = new jEpub();

    // 获取小说数据
    const data = await novel(id, signal);
    if (data === AbortSymbol) {
        logger.simple('Info', 'download aborted');
        return;
    }

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

    // 封面图
    await loadCover(epub, data.body.coverUrl, signal);

    // 加载图片资源
    await loadImages(epub, images, signal);

    // 添加章节内容
    epub.add(title, html);

    // 由于jEpub.generate无法主动终止，因此提前检查下载终止信号
    if (signal?.aborted) return;

    // 生成Epub文件
    const blob = await epub.generate('blob');

    // 检查下载终止信号
    if (signal?.aborted) return;

    // 交付Epub文件
    await saveAs(blob, `${title}.epub`);
}