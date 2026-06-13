<!-- TextContent类型渲染组件 -->

<script setup lang="ts">
import { TextContent } from '../../../../types';

const props = defineProps<{
    content: TextContent;
}>();
</script>

<template>
    <div class="whitespace-pre-wrap">{{ content.text }}</div>
</template>