import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { sfx } from '../lib/sfx';
import { letterGuide, trackWidths } from '../lib/letterGuide';

// The child paints inside the outlined letter with their finger.
// Paint is clipped to the letter shape, and we measure how much of the
// letter has been coloured in. Once enough is covered the letter is complete.

const COMPLETE_AT = 0.8; // fraction of the letter that must be coloured
const TRACK_EXTRA = 0.02; // every letter is drawn a little bolder (fraction of font size)
// Pen colours: the multi-colour pen (the default) is last.
const CRAYONS = [
  { id: '#222222', label: 'Black' },
  { id: '#ff5b5b', label: 'Red' },
  { id: '#ffb03a', label: 'Orange' },
  { id: '#ffd23f', label: 'Yellow' },
  { id: '#3ccf6e', label: 'Green' },
  { id: '#3ab0ff', label: 'Blue' },
  { id: '#9b6bff', label: 'Purple' },
  { id: '#ff6fb5', label: 'Pink' },
  { id: 'rainbow', label: 'Rainbow', swatch: 'conic-gradient(#ff5b5b, #ffb03a, #ffe14d, #4cd964, #3ab0ff, #9b6bff, #ff5b5b)' },
];

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// Ink box of the largest letter in an alphabet, at 100px – cached per font.
const refBoxCache = new Map();
function referenceBox(font, chars, weight = 700) {
  const key = weight + font + chars.join('');
  if (!refBoxCache.has(key)) {
    const m = makeCanvas(10, 10).getContext('2d');
    m.font = `${weight} 100px ${font}`;
    let w = 1, h = 1;
    for (const c of chars) {
      const t = m.measureText(c);
      w = Math.max(w, (t.actualBoundingBoxLeft || 0) + (t.actualBoundingBoxRight || t.width));
      h = Math.max(h, (t.actualBoundingBoxAscent || 70) + (t.actualBoundingBoxDescent || 0));
    }
    refBoxCache.set(key, { w, h });
  }
  return refBoxCache.get(key);
}

// Distance from point p to the segment a–b.
function distToSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

const distToLine = (p, pts) => {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) best = Math.min(best, distToSegment(p, pts[i - 1], pts[i]));
  return pts.length === 1 ? Math.hypot(p.x - pts[0].x, p.y - pts[0].y) : best;
};

// Points every few pixels along a drawn line.
function along(pts, step) {
  const out = pts.length ? [pts[0]] : [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / step);
    for (let k = 1; k <= n; k++) out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n });
  }
  return out;
}

// Stars: how much of the child's drawing sits on top of the dashed path, 0–100,
// and 1–3 stars. Wobbles and lines away from the path count against it.
function scoreTrace(ink, guide, near) {
  const lines = guide.strokes.filter((g) => !g.tap).map((g) => g.points);
  if (!lines.length) return { score: 100, stars: 3 };
  const close = near, far = near * 2.4;
  const drawn = ink.flatMap((l) => along(l, 3));
  let onPath = 0;
  for (const p of drawn) {
    const d = Math.min(...lines.map((l) => distToLine(p, l)));
    onPath += d <= close ? 1 : d >= far ? 0 : (far - d) / (far - close);
  }
  const score = Math.round(100 * (drawn.length ? onPath / drawn.length : 0));
  if (window.__debugGuide) window.__score = { score, close, far };
  return { score, stars: score >= 80 ? 3 : score >= 60 ? 2 : 1 };
}

// The letter's path as a dashed line (with a light edge so it shows on any colour).
function drawPath(ctx, guide, S, theme, taps = true, band = false) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const g of guide.strokes) {
    const pts = g.points;
    if (g.tap) {
      if (!taps) continue;
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, Math.max(5, S * 0.018), 0, Math.PI * 2);
      ctx.lineWidth = Math.max(2, S * 0.007);
      ctx.strokeStyle = theme.deep;
      ctx.stroke();
      continue;
    }
    ctx.beginPath();
    pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
    ctx.setLineDash([]);
    if (band) {
      // a soft band under the dashes, so the path reads as a road to follow
      ctx.lineWidth = Math.max(14, S * 0.06);
      ctx.strokeStyle = theme.soft;
      ctx.stroke();
    }
    ctx.lineWidth = Math.max(7, S * 0.028);
    ctx.strokeStyle = 'rgba(255,255,255,.95)';
    ctx.stroke();
    ctx.setLineDash([Math.max(9, S * 0.036), Math.max(7, S * 0.026)]);
    ctx.lineWidth = Math.max(4, S * 0.016);
    ctx.strokeStyle = theme.deep;
    ctx.stroke();
  }
  ctx.restore();
}

// Draw the letter, optionally thickened by stroking its outline – used for
// fonts with thin strokes so there is room for little fingers to colour.
function drawShape(ctx, char, glyph, thicken, color) {
  ctx.font = glyph.font;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(char, glyph.x, glyph.y);
  if (thicken > 0) {
    ctx.lineWidth = thicken;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.strokeText(char, glyph.x, glyph.y);
  }
}

// Guide: dots along each stroke, with an arrow every few dots for direction.
// Dots already reached are hidden; the next one to reach is highlighted.
// The pen's colour for the next-dot indicator (the rainbow pen gets a colour wheel).
function penFill(ctx, pen, x, y) {
  if (pen !== 'rainbow') return pen;
  if (!ctx.createConicGradient) return '#ff5b5b';
  const g = ctx.createConicGradient(0, x, y);
  ['#ff5b5b', '#ffb03a', '#ffe14d', '#4cd964', '#3ab0ff', '#9b6bff', '#ff5b5b'].forEach((c, i, a) => g.addColorStop(i / (a.length - 1), c));
  return g;
}

// Every stroke traced from end to end: the child's lines cover the whole dashed
// line of each stroke (only tiny gaps allowed), and every dot is tapped.
function fullyTraced(s) {
  return s.guide.strokes.every((g, si) => {
    if (g.tap) return !!s.tapped[si];
    const [from, to] = s.pathRange[si];
    let gap = 0;
    for (let i = from; i < to; i++) {
      gap = s.cov[i] ? 0 : gap + 3;
      if (gap > s.maxGap) return false;
    }
    return true;
  });
}

// While tracing: the letter's path as a thick dashed line, and a dot in the
// pen's colour where it ends.
function drawGuide(ctx, guide, S, theme, pen = '#222222', end = null, band = false) {
  drawPath(ctx, guide, S, theme, false, band);
  if (!end || end.tap) return; // a final tap is already marked by its ring
  const r = Math.max(6, S * 0.024);
  ctx.save();
  ctx.beginPath();
  ctx.arc(end.x, end.y, r, 0, Math.PI * 2);
  ctx.fillStyle = penFill(ctx, pen, end.x, end.y);
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.35);
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(end.x, end.y, r + ctx.lineWidth / 2 + 1, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = theme.deep;
  ctx.stroke();
  ctx.restore();
}

// Points every 2px along a polyline (where a start marker may be placed).
function alongLine(pts) {
  const out = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 2));
    for (let k = 0; k < n; k++) out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n });
  }
  return out;
}

// Numbered green circle where each stroke starts (Arabic dots: a ring to tap).
function drawStarts(ctx, guide, S, startIdx = null, hit = null) {
  const R = Math.max(10, S * 0.034);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${R * 1.15}px Fredoka, system-ui, sans-serif`;
  const placed = [];
  guide.strokes.forEach((st, i) => {
    // if another stroke starts at the same spot (A), nudge this marker along its stroke
    // look along the whole line (not just the dots) so short strokes can space their numbers out
    const free = (d) => placed.every((q) => Math.hypot(d.x - q.x, d.y - q.y) > R * 2.2);
    const p = free(st.dots[0]) ? st.dots[0] : alongLine(st.points).find(free) || st.dots[0];
    placed.push(p);
    if (startIdx && hit?.[startIdx[i]]) return; // stroke already started
    ctx.beginPath();
    ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
    ctx.fillStyle = st.tap ? 'rgba(255,255,255,.92)' : '#22b45a';
    ctx.fill();
    ctx.lineWidth = Math.max(2, R * 0.18);
    ctx.strokeStyle = st.tap ? '#22b45a' : '#fff';
    ctx.stroke();
    ctx.fillStyle = st.tap ? '#22b45a' : '#fff';
    ctx.fillText(String(i + 1), p.x, p.y + R * 0.06);
  });
  ctx.restore();
}

// "Watch me" demo: a finger draws each stroke in order, leaving a light trail.
function drawDemo(ctx, s, theme) {
  const { demo, guide, S } = s;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = s.pen * 1.4;
  ctx.strokeStyle = theme.main;
  ctx.globalAlpha = 0.45;
  let left = demo.d, head = null;
  for (const st of guide.strokes) {
    if (left <= 0) break;
    if (st.tap) {
      head = st.points[0];
      ctx.beginPath();
      ctx.arc(head.x, head.y, s.pen * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = theme.main;
      ctx.fill();
      left -= s.tapLen;
      continue;
    }
    const pts = st.points;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    head = pts[0];
    for (let i = 1; i < pts.length && left > 0; i++) {
      const a = pts[i - 1], b = pts[i], seg = Math.hypot(b.x - a.x, b.y - a.y);
      const t = Math.min(1, left / (seg || 1));
      head = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      ctx.lineTo(head.x, head.y);
      left -= seg;
    }
    ctx.stroke();
    left -= s.gapLen;
  }
  ctx.restore();
  if (head) {
    ctx.save();
    ctx.font = `${S * 0.11}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('👆', head.x, head.y - S * 0.012);
    ctx.restore();
  }
}

export default function TraceCanvas({ char, font, theme, onComplete, reference = [char], thicken = 0, outlineScale = 1, rtl = false, weight = 700, startNear = null, guidePaths = null, dotCount = 0, penScale = 1 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const st = useRef({}); // mutable drawing state, not needed for React renders
  const [size, setSize] = useState(0);
  const [ready, setReady] = useState(false);
  const [coverage, setCoverage] = useState(0);
  const [done, setDone] = useState(false);
  const [crayon, setCrayon] = useState('rainbow');
  const [demoOn, setDemoOn] = useState(false);
  const rafRef = useRef(0);
  const crayonRef = useRef(crayon);
  crayonRef.current = crayon;

  // Square canvas that fits the available space.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    const measure = () => {
      const w = el.clientWidth;
      const h = window.innerHeight - 300;
      setSize(Math.max(220, Math.min(w, h, 460)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const render = useCallback(() => {
    const s = st.current;
    const canvas = canvasRef.current;
    if (!canvas || !s.mask) return;
    const ctx = canvas.getContext('2d');
    const { S, dpr, glyph } = s;

    // Letters without a guide are coloured in: paint clipped to the letter shape.
    const lc = s.layer.getContext('2d');
    lc.globalCompositeOperation = 'copy';
    lc.drawImage(s.paint, 0, 0);
    if (!s.guide) {
      lc.globalCompositeOperation = 'destination-in';
      lc.drawImage(s.mask, 0, 0);
    }
    lc.globalCompositeOperation = 'source-over';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, S, S);
    // The letter shape is a hint: shown before the child starts and while
    // "Show me" plays. While tracing, only the dashed path is shown; once done,
    // only the child's own drawing.
    const hint = !s.guide || (!s.finished && (s.demo || !s.started?.any));
    if (hint) {
      const outline = Math.max(3, S * 0.014 * outlineScale);
      drawShape(ctx, char, glyph, glyph.thick + outline * 2, theme.deep);
      drawShape(ctx, char, glyph, glyph.thick, theme.soft);
    }
    if (s.guide && !s.finished) drawGuide(ctx, s.guide, S, theme, crayonRef.current, s.finishAt, !hint);
    if (s.demo) drawDemo(ctx, s, theme);
    ctx.drawImage(s.layer, 0, 0, S, S);
    // Start markers stay visible on top of the crayon until the letter is done.
    if (s.guide && !s.finished) drawStarts(ctx, s.guide, S, s.guide.strokes.map((_, i) => i), s.started);
  }, [char, theme, outlineScale]);

  // Redraw when a new pen colour is picked (the next dot shows it).
  useEffect(() => {
    render();
  }, [crayon, render]);

  // (Re)build the letter mask whenever the letter or size changes.
  useEffect(() => {
    if (!size) return;
    let cancelled = false;
    setReady(false);
    setDone(false);
    setCoverage(0);
    setProgress(0);

    const family = font.split(',')[0];
    document.fonts
      .load(`${weight} 100px ${family}`, reference.join(''))
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const S = size;
        const W = Math.round(S * dpr);
        const canvas = canvasRef.current;
        canvas.width = W;
        canvas.height = W;

        // Size the letter relative to its whole alphabet (so a small letter
        // stays smallish), but let small letters grow a bit so they are
        // comfortable to colour, and never overflow the square.
        const m = makeCanvas(10, 10).getContext('2d');
        m.font = `${weight} 100px ${font}`;
        const mt = m.measureText(char);
        const L = mt.actualBoundingBoxLeft || 0;
        const R = mt.actualBoundingBoxRight || mt.width;
        const A = mt.actualBoundingBoxAscent || 70;
        const D = mt.actualBoundingBoxDescent || 0;
        const ref = referenceBox(font, reference, weight);
        const base = (S * 0.72) / Math.max(ref.w, ref.h);
        const fit = (S * 0.72) / Math.max(L + R, A + D, 1);
        const scale = Math.min(fit, base * 1.6);
        const fontSize = 100 * scale;
        const glyph = {
          font: `${weight} ${fontSize}px ${font}`,
          x: S / 2 - ((R - L) * scale) / 2,
          y: S / 2 - ((D - A) * scale) / 2,
          fontSize,
          thick: (thicken + TRACK_EXTRA) * fontSize,
        };

        const mask = makeCanvas(W, W);
        const mc = mask.getContext('2d');
        mc.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawShape(mc, char, glyph, glyph.thick, '#000');

        // Sample points inside the letter, used to measure coverage.
        const data = mc.getImageData(0, 0, W, W).data;
        const step = Math.max(2, Math.round(3 * dpr));
        const samples = [];
        for (let y = 0; y < W; y += step) {
          for (let x = 0; x < W; x += step) {
            const i = (y * W + x) * 4 + 3;
            if (data[i] > 160) samples.push(i);
          }
        }

        // Centre-line guide dots and a crayon about as wide as the letter's stroke.
        // The guide follows the letter's own pen shape (before thickening), so
        // the dots keep its bends and waves; the crayon is sized from the
        // thick track so one pass fills it.
        const pen = makeCanvas(W, W).getContext('2d');
        pen.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawShape(pen, char, glyph, 0, '#000');
        const guide = letterGuide(pen.getImageData(0, 0, W, W).data, W, dpr, {
          rtl,
          startNear: startNear && { x: startNear[0] * S, y: startNear[1] * S },
          dots: dotCount,
          // hand-drawn paths are given as fractions of the letter's ink box
          manual:
            guidePaths &&
            guidePaths.map((stroke) =>
              stroke.map(([fx, fy]) => ({
                x: glyph.x - L * scale + fx * (L + R) * scale,
                y: glyph.y - A * scale + fy * (A + D) * scale,
              })),
            ),
        });
        const widths = trackWidths(data, W, dpr);
        if (window.__debugGuide && guide) {
          // debug: how much of the letter is far from every guide stroke
          const pts = guide.strokes.flatMap((g) => g.points);
          let miss = 0, mx = 0, my = 0;
          for (const i of samples) {
            const p = (i - 3) / 4, x = (p % W) / dpr, y = Math.floor(p / W) / dpr;
            if (pts.every((q) => Math.hypot(q.x - x, q.y - y) > guide.halfWidth * 1.7)) { miss++; mx += x; my += y; }
          }
          window.__guide = guide;
          window.__miss = { ratio: miss / samples.length, at: miss ? [Math.round(mx / miss), Math.round(my / miss)] : null };
        }
        const brush = guide
          ? Math.min(S * 0.17, Math.max(14, (widths?.half ?? guide.halfWidth) * 2 * 1.3, (widths?.wide ?? guide.wideHalf) * 2 * 1.15))
          : Math.max(12, S * 0.065);

        const paint = makeCanvas(W, W);
        const pc = paint.getContext('2d');
        pc.setTransform(dpr, 0, 0, dpr, 0, 0);
        pc.lineCap = 'round';
        pc.lineJoin = 'round';

        // Points every 3px along each stroke's dashed line: the letter is done
        // when the child's lines have covered them all (and tapped every dot).
        const pathPts = [], pathRange = [];
        guide?.strokes.forEach((g, si) => {
          const from = pathPts.length;
          if (!g.tap) along(g.points, 3).forEach((q) => pathPts.push(q));
          pathRange[si] = [from, pathPts.length];
        });

        st.current = {
          S, dpr, W, glyph, mask, paint, samples, guide, pathPts, pathRange,
          brush, // width of the letter's track (for how close is "on" the path)
          // tracing pen: a thin line so the path and dots stay visible
          // (letters without a guide keep the wide crayon and the colour-in rule)
          pen: guide ? Math.max(3, S * 0.02 * penScale) : brush,
          cov: new Uint8Array(pathPts.length), // which path points the child's lines have covered
          covN: 0,
          tapped: [], // dots tapped, by stroke
          started: [], // strokes begun (their start marker is then hidden)
          near: Math.max(S * 0.03, S * 0.02 * penScale), // right on the dashed line (for the stars)
          cover: Math.max(S * 0.03, brush * 0.45), // close enough to count the path as traced
          maxGap: S * 0.04, // the biggest gap still counted as traced (joined up when done)
          // the finish: the very end of the last stroke (or the last dot to tap)
          finishAt: guide?.strokes.length ? { ...guide.strokes.at(-1).points.at(-1), tap: !!guide.strokes.at(-1).tap } : null,
          reach: Math.max(brush * 0.5, 14), // how close the finger must pass to a dot to tap it
          maskData: data, // letter shape, to notice when the finger leaves the letter
          layer: makeCanvas(W, W),
          hue: Math.floor(Math.random() * 360),
          last: null,
          lastCheck: 0,
          finished: false,
          ink: [], // the child's lines, to compare with the path at the end
        };
        render();
        setReady(true);
        setTimeout(() => !cancelled && playDemo(), 500); // show the way once
      });
    return () => {
      cancelled = true;
    };
  }, [char, font, size, thicken, rtl, weight, startNear?.join(), JSON.stringify(guidePaths), dotCount, penScale, render]); // eslint-disable-line react-hooks/exhaustive-deps

  const measureCoverage = useCallback(() => {
    const s = st.current;
    if (!s.samples?.length) return 0;
    const data = s.layer.getContext('2d').getImageData(0, 0, s.W, s.W).data;
    let hit = 0;
    for (const i of s.samples) if (data[i] > 40) hit++;
    return hit / s.samples.length;
  }, []);

  const finish = useCallback(() => {
    const s = st.current;
    if (s.finished) return;
    s.finished = true;
    s.demo = null;
    cancelAnimationFrame(rafRef.current);
    setDemoOn(false);
    const pc = s.paint.getContext('2d');
    if (s.guide) {
      // Keep the child's own lines and score them against the letter's path.
      const result = scoreTrace(s.ink, s.guide, s.near);
      s.result = result;
      // Close short gaps (a stroke begun a little late or lifted just before its
      // end, a missed corner) along the path, joined onto the child's own line, so
      // the drawing looks whole. Where their line runs alongside the path a little
      // off-centre it is left alone (no doubled lines), and big missed parts stay.
      const inkPts = s.ink.flatMap((l) => l);
      const inkLines = s.ink.filter((l) => l.length);
      const dist = (q) => Math.min(...inkLines.map((l) => distToLine(q, l)));
      const nearestInk = (q) => inkPts.reduce((b, p) => (Math.hypot(p.x - q.x, p.y - q.y) < Math.hypot(b.x - q.x, b.y - q.y) ? p : b), inkPts[0]);
      const maxGap = s.S * 0.15;
      pc.lineCap = 'round';
      pc.lineJoin = 'round';
      pc.lineWidth = s.pen;
      const drawRun = (run) => {
        for (let k = 1; k < run.length; k++) {
          pc.strokeStyle = colorFor();
          pc.beginPath();
          pc.moveTo(run[k - 1].x, run[k - 1].y);
          pc.lineTo(run[k].x, run[k].y);
          pc.stroke();
        }
      };
      if (inkPts.length) {
        for (const g of s.guide.strokes) {
          if (g.tap) continue;
          const pts = along(g.points, 3);
          const d = pts.map(dist);
          for (let i = 0; i < pts.length; ) {
            if (d[i] <= s.pen * 0.9) { i++; continue; }
            let j = i;
            while (j < pts.length && d[j] > s.pen * 0.9) j++;
            const atStart = i === 0, atEnd = j === pts.length;
            const run = pts.slice(i, j);
            let len = 0;
            for (let k = 1; k < run.length; k++) len += Math.hypot(run[k].x - run[k - 1].x, run[k].y - run[k - 1].y);
            // alongside: their line runs next to this bit and carries on past it
            // (a gap is where their line ends instead)
            const mid = run[Math.floor(run.length / 2)];
            const endsHere = inkLines.some((l) => [l[0], l.at(-1)].some((e) => Math.hypot(e.x - mid.x, e.y - mid.y) <= len / 2 + s.pen * 2));
            const alongside = !endsHere && d.slice(i, j).every((v) => v <= Math.max(s.brush * 0.35, s.pen * 1.6));
            if (!(atStart && atEnd) && len <= maxGap && !(alongside && !atStart && !atEnd)) {
              const line = [...run];
              if (!atStart) line.unshift(nearestInk(run[0]));
              if (!atEnd) line.push(nearestInk(run.at(-1)));
              drawRun(line);
            }
            i = j;
          }
        }
      }
      render();
      setCoverage(1);
      setDone(true);
      onComplete?.(result);
      return;
    }
    // No guide: magic fill – colour any gaps behind the child's strokes.
    const g = pc.createLinearGradient(0, 0, s.S, s.S);
    ['#ff5b5b', '#ffb03a', '#ffe14d', '#4cd964', '#3ab0ff', '#9b6bff'].forEach((c, i, arr) =>
      g.addColorStop(i / (arr.length - 1), c),
    );
    pc.globalCompositeOperation = 'destination-over';
    pc.fillStyle = g;
    pc.fillRect(0, 0, s.S, s.S);
    pc.globalCompositeOperation = 'source-over';
    render();
    setCoverage(1);
    setDone(true);
    onComplete?.();
  }, [render, onComplete]);

  const check = useCallback(
    (force) => {
      const s = st.current;
      const now = performance.now();
      if (!force && now - s.lastCheck < 180) return;
      s.lastCheck = now;
      const c = measureCoverage();
      setCoverage(c);
      if (c >= COMPLETE_AT) finish();
    },
    [measureCoverage, finish],
  );

  // Mark the bits of the dashed path the finger's line covers, and dots tapped.
  // The letter is done once every stroke is covered from end to end.
  const [progress, setProgress] = useState(0);
  const advance = (a, b) => {
    const s = st.current;
    if (!s.pathRange || s.finished) return;
    const before = s.covN;
    // A path point counts when the line passes beside it (within the letter's
    // width), or right over it – not when the finger merely stopped short nearby.
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
    for (let i = 0; i < s.pathPts.length; i++) {
      if (s.cov[i]) continue;
      const q = s.pathPts[i];
      const t = l2 ? ((q.x - a.x) * dx + (q.y - a.y) * dy) / l2 : -1;
      const d = distToSegment(q, a, b);
      if (t > 0 && t < 1 ? d <= s.cover : d <= s.near) {
        s.cov[i] = 1;
        s.covN++;
      }
    }
    let tapsBefore = s.tapped.filter(Boolean).length;
    s.guide.strokes.forEach((g, si) => {
      if (g.tap && !s.tapped[si] && distToSegment(g.points[0], a, b) <= s.reach) s.tapped[si] = true;
      const [from, to] = s.pathRange[si];
      if (!s.started[si] && (g.tap ? s.tapped[si] : s.cov[from] || s.cov[Math.min(to - 1, from + 3)])) s.started[si] = true;
    });
    const taps = s.guide.strokes.filter((g) => g.tap).length;
    const tapsNow = s.tapped.filter(Boolean).length;
    if (s.covN !== before || tapsNow !== tapsBefore) setProgress((s.covN + tapsNow) / (s.pathPts.length + taps || 1));
    // Done when fully traced – and it was traced, not scribbled: at least
    // 40% of the drawing must sit on the path (checked a few times a second).
    if (fullyTraced(s)) {
      const now = performance.now();
      if (now - (s.lastScore || 0) > 250) {
        s.lastScore = now;
        if (scoreTrace(s.ink, s.guide, s.near).score >= 40) finish();
      }
    }
  };

  const colorFor = () => {
    const s = st.current;
    if (crayonRef.current === 'rainbow') {
      s.hue = (s.hue + 3) % 360;
      return `hsl(${s.hue} 90% 60%)`;
    }
    return crayonRef.current;
  };

  const point = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * st.current.S, y: ((e.clientY - r.top) / r.height) * st.current.S };
  };

  // Animate the finger along the strokes, in order.
  const stopDemo = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (st.current.demo) {
      st.current.demo = null;
      render();
    }
    setDemoOn(false);
  }, [render]);

  const playDemo = useCallback(() => {
    const s = st.current;
    if (!s.guide?.strokes.length || s.finished) return;
    cancelAnimationFrame(rafRef.current);
    s.tapLen = s.S * 0.12;
    s.gapLen = s.S * 0.12;
    const total = s.guide.strokes.reduce((n, g) => n + (g.tap ? s.tapLen : g.length + s.gapLen), 0);
    const speed = s.S * 0.5; // px per second
    const t0 = performance.now();
    s.demo = { d: 0 };
    setDemoOn(true);
    const tick = (now) => {
      if (!st.current.demo) return;
      s.demo.d = ((now - t0) / 1000) * speed;
      render();
      if (s.demo.d < total + s.S * 0.25) rafRef.current = requestAnimationFrame(tick);
      else stopDemo();
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [render, stopDemo]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const onDown = (e) => {
    const s = st.current;
    if (!ready || s.finished) return;
    if (s.demo) stopDemo();
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    const p = point(e);
    s.last = p;
    s.started.any = true;
    s.ink.push([p]);
    const pc = s.paint.getContext('2d');
    pc.fillStyle = colorFor();
    pc.beginPath();
    pc.arc(p.x, p.y, s.pen / 2, 0, Math.PI * 2);
    pc.fill();
    advance(p, p);
    render();
  };

  const onMove = (e) => {
    const s = st.current;
    if (!s.last || s.finished) return;
    e.preventDefault();
    const pc = s.paint.getContext('2d');
    const events = e.nativeEvent.getCoalescedEvents?.() || [e.nativeEvent];
    pc.lineWidth = s.pen;
    for (const ev of events) {
      const p = point(ev);
      s.ink.at(-1)?.push(p);
      pc.strokeStyle = colorFor();
      pc.beginPath();
      pc.moveTo(s.last.x, s.last.y);
      pc.lineTo(p.x, p.y);
      pc.stroke();
      advance(s.last, p);
      s.last = p;
    }
    render();
    if (!s.guide) check(false); // no guide: fall back to how much is coloured
  };

  const onUp = () => {
    const s = st.current;
    if (!s.last) return;
    s.lastScore = 0; // re-check right away on lifting the finger
    advance(s.last, s.last);
    s.last = null;
    if (!s.finished) {
      sfx.pop();
      if (!s.guide) check(true);
    }
  };

  const clear = () => {
    const s = st.current;
    if (!s.paint || s.finished) return;
    s.paint.getContext('2d').clearRect(0, 0, s.S, s.S);
    s.cov = new Uint8Array(s.pathPts?.length || 0);
    s.covN = 0;
    s.tapped = [];
    s.started = [];
    s.ink = [];
    render();
    setCoverage(0);
    setProgress(0);
  };

  const usesDots = !!st.current.guide;
  const pct = usesDots ? Math.round(progress * 100) : Math.min(100, Math.round((coverage / COMPLETE_AT) * 100));

  return (
    <div className="trace">
      <div className="trace-meter" aria-label={usesDots ? `${pct}% of the path traced` : `Coloured ${pct}%`}>
        <div className="trace-meter-fill" style={{ width: `${pct}%`, background: theme.main }} />
        <span>{done ? 'Done! ⭐' : `${pct}%`}</span>
      </div>

      <div className="trace-stage" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className={`trace-canvas ${done ? 'is-done' : ''}`}
          style={{ width: size, height: size, borderColor: theme.soft }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
        />
        {!ready && <div className="trace-loading">✏️</div>}
        {ready && (usesDots ? progress === 0 : coverage === 0) && !done && !demoOn && (
          <div className="trace-hint">👆 Start at the green 1 and follow the dashes!</div>
        )}
      </div>

      {!done && (
        <button className="btn btn-soft btn-small show-me" onClick={playDemo} disabled={!ready || demoOn}>
          👀 Show me
        </button>
      )}

      {!done && (
        <div className="crayons" role="radiogroup" aria-label="Crayon colour">
          {CRAYONS.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={crayon === c.id}
              aria-label={c.label}
              className={`crayon ${crayon === c.id ? 'is-active' : ''}`}
              style={{ background: c.swatch || c.id }}
              onClick={() => setCrayon(c.id)}
            />
          ))}
          <button className="crayon crayon-clear" aria-label="Start over" onClick={clear} disabled={done}>
            ↺
          </button>
        </div>
      )}
    </div>
  );
}
