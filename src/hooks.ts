// 此文件会在脚本执行之初加载，处于页面早期加载阶段，可以用来执行一些早于页面代码的任务
// dev环境下由于vite动态加载脚本的特性，一定会有延迟，因此依赖此处的代码可以考虑使用prod版本调试

import { monkeyWindow } from "$";

export const console: {
    [K in keyof Console]: Console[K]
} = Object.assign(Object.create(null), window.console);

// 将脚本内的addEventListener固定为原生方法，防止被Pixiv覆写
export let addEventListener = EventTarget.prototype.addEventListener;
if ((function() {}).constructor.prototype.toString.call(addEventListener) !== 'function addEventListener() { [native code] }') {
    const iframe = document.createElement('iframe');
    iframe.srcdoc = '<html></html>';
    document.documentElement.appendChild(iframe);
    addEventListener = iframe.contentWindow!.window.EventTarget.prototype.addEventListener;
    iframe.remove();
}

[
    monkeyWindow.EventTarget.prototype,
    monkeyWindow.Window.prototype,
].forEach(obj => Reflect.defineProperty(obj, 'addEventListener', {
    get: () => addEventListener,
    set: _v => {},
    enumerable: true,
    configurable: false,
}));
