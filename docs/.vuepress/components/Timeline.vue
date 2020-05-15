<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import { Task } from "../../../src/Task";

export default defineComponent({
  props: {
    task: {
      required: true,
      type: Object as () => Task<any, any>
    }
  },

  setup({ task }) {
    //
  }
});
</script>

<template>
  <div>Task {{ task }}</div>
</template>
