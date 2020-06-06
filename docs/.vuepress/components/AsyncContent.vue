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
  <div class="async-content">
    <div v-if="task.isRunning">
      <slot name="loading">Loading... (put your favourite spinner here)</slot>
    </div>
    <div v-else-if="lastError">
      <slot :error="lastError" name="error">
        <div>
          <p>{{ lastError.message || "Something went wrong" }}</p>
          <button @click="task.perform">Try again</button>
        </div>
      </slot>
    </div>
    <div v-else-if="lastValue">
      <slot :lastValue="lastValue" />
    </div>
  </div>
</template>
