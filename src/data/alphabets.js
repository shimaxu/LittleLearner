// Alphabet data for every supported language.
//
// Each letter has:
//   id      – stable key used for saved progress
//   char    – the glyph the child traces
//   name    – romanised name shown under the letter
//   sound   – short pronunciation hint
//   word / wordLatin / meaning / emoji – optional example word
//   audio   – recorded clip, picked up automatically from
//             src/assets/audio/<language id>/<letter id>.<m4a|mp3|wav|aac|ogg>
//             (e.g. audio/en/a.m4a, audio/dv/kaafu.m4a, audio/ar/2-baa.m4a).
//             When present it is played instead of text-to-speech.

// All recorded clips, keyed "<language id>/<letter id>".
const AUDIO = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/audio/*/*.{m4a,mp3,wav,aac,ogg}', { eager: true, query: '?url', import: 'default' }),
  ).map(([path, url]) => {
    const [lang, file] = path.split('/').slice(-2);
    return [`${lang}/${file.replace(/\.[^.]+$/, '')}`, url];
  }),
);

const ENGLISH_START = {}; // (all capitals now have hand-drawn paths)

// Hand-drawn tracing paths (fractions of the letter's ink box, 0,0 = top left).
// B: everything starts on the left – 1. the stem from the top-left down,
// 2. from the top-left round the upper bump to the middle, 3. from the
// middle round the lower bump and back along the bottom.
const ENGLISH_GUIDES = {
  // A: 1 and 2 the legs from the top point; 3 the bar.
  A: [
    [[0.5, 0.06], [0.36, 0.36], [0.22, 0.65], [0.08, 0.92]],
    [[0.5, 0.06], [0.64, 0.36], [0.78, 0.65], [0.92, 0.92]],
    [[0.28, 0.64], [0.5, 0.64], [0.72, 0.64]],
  ],
  // C: from the top right, round to the bottom right.
  C: [
    [[0.86, 0.16], [0.7, 0.08], [0.5, 0.07], [0.3, 0.13], [0.15, 0.28], [0.1, 0.5], [0.15, 0.72], [0.3, 0.87], [0.5, 0.93], [0.7, 0.92], [0.86, 0.84]],
  ],
  // E: 1 the stem; 2-4 the bars from the left (top, middle, bottom).
  E: [
    [[0.12, 0.06], [0.12, 0.35], [0.12, 0.65], [0.12, 0.94]],
    [[0.14, 0.08], [0.4, 0.08], [0.65, 0.08], [0.9, 0.08]],
    [[0.14, 0.5], [0.4, 0.5], [0.66, 0.5]],
    [[0.14, 0.92], [0.4, 0.92], [0.65, 0.92], [0.9, 0.92]],
  ],
  // F: 1 the stem; 2 the top bar; 3 the middle bar.
  F: [
    [[0.12, 0.06], [0.12, 0.35], [0.12, 0.65], [0.12, 0.94]],
    [[0.14, 0.08], [0.4, 0.08], [0.65, 0.08], [0.9, 0.08]],
    [[0.14, 0.5], [0.4, 0.5], [0.66, 0.5]],
  ],
  // G: from the top right round like a C, up the side and in along the bar.
  G: [
    [[0.86, 0.17], [0.7, 0.08], [0.5, 0.07], [0.3, 0.13], [0.15, 0.28], [0.1, 0.5], [0.15, 0.72], [0.3, 0.87], [0.5, 0.93], [0.72, 0.9], [0.89, 0.78], [0.93, 0.6], [0.85, 0.5], [0.7, 0.5], [0.55, 0.5]],
  ],
  // H: 1 and 2 the stems from the top; 3 the bar.
  H: [
    [[0.1, 0.06], [0.1, 0.35], [0.1, 0.65], [0.1, 0.94]],
    [[0.9, 0.06], [0.9, 0.35], [0.9, 0.65], [0.9, 0.94]],
    [[0.12, 0.5], [0.5, 0.5], [0.88, 0.5]],
  ],
  // I: the stem from the top down.
  I: [
    [[0.5, 0.05], [0.5, 0.35], [0.5, 0.65], [0.5, 0.95]],
  ],
  // J: from the top down, hooking to the left.
  J: [
    [[0.88, 0.05], [0.88, 0.35], [0.87, 0.62], [0.8, 0.8], [0.62, 0.92], [0.4, 0.92], [0.2, 0.85], [0.1, 0.8]],
  ],
  // K: 1 the stem; 2 from the top right in to the middle and out to the bottom right.
  K: [
    [[0.12, 0.06], [0.12, 0.35], [0.12, 0.65], [0.12, 0.94]],
    [[0.85, 0.08], [0.6, 0.3], [0.32, 0.5], [0.6, 0.72], [0.85, 0.92]],
  ],
  // L: from the top down and along the bottom.
  L: [
    [[0.12, 0.06], [0.12, 0.4], [0.12, 0.75], [0.14, 0.92], [0.4, 0.92], [0.65, 0.92], [0.9, 0.92]],
  ],
  // M: 1 the left stem; 2 from the top left down to the middle and up; 3 the right stem.
  M: [
    [[0.1, 0.07], [0.1, 0.35], [0.1, 0.65], [0.1, 0.94]],
    [[0.12, 0.08], [0.3, 0.33], [0.5, 0.6], [0.7, 0.33], [0.88, 0.08]],
    [[0.9, 0.07], [0.9, 0.35], [0.9, 0.65], [0.9, 0.94]],
  ],
  // N: 1 the left stem; 2 the diagonal; 3 the right stem, all from the top.
  N: [
    [[0.1, 0.06], [0.1, 0.35], [0.1, 0.65], [0.1, 0.94]],
    [[0.13, 0.08], [0.38, 0.4], [0.62, 0.7], [0.87, 0.93]],
    [[0.9, 0.06], [0.9, 0.35], [0.9, 0.65], [0.9, 0.94]],
  ],
  // O: from the top, anticlockwise all the way round.
  O: [
    [[0.5, 0.09], [0.3, 0.13], [0.16, 0.27], [0.1, 0.5], [0.16, 0.73], [0.3, 0.87], [0.5, 0.91], [0.7, 0.87], [0.84, 0.73], [0.9, 0.5], [0.84, 0.27], [0.7, 0.13], [0.52, 0.09]],
  ],
  // Q: 1 like O; 2 the tail.
  Q: [
    [[0.47, 0.09], [0.28, 0.13], [0.14, 0.27], [0.09, 0.47], [0.14, 0.67], [0.28, 0.81], [0.47, 0.86], [0.66, 0.81], [0.8, 0.67], [0.85, 0.47], [0.8, 0.27], [0.66, 0.13], [0.49, 0.09]],
    [[0.7, 0.78], [0.82, 0.86], [0.95, 0.94]],
  ],
  // S: from the top right, round to the left, across and round to the bottom left.
  S: [
    [[0.86, 0.16], [0.7, 0.08], [0.5, 0.07], [0.3, 0.11], [0.17, 0.24], [0.22, 0.38], [0.5, 0.48], [0.75, 0.57], [0.86, 0.72], [0.75, 0.87], [0.5, 0.92], [0.28, 0.88], [0.12, 0.8]],
  ],
  // T: 1 the bar from the left; 2 the stem from the top.
  T: [
    [[0.07, 0.08], [0.35, 0.08], [0.65, 0.08], [0.93, 0.08]],
    [[0.5, 0.1], [0.5, 0.4], [0.5, 0.7], [0.5, 0.95]],
  ],
  // U: from the top left down, round the bottom and up to the top right.
  U: [
    [[0.12, 0.06], [0.12, 0.35], [0.13, 0.6], [0.22, 0.8], [0.4, 0.91], [0.6, 0.91], [0.78, 0.8], [0.87, 0.6], [0.88, 0.35], [0.88, 0.06]],
  ],
  // V: from the top left down to the point and up to the top right.
  V: [
    [[0.1, 0.07], [0.24, 0.37], [0.37, 0.65], [0.5, 0.92], [0.63, 0.65], [0.76, 0.37], [0.9, 0.07]],
  ],
  // W: from the top left: down, up, down, up.
  W: [
    [[0.07, 0.08], [0.18, 0.5], [0.3, 0.91], [0.4, 0.5], [0.5, 0.09], [0.6, 0.5], [0.7, 0.91], [0.82, 0.5], [0.93, 0.08]],
  ],
  // X: 1 top left to bottom right; 2 top right to bottom left.
  X: [
    [[0.1, 0.08], [0.3, 0.3], [0.5, 0.5], [0.7, 0.71], [0.9, 0.92]],
    [[0.9, 0.08], [0.7, 0.3], [0.5, 0.5], [0.3, 0.71], [0.1, 0.92]],
  ],
  // Y: 1 from the top left to the middle; 2 from the top right to the middle and down.
  Y: [
    [[0.12, 0.08], [0.25, 0.25], [0.38, 0.43], [0.5, 0.6]],
    [[0.88, 0.08], [0.75, 0.25], [0.62, 0.43], [0.5, 0.6], [0.5, 0.78], [0.5, 0.95]],
  ],
  // Z: from the top left along the top, down the diagonal, along the bottom.
  Z: [
    [[0.1, 0.08], [0.4, 0.08], [0.7, 0.08], [0.88, 0.09], [0.62, 0.37], [0.38, 0.65], [0.1, 0.9], [0.4, 0.92], [0.7, 0.92], [0.92, 0.92]],
  ],
  B: [
    [[0.12, 0.07], [0.12, 0.4], [0.12, 0.7], [0.12, 0.93]],
    [[0.14, 0.08], [0.4, 0.08], [0.62, 0.08], [0.78, 0.13], [0.85, 0.26], [0.78, 0.38], [0.62, 0.46], [0.4, 0.46]],
    [[0.4, 0.46], [0.62, 0.47], [0.8, 0.55], [0.89, 0.7], [0.8, 0.86], [0.62, 0.92], [0.4, 0.92], [0.15, 0.92]],
  ],
  // D: 1. the stem from the top-left down, 2. from the top-left round the curve back to the bottom-left.
  D: [
    [[0.1, 0.07], [0.1, 0.4], [0.1, 0.7], [0.1, 0.93]],
    [[0.13, 0.08], [0.3, 0.08], [0.5, 0.09], [0.7, 0.16], [0.84, 0.32], [0.89, 0.5], [0.84, 0.68], [0.7, 0.84], [0.5, 0.91], [0.3, 0.92], [0.13, 0.92]],
  ],
  // P: 1. the stem from the top-left down, 2. from the top-left round the bump to the stem.
  P: [
    [[0.11, 0.07], [0.11, 0.4], [0.11, 0.7], [0.11, 0.93]],
    [[0.14, 0.08], [0.35, 0.08], [0.6, 0.08], [0.78, 0.15], [0.87, 0.33], [0.8, 0.5], [0.6, 0.59], [0.35, 0.59], [0.14, 0.59]],
  ],
  // R: like P, then 3. the leg from the middle down to the bottom-right.
  R: [
    [[0.11, 0.07], [0.11, 0.4], [0.11, 0.7], [0.11, 0.92]],
    [[0.14, 0.08], [0.35, 0.08], [0.6, 0.08], [0.78, 0.14], [0.86, 0.32], [0.8, 0.48], [0.6, 0.57], [0.35, 0.58], [0.14, 0.58]],
    [[0.6, 0.6], [0.68, 0.71], [0.77, 0.83], [0.86, 0.94]],
  ],
};

// Small letters that need a hand-drawn path.
const ENGLISH_LOWER_GUIDES = {
  // a, d, g, q: first the round part like a c (from the top right, round to the
  // left), then the stem on the right (g's stem hooks to the left at the bottom).
  a: [
    [[0.76, 0.24], [0.62, 0.12], [0.42, 0.1], [0.22, 0.2], [0.12, 0.4], [0.12, 0.6], [0.22, 0.8], [0.42, 0.9], [0.62, 0.88], [0.78, 0.76]],
    [[0.87, 0.06], [0.87, 0.35], [0.87, 0.65], [0.87, 0.94]],
  ],
  d: [
    [[0.7, 0.47], [0.52, 0.4], [0.3, 0.42], [0.14, 0.55], [0.1, 0.7], [0.18, 0.86], [0.38, 0.95], [0.58, 0.92], [0.74, 0.82]],
    [[0.87, 0.04], [0.87, 0.35], [0.87, 0.65], [0.87, 0.95]],
  ],
  g: [
    [[0.74, 0.2], [0.58, 0.1], [0.38, 0.1], [0.18, 0.18], [0.1, 0.36], [0.17, 0.54], [0.36, 0.64], [0.56, 0.62], [0.74, 0.52]],
    [[0.88, 0.06], [0.88, 0.35], [0.88, 0.65], [0.84, 0.84], [0.66, 0.94], [0.44, 0.94], [0.2, 0.86]],
  ],
  q: [
    [[0.74, 0.2], [0.58, 0.1], [0.38, 0.1], [0.18, 0.18], [0.1, 0.36], [0.17, 0.54], [0.36, 0.64], [0.56, 0.62], [0.74, 0.52]],
    [[0.88, 0.06], [0.88, 0.35], [0.88, 0.65], [0.88, 0.95]],
  ],
  // e: start in the middle on the left, along the bar to the right, then up
  // and round over the top, down the left side, finishing at the bottom right.
  e: [
    [[0.18, 0.49], [0.4, 0.49], [0.65, 0.49], [0.86, 0.47], [0.88, 0.34], [0.8, 0.2], [0.6, 0.11], [0.38, 0.12], [0.2, 0.22], [0.12, 0.4], [0.12, 0.6], [0.2, 0.76], [0.36, 0.87], [0.56, 0.9], [0.74, 0.86], [0.86, 0.79]],
  ],
  // f: 1. from the end of the top hook, over to the left and down the stem; 2. the crossbar.
  f: [
    [[0.88, 0.08], [0.72, 0.07], [0.56, 0.09], [0.46, 0.16], [0.43, 0.28], [0.43, 0.5], [0.43, 0.75], [0.43, 0.94]],
    [[0.08, 0.41], [0.3, 0.41], [0.6, 0.41], [0.92, 0.41]],
  ],
  // h: 1. the stem from the very top down; 2. from the middle of the stem over the hump and down.
  h: [
    [[0.13, 0.04], [0.13, 0.35], [0.13, 0.65], [0.13, 0.95]],
    [[0.15, 0.52], [0.28, 0.43], [0.5, 0.4], [0.7, 0.43], [0.83, 0.54], [0.87, 0.7], [0.87, 0.95]],
  ],
  // b: 1. the stem from the very top; 2. from the stem round the bowl.
  b: [
    [[0.12, 0.04], [0.12, 0.35], [0.12, 0.65], [0.12, 0.95]],
    [[0.15, 0.55], [0.3, 0.43], [0.53, 0.4], [0.75, 0.46], [0.87, 0.66], [0.75, 0.86], [0.53, 0.92], [0.3, 0.88], [0.15, 0.8]],
  ],
  // k: 1. the stem from the very top; 2. in from the top-right to the stem and out to the bottom-right.
  k: [
    [[0.14, 0.04], [0.14, 0.35], [0.14, 0.65], [0.14, 0.95]],
    [[0.7, 0.37], [0.5, 0.48], [0.3, 0.62], [0.5, 0.73], [0.7, 0.84], [0.86, 0.92]],
  ],
  // l: from the very top down, curling into the little tail.
  l: [
    [[0.26, 0.04], [0.26, 0.4], [0.26, 0.72], [0.32, 0.88], [0.6, 0.94], [0.9, 0.92]],
  ],
  // n: 1. the stem from the very top; 2. from the stem over the hump and down.
  n: [
    [[0.13, 0.04], [0.13, 0.35], [0.13, 0.65], [0.13, 0.95]],
    [[0.16, 0.32], [0.28, 0.18], [0.5, 0.13], [0.7, 0.17], [0.84, 0.3], [0.88, 0.5], [0.88, 0.95]],
  ],
  // m: 1. the stem from the very top; 2. over the first hump; 3. over the second hump.
  m: [
    [[0.08, 0.05], [0.08, 0.35], [0.08, 0.65], [0.08, 0.94]],
    [[0.1, 0.32], [0.18, 0.18], [0.3, 0.12], [0.42, 0.17], [0.49, 0.32], [0.5, 0.6], [0.5, 0.94]],
    [[0.52, 0.32], [0.6, 0.18], [0.72, 0.12], [0.84, 0.17], [0.91, 0.32], [0.92, 0.6], [0.92, 0.94]],
  ],
  // r: 1. the stem from the very top; 2. from the stem up and over to the right.
  r: [
    [[0.18, 0.04], [0.18, 0.35], [0.18, 0.65], [0.18, 0.95]],
    [[0.22, 0.32], [0.34, 0.18], [0.55, 0.1], [0.75, 0.09], [0.9, 0.13]],
  ],
  // u: 1. from the top-left down, round the bottom and up; 2. the right stem from the top down.
  u: [
    [[0.13, 0.04], [0.13, 0.35], [0.14, 0.6], [0.24, 0.79], [0.46, 0.89], [0.68, 0.83], [0.83, 0.66], [0.87, 0.45]],
    [[0.87, 0.04], [0.87, 0.35], [0.87, 0.65], [0.87, 0.95]],
  ],
  // i: 1. the stem from the top down; 2. the dot (a tap).
  i: [
    [[0.5, 0.35], [0.5, 0.55], [0.5, 0.75], [0.5, 0.95]],
    [[0.5, 0.1]],
  ],
  // j: 1. the stem from the top down, hooking left; 2. the dot (a tap).
  j: [
    [[0.78, 0.28], [0.78, 0.5], [0.77, 0.75], [0.66, 0.88], [0.42, 0.93], [0.12, 0.93]],
    [[0.78, 0.07]],
  ],
  // v: from the top-left down to the point and up to the top-right.
  v: [
    [[0.13, 0.07], [0.25, 0.33], [0.38, 0.62], [0.5, 0.9], [0.62, 0.62], [0.75, 0.33], [0.88, 0.07]],
  ],
  // w: from the top-left: down, up, down, up.
  w: [
    [[0.09, 0.07], [0.19, 0.5], [0.3, 0.92], [0.4, 0.5], [0.5, 0.07], [0.6, 0.5], [0.7, 0.92], [0.8, 0.5], [0.91, 0.07]],
  ],
  // y: 1. from the top-left down to the middle; 2. from the top-right all the way down into the tail.
  y: [
    [[0.12, 0.07], [0.25, 0.25], [0.38, 0.42], [0.5, 0.55]],
    [[0.86, 0.07], [0.72, 0.35], [0.56, 0.62], [0.42, 0.8], [0.3, 0.92]],
  ],
  // x: 1. from the top-left down to the bottom-right; 2. from the top-right down to the bottom-left.
  x: [
    [[0.15, 0.08], [0.33, 0.29], [0.5, 0.5], [0.67, 0.71], [0.85, 0.92]],
    [[0.85, 0.08], [0.67, 0.29], [0.5, 0.5], [0.33, 0.71], [0.15, 0.92]],
  ],
  // z: from the top-left along the top, down the diagonal, then along the bottom.
  z: [
    [[0.12, 0.12], [0.35, 0.12], [0.6, 0.12], [0.82, 0.12], [0.6, 0.35], [0.38, 0.57], [0.13, 0.84], [0.4, 0.88], [0.65, 0.88], [0.88, 0.88]],
  ],
  // c: from the top right, round to the left and along the bottom to the right.
  c: [
    [[0.85, 0.22], [0.72, 0.14], [0.55, 0.12], [0.35, 0.17], [0.2, 0.3], [0.14, 0.5], [0.2, 0.7], [0.35, 0.83], [0.55, 0.88], [0.72, 0.84], [0.86, 0.77]],
  ],
  // o: from the top, anticlockwise all the way round.
  o: [
    [[0.5, 0.12], [0.32, 0.17], [0.18, 0.3], [0.13, 0.48], [0.18, 0.66], [0.32, 0.8], [0.5, 0.85], [0.68, 0.8], [0.82, 0.66], [0.87, 0.48], [0.82, 0.3], [0.68, 0.17], [0.52, 0.12]],
  ],
  // s: from the top right, round to the left, across the middle and round to the bottom left.
  s: [
    [[0.86, 0.2], [0.7, 0.12], [0.5, 0.1], [0.3, 0.14], [0.18, 0.27], [0.25, 0.4], [0.5, 0.5], [0.75, 0.58], [0.85, 0.72], [0.75, 0.86], [0.5, 0.9], [0.28, 0.86], [0.12, 0.78]],
  ],
  p: [
    [[0.12, 0.06], [0.12, 0.35], [0.12, 0.65], [0.12, 0.94]],
    [[0.2, 0.15], [0.35, 0.07], [0.55, 0.06], [0.75, 0.15], [0.86, 0.35], [0.76, 0.57], [0.55, 0.66], [0.35, 0.62], [0.2, 0.55]],
  ],
  t: [
    [[0.42, 0.05], [0.42, 0.4], [0.42, 0.7], [0.45, 0.86], [0.6, 0.94], [0.85, 0.93]],
    [[0.08, 0.36], [0.3, 0.36], [0.6, 0.36], [0.9, 0.36]],
  ],
};

const english = [
  ['A', 'Apple', '🍎'], ['B', 'Ball', '⚽'], ['C', 'Cat', '🐱'], ['D', 'Dog', '🐶'],
  ['E', 'Elephant', '🐘'], ['F', 'Fish', '🐟'], ['G', 'Grapes', '🍇'], ['H', 'Hat', '🎩'],
  ['I', 'Ice cream', '🍦'], ['J', 'Juice', '🧃'], ['K', 'Kite', '🪁'], ['L', 'Lion', '🦁'],
  ['M', 'Moon', '🌙'], ['N', 'Nest', '🪺'], ['O', 'Orange', '🍊'], ['P', 'Pig', '🐷'],
  ['Q', 'Queen', '👸'], ['R', 'Rabbit', '🐰'], ['S', 'Sun', '☀️'], ['T', 'Tiger', '🐯'],
  ['U', 'Umbrella', '☂️'], ['V', 'Violin', '🎻'], ['W', 'Whale', '🐳'], ['X', 'Xylophone', '🎶'],
  ['Y', 'Yo-yo', '🪀'], ['Z', 'Zebra', '🦓'],
].map(([char, word, emoji]) => ({
  // where the first stroke starts, for letters the automatic guide can't guess
  // (canvas fractions: [x, y], 0,0 = top left)
  startNear: ENGLISH_START[char],
  guide: ENGLISH_GUIDES[char],
  id: char.toLowerCase(),
  char,
  lower: char.toLowerCase(),
  name: char,
  sound: char.toLowerCase(),
  word,
  emoji,
}));

// Hand-drawn tracing paths for Thaana letters whose bends overlap in the
// MV Waheed font, so the automatic centre line can't see them. Each stroke is
// a list of [x, y] points as fractions of the letter's ink box (0,0 = top
// left); a single point is a dot to tap.
const FAAFU = [[0.85, 0.08], [0.72, 0.15], [0.62, 0.22], [0.75, 0.27], [0.86, 0.32], [0.72, 0.4], [0.6, 0.46], [0.7, 0.5], [0.78, 0.55], [0.6, 0.66], [0.4, 0.77], [0.25, 0.84], [0.1, 0.87]];
const THAANA_GUIDES = {
  // Haa (as drawn by the user): one gently curving stroke from the top right down to the bottom left.
  haa: [[[0.92, 0.123], [0.8, 0.26], [0.7, 0.358], [0.6, 0.464], [0.5, 0.556], [0.4, 0.632], [0.3, 0.704], [0.2, 0.76], [0.145, 0.795]]],
  // Chaviyani: start from the top, then the Thaa pattern – 1. down the long top bar to the loop;
  // 2. round the loop (down, right, up and back over the top) and on to the left;
  // 3. down through the S-bend and along the bottom to the bottom left.
  chaviyani: [
    [[0.937, 0.083], [0.879, 0.136], [0.818, 0.183], [0.759, 0.232], [0.696, 0.275], [0.637, 0.317], [0.57, 0.361], [0.503, 0.397], [0.43, 0.468]],
    [[0.43, 0.468], [0.455, 0.525], [0.485, 0.564], [0.544, 0.601], [0.6, 0.611], [0.655, 0.598], [0.701, 0.554], [0.726, 0.485], [0.706, 0.412], [0.668, 0.358], [0.6, 0.346], [0.547, 0.376], [0.485, 0.406], [0.43, 0.445], [0.363, 0.487], [0.297, 0.534], [0.25, 0.58]],
    [[0.25, 0.58], [0.26, 0.645], [0.295, 0.705], [0.315, 0.76], [0.305, 0.815], [0.27, 0.86], [0.21, 0.89], [0.13, 0.894], [0.074, 0.875]],
  ],
  // Javiyani: like Dhaalu, ending with a tail – 1. a straight line left along the top bar;
  // 2. back under the bar, down the right and round to the middle; 3. down the curve and along the tail.
  javiyani: [
    [[0.92, 0.08], [0.8, 0.1], [0.675, 0.125], [0.55, 0.15]], // a straight line
    [[0.55, 0.15], [0.66, 0.2], [0.78, 0.21], [0.86, 0.26], [0.88, 0.36], [0.84, 0.45], [0.74, 0.52], [0.6, 0.54], [0.47, 0.5], [0.36, 0.42]],
    [[0.36, 0.42], [0.27, 0.5], [0.17, 0.59], [0.11, 0.7], [0.14, 0.8], [0.24, 0.87], [0.38, 0.9], [0.55, 0.9], [0.7, 0.89], [0.8, 0.89]],
  ],
  // Yaa (as drawn by the user): three joined strokes – 1. from the bottom of the hook up the
  // right side; 2. left along the top; 3. down the long tail.
  yaa: [
    [[0.683, 0.747], [0.756, 0.667], [0.833, 0.566], [0.878, 0.444], [0.898, 0.303], [0.898, 0.141]],
    [[0.898, 0.141], [0.844, 0.178], [0.778, 0.212], [0.689, 0.232], [0.622, 0.222], [0.578, 0.202], [0.549, 0.182]],
    [[0.549, 0.182], [0.558, 0.242], [0.544, 0.313], [0.511, 0.384], [0.444, 0.485], [0.378, 0.566], [0.289, 0.667], [0.2, 0.747], [0.119, 0.818]],
  ],
  // Taviyani (as described by the user): 1. the Baa part, traced like Baa (from the top middle,
  // right and round, then down left of the middle); 2. from there down and round the tail.
  taviyani: [
    [[0.55, 0.158], [0.658, 0.129], [0.784, 0.1], [0.892, 0.146], [0.937, 0.239], [0.892, 0.349], [0.775, 0.436], [0.604, 0.494], [0.424, 0.517], [0.262, 0.471], [0.172, 0.355], [0.208, 0.239], [0.298, 0.158], [0.406, 0.123], [0.496, 0.146], [0.514, 0.216], [0.505, 0.303], [0.478, 0.384], [0.442, 0.453], [0.406, 0.506]],
    [[0.406, 0.506], [0.3, 0.53], [0.2, 0.57], [0.12, 0.64], [0.09, 0.73], [0.12, 0.83], [0.22, 0.9], [0.35, 0.92], [0.5, 0.91], [0.62, 0.88], [0.72, 0.82], [0.82, 0.79]],
  ],
  // Zaviyani (as drawn by the user): six joined strokes – 1. from the top right to the centre;
  // 2. out to the lower right end of the crossbar; 3. back to the centre; 4. out to the upper
  // left end; 5. back to the centre; 6. down the big curve and along the bottom.
  zaviyani: [
    [[0.895, 0.101], [0.8, 0.142], [0.683, 0.214], [0.6, 0.267], [0.512, 0.325]],
    [[0.512, 0.325], [0.633, 0.374], [0.717, 0.418], [0.778, 0.441]],
    [[0.778, 0.441], [0.717, 0.418], [0.633, 0.374], [0.512, 0.325]],
    [[0.512, 0.325], [0.433, 0.285], [0.383, 0.258], [0.322, 0.228]],
    [[0.322, 0.228], [0.383, 0.258], [0.433, 0.285], [0.512, 0.325]],
    [[0.512, 0.325], [0.417, 0.383], [0.317, 0.454], [0.225, 0.534], [0.158, 0.614], [0.122, 0.676], [0.12, 0.73], [0.15, 0.783], [0.217, 0.819], [0.333, 0.845], [0.467, 0.865], [0.6, 0.877], [0.695, 0.884]],
  ],
  // Seenu (as drawn by the user): two joined strokes – 1. from the top right along the whole
  // body to the left end; 2. from there down into the tail.
  seenu: [
    [[0.92, 0.206], [0.9, 0.29], [0.867, 0.371], [0.811, 0.435], [0.733, 0.49], [0.644, 0.516], [0.578, 0.523], [0.489, 0.51], [0.4, 0.49], [0.311, 0.468], [0.233, 0.445], [0.19, 0.435]],
    [[0.19, 0.435], [0.172, 0.532], [0.144, 0.629], [0.106, 0.726], [0.072, 0.8]],
  ],
  // Gnaviyani (as drawn by the user): three joined strokes – 1. from the top right round the
  // right bump and up; 2. dipping through the middle bump; 3. down the left side, round the
  // bottom and along to the right.
  gnaviyani: [
    [[0.892, 0.135], [0.88, 0.182], [0.847, 0.242], [0.792, 0.283], [0.717, 0.307], [0.65, 0.293], [0.617, 0.253], [0.607, 0.192], [0.603, 0.139]],
    [[0.603, 0.139], [0.55, 0.178], [0.483, 0.212], [0.433, 0.226], [0.367, 0.212], [0.317, 0.182], [0.288, 0.164]],
    [[0.288, 0.164], [0.292, 0.222], [0.275, 0.323], [0.233, 0.404], [0.178, 0.455], [0.133, 0.545], [0.105, 0.646], [0.108, 0.717], [0.142, 0.778], [0.208, 0.824], [0.333, 0.863], [0.433, 0.871], [0.533, 0.859], [0.638, 0.826]],
  ],
  // Gaafu (as drawn by the user): 1. from the top right, curving down-left to the middle;
  // 2. from just below, down through the bend on the right and along the bottom to the left.
  gaafu: [
    [[0.895, 0.14], [0.8, 0.177], [0.7, 0.25], [0.617, 0.333], [0.537, 0.421]],
    [[0.535, 0.438], [0.55, 0.49], [0.6, 0.542], [0.642, 0.583], [0.653, 0.656], [0.63, 0.713], [0.567, 0.767], [0.483, 0.808], [0.4, 0.842], [0.317, 0.848], [0.225, 0.848], [0.15, 0.825], [0.108, 0.808]],
  ],
  // Thaa (as drawn by the user): two joined strokes – 1. from the middle, round the loop
  // (down, right, up and back over the top) and on to the left; 2. from there down
  // through the S-bend and along the bottom to the bottom left.
  thaa: [
    [[0.5, 0.3], [0.542, 0.371], [0.583, 0.422], [0.633, 0.449], [0.7, 0.473], [0.775, 0.478], [0.842, 0.449], [0.887, 0.389], [0.903, 0.289], [0.897, 0.2], [0.867, 0.144], [0.8, 0.107], [0.75, 0.102], [0.7, 0.124], [0.633, 0.162], [0.583, 0.2], [0.533, 0.244], [0.5, 0.273], [0.442, 0.322], [0.392, 0.367], [0.35, 0.411], [0.308, 0.462], [0.287, 0.493]],
    [[0.287, 0.493], [0.333, 0.507], [0.375, 0.544], [0.4, 0.611], [0.408, 0.689], [0.392, 0.756], [0.358, 0.822], [0.3, 0.862], [0.217, 0.878], [0.163, 0.878], [0.108, 0.851], [0.095, 0.822]],
  ],
  // Meemu (as drawn by the user): one stroke – from the top left, right along the top,
  // round the curve on the right, then all the way down the tail.
  meemu: [
    [[0.38, 0.223], [0.5, 0.2], [0.633, 0.185], [0.733, 0.179], [0.833, 0.189], [0.883, 0.232], [0.875, 0.295], [0.833, 0.368], [0.767, 0.453], [0.667, 0.547], [0.55, 0.642], [0.433, 0.726], [0.3, 0.811], [0.142, 0.867]],
  ],
  // Vaavu (as drawn by the user): one stroke – from below the loop on the right, round the
  // loop (left, up, over the top, down the right) back to the start, then down the tail.
  vaavu: [
    [[0.697, 0.483], [0.592, 0.521], [0.508, 0.479], [0.455, 0.385], [0.475, 0.271], [0.567, 0.167], [0.708, 0.121], [0.8, 0.156], [0.842, 0.25], [0.825, 0.365], [0.767, 0.448], [0.697, 0.483], [0.6, 0.552], [0.483, 0.646], [0.35, 0.74], [0.217, 0.812], [0.095, 0.854]],
  ],
  // Alifu (as drawn by the user): both strokes start at the top of the curve –
  // 1. down the short hook on the right; 2. down the long arm to the bottom left.
  alifu: [
    [[0.835, 0.165], [0.85, 0.282], [0.855, 0.4], [0.847, 0.518], [0.825, 0.635], [0.783, 0.729], [0.733, 0.788], [0.693, 0.819]],
    [[0.835, 0.165], [0.75, 0.235], [0.65, 0.318], [0.55, 0.405], [0.45, 0.494], [0.35, 0.576], [0.25, 0.659], [0.167, 0.718], [0.12, 0.741]],
  ],
  // Kaafu (as drawn by the user): 1. from the top right, down the long arm to the bottom
  // corner; 2. from the top of the short arm, down to meet it at the corner.
  kaafu: [
    [[0.887, 0.175], [0.817, 0.292], [0.733, 0.417], [0.633, 0.528], [0.533, 0.617], [0.433, 0.681], [0.333, 0.736], [0.233, 0.778], [0.133, 0.814]],
    [[0.283, 0.147], [0.292, 0.278], [0.283, 0.417], [0.258, 0.542], [0.225, 0.653], [0.183, 0.736], [0.13, 0.811]],
  ],
  // Noonu (as drawn by the user): 1. from the right end, round the right hump, up to the
  // point and left along the top to the middle; 2. from just above the middle, down the tail.
  noonu: [
    [[0.928, 0.14], [0.892, 0.228], [0.858, 0.309], [0.817, 0.379], [0.767, 0.404], [0.708, 0.414], [0.68, 0.368], [0.663, 0.281], [0.657, 0.168], [0.657, 0.168], [0.633, 0.221], [0.592, 0.256], [0.533, 0.277], [0.492, 0.274], [0.453, 0.249]],
    [[0.428, 0.211], [0.453, 0.249], [0.417, 0.368], [0.367, 0.509], [0.3, 0.614], [0.225, 0.702], [0.15, 0.779], [0.095, 0.811]],
  ],
  // Shaviyani (as drawn by the user): two joined strokes – 1. from the right end, curving
  // down and left to the point in the middle; 2. from that point curving down to the bottom left.
  shaviyani: [
    [[0.92, 0.155], [0.85, 0.21], [0.77, 0.27], [0.67, 0.318], [0.57, 0.29], [0.512, 0.234]],
    [[0.512, 0.234], [0.505, 0.31], [0.49, 0.39], [0.46, 0.47], [0.41, 0.55], [0.34, 0.62], [0.27, 0.67], [0.19, 0.74], [0.105, 0.8]],
  ],
  // Lhaviyani (as drawn by the user): two joined strokes – 1. from the top, curving down to
  // the left, round underneath and right to the end of the bar; 2. from there down the tail.
  lhaviyani: [
    [[0.62, 0.13], [0.57, 0.18], [0.52, 0.24], [0.49, 0.3], [0.51, 0.35], [0.58, 0.37], [0.68, 0.36], [0.8, 0.33], [0.91, 0.3]],
    [[0.91, 0.3], [0.8, 0.41], [0.7, 0.5], [0.6, 0.59], [0.5, 0.66], [0.4, 0.72], [0.3, 0.78], [0.2, 0.83], [0.13, 0.86]],
  ],
  // Dhaalu: three joined strokes – 1. a straight line from the top, left along the top bar to its tip;
  // 2. from that tip back under the bar, down and round the curve to the middle;
  // 3. from the middle all the way down the tail.
  dhaalu: [
    [[0.92, 0.09], [0.835, 0.113], [0.75, 0.137], [0.67, 0.16]], // a straight line
    [[0.67, 0.16], [0.76, 0.18], [0.87, 0.19], [0.94, 0.27], [0.95, 0.37], [0.88, 0.48], [0.74, 0.55], [0.6, 0.52], [0.48, 0.42]],
    [[0.48, 0.42], [0.42, 0.53], [0.3, 0.65], [0.18, 0.75], [0.08, 0.86]],
  ],
  // Baa: from the top middle, right and all the way round, then curving down a little left of
  // the middle (like the side of an oval) to meet the bottom curve.
  baa: [[[0.5, 0.22], [0.62, 0.17], [0.76, 0.12], [0.88, 0.2], [0.93, 0.36], [0.88, 0.55], [0.75, 0.7], [0.56, 0.8], [0.36, 0.84], [0.18, 0.76], [0.08, 0.56], [0.12, 0.36], [0.22, 0.22], [0.34, 0.16], [0.44, 0.2], [0.46, 0.32], [0.45, 0.47], [0.42, 0.61], [0.38, 0.73], [0.34, 0.82]]],
  // Raa: from the top down into the bottom curve, straight across to the top curve, then down
  // through the middle and along the tail.
  raa: [[[0.9, 0.12], [0.78, 0.2], [0.68, 0.3], [0.7, 0.45], [0.78, 0.58], [0.62, 0.48], [0.5, 0.36], [0.43, 0.26], [0.47, 0.36], [0.5, 0.46], [0.38, 0.6], [0.25, 0.72], [0.1, 0.82]]],
  faafu: [FAAFU],
  paviyani: [FAAFU, [[0.64, 0.91]]],
  // Daviyani (as drawn by the user): four joined strokes – 1. straight down-left from the top;
  // 2. curving right to the bend; 3. straight down-left; 4. curving along the bottom to the right.
  daviyani: [
    [[0.411, 0.117], [0.153, 0.347]],
    [[0.153, 0.347], [0.288, 0.358], [0.432, 0.375], [0.541, 0.408], [0.616, 0.463]],
    [[0.616, 0.463], [0.216, 0.755]],
    [[0.216, 0.755], [0.324, 0.792], [0.468, 0.825], [0.649, 0.838], [0.775, 0.837], [0.883, 0.83]],
  ],
  // Laamu (as drawn by the user): three joined strokes – 1. from the top of the hook down-left
  // to the end of the bar; 2. right along the bar; 3. from the bar's end down the tail.
  laamu: [
    [[0.668, 0.097], [0.6, 0.179], [0.517, 0.263], [0.45, 0.316], [0.413, 0.341]],
    [[0.413, 0.341], [0.5, 0.341], [0.6, 0.326], [0.7, 0.305], [0.8, 0.274], [0.903, 0.234]],
    [[0.903, 0.234], [0.817, 0.316], [0.7, 0.432], [0.6, 0.522], [0.483, 0.611], [0.35, 0.705], [0.217, 0.789], [0.1, 0.863]],
  ],
};

// Thaana – the 24 base letters in traditional order.
const dhivehi = [
  ['ހ', 'Haa', 'h'], ['ށ', 'Shaviyani', 'sh'], ['ނ', 'Noonu', 'n'], ['ރ', 'Raa', 'r'],
  ['ބ', 'Baa', 'b'], ['ޅ', 'Lhaviyani', 'lh'], ['ކ', 'Kaafu', 'k'], ['އ', 'Alifu', 'a'],
  ['ވ', 'Vaavu', 'v'], ['މ', 'Meemu', 'm'], ['ފ', 'Faafu', 'f'], ['ދ', 'Dhaalu', 'dh'],
  ['ތ', 'Thaa', 'th'], ['ލ', 'Laamu', 'l'], ['ގ', 'Gaafu', 'g'], ['ޏ', 'Gnaviyani', 'gn'],
  ['ސ', 'Seenu', 's'], ['ޑ', 'Daviyani', 'd'], ['ޒ', 'Zaviyani', 'z'], ['ޓ', 'Taviyani', 't'],
  ['ޔ', 'Yaa', 'y'], ['ޕ', 'Paviyani', 'p'], ['ޖ', 'Javiyani', 'j'], ['ޗ', 'Chaviyani', 'ch'],
].map(([char, name, sound]) => {
  const id = name.toLowerCase();
  return { id, char, name, sound, guide: THAANA_GUIDES[id] };
});

// Number of dots on each Arabic letter (ت two above, ث three above, …).
const ARABIC_DOTS = { 'ب': 1, 'ت': 2, 'ث': 3, 'ج': 1, 'خ': 1, 'ذ': 1, 'ز': 1, 'ش': 3, 'ض': 1, 'ظ': 1, 'غ': 1, 'ف': 1, 'ق': 2, 'ن': 1, 'ي': 2 };

// Hand-drawn tracing paths for Arabic letters the automatic guide splits or
// starts on the side (fractions of the letter's ink box; a single point is a
// dot to tap). ح ج خ: from the little hook at the top, right to the end of the
// top bar, back along it and down the middle of the curve, then along the bottom.
// ف ق: round the head from its top, then the body. م و: a full circle round the
// head from its top, then down the tail.
const ARABIC_GUIDES = {
  'ج': [
    [[0.05, 0.13], [0.1, 0.08], [0.18, 0.06], [0.3, 0.065], [0.45, 0.085], [0.55, 0.088], [0.65, 0.08], [0.72, 0.065], [0.6, 0.1], [0.5, 0.11], [0.41, 0.12], [0.35, 0.16], [0.27, 0.2], [0.2, 0.25], [0.15, 0.3], [0.1, 0.37], [0.07, 0.45], [0.05, 0.53], [0.045, 0.6], [0.065, 0.7], [0.11, 0.78], [0.15, 0.818], [0.25, 0.878], [0.35, 0.914], [0.45, 0.93], [0.55, 0.938], [0.65, 0.934], [0.8, 0.914], [0.9, 0.894], [0.95, 0.89]],
    [[0.55, 0.4]],
  ],
  'ح': [
    [[0.05, 0.13], [0.1, 0.08], [0.18, 0.06], [0.3, 0.065], [0.45, 0.085], [0.55, 0.088], [0.65, 0.08], [0.72, 0.065], [0.6, 0.1], [0.5, 0.11], [0.41, 0.12], [0.35, 0.16], [0.27, 0.2], [0.2, 0.25], [0.15, 0.3], [0.1, 0.37], [0.07, 0.45], [0.05, 0.53], [0.045, 0.6], [0.065, 0.7], [0.11, 0.78], [0.15, 0.818], [0.25, 0.878], [0.35, 0.914], [0.45, 0.93], [0.55, 0.938], [0.65, 0.934], [0.8, 0.914], [0.9, 0.894], [0.95, 0.89]],
  ],
  'خ': [
    [[0.05, 0.3], [0.1, 0.26], [0.18, 0.248], [0.3, 0.252], [0.45, 0.272], [0.55, 0.272], [0.65, 0.265], [0.72, 0.252], [0.6, 0.285], [0.5, 0.29], [0.42, 0.3], [0.36, 0.33], [0.3, 0.36], [0.2, 0.4], [0.14, 0.45], [0.09, 0.5], [0.055, 0.57], [0.04, 0.63], [0.04, 0.7], [0.07, 0.78], [0.15, 0.854], [0.25, 0.902], [0.35, 0.93], [0.45, 0.946], [0.55, 0.95], [0.65, 0.948], [0.8, 0.93], [0.9, 0.918], [0.96, 0.91]],
    [[0.39, 0.06]],
  ],
  'ف': [
    [[0.89, 0.42], [0.82, 0.35], [0.75, 0.41], [0.73, 0.51], [0.78, 0.6], [0.86, 0.61], [0.92, 0.56], [0.93, 0.66], [0.85, 0.78], [0.65, 0.85], [0.4, 0.88], [0.18, 0.85], [0.07, 0.74], [0.07, 0.6], [0.1, 0.5]],
    [[0.77, 0.12]],
  ],
  'ق': [
    [[0.8, 0.38], [0.72, 0.31], [0.62, 0.35], [0.57, 0.45], [0.62, 0.54], [0.72, 0.56], [0.82, 0.5], [0.88, 0.62], [0.84, 0.76], [0.7, 0.88], [0.45, 0.93], [0.22, 0.89], [0.07, 0.75], [0.07, 0.6], [0.13, 0.48]],
    [[0.75, 0.12]],
    [[0.55, 0.12]],
  ],
  'م': [
    [[0.3, 0.16], [0.33, 0.11], [0.39, 0.085], [0.454, 0.071], [0.55, 0.058], [0.646, 0.071], [0.73, 0.098], [0.81, 0.14], [0.79, 0.195], [0.65, 0.212], [0.55, 0.217], [0.43, 0.228], [0.34, 0.22], [0.25, 0.245], [0.18, 0.29], [0.14, 0.35], [0.12, 0.45], [0.13, 0.56], [0.155, 0.7], [0.19, 0.84], [0.225, 0.95]],
  ],
  'و': [
    [[0.9, 0.19], [0.87, 0.13], [0.82, 0.095], [0.75, 0.08], [0.68, 0.115], [0.643, 0.172], [0.627, 0.22], [0.639, 0.27], [0.682, 0.312], [0.75, 0.33], [0.816, 0.309], [0.87, 0.29], [0.91, 0.335], [0.91, 0.44], [0.87, 0.55], [0.8, 0.65], [0.71, 0.75], [0.6, 0.82], [0.45, 0.88], [0.3, 0.915], [0.15, 0.93], [0.03, 0.92]],
  ],
};

const arabic = [
  ['ا', 'Alif', 'ألف', 'a', 'أرنب', 'Arnab', 'rabbit', '🐰'],
  ['ب', 'Baa', 'باء', 'b', 'بطة', 'Batta', 'duck', '🦆'],
  ['ت', 'Taa', 'تاء', 't', 'تفاحة', 'Tuffaha', 'apple', '🍎'],
  ['ث', 'Thaa', 'ثاء', 'th', 'ثعلب', "Tha'lab", 'fox', '🦊'],
  ['ج', 'Jeem', 'جيم', 'j', 'جمل', 'Jamal', 'camel', '🐫'],
  ['ح', 'Haa', 'حاء', 'ḥ', 'حصان', 'Hisan', 'horse', '🐴'],
  ['خ', 'Khaa', 'خاء', 'kh', 'خروف', 'Kharoof', 'sheep', '🐑'],
  ['د', 'Daal', 'دال', 'd', 'دب', 'Dubb', 'bear', '🐻'],
  ['ذ', 'Dhaal', 'ذال', 'dh', 'ذرة', 'Dhura', 'corn', '🌽'],
  ['ر', 'Raa', 'راء', 'r', 'ريشة', 'Reesha', 'feather', '🪶'],
  ['ز', 'Zaay', 'زاي', 'z', 'زرافة', 'Zarafa', 'giraffe', '🦒'],
  ['س', 'Seen', 'سين', 's', 'سمكة', 'Samaka', 'fish', '🐟'],
  ['ش', 'Sheen', 'شين', 'sh', 'شمس', 'Shams', 'sun', '☀️'],
  ['ص', 'Saad', 'صاد', 'ṣ', 'صقر', 'Saqr', 'falcon', '🦅'],
  ['ض', 'Daad', 'ضاد', 'ḍ', 'ضفدع', "Dhifda'", 'frog', '🐸'],
  ['ط', 'Taa', 'طاء', 'ṭ', 'طائرة', "Ta'ira", 'airplane', '✈️'],
  ['ظ', 'Dhaa', 'ظاء', 'ẓ', 'ظرف', 'Dharf', 'envelope', '✉️'],
  ['ع', 'Ayn', 'عين', 'ʿ', 'عين', 'Ayn', 'eye', '👁️'],
  ['غ', 'Ghayn', 'غين', 'gh', 'غيمة', 'Ghayma', 'cloud', '☁️'],
  ['ف', 'Faa', 'فاء', 'f', 'فيل', 'Feel', 'elephant', '🐘'],
  ['ق', 'Qaaf', 'قاف', 'q', 'قمر', 'Qamar', 'moon', '🌙'],
  ['ك', 'Kaaf', 'كاف', 'k', 'كلب', 'Kalb', 'dog', '🐶'],
  ['ل', 'Laam', 'لام', 'l', 'ليمون', 'Laymoon', 'lemon', '🍋'],
  ['م', 'Meem', 'ميم', 'm', 'موز', 'Mawz', 'banana', '🍌'],
  ['ن', 'Noon', 'نون', 'n', 'نحلة', 'Nahla', 'bee', '🐝'],
  ['ه', 'Haa', 'هاء', 'h', 'هدية', 'Hadiyya', 'gift', '🎁'],
  ['و', 'Waaw', 'واو', 'w', 'وردة', 'Warda', 'rose', '🌹'],
  ['ي', 'Yaa', 'ياء', 'y', 'يد', 'Yad', 'hand', '✋'],
].map(([char, name, nameNative, sound, word, wordLatin, meaning, emoji], i) => ({
  id: `${i + 1}-${name.toLowerCase()}`,
  char,
  name,
  nameNative,
  sound,
  word,
  wordLatin,
  meaning,
  emoji,
  dots: ARABIC_DOTS[char] || 0, // how many dots to tap when tracing
  guide: ARABIC_GUIDES[char],
  // The Uthmanic font draws an isolated ي without its two dots (Qur'anic
  // style). Children need the dots, so this one letter uses Noto Sans Arabic.
  ...(char === 'ي' ? { font: '"Noto Sans Arabic", sans-serif' } : {}),
}));

// Numbers 0–9 (Fredoka, like English). Hand-drawn tracing paths, fractions of the
// digit's ink box, all starting at the top in the usual writing order:
// 0 round to the left and back to the top · 1 up the flag, then down ·
// 2 over the top, down the slope, along the bottom · 3 two bumps, touching the
// middle · 4 down the slope and across, then the tall line · 5 down and round
// the belly, then the top bar · 6 down the curve and round the loop ·
// 7 across the top and down · 8 an S down and back up to the top ·
// 9 from the top right of the head, leftwards over the top and all the way
// round (closing the circle), then down the right side and the tail.
const NUMBER_GUIDES = {
  '0': [[[0.5, 0.055], [0.305, 0.115], [0.162, 0.278], [0.11, 0.5], [0.162, 0.723], [0.305, 0.885], [0.5, 0.945], [0.695, 0.885], [0.838, 0.723], [0.89, 0.5], [0.838, 0.277], [0.695, 0.115], [0.5, 0.055]]],
  '1': [[[0.08, 0.33], [0.3, 0.24], [0.55, 0.14], [0.8, 0.05], [0.88, 0.12], [0.88, 0.4], [0.88, 0.7], [0.88, 0.95]]],
  '2': [[[0.1, 0.36], [0.12, 0.2], [0.25, 0.08], [0.48, 0.05], [0.7, 0.09], [0.81, 0.25], [0.77, 0.42], [0.6, 0.58], [0.35, 0.75], [0.1, 0.92], [0.3, 0.93], [0.6, 0.93], [0.95, 0.93]]],
  '3': [[[0.12, 0.2], [0.25, 0.07], [0.5, 0.04], [0.72, 0.1], [0.8, 0.25], [0.72, 0.4], [0.58, 0.47], [0.45, 0.47], [0.62, 0.5], [0.82, 0.6], [0.88, 0.77], [0.76, 0.91], [0.52, 0.96], [0.3, 0.93], [0.12, 0.8]]],
  '4': [[[0.33, 0.04], [0.2, 0.33], [0.07, 0.625], [0.4, 0.625], [0.78, 0.625]], [[0.9, 0.04], [0.9, 0.5], [0.9, 0.96]]],
  '5': [[[0.22, 0.05], [0.18, 0.25], [0.13, 0.48], [0.3, 0.41], [0.5, 0.39], [0.75, 0.45], [0.88, 0.62], [0.85, 0.8], [0.7, 0.93], [0.45, 0.96], [0.2, 0.92], [0.07, 0.84]], [[0.22, 0.05], [0.55, 0.05], [0.9, 0.05]]],
  '6': [[[0.85, 0.05], [0.6, 0.06], [0.35, 0.15], [0.15, 0.35], [0.08, 0.6], [0.12, 0.8], [0.3, 0.95], [0.55, 0.96], [0.78, 0.88], [0.9, 0.68], [0.82, 0.52], [0.6, 0.45], [0.35, 0.47], [0.12, 0.58]]],
  '7': [[[0.05, 0.055], [0.5, 0.055], [0.88, 0.06], [0.75, 0.3], [0.6, 0.55], [0.45, 0.78], [0.37, 0.97]]],
  '8': [[[0.5, 0.06], [0.28, 0.1], [0.16, 0.25], [0.27, 0.4], [0.5, 0.47], [0.75, 0.55], [0.9, 0.72], [0.78, 0.9], [0.5, 0.95], [0.22, 0.9], [0.1, 0.72], [0.25, 0.55], [0.5, 0.47], [0.73, 0.4], [0.84, 0.25], [0.72, 0.1], [0.5, 0.06]]],
  '9': [[[0.8, 0.1], [0.66, 0.06], [0.48, 0.055], [0.32, 0.08], [0.17, 0.17], [0.1, 0.33], [0.16, 0.47], [0.33, 0.55], [0.55, 0.56], [0.75, 0.49], [0.87, 0.37], [0.885, 0.24], [0.84, 0.13], [0.8, 0.1], [0.87, 0.2], [0.9, 0.35], [0.905, 0.47], [0.89, 0.6], [0.81, 0.76], [0.66, 0.88], [0.42, 0.96], [0.12, 0.97]]],
};

const numbers = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'].map((name, n) => ({
  id: String(n),
  char: String(n),
  name,
  // counting apples (an empty plate for zero)
  word: n === 0 ? 'No apples' : `${name} apple${n === 1 ? '' : 's'}`,
  emoji: n === 0 ? '🍽️' : '🍎'.repeat(n),
  guide: NUMBER_GUIDES[String(n)],
}));

export const ALPHABETS = [
  {
    id: 'en',
    title: 'English',
    nativeTitle: 'ABC',
    speechLang: 'en',
    dir: 'ltr',
    font: '"Fredoka", system-ui, sans-serif',
    traceOutline: 1.4, // a slightly bolder border around the letter when tracing
    traceWeight: 400, // regular Fredoka so English strokes are about as thick as the others
    traceThicken: -0.012, // and less of the extra boldness every tracing letter gets
    theme: { main: '#ff7a59', soft: '#ffe3d9', deep: '#d9512f' },
    letters: english,
    // What to say for a letter: [text, language] in the native voice,
    // and a fallback spoken with an English voice.
    phrase: (l, withWord) => {
      const t = withWord ? `${l.char}. ${l.char} is for ${l.word}.` : `${l.char}.`;
      return { native: t, fallback: t };
    },
  },
  {
    id: 'dv',
    title: 'Dhivehi',
    nativeTitle: 'ދިވެހި',
    speechLang: 'dv',
    dir: 'rtl',
    // MV Waheed (src/assets/fonts) with Noto Sans Thaana as fallback.
    font: '"MV Waheed", "Noto Sans Thaana", sans-serif',
    displayScale: 1.8, // MV Waheed glyphs are small within the font's em box
    glyphShift: '-0.22em', // …and sit low, so lift them to look centred
    theme: { main: '#14b8a6', soft: '#d3f5ef', deep: '#0d8a7c' },
    letters: dhivehi,
    phrase: (l) => ({ native: l.char, fallback: `${l.name}.` }),
  },
  {
    id: 'ar',
    title: 'Arabic',
    nativeTitle: 'العربية',
    speechLang: 'ar',
    dir: 'rtl',
    // KFGQPC Hafs Uthmanic Script (src/assets/fonts), Noto Sans Arabic fallback.
    font: '"KFGQPC Hafs", "Noto Sans Arabic", sans-serif',
    displayScale: 1.2,
    glyphShift: '-0.2em', // the font sits letters low – lift them to look centred
    textStroke: '0.022em', // the font is thin – embolden it a little on screen
    traceThicken: 0.045, // …and thicken the tracing shape (fraction of font size)
    theme: { main: '#8b5cf6', soft: '#ebe3ff', deep: '#6a3fd6' },
    letters: arabic,
    phrase: (l, withWord) => ({
      native: withWord ? `${l.nameNative}. ${l.word}` : l.nameNative,
      fallback: withWord ? `${l.name}. ${l.wordLatin}, ${l.meaning}.` : `${l.name}.`,
    }),
  },
  {
    id: 'num',
    title: 'Numbers',
    nativeTitle: '0 – 9',
    unit: 'number', // what the screens call each item ("letter" elsewhere)
    speechLang: 'en',
    dir: 'ltr',
    font: '"Fredoka", system-ui, sans-serif',
    traceOutline: 1.4,
    traceWeight: 400,
    traceThicken: -0.012,
    theme: { main: '#3b82f6', soft: '#dbeafe', deep: '#2563eb' },
    letters: numbers,
    phrase: (l, withWord) => {
      const t = withWord ? `${l.name}. ${l.word}.` : `${l.name}.`;
      return { native: t, fallback: t };
    },
  },
];

// English small letters (a b c): a variant of English with its own lessons,
// tracing and progress. Same words and sounds as the capitals.
{
  const en = ALPHABETS[0];
  en.statTitle = 'English ABC';
  ALPHABETS.splice(1, 0, {
    ...en,
    id: 'enl',
    variantOf: 'en',
    nativeTitle: 'abc',
    statTitle: 'English abc',
    letters: english.map((l) => ({ id: l.id, char: l.lower, name: l.lower, sound: l.sound, word: l.word, emoji: l.emoji, guide: ENGLISH_LOWER_GUIDES[l.lower] })),
    // speak the capital ("A. A is for Apple") so voices say the letter name
    phrase: (l, withWord) => en.phrase({ ...l, char: l.char.toUpperCase() }, withWord),
  });
}

// The alphabets shown as cards (variants such as small letters live inside them).
export const MAIN_ALPHABETS = ALPHABETS.filter((a) => !a.variantOf);
export const variantsOf = (id) => ALPHABETS.filter((a) => a.id === id || a.variantOf === id);

// Attach recorded clips to their letters (variants share their main alphabet's clips).
for (const a of ALPHABETS) {
  a.letters = a.letters.map((l) => ({ ...l, audio: l.audio ?? AUDIO[`${a.variantOf || a.id}/${l.id}`] }));
}

export const getAlphabet = (id) => ALPHABETS.find((a) => a.id === id);

// Font and on-screen boldness for a letter (a few letters override the alphabet font).
export const fontOf = (alphabet, letter) => letter?.font || alphabet.font;
export const glyphStyle = (alphabet, letter) => ({
  fontFamily: fontOf(alphabet, letter),
  '--stroke': letter?.font ? '0' : alphabet.textStroke || '0',
  // Letters drawn in the fallback font: lighter, smaller and lifted to match.
  ...(letter?.font ? { fontWeight: 500, '--fs': 0.9, '--gy': '-0.12em' } : {}),
});
