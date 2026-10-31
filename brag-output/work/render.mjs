// Renders the composition frame by frame. Every frame is render(t), so the
// output is exact. Usage:
//   node render.mjs stills 0.5,4.9,...   -> work/stills/t_<time>.png
//   node render.mjs frames               -> work/frames/f_00000.jpg ... (600 frames)
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { launch, here } from "./cdp.mjs";

const [mode, list] = process.argv.slice(2);
const FPS = 30, DUR = 20;
const b = await launch({ port: 9334, profile: here(import.meta.url, "chrome-profile-render") });
await b.send("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
await b.goto(pathToFileURL(here(import.meta.url, "composition", "index.html")).href);
await b.evaluate("window.ready");

const grab = async (t, file, format) => {
  await b.evaluate(`render(${t}); new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);
  const r = await b.send("Page.captureScreenshot", format === "jpeg" ? { format, quality: 95 } : { format });
  writeFileSync(file, Buffer.from(r.data, "base64"));
};

if (mode === "stills") {
  const dir = here(import.meta.url, "stills");
  mkdirSync(dir, { recursive: true });
  for (const t of list.split(",").map(Number)) await grab(t, `${dir}/t_${t.toFixed(2)}.png`, "png");
} else {
  // optional second argument: first frame to (re)render, keeping earlier ones
  const from = Number(list ?? 0);
  const dir = here(import.meta.url, "frames");
  if (!from) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (let i = from; i < FPS * DUR; i++) {
    await grab(i / FPS, `${dir}/f_${String(i).padStart(5, "0")}.jpg`, "jpeg");
    if (i % 60 === 0) console.log("frame", i);
  }
}
b.close();
process.exit(0);
