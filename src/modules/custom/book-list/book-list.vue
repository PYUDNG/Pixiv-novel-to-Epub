<!-- 书单 -->
<script setup lang="ts">
import { i18nKeys } from '@/i18n';
import { useI18n } from 'vue-i18n';
import { NovelData } from '../utils';
import Book from './book.vue';
import MaterialSymbolsRefresh from '~icons/material-symbols/refresh';
import MaterialSymbolsClose from '~icons/material-symbols/close';

const { t } = useI18n();
const $custom = i18nKeys.$custom;

const { novels }= defineProps<{
    novels: NovelData[];
}>();

const emit = defineEmits<{
    /** 重新排列小说 */
    sort: [ids: string[]];
    /** 移除一本小说 */
    remove: [id: string];
    /** 重新加载小说数据 */
    reload: [id: string];
}>();

// #region 数据
/**
 * 移除某一小说
 * @param id 小说id
 */
function remove(id: string) {
    if (novels.every(n => n.id !== id)) return;
    emit('remove', id);
}

/**
 * 将某一小说前移
 * @param id 小说id
 */
function forward(id: string) {
    const ids = novels.map(novel => novel.id);
    const index = ids.indexOf(id);
    if (index <= 0) return;
    ids.splice(index, 1);
    ids.splice(index - 1, 0, id);
    emit('sort', ids);
}

/**
 * 将某一小说后移
 * @param id 小说id
 */
function backward(id: string) {
    const ids = novels.map(novel => novel.id);
    const index = ids.indexOf(id);
    if (index === -1 || index === ids.length - 1) return;
    ids.splice(index, 1);
    ids.splice(index + 1, 0, id);
    emit('sort', ids);
}

/**
 * 重新加载指定小说数据
 * @param id 小说id
 */
function reload(id: string) {
    if (novels.every(n => n.id !== id)) throw new Error(`attempt to reload novel (${ id }) that is not in novels list`);
    emit('reload', id);
}
// #endregion

// #region 工具方法
// #endregion
</script>

<template>
    <div
        class="
            w-full h-full
        "
    >
        <div
            v-if="novels.length"
            class="
                w-full max-h-full overflow-y-auto
                flex flex-col items-stretch
                p-px gap-px bg-surface-300 dark:bg-surface-700
            "
        >
            <template v-for="(novel, i) of novels">
                <!-- 加载失败 -->
                <div
                    v-if="novel.error"
                    class="
                        flex flex-row justify-center items-center gap-2
                        px-3 py-2
                        bg-surface-100 dark:bg-surface-900
                        text-severity-error
                        cursor-pointer
                    "
                    @click="reload(novel.id)"
                >
                    <div>{{ t($custom.$input.$preview.$error) }}</div>
                    <MaterialSymbolsRefresh />
                    <MaterialSymbolsClose @click.stop="$emit('remove', novel.id)" />
                </div>

                <!-- 加载中 -->
                <div
                    v-else-if="novel.loading"
                    class="
                        flex flex-row justify-center items-center gap-2
                        px-3 py-2
                        bg-surface-100 dark:bg-surface-900
                    "
                >
                    <div>{{ t($custom.$input.$preview.$loading) }}</div>
                    <MaterialSymbolsClose class="cursor-pointer" @click.stop="$emit('remove', novel.id)" />
                </div>

                <!-- 加载完毕 -->
                <Book
                    v-else-if="novel.data !== null"
                    class="h-45"
                    :id="novel.data.body.id"
                    :num="i+1"
                    :cover="novel.data.body.coverUrl"
                    :title="novel.data.body.title"
                    :desc="novel.data.body.description"
                    :url="novel.data.body.extraData.meta.canonical"
                    :author="{
                        name: novel.data.body.userName,
                        avatar: Object.values(novel.data.body.userNovels).find(n => n?.profileImageUrl)?.profileImageUrl ?? null,
                        url: `https://www.pixiv.net/users/${ novel.data.body.userId }`,
                    }"
                    @remove="remove"
                    @forward="forward"
                    @backward="backward"
                />
            </template>
        </div>
    </div>
</template>