// node_modules/caf/dist/esm/shared.mjs
var CLEANUP_FN = Symbol("Cleanup Function");
var TIMEOUT_TOKEN = Symbol("Timeout Token");
var REASON = Symbol("Signal Reason");
var UNSET = Symbol("Unset");
var [SIGNAL_HAS_REASON_DEFINED, MISSING_REASON_EXCEPTION] = function featureDetect() {
  var n = new AbortController(), e = !!Object.getOwnPropertyDescriptor(Object.getPrototypeOf(n.signal), "reason");
  try {
    n.abort();
  } catch (n2) {
  }
  return [e, isNativeAbortException(n.signal.reason)];
}();
var cancelToken = class {
  constructor(n = new AbortController()) {
    var e;
    this.controller = n, this.signal = n.signal, this.signal[REASON] = UNSET;
    var initPromise = (n2, t) => {
      var doRej = () => {
        if (t && this.signal) {
          let n3 = getSignalReason(this.signal);
          this._trackSignalReason(n3), t(n3 !== UNSET ? n3 : void 0);
        }
        t = null;
      };
      this.signal.addEventListener("abort", doRej, false), e = () => {
        this.signal && (this.signal.removeEventListener("abort", doRej, false), this.signal.pr && (this.signal.pr[CLEANUP_FN] = null)), doRej = null;
      };
    };
    this.signal.pr = new Promise(initPromise), this.signal.pr[CLEANUP_FN] = e, this.signal.pr.catch(e), initPromise = e = null;
  }
  abort(...n) {
    var e = n.length > 0 ? n[0] : UNSET;
    this._trackSignalReason(e), this.controller && (SIGNAL_HAS_REASON_DEFINED && e !== UNSET ? this.controller.abort(e) : this.controller.abort());
  }
  discard() {
    this.signal && (this.signal.pr && (this.signal.pr[CLEANUP_FN] && this.signal.pr[CLEANUP_FN](), this.signal.pr = null), delete this.signal[REASON], SIGNAL_HAS_REASON_DEFINED || (this.signal.reason = null), this.signal = null), this.controller = null;
  }
  _trackSignalReason(n) {
    this.signal && n !== UNSET && (SIGNAL_HAS_REASON_DEFINED || "reason" in this.signal || (this.signal.reason = n), this.signal[REASON] === UNSET && (this.signal[REASON] = n));
  }
};
var shared_default = { CLEANUP_FN, TIMEOUT_TOKEN, UNSET, getSignalReason, cancelToken, signalPromise, processTokenOrSignal, deferred, isFunction, isPromise, invokeAbort };
function getSignalReason(n) {
  return n && n.aborted ? SIGNAL_HAS_REASON_DEFINED && MISSING_REASON_EXCEPTION ? isNativeAbortException(n.reason) ? UNSET : n.reason : REASON in n ? n[REASON] : UNSET : UNSET;
}
function signalPromise(n) {
  if (n.pr)
    return n.pr;
  var e, t = new Promise(function c(t2, i) {
    e = () => {
      if (i && n) {
        let e2 = getSignalReason(n);
        i(e2 !== UNSET ? e2 : void 0);
      }
      i = null;
    }, n.addEventListener("abort", e, false);
  });
  return t[CLEANUP_FN] = function cleanup() {
    n && (n.removeEventListener("abort", e, false), n = null), t && (t = t[CLEANUP_FN] = e = null);
  }, t.catch(t[CLEANUP_FN]), t;
}
function processTokenOrSignal(n) {
  n instanceof AbortController && (n = new cancelToken(n));
  var e = n && n instanceof cancelToken ? n.signal : n;
  return { tokenOrSignal: n, signal: e, signalPr: signalPromise(e) };
}
function deferred() {
  var n;
  return { pr: new Promise((e) => n = e), resolve: n };
}
function isFunction(n) {
  return "function" == typeof n;
}
function isPromise(n) {
  return n && "object" == typeof n && "function" == typeof n.then;
}
function isNativeAbortException(n) {
  return "object" == typeof n && n instanceof Error && "AbortError" == n.name;
}
function invokeAbort(n, e) {
  isNativeAbortException(e) || e === UNSET ? n.abort() : n.abort(e);
}

// node_modules/caf/dist/esm/caf.mjs
var caf_default = Object.assign(CAF, { cancelToken, delay, timeout, signalRace, signalAll, tokenCycle });
function CAF(n) {
  return function instance(e, ...r) {
    var l, i;
    if ({ tokenOrSignal: e, signal: l, signalPr: i } = processTokenOrSignal(e), l.aborted)
      return i;
    var o = i.catch(function onCancellation(n2) {
      var e2 = getSignalReason(l);
      e2 = e2 !== UNSET ? e2 : n2;
      try {
        var r2 = a.return();
        throw void 0 !== r2.value ? r2.value : e2 !== UNSET ? e2 : void 0;
      } finally {
        a = u = o = s = null;
      }
    }), { it: a, result: u } = runner.call(this, n, l, ...r), s = Promise.race([u, o]);
    if (e !== l && e[TIMEOUT_TOKEN]) {
      let n2 = function cancelTimer(r2) {
        invokeAbort(e, r2), isFunction(e.discard) && e.discard(), e = n2 = null;
      };
      s.then(n2, n2);
    } else
      s.catch(() => {
      }), e = null;
    return r = null, s;
  };
}
function delay(n, e) {
  var r, l;
  return "number" == typeof n && "number" != typeof e && ([e, n] = [n, e]), n && ({ tokenOrSignal: n, signal: r, signalPr: l } = processTokenOrSignal(n)), r && r.aborted ? l : new Promise(function c(n2, i) {
    r && (l.catch(function onAbort() {
      if (i && r && o) {
        let l2 = getSignalReason(r);
        clearTimeout(o), i(l2 !== UNSET ? l2 : `delay (${e}) interrupted`), n2 = i = o = r = null;
      }
    }), l = null);
    var o = setTimeout(function onTimeout() {
      n2(`delayed: ${e}`), n2 = i = o = r = null;
    }, e);
  });
}
function timeout(n, e = "Timeout") {
  n = Number(n) || 0;
  var r = new cancelToken();
  return delay(r.signal, n).then(() => cleanup(e), cleanup), Object.defineProperty(r, TIMEOUT_TOKEN, { value: true, writable: false, enumerable: false, configurable: false }), r;
  function cleanup(...n2) {
    invokeAbort(r, n2.length > 0 ? n2[0] : UNSET), r.discard(), r = null;
  }
}
function splitSignalPRs(n) {
  return n.reduce(function split(n2, e) {
    var r = signalPromise(e);
    return n2[0].push(r), e.pr || n2[1].push(r), n2;
  }, [[], []]);
}
function triggerAndCleanup(n, e, r) {
  n.then(function t(n2) {
    invokeAbort(e, n2), e.discard(), e = null;
  }).then(function t() {
    for (let n2 of r)
      n2[CLEANUP_FN] && n2[CLEANUP_FN]();
    r = null;
  });
}
function prCatch(n) {
  return n.catch((n2) => n2);
}
function signalRace(n) {
  var e = new cancelToken(), [r, l] = splitSignalPRs(n);
  return triggerAndCleanup(prCatch(Promise.race(r)), e, l), e.signal;
}
function signalAll(n) {
  var e = new cancelToken(), [r, l] = splitSignalPRs(n);
  return triggerAndCleanup(Promise.all(r.map(prCatch)), e, l), e.signal;
}
function tokenCycle() {
  var n;
  return function getNextToken(...e) {
    return n && (invokeAbort(n, e.length > 0 ? e[0] : UNSET), n.discard()), n = new cancelToken();
  };
}
function runner(n, ...e) {
  var r = n.apply(this, e);
  return n = e = null, { it: r, result: function getNextResult(n2) {
    try {
      var e2 = r.next(n2);
      n2 = null;
    } catch (n3) {
      return Promise.reject(n3);
    }
    return function processResult(n3) {
      var e3 = Promise.resolve(n3.value);
      return n3.done ? r = null : (e3 = e3.then(getNextResult, function onRejection(n4) {
        return Promise.resolve(r.throw(n4)).then(processResult);
      })).catch(function cleanup() {
        r = null;
      }), n3 = null, e3;
    }(e2);
  }() };
}

// node_modules/caf/dist/esm/cag.mjs
onceEvent = caf_default(onceEvent);
var cag_default = Object.assign(CAG, { onEvent, onceEvent });
var awaiteds = /* @__PURE__ */ new WeakSet();
var unset = Symbol("unset");
var returned = Symbol("returned");
var canceled = Symbol("canceled");
function CAG(e) {
  return function instance(n, ...r) {
    var t, a;
    if ({ tokenOrSignal: n, signal: t, signalPr: a } = processTokenOrSignal(n), t.aborted) {
      let e2 = getSignalReason(t);
      throw e2 = e2 !== UNSET ? e2 : "Aborted", e2;
    }
    var o = deferred(), { it: i, ait: l } = runner2(e, o.pr, onComplete, t, ...r), s = l.return;
    return l.return = function doReturn(e2) {
      try {
        return o.pr.resolved = true, o.resolve(returned), Promise.resolve(i.return(e2));
      } finally {
        s.call(l), onComplete();
      }
    }, l;
    function onComplete() {
      n && n !== t && n[TIMEOUT_TOKEN] && n.abort(), l && (l.return = s, n = o = i = l = s = null);
    }
  };
}
function onEvent(e, n, r, t = false) {
  var a, o, i = false, l = CAG(function* eventStream({ pwait: e2 }) {
    i || start();
    try {
      for (; ; ) {
        if (0 == a.length) {
          let { pr: e3, resolve: n2 } = deferred();
          a.push(e3), o.push(n2);
        }
        yield yield e2(a.shift());
      }
    } finally {
      isFunction(n.removeEventListener) ? n.removeEventListener(r, handler, t) : isFunction(n.removeListener) ? n.removeListener(r, handler) : isFunction(n.off) && n.off(r, handler), a.length = o.length = 0;
    }
  })(e, n, r, t);
  return l.start = start, l;
  function start() {
    i || (i = true, a = [], o = [], isFunction(n.addEventListener) ? n.addEventListener(r, handler, t) : isFunction(n.addListener) ? n.addListener(r, handler) : isFunction(n.on) && n.on(r, handler));
  }
  function handler(e2) {
    if (o.length > 0) {
      o.shift()(e2);
    } else {
      let { pr: n2, resolve: r2 } = deferred();
      a.push(n2), r2(e2);
    }
  }
}
function* onceEvent(e, n, r, t = false) {
  try {
    var a = onEvent(e, n, r, t);
    return (yield a.next()).value;
  } finally {
    a.return();
  }
}
function pwait(e) {
  var n = Promise.resolve(e);
  return awaiteds.add(n), n;
}
function runner2(e, n, r, t, ...a) {
  var o = e.call(this, { signal: t, pwait }, ...a);
  e = a = null;
  var i = t.pr.catch((e2) => {
    throw { [canceled]: true, reason: e2 };
  });
  return i.catch(() => {
  }), { it: o, ait: async function* runner3() {
    var e2, t2 = unset;
    try {
      for (; !n.resolved; )
        if (t2 !== unset ? (e2 = t2, t2 = unset, e2 = o.throw(e2)) : e2 = o.next(e2), isPromise(e2.value))
          if (awaiteds.has(e2.value)) {
            awaiteds.delete(e2.value);
            try {
              if ((e2 = await Promise.race([n, i, e2.value])) === returned)
                return;
            } catch (e3) {
              if (e3[canceled]) {
                let n2 = o.return();
                throw void 0 !== n2.value ? n2.value : e3.reason;
              }
              t2 = e3;
            }
          } else
            e2 = yield e2.value;
        else {
          if (e2.done)
            return e2.value;
          e2 = yield e2.value;
        }
    } finally {
      o = n = null, r();
    }
  }() };
}
export {
  caf_default as CAF,
  shared_default as CAFShared,
  cag_default as CAG
};
/*! Bundled license information:

caf/dist/esm/shared.mjs:
  (*! CAF: shared.mjs
  	v15.0.1 (c) 2022 Kyle Simpson
  	MIT License: http://getify.mit-license.org
  *)

caf/dist/esm/caf.mjs:
  (*! CAF: caf.mjs
  	v15.0.1 (c) 2022 Kyle Simpson
  	MIT License: http://getify.mit-license.org
  *)

caf/dist/esm/cag.mjs:
  (*! CAF: cag.mjs
  	v15.0.1 (c) 2022 Kyle Simpson
  	MIT License: http://getify.mit-license.org
  *)

caf/dist/esm/index.mjs:
  (*! CAF: index.mjs
  	v15.0.1 (c) 2022 Kyle Simpson
  	MIT License: http://getify.mit-license.org
  *)
*/
//# sourceMappingURL=caf.js.map
