import { defer, getCancelToken } from "../src/utils";
import { waitFor } from "@testing-library/vue";
import { AbortSignalWithPromise } from "../src/types";

describe("getCancelToken", () => {
  it("works", async () => {
    const { promise, reject } = defer();
    const signalMock = {
      pr: promise,
    } as AbortSignalWithPromise;

    const cancelFn = jest.fn();
    class CancelToken {
      constructor(cb: (cancel: () => void) => void) {
        cb(cancelFn);
      }
    }

    const axiosMock = {
      CancelToken,
    };

    getCancelToken(axiosMock, signalMock);

    expect(cancelFn).not.toBeCalled();

    reject("cancel");

    await waitFor(() => expect(cancelFn).toHaveBeenCalled());
  });
});
