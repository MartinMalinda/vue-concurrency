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

function searchSpecies(term, options) {
  return ajax(
    `https://api.gbif.org/v1/species/search?q=${term}&rank=GENUS`,
    options
  );
}

export default defineComponent({
  setup() {
    const searchTask = useTask(function*(signal, event) {
      yield timeout(700);
      const { value } = event.target;
      if (!value) {
        return [];
      }

      const { results } = yield searchSpecies(value, { signal });
      return results;
    }).restartable();

    return { searchTask };
  }
});
</script>

<template>
  <div>
    <br />
    <div :style="{ display: 'flex' }">
      <input
        placeholder="Search species..."
        :style="{ height: '20px' }"
        @input="searchTask.perform"
      />
      <span v-if="searchTask.isRunning">&nbsp;☁️</span>
    </div>
    <div v-if="searchTask.lastSuccessful">
      <div v-if="searchTask.lastSuccessful" v-for="specie in searchTask.lastSuccessful.value">
        <a target="_blank" :href="`https://en.wikipedia.org/wiki/${specie.canonicalName}`">
          {{ specie.canonicalName }}
          <span
            v-if="specie.vernacularNames.length"
          >({{ specie.vernacularNames[0].vernacularName }})</span>
        </a>
        <br />
      </div>
    </div>
  </div>
</template>

<style>
</style>
