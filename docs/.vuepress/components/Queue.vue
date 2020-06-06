<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import useTask, { Task } from "../../../src/Task";

export default defineComponent({
  components: {},
  props: {
    task: {
      required: true,
      type: Object as () => Task<any, any>
    }
  },

  setup() {}
});
</script>

<template>
  <div>
    <pre class="language-ts task-details">
      Task<{ isIdle: {{ task.isIdle }}, isRunning: {{ task.isRunning }}, performCount: {{ task.performCount }} }>
    </pre>
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
.task-details {
  font-size: 12px !important;
  padding-left: 0 !important;
  padding-bottom: 0 !important;
  padding-top: 15px !important;
  margin-bottom: 0 !important;
}

.instance-row {
  box-sizing: border-box;
  width: 400px;
  max-width: 100%;
  padding: 5px 10px;
  /* border: 2px solid black; */
  position: relative;
  overflow: hidden;

  transition: 0.3s all;
  margin: 2px 0;
  font-size: 12px;
}

.instance-row.enqueued {
  background: #b6dce4;
}

.instance-row.running {
  background: #f4d9aa;
}

.instance-row.canceling,
.instance-row.canceled {
  background: pink;
}

.instance-row.error {
  background: red;
}

.instance-row.success {
  background: #3daf7c;
  color: white;

  animation: 0.3s minimize forwards;
  animation-delay: 2s;
}

.instance-row.dropped {
  background: lightgrey;
  animation: 0.3s minimize forwards;
  animation-delay: 2s;
}

.timer {
  position: absolute;
  width: 0%;
  height: 3px;
  background: darkorange;
  top: 0;
  left: 0;
  opacity: 0.5;

  animation: 3s shrink forwards;
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

@keyframes minimize {
  0% {
    height: 1em;
  }
  100% {
    height: 0.3em;
    padding-top: 0;
    padding-bottom: 0;
    color: transparent;
  }
}
</style>
