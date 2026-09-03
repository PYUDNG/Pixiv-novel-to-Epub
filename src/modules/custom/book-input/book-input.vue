<script setup lang="ts">
import { i18nKeys } from '@/i18n';
import { isPixivDark, SingleOrArray } from '@/utils';
import { useI18n } from 'vue-i18n';
import LinkInput from './input/link-input.vue';
import IdInput from './input/id-input.vue';
import { NovelData } from '../utils.ts';
import Area from '@/components/area.vue';

const { t } = useI18n();
const $custom = i18nKeys.$custom;

// #region props
const { novels }= defineProps<{
    novels: NovelData[];
}>();
// #endregion

// #region emit
const emit = defineEmits<{
    /** 添加一本或多本小说 */
    add: [id: SingleOrArray<string>];
}>();
// #endregion

// #region 输入组件逻辑
const inputComps = [
    LinkInput,
    IdInput,
]

/**
 * 输入组件`add`事件处理器  
 * 将输入组件的新增值添加到`ids`数组中
 * @param newIds 
 */
function onAdd(newIds: SingleOrArray<string>) {
    emit('add', newIds);
}
// #endregion
</script>

<template>
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
</template>