<!-- 自定义下载对话框内容 -->

<script setup lang="ts">
import MultiInput from '@/components/multi-input/multi-input.vue';
import { i18nKeys } from '@/i18n';
import { alert, isPixivDark } from '@/utils';
import { BUTTON_CONTROLLER_KEY } from '@/utils/helpers/popup/dialog/dialog';
import { inject, ref, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

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

// 当没有内容时禁用确定按钮
watch(() => ({ input: input.value?.input, value }), ({ input, value }) => {
    const empty = value.value.length === 0 && input?.length === 0;
    empty ? buttons.disable(0) : buttons.enable(0);
}, { immediate: true, deep: true });
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

// #region expose
defineExpose({ value });
// #endregion
</script>

<template>
    <div
        class="flex flex-col gap-10"
    >
        <!-- 上方提示文本 -->
        <div class="whitespace-pre-wrap">{{ t($custom.$input.$content) }}</div>

        <!-- 下方输入框 -->
        <MultiInput
            v-model="value"
            ref="input"
            :code="['Enter', 'NumpadEnter', 'Space', 'Comma', 'NumpadComma']"
            :validate="validate"
            :preprocess="preprocess"
        />
    </div>
</template>