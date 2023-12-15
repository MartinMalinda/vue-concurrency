import { defer, getCancelToken } from "../src/utils/general";
import { AbortSignalWithPromise } from "../src/types/index";
import { vi } from 'vitest';

describe("getCancelToken", () => {
  it("works", async () => {
    const { promise, reject } = defer();
    const signalMock = {
      pr: promise,
    } as AbortSignalWithPromise;

    const cancelFn = vi.fn();
    class CancelToken {
      constructor(cb: (cancel: () => void) => void) {
        cb(cancelFn);
      }
    }

    const axiosMock = {
      CancelToken,
    };

    getCancelToken(axiosMock, signalMock);

    expect(cancelFn).not.toHaveBeenCalled();

    reject("cancel");

    await vi.waitFor(() => expect(cancelFn).toHaveBeenCalled());
  })
});
