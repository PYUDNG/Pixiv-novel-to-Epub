import { computed, ref, Ref } from "vue";

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
