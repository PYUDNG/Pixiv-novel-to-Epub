<!-- 创建select dialog的content组件 -->

<script setup generic="V" lang="ts">
import type { DisplayContent } from '@/utils/types';
import ContentRenderer from '@/components/content-renderer.vue';
import { Ref, ref } from 'vue';
import Select, {
    type SelectProps as SelectCompProps
} from '@/components/select.vue';

export interface SelectProps<V> extends SelectCompProps<V> {
    /**
     * 显示内容
     */
    content?: string | DisplayContent;

    /**
     * 初始选中值
     */
    value?: V;
}


// #region props
const {
    content = '',
    options = [],
    value,
} = defineProps<SelectProps<V>>();
// #endregion

// #region 选中项
/**
 * 当前选中值
 */
const selected = ref<V>(value ?? options[0].value) as Ref<V>;
// #endregion

// #region expose
defineExpose({ value: selected });
// #endregion
</script>

<template>
    <div
        class="
            w-full h-full flex flex-col gap-3
        "
    >
        <!-- 显示内容 -->
        <ContentRenderer :content="content" />

        <!-- 选择框 -->
        <!-- @vue-generic {V} -->
        <Select
            v-model="selected"
            :options="options"
        />
    </div>
</template>