import { waitForValue, timeout } from "../src/utils/general";
import { mockSetup } from "../test-utils/components";
import { ref } from "../src/utils/api";
import { wait } from "./task-cancel";

describe("waitForValue", () => {
  test("returns the right value", async () => {
    await mockSetup(async () => {
      const foo = ref<string | null>(null);
      let resolved = false;
      const promise = waitForValue(() => foo.value).then(
        () => (resolved = true)
      );
      await wait(5);
      expect(resolved).toBe(false);
      foo.value = "Fin";
      await promise;
      expect(resolved).toBe(true);
    });
  });
});

describe("timeout", () => {
  test("resolves immediately in test environment", async () => {
    await timeout(99999);
    expect(true).toBe(true);
  });
});
