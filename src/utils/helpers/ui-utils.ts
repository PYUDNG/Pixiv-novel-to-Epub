import { computed, createApp, h, reactive, ref, Ref, type InjectionKey } from "vue";
import type { Component } from 'vue';
import type { ComponentExposed, ComponentProps } from 'vue-component-type-helpers';
import { $CrE, CreateElementOptions, detectDom } from "./dom-utils";
import i18n from '@/i18n/index.js';
import { Nullable } from "../types";

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

// 异步导入styling，防止循环导入初始化死锁
let styling = import('@/styling.js');

/**
 * 挂载Shadowroot，并在其中创建Vue App
 * @param hostId 
 * @returns 创建的Vue app的根组件实例
 */
export async function createShadowApp<
    T extends Component,
>(
    app: T,
    options: ShadowAppCreationOptions<T> = defaultOptions,
) {
    // Vuetify要求head元素存在
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
        .provide(OVERLAY_SHADOWHOST_KEY, hostElm);

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

/**
 * 根据viewport纵横比判断布局为横版还是竖版，并包装为一个Vue响应式变量
 * @param ratio 横:纵 临界比例，当大于这个比例时认为是横版布局，否则竖版布局；数值越小越偏向横版，数值越大越偏向纵版；默认为1
 * @returns （根据viewport纵横比）当前是横版还是竖版布局，跟随viewport大小实时更新
 */
export function getLayoutRef(ratio: number = 1): Ref<'vertical' | 'horizontal'> {
    const layout = ref<'vertical' | 'horizontal'>('vertical');
    let animationFrameId: number | null = null;

    const updateLayout = () => {
        layout.value = window.innerWidth / window.innerHeight > ratio ? 'horizontal' : 'vertical';
    };

    const handleResize = () => {
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(updateLayout);
    };

    updateLayout();
    window.addEventListener('resize', handleResize);

    return layout;
}

/**
 * 将传入的字节数转化为`'10MB'`、`'2.34GB'`这样的格式化文本  
 * 单位选用规则：若以某更大单位表示时数字依然大于1，则以此更大单位表示
 * @param bytes 字节数
 */
export function stringifyBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let value = bytes;
    let unitIndex = 0;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    // 保留两位小数，但如果是整数则显示整数
    const formattedValue = value % 1 === 0 ? value.toString() : value.toFixed(2);
    return `${formattedValue}${units[unitIndex]}`;
}

/**
 * 获取随resize事件实时更新的viewport大小
 * @returns 代表视口大小的对象: `{ height: window.innerHeight, width: window.innerWidth }`
 */
export function getViewport() {
    const viewport = ref<{
        height: number;
        width: number;
    }>({
        height: window.innerHeight,
        width: window.innerWidth,
    });
    window.addEventListener('resize', () => {
        viewport.value.height = window.innerHeight;
        viewport.value.width = window.innerWidth;
    });
    return viewport;
}

/**
 * 根据视口宽度，是否采用移动端布局
 * @returns 响应式变量，是否为移动端布局
 */
export function getIsMobileLayout() {
    const MIN_DISPLAY_WIDTH = 48 * 14; // TailwindCSS的md前缀，设置为48rem
    const viewport = getViewport();
    const useMobileLayout = computed(() => viewport.value.width < MIN_DISPLAY_WIDTH);
    return useMobileLayout;
}

/**
 * 根据userAgent判断当前是否运行在一个移动端浏览器上
 * @returns 布尔值（**不是**响应式变量），是否运行在移动端浏览器上
 */
export function isMobileAgent() {
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
}

/**
 * 创建一个响应式的系统深色模式状态
 * 无论在 Vue 组件内还是组件外执行，都能实时同步系统主题
 */
export function useSystemDark(): Ref<boolean> {
  // 1. 定义媒体查询字符串
  const mediaQueryString = '(prefers-color-scheme: dark)';

  // 2. 检查是否在浏览器环境中（防止 SSR 报错）
  if (typeof window === 'undefined') {
    return ref(false);
  }

  const mediaQueryList = window.matchMedia(mediaQueryString);

  // 3. 初始化 ref 值
  const isDark = ref(mediaQueryList.matches);

  // 4. 定义事件监听回调
  const handleChange = (event: MediaQueryListEvent) => {
    isDark.value = event.matches;
  };

  // 5. 监听媒体查询变化
  // 现代浏览器推荐使用 addEventListener，老版本浏览器可能需要 addListener
  if (mediaQueryList.addEventListener) {
    mediaQueryList.addEventListener('change', handleChange);
  } else {
    // 兼容旧版浏览器
    (mediaQueryList as any).addListener(handleChange);
  }

  return isDark;
}

// 在 Vue 文件外直接执行并导出单例，确保全局共享同一个状态
/**
 * 响应式状态：系统是否开启深色模式
 */
export const isSystemDark = useSystemDark();

/**
 * 组合式函数：实时监听 document.documentElement 的 data-theme 属性
 * @returns {Ref<boolean>} 如果 data-theme 为 'dark' 则返回 true，否则返回 false
 */
export function usePixivDark(): Ref<boolean> {
    // 1. 定义内部辅助函数：判断当前是否为深色模式
    const isDarkHtml = (): boolean => {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    };

    // 2. 初始化 Ref 值
    const isDark = ref<boolean>(isDarkHtml());

    // 3. 创建 MutationObserver 监听属性变化
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                isDark.value = isDarkHtml();
            }
        }
    });

    // 4. 开始监听 html 标签的 attributes 变化
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'], // 只关心 data-theme 属性，优化性能
    });

    return isDark;
}

// 在 Vue 文件外直接执行并导出单例，确保全局共享同一个状态
/**
 * 响应式状态：Pixiv页面是否开启深色模式
 */
export const isPixivDark = usePixivDark();
