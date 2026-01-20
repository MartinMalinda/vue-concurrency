import {
  computed,
  onBeforeUnmount,
  getCurrentInstance,
  effectScope,
} from "./utils/api";
import createTaskInstance, {
  TaskInstance,
  ModifierOptions,
} from "./TaskInstance";
import {
  reachedMaxConcurrency,
  cancelFirstRunning,
  filteredInstances,
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
  cancelAll: (options?: { force: boolean }) => void;
  perform: (...params: U) => TaskInstance<T>;
  clear: () => void;
  destroy: () => void;

  // Modifiers
  restartable: () => Task<T, U>;
  drop: () => Task<T, U>;
  enqueue: () => Task<T, U>;
  keepLatest: () => Task<T, U>;
  maxConcurrency: (number: number) => Task<T, U>;
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

  // History pruning (internal)
  _pruneHistory: boolean;
  _pruneTimer: ReturnType<typeof setTimeout> | null;
  _performCount: number;
};

export type UseTaskOptions = {
  cancelOnUnmount?: boolean;
  pruneHistory?: boolean; // default: true
};

export default function useTask<T, U extends any[]>(
  cb: TaskCb<T, U>,
  options: UseTaskOptions = { cancelOnUnmount: true, pruneHistory: true },
): Task<Resolved<T>, U> {
  const scope = effectScope();
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
        task._isKeepingLatest,
    ),

    _pruneHistory: options.pruneHistory ?? true,
    _pruneTimer: null,
    _performCount: 0,

    isIdle: computed(() => !task.isRunning),
    isRunning: computed(
      () => !!task._instances.find((instance) => instance.isRunning),
    ),
    isError: computed(() => !!(task.last && task.last.isError)),

    _instances: [],
    // TODO: the filter + lastOf combo is concise and clear, but more efficient would be classic loop and iterating from the end (findLastIf macro)
    _successfulInstances: filteredInstances(() => task, "isSuccessful"),
    _runningInstances: filteredInstances(() => task, "isRunning"),
    _enqueuedInstances: filteredInstances(() => task, "isEnqueued"),
    _notDroppedInstances: filteredInstances(() => task, "isNotDropped"),
    _activeInstances: filteredInstances(() => task, "isActive"),
    performCount: computed(() => task._performCount),
    last: computedLastOf(() => task._notDroppedInstances),
    lastSuccessful: computedLastOf(() => task._successfulInstances),
    firstEnqueued: computedFirstOf(() => task._enqueuedInstances),

    cancelAll({ force } = { force: false }) {
      // Cancel all running and enqueued instances. Finished and dropped instances can't really be canceled.
      task._instances.forEach((taskInstance) => {
        try {
          if (force || (!taskInstance.isDropped && !taskInstance.isFinished)) {
            taskInstance.cancel({ force });
          }
        } catch (e) {
          if (e !== "cancel") {
            throw e;
          }
        }
      });
    },

    perform(...params: any[]) {
      task._performCount += 1;
      if (task._pruneTimer) {
        clearTimeout(task._pruneTimer);
        task._pruneTimer = null;
      }

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
      const create = () =>
        createTaskInstance<T>(cb, params, {
          modifiers,
          onFinish,
          scope: scope,
          id: task._instances.length + 1,
        });

      const newInstance = scope.active ? scope.run(create) : create();

      task._instances = [...task._instances, newInstance as TaskInstance<T>];

      return newInstance;
    },

    clear() {
      this.cancelAll({ force: true });
      this._instances = [];
      if (this._pruneTimer) {
        clearTimeout(this._pruneTimer);
        this._pruneTimer = null;
      }
    },

    destroy() {
      scope.stop();
      this.clear();
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

    maxConcurrency(number: number) {
      task._maxConcurrency = number;
      return task;
    },
  });
  const task = _reactive(content) as Task<T, U>;

  if (options.cancelOnUnmount) {
    const vm = getCurrentInstance();
    if (vm) {
      onBeforeUnmount(() => {
        // check if there's instances still, Vue 3 might have done some cleanup already
        if (task._instances) {
          task.destroy();
        }
      });
    }
  }

  return task as Task<Resolved<T>, U>;
}

function onTaskInstanceFinish(task: Task<any, any>): void {
  if (task._isEnqueuing || task._isKeepingLatest) {
    const { firstEnqueued } = task;
    if (firstEnqueued) {
      firstEnqueued._run();
    }
  }

  scheduleHistoryPrune(task);
}

function scheduleHistoryPrune(task: Task<any, any>): void {
  if (!task._pruneHistory) return;

  // Debounce: keep the most recent schedule request.
  if (task._pruneTimer) clearTimeout(task._pruneTimer);

  // “Lazy”: only prune after the task has had time to settle.
  // Also: only prune when idle, to avoid interfering with parallel / Promise.all patterns.
  task._pruneTimer = setTimeout(() => {
    task._pruneTimer = null;

    // Fully idle only: no running, no enqueued.
    if (task.isRunning) return;
    if (task._enqueuedInstances.length > 0) return;

    pruneHistoryNow(task);
  }, 1000);
}

function pruneHistoryNow(task: Task<any, any>): void {
  // Keep all active (defensive), plus last + last 2 successful.
  const keep = new Set<TaskInstance<any>>();

  for (const inst of task._instances) {
    if (inst.isRunning || inst.isEnqueued) keep.add(inst);
  }

  if (task.last) keep.add(task.last);

  // Keep last 2 successful instances.
  const succ = task._successfulInstances;
  const len = succ.length;
  if (len >= 1) keep.add(succ[len - 1]);
  if (len >= 2) keep.add(succ[len - 2]);

  // Prune.
  task._instances = task._instances.filter((inst) => keep.has(inst));
}
