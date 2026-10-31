// Captures the real Passalong pages from the local dev server (preview mode:
// no login, nothing saved) at 1080x1920, filled with fictional data.
import { writeFileSync, mkdirSync } from "node:fs";
import { launch, sleep, here } from "./cdp.mjs";

const BASE = "http://localhost:3123";
const OUT = here(import.meta.url, "capture");
mkdirSync(OUT, { recursive: true });
const W = 432, H = 768, DPR = 2.5;

const b = await launch({ profile: here(import.meta.url, "chrome-profile") });
const save = (name, data) => writeFileSync(`${OUT}/${name}`, Buffer.from(data, "base64"));

// --- placeholder upload files (fictional) ---
await b.send("Emulation.setDeviceMetricsOverride", { width: 400, height: 400, deviceScaleFactor: 1, mobile: false });
await b.goto("data:text/html," + encodeURIComponent(`<body style="margin:0;width:400px;height:400px;display:grid;place-items:center;background:linear-gradient(135deg,#1d3157,#12213D)"><div style="width:400px;height:400px;display:grid;place-items:center;font:600 150px Georgia,serif;color:#B08D57">KH</div></body>`));
save("avatar.png", (await b.send("Page.captureScreenshot", { format: "png" })).data);
await b.goto("data:text/html," + encodeURIComponent(`<body style="font-family:Arial;padding:40px"><h1>Sample transcript</h1><p>Placeholder document for a demo video.</p></body>`));
save("transcript.pdf", (await b.send("Page.printToPDF", {})).data);

// --- page setup: hide dev overlay + test banner, swap the preview name ---
await b.send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: DPR, mobile: true });
await b.send("Page.addScriptToEvaluateOnNewDocument", {
  source: `
    const fix = () => {
      const s = document.getElementById('__brag_css') || document.createElement('style');
      s.id = '__brag_css';
      s.textContent = 'nextjs-portal{display:none!important} *{caret-color:transparent!important}';
      (document.head || document.documentElement).appendChild(s);
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = walk.nextNode())) {
        if (n.nodeValue.includes('Test Student')) n.nodeValue = n.nodeValue.replaceAll('Test Student', 'Karim Haddad');
      }
      // React may reuse the hidden banner's <p> for other text, so re-check every time.
      document.querySelectorAll('p').forEach(p => {
        const isBanner = p.textContent.trim().startsWith('Test mode:');
        if (isBanner) { p.style.display = 'none'; p.dataset.bragHidden = '1'; }
        else if (p.dataset.bragHidden) { p.style.display = ''; delete p.dataset.bragHidden; }
      });
    };
    document.addEventListener('DOMContentLoaded', () => {
      fix();
      new MutationObserver(fix).observe(document.body, { childList: true, subtree: true, characterData: true });
    });
  `,
});

const settle = async (ms = 1500) => {
  await b.evaluate("document.fonts.ready.then(() => true)");
  await b.evaluate("Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })))");
  await sleep(ms);
};
const shot = async (name, clip) => {
  const r = await b.send("Page.captureScreenshot", clip
    ? { format: "png", clip: { ...clip, scale: 1 }, captureBeyondViewport: true }
    : { format: "png" });
  save(name, r.data);
};
const rect = (js) => b.evaluate(`(() => { const e = ${js}; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; })()`);
const meta = {};

// 1. Home page
await b.goto(BASE + "/");
await settle(4000);
await b.evaluate("scrollTo(0,0)");
await shot("home.png");
meta.homeButton = await rect(`[...document.querySelectorAll('a')].find(a => a.textContent.trim() === 'Become a tutor' && a.getBoundingClientRect().width > 0 && a.className.includes('bg-brass'))`);
meta.homeText = await b.evaluate("document.body.innerText.slice(0, 400)");

// 2. Apply form, filled in
await b.goto(BASE + "/become-a-tutor");
for (let i = 0; i < 100 && !(await b.evaluate("!!document.querySelector('form select')")); i++) await sleep(200);
await settle(1500);
await b.evaluate(`(() => {
  window.__field = (labelStart) => [...document.querySelectorAll('form label')].find(l => l.textContent.trim().startsWith(labelStart))?.parentElement.querySelector('input,select,textarea');
  window.__set = (el, v) => {
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    if (el.tagName === 'SELECT') v = [...el.options].find(o => o.value === v || o.textContent.trim().startsWith(v))?.value ?? v;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  return true;
})()`);
const fill = async (label, value) => {
  await b.evaluate(`__set(__field(${JSON.stringify(label)}), ${JSON.stringify(value)})`);
  await sleep(250);
};
await fill("University", "USEK");
await fill("Field", "Engineering");
await fill("Major", "Mechanical Engineering");
await fill("Year", "Senior");
await fill("Courses", "Calculus II, Physics I, Statics");
await fill("Price", "15");
await fill("How do you teach", "both");
await fill("Bio", "Mechanical engineering senior. I passed these with an A and I explain them the way I wish someone had explained them to me.");
await fill("Phone", "96171000000");
await fill("GPA", "3.7");
const { root } = await b.send("DOM.getDocument", { depth: -1 });
for (const [sel, file] of [["#transcript-upload", "transcript.pdf"], ["#photo-upload", "avatar.png"]]) {
  const { nodeId } = await b.send("DOM.querySelector", { nodeId: root.nodeId, selector: sel });
  await b.send("DOM.setFileInputFiles", { nodeId, files: [`${OUT}/${file}`.replaceAll("/", "\\")] });
}
await b.evaluate("document.activeElement?.blur(), true");
await settle(1500);
await b.evaluate("scrollTo(0,0)");
await sleep(500);
const fullH = await b.evaluate("document.documentElement.scrollHeight");
await shot("form-full.png", { x: 0, y: 0, width: W, height: fullH });
meta.formFullH = fullH;
meta.formTitle = await rect(`[...document.querySelectorAll('h1')].find(h => h.textContent.includes('Become a tutor'))`);
meta.courses = await rect(`__field('Courses')`);
meta.price = await rect(`__field('Price')`);
meta.teach = await rect(`__field('How do you teach')`);
meta.submit = await rect(`document.querySelector('form button[type=submit]')`);
meta.bodyHasTestStudent = await b.evaluate("document.body.innerText.includes('Test Student') || document.body.innerText.includes('Test mode')");

// 3. Confirm box, over the bottom of the form
const maxScroll = fullH - H;
await b.evaluate(`scrollTo(0, ${maxScroll})`);
meta.maxScroll = maxScroll;
await b.evaluate("document.querySelector('form').requestSubmit(), true");
for (let i = 0; i < 50 && !(await b.evaluate("!!document.getElementById('confirm-title')")); i++) await sleep(100);
// The video leaves out the fee notice in the confirm box.
await b.evaluate(`(() => { const p = [...document.querySelectorAll('[role=dialog] p')].find(p => p.textContent.includes('first month is free')); p.parentElement.style.display = 'none'; return true; })()`);
await settle(800);
await shot("confirm.png");
meta.confirmYes = await b.evaluate(`(() => { const e = [...document.querySelectorAll('[role=dialog] button')].find(x => x.textContent.includes('Yes, submit')); const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
meta.confirmBox = await b.evaluate(`(() => { const r = document.querySelector('[role=dialog] > div').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
meta.confirmText = await b.evaluate("document.querySelector('[role=dialog]').innerText");

// 4. Success screen (preview mode: nothing is saved)
await b.evaluate(`[...document.querySelectorAll('[role=dialog] button')].find(x => x.textContent.includes('Yes, submit')).click(), true`);
for (let i = 0; i < 50 && !(await b.evaluate("document.body.innerText.includes('Thanks for applying')")); i++) await sleep(100);
await b.evaluate("scrollTo(0,0)");
// On the success page keep only "first month is free" and when it starts.
await b.evaluate(`(() => { [...document.querySelectorAll('p')].filter(p => p.textContent.includes('per month') || p.textContent.startsWith('Until then')).forEach(p => p.style.display = 'none'); return true; })()`);
await settle(800);
await shot("success.png");
meta.feeBox = await rect(`[...document.querySelectorAll('p')].find(p => p.textContent.includes('first month is free'))?.parentElement`);
meta.successText = await b.evaluate("document.querySelector('main, body').innerText.slice(0, 600)");

writeFileSync(`${OUT}/meta.json`, JSON.stringify(meta, null, 2));
console.log(JSON.stringify(meta, null, 2));
b.close();
process.exit(0);
