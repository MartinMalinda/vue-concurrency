<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import useTask, { Task } from "../../../src/Task";

function timeout(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export default defineComponent({
  components: {},
  props: {
    modify: {
      type: Object as () => (task: Task<any, any>) => any,
      required: false,
    },

    time: {
      type: Number,
      default: 3000,
    },

    perform: Boolean,

    errorChance: Number,
  },

  setup(props) {
    const { perform, modify, time, errorChance } = props;
    let task = useTask(function* (signal) {
      const t0 = performance.now();
      yield timeout(time);
      const t1 = performance.now();

      if (errorChance && 1 - Math.random() < errorChance) {
        throw new Error(`Internal Server Error`);
      }

      return `finished in ${t1 - t0} miliseconds`;
    });

    if (modify) {
      task = modify(task);
    }

    if (perform) {
      task.perform();
    }

    return { task };
  },
});
</script>

<template>
  <div>
    <slot :task="task" />
  </div>
</template>

<style>
</style>
