import { Task } from "./Task";
import { reactive, computed } from "./utils/api";

export interface TaskState {
  isRunning: boolean;
  isIdle: boolean;
}

export type TaskGroup<U extends Record<string, Task<any, any>>> = TaskState & U;

export default function useTaskGroup<U extends Record<string, Task<any, any>>>(
  taskMap: U
): TaskGroup<U> {
  const taskArray = Object.values(taskMap);
  const isRunning = computed(() => !!taskArray.find((task) => task.isRunning));
  const taskGroup = reactive({
    isRunning: isRunning,
    isIdle: computed(() => !isRunning.value),
    isError: computed(() => !!taskArray.find((task) => task.isError)),
    ...taskMap,
  })

  //@ts-expect-error why is this incompatible?
  return taskGroup;
}
