<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import useTask, { Task } from "../../../src/Task";

function timeout(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export default defineComponent({
  components: {},
  props: {},

  setup() {
    const task = useTask(function*(signal, time) {
      const t0 = performance.now();
      yield timeout(5000);
      const t1 = performance.now();
      return `finished in ${t1 - t0} miliseconds`;
    })
      .maxConcurrency(3)
      .enqueue();

    return {
      task
    };
  }
});
</script>

<template>
  <div>
    task.performCount: {{ task.performCount }}
    <br />
    <button @click="task.perform">Perform</button>
    <button @click="task.cancelAll">CancelAll</button>
    <button @click="() => task._instances = []">Clear</button>
    <br />
    <br />
    <div
      :class="{
        ['instance-row']: true,
        [instance.status]: true
      }"
      v-for="instance in task._instances"
    >
      <div class="timer" v-if="instance.isRunning" />
      Instance {{instance.id}} : {{ instance.status }}
    </div>
  </div>
</template>

<style>
.instance-row {
  width: 400px;
  padding: 5px 10px;
  /* border: 2px solid black; */
  position: relative;
  overflow: hidden;

  transition: 0.3s all;
  margin: 1px 0;
  font-size: 12px;
}

.instance-row.enqueued {
  background: #b6dce4;
}

.instance-row.running {
  background: #f4d9aa;
}

.instance-row.cancelling,
.instance-row.canceled {
  background: pink;
}

.instance-row.error {
  background: red;
}

.instance-row.finished {
  background: #78b078;
  height: 0.3em;
  padding-top: 0;
  padding-bottom: 0;
  color: transparent;
}

.timer {
  position: absolute;
  width: 0%;
  height: 3px;
  background: darkorange;
  top: 0;
  left: 0;
  opacity: 0.5;

  animation: 5s shrink forwards;
  animation-timing-function: linear;
}

@keyframes shrink {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}
</style>
