import useTask, { Task } from "./Task";

export function usePipeTask<T, U extends any[]>(
  firstTask: Task<any, U>,
  ...restTasks: Task<any, any>[]
): Task<T, U> {
  return useTask(function*(signal, ...args: U) {
    let result = yield firstTask.perform(...args).canceledOn(signal);
    for (let task of restTasks) {
      result = yield task.perform(result).canceledOn(signal);
    }

    return result;
  });
}

export function useParallelTask(...tasks: Task<any, any>[]): Task<any[], any> {
  return useTask(function*(signal, ...args) {
    const instances = tasks.map((task) => {
      return task.perform(...args).canceledOn(signal);
    });

    const values = yield Promise.all(instances);
    return values as any[];
  });
}

export function useSequentialTask<U extends any[]>(
  ...tasks: Task<any, any>[]
): Task<any, U> {
  return useTask(function*(signal, ...args: U) {
    const instances: any[] = [];
    for (let task of tasks) {
      instances.push((yield task.perform(...args).canceledOn(signal)) as any);
    }

    return instances;
  });
}
