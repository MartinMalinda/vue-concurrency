import { Task } from "./Task";
import { reactive } from "@vue/composition-api";
import { computed } from "@vue/composition-api";

interface TaskState {
  isRunning: boolean;
  isIdle: boolean;
}

type TaskGroup<U extends Record<string, Task<any, any>>> = TaskState & U;

export default function useTaskGroup<U extends Record<string, Task<any, any>>>(
  taskMap: U
): TaskGroup<U> {
  const taskArray = Object.values(taskMap);
  const taskGroup = reactive({
    isRunning: computed(() => !!taskArray.find((task) => task.isRunning)),
    isIdle: computed(() => !taskGroup.isRunning),
    ...taskMap,
  });

  return taskGroup;
}
