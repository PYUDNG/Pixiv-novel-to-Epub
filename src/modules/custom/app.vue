<!-- 自定义下载对话框内容 -->

<script setup lang="ts">
import { AbortSymbol, SingleOrArray } from '@/utils';
import { BUTTON_CONTROLLER_KEY } from '@/utils/helpers/popup/dialog/dialog';
import { inject, reactive, ref, watch } from 'vue';
import { novel } from '../api/index.ts';
import type { NovelData } from './utils.ts';
import BookList from './book-list/book-list.vue';
import DownloadOptions, { type DownloadOptions as IDownloadOptions } from './download-options/download-options.vue';
import BookInput from './book-input/book-input.vue';
import { useI18n } from 'vue-i18n';
import { i18nKeys } from '@/i18n/utils.ts';

const { t } = useI18n();
const $dialog = i18nKeys.$custom.$input.$dialog;

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
/**
 * 禁用状态注册表  
 * 记录了app自身及所有子组件对下载对话框「确定」按钮的禁用状态
 */
const disableStatus = ref<Record<
    'app' | 'bookList',
    boolean | string
>>({
    app: false,
    bookList: false,
});

// 监听注册表数据，实时更新按钮禁用状态
watch(disableStatus, status => {
    const disabled = Object.values(status).some(val => val !== false);
    const reasons = Object.values(status).filter(val => typeof val === 'string');
    disabled ? buttons.disable(0, reasons.length ? reasons.join('\n') : undefined) : buttons.enable(0);
}, { deep: true, immediate: true });

// 当没有内容时禁用确定按钮
watch(ids, ids => {
    const empty = ids.length === 0;
    disableStatus.value.app = empty ? t($dialog.$disable.$noNovels) : false;
}, { immediate: true, deep: true });

// 根据子组件的请求禁用
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
            <BookInput :novels="novels" @add="onAdd" />
            
            <!-- 底部下载选项 -->
            <DownloadOptions v-model="options" :novels="novels" />
        </div>

        <!-- 右侧书单 -->
        <BookList
            :novels="novels"
            @remove="id => ids.splice(ids.indexOf(id), 1)"
            @update="newIds => ids = newIds"
            @reload="id => load(id)"
            @disable-download="reason => disableStatus.bookList = reason"
            @enable-download="disableStatus.bookList = false"
        />
    </div>
</template>