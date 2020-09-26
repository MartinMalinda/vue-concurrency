import { createApp, h, nextTick } from "vue";
import Vue2 from 'vue2';

const vueVersion = process.env.VUE || 2;

const mountComponent = {
  2: (setup: () => any) => new (Vue2 as any)({
    setup,
    render: (h) => h('div'),
  }).$mount(),
  3: (setup: () => any) => createApp({
    setup,
    render: () => ":)"
  }).mount(document.body)
};

export const mockSetup = async (cb): Promise<void> => {
  let _setupPromiseResolve;
  const setupPromise = new Promise(
    (resolve) => (_setupPromiseResolve = resolve)
  );

  mountComponent[vueVersion](() => {
    const maybePromise = cb();
    maybePromise?.then
      ? maybePromise.then(_setupPromiseResolve)
      : _setupPromiseResolve();
  });

  await setupPromise;
  await nextTick();
};
