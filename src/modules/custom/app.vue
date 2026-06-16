<!-- 自定义下载对话框内容 -->

<script setup lang="ts">
import MultiInput from '@/components/multi-input/multi-input.vue';
import { i18nKeys } from '@/i18n';
import { AbortSymbol, alert, isPixivDark } from '@/utils';
import { BUTTON_CONTROLLER_KEY } from '@/utils/helpers/popup/dialog/dialog';
import { computed, inject, reactive, ref, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Book from './book.vue';
import { PixivNovelAPIResponse } from '../api/novel/types/novel.ts';
import { novel } from '../api/index.ts';

const REG_PURE_NUMBER = /^\d+$/;

const { t } = useI18n();
const $custom = i18nKeys.$custom;

// #region props
const {} = defineProps<{}>();
// #endregion

// #region provide / inject
const buttons = inject(BUTTON_CONTROLLER_KEY)!;
// #endregion

// #region 输入框
const input = useTemplateRef('input');
// #endregion

// #region 数据
/**
 * 字符串id列表
 */
const value = ref<string[]>([]);

// 实时加载小说api数据
/**
 * 加载出错标志
 */
const ErrorSymbol: unique symbol = Symbol('Error loading api data');

/**
 * 小说API数据访问结果
 */
type NovelData = 
    | Promise<PixivNovelAPIResponse | typeof AbortSymbol>
    | PixivNovelAPIResponse
    | typeof ErrorSymbol;

/**
 * 小说字符串id - 小说api数据对照表  
 * 加载时存promise，加载完毕存raw数据
 */
const dataMap = reactive(new Map<string, NovelData>());
watch(value, async () => {
    for (const id of value.value) {
        // 跳过已加载和加载中的小说
        if (dataMap.has(id) && dataMap.get(id) !== ErrorSymbol) continue;
        
        // 加载小说数据
        const ctrl = new AbortController();
        const promise = novel(id, ctrl.signal);

        // 先在dataMap中存储promise
        dataMap.set(id, promise);

        // 加载完毕时更新存储的数据
        promise.then(d => {
            // 加载完成或取消时
            if (d !== AbortSymbol)
                // 加载完毕，将数据存入dataMap
                dataMap.set(id, d);
            else
                // 加载被取消，从dataMap移除promise
                dataMap.delete(id);
        }).catch(_err => {
            // 加载失败时，在dataMap中标记错误状态
            dataMap.set(id, ErrorSymbol);
        });
    }
}, { immediate: true, deep: true });

// 根据小说id列表和api数据对照表合成 小说api数据列表
const novels = computed<NovelData[]>(() => 
    value.value
        // 边缘情况：id列表中的某个小说还未开始加载数据，此时先不渲染此小说
        .filter(id => dataMap.has(id))
        // 按照dataMap，将id列表映射为数据列表
        .map(id => dataMap.get(id)!)
);

// 当没有内容时禁用确定按钮
watch(() => ({ input: input.value?.input, value }), ({ input, value }) => {
    const empty = value.value.length === 0 && input?.length === 0;
    empty ? buttons.disable(0) : buttons.enable(0);
}, { immediate: true, deep: true });

/**
 * 移除某一小说
 * @param id 小说id
 */
function remove(id: string) {
    const index = value.value.indexOf(id);
    index > -1 && value.value.splice(index, 1);
}

/**
 * 将某一小说前移
 * @param id 小说id
 */
function forward(id: string) {
    const index = value.value.indexOf(id);
    if (index <= 0) return;
    value.value.splice(index, 1);
    value.value.splice(index - 1, 0, id);
}

/**
 * 将某一小说后移
 * @param id 小说id
 */
function backward(id: string) {
    const index = value.value.indexOf(id);
    if (index === -1 || index === value.value.length - 1) return;
    value.value.splice(index, 1);
    value.value.splice(index + 1, 0, id);
}
// #endregion

// #region 对话框按钮逻辑
// 按下确定按钮时输入框中如有未提交内容，提交上去
buttons.onClick(0, async _e => {
    if (!input.value) return;
    if (!input.value.input.trim().length) return;
    const val = input.value.submit();

    // 未通过验证时
    if (val === false) {
        // 弹窗提示
        await alert(t($custom.$invalidInput.$content), {
            dark: isPixivDark,
            header: t($custom.$invalidInput.$header),
        });
        // 不关闭对话框，允许继续输入
        return false;
    }

    // 关闭对话框
    // 这里无返回值也可以（只要不是false都行），但为了清晰还是写上
    return true;
});
// #endregion

// #region 输入框逻辑
/**
 * 检查字符串是否合法
 * @param val 字符串
 */
function validate(val: string): true | string {
    let valid = false;

    // 检查格式
    if (REG_PURE_NUMBER.test(val)) valid = true;
    if (/^https?:\/\//.test(val)) {
        const search = new URL(val).searchParams;
        if (search.has('id') && REG_PURE_NUMBER.test(search.get('id')!))
            valid = true;
    }

    // 检查重复
    if (valid) {
        const processed = preprocess(val);
        if (value.value.includes(processed))
            return t($custom.$input.$invalid.$duplicate);
    }

    return valid || t($custom.$input.$invalid.$common);
}

/**
 * 预处理字符串，规范化为字符串id
 * @param val 字符串
 */
function preprocess(val: string): string {
    if (REG_PURE_NUMBER.test(val)) return val;
    return new URL(val).searchParams.get('id')!;
}
// #endregion

// #region 工具方法
function isPromise<T>(val: any): val is Promise<T> {
    return val instanceof Promise;
}
// #endregion

// #region expose
defineExpose({ value });
// #endregion
</script>

<template>
    <div
        class="flex flex-col gap-5"
    >
        <!-- 上方输入区域 -->
        <div
            class="flex flex-col gap-5"
        >
            <!-- 上方提示文本 -->
            <div class="whitespace-pre-wrap">{{ t($custom.$input.$content) }}</div>

            <!-- 下方输入框 -->
            <MultiInput
                v-model="value"
                ref="input"
                :code="['Enter', 'NumpadEnter', 'Space', 'Comma', 'NumpadComma']"
                :badge="false"
                :validate="validate"
                :preprocess="preprocess"
            />
        </div>

        <!-- 下方书单 -->
        <div
            v-if="novels.length"
            class="
                w-full max-h-[60vh] overflow-y-auto
                flex flex-col items-stretch
                p-px gap-px bg-surface-300 dark:bg-surface-700
            "
        >
            <template v-for="(novel, i) of novels">
                <!-- 加载失败 -->
                <div
                    v-if="novel === ErrorSymbol"
                    class="
                        flex justify-center items-center
                        px-3 py-2
                        bg-surface-100 dark:bg-surface-900
                        text-severity-error
                    "
                >{{ t($custom.$input.$preview.$error) }}</div>

                <!-- 加载中 -->
                <div
                    v-else-if="isPromise<PixivNovelAPIResponse | typeof AbortSymbol>(novel)"
                    class="
                        flex justify-center items-center
                        px-3 py-2
                        bg-surface-100 dark:bg-surface-900
                    "
                >{{ t($custom.$input.$preview.$loading) }}</div>

                <!-- 加载完毕 -->
                <Book
                    v-else
                    class="h-45"
                    :id="novel.body.id"
                    :num="i+1"
                    :cover="novel.body.coverUrl"
                    :title="novel.body.title"
                    :desc="novel.body.description"
                    :url="novel.body.extraData.meta.canonical"
                    :author="{
                        name: novel.body.userName,
                        avatar: Object.values(novel.body.userNovels).find(n => n?.profileImageUrl)?.profileImageUrl ?? null,
                        url: `https://www.pixiv.net/users/${ novel.body.userId }`,
                    }"
                    @remove="remove"
                    @forward="forward"
                    @backward="backward"
                />
            </template>
        </div>
    </div>
</template>