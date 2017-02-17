const THREE = require('three');

export function v3(x, y, z) {
  return new THREE.Vector3(x, y, z);
};

export function v(x) {
  return new THREE.Vector3(x, x, x);
}

export function clamp(a, b, c) {
  return Math.min(Math.max(a, b), c);
}

export function rgb(r, g, b) {
  r = clamp(0, r, 255);
  g = clamp(0, g, 255);
  b = clamp(0, b, 255);
  return {r, g, b};
};

export function randColor() {
  return {r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255};
};

export function randGray() {
  return {r: Math.random() * 40 - 107, g: Math.random() * 40 - 107, b: Math.random() * 40 - 107};
};

export function randSign() {
  return Math.random() < 0.5 ? 1 : -1;
};

export function upperRand() {
  return Math.random() * 0.5 + 0.5;
};

export function randRange(a,b) {
  return Math.random() * (b - a) + a;
};

export function randChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function randInt(a,b) {
  return Math.floor(randRange(a, b));
}

export function dot(a,b) {
  let total = 0;
  for (let i = 0; i < a.length; i++) {
    total += a[i] * b[i];
  }
  return total;
}

export function within(x, y, lx, ly, mx, my) {
  return lx <= x && x < mx && ly <= y && y < my;
}
