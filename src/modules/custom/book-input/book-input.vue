<script setup lang="ts">
import { i18nKeys } from '@/i18n';
import { useI18n } from 'vue-i18n';
import { NovelData } from '../utils';
import MultiInput from '@/components/multi-input/multi-input.vue';
import { ref, useTemplateRef, watch } from 'vue';
import { AbortSymbol, deepEqual, SingleOrArray } from '@/utils';
import Button from '@/components/button.vue';
import MaterialSymbolsAdd from '~icons/material-symbols/add';
import { series, seriesContent } from '@/modules/api';
import { SeriesContentAPIPageItem } from '@/modules/api/novel/types';

const REG_PURE_NUMBER = /^\d+$/;
const REG_PATH_SERIES = /^\/novel\/series\/(\d+)$/;

const { t } = useI18n();
const $custom = i18nKeys.$custom;

// #region props
const { novels }= defineProps<{
    novels: NovelData[];
}>();
// #endregion

// #region emits
const emit = defineEmits<{
    /** 添加一本小说 */
    add: [id: SingleOrArray<string>];
}>();
// #endregion

// #region MultiInput数据传递
/**
 * 输入框组件
 */
const input = useTemplateRef('input');

// 当点击添加按钮时，触发输入框组件提交
function add() {
    if (input.value && !input.value.loading)
        input.value.submit();
}

/**
 * 传递给MultiInput的id数组
 */
const ids = ref<string[]>(novels.map(n => n.id));

// 当父组件传入的novels改变时，同步更新到MultiInput
watch(() => novels, novels => {
    const newIds = novels.map(n => n.id);
    if (deepEqual(newIds, ids, false))
        ids.value = novels.map(n => n.id)
});

/**
 * MultiInput `add` 事件监听器  
 * 当MultiInput添加id时，向上冒泡传出添加事件
 * @param id 
 */
function onAdd(id: SingleOrArray<string>) {
    emit('add', id);
}

/**
 * 检查字符串是否合法
 * @param val 字符串
 */
async function validate(val: string): Promise<true | string> {
    let valid = false;

    // 检查格式
    // 小说ID
    if (REG_PURE_NUMBER.test(val)) valid = true;
    // 链接
    if (/^https?:\/\//.test(val)) {
        const url = new URL(val);
        const search = url.searchParams;
        // 单本
        if (search.has('id') && REG_PURE_NUMBER.test(search.get('id')!))
            valid = true;
        // 系列
        if (REG_PATH_SERIES.test(url.pathname))
            valid = true;
    }

    // 检查重复
    if (valid) {
        const processed = await preprocess(val);
        if (Array.isArray(processed)) {
            // 解析结果为多本小说
            if (novels.some(novel => processed.some(p => novel.id === p)))
                input.value!.setError(t($custom.$input.$invalid.$partialDuplicate));
        } else {
            // 解析结果为单本小说
            if (novels.some(novel => novel.id === processed))
                return t($custom.$input.$invalid.$duplicate);
        }
    }

    return valid || t($custom.$input.$invalid.$common);
}

/**
 * 预处理字符串，规范化为字符串id
 * @param val 字符串
 */
async function preprocess(val: string): Promise<SingleOrArray<string>> {
    if (REG_PURE_NUMBER.test(val)) return val;
    const url = new URL(val);

    // 小说
    if (url.searchParams.has('id'))
        return url.searchParams.get('id')!;

    // 小说系列
    if (REG_PATH_SERIES.test(url.pathname)) {
        const seriesId = url.pathname.match(REG_PATH_SERIES)![1];

        // 系列数据
        const info = await series(seriesId);
        if (info === AbortSymbol) return [];

        // 系列目录
        const promises: Promise<typeof AbortSymbol | SeriesContentAPIPageItem[]>[] = [];
        for (let i = 0; i < info.body.publishedContentCount; i += 30) {
            const promise = (async () => {
                const d = await seriesContent(seriesId, 30, i, undefined);
                if (d === AbortSymbol) return AbortSymbol;
                return d.body.page.seriesContents;
            }) ();
            promises.push(promise);
        }
        const results = await Promise.all(promises);
        if (results.some(val => val === AbortSymbol)) return [];
        return (results as SeriesContentAPIPageItem[][]).reduce<string[]>(
            (ids, items) => {
                ids.push(...items.map(item => item.id));
                return ids;
            }, []
        );
    }

    throw new Error('Invalid preprocess value');
}
// #endregion
</script>

<template>
    <div
        class="flex flex-row gap-3"
    >
        <!-- 左侧小说列表输入框 -->
        <MultiInput
            v-model="ids"
            ref="input"
            class="grow shrink"
            :placeholder="t($custom.$input.$input.$id.$placeholder)"
            :code="['Enter', 'NumpadEnter', 'Space', 'Comma', 'NumpadComma']"
            :badge="false"
            :validate="validate"
            :preprocess="preprocess"
            @add="onAdd"
        />

        <!-- 右侧添加按钮 -->
        <Button
            severity="primary"
            type="text"
            :icon="MaterialSymbolsAdd"
            padding="p-2"
            @click="add"
        />
    </div>
</template>