# Managing Concurrency

You can control how the task handles running multiple instances at the same time.
By default, the task can run unlimited amount of instances in parallel.

<TaskProvider v-slot="{ task }">
  <Queue :task="task"  />
</TaskProvider>

## Drop

Setting the task as `drop()` means that if there's an instance running, trying to run any subsequent task instance will not go succeed. The task instance will get `drop`ped.

**Usecase:** form submissions, overall preventing duplicate requests

<TaskProvider :modify="(task) => task.drop()" v-slot="{ task }">
  <Queue :task="task"  />
</TaskProvider>

## Restartable

Setting the task as `restartable()` means that if there's an instance running, performing the task again will immediately cancel the existing running instance before running the new one.

**Usecase:** polling, debouncing, (usually with combination with `timeout()`)

<TaskProvider :modify="(task) => task.restartable()" v-slot="{ task }">
  <Queue :task="task"  />
</TaskProvider>

## Enqueue

Setting the task as `enqueue()` means that if there's an instance running, performing the task again will add the task instance to the queue, scheduling it to run later.

**Usecase:** scheduling - for performance or other reasons

<TaskProvider :modify="(task) => task.enqueue()" v-slot="{ task }">
  <Queue :task="task"  />
</TaskProvider>

## KeepLatest

`keepLatest()` can be considered like a combination of `enqueue()` and `restartable()`. When there's an instance already running, next one will be enqueued. A previously enqueued instance will be dropped.

**Usecase:** throttling, polling

<TaskProvider :modify="(task) => task.keepLatest()" v-slot="{ task }">
  <Queue :task="task"  />
</TaskProvider>
