<script setup lang="ts">
import { watch, type Component } from 'vue';
import MaterialSymbolsAdd from '~icons/material-symbols/add';
import MaterialSymbolsRemove from '~icons/material-symbols/remove';
import Select from '@/components/select.vue';
import Button from '@/components/button.vue';

// #region types
export interface FilterDef {
    type: string;
    label: string;
    initial: any;
    input: Component;
}
export interface Filter {
    type: string;
    value: any;
}
// #endregion

// #region props
const { filterDefs }= defineProps<{
    /**
     * 所有可用filter实现
     */
    filterDefs: FilterDef[];
}>();
// #endregion

// #region model
/**
 * 筛选条件列表  
 * 组件的模型值
 */
const filters = defineModel<Filter[]>({ required: true });

// 当filter的type改变时自动切换value为initial初始值
const watchedList = new Map<Filter, Function>();
watch(filters, filters => {
    // 每个filter单独watch
    for (const filter of filters) {
        if (watchedList.has(filter)) continue;
        watchedList.set(filter, watch(() => filter.type, (newType, oldType) => {
            if (newType !== oldType)
                filter.value = getFilterDef(newType).initial;
        }));
    }
    // filter被删除时从Map中同步删除记录
    for (const filter of watchedList.keys())
        if (!filters.includes(filter)) watchedList.delete(filter)
}, { deep: true });

/**
 * 添加一条筛选条件
 * @param type 筛选器类型
 * @param value 筛选条件初始值
 */
function addFilter(type: string, value: any) {
    filters.value.push({ type, value });
}
// #endregion

// #region 筛选UI
/**
 * 筛选器类型选择器可用选项
 */
const options = filterDefs.map(impl => ({
    label: impl.label,
    value: impl.type,
}));
// #endregion

// #region 工具函数
function getFilterDef(type: string): FilterDef {
    const defination = filterDefs.find(def => def.type === type);
    if (!defination) throw new Error(`filter defination not found for type ${ type }`);
    return defination;
}
// #endregion
</script>

<template>
    <div
        class="
            flex flex-col items-stretch
        "
    >
        <!-- 所有筛选条件 -->
        <div
            v-for="(filter, i) in filters"
            class="flex flex-row p-2 justify-between items-stretch"
        >
            <div class="flex flex-row gap-3 grow shrink">
                <Select
                    v-model="filter.type"
                    :options="options"
                />
                <component :is="getFilterDef(filter.type).input" v-model="filter.value" />
            </div>
            <Button
                :icon="MaterialSymbolsRemove"
                padding="px-3 py-2"
                type="text"
                @click="filters.splice(i, 1)"
            />
        </div>
        
        <!-- 添加筛选条件 -->
        <Button
            type="outline"
            :icon="MaterialSymbolsAdd"
            @click="addFilter('include-tag', '')"
        />
    </div>
</template>