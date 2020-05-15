<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import useTask, { Task } from "../../../src/Task";

function timeout(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export default defineComponent({
  components: {},
  props: {
    modify: {
      type: Function,
      required: false
    },

    time: {
      type: Number,
      default: 5000
    }
  },

  setup({ modify, time }) {
    let task = useTask(function*(signal) {
      const t0 = performance.now();
      yield timeout(time);
      const t1 = performance.now();
      return `finished in ${t1 - t0} miliseconds`;
    });

    if (modify) {
      task = modify(task);
    }

    return { task };
  }
});
</script>

<template>
  <div>
    <slot :task="task" />
  </div>
</template>

<style>
</style>
