import { createApp, nextTick } from "vue-demi";

const mountComponent = (setup: () => any) => createApp({
    setup,
    render: () => ":)"
  }).mount(document.body);

export const mockSetup = async (cb): Promise<void> => {
  let _setupPromiseResolve;
  const setupPromise = new Promise(
    (resolve) => (_setupPromiseResolve = resolve)
  );

  mountComponent(() => {
    const maybePromise = cb();
    maybePromise?.then
      ? maybePromise.then(_setupPromiseResolve)
      : _setupPromiseResolve();
  });

  await setupPromise;
  await nextTick();
};
