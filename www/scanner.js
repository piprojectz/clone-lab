/* On-device gene reader.
   Finds rows of six coloured gene tiles (green = G/Y/H, red = W/X) in an image,
   then reads the letter on each tile by comparing it against rendered letter templates.
   No network, no AI service. */
const Scanner = (() => {
  const GW = 12, GH = 16;                     // letter grid size
  let templates = null;

  /* ---------- colour ---------- */
  // 0 = background, 1 = green tile, 2 = red tile
  function tileClass(r, g, b) {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (mx < 50) return 0;
    const s = d / mx;
    if (s < 0.28) return 0;
    let h;
    if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
    if (h >= 55 && h <= 170) return 1;
    if (h <= 28 || h >= 335) return 2;
    return 0;
  }

  /* ---------- letter templates ---------- */
  async function init() {
    if (templates) return;
    try { await Promise.all([document.fonts.load('700 100px "Barlow Condensed"'), document.fonts.load('600 100px "IBM Plex Mono"')]); } catch (e) {}
    const fonts = ['bold 100px sans-serif-condensed', 'bold 100px sans-serif', '100px sans-serif', 'bold 100px Roboto', 'bold 100px "Barlow Condensed"', '600 100px "IBM Plex Mono"', 'bold 100px Arial', 'bold 100px monospace'];
    const c = document.createElement('canvas'); c.width = c.height = 140;
    const x = c.getContext('2d', { willReadFrequently: true });
    templates = [];
    for (const L of 'GYHWX') for (const f of fonts) {
      x.fillStyle = '#000'; x.fillRect(0, 0, 140, 140);
      x.fillStyle = '#fff'; x.font = f; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(L, 70, 72);
      const d = x.getImageData(0, 0, 140, 140).data;
      const ink = new Float32Array(140 * 140);
      for (let i = 0; i < ink.length; i++) ink[i] = d[i * 4] / 255;
      const v = toGrid(ink, 140, 140, 0.5);
      if (v) templates.push({ L, ...v });
    }
  }

  // ink: 0..1 per pixel. Crop to ink bounding box, resample to GW x GH coverage grid.
  function toGrid(ink, w, h, thr) {
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    const colN = new Int32Array(w), rowN = new Int32Array(h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (ink[y * w + x] >= thr) { colN[x]++; rowN[y]++; }
    const minC = Math.max(1, Math.round(h * 0.04)), minR = Math.max(1, Math.round(w * 0.04));
    for (let x = 0; x < w; x++) if (colN[x] >= minC) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
    for (let y = 0; y < h; y++) if (rowN[y] >= minR) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    if (x1 < x0 || y1 < y0) return null;
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
    if (bw < 2 || bh < 3) return null;
    const g = new Float32Array(GW * GH);
    for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
      const sx0 = x0 + gx * bw / GW, sx1 = x0 + (gx + 1) * bw / GW, sy0 = y0 + gy * bh / GH, sy1 = y0 + (gy + 1) * bh / GH;
      let sum = 0, n = 0;
      for (let y = Math.floor(sy0); y < Math.max(Math.floor(sy0) + 1, Math.ceil(sy1)); y++)
        for (let x = Math.floor(sx0); x < Math.max(Math.floor(sx0) + 1, Math.ceil(sx1)); x++) { sum += ink[y * w + x] >= thr ? 1 : 0; n++; }
      g[gy * GW + gx] = n ? sum / n : 0;
    }
    return { g, aspect: bw / bh };
  }

  function otsu(vals) {
    const hist = new Float64Array(256); for (const v of vals) hist[v]++;
    const total = vals.length; let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
    let sumB = 0, wB = 0, best = 0, thr = 128;
    for (let t = 0; t < 256; t++) {
      wB += hist[t]; if (!wB) continue; const wF = total - wB; if (!wF) break;
      sumB += t * hist[t]; const mB = sumB / wB, mF = (sum - sumB) / wF, between = wB * wF * (mB - mF) ** 2;
      if (between > best) { best = between; thr = t; }
    }
    return thr;
  }

  function readTile(data, W, box, cls) {
    const inset = 0.14;
    const x0 = Math.round(box.x0 + box.w * inset), x1 = Math.round(box.x1 - box.w * inset);
    const y0 = Math.round(box.y0 + box.h * inset), y1 = Math.round(box.y1 - box.h * inset);
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    if (w < 4 || h < 4) return null;
    const lum = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = ((y0 + y) * W + (x0 + x)) * 4;
      lum[y * w + x] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }
    const t = otsu(lum);
    let bright = 0; for (const v of lum) if (v > t) bright++;
    const brightInk = bright / lum.length < 0.5;            // letters are the minority colour
    const ink = new Float32Array(w * h);
    for (let i = 0; i < lum.length; i++) ink[i] = (brightInk ? lum[i] > t : lum[i] <= t) ? 1 : 0;
    const v = toGrid(ink, w, h, 0.5);
    if (!v) return null;
    const allowed = cls === 1 ? 'GYH' : cls === 2 ? 'WX' : 'GYHWX';
    const bestBy = {};
    for (const T of templates) {
      if (!allowed.includes(T.L)) continue;
      let d = 0; for (let i = 0; i < T.g.length; i++) { const e = T.g[i] - v.g[i]; d += e * e; }
      d = d / T.g.length + 0.35 * (T.aspect - v.aspect) ** 2;
      if (bestBy[T.L] === undefined || d < bestBy[T.L]) bestBy[T.L] = d;
    }
    const ranked = Object.entries(bestBy).sort((a, b) => a[1] - b[1]);
    if (!ranked.length) return null;
    const [L, d1] = ranked[0], d2 = ranked[1] ? ranked[1][1] : d1 * 2 + 0.05;
    return { L, conf: Math.max(0, Math.min(1, (d2 - d1) / (d2 + 1e-6))), dist: d1, grid: v.g };
  }

  /* ---------- tile + row finding ---------- */
  function detect(img) {           // img: ImageData
    const { width: W, height: H, data } = img;
    const cls = new Uint8Array(W * H);
    for (let i = 0, p = 0; i < cls.length; i++, p += 4) cls[i] = tileClass(data[p], data[p + 1], data[p + 2]);
    // connected components per class (4-neighbour)
    const lab = new Int32Array(W * H).fill(-1);
    const comps = [];
    const stack = new Int32Array(W * H);
    for (let s = 0; s < cls.length; s++) {
      if (!cls[s] || lab[s] >= 0) continue;
      const c = cls[s], id = comps.length;
      let sp = 0, n = 0, x0 = W, y0 = H, x1 = 0, y1 = 0;
      stack[sp++] = s; lab[s] = id;
      while (sp) {
        const q = stack[--sp], x = q % W, y = (q / W) | 0; n++;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (x > 0 && cls[q - 1] === c && lab[q - 1] < 0) { lab[q - 1] = id; stack[sp++] = q - 1; }
        if (x < W - 1 && cls[q + 1] === c && lab[q + 1] < 0) { lab[q + 1] = id; stack[sp++] = q + 1; }
        if (y > 0 && cls[q - W] === c && lab[q - W] < 0) { lab[q - W] = id; stack[sp++] = q - W; }
        if (y < H - 1 && cls[q + W] === c && lab[q + W] < 0) { lab[q + W] = id; stack[sp++] = q + W; }
      }
      comps.push({ c, n, x0, y0, x1, y1 });
    }
    // Same-coloured neighbours with thin gaps can blur into one wide blob: split those back into square tiles.
    const split = [];
    for (const k0 of comps) {
      const k = { ...k0, w: k0.x1 - k0.x0 + 1, h: k0.y1 - k0.y0 + 1 };
      const ar = k.w / k.h, n = Math.round(ar);
      if (k.h >= 7 && n >= 2 && n <= 6 && Math.abs(ar / n - 1) < 0.3 && k.n / (k.w * k.h) > 0.3) {
        for (let i = 0; i < n; i++) {
          const x0 = Math.round(k.x0 + i * k.w / n), x1 = Math.round(k.x0 + (i + 1) * k.w / n) - 1;
          split.push({ c: k.c, n: k.n / n, x0, x1, y0: k.y0, y1: k.y1, w: x1 - x0 + 1, h: k.h });
        }
      } else split.push(k);
    }
    const tiles = split
      .filter(k =>k.w >= 7 && k.h >= 7 && k.w < W / 4 && k.w / k.h > 0.6 && k.w / k.h < 1.6 && k.n / (k.w * k.h) > 0.3)
      .map(k => ({ ...k, cx: (k.x0 + k.x1) / 2, cy: (k.y0 + k.y1) / 2 }))
      .sort((a, b) => a.x0 - b.x0);
    // chain tiles left to right into rows
    const rows = [], used = new Set();
    for (const a of tiles) {
      if (used.has(a)) continue;
      const chain = [a];
      let cur = a;
      while (chain.length < 6) {
        let nxt = null;
        for (const b of tiles) {
          if (b === cur || chain.includes(b)) continue;
          const sz = Math.max(cur.h, cur.w);
          if (Math.abs(b.h - cur.h) > 0.35 * sz || Math.abs(b.cy - cur.cy) > 0.35 * sz) continue;
          const gap = b.x0 - cur.x1;
          if (gap < -0.15 * sz || gap > 0.9 * sz) continue;
          if (!nxt || b.x0 < nxt.x0) nxt = b;
        }
        if (!nxt) break;
        chain.push(nxt); cur = nxt;
      }
      if (chain.length === 6) {
        // spacing must be regular
        const steps = chain.slice(1).map((t, i) => t.cx - chain[i].cx);
        const mean = steps.reduce((s, v) => s + v, 0) / 5;
        if (steps.every(s => Math.abs(s - mean) < 0.3 * mean)) { chain.forEach(t => used.add(t)); rows.push(chain); }
      }
    }
    const out = [];
    for (const row of rows) {
      const reads = row.map(t => readTile(data, W, t, t.c));
      if (reads.some(r => !r)) continue;
      out.push({
        genes: reads.map(r => r.L).join(''),
        conf: Math.min(...reads.map(r => r.conf)),
        boxes: row.map(t => ({ x: t.x0, y: t.y0, w: t.w, h: t.h })),
        grids: reads.map(r => r.grid)
      });
    }
    return out;
  }

  // Draw a still image (screenshot or photo) to a canvas and read every row in it.
  async function readImageFile(file, maxW = 1400) {
    await init();
    const url = URL.createObjectURL(file);
    try {
      const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      const sc = Math.min(1, maxW / im.naturalWidth);
      const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * sc); c.height = Math.round(im.naturalHeight * sc);
      const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, c.width, c.height);
      let rows = detect(x.getImageData(0, 0, c.width, c.height));
      if (!rows.length && sc < 1) {            // tiles may be too small after scaling; retry at full size
        c.width = im.naturalWidth; c.height = im.naturalHeight; x.drawImage(im, 0, 0);
        rows = detect(x.getImageData(0, 0, c.width, c.height));
      }
      return rows;
    } finally { setTimeout(() => URL.revokeObjectURL(url), 60000); }
  }

  function gridToCanvas(g, cvs) {
    cvs.width = GW; cvs.height = GH; const x = cvs.getContext('2d'); const im = x.createImageData(GW, GH);
    for (let i = 0; i < g.length; i++) { const v = Math.round(g[i] * 255); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    x.putImageData(im, 0, 0);
  }

  return { init, detect, readImageFile, gridToCanvas };
})();
