---
sidebarDepth: 0
---

# Searching

## Debounced search

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
