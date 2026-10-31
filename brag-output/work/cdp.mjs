// Tiny Chrome DevTools Protocol client: launches the system Chrome headless
// and talks to one page over Node's built-in WebSocket. No npm packages.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

export async function launch({ port = 9333, profile } = {}) {
  mkdirSync(profile, { recursive: true });
  const proc = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--mute-audio",
      "--force-color-profile=srgb",
      "--font-render-hinting=none",
      "--disable-features=Translate",
      "about:blank",
    ],
    { stdio: "ignore" }
  );
  let target;
  for (let i = 0; i < 100; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      target = list.find((t) => t.type === "page");
      if (target) break;
    } catch {}
    await sleep(100);
  }
  if (!target) throw new Error("Chrome did not start");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
    } else if (msg.method) {
      for (const l of [...listeners]) l(msg);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const n = ++id;
      pending.set(n, { res, rej });
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  const once = (method, timeout = 30000) =>
    new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error("timeout " + method)), timeout);
      const l = (msg) => {
        if (msg.method === method) {
          clearTimeout(t);
          listeners.splice(listeners.indexOf(l), 1);
          res(msg.params);
        }
      };
      listeners.push(l);
    });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  const goto = async (url) => {
    const loaded = once("Page.loadEventFired", 120000);
    await send("Page.navigate", { url });
    await loaded;
  };
  const close = () => {
    try { ws.close(); } catch {}
    proc.kill();
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("DOM.enable");
  return { send, once, evaluate, goto, close };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function here(metaUrl, ...p) {
  return path.join(path.dirname(fileURLToPath(metaUrl)), ...p);
}
