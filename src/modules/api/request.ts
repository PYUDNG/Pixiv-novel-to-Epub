import { AbortSymbol, globalLogger, Queue, requestJson } from "@/utils";

// API 常量配置
const PIXIV_API_BASEURL = 'https://www.pixiv.net';
const PIXIV_HOST = 'www.pixiv.net';
const PIXIV_DEFAULT_REFERRER = 'https://www.pixiv.net';

// API 特殊返回值
/** API请求被主动取消 */
const API_ABORT_SYMBOL: unique symbol = Symbol('API Request Aborted');
/** API请求经过最大尝试次数后仍然错误 */
const API_ERROR_SYMBOL: unique symbol = Symbol('API Request Error');

/** 包括初始尝试和所有重试在内，最大尝试次数 */
const MAX_API_TRIES = 3;

/** api模块日志 */
const logger = globalLogger.withPath('api');

/**
 * API执行队列
 */
const queue = new Queue();

/**
 * API缓存
 */
const cache = new Map<string, any>();

export const api = async (
    ...args: Parameters<typeof _api>
): Promise<
    | Awaited<ReturnType<typeof _api>>
    | typeof API_ABORT_SYMBOL
    | typeof API_ERROR_SYMBOL
> => {
    // 带错误重试地排队执行请求
    for (let n = 1; n <= MAX_API_TRIES; n++) {
        try {
            // 排队执行请求
            return await queue.enqueue(() => _api(...args));
        } catch(err) {
            // 当主动Abort时不重试，返回 API Aborted 标志
            if (err === AbortSymbol) return API_ABORT_SYMBOL;

            // 错误重试，直到尝试次数用尽
            logger.simple('Error', `api request error (try #${n})`);
            logger.asLevel('Error', err);
        }
    }

    // 用尽尝试次数依然报错，返回 API Error 标志
    return API_ERROR_SYMBOL;
}

// 定义任意JSON类型API返回值
type JSONPrimitive = string | number | boolean | null;
type JSONArray = BasicResponseObject[];

/**
 * 任意JSON类型API返回值
 */
export type BasicResponseObject = JSONPrimitive | JSONArray | { [key: string]: BasicResponseObject };

/**
 * Pixiv API网络请求
 * @param pathname api端点的pathname，以'/ajax/'开头
 * @param params URL查询参数
 * @param signal 请求终止信号
 * @returns API返回值，或者`AbortSymbol`代表请求被主动取消，或者
 */
async function _api(
    pathname: string,
    params: Record<string, string> = {},
    signal?: AbortSignal,
): Promise<BasicResponseObject> {
    const url = toAbsURL(pathname, params);
    
    // 检查缓存
    if (cache.has(url)) return cache.get(url);

    // 执行请求
    let result: BasicResponseObject;
    try {
        result = await requestJson({
            method: 'GET', url,
            headers: {
                referrer: location.host === PIXIV_HOST ? location.href : PIXIV_DEFAULT_REFERRER,
                host: PIXIV_HOST,
            },
        }, signal);
    } catch(err) {
        logger.simple('Error', 'api request error');
        logger.asLevel('Error', err);

        // 将错误向外传递
        throw err;
    }

    return result;
}

function toAbsURL(pathname: string, params: Record<string, string>) {
    return new URL(pathname, PIXIV_API_BASEURL).href + (params ? `?${toSearch(params)}` : '');
}

function toSearch(params: Record<string, string>) {
    return new URLSearchParams(params).toString();
}