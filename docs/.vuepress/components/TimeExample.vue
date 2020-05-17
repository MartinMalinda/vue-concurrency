<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";
import useTask, { Task } from "../../../src/Task";

function timeout(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export default defineComponent({
  setup() {
    const time = ref<Date>(null);
    const updateTimeTask = useTask(function*() {
      // wait some time to simulate a network request
      while (true) {
        time.value = new Date();
        yield timeout(1000);
      }
    });

    updateTimeTask.perform();

    return {
      time,
      updateTimeTask
    };
  }
});
</script>

<template>
  <div>
    <br />
    <div>The time is {{ time.toString().split(' ')[4] }}</div>
    <br />
    <button :disabled="updateTimeTask.isIdle" @click="updateTimeTask.cancelAll">Pause</button>
    <button :disabled="updateTimeTask.isRunning" @click="updateTimeTask.perform">Resume</button>
  </div>
</template>

<style>
</style>
