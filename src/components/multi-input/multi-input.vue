<!-- 接受多个字符串输入的输入框 -->
<script setup lang="ts">
import { ref } from 'vue';
import TextTag from './text-tag.vue';
import { globalLogger } from '@/utils/index.ts';
import { useI18n } from 'vue-i18n';
import { i18nKeys } from '@/i18n/utils.ts';

const { t } = useI18n();
const $multiInput = i18nKeys.$components.$multiInput;
const logger = globalLogger.withPath('components', 'multi-input');

// #region props
const {
    delimiter = /(,| |[\n\r]+)/,
    allowEmpty = false,
    validate = _v => true,
} = defineProps<{
    /**
     * 用作字符串之间的分隔符的字符  
     * 当用户输入到这些字符之一时，将会把之前的输入分隔为一个字符串，后续输入作为新的字符串  
     * 支持字符串写法（如`', \n'`）、数组写法（如`[' ', '\n', ',']`）和正则表达式（如`/[ \n,]/`）
     * @default /(,| |[\n\r]+)/
     */
    delimiter?: string | string[] | RegExp;

    /**
     * 是否允许空字符串  
     * 举个例子：未输入任何内容时敲击回车，是否添加一个空字符串到模型值
     * @default false
     */
    allowEmpty?: false,
    
    /**
     * 数据验证方法  
     * 在即将添加新字符串时，检查新字符串内容是否合法  
     * @example val => /^\d+$/.test(val) || '错误：您输入的不是正整数'
     * @param value 新字符串内容
     * @returns 代表是否合法的布尔值，或者一个字符串表示不合法原因（将被显示给用户）
     */
    validate?(value: string): boolean | string,
}>();
// #endregion

// #region emits
const emit = defineEmits<{
    /**
     * 新字符串添加
     */
    add: [value: string];
}>();
// #endregion

// #region 组件模型值
const model = defineModel<string[]>({
    default: [],
});
// #endregion

// #region 输入框逻辑
const input = ref<string>('');
const error = ref<string>('');

/**
 * input事件处理器，负责：
 * - 根据输入自动分隔字符串
 * - 空字符串验证
 * - 数据验证
 * - 字符串添加事件
 * @param _e 输入事件
 * @returns 返回值无所谓
 */
function inputHandler(_e: InputEvent): any {
    const result = testDelimiter();
    if (!result.split) return;

    // 检查空字符串情况
    if (result.value.length === 0 && !allowEmpty) return;

    // 数据验证
    const valid = validate(result.value);
    if (valid === false) return error.value = t($multiInput.$invalid);
    if (typeof valid === 'string') return error.value = valid;
    error.value = '';

    // 将字符串添加到模型值
    model.value.push(result.value);

    // 清空输入框
    input.value = '';

    // 字符串添加事件
    emit('add', result.value);

    type DelimiterTestResult = {
        /** 是否应当分隔 */
        split: false;
    } | {
        /** 是否应当分隔 */
        split: true;
        /** 分隔符出来的完整字符串 */
        value: string;
    }
    /**
     * 检查输入文本是否应当触发分隔（是否以分隔符之一结尾） 
     */
    function testDelimiter(): DelimiterTestResult {
        // 数组 或 字符串
        if (Array.isArray(delimiter) || typeof delimiter === 'string') {
            for (const d of delimiter) {
                if (input.value.endsWith(d)) {
                    return {
                        split: true,
                        value: input.value.substring(0, input.value.indexOf(d)),
                    }
                }
            }
            return { split: false };
        }

        // 正则表达式
        if (delimiter instanceof RegExp) {
            // 移除全局匹配和粘性匹配flags，并添加结尾
            const safeFlags = delimiter.flags.replace(/[gy]/g, '');

            // 已有结尾$符号时，去除$符号，确保后续添加后不重复
            const hasDollar = delimiter.source.endsWith('$');
            const source = hasDollar ? delimiter.source.slice(0, -1) : delimiter.source;

            // 构建新的正则进行测试
            const newRegex = new RegExp(`^([\s\S]*)(${source})$`, safeFlags);
            const match = input.value.match(newRegex);

            return match ? {
                split: true,
                value: match[1],
            } : {
                split: false,
            };
        }

        // 理论不可达：delimiter类型均不属于上述分支
        logger.simple('Error', 'Unexpected delimiter type');
        logger.asLevel('Error', delimiter);
        throw new TypeError('unexpected delimiter type');
    }
}
// #endregion

// #region expose
defineExpose({ error });
// #endregion
</script>

<template>
    <div
        class="
            w-full
            flex flex-col gap-1
            text-surface-800 dark:text-surface-200
            bg-surface-100 dark:bg-surface-800
        "
    >
        <!-- 上方输入框 -->
        <div
            class="
                w-full min-h-8
                text-surface-800 dark:text-surface-200
                bg-surface-100 dark:bg-surface-800
                border border-solid border-surface-300 dark:border-surface-700
                focus-visible:outline-none focus-visible:border-primary-400
                p-2
            "
        >
            <!-- 左侧显示所有已输入的字符串 -->
            <div
                class="flex flex-row items-center gap-1"
            >
                <TextTag v-for="str of model" :text="str" />
            </div>

            <!-- 右侧输入框 -->
            <textarea v-model="input" type="text" @input="inputHandler"></textarea>
        </div>

        <!-- 下方错误信息 -->
        <div
            class="text-sm text-red-700 dark:text-red-500"
            :style="{
                visibility: error ? 'visible' : 'hidden',
            }"
        >{{ error }}</div>
    </div>
</template>