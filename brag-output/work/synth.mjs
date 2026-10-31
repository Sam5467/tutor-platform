// Synthesizes the 20s soundtrack: music + sound effects on one 120 BPM grid,
// in A minor -> C major, with a shared reverb. Writes work/audio.wav (48k stereo).
import { writeFileSync } from "node:fs";
import { here } from "./cdp.mjs";

const SR = 48000, DUR = 20.0, N = Math.round(SR * DUR);
const BEAT = 0.5, BAR = 2.0;
const L = new Float32Array(N), R = new Float32Array(N);       // dry mix (not ducked)
const DL = new Float32Array(N), DR = new Float32Array(N);     // dry mix ducked by the kick
const RL = new Float32Array(N), RR = new Float32Array(N);     // reverb send
const duck = new Float32Array(N).fill(1);                     // sidechain from the kick

// deterministic noise
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const idx = (t) => Math.round(t * SR);

function add(buf, i, v) { if (i >= 0 && i < N) buf[i] += v; }
function put(t0, samples, { gain = 1, pan = 0, send = 0, ducked = false } = {}) {
  const i0 = idx(t0);
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4) * Math.SQRT2;
  const gr = gain * Math.sin((pan + 1) * Math.PI / 4) * Math.SQRT2;
  for (let k = 0; k < samples.length; k++) {
    const i = i0 + k; if (i < 0 || i >= N) continue;
    const v = samples[k];
    if (ducked) { add(DL, i, v * gl); add(DR, i, v * gr); } else { add(L, i, v * gl); add(R, i, v * gr); }
    if (send) { add(RL, i, v * gl * send); add(RR, i, v * gr * send); }
  }
}
// one-pole low-pass in place
function lp(x, fc) { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; for (let i = 0; i < x.length; i++) { y = (1 - a) * x[i] + a * y; x[i] = y; } return x; }
function hp(x, fc) { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0, px = 0; for (let i = 0; i < x.length; i++) { y = a * (y + x[i] - px); px = x[i]; x[i] = y; } return x; }

// ---------- instruments ----------
function kick(vel = 1) {
  const n = idx(0.42), x = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = 45 + 85 * Math.exp(-t * 28);
    ph += 2 * Math.PI * f / SR;
    x[i] = Math.sin(ph) * Math.exp(-t * 7.5) * vel + (i < 90 ? rnd() * 0.15 * (1 - i / 90) : 0);
  }
  return x;
}
function clap() {
  const n = idx(0.3), x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const bursts = [0, 0.011, 0.022].reduce((s, o) => s + (t >= o ? Math.exp(-(t - o) * 120) : 0), 0);
    x[i] = rnd() * (bursts * 0.6 + Math.exp(-t * 18) * 0.35);
  }
  return lp(hp(x, 900), 5000);
}
function hat(open = false) {
  const n = idx(open ? 0.18 : 0.05), x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = rnd() * Math.exp(-(i / SR) * (open ? 22 : 90));
  return lp(hp(x, 7000), 12000);
}
// Karplus-Strong pluck: warm, soft
function pluck(m, dur = 0.9, bright = 0.5) {
  const f = midi(m), p = Math.max(2, Math.round(SR / f)), n = idx(dur), x = new Float32Array(n);
  const buf = new Float32Array(p); for (let i = 0; i < p; i++) buf[i] = rnd();
  lp(buf, 2000 + bright * 4000);
  let j = 0, prev = 0;
  for (let i = 0; i < n; i++) {
    const v = buf[j]; const nv = 0.5 * (v + prev) * 0.996; prev = v; buf[j] = nv; j = (j + 1) % p;
    x[i] = v * Math.min(1, i / 40) * (i > n - 2000 ? (n - i) / 2000 : 1);
  }
  return x;
}
// pad: detuned saws, low-passed, slow attack
function pad(notes, dur) {
  const n = idx(dur), x = new Float32Array(n);
  for (const m of notes) for (const det of [-0.08, 0.07]) {
    const f = midi(m + det); let ph = rnd() * 0.5 + 0.5;
    for (let i = 0; i < n; i++) { ph += f / SR; if (ph > 1) ph -= 1; x[i] += (ph * 2 - 1) * 0.12; }
  }
  lp(lp(x, 1400), 1800);
  for (let i = 0; i < n; i++) { const t = i / SR; x[i] *= Math.min(1, t / 0.35) * Math.min(1, (dur - t) / 0.3); }
  return x;
}
function bass(m, dur) {
  const f = midi(m), n = idx(dur), x = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR; ph += 2 * Math.PI * f / SR;
    const v = Math.sin(ph) + 0.25 * Math.sin(2 * ph) + 0.08 * Math.sin(3 * ph);
    x[i] = Math.tanh(v * 1.2) * Math.min(1, t / 0.006) * Math.exp(-t * 2.5) * Math.min(1, (dur - t) / 0.02);
  }
  return x;
}
function bell(notes, dur = 2.2) {
  const n = idx(dur), x = new Float32Array(n);
  for (const m of notes) {
    const f = midi(m);
    for (const [r, a, d] of [[1, 1, 2.2], [2.0, 0.35, 4], [3.01, 0.18, 6], [4.2, 0.08, 9]])
      for (let i = 0; i < n; i++) { const t = i / SR; x[i] += Math.sin(2 * Math.PI * f * r * t) * a * Math.exp(-t * d) * Math.min(1, t / 0.003); }
  }
  return x;
}
function blip(m, dur = 0.12, gain = 1) { // soft UI tick, tuned to the key
  const f = midi(m), n = idx(dur), x = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 38) * Math.min(1, t / 0.002) * gain; }
  return x;
}
function tap() { // soft finger tap: tuned body + tiny click
  const n = idx(0.09), x = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * midi(81) * t) * Math.exp(-t * 60) * 0.6 + rnd() * Math.exp(-t * 400) * 0.25; }
  return lp(x, 6000);
}
function pop() {
  const n = idx(0.16), x = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; ph += 2 * Math.PI * (midi(76) * (1 - 0.45 * Math.min(1, t / 0.06))) / SR; x[i] = Math.sin(ph) * Math.exp(-t * 26); }
  return x;
}
function whoosh(dur = 0.6, up = true) { // filtered noise swell centered at dur/2
  const n = idx(dur), x = new Float32Array(n); let y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const k = i / n, env = Math.sin(Math.PI * k) ** 2;
    const fc = up ? 300 + 3500 * k : 3800 - 3500 * k;
    const a = Math.exp(-2 * Math.PI * fc / SR);
    y1 = (1 - a) * rnd() + a * y1; y2 = (1 - a) * y1 + a * y2;
    x[i] = (y1 - y2 * 0.5) * env * 3;
  }
  return x;
}
function riser(dur) {
  const n = idx(dur), x = new Float32Array(n); let y = 0, ph = 0;
  for (let i = 0; i < n; i++) {
    const k = i / n, fc = 400 + 6000 * k * k, a = Math.exp(-2 * Math.PI * fc / SR);
    y = (1 - a) * rnd() + a * y; ph += 2 * Math.PI * midi(57 + 12 * k) / SR;
    x[i] = (y * 0.8 + Math.sin(ph) * 0.12) * k * k * Math.min(1, (n - i) / 400);
  }
  return x;
}
function crash() {
  const n = idx(1.6), x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = rnd() * Math.exp(-(i / SR) * 3.2);
  return lp(hp(x, 4500), 11000);
}
function boom() {
  const n = idx(1.2), x = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; ph += 2 * Math.PI * (38 + 40 * Math.exp(-t * 10)) / SR; x[i] = Math.sin(ph) * Math.exp(-t * 3); }
  return x;
}

// ---------- arrangement ----------
// bars: Am F C G | Am F C G | F C  (C major lands on the outro)
const chords = [
  { root: 45, notes: [57, 60, 64] }, { root: 41, notes: [57, 60, 65] }, { root: 48, notes: [55, 60, 64] }, { root: 43, notes: [55, 59, 62] },
  { root: 45, notes: [57, 60, 64] }, { root: 41, notes: [57, 60, 65] }, { root: 48, notes: [55, 60, 64] }, { root: 43, notes: [55, 59, 62] },
  { root: 41, notes: [57, 60, 65] }, { root: 48, notes: [55, 60, 64, 67] },
];
const drumsOn = (t) => t >= 3.0 && !(t >= 12.5 && t < 13.0) && t < 19.0;

chords.forEach((c, b) => {
  const t0 = b * BAR;
  // pad under everything (softer in the hook)
  put(t0, pad(c.notes.map((m) => m), b === 9 ? 2.0 : BAR + 0.05), { gain: b < 2 ? 1.1 : 0.42, send: 0.3, ducked: true });
  // pluck arpeggio on 8ths
  const arp = [c.notes[0] + 12, c.notes[1] + 12, c.notes[2] + 12, c.notes[1] + 12];
  for (let s = 0; s < 8; s++) {
    const t = t0 + s * BEAT / 2;
    if (b === 9 && s > 0) break;
    put(t, pluck(arp[s % 4], b === 9 ? 1.8 : 0.6, 0.45), { gain: (t < 3 ? 0.42 : 0.22) * (s % 2 ? 0.75 : 1), pan: s % 2 ? 0.35 : -0.35, send: 0.35, ducked: true });
  }
  // bass on 8ths once the drums are in
  for (let s = 0; s < 8; s++) {
    const t = t0 + s * BEAT / 2;
    if (!drumsOn(t) && !(b === 9 && s === 0)) continue;
    if (b === 9 && s > 0) break;
    put(t, bass(c.root + (s === 7 ? 7 : 0), b === 9 ? 1.8 : 0.24), { gain: 0.4, ducked: true });
  }
});
// drums on the beat grid
for (let i = 0; i < DUR / BEAT; i++) {
  const t = i * BEAT;
  if (!drumsOn(t)) continue;
  put(t, kick(), { gain: 0.6 });
  const d0 = idx(t);
  for (let k = 0; k < idx(0.3); k++) if (d0 + k < N) duck[d0 + k] = Math.min(duck[d0 + k], 1 - 0.55 * Math.exp(-k / SR * 9));
  if (i % 2 === 1) put(t, clap(), { gain: 0.5, send: 0.25 });
  put(t + BEAT / 2, hat(i % 4 === 3), { gain: 0.16, pan: 0.25 });
}
// fill: snare-ish claps leading into the outro
[15.5, 15.625, 15.75, 15.875].forEach((t, k) => put(t, clap(), { gain: 0.25 + k * 0.08, send: 0.25 }));

// ---------- sound effects (same key, same room, under the music) ----------
put(1.0, riser(2.0), { gain: 0.22, send: 0.2 });
put(3.0, crash(), { gain: 0.22, send: 0.3 });
put(2.7, whoosh(0.6, true), { gain: 0.16, send: 0.2 });         // card slides in
put(5.0, tap(), { gain: 0.5, send: 0.15 });                     // tap "Become a tutor"
put(5.45, whoosh(0.55, true), { gain: 0.15, send: 0.2 });       // zoom through the button
[7.0, 7.5, 8.0].forEach((t, k) => put(t, blip([76, 79, 84][k], 0.14), { gain: 0.22, pan: 0.3, send: 0.35 })); // chips
put(8.6, whoosh(0.8, false), { gain: 0.08, send: 0.15 });       // scroll
put(10.0, tap(), { gain: 0.5, send: 0.15 });                    // tap Submit
put(10.5, pop(), { gain: 0.3, send: 0.25 });                    // confirm box
put(12.0, tap(), { gain: 0.5, send: 0.15 });                    // tap Yes, submit
put(12.55, whoosh(0.45, true), { gain: 0.12, send: 0.2 });
put(13.0, bell([72, 76, 79, 84], 2.4), { gain: 0.12, send: 0.5 }); // success
put(13.0, crash(), { gain: 0.18, send: 0.3 });
put(14.0, blip(88, 0.16), { gain: 0.18, send: 0.4 });           // first month free
put(15.75, whoosh(0.6, false), { gain: 0.16, send: 0.2 });      // card leaves
put(16.0, boom(), { gain: 0.45 });
put(16.0, crash(), { gain: 0.25, send: 0.35 });
[17.0, 17.5, 18.0].forEach((t, k) => put(t, blip([79, 83, 84][k], 0.15), { gain: 0.14, send: 0.45 }));
put(18.0, bell([60, 64, 67, 72], 2.0), { gain: 0.06, send: 0.5 });

// ---------- reverb (Schroeder), sidechain, master ----------
function reverb(inp) {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d, b: new Float32Array(d), i: 0, f: 0 }));
  const aps = [225, 556].map((d) => ({ d, b: new Float32Array(d), i: 0 }));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) { const y = c.b[c.i]; c.f = y * 0.75 + c.f * 0.25; c.b[c.i] = inp[n] + c.f * 0.8; c.i = (c.i + 1) % c.d; s += y; }
    for (const a of aps) { const bv = a.b[a.i]; const y = -s + bv; a.b[a.i] = s + bv * 0.5; a.i = (a.i + 1) % a.d; s = y; }
    out[n] = s * 0.25;
  }
  return out;
}
const wl = reverb(RL), wr = reverb(RR);
let peak = 0;
for (let n = 0; n < N; n++) {
  L[n] = L[n] + DL[n] * duck[n] + wl[n] * 0.9;
  R[n] = R[n] + DR[n] * duck[n] + wr[n] * 0.9;
  // gentle fade at the very end
  const t = n / SR, fade = t > 19.2 ? Math.max(0, (20 - t) / 0.8) : 1;
  L[n] = Math.tanh(L[n] * 1.1) * fade; R[n] = Math.tanh(R[n] * 1.1) * fade;
  peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
}
const g = 0.89 / peak; // about -1 dBFS
const pcm = Buffer.alloc(44 + N * 4);
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write("WAVE", 8);
pcm.write("fmt ", 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34);
pcm.write("data", 36); pcm.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[n] * g)) * 32767), 44 + n * 4);
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[n] * g)) * 32767), 46 + n * 4);
}
writeFileSync(here(import.meta.url, "audio.wav"), pcm);
console.log("audio.wav written, peak before normalize:", peak.toFixed(3));
