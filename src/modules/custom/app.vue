<!-- 自定义下载对话框内容 -->

<script setup lang="ts">
import { i18nKeys } from '@/i18n';
import { AbortSymbol, isPixivDark, SingleOrArray } from '@/utils';
import { BUTTON_CONTROLLER_KEY } from '@/utils/helpers/popup/dialog/dialog';
import { inject, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { novel } from '../api/index.ts';
import type { NovelData } from './utils.ts';
import LinkInput from './book-input/link-input.vue';
import IDInput from './book-input/id-input.vue';
import BookList from './book-list/book-list.vue';
import Area from '@/components/area.vue';
import DownloadOptions, { type DownloadOptions as IDownloadOptions } from './download-options/download-options.vue';

const { t } = useI18n();
const $custom = i18nKeys.$custom;

// #region props
const {} = defineProps<{}>();
// #endregion

// #region provide / inject
const buttons = inject(BUTTON_CONTROLLER_KEY)!;
// #endregion

// #region 数据
/**
 * 小说id列表
 */
const ids = ref<string[]>([]);

// 实时加载小说api数据
/**
 * 小说api数据列表
 */
const novels = ref<NovelData[]>([]);

// 当小说id列表变动时，同步novels数据
watch(ids, async () => {
    // 先把novels现有数据导出来，并清空novels数组
    const novels_bak = novels.value.splice(0, novels.value.length);

    // 按顺序重建novels数组
    for (const id of ids.value) {
        // 已有小说数据对象的直接导入
        const existingNovel = novels_bak.find(n => n.id === id);
        if (existingNovel) {
            novels.value.push(existingNovel);
            continue;
        }
        
        // 加载小说数据
        load(id);
    }
}, { immediate: true, deep: true });

/**
 * 加载指定id小说数据到novels列表  
 * 如果novels列表中已有该小说就更新数据  
 * 如果novels列表中没有该小说就新增数据  
 * 新增数据时，会先添加数据进入novels列表，再异步更新它
 * @param id 
 */
function load(id: string) {
    // 操作模式：新增还是更新
    const action = novels.value.some(n => n.id === id) ? 'update' : 'add';

    // 加载小说数据
    const ctrl = new AbortController();
    const promise = novel(id, ctrl.signal);

    // 小说数据对象
    const data: NovelData =
        novels.value.find(n => n.id === id)
        ?? reactive({
            id,
            data: null,
            loading: true,
            error: false,
            promise: promise
                .then(val => val === AbortSymbol ? null : val)
                .catch(_err => null),
        });
    if (action === 'add') novels.value.push(data);
    if (action === 'update') {
        data.loading = true;
        data.error = false;
    }

    // 备份旧数据以备取消加载时恢复
    const dataBak = action === 'update' ? Object.assign({}, data) : null;

    // 加载完毕时更新数据
    promise.then(d => {
        // 脱离加载中状态
        data.loading = false;

        // 加载完成或取消时
        if (d !== AbortSymbol) {
            // 加载完毕，更新数据
            data.data = d;
        } else {
            // 加载被取消
            if (action === 'add') {
                // 取消新增：移除该小说数据
                const index = novels.value.indexOf(data);
                novels.value.splice(index, 1);
            } else {
                // 取消更新：恢复原有数据
                Object.assign(data, dataBak);
            }
        }
    }).catch(_err => {
        // 加载失败，标记错误状态
        data.error = true;
    });
}
// #endregion

// #region 输入组件逻辑
const inputComps = [
    LinkInput,
    IDInput,
]

/**
 * 输入组件`add`事件处理器  
 * 将输入组件的新增值添加到`ids`数组中
 * @param newIds 
 */
function onAdd(newIds: SingleOrArray<string>) {
    Array.isArray(newIds) ?
        ids.value.push(...newIds) :
        ids.value.push(newIds);
}
// #endregion

// #region 对话框按钮逻辑
// 当没有内容时禁用确定按钮
watch(ids, ids => {
    const empty = ids.length === 0;
    empty ? buttons.disable(0) : buttons.enable(0);
}, { immediate: true, deep: true });
// #endregion

// #region 下载选项
const options = ref<IDownloadOptions>({
    merge: false,
    filename: '',
});
// #endregion

// #region 工具方法
// #endregion

// #region expose
defineExpose({ ids, options });
// #endregion
</script>

<template>
    <div
        class="
            w-full h-full
            flex flex-row gap-5
        "
    >
        <!-- 左侧输入区域 -->
        <div class="flex flex-col justify-between items-stretch gap-5 basis-1/2 min-w-0">
            <!-- 上方小说添加方式 -->
            <Area
                :label="t($custom.$input.$input.$label)"
                :bg-color="isPixivDark ? 'var(--color-surface-900)' : 'var(--color-surface-100)'"
                color="color-mix(in srgb, currentcolor 50%, transparent)"
                class="grow shrink"
            >
                <div class="flex flex-col gap-5 items-stretch">
                    <div>{{ t($custom.$input.$input.$guide) }}</div>
                    <component
                        v-for="comp of inputComps"
                        :is="comp"
                        :novels="novels"
                        @add="onAdd"
                    />
                </div>
            </Area>
            
            <!-- 底部下载选项 -->
            <DownloadOptions v-model="options" :novels="novels" />
        </div>

        <!-- 右侧书单 -->
        <Area
            :label="t($custom.$input.$list.$label, { total: novels.length })"
            :bg-color="isPixivDark ? 'var(--color-surface-900)' : 'var(--color-surface-100)'"
            color="color-mix(in srgb, currentcolor 50%, transparent)"
            class="w-full h-full basis-1/2 min-w-0"
        >
            <BookList
                :novels="novels"
                @remove="id => ids.splice(ids.indexOf(id), 1)"
                @sort="sorted => ids = sorted"
                @reload="id => load(id)"
            />
        </Area>
    </div>
</template>