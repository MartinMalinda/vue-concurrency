import { defineComponent } from "@vue/composition-api";
import { render } from "@testing-library/vue";
import { createApp, h, nextTick } from "vue";
import { mount } from '@vue/test-utils';

const vueVersion = process.env.VUE || 2;

export function createComponentStub(
  name: string,
  setup = (props, context) => { }
) {
  const stubAttr = `data-test-${name}-stub`;
  return createApp({
    name,
    setup,
    render() {
      return h("div", {
        attrs: {
          [stubAttr]: true,
        },
      });
    },
  }).mount(document.body);
}

export const mockSetup = async (cb): Promise<void> => {
  let _setupPromiseResolve;
  const setupPromise = new Promise(
    (resolve) => (_setupPromiseResolve = resolve)
  );

  createComponentStub("TaskUsingComponent", () => {
    const maybePromise = cb();
    maybePromise?.then
      ? maybePromise.then(_setupPromiseResolve)
      : _setupPromiseResolve();
  });

  await setupPromise;
  await nextTick();
};
