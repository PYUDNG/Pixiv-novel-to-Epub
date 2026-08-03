<script setup lang="ts">
/**
 * Material Design 3 Toggle Switch 开关组件
 * 适配 Vue3 + TS + TailwindCSS v4，兼容 Shadow DOM / 悬浮弹窗环境
 * 遵循 MD3 交互规范：轨道圆角、滑块过渡、禁用态、暗色模式、点击波纹反馈
 */
import { computed, inject, useTemplateRef, watch } from 'vue';
// 全局注入 Symbol Key（仅做类型引用，实际由业务框架提供）
import {
    TRANSITION_DURATION_KEY
} from '@/utils';

// #region 注入全局环境变量（兼容Shadow DOM、弹窗挂载场景）
/** 全局统一过渡动画时长，单位ms，降级默认值150 */
const transitionDuration = inject(TRANSITION_DURATION_KEY, 150);
// #endregion

// #region Props 类型定义与声明
interface ToggleProps {
    /** 绑定值，布尔类型，使用 defineModel 双向绑定 */
    modelValue?: boolean;
    /** 是否禁用状态 */
    disabled?: boolean;
    /** 开关尺寸：md 默认标准尺寸 | sm 紧凑小尺寸 */
    size?: 'md' | 'sm';
    /** 是否显示点击波纹动效 */
    ripple?: boolean;
    /** 自定义激活主色，不传入则使用主题 primary-500 */
    activeColor?: string;
}

/** 组件入参配置 */
const props = defineProps<ToggleProps>();

/** 双向绑定 model，替代 v-model 传统写法，Vue3.4+ 宏 */
const model = defineModel<boolean>({
    default: false,
    required: false
});

/** 事件声明 */
const emit = defineEmits<{
    /** 状态变更回调 */
    change: [value: boolean];
}>();
// #endregion

// #region 模板Ref、状态计算属性
/** 开关轨道DOM模板引用，用于波纹定位、尺寸计算（兼容Shadow DOM查询） */
const toggleTrackRef = useTemplateRef<HTMLDivElement>('toggleTrackRef');

/**
 * 计算属性：是否开启激活态
 */
const isActive = computed(() => model.value);

/**
 * 计算属性：轨道动态Tailwind样式类
 */
const trackClasses = computed(() => {
    const base = [
        'relative inline-flex items-center rounded-full transition-all ease-in-out',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2',
        'dark:focus-visible:ring-offset-surface-900',
        'cursor-pointer',
    ];

    // 尺寸分支
    if (props.size === 'sm') {
        base.push('w-9 h-5');
    } else {
        base.push('w-11 h-6');
    }

    // 激活/未激活 + 禁用态颜色
    if (props.disabled) {
        base.push(isActive.value
            ? 'bg-primary-200 dark:bg-primary-800 opacity-60'
            : 'bg-surface-300 dark:bg-surface-700 opacity-50'
        );
    } else {
        base.push(isActive.value
            ? props.activeColor ?? 'bg-primary-500'
            : 'bg-surface-300 dark:bg-surface-600'
        );
    }

    return base.join(' ');
});

/**
 * 计算属性：滑块动态样式类（位移由translate控制实现MD滑动效果）
 */
const thumbClasses = computed(() => {
    const base = [
        'absolute rounded-full bg-white shadow-md transition-transform ease-in-out',
        'dark:bg-surface-50',
        // 全局统一过渡时长内联变量，覆盖tailwind默认时长，保证弹窗/Shadow内一致性
        `transition-duration: ${transitionDuration}ms`
    ];

    // 尺寸与位移
    if (props.size === 'sm') {
        base.push('w-4 h-4 top-0.5 left-0.5');
        base.push(isActive.value ? 'translate-x-4' : 'translate-x-0');
    } else {
        base.push('w-5 h-5 top-0.5 left-0.5');
        base.push(isActive.value ? 'translate-x-5' : 'translate-x-0');
    }

    // 禁用态降低层级与阴影
    if (props.disabled) {
        base.push('shadow-none');
    }

    return base.join(' ');
});
// #endregion

// #region 事件处理函数
/**
 * 切换开关状态主逻辑
 * @param evt 原生点击事件，阻止冒泡避免Shadow DOM内事件穿透异常
 */
const handleToggleClick = (evt: MouseEvent) => {
    // 禁用直接返回
    if (props.disabled) return;
    evt.stopPropagation();

    // 更新绑定值并派发事件
    model.value = !model.value;
    emit('change', model.value);
};

/**
 * 键盘回车/空格触发切换（无障碍访问）
 * @param evt 键盘事件
 */
const handleKeydown = (evt: KeyboardEvent) => {
    if (props.disabled) return;
    if (evt.key === 'Enter' || evt.key === ' ') {
        evt.preventDefault();
        handleToggleClick(evt as unknown as MouseEvent);
    }
};

// 监听外部model强制变更（兼容受控组件场景）
watch(model, (newVal) => {
    emit('change', newVal);
});
// #endregion

// #region 组件对外暴露实例方法（父组件可通过$ref调用）
defineExpose({
    /** 获取当前激活状态 */
    value: model,
    /** 手动触发切换 */
    toggle: () => handleToggleClick(new MouseEvent('manual')),
    /** 获取轨道DOM元素（Shadow DOM环境下父组件可查询） */
    trackEl: toggleTrackRef
});
// #endregion
</script>

<template>
  <div
    ref="toggleTrackRef"
    :class="trackClasses"
    role="switch"
    :aria-checked="isActive"
    :aria-disabled="disabled"
    tabindex="disabled ? -1 : 0"
    @click="handleToggleClick"
    @keydown="handleKeydown"
  >
    <!-- MD3 圆形滑块 -->
    <div :class="thumbClasses"></div>
  </div>
</template>

<style scoped>
/* scoped 自带data-v隔离，配合Shadow DOM双重样式隔离，避免全局污染 */
/* 内联变量修正过渡时长，Tailwind v4 可直接识别 css var */
[style*="transition-duration"] {
    transition-property: background-color, transform, opacity;
}
</style>