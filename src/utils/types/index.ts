import type { Component } from "vue";

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
export interface VueContent {
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
    props: Record<string, any>;
}

/**
 * 自定义渲染内容
 */
export type DisplayContent = TextContent | HTMLContent | VueContent;
// #endregion
