import { createApp, h, reactive, type InjectionKey } from "vue";
import type { Component } from 'vue';
import type { ComponentExposed, ComponentProps } from 'vue-component-type-helpers';
import { $CrE, CreateElementOptions, detectDom } from "./dom-utils";
import i18n from '@/i18n/index.js';
import { Nullable } from "../types";

// #region 类型定义与默认值
interface ShadowAppCreationOptions<
    C extends Component
> {
    /**
     * 挂载Shadow DOM的HTML元素 或 元素的id  
     * 提供HTMLElement时，将直接挂载在该元素上  
     * 提供string时，将在body下创建一个新的div元素挂载shadow dom，并设置其id  
     * 省略时，将在body下创建一个新的div元素挂载shadow dom，不设置id
     */
    host?: HTMLElement | string | null,

    /**
     * shadowroot初始化选项
     */
    init?: ShadowRootInit,

    /**
     * 传递给根组件的props
     */
    props?: ComponentProps<C>,//Record<string, any>,

    /**
     * 应用级别的provide
     */
    provides?: Record<string | symbol, any>,

    /**
     * 内部元素创建附加选项
     */
    options?: Partial<Record<'host' | 'app', CreateElementOptions>>,

    /**
     * 阻止ShadowDOM内部事件冒泡到主文档  
     * 可以传入布尔值，也可以传入一个自定义的事件名称列表
     * @default true
     */
    stopPropagation?: boolean | string[],
}
const defaultOptions: Required<ShadowAppCreationOptions<Component>> = {
    host: null,
    init: { mode: 'open' },
    props: {},
    options: {},
    provides: {},
    stopPropagation: true,
};
// #endregion

// #region 全局 provide 常量
/**
 * 过渡动画时长
 */
const TRANSITION_DURATION = 200;
// #endregion

// #region 全局 provide/inject keys
/**
 * 注入 key：获取 Shadow DOM 内的 Vue 挂载点元素（appElm）
 */
export const OVERLAY_CONTAINER_KEY: InjectionKey<HTMLElement> = Symbol('overlay-container');

/**
 * 注入 key：获取 Shadowroot
 */
export const OVERLAY_SHADOWROOT_KEY: InjectionKey<ShadowRoot> = Symbol('overlay-shadowroot');

/**
 * 注入 key：获取 Shadow DOM 自身的挂载点元素（hostElm）
 */
export const OVERLAY_SHADOWHOST_KEY: InjectionKey<HTMLElement> = Symbol('overlay-shadowdom-host');

/**
 * 注入 key：过渡动画时长
 */
export const TRANSITION_DURATION_KEY: InjectionKey<number> = Symbol('transition-duration');
// #endregion

// 异步导入styling，防止循环导入初始化死锁
let styling = import('@/styling.js');

/**
 * 挂载Shadowroot，并在其中创建Vue App
 * @param hostId 
 * @returns 创建的Vue app、根组件实例、Vue挂载容器和ShadowDOM宿主
 */
export async function createShadowApp<
    T extends Component,
>(
    app: T,
    options: ShadowAppCreationOptions<T> = defaultOptions,
) {
    // 确保head元素存在
    await detectDom('head');

    // 创建挂载Shadown DOM的宿主元素
    const { host, init, props, provides, stopPropagation } = Object.assign({}, defaultOptions, options);
    const argHost = host instanceof HTMLElement;
    const hostElm: HTMLElement = argHost ? host : $CrE('div', options.options?.host ?? {});
    argHost || detectDom('body').then(body => body.appendChild(hostElm));
    typeof host === 'string' && hostElm.setAttribute('id', host);
    
    // 挂载Shadow DOM
    const shadow = hostElm.attachShadow(init);
    styling.then(styling => styling.styling.applyTo(shadow));

    // 在Shadow DOM中创建vue挂载元素
    const appElm = $CrE('div', options.options?.app ?? {});
    shadow.append(appElm);

    // 使用自定义的rem单位大小
    appElm.classList.add('text-base');

    // 滚动条样式
    appElm.classList.add('scrollbar-light', 'dark:scrollbar-dark');

    // 屏蔽Shadown DOM内常见事件冒泡，预防性阻止Shadow DOM和页面互相干扰
    // 例如：在Dialog的InputText内按下左右箭头时，不触发页面翻页
    // 已知缺陷：当Dialog打开但未focus在任一输入元素上时，按下左右键依然会触发翻页
    // 例外
    // - mouseup需要向上冒泡，以供Dialog监听拖动-释放事件，用于拖动窗口标题栏
    // - touchstart需要向上冒泡，以供popoverLogic监听任意位置点击，用于自动隐藏popover
    const events = Array.isArray(stopPropagation) ? stopPropagation : [
        'click', 'dblclick', 'auxclick',
        'mousedown', 'mousewheel', 'wheel',
        'touchend',
        'pointerdown', 'pointerup', 'pointerenter', 'pointerleave', 'pointermove', 'pointerout', 'pointerover',
        'contextmenu', 'scroll', 'scrollend',
        'keydown', 'keyup', 'keypress',
        'input', 'copy', 'paste', 'cut', 'compositionstart', 'compositionupdate', 'compositionend',
        'drag', 'dragstart', 'dragend', 'dragenter', 'dragleave', 'dragover', 'drop',
    ];
    stopPropagation && events.forEach(name => appElm.addEventListener(name, e => e.stopPropagation(), { passive: true }));

    // 创建应用实例
    // 为了保持根组件props的响应性，采用以下workaround，参考此issue：
    // https://github.com/vuejs/core/issues/4874#issuecomment-959008724
    // https://github.com/vuejs/core/issues/4874#issuecomment-1353941493
    let expose: Nullable<ComponentExposed<T>> = null;
    const appInstance = createApp({
        render: () => expose = h(app, props) as typeof expose
    })
        .use(i18n);
    Reflect.ownKeys(provides).forEach(key => appInstance.provide(key, provides[key]));

    // provide Shadow DOM 挂载点元素，供子组件中 Vuetify overlay 的 attach 使用
    appInstance
        .provide(OVERLAY_CONTAINER_KEY, appElm)
        .provide(OVERLAY_SHADOWROOT_KEY, shadow)
        .provide(OVERLAY_SHADOWHOST_KEY, hostElm)
        .provide(TRANSITION_DURATION_KEY, TRANSITION_DURATION);

    // 挂载应用并获得根组件实例
    //const rootComponent = appInstance.mount(appElm) as ComponentExposed<T>;
    appInstance.mount(appElm);
    const rootComponent = reactive(Object.assign({}, expose!.component.exposed)) as ComponentExposed<T>;

    // 返回相关对象
    return {
        /** 挂载Shadow DOM的宿主元素 */
        host: hostElm,
        /** Vue App */
        app: appInstance,
        /** 挂载Vue App的容器元素 */
        container: appElm,
        /** Vue 根组件实例 */
        root: rootComponent,
    };
}
