import { nextTick } from "vue";
import { render } from '@testing-library/vue'

const mountComponent = (setup: () => any) => render({
    setup,
    render: () => {}
  });

export const mockSetup = async (cb: () => any): Promise<void> => {
  let _setupPromiseResolve: (...args: any[]) => void;
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
