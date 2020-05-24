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

function searchArticles(term, options) {
  return ajax(
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${term}&limit=5&namespace=0&format=json&origin=*`,
    options
  );
}

export default defineComponent({
  setup() {
    const searchTask = useTask(function*(signal, event) {
      const { value } = event.target;
      yield timeout(600);
      if (!value) {
        return [];
      }

      const [term, headers, _, urls] = yield searchArticles(value, { signal });
      return headers.map((header, index) => {
        return { header, url: urls[index] };
      });
    }).keepLatest();

    return { searchTask };
  }
});
</script>

<template>
  <div>
    <br />
    <div :style="{ display: 'flex' }">
      <input placeholder="Search wiki..." :style="{ height: '20px' }" @input="searchTask.perform" />
      <span v-if="searchTask.isRunning">&nbsp;☁️</span>
    </div>
    <div v-if="searchTask.lastSuccessful">
      <div v-for="searchResult in searchTask.lastSuccessful.value">
        <a target="_blank" :href="searchResult.url">{{ searchResult.header }}</a>
      </div>
    </div>
  </div>
</template>

<style>
</style>
