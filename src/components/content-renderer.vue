<!-- 渲染 string | DisplayContent 类型的内容的组件 -->

<script setup lang="ts">
import type { DisplayContent } from '@/utils';

const props = defineProps<{
    content: string | DisplayContent;
}>();
</script>

<template>
    <!-- text -->
    <template v-if="typeof content === 'string'">
        {{ content }}
    </template>
    
    <!-- text -->
    <template v-else-if="content.type === 'text'">
        {{ content.text }}
    </template>
    
    <!-- html -->
    <template v-else-if="content.type === 'html'">
        <div v-html="content.code"></div>
    </template>
    
    <!-- vue -->
    <template v-else-if="content.type === 'vue'">
        <component :is="content.comp" v-bind="content.props" />
    </template>
</template>