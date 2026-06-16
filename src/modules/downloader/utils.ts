import { AbortSymbol, AsyncQueue, globalLogger, Queue, requestBlob } from "@/utils";
import dedent from "dedent";
import { v4 as uuid } from "uuid";

// 网络常量配置
const PIXIV_HOST = 'www.pixiv.net';
const PIXIV_DEFAULT_REFERRER = 'https://www.pixiv.net';

/** 包括初始尝试和所有重试在内，最大尝试次数 */
const MAX_REQUEST_TRIES = 3;

const logger = globalLogger.withPath('downloader');

/**
 * 异步任务生成器函数的进度yields数据类型
 */
export interface AysncProgressYields<Y extends string> {
    /** 产生进度的操作的全局唯一ID */
    id: string;
    /** 产生进度的操作类型 */
    type: Y;
    /** 进度总量 */
    total: number;
    /** 进度已完成量 */
    finished: number;
}

/**
 * 下载blob资源的队列
 */
const queueBlob = new Queue({
    max: 5,
    sleep: 0,
});

export type ProgressCallback = (finished?: number) => void;
export type CompleteCallback = <T = undefined>(val?: T) => T;

/**
 * 带进度回调的异步操作函数  
 */
interface AysncProgressCallbackFunc<R> {
    /**
     * @param complete 标记完成的回调，异步操作彻底完成时调用；调用时自动隐式调用`progress(total)`；可以传入一个参数，将作为返回值原样传出，以简化调用代码
     * @param progress 更新进度的回调，异步操作产生进度时调用；可省略调用，直接调用complete将自动隐式调用`progress(total)`
     */
    (
        complete: CompleteCallback,
        progress: ProgressCallback,
    ): Promise<R>
}

/**
 * 将带进度回调的异步操作方法转化为yield进度输出的方法
 * @param func 带进度回调的异步操作方法
 * @param total 进度总量
 * @param yields 进度输出yield类型
 */
export async function* withProgressYields<
    Y extends string,
    R,
>(
    func: AysncProgressCallbackFunc<R>,
    total: number,
    yields: Y,
): AsyncGenerator<AysncProgressYields<Y>, R, void> {
    const yieldId = uuid();
    const queue = new AsyncQueue<number>();
    let lastFinished = 0;
    const doClose: CompleteCallback = (val?: any) => { queue.push(total); queue.close(); return val; };
    const doYield: ProgressCallback = finished => queue.push(finished ? lastFinished = finished : ++lastFinished);
    const pResult = func(doClose, doYield);
    // 当任务失败时通知销毁队列
    pResult.catch(err => queue.destroy(err));
    // 初始化零进度报告
    yield {
        id: yieldId,
        type: yields,
        finished: 0,
        total,
    }
    // 回调进度报告
    for await (const finished of queue) yield {
        id: yieldId,
        type: yields,
        finished, total,
    }
    return await pResult;
}

/**
 * 从pixiv服务器加载blob资源
 * @param url 请求网址
 * @param signal 请求终止信号
 */
export async function getPixivBlob(url: string, signal?: AbortSignal): Promise<Blob | typeof AbortSymbol > {
    // 带错误重试的网络请求：默认重试，不需要重试时使用break跳出
    for (let n = 1; n <= MAX_REQUEST_TRIES; n++) {
        try {
            return await queueBlob.enqueue(
                () => requestBlob({
                    method: 'GET', url,
                    headers: {
                        referer: location.host === PIXIV_HOST ? location.href : PIXIV_DEFAULT_REFERRER,
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

/**
 * 将文本或HTML代码转化为Epub内方便阅读和解析的标准格式：
 * - 非空行用`<p>`包裹
 * - 空行用`<br>`表示（如有换行符`\r`和`\n`全部转换为`<br>`）
 * - 最多三行连续的空行
 * @param content 原始文本内容
 * @param isHTML 原始文本内容是否为HTML格式，默认为`false`，表示为纯文本
 */
export function toEpubHTML(content: string, isHTML: boolean = false): string {
    /** 最终解析出来的HTML代码中的行的数组 */
    const lines: string[] = [];
    /** 连续空行计数器 */
    let emptyCount = 0;
    /** 解析完毕后，添加一行到lines的方法 */
    const addLine = (line: string, isEmpty: boolean) => {
        // 最多允许三行空行
        if (isEmpty) {
            if (++emptyCount <= 3) {
                // 允许连续三个以内的空行
                lines.push(line);
            } else {
                // 忽略超过三行的空行
                // 不重置计数，后续更多空行继续忽略，直到遇到非空行为止
            }
        } else {
            // 非空行
            lines.push(line);
            // 重置连续空行计数
            emptyCount = 0;
        }
    };
    /** 将纯文本内容按照换行符分行后，用<p>包裹并添加到lines */
    const parseText = (text: string) =>
        text.split(/[\r\n]/).forEach(line => {
            const isEmpty = line.trim().length === 0;
            const content = isEmpty ? '<br>' : `<p>${ line }</p>`;
            addLine(content, isEmpty);
        });

    if (isHTML) {
        // HTML格式
        // 解析为HTML DOM节点
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const elms = Array.from(doc.body.childNodes);

        // 对每个节点内容进行解析
        elms.forEach(node => {
            // 将纯文本内容按照换行符分行后，用<p>包裹并添加到lines
            const parseText = (text: string) =>
                text.split(/[\r\n]+/).forEach(line => 
                    addLine(`<p>${ line }</p>`, line.trim().length === 0)
                )

            // 根据节点类型确定本行内容
            if (node instanceof HTMLElement) {
                // HTMLElement节点：保持不变
                addLine(node.outerHTML, node.innerText.length === 0);
            } else {
                // 非HTMLElement节点：
                switch (node.nodeName) {
                    // 注释：忽略
                    case '#comment': break;
                    // 文字 / CDATA：使用内容
                    case '#text':
                    case '#cdata-section': {
                        parseText(node.nodeValue ?? '');
                        break;
                    }
                    // 其它：输出警告并尝试使用内容
                    default: {
                        logger.simple('Warning', dedent`
                            Unexpected non-HTMLElement node ${ escJsStr(node.nodeName) }
                            Using .nodeValue
                        `);
                        logger.asLevel('Warning', node);
                        parseText(node.nodeValue ?? '');
                        break;
                    }
                }
            }
        });
    } else {
        // 纯文本
        parseText(content);
    }
    
    content = lines.join('\n');
    return content;
}

/**
 * 将形如`'zh-cn'`这样的 pixiv 语言代码转换为 `'zh'` 这样的 jEpub 语言代码
 */
export function tojEpubLang(code: string) {
    code = code.includes('-') ? code.split('-')[0] : code;
    return code.toLowerCase();
}

export function escJsStr(str: string) {
    return JSON.stringify(str);
}
