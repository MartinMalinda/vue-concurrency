import { defer, getCancelToken } from "../src/utils/general";
import { waitFor } from "@testing-library/dom";
import { AbortSignalWithPromise } from "../src/types/index";

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
