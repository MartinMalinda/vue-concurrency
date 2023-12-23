import { mockSetup } from "../test-utils/components";
import useTask from "../src/Task";
import {
  usePipeTask,
  useParallelTask,
  useSequentialTask,
} from "../src/wrap-utils";

describe("usePipeTask", () => {
  test("passes value well", async () => {
    await mockSetup(async () => {
      const addTask = useTask(function*(signal, a: number, b: number) {
        return a + b;
      });
      const add10Task = useTask(function*(signal, a: number) {
        return a + 10;
      });
      const add20Task = useTask(function*(signal, a: number) {
        return a + 20;
      });
      const pipeTask = usePipeTask(addTask, add10Task, add20Task);
      const number = await pipeTask.perform(100, 100);
      expect(number).toBe(230);
    });
  });

  test("works with just one task", async () => {
    await mockSetup(async () => {
      const addTask = useTask(function*(signal, a: number, b: number) {
        return a + b;
      });
      const pipeTask = usePipeTask(addTask);
      const number = await pipeTask.perform(100, 100);
      expect(number).toBe(200);
    });
  });
});

describe("useParallelTask", () => {
  test("passes arguments to all tasks", async () => {
    await mockSetup(async () => {
      const addTask = useTask(function*(signal, a: number, b: number) {
        return a + b;
      });
      const add10Task = useTask(function*(signal, a: number) {
        return a + 10;
      });
      const add20Task = useTask(function*(signal, a: number) {
        return a + 20;
      });
      const parallelTask = useParallelTask(addTask, add10Task, add20Task);
      const [firstResult, secondResult, thirdResult] = await parallelTask.perform(
        100,
        100
      );
      expect(firstResult).toBe(200);
      expect(secondResult).toBe(110);
      expect(thirdResult).toBe(120);
    });
  });

  test("works with just one task", async () => {
    await mockSetup(async () => {
      const addTask = useTask(function*(signal, a: number, b: number) {
        return a + b;
      });
      const pipeTask = useParallelTask(addTask);
      const [number] = await pipeTask.perform(100, 100);
      expect(number).toBe(200);
    });
  });


  test("works without arguments", async () => {
    await mockSetup(async () => {
      const firstTask = useTask(function*(signal) {
        return 1;
      });
      const secondTask = useTask(function * (signal) {
        return 2;
      });
      const parallelTask = useParallelTask(firstTask, secondTask);
      const [first, second] = await parallelTask.perform();
      expect(first).toBe(1);
      expect(second).toBe(2);
    });
  });
});

describe("useSequentialTask", () => {
  test("passes arguments to all tasks", async () => {
    await mockSetup(async () => {
      const addTask = useTask(function*(signal, a: number, b: number) {
        return a + b;
      });
      const add10Task = useTask(function*(signal, a: number) {
        return a + 10;
      });
      const add20Task = useTask(function*(signal, a: number) {
        return a + 20;
      });
      const pipeTask = useSequentialTask(addTask, add10Task, add20Task);
      const [firstResult, secondResult, thirdResult] = await pipeTask.perform(
        100,
        100
      );
      expect(firstResult).toBe(200);
      expect(secondResult).toBe(110);
      expect(thirdResult).toBe(120);
    });
  });
});

// TODO: test cancelation cascade
