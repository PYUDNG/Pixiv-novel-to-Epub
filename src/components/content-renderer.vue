<!-- 渲染 string | DisplayContent 类型的内容的组件 -->

<script setup lang="ts" generic="C extends string | DisplayContent">
import type { DisplayContent, VueContent } from '@/utils';
import { computed, useTemplateRef } from 'vue';
import { ComponentExposed } from 'vue-component-type-helpers';

const { content } = defineProps<{
    content: C;
}>();

const comp = useTemplateRef('comp');
const expose = computed(() => 
    (comp.value && typeof content === 'object' && content.type === 'vue' ? comp.value : null) as
    C extends VueContent ? ComponentExposed<C['comp']> : null
);
defineExpose({ expose });
</script>

<template>
    <!-- text -->
    <template v-if="typeof content === 'string'">
        <div class="whitespace-pre-wrap">{{ content }}</div>
    </template>
    
    <!-- text -->
    <template v-else-if="content.type === 'text'">
        <div class="whitespace-pre-wrap">{{ content.text }}</div>
    </template>
    
    <!-- html -->
    <template v-else-if="content.type === 'html'">
        <div v-html="content.code"></div>
    </template>
    
    <!-- vue -->
    <template v-else-if="content.type === 'vue'">
        <component ref="comp" :is="content.comp" v-bind="content.props" />
    </template>
</template>