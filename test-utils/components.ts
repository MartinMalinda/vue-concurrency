import { defineComponent } from "@vue/composition-api";

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
