export { ref, reactive, onMounted, onUnmounted, defineComponent, computed, Ref, watchEffect, watch, getCurrentInstance } from "vue3";

// onServerPrefetch is not supported in Vue 3 so far
export const onServerPrefetch = (cb: () => any) => {
  throw new Error('vue-concurrency SSR features are not supported in Vue 3 so far');
};
