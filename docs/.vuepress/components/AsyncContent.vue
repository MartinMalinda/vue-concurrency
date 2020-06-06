<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";
import useTask, { Task } from "../../../src/Task";

export default defineComponent({
  props: {
    task: {
      required: true,
      type: Object
    }
  },

  setup(props) {
    const lastValue = computed(() => props.task.last && props.task.last.value);
    const lastError = computed(() => props.task.last && props.task.last.error);

    return { lastValue, lastError };
  }
});
</script>

<template>
  <div>
    <slot name="loading" v-if="task.isRunning">Loading... (put your favourite spinner here)</slot>
    <slot name="error" v-else-if="task.isError" :error="lastError">
      <div>
        <p>{{ lastError.message || "Something went wrong" }}</p>
        <button @click="task.perform">Try again</button>
      </div>
    </slot>
    <slot v-else-if="task.performCount > 0" :lastValue="lastValue" />
  </div>
</template>
