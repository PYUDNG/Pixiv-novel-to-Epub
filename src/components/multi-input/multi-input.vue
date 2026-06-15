<!-- 接受多个字符串输入的输入框 -->
<script setup lang="ts">
import { ref } from 'vue';
import TextTag from './text-tag.vue';
import { SingleOrArray } from '@/utils/index.ts';
import { useI18n } from 'vue-i18n';
import { i18nKeys } from '@/i18n/utils.ts';

const { t } = useI18n();
const $multiInput = i18nKeys.$components.$multiInput;

// #region props
const {
    code = ['Enter', 'NumpadEnter'],
    trim = true,
    allowEmpty = false,
    badge = true,
    validate = _v => true,
    preprocess = v => v,
} = defineProps<{
    /**
     * 触发分隔的按键名  
     * 当用户按下这些按键之一时，将会把之前的输入分隔为一个字符串，后续输入作为新的字符串  
     * 接受单个按键名或按键名数组  
     * 按键名可参考 {@link https://developer.mozilla.org/docs/Web/API/KeyboardEvent/code#code_values}
     * @default ['Enter', 'NumpadEnter']
     */
    code?: SingleOrArray<string>;
    
    /**
     * 是否自动去除字符串的首尾空白（`.trim()`）
     * @default true
     */
    trim?: boolean;

    /**
     * 是否允许空字符串  
     * 举个例子：未输入任何内容时敲击回车，是否添加一个空字符串到模型值  
     * 注意：先根据`trim`属性去除首尾空白后，再判断是否为空字符串
     * @default false
     */
    allowEmpty?: boolean;

    /**
     * 是否显示已输入值badge
     * @default true
     */
    badge?: boolean;
    
    /**
     * 数据验证方法  
     * 在即将添加新字符串时，检查新字符串内容是否合法  
     * @example val => /^\d+$/.test(val) || '错误：您输入的不是正整数'
     * @param value 新字符串内容
     * @returns 代表是否合法的布尔值，或者一个字符串表示不合法原因（将被显示给用户）
     */
    validate?(value: string): boolean | string;

    /**
     * 数据预处理方法  
     * 在即将添加新字符串之前，对用户输入的字符串进行预处理，可以改变字符串的值
     * @param value 新字符串原始内容
     * @returns 处理后最终添加到模型值中的字符串值
     */
    preprocess?(value: string): string;
}>();
// #endregion

// #region emits
const emit = defineEmits<{
    /**
     * 新字符串添加
     */
    add: [value: string];

    /**
     * 输入数据不合法  
     * `reason`可能不存在（传入的validate函数可能返回false而不是字符串原因）
     */
    invalid: [value: string, reason?: string];
}>();
// #endregion

// #region 组件模型值
const model = defineModel<string[]>({
    default: [],
});

/**
 * 添加一个字符串到模型值
 * @param str 字符串
 */
function add(str: string) {
    model.value.push(str);
}
// #endregion

// #region 输入框逻辑
/**
 * 内部`<input>`元素模型值
 */
const input = ref<string>('');

/**
 * 错误信息文本
 */
const error = ref<string>('');

/**
 * keydown事件处理器
 * @param e 输入事件
 * @returns 返回值无所谓
 */
function onKeyDown(e: KeyboardEvent): void {
    // 仅处理声明的按键
    if (Array.isArray(code) ? !code.includes(e.code) : code !== e.code) return;

    // 提交输入框内容到模型值
    submit();

    // 不再输入按键
    e.preventDefault();
}

/**
 * 将输入框内值添加到模型值，负责：
 * - 根据输入自动分隔字符串
 * - 空字符串验证
 * - 数据验证 和 invalid事件
 * - 字符串添加事件
 * @param e 输入事件
 * @returns 通过验证 ? 最终添加的值 : false
 */
function submit(): string | false {
    // 当前值
    const val = trim ? input.value.trim() : input.value;

    // 检查空字符串情况
    if (val.length === 0 && !allowEmpty) return false;

    // 数据验证
    const valid = validate(val);
    if (valid === false) {
        error.value = t($multiInput.$invalid);
        emit('invalid', val);
        return false;
    }
    if (typeof valid === 'string') {
        error.value = valid;
        emit('invalid', val, valid);
        return false;
    }
    error.value = '';

    // 清空输入框
    input.value = '';

    // 将字符串添加到模型值
    const processed = preprocess(val);
    model.value.push(processed);

    // 字符串添加事件
    emit('add', val);

    return processed;
}
// #endregion

// #region 输入框状态
const focused = ref(false);
// #endregion

// #region expose
defineExpose({ error, input, add, submit });
// #endregion
</script>

<template>
    <div
        class="
            w-full
            flex flex-col gap-1
            text-surface-800 dark:text-surface-200
            bg-transparent
        "
    >
        <!-- 上方输入框 -->
        <div
            class="
                w-full min-h-8
                flex flex-row gap-2
                text-surface-800 dark:text-surface-200
                bg-surface-100 dark:bg-surface-800
                border border-solid
            "
            :class="{
                'border-primary-400 dark:border-primary-400': focused,
                'border-surface-300 dark:border-surface-700': !focused,
            }"
        >
            <!-- 把Tags和输入框放到一个容器里以应用flex-wrap自动换行 -->
            <div
                class="w-full flex flex-row flex-wrap items-center gap-1 p-2"
            >
                <!-- 前面显示所有已输入的字符串 -->
                <TextTag
                    v-if="badge"
                    v-for="(str, i) of model"
                    :text="str"
                    @remove="model.splice(i, 1)"
                />

                <!-- 后面输入框 -->
                <input
                    v-model="input"
                    type="text"
                    class="
                        w-30 grow shrink
                        border-none outline-none
                    "
                    @keydown="onKeyDown"
                    @focus="focused = true"
                    @blur="focused = false"
                >
            </div>
        </div>

        <!-- 下方错误信息 -->
        <div
            class="text-sm text-red-700 dark:text-red-400"
            :style="{
                visibility: error ? 'visible' : 'hidden',
            }"
        >{{ error }}</div>
    </div>
</template>