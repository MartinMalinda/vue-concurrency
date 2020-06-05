import { mockSetup } from "./task";
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
      const pipeTask = useParallelTask(addTask, add10Task, add20Task);
      const [firstResult, secondResult, thirdResult] = await pipeTask.perform(
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
