<script setup lang="ts">
import Area from '@/components/area.vue';
import { i18nKeys } from '@/i18n';
import { isPixivDark } from '@/utils';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { inferCommonName, NovelData } from '../utils';
import Button from '@/components/button.vue';
import Toggle from '@/components/toggle.vue';

const { t } = useI18n();
const $custom = i18nKeys.$custom;

const { novels } = defineProps<{
    /**
     * 小说数据列表
     */
    novels: NovelData[];
}>();

export interface DownloadOptions {
    /**
     * 是否合并下载为一个Epub
     */
    merge: boolean;

    /**
     * 如果`merge`为`true`，使用什么文件名
     */
    filename: string;
}

const model = defineModel<DownloadOptions>({
    default: {
        merge: false,
        filename: '',
    }
});

// #region 合并下载文件名自动推断逻辑

/**
 * 文件名输入框值
 */
const filenameInput = ref(model.value.filename);

/**
 * 输入框值是否已经被手动修改过
 */
const filenameEdited = ref<boolean>(false);

/**
 * 自动计算的文件名
 */
const commonFilename = ref('');

// 根据小说数据自动计算文件名
const updateCommonFilename = () => {
    // 提取全部已加载数据的小说的标题
    const titles = novels
        .filter(n => n.data !== null)
        .map(n => n.data!.body.title);

    // 如果有共同名称，就用共同名称；否则就用第一本小说的标题；再否则（没有任何数据时）就是空字符串
    commonFilename.value = inferCommonName(titles, 3, true) ?? titles[0] ?? '';

    // 当自动计算的发生变动时，若尚未手动修改过文件名，就将自动计算的文件名填入输入框
    if (!filenameEdited.value) filenameInput.value = commonFilename.value;
};
// 自动计算文件名
watch(
    () => novels,
    () => updateCommonFilename(),
    { deep: true, immediate: true }
);

// 当输入值/计算值变动时，更新模型值
watch(
    () => ({
        filenameInput: filenameInput.value,
        filenameEdited: filenameEdited.value,
        commonFilename: commonFilename.value,
    }),
    ({ filenameInput, filenameEdited, commonFilename }) =>
        model.value.filename = filenameEdited ?
            filenameInput : commonFilename
, { deep: true, immediate: true });
// #endregion
</script>

<template>
    <Area
        :label="t($custom.$input.$options.$label)"
        :bg-color="isPixivDark ? 'var(--color-surface-900)' : 'var(--color-surface-100)'"
        color="color-mix(in srgb, currentcolor 50%, transparent)"
        class="flex flex-col gap-5"
    >
        <!-- 合并下载开关 -->
        <div
            class="flex flex-row justify-between items-center"
        >
            <div>{{ t($custom.$input.$options.$merge) }}</div>
            <Toggle v-model="model.merge" />
        </div>
        
        <!-- 文件名 -->
        <div class="relative flex flex-row gap-3">
            <input
                v-model="filenameInput"
                type="text"
                :placeholder="t($custom.$input.$options.$filename)"
                class="
                    grow shrink
                    text-surface-800 dark:text-surface-200
                    bg-surface-100 dark:bg-surface-800
                    border border-solid border-surface-300 dark:border-surface-700
                    focus-visible:outline-none focus-visible:border-primary-400
                    p-2
                "
                @input="filenameEdited = true"
            >
            <Button
                :label="t($custom.$input.$calcFilename)"
                type="text"
                severity="normal"
                :callback="updateCommonFilename"
            />
            <div
                v-if="!model.merge"
                class="
                    absolute top-0 left-0 w-full h-full
                    cursor-not-allowed z-1
                    backdrop-brightness-75 backdrop-grayscale-100
                "
            ></div>
        </div>
    </Area>
</template>