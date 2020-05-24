---
sidebarDepth: 0
---

# Searching

## Debounced search

Searching as the user is typing is a common feature on modern websites and in general provides good UX. The most common way to make it work is to trigger an action as the user is typing but debounce the outcome. There are general `debounce()` functions that accept any kind of function, but using task for this makes thing a bit more straightforward, because we get a bunch of derived state along.

Debouncing with tasks essentially means creating a restartable task with a delay. If there's a waiting period in the beginning and the task kepts getting restarted we essentially get debouncing. Accessing `lastSuccessful` on task is useful in this case because we want resiliently display any kind of value to the user.

<SpecieSearch />

```vue
<script>
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
      const { results } = yield searchSpecies(value, { signal });
      return results;
    }).restartable();

    return { searchTask };
  },
});
</script>

<template>
  <div>
    <br />
    <div>
      <input placeholder="Search species..." @input="searchTask.perform" />
      <span v-if="searchTask.isRunning">☁️</span>
    </div>
    <div v-if="searchTask.lastSuccessful">
      <div v-for="specie in searchTask.lastSuccessful.value">
        <a
          target="_blank"
          :href="`https://en.wikipedia.org/wiki/${specie.canonicalName}`"
        >
          {{ specie.canonicalName }}
          <span v-if="specie.vernacularNames.length">
            ({{ specie.vernacularNames[0].vernacularName }})
          </span>
        </a>
        <br />
      </div>
    </div>
  </div>
</template>
```

## Throttled search suggestions

A common usecase: show quick suggestions when a user is typing into a searchbox. This is different from the example above because a task is being performed already when the user is typing. So this would be an example of throttling rather than debouncing. We don't want to fire a request on every keystroke but we want to do it every now and then. A `drop()` task can be used for throttling but it's not usable in this case, because we want to make sure that the last instance of the task (last input) is always performed. `keepLatest()` is a good fit.

<WikiSearch />

```vue
<script>
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
  },
});
</script>

<template>
  <div>
    <br />
    <div>
      <input placeholder="Search..." @input="searchTask.perform" />
      <span v-if="searchTask.isRunning">&nbsp;☁️</span>
    </div>
    <div
      v-if="searchTask.lastSuccessful"
      v-for="searchResult in searchTask.lastSuccessful.value"
    >
      <a target="_blank" :href="searchResult.url">{{ searchResult.header }}</a>
    </div>
  </div>
</template>
```
