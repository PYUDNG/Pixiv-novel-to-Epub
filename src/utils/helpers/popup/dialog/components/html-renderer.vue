<!-- HTMLContent类型渲染组件 -->

<script setup lang="ts">
import { HTMLContent } from '../../../../types';

const props = defineProps<{
    content: HTMLContent;
}>();
</script>

<template>
    <div v-html="content.code"></div>
</template>