import { waitFor } from '@testing-library/vue';
import useTask, { Task } from '../Task';
import { TaskInstance } from '../TaskInstance';
import { mockSetup } from './task';
import { timeout } from './task-cancel';

export function performNTimes(
  task: Task<any>
): (n: number) => TaskInstance<any>[] {
  return (n: number) => {
    return Array.from(Array(n)).map((_, index) => {
      return task.perform(index);
    });
  };
}

export function perform3x(task: Task<any>) {
  return performNTimes(task)(3);
}

describe('useTask | restartable task', () => {
  test('runs the first task instance right away', async () => {
    await mockSetup(() => {
      const task = useTask(function*() {}).restartable();
      const taskInstance = task.perform();
      expect(taskInstance.isRunning).toBe(true);
    });
  });

  test('cancels first running task when the task is performed again', async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {
        yield timeout(10);
      }).restartable();
      const taskInstance1 = task.perform();
      await timeout(5);
      const taskInstance2 = task.perform();
      expect(taskInstance1.isCancelling).toBe(true);
      expect(taskInstance2.isRunning).toBe(true);
      const taskInstance3 = task.perform();
      expect(taskInstance2.isCancelling).toBe(true);
      expect(taskInstance3.isRunning).toBe(true);
    });
  });

  test('cancels first running task when maxConcurrency is reached', async () => {
    await mockSetup(async () => {
      const task = useTask(function*() {
        yield timeout(50);
      })
        .restartable()
        .maxConcurrency(3);
      const [instance1, instance2, instance3] = perform3x(task);
      expect(instance1.isRunning).toBe(true);
      expect(instance2.isRunning).toBe(true);
      expect(instance3.isRunning).toBe(true);

      const instance4 = task.perform();
      expect(instance1.isCancelling).toBe(true);
      expect(instance2.isRunning).toBe(true);
      expect(instance3.isRunning).toBe(true);
      expect(instance4.isRunning).toBe(true);

      const instance5 = task.perform();
      await waitFor(() => expect(instance2.isCancelling).toBe(true));
      expect(instance3.isRunning).toBe(true);
      expect(instance4.isRunning).toBe(true);
      expect(instance5.isRunning).toBe(true);
    });
  });
});
