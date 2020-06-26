import { defineComponent } from "@vue/composition-api";
import { render } from "@testing-library/vue";
import Vue from "vue";

export function createComponentStub(
  name: string,
  setup = (props, context) => {}
) {
  const stubAttr = `data-test-${name}-stub`;
  return defineComponent({
    name,
    setup,
    render(el) {
      return el("div", {
        attrs: {
          [stubAttr]: true,
        },
      });
    },
  });
}

export const mockSetup = async (cb): Promise<void> => {
  let _setupPromiseResolve;
  const setupPromise = new Promise(
    (resolve) => (_setupPromiseResolve = resolve)
  );
  const component = createComponentStub("TaskUsingComponent", () => {
    const maybePromise = cb();
    maybePromise?.then
      ? maybePromise.then(_setupPromiseResolve)
      : _setupPromiseResolve();
  });

  render(component);
  await setupPromise;
  await Vue.nextTick();
};
