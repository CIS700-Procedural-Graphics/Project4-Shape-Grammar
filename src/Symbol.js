import { v3, rgb, randColor, randGray, randSign, upperRand, randRange } from './Utils'
const THREE = require('three');
window.THREE = THREE;
window.v3 = v3;
const WHITE = rgb(255, 255, 255);
const BLACK = rgb(0, 0, 0);




export class Shape {
  constructor(type, pos, size, rot, color, points = []) {
    this.type = type;
    this.pos = pos;
    this.size = size;
    this.rot = rot;
    this.color = color;
    this.points = points.length === 0 ? [pos] : points;
  }

  copy() {
    let newColor = {r: this.color.r, g: this.color.g, b: this.color.b};
    let newShape = new Shape(this.type, this.pos.clone(), this.size.clone(), this.rot.clone(), newColor, this.points); // this.points is shallow
    return newShape;
  }

}

export class Symbol {
  constructor(char, shape, iter = 0) {
    this.char = char;
    this.shape = shape;
    this.iter = iter;
  }

  copy() {
    let newSymbol = new Symbol(this.char, this.shape.copy(), this.iter);
    return newSymbol;
  }

  static genericSymbol(opts = {}) {
    let pos = opts.pos ? opts.pos : v3();
    let size = opts.size ? opts.size : v3(1,1,1);
    let rot = opts.rot ? opts.rot : v3();
    let color = opts.color ? opts.color : randColor();
    let char = opts.char ? opts.char : 'X';
    let type = opts.type ? opts.type : 'Y';
    return new Symbol(char, new Shape(type, pos, size, rot, color));
  }

  static genRoof(refSymbol, opts = {}) {
    if (!refSymbol) {
      refSymbol = Symbol.genericSymbol();
    }
    let { char, shape: {type, pos, size, rot, color}, iter } = refSymbol;

    let newType = ROOF_TYPES[Math.floor(Math.random() * ROOF_TYPES.length)];
    let roofShape = new Shape(newType, v3(0,size.y / 2,0).add(pos), v3(1,1,1).multiply(size), rot, randGray());
    let roofSymbol = new Symbol('R', roofShape, iter + 1);
    return roofSymbol;
  }

  static genHouse(char, refSymbol, opts = {}) {
    if (!refSymbol) {
      refSymbol = Symbol.genericSymbol({size: v3(2,1,2), color: randColor()});
    }
    let { shape: {pos, size, rot, color}, iter } = refSymbol;
    let newChar = iter + 1 > HOUSE_MAX_ITER ? 'T' : char;
    let newPos, newSize;
    if (opts.nextLevel) {
      newPos = v3(0, size.y, 0).add(pos);
      let random = upperRand();
      newSize = v3(random,Math.random() + 0.5,random).multiply(size);
    } else {
      let newPosX = (Math.random() > 0.5 ? 1 : -1) * (upperRand()) * size.x * 0.5;
      let newPosZ = (Math.random() > 0.5 ? 1 : -1) * (upperRand()) * size.z * 0.5;
      newPos = v3(newPosX, 0, newPosZ);
      newSize = v3(upperRand(), Math.random() + 0.5, upperRand()).multiply(size);
    }
    let houseShape = new Shape('box', newPos, newSize, v3(0, 0, 0), color);
    let houseSymbol = new Symbol(newChar, houseShape, iter + 1);
    return houseSymbol;
  }

  static genSubHouse(char, refSymbol, opts = {}) {
    if (!refSymbol) {
      refSymbol = Symbol.genericSymbol({size: v3(2,1,2)});
    }
    let { shape: {pos, size, rot, color}, iter } = refSymbol;
    let newChar = iter + 1 > HOUSE_MAX_ITER ? 'T' : char;
    let newPos, newSize;
    if (opts.nextLevel) {
      newPos = v3(0, size.y, 0).add(pos);
      let random = upperRand();
      newSize = v3(random,Math.random() + 0.5,random).multiply(size);
    } else {
      let newPosX = (Math.random() > 0.5 ? 1 : -1) * (upperRand()) * size.x * 0.5;
      let newPosZ = (Math.random() > 0.5 ? 1 : -1) * (upperRand()) * size.z * 0.5;
      newPos = v3(newPosX, 0, newPosZ);
      newSize = v3(upperRand(), Math.random() + 0.5, upperRand()).multiply(size);
    }
    let houseShape = new Shape('box', newPos, newSize, v3(0, 0, 0), color);
    let houseSymbol = new Symbol(newChar, houseShape, iter + 1);
    return houseSymbol;
  }

  static genTower(refSymbol, opts = {}) {
    if (!refSymbol) {
      refSymbol = Symbol.genericSymbol({size: v3(1,1,1)});
    }
    let { char, shape: {pos, size, rot, color}, iter } = refSymbol;
    let towerShape = new Shape('tower', v3(1,0,0), v3(0.0025,0.0025,0.0025), v3(), rgb(220,220,220));
    let towerSymbol = new Symbol('W', towerShape);
    return towerSymbol;
  }

  static genRoadConstructive(refSymbol, opts = {}) {
    if (!refSymbol) {
      refSymbol = Symbol.genericSymbol({size: v3(1,1,1)});
    }
    let { char, shape: {pos, size, rot, color, points}, iter } = refSymbol;
    let newPos = points[Math.floor(Math.random() * points.length)];
    let newPoints = Symbol.makePoints(newPos);
    let roadShape = new Shape('road', newPos, size, rot, color, newPoints);
    let roadSymbol = new Symbol('O', roadShape, iter + 1);
    return roadSymbol;
  }

  static makePoints(refPoint) {
    let newPoints = []
    let curPoint = refPoint;
    for (let i = 0; i < 5; i++) {
      let newPoint = v3(Math.random() * -3, 0, Math.random() * -3).add(curPoint);
      newPoints.unshift(newPoint);
    }
    newPoints.push(refPoint);
    for (let i = 0; i < 5; i++) {
      let newPoint = v3(Math.random() * 3, 0, Math.random() * 3).add(curPoint);
      newPoints.push(newPoint);
    }
    return newPoints;
  }

}
