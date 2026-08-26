import { SingleOrArray } from "../types/index.js";

/** DOM检测选项 */
interface DetectDomOptions<E extends HTMLElement = HTMLElement> {
    root?: Node;
    selector?: string | string[];
    attributes?: boolean;
    callback?: (element: E) => void;
    /**
     * 外部终止信号：abort 时断开观察（Promise 模式下同时以 AbortError 拒绝）
     * 用于模块卸载等场景下主动终止在途的 detectDom
     */
    signal?: AbortSignal;
}

/**
 * 检测DOM元素出现
 * @overload
 * @param selector - 选择器
 * @param options - 终止选项，目前支持 { signal: AbortSignal }：abort 时断开观察并以 AbortError 拒绝
 * @returns Promise<HTMLElement>
 */
/**
 * 检测DOM元素出现
 * @overload
 * @param options - 检测选项（含可选 signal）
 * @returns MutationObserver
 */
/**
 * 检测DOM元素出现
 * @overload
 * @param root - 根节点
 * @param selectors - 选择器
 * @param attributes - 是否观察属性变化
 * @param callback - 回调函数
 * @param signal - 外部终止信号（可选）
 * @returns MutationObserver
 */
export function detectDom(selector: string | string[], options?: { signal?: AbortSignal }): Promise<HTMLElement>;
export function detectDom<E extends HTMLElement>(options: DetectDomOptions<E>): MutationObserver;
export function detectDom(
    root: Node,
    selectors?: SingleOrArray<string>,
    attributes?: boolean,
    callback?: (element: HTMLElement) => void,
    /** @internal */
    __promiseMode?: boolean,
    signal?: AbortSignal
): MutationObserver;
export function detectDom(
    rootOrSelectorOrOptions: Node | string | string[] | DetectDomOptions,
    selectors?: string | string[] | { signal?: AbortSignal },
    attributes?: boolean,
    callback?: (element: HTMLElement) => void,
    /** @internal Promise 模式内部标记 */
    __promiseMode?: boolean,
    signal?: AbortSignal
): MutationObserver | Promise<HTMLElement> {
    // 解析参数
    let config: {
        selectors: string[];
        root: Node;
        attributes: boolean;
        callback: ((element: HTMLElement) => void) | null;
        /** 已处理元素集合，防止重复回调 */
        processedElements: WeakSet<HTMLElement>;
        /** 是否为 Promise 模式（首次匹配即断开） */
        promiseMode: boolean;
        /** 外部终止信号 */
        signal?: AbortSignal;
    };

    if (rootOrSelectorOrOptions instanceof Node) {
        // 处理 (root, selectors?, attributes?, callback?, signal?) 形式
        const sel = selectors as string | string[] | undefined;
        config = {
            selectors: Array.isArray(sel) ? sel : [sel || ''],
            root: rootOrSelectorOrOptions,
            attributes: attributes || false,            callback: callback || null,
            processedElements: new WeakSet(),
            promiseMode: __promiseMode || false,
            signal,
        };
    } else if (typeof rootOrSelectorOrOptions === 'object' && !(rootOrSelectorOrOptions instanceof Node)) {
        // 处理 options 形式
        const options = rootOrSelectorOrOptions as DetectDomOptions;
        config = {
            selectors: Array.isArray(options.selector) ? options.selector : [options.selector || ''],
            root: options.root || document,
            attributes: options.attributes || false,            callback: options.callback || null,
            processedElements: new WeakSet(),
            promiseMode: false,
            signal: options.signal,
        };
    } else {
        // 处理 selector 形式 (返回Promise)，第二参数为可选的终止选项 { signal }
        const selector = rootOrSelectorOrOptions as string | string[];
        const signal = (selectors as { signal?: AbortSignal } | undefined)?.signal;
        return new Promise<HTMLElement>((resolve, reject) => {
            let observer: MutationObserver | null = null;
            const onAbort = () => {
                observer?.disconnect();
                reject(new DOMException('The operation was aborted.', 'AbortError'));
            };
            const cleanup = () => signal?.removeEventListener('abort', onAbort);
            if (signal) {
                if (signal.aborted) { onAbort(); return; }
                signal.addEventListener('abort', onAbort, { once: true });
            }
            observer = detectDom(document, selector, false, elm => {
                cleanup();
                resolve(elm);
            }, true) as unknown as MutationObserver;
        });
    }

    // 检查是否已存在元素
    const checkExisting = () => {
        const elements = selectAll(config.root, config.selectors);
        const uniqueElements = [...new Set(elements)];
        if (uniqueElements.length > 0) {
            uniqueElements.forEach(elm => {
                if (!config.processedElements.has(elm)) {
                    config.processedElements.add(elm);
                    config.callback?.(elm);
                }            });
            return true;        }
        return false;
    };
    const hasExistingElements = checkExisting();

    // Promise 模式：已有元素则无需创建观察者
    if (hasExistingElements && config.promiseMode) {
        return { disconnect: () => {}, observe: () => {} } as unknown as MutationObserver;
    }

    // 创建观察者
    const observer = new MutationObserver((mutations) => {
        const addedNodes: Node[] = [];

        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                addedNodes.push(...mutation.addedNodes);
            } else if (mutation.type === 'attributes' && mutation.target) {
                addedNodes.push(mutation.target);
            }
        });

        const matchedNodes = new Set<HTMLElement>();
        addedNodes.forEach(node => {
            if (node instanceof HTMLElement && matches(node, config.selectors)) {
                matchedNodes.add(node);
            }
            const children = selectAll(node as Element, config.selectors);
            children.forEach(child => matchedNodes.add(child));
        });

        matchedNodes.forEach(node => {
            // 跳过已处理过的元素（解决 attributes 误伤、跨 batch 重复）
            if (config.processedElements.has(node)) return;
            config.processedElements.add(node);
            config.callback?.(node);
            // Promise 模式：首次匹配到新元素后断开观察
            if (config.promiseMode) {
                observer.disconnect();
            }
        });
    });

    // 开始观察
    observer.observe(config.root, {
        childList: true,
        subtree: true,
        attributes: config.attributes,
    });

    // 支持外部终止：signal abort 时断开观察（Promise 模式的 reject 由 selector 形式的调用方处理）
    if (config.signal) {
        const onAbort = () => observer.disconnect();
        config.signal.addEventListener('abort', onAbort, { once: true });
        if (config.signal.aborted) observer.disconnect();
    }

    return observer;
}

/** 辅助函数：检查元素是否匹配任一选择器 */
function matches(element: HTMLElement, selectors: string[]): boolean {
    return selectors.some(selector => element.matches(selector));
}

/** 辅助函数：选择所有匹配的元素 */
function selectAll(root: Node, selectors: string[]): HTMLElement[] {
    if (!(root instanceof Element || root instanceof Document || root instanceof DocumentFragment)) {
        return [];
    }

    return selectors.flatMap(selector => {
        return Array.from(root.querySelectorAll<HTMLElement>(selector));
    });
}

export interface CreateElementOptions {
    /** 通过 element[key] = value 赋值给元素的属性 */
    props?: Partial<HTMLElement>;

    /** 通过 element.setAttribute(key, value) 为元素设置的属性 */
    attrs?: Record<string, string>;

    /** 元素的类名，支持传入 类名属性字符串 或 类名数组 */
    classes?: SingleOrArray<string>;

    /** 元素的内联样式，支持传入 样式属性字符串 或 样式数据对象 */
    styles?: string | Partial<CSSStyleDeclaration>;

    /** 元素的事件监听器数组 */
    listeners?: Parameters<typeof HTMLElement.prototype.addEventListener>[]
}

export function $CrE<K extends keyof HTMLElementTagNameMap>(tag: K, options?: CreateElementOptions): HTMLElementTagNameMap[K]
export function $CrE<K extends keyof HTMLElementDeprecatedTagNameMap>(tag: K, options?: CreateElementOptions): HTMLElementDeprecatedTagNameMap[K]
export function $CrE(tag: string, options: CreateElementOptions = {}): HTMLElement {
    const elm = document.createElement(tag);

    // props
    for (const [key, val] of Object.entries(options.props ?? {})) Reflect.set(elm, key, val);

    // attrs
    for (const [key, val] of Object.entries(options.attrs ?? {})) elm.setAttribute(key, val);

    // classes
    Object.hasOwn(options, 'classes') && (elm.className = Array.isArray(options.classes) ? options.classes.join(' ') : options.classes ?? '');

    // styles
    typeof options.styles === 'string' ? (elm.style.cssText = options.styles) : Object.assign(elm.style, options.styles);

    // listeners
    options.listeners?.forEach(args => elm.addEventListener(...args));

    return elm;
}
