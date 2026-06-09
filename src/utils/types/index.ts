import type { Component } from "vue";
import { ComponentProps } from "vue-component-type-helpers";

// #region Common Types
export type SingleOrArray<T> = T | T[];
export type PromiseOrRaw<T> = T | Promise<T>;
export type Optional<T> = T | undefined | null;
export type Nullable<T> = T | null;
export type HintedString<T extends string> = (string & {}) | T;
export type ClassType<T> = { new(): T }
// #endregion

// #region Vue Types
/**
 * 文字类渲染内容
 */
export interface TextContent {
    /**
     * 类型
     */
    type: 'text';

    /**
     * 文字内容
     */
    text: string;
}

/**
 * HTML类渲染内容
 */
export interface HTMLContent {
    /**
     * 类型
     */
    type: 'html';
    
    /**
     * HTML内容
     */
    code: string;
}

/**
 * Vue组件类渲染内容
 */
export interface VueContent<C extends Component = Component> {
    /**
     * 类型
     */
    type: 'vue';
    
    /**
     * Vue组件
     */
    comp: Component;

    /**
     * 传入props
     */
    props: ComponentProps<C>;
}

/**
 * 自定义渲染内容
 */
export type DisplayContent<C extends Component = Component> = TextContent | HTMLContent | VueContent<C>;
// #endregion
