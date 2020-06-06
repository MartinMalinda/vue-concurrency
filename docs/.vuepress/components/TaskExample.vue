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
    const task = useTask(function*() {
      // wait some time to simulate a network request
      yield timeout(Math.random() * 2000);

      if (Math.random() < 0.5) {
        // lets say the API is flaky and errors out often:
        throw new Error(`Internal Server Error`);
      }

      return { name: "John", lastName: "Doe" };
    });

    return {
      task
    };
  }
});
</script>

<template>
  <div>
    <pre class="language-ts">
<code>// task state
{
  performCount: <span class="token number">{{ task.performCount }}</span>,
  isIdle: <span class="token boolean">{{ task.isIdle }}</span>,
  isRunning: <span class="token boolean">{{ task.isRunning }}</span>,
  last: {{ task.last ? `{ status: "${task.last.status}", ... }`  : "undefined" }},
  lastSuccessful: {{ task.lastSuccessful ? `{ status: "${task.lastSuccessful.status}", ... }` : "undefined" }}
}</code></pre>
    <div>
      <button @click="task.perform">Perform</button>
      <button @click="() => task._instances = []">Clear</button>
    </div>
    <h4 v-if="task._instances.length">Instances:</h4>
    <div
      :class="{
      ['task-instance']: true,
      [instance.status]: true
      }"
      v-for="instance in task._instances"
    >
      <pre class="language-ts"><code>{
  status: <span class="token string">"{{ instance.status }}"</span>,
  error: {{ instance.error && `Error { message: "${instance.error.message}" }` || "null" }},
  value: {{ instance.value || "null" }},

  hasStarted: <span
  class="token boolean"
>{{ instance.hasStarted }}</span>,
  isRunning: <span class="token boolean">{{ instance.isRunning }}</span>,
  isError: <span class="token boolean">{{ instance.isError }}</span>,
  isCanceled: <span class="token boolean">{{ instance.isCanceled }}</span>,
  isFinished: <span class="token boolean">{{ instance.isFinished }}</span>
}</code></pre>
    </div>
  </div>
</template>

<style>
.task-instance {
  font-size: 14px;
  opacity: 0;
  animation: 0.3s appear forwards;
  transition: 0.3s all;
}

.task-instance pre[class*="language-"] {
  background: #282c34cf;
}

.task-instance.error {
  background: red;
}

.task-instance.running {
  background: orange;
}

.task-instance.success {
  background: green;
}

@keyframes appear {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
