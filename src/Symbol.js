const THREE = require('three');
const v3 = (x, y, z) => { return new THREE.Vector3(x, y, z); };
const WHITE = rgb(255, 255, 255);
const BLACK = rgb(0, 0, 0);

const ROOF_TYPES = ['pyramid', 'trapezoid'];
const TREE_TYPES = ['lpt_0', 'lpt_1', 'lpt_2'];
const HOUSE_MAX_ITER = 2;

function rgb(r, g, b) {
  return {r, g, b};
}

function randColor() {
  return {r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255}
}

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
    let newShape = new Shape(this.type, this.pos, this.size, this.rot, this.color, this.points); // this.points is shallow
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
    let pos = opts.pos ? opts.pos : v3(0,0,0);
    let size = opts.size ? opts.size : v3(0,0,0);
    let rot = opts.rot ? opts.rot : v3(0,0,0);
    let color = opts.color ? opts.color : rgb(0,0,0);
    return new Symbol('X', new Shape('Y', pos, size, rot, color));
  }

  static genRoof(refSymbol, opts = {}) {
    if (!refSymbol) {
      refSymbol = Symbol.genericSymbol();
    }
    let { char, shape: {type, pos, size, rot, color}, iter } = refSymbol;

    let newType = ROOF_TYPES[Math.floor(Math.random() * ROOF_TYPES.length)];
    let roofShape = new Shape(newType, v3(0,size.y / 2,0).add(pos), v3(1,1,1).multiply(size), rot, randColor());
    let roofSymbol = new Symbol('R', roofShape, iter + 1);
    return roofSymbol;
  }

  static genHouse(char, refSymbol, opts = {}) {
    if (!refSymbol) {
      refSymbol = Symbol.genericSymbol({size: v3(2,1,2)});
    }
    let { shape: {pos, size, rot, color}, iter } = refSymbol;
    let newChar = iter + 1 > HOUSE_MAX_ITER ? 'T' : char;
    let newPos, newSize;
    if (opts.nextLevel) {
      newPos = v3(0, size.y, 0).add(pos);
      let random = Math.random() * 0.5 + 0.5;
      newSize = v3(random,Math.random() + 0.5,random).multiply(size);
    } else {
      let newPosX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5 + 0.5) * size.x * 0.5;
      let newPosZ = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5 + 0.5) * size.z * 0.5;
      newPos = v3(newPosX, 0, newPosZ);
      newSize = v3(Math.random() * 0.5 + 0.5, Math.random() + 0.5, Math.random() * 0.5 + 0.5).multiply(size);
    }
    let houseShape = new Shape('box', newPos, newSize, v3(0, 0, 0), randColor());
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
      let random = Math.random() * 0.5 + 0.5;
      newSize = v3(random,Math.random() + 0.5,random).multiply(size);
    } else {
      let newPosX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5 + 0.5) * size.x * 0.5;
      let newPosZ = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.5 + 0.5) * size.z * 0.5;
      newPos = v3(newPosX, 0, newPosZ);
      newSize = v3(Math.random() * 0.5 + 0.5, Math.random() + 0.5, Math.random() * 0.5 + 0.5).multiply(size);
    }
    let houseShape = new Shape('box', newPos, newSize, v3(0, 0, 0), randColor());
    let houseSymbol = new Symbol(newChar, houseShape, iter + 1);
    return houseSymbol;
  }



  static genGround(refSymbol, opts = {}) {
    if (!refSymbol) {
      refSymbol = Symbol.genericSymbol();
    }
    let { char, shape: {pos, size, rot, color}, iter } = refSymbol;
    let groundShape = new Shape('plane', v3(0,0,0), v3(300,300,1), v3(90,0,0), rgb(3, 105, 32));
    let groundSymbol = new Symbol('G', groundShape);
    return groundSymbol;
  }

  static genTower(refSymbol, opts = {}) {
    if (!refSymbol) {
      refSymbol = Symbol.genericSymbol({size: v3(1,1,1)});
    }
    let { char, shape: {pos, size, rot, color}, iter } = refSymbol;
    let towerShape = new Shape('tower', v3(1,0,0), v3(0.0025,0.0025,0.0025), v3(0,0,0), rgb(220,220,220));
    let towerSymbol = new Symbol('W', towerShape);
    return towerSymbol;
  }

  static genRoad(refSymbol, opts = {}) {
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

  static genTree(refSymbol, opts = {}) {
    if (!refSymbol) {
      refSymbol = Symbol.genericSymbol({size: v3(1,1,1)});
    }
    let { char, shape: {pos, size, rot, color, points}, iter } = refSymbol;
    let newType = TREE_TYPES[Math.floor(Math.random() * TREE_TYPES.length)];
    let treeShape = new Shape(newType, v3(1,0,0), v3(0.4,0.4,0.4), v3(0,0,0), rgb(44, 68, 0));
    let treeSymbol = new Symbol('E', treeShape);
    return treeSymbol;
  }
}
