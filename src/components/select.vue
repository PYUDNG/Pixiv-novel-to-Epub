<!-- 下拉选择框 -->
<script setup generic="V" lang="ts">
import { monkeyWindow } from '$';
import { globalLogger } from '@/utils';
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';
import MaterialSymbolsKeyboardArrowDown from '~icons/material-symbols/keyboard-arrow-down';
import MaterialSymbolsKeyboardArrowUp from '~icons/material-symbols/keyboard-arrow-up';

export interface SelectOption<V> {
    label: string;
    value: V;
}

export interface SelectProps<V> {
    /**
     * 可选值
     */
    options: SelectOption<V>[];
}

const logger = globalLogger.withPath('components', 'select');

// #region model
const selected = defineModel<V>({
    default: (props: SelectProps<V>) => props.options[0].value,
});
// #endregion

// #region props
const {
    options = [],
} = defineProps<SelectProps<V>>();

if (options.length === 0)
    throw new TypeError('there should be at least 1 option in options prop');
if (options.every(opt => opt.value !== selected.value))
    throw new TypeError('option with given model value not found');
// #endregion

// #region 选中数据
const label = computed<string>(() => {
    const option = getOption(selected.value);
    return option.label;
});

/**
 * 选中第一个具有指定值的选项  
 * **注意：如果选项值为对象，则必须和`options`中传入的对象为相同引用**
 * @param val 选中值
 */
function select(val: V) {
    const option = getOption(val);
    selected.value = option.value;
}

function getOption(val: V) {
    const option = options.find(opt => opt.value === val);
    if (!option) {
        logger.simple('Error', 'value not found');
        logger.asLevel('Error', val);
        throw new TypeError('value not found');
    }
    return option;
}
// #endregion

// #region 下拉菜单状态
/**
 * 下拉菜单是否展示
 */
const dropdownVisible = ref<boolean>(false);

// 当点击页面任意位置时自动隐藏下拉菜单
const ctrl = new AbortController();
const root = useTemplateRef('root');
onMounted(() => {
    monkeyWindow.addEventListener('click', e => {
        if (!root.value) return;
        const clickingSelectComp = e.composedPath().includes(root.value);
        if (clickingSelectComp) return;
        toggle(false);
    }, {
        signal: ctrl.signal,
    });
});
onUnmounted(() => ctrl.abort());

/**
 * 切换下拉菜单展示状态
 * @param visible 是否展示，省略时自动取反
 */
function toggle(visible?: boolean) {
    dropdownVisible.value = visible ?? !dropdownVisible.value;
}
// #endregion
</script>

<template>
    <div
        ref="root"
        class="
            relative min-w-0
            flex flex-row justify-between items-center
            text-surface-800 dark:text-surface-200
            bg-surface-100 dark:bg-surface-800
            border border-solid border-surface-300 dark:border-surface-700
            focus-visible:outline-none focus-visible:border-primary-400
            p-2 overflow-visible
        "
        @click="toggle()"
    >
        <!-- 显示当前选中项的值对应的标签文本 -->
        <div
            class="truncate grow shrink min-w-0"
        >{{ label }}</div>

        <!-- 小箭头 -->
        <component
            :is="dropdownVisible ? MaterialSymbolsKeyboardArrowUp : MaterialSymbolsKeyboardArrowDown"
            class="grow-0 shrink-0"
        />

        <!-- 下拉选项 -->
        <div
            v-show="dropdownVisible"
            class="
                absolute top-full left-0
                flex flex-col justify-start items-stretch
                text-surface-800 dark:text-surface-200
                border border-solid border-surface-300 dark:border-surface-700
                w-max min-w-15 max-h-30 overflow-y-auto
                select-none
            "
        >
            <div
                v-for="option of options"
                class="
                    flex flex-row justify-start items-center
                    p-1
                    hover:bg-[rgba(0,0,0,0.2)] dark:hover:bg-[rgba(255,255,255,0.1)]
                "
                @click="select(option.value)"
            >{{ option.label }}</div>
        </div>
    </div>
</template>