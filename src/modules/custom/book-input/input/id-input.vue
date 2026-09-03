<script setup lang="ts">
import { i18nKeys } from '@/i18n';
import { useI18n } from 'vue-i18n';
import { NovelData } from '../../utils';
import MultiInput from '@/components/multi-input/multi-input.vue';
import { ref, useTemplateRef, watch } from 'vue';
import { AbortSymbol, deepEqual, SingleOrArray } from '@/utils';
import Button from '@/components/button.vue';
import MaterialSymbolsAdd from '~icons/material-symbols/add';
import { userProfileAll } from '@/modules/api';
import Select, { SelectOption } from '@/components/select.vue';
import { getSeriesNovels, getUserNovelBookmarks } from '../utils';

const REG_PURE_NUMBER = /^\d+$/;

const { t } = useI18n();
const $id = i18nKeys.$custom.$input.$input.$id;

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

// #region Select数据
type IDType = 'novel' | 'series' | 'author' | 'favorite:public' | 'favorite:private';
type SplitColon<T extends string> = 
  T extends `${infer M}:${infer S}` 
    ? [M, S] 
    : [T, undefined];
const splitType = <T extends string>(type: T) => type.split(':') as SplitColon<T>;
const type = ref<IDType>('novel');
const options: SelectOption<IDType>[] =
    (['novel', 'series', 'author', 'favorite:public', 'favorite:private'] as const satisfies IDType[]).map(
        type => ({
            label: t(`${ $id.$options }.${ type }`),
            value: type,
        })
    );
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
    // 检查格式
    // 小说ID
    if (!REG_PURE_NUMBER.test(val))
        return t($id.$invalidId);

    // 检查重复
    const processed = await preprocess(val);
    if (Array.isArray(processed)) {
        // 解析结果为多本小说
        if (novels.some(novel => processed.some(p => novel.id === p)))
            input.value!.setError(t($id.$partialDuplicate));
    } else {
        // 解析结果为单本小说
        if (novels.some(novel => novel.id === processed))
            return t($id.$duplicate);
    }

    return true;
}

/**
 * 预处理字符串，规范化为字符串id
 * @param val 字符串
 */
async function preprocess(val: string): Promise<SingleOrArray<string>> {
    // 根据类型解析ID列表
    const [mainType, subType] = splitType(type.value);
    switch (mainType) {
        // 小说
        case 'novel': return val;

        // 小说系列
        case 'series': {
            const data = await getSeriesNovels(val);
            if (data === AbortSymbol) return [];
            return data;
        }

        // 作者的全部小说
        case 'author': {
            const list = await userProfileAll(val);
            if (list === AbortSymbol) return [];
            return Object.keys(list.body.novels);
        }

        // 用户收藏
        case 'favorite': {
            const list = await getUserNovelBookmarks(val, subType);
            if (list === AbortSymbol) return [];
            return list;
        }

        default: {
            throw new Error('Invalid preprocess value');
        }
    }
}
// #endregion
</script>

<template>
    <div
        class="flex flex-row gap-3"
    >
        <!-- 左侧输入区域 -->
        <div class="flex flex-row gap-3 grow  min-w-0">
            <!-- 左侧ID类型选择框 -->
            <Select
                v-model="type"
                class="basis-3/8 grow-0 shrink"
                :options="options"
            />

            <!-- 右侧小说列表输入框 -->
            <MultiInput
                v-model="ids"
                ref="input"
                class="grow"
                :placeholder="t($id.$placeholder)"
                :code="['Enter', 'NumpadEnter', 'Space', 'Comma', 'NumpadComma']"
                :badge="false"
                :validate="validate"
                :preprocess="preprocess"
                @add="onAdd"
            />
        </div>

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