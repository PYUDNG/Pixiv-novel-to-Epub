import type { InjectionKey, Ref } from "vue";

export const userInputKey: InjectionKey<Ref<string>> = Symbol('user-input');
