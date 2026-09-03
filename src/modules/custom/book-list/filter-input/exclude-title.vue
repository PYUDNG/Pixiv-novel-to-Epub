<script setup lang="ts">
    const model = defineModel<string>({ required: true });
</script>

<template>
    <input
        type="text"
        v-model="model"
        class="
            grow shrink
            outline-none border border-solid p-1
            border-surface-300 dark:border-surface-700
            focus:border-primary-400 focus:dark:border-primary-400
            bg-surface-100 dark:bg-surface-800
        "
    >
</template>