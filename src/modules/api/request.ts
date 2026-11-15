import { AbortSymbol, globalLogger, Queue, requestJson } from "@/utils";

// API 常量配置
const PIXIV_API_BASEURL = 'https://www.pixiv.net';
const PIXIV_HOST = 'www.pixiv.net';
const PIXIV_DEFAULT_REFERRER = 'https://www.pixiv.net';

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

/**
 * API错误
 */
export class APIError extends Error {
    /**
     * 
     * @param message 常规错误对象消息
     * @param status API status code
     * @param errorMessage pixiv api返回的`.message`字符串
     */
    constructor(
        message: string,
        public readonly status?: number,
        public readonly errorMessage?: string,
    ) {
        super(message);
        this.name = 'APIError';
    }
}

/**
 * 多次重试中的多个API错误
 */
export class RetriedAPIError extends Error {
    /**
     * 
     * @param message 常规错误对象消息
     * @param errors 多个API错误
     */
    constructor(
        message: string,
        public readonly errors: APIError[],
    ) {
        super(message);
        this.name = 'RetriedAPIError';
    }
}

export const api = async <
    T = JsonValue,
>(
    ...args: Parameters<typeof _api>
): Promise<T | typeof AbortSymbol> => {
    // 记录错误数据
    const errs: APIError[] = [];

    // 带错误重试地排队执行请求
    for (let n = 1; n <= MAX_API_TRIES; n++) {
        try {
            // 排队执行请求
            return await queue.enqueue(() => _api<T>(...args));
        } catch(err) {
            // 当主动Abort时不重试，返回 API Aborted 标志
            const lastArg = args[args.length - 1];
            if (err === AbortSymbol) return AbortSymbol;
            if (lastArg instanceof AbortSignal && lastArg.aborted) return AbortSymbol;

            // 记录错误
            if (err instanceof APIError)
                errs.push(err);
            else
                logger.simple('Error', 'Invalid error type');

            // 错误重试，直到尝试次数用尽
            logger.simple('Error', `api request error (try #${n})`);
            logger.asLevel('Error', err);
        }
    }

    // 用尽尝试次数依然报错，抛出错误
    throw new RetriedAPIError('error after all retries', errs);
}

// 定义任意JSON类型API返回值
type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonObject
    | JsonArray;

type JsonObject = {
    [key: string]: JsonValue;
};

type JsonArray = JsonValue[];

/**
 * Pixiv API网络请求
 * @param pathname api端点的pathname，以'/ajax/'开头
 * @param params URL查询参数
 * @param signal 请求终止信号
 * @returns API返回值，或者`AbortSymbol`代表请求被主动取消，或者
 */
async function _api<
    T = JsonValue,
>(
    pathname: string,
    params: Record<string, JsonValue | undefined> = {},
    signal?: AbortSignal,
): Promise<T> {
    const url = toAbsURL(pathname, params);
    
    // 检查缓存
    if (cache.has(url)) return cache.get(url);

    // 执行请求
    let result: T, status!: number;
    try {
        result = await requestJson({
            method: 'GET', url,
            headers: {
                referrer: location.host === PIXIV_HOST ? location.href : PIXIV_DEFAULT_REFERRER,
                host: PIXIV_HOST,
            },
            onload(response) {
                status = response.status;
            }
        }, signal);

        // 检查pixiv api 错误标志键
        if (hasErrorProp(result) && result.error)
            throw new APIError(`api error: ${ result.message }`, status, result.message);
        
        // 状态码 >= 400
        if (status >= 400)
            throw new APIError(`api error: ${ status }`, status);

        // 存缓存
        cache.set(url, result);
    } catch(err) {
        logger.simple('Error', 'api request error');
        logger.asLevel('Error', err);

        // 将错误向外传递
        throw err;
    }

    return result;

    function hasErrorProp(val: T): val is T & object & { error: boolean, message: string } {
        return typeof val === 'object'
            && val !== null
            && Object.hasOwn(val, 'error')
            && Object.hasOwn(val, 'message')
            && typeof Reflect.get(val, 'error') === 'boolean'
            && typeof Reflect.get(val, 'message') === 'string';
    }
}

/**
 * 清空API缓存，确保后续从服务器获取最新数据
 */
export function clearCache() {
    cache.clear();
}

function toAbsURL(pathname: string, params: Record<string, JsonValue | undefined>) {
    return new URL(pathname, PIXIV_API_BASEURL).href + (params ? `?${toSearch(params)}` : '');
}

function toSearch(params: Record<string, JsonValue | undefined>) {
    const obj: Record<string, string> = {};
    for (const [key, val] of Object.entries(params)) {
        if (typeof val === 'undefined') continue;
        if (typeof val === 'string')
            obj[key] = val;
        else
            obj[key] = val === null ?
                'null' : val.toString();
    }
    return new URLSearchParams(obj).toString();
}