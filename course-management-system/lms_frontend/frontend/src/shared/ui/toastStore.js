let listeners = [];
let state = { message: "", type: "info", visible: false };

export function toastSubscribe(fn) {
  listeners.push(fn);
  fn(state);
  return () => {
    listeners = listeners.filter((x) => x !== fn);
  };
}

export function toastShow(message, type = "info", ms = 2400) {
  state = { message, type, visible: true };
  listeners.forEach((fn) => fn(state));

  window.clearTimeout(toastShow._t);
  toastShow._t = window.setTimeout(() => {
    state = { ...state, visible: false };
    listeners.forEach((fn) => fn(state));
  }, ms);
}