import { computed, onUnmounted } from "./utils/api";
import createTaskInstance, {
  TaskInstance,
  ModifierOptions,
} from "./TaskInstance";
import {
  reachedMaxConcurrency,
  cancelFirstRunning,
  filteredInstances,
  computedLength,
  computedLastOf,
  computedFirstOf,
  _reactive,
  _reactiveContent,
  dropEnqueued,
} from "./utils/general";
import { Resolved, TaskCb } from "./types/index";

export type Task<T, U extends any[]> = {
  // Lifecycle state
  isIdle: boolean;
  isRunning: boolean;
  isError: boolean;
  performCount: number;

  // Shortcuts to useful instances
  last: TaskInstance<T> | undefined;
  lastSuccessful: TaskInstance<T> | undefined;
  firstEnqueued: TaskInstance<T> | undefined;

  // Action Methods
  cancelAll: () => void;
  perform: (...params: U) => TaskInstance<T>;
  clear: () => void;

  // Modifiers
  restartable: () => Task<T, U>;
  drop: () => Task<T, U>;
  enqueue: () => Task<T, U>;
  keepLatest: () => Task<T, U>;
  maxConcurrency: (number) => Task<T, U>;
  _resetModifierFlags: () => void;

  // Modifier flags
  _maxConcurrency: number;
  _isRestartable: boolean;
  _isEnqueuing: boolean;
  _isDropping: boolean;
  _isKeepingLatest: boolean;

  _hasConcurrency: boolean;

  // Instances
  _instances: TaskInstance<T>[];
  _successfulInstances: readonly TaskInstance<T>[];
  _runningInstances: readonly TaskInstance<T>[];
  _activeInstances: readonly TaskInstance<T>[];
  _enqueuedInstances: readonly TaskInstance<T>[];
  _notDroppedInstances: readonly TaskInstance<T>[];
};

export default function useTask<T, U extends any[]>(
  cb: TaskCb<T, U>
): Task<Resolved<T>, U> {
  const content = _reactiveContent({
    _isRestartable: false,
    _isDropping: false,
    _isEnqueuing: false,
    _isKeepingLatest: false,
    _maxConcurrency: 1, // this is used only when concurrency modifier is active (otherwise it has no effect)
    _hasConcurrency: computed(
      () =>
        task._isRestartable ||
        task._isDropping ||
        task._isEnqueuing ||
        task._isKeepingLatest
    ),

    isIdle: computed(() => !task.isRunning),
    isRunning: computed(
      () => !!task._instances.find((instance) => instance.isRunning)
    ),
    isError: computed(() => !!(task.last && task.last.isError)),

    _instances: [],
    // TODO: the filter + lastOf combo is concise and clear, but more efficient would be classic loop and iterating from the end (findLastIf macro)
    _successfulInstances: filteredInstances(() => task, "isSuccessful"),
    _runningInstances: filteredInstances(() => task, "isRunning"),
    _enqueuedInstances: filteredInstances(() => task, "isEnqueued"),
    _notDroppedInstances: filteredInstances(() => task, "isNotDropped"),
    _activeInstances: filteredInstances(() => task, "isActive"),
    performCount: computedLength(() => task._instances),
    last: computedLastOf(() => task._notDroppedInstances),
    lastSuccessful: computedLastOf(() => task._successfulInstances),
    firstEnqueued: computedFirstOf(() => task._enqueuedInstances),

    cancelAll() {
      // Cancel all running and enqueued instances. Finished and dropped instances can't really be canceled.
      task._instances.forEach(
        (taskInstance) => {
          try {
            if (!taskInstance.isDropped && !taskInstance.isFinished) {
              taskInstance.cancel();
            }
          } catch (e) {
            if (e !== "cancel") {
              throw e;
            }
          }
        }
      );
    },

    perform(...params) {
      const modifiers: ModifierOptions = {
        enqueue: false,
        drop: false,
      };

      if (task._hasConcurrency && reachedMaxConcurrency(task)) {
        if (task._isDropping) {
          modifiers.drop = true;
        }

        if (task._isRestartable) {
          cancelFirstRunning(task);
        }

        if (task._isKeepingLatest) {
          dropEnqueued(task);
        }

        if (task._isEnqueuing || task._isKeepingLatest) {
          modifiers.enqueue = true;
        }
      }

      const onFinish = () => onTaskInstanceFinish(task);
      const newInstance = createTaskInstance<T>(cb, params, {
        modifiers,
        onFinish,
        id: task._instances.length + 1,
      });
      task._instances = [...task._instances, newInstance];
      return newInstance;
    },

    clear() {
      this.cancelAll();
      this._instances = [];
    },

    restartable() {
      task._resetModifierFlags();
      task._isRestartable = true;
      return task;
    },

    drop() {
      task._resetModifierFlags();
      task._isDropping = true;
      return task;
    },

    enqueue() {
      task._resetModifierFlags();
      task._isEnqueuing = true;
      return task;
    },

    keepLatest() {
      task._resetModifierFlags();
      task._isKeepingLatest = true;
      return task;
    },

    _resetModifierFlags() {
      task._isKeepingLatest = false;
      task._isRestartable = false;
      task._isEnqueuing = false;
      task._isDropping = false;
    },

    maxConcurrency(number) {
      task._maxConcurrency = number;
      return task;
    },
  });
  const task: Task<T, U> = _reactive(content);

  onUnmounted(() => {
    // check if there's instances still, Vue 3 might have done some cleanup already
    if (task._instances) {
      task.cancelAll();
    }
  });

  // TODO: remove this type forcing
  return task as Task<Resolved<T>, U>;
}

function onTaskInstanceFinish(task: Task<any, any>): void {
  if (task._isEnqueuing || task._isKeepingLatest) {
    const { firstEnqueued } = task;
    if (firstEnqueued) {
      firstEnqueued._run();
    }
  }

  //TODO: run task.serialize() hook
}
