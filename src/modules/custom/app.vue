<!-- 自定义下载对话框内容 -->

<script setup lang="ts">
import MultiInput from '@/components/multi-input/multi-input.vue';
import { i18nKeys } from '@/i18n';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const $custom = i18nKeys.$custom;

const value = ref<string[]>([]);

defineExpose({ value });
</script>

<template>
    <div
        class="flex flex-col gap-10"
    >
        <!-- 上方提示文本 -->
        <div class="whitespace-pre-wrap">{{ t($custom.$input.$content) }}</div>

        <!-- 下方输入框 -->
        <MultiInput v-model="value" :delimiter="/[\s\n\r]/" />
    </div>
</template>