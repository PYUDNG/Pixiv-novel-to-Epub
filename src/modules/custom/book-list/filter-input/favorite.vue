<script setup lang="ts">
import Select, { type SelectOption } from '@/components/select.vue';
import { i18nKeys } from '@/i18n';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const $favorite = i18nKeys.$custom.$input.$list.$filter.$favorite;

const model = defineModel<string>({ required: true });
const options: SelectOption<string>[] = [{
    label: t($favorite.$include),
    value: 'include',
}, {
    label: t($favorite.$exclude),
    value: 'exclude',
}];
</script>

<template>
    <Select
        v-model="model"
        :options="options"
    />
</template>