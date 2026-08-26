// 此文件会在脚本执行之初加载，处于页面早期加载阶段，可以用来执行一些早于页面代码的任务
// dev环境下由于vite动态加载脚本的特性，一定会有延迟，因此依赖此处的代码可以考虑使用prod版本调试

import { monkeyWindow, unsafeWindow } from "$";
import { SingleOrArray } from "./utils";

export const console: {
    [K in keyof Console]: Console[K]
} = Object.assign(Object.create(null), window.console);

// 固定脚本内部分原生方法，防止被Pixiv覆写
export let addEventListener = ensureNativeFunc<
    typeof EventTarget.prototype.addEventListener
>(
    ['EventTarget', 'prototype', 'addEventListener'],
    'function addEventListener() { [native code] }',
);

/**
 * 将monkeyWindow上指定的深层方法属性固定为原生方法，防止被页面脚本覆写
 * @param pathFromWindow 从window出发，访问该属性所用的属性名数组
 * @param source 该原生方法的正确.toString()返回值，用于内部检验获取到的是不是原生方法
 * @returns 原生方法值
 */
function ensureNativeFunc<F extends Function>(pathFromWindow: string[], source: string): F {
    const func = getNativeFunc<F>(pathFromWindow, source);
    const parent = pathGet(monkeyWindow, pathFromWindow.slice(0, pathFromWindow.length - 1));
    ensureProperty(parent, pathFromWindow[pathFromWindow.length-1], func);
    return func;
}

function getNativeFunc<T>(pathFromWindow: string[], source: string): T {
    if (pathFromWindow.length < 1) throw new TypeError('at least one property in path');

    // 首先直接通过访问路径获取方法
    let target: T = pathGet<T>(unsafeWindow, pathFromWindow);

    // 如果直接获取的不是原生方法，就通过iframe间接获取
    if ((function() {}).constructor.prototype.toString.call(target) !== source) {
        const iframe = document.createElement('iframe');
        iframe.srcdoc = '<html></html>';
        document.documentElement.appendChild(iframe);
        target = pathGet<T>(iframe.contentWindow!.window, pathFromWindow);
        iframe.remove();
    }

    return target;
}

/**
 * 将一个或多个对象上的某一属性名对应的值写死为给定值，忽略后续赋值，并不允许重新配置此属性
 * @param objs 一个对象或对象数组（注意：这里不可传入数组作为单一对象）
 * @param prop 属性名
 * @param val 值
 */
function ensureProperty(objs: SingleOrArray<any>, prop: string, val: any) {
    if (!Array.isArray(objs)) objs = [objs];
    for (const obj of objs) {
        Reflect.defineProperty(obj, prop, {
            get: () => val,
            set: _v => {},
            enumerable: true,
            configurable: false,
        });
    }
};

/**
 * 从一个根对象节点出发，按照指定的props链访问，得到一个节点的值
 * @param root 根对象
 * @param path 按顺序访问的节点prop名数组
 */
function pathGet<T>(root: any, path: string[]): T {
    let obj: any = root;
    for (const prop of path)
        obj = obj[prop];
    return obj as T;
}
