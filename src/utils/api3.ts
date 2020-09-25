export { ref, reactive, onMounted, onUnmounted, defineComponent, computed, Ref, watchEffect, getCurrentInstance } from "vue3";

// onServerPrefetch is not supported in Vue 3 so far, do a no-op
export const onServerPrefetch = () => { };
