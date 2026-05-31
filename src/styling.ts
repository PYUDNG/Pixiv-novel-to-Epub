import { addEventListener } from "./hooks";
import { $CrE, detectDom, UserscriptStyling } from "./utils";
import './style.css';

export const styling = new UserscriptStyling();

// 初始化直接加载的样式CSS代码
const load = () => {
    /**
     * 存放所有当前已加载的<style>元素和其id
     */
    const loadedStyles = new Map<HTMLStyleElement, string>();

    /**
     * 存放从DOM中移除的<style>元素的container  
     * 监听此元素树子树变化，即可监听vite dev server插入和删除<style>元素
     */
    const styleElmRoot = $CrE('div');

    // 监听vite通过已有<style>元素引用插入和移除新的<style>元素
    const observer = new MutationObserver(() => {
        // 加载尚未加载过的<style>
        for (const style of styleElmRoot.querySelectorAll('style')) {
            if (!loadedStyles.has(style)) {
                // 未加载
                loadStyleElement(style, 'vite');
            } else {
                // 已加载
                const id = loadedStyles.get(style)!;
                if (styling.getStyle(id) !== style.innerHTML) {
                    // 内容更新
                    styling.setStyle(id, style.innerHTML);
                }
            }
        }
        // 卸载已加载但被移除的<style>
        for (const [style, id] of loadedStyles) {
            if (styleElmRoot.contains(style)) continue;
            styling.deleteStyle(id);
            loadedStyles.delete(style);
        }
    });
    observer.observe(styleElmRoot, {
        subtree: true,
        childList: true,
        characterData: true,
    });
    
    const loadStyleElement = (() => {
        /**
         * 用于构造styles键名的计数器index
         */
        const index: Record<string, number> = {};
        return loadStyleElement;

        /**
         * 将页面中的<style>元素转为{@link styling}所管理的CSS代码
         * @param style <style>元素
         * @param name 该<style>元素的类别名称，用作{@link styling}中css存储key的一部分（无实际功能性影响）
         */
        function loadStyleElement(style: HTMLStyleElement, name: string) {
            const i = Object.hasOwn(index, name) ? ++index[name] : (index[name] = 0);
            const id = `__${name}[${i}]__`;
            styling.setStyle(id, style.innerHTML);
            loadedStyles.set(style, id);
            removeStyle(style);
        }
    }) ();
        
    /**
     * 将<style>元素从文档中移除，使其不再生效  
     * 同时监听其同层级<style>元素的插入、更改和移除，同步触发`loadStyleElement`
     */
    function removeStyle(style: HTMLStyleElement) {
        style.remove();
        styleElmRoot.append(style);
    }

    // 代码中import语句引入的CSS
    if (import.meta.env.PROD) {
        // 生产环境下，css会通过vite-plugin-monkey的cssSideEffects选项的
        // 自定义逻辑暂存在window._importedStyles变量
        const importedStyles = (window as any)._importedStyles as string[];
        importedStyles.forEach((css, i) => styling.setStyle(`__imported[${i}]__`, css));
    } else {
        // 开发环境下，css会被vite自动作为<style>元素添加到文档
        detectDom({
            selector: 'style[data-vite-dev-id]',
            callback: (style: HTMLStyleElement) => loadStyleElement(style, 'vite'),
        });
    }
};
document.readyState === 'loading' ?
    addEventListener.call(document, 'DOMContentLoaded', load, { once: true }) :
    load();
