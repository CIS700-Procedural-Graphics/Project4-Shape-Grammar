const THREE = require('three');

export function v3(x, y, z) {
  return new THREE.Vector3(x, y, z);
};

export function rgb(r, g, b) {
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
  return list[Math.random() * list.length];
}

export function randInt(a,b) {
  return Math.floor(Math.randRange(a, b));
}
