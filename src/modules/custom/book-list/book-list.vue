<!-- 书单 -->
<script setup lang="ts">
import { i18nKeys } from '@/i18n';
import { useI18n } from 'vue-i18n';
import { NovelData } from '../utils';
import Book from './book.vue';
import { alert, isPixivDark } from '@/utils/index.ts';
import Area from '@/components/area.vue';
import Button from '@/components/button.vue';
import MaterialSymbolsRefresh from '~icons/material-symbols/refresh';
import MaterialSymbolsCheck from '~icons/material-symbols/check';
import MaterialSymbolsClose from '~icons/material-symbols/close';
import MaterialSymbolsFilterList from '~icons/material-symbols/filter-list';
import { Component, computed, ref, watch } from 'vue';
import FilterEditor, { Filter, FilterDef } from './filter-editor.vue';
import IncludeTag from './filter-input/include-tag.vue';
import ExcludeTag from './filter-input/exclude-tag.vue';
import IncludeTitle from './filter-input/include-title.vue';
import ExcludeTitle from './filter-input/exclude-title.vue';
import Favorite from './filter-input/favorite.vue';

const { t } = useI18n();
const $list = i18nKeys.$custom.$input.$list;
const $dialog = i18nKeys.$custom.$input.$dialog;

// #region props
const { novels }= defineProps<{
    novels: NovelData[];
}>();
// #endregion

// #region emits
const emit = defineEmits<{
    /** 更改小说列表 */
    update: [ids: string[]];
    /** 移除一本小说 */
    remove: [id: string];
    /** 重新加载小说数据 */
    reload: [id: string];
    /** 禁用下载按钮 */
    'disable-download': [reason: boolean | string];
    /** 启用下载按钮 */
    'enable-download': [];
}>();
// #endregion

// #region 数据
/**
 * 移除某一小说
 * @param id 小说id
 */
function remove(id: string) {
    if (novels.every(n => n.id !== id)) return;
    emit('remove', id);
}

/**
 * 将某一小说前移
 * @param id 小说id
 */
function forward(id: string) {
    const ids = novels.map(novel => novel.id);
    const index = ids.indexOf(id);
    if (index <= 0) return;
    ids.splice(index, 1);
    ids.splice(index - 1, 0, id);
    emit('update', ids);
}

/**
 * 将某一小说后移
 * @param id 小说id
 */
function backward(id: string) {
    const ids = novels.map(novel => novel.id);
    const index = ids.indexOf(id);
    if (index === -1 || index === ids.length - 1) return;
    ids.splice(index, 1);
    ids.splice(index + 1, 0, id);
    emit('update', ids);
}

/**
 * 重新加载指定小说数据
 * @param id 小说id
 */
function reload(id: string) {
    if (novels.every(n => n.id !== id)) throw new Error(`attempt to reload novel (${ id }) that is not in novels list`);
    emit('reload', id);
}
// #endregion

// #region 筛选
/**
 * 筛选实现
 */
interface FilterImpl {
    type: string;
    label: string;
    input: Component;
    initial: any;
    filter(novels: NovelData[], value: any): NovelData[];
}

/**
 * 所有筛选实现
 */
const filterImpls: FilterImpl[] = [{
    type: 'include-title',
    label: t($list.$filter.$includeTitle),
    input: IncludeTitle,
    initial: '',
    filter(novels, title) {
        if (!title.length) return novels;
        return novels.filter(novel => novel.data!.body.title.includes(title));
    },
}, {
    type: 'exclude-title',
    label: t($list.$filter.$excludeTitle),
    input: ExcludeTitle,
    initial: '',
    filter(novels, title) {
        if (!title.length) return novels;
        return novels.filter(novel => !novel.data!.body.title.includes(title));
    },
}, {
    type: 'include-tag',
    label: t($list.$filter.$includeTag),
    input: IncludeTag,
    initial: '',
    filter(novels, tag) {
        if (!tag.length) return novels;
        return novels.filter(novel =>
            novel.data!.body.tags.tags.some(t => t.tag === tag) ||
            novel.data!.body.tags.tags.some(t => t.translation && Object.values(t.translation).some(t => t === tag))
        );
    },
}, {
    type: 'exclude-tag',
    label: t($list.$filter.$excludeTag),
    input: ExcludeTag,
    initial: '',
    filter(novels, tag) {
        if (!tag.length) return novels;
        return novels.filter(novel =>
            novel.data!.body.tags.tags.every(t => t.tag !== tag) &&
            novel.data!.body.tags.tags.every(t => !t.translation || Object.values(t.translation).every(t => t !== tag))
        );
    },
}, {
    type: 'favorite',
    label: t($list.$filter.$favorite.$label),
    input: Favorite,
    initial: 'include',
    filter(novels, favorite) {
        return novels.filter(novel =>
            favorite === 'include' ?
                novel.data!.body.bookmarkData !== null :
                novel.data!.body.bookmarkData === null
        );
    }
}];

/**
 * 筛选定义列表  
 * 由筛选实现列表计算得来
 */
const filterDefs: FilterDef[] = filterImpls.map(impl => ({
    type: impl.type,
    label: impl.label,
    initial: impl.initial,
    input: impl.input,
}));

/**
 * 筛选模式开关，控制：
 * - 筛选UI是否可见
 * - 书单展示筛选列表还是原始列表
 */
const filterMode = ref(false);

/**
 * 筛选条件列表
 */
const filters = ref<Filter[]>([]);

/**
 * 筛选后的小说列表
 */
const filteredNovels = computed(() => {
    // 对所有筛选条件串行筛选，仅筛选已加载完毕的小说
    let list = novels.filter(n => n.data !== null);
    for (const filter of filters.value) {
        const impl = filterImpls.find(impl => impl.type === filter.type);
        if (!impl) throw new Error(`filter type not implemented: ${ filter.type }`);
        list = impl.filter(list, filter.value);
    }
    return list;
});

/**
 * 确认筛选：把筛选结果应用为真实小说列表，清空筛选条件，并退出筛选模式
 */
function applyFilter() {
    // 仅当所有小说数据均加载完毕时才允许提交筛选结果
    const novelsNotLoaded = novels.filter(n => !n.data);
    if (novelsNotLoaded.length) alert(t($list.$filterNotLoaded, { count: novelsNotLoaded.length }));

    // 提交筛选结果并清空filters
    emit('update', filteredNovels.value.map(n => n.id));
    filters.value = [];
    filterMode.value = false;
}

/**
 * 取消筛选：清空筛选条件，并退出筛选模式
 */
function clearFilter() {
    filters.value = [];
    filterMode.value = false;
}
// #endregion

// #region 对话框按钮逻辑
// 处于筛选模式时禁用确定按钮
watch(filterMode, mode => {
    mode ? emit('disable-download', t($dialog.$disable.$filterMode)) : emit('enable-download');
}, { immediate: true, deep: true });
// #endregion
</script>

<template>
    <Area
        :bg-color="isPixivDark ? 'var(--color-surface-900)' : 'var(--color-surface-100)'"
        color="color-mix(in srgb, currentcolor 50%, transparent)"
        class="w-full h-full basis-1/2 min-w-0"
    >
        <!-- 标签 -->
        <template #label>
            <div class="flex flex-row gap-3 items-center">
                <span>{{
                    filterMode ?
                        t($list.$labelFilter, { preserved: filteredNovels.length, total: novels.length }) :
                        t($list.$label, { total: novels.length })
                }}</span>
                <template v-if="!filterMode">
                    <!-- 未打开筛选时，显示筛选按钮 -->
                    <Button
                        severity="normal"
                        type="text"
                        padding="p-1"
                        class="pointer-events-auto"
                        :icon="MaterialSymbolsFilterList"
                        @click="filterMode = true"
                    />
                </template>
                <template v-else>
                    <!-- 已打开筛选时，显示确认和取消按钮 -->
                    <Button
                        severity="normal"
                        type="text"
                        padding="p-1"
                        class="pointer-events-auto"
                        :icon="MaterialSymbolsCheck"
                        :disabled="filters.length === 0 ? t($list.$noFilter) : false"
                        @click="applyFilter()"
                    />
                    <Button
                        severity="normal"
                        type="text"
                        padding="p-1"
                        class="pointer-events-auto"
                        :icon="MaterialSymbolsClose"
                        @click="clearFilter()"
                    />
                </template>
            </div>
        </template>

        <!-- 内容 -->
        <template #default>
            <div
                class="
                    w-full h-full
                    flex flex-col items-stretch gap-3
                "
            >
                <!-- 筛选器 -->
                <FilterEditor
                    v-show="filterMode"
                    v-model="filters"
                    :filter-defs="filterDefs"
                />

                <!-- 书单 -->
                <div
                    v-if="filterMode ? filteredNovels : true"
                    class="
                        w-full grow shrink overflow-auto
                    "
                >
                    <div
                        v-if="(filterMode ? filteredNovels : novels).length > 0"
                        v-for="(novel, i) of (filterMode ? filteredNovels : novels)"
                        class="
                            w-full max-h-full overflow-y-auto
                            flex flex-col items-stretch
                            p-px gap-px bg-surface-300 dark:bg-surface-700
                        "
                    >
                        <!-- 加载失败 -->
                        <div
                            v-if="novel.error"
                            class="
                                flex flex-row justify-center items-center gap-2
                                px-3 py-2
                                bg-surface-100 dark:bg-surface-900
                                text-severity-error
                                cursor-pointer
                            "
                            @click="reload(novel.id)"
                        >
                            <div>{{ t($list.$preview.$error) }}</div>
                            <MaterialSymbolsRefresh />
                            <MaterialSymbolsClose @click.stop="$emit('remove', novel.id)" />
                        </div>

                        <!-- 加载中 -->
                        <div
                            v-else-if="novel.loading"
                            class="
                                flex flex-row justify-center items-center gap-2
                                px-3 py-2
                                bg-surface-100 dark:bg-surface-900
                            "
                        >
                            <div>{{ t($list.$preview.$loading) }}</div>
                            <MaterialSymbolsClose class="cursor-pointer" @click.stop="$emit('remove', novel.id)" />
                        </div>

                        <!-- 加载完毕 -->
                        <Book
                            v-else-if="novel.data !== null"
                            class="h-45"
                            :id="novel.data.body.id"
                            :num="i+1"
                            :cover="novel.data.body.coverUrl"
                            :title="novel.data.body.title"
                            :desc="novel.data.body.description"
                            :url="novel.data.body.extraData.meta.canonical"
                            :author="{
                                name: novel.data.body.userName,
                                avatar: Object.values(novel.data.body.userNovels).find(n => n?.profileImageUrl)?.profileImageUrl ?? null,
                                url: `https://www.pixiv.net/users/${ novel.data.body.userId }`,
                            }"
                            :movable="!filterMode"
                            @remove="remove"
                            @forward="forward"
                            @backward="backward"
                        />
                    </div>

                    <div
                        v-else
                        class="
                            w-full h-full
                            flex justify-center items-center
                            text-surface-500 dark:text-surface-400
                        "
                    >{{ t($list.$empty) }}</div>
                </div>
            </div>
        </template>
    </Area>
</template>