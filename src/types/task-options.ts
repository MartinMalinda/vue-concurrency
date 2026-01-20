export type UseTaskOptions = {
  cancelOnUnmount?: boolean;
  pruneHistory?: boolean; // default: true
  keepSuccessful?: number; // default: 2
  maxInstances?: number; // default: 50
  pruneDelayMs?: number; // default: 1000
};