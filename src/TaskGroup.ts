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
  const taskGroup = reactive({
    isRunning: computed(() => !!taskArray.find((task) => task.isRunning)),
    isIdle: computed(() => !taskGroup.isRunning),
    isError: computed(() => !!taskArray.find((task) => task.isError)),
    ...taskMap,
  });

  return taskGroup;
}
