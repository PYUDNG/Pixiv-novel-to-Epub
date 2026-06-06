import { AbortSymbol, AsyncQueue, Queue, requestBlob } from "@/utils";
import { v4 as uuid } from "uuid";

// 网络常量配置
const PIXIV_HOST = 'www.pixiv.net';
const PIXIV_DEFAULT_REFERRER = 'https://www.pixiv.net';

/** 包括初始尝试和所有重试在内，最大尝试次数 */
const MAX_REQUEST_TRIES = 3;

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
