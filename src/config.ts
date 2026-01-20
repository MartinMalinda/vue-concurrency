import type { App, InjectionKey } from "vue";
import type { UseTaskOptions } from "./Task";

export type TaskDefaults = Partial<UseTaskOptions>;

export type VueConcurrencyConfigOptions = {
  taskDefaults?: TaskDefaults;
};

export const TASK_DEFAULTS_KEY: InjectionKey<TaskDefaults> = Symbol(
  "vue-concurrency:task-defaults",
);

export const VueConcurrencyConfig = {
  install(app: App, options?: VueConcurrencyConfigOptions) {
    app.provide(TASK_DEFAULTS_KEY, options?.taskDefaults ?? {});
  },
};