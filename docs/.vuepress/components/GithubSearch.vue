<script lang="ts">
import { defineComponent, ref, onMounted } from "@vue/composition-api";
import useTask, { Task } from "../../../src/Task";

function timeout(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function ajax(url, options?) {
  return fetch(url, options).then(response =>
    response.json().then(data => {
      if (!response.ok) {
        throw {
          ...data,
          status: response.status,
          statusText: response.statusText
        };
      }
      return data;
    })
  );
}

function searchJobs(term, options) {
  return ajax(
    `https://jobs.github.com/positions.json?description=${term}&location=new+york`,
    options
  );
}

export default defineComponent({
  setup() {
    const searchTask = useTask(function*(signal, event) {
      yield timeout(600);

      const { value } = event.target;
      return searchJobs(value, { signal });
    }).restartable();

    return { searchTask };
  }
});
</script>

<template>
  <div>
    <br />
    <div :style="{ display: 'flex' }">
      <input placeholder="Search..." :style="{ height: '20px' }" @input="searchTask.perform" />
      <span v-if="searchTask.isRunning">&nbsp;☁️</span>
    </div>
    <!-- <div v-if="searchTask.lastSuccessful" v-for="searchResult in searchTask.lastSuccessful.value">
      {{searchResult.title}} at
      <a target="_blank" :href="searchResult.company_url">{{ searchResult.company }}</a>
    </div>-->
  </div>
</template>

<style>
</style>
