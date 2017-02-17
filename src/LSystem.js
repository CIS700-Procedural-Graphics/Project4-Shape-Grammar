import { Symbol, Shape } from './Symbol';
import { v3, v, rgb, randColor, randGray, randSign, upperRand, randRange, randChoice, randInt, within, dot } from './Utils'

const THREE = require('three');
const WHITE = rgb(255, 255, 255);
const BLACK = rgb(0, 0, 0);
const ROOF_TYPES = ['pyramid', 'trapezoid'];
const TREE_TYPES = ['lpt_0', 'lpt_1', 'lpt_2'];
const HOUSE_MAX_ITER = 2;

class Grid {
  constructor(sizex, sizey) {
    this.lx = -sizex / 2;
    this.ly = -sizey / 2;
    this.mx = -this.lx;
    this.my = -this.ly;
    this.grid = [];
    for (let i = 0; i < sizex; i++) {
      this.grid[i] = [];
      for (let j = 0; j < sizey; j++) {
        this.grid[i][j] = {};
      }
    }
  }

  add(sym) {
    let p = sym.shape.pos;
    this.get(Math.floor(p.x), Math.floor(p.y)).symbol = sym;
  }

  get(a, b) {
    a = Math.floor(a);
    b = Math.floor(b);
    return this.grid[a - this.lx][b - this.ly];
  }

  neighbors(a, b, r) {
    let n = [];
    for (let i = a - r; i < a + r; i++) {
      for (let j = b - r; j < b + r; j++) {
        let cell = this.get(i, j);
        if (cell.symbol) {
          n.push(cell.symbol);
        }
      }
    }
    return n;
  }

  remove(a, b) {
    a = Math.floor(a);
    b = Math.floor(b);
    delete this.grid[a - this.lx][b - this.ly];
  }

  demarcate(zones) {
    this.zones = zones;
    let { lx, ly, mx, my } = this;
    let points = [];
    this.points = [];
    for (let i = 1; i <= zones; i++) {
      let np = {x: randInt(lx, mx), y: randInt(ly, my), zone: i};
      points.push(np);
      this.points.push(np);
    }
    let q = points, p;
    while(q.length !== 0) {
      let zone = (p, x, y) => {
        if (!within(x, y, lx, ly, mx, my)) return;
        let o = this.get(x,y);
        if (o.zone === undefined) {
          o.zone = p.zone;
          q.push({x, y, zone: o.zone});
        }
      }
      p = q.shift();
      zone(p, p.x+1, p.y);
      zone(p, p.x-1, p.y);
      zone(p, p.x, p.y+1);
      zone(p, p.x, p.y-1);
    }
  }
}

export default class LSystem {
  constructor(axiom, grammar) {
    // this.axiom = this._parseAxiom(axiom);
    this.sizex = 100;
    this.sizey = 100
    this.grid = new Grid(this.sizex, this.sizey);
    this.grid.demarcate(5);
    // this.grammar = this._parseGrammar(grammar);

    if (window.mode === window.DEMO) {
      let building = Symbol.genericSymbol({char: 'B', type: 'box'});
      let ground = this.genGround();
      this.axiom = [
        // building,
        ...this.createBuildings(),
        // ...this.createGridRoads(),
        ground,
      ];
    }
    // deep copy
    this.state = this.axiom.map((sym) => {
      return sym.copy();
    });

    this.cache = {
      0: this.axiom
    };
  }

  applyGrammar(symbol) {
    let { char, shape: {pos, size, rot, color}, iter } = symbol;
    let random = Math.random();
    let successors = [];
    switch (char) {
      case 'G':
        successors.push(symbol.copy());
        successors.push(...this.createTrees());
        break;
      case 'O':
        successors.push(symbol.copy());
        break;
      case 'B':
        successors.push(...this.subBuilding(symbol));
        successors.push(this.genDoor(symbol))
        break;
      case 'b':
        successors.push(...this.subBuilding(symbol));
        successors.push(this.genRoof(symbol));
        successors.push(...this.genWindows(symbol));
        break;
      case 'D':
        successors.push(symbol.copy());
        break;
      default:
    }
    return successors;
  }

  subBuilding(sym) {
    let { type, pos, size, rot, color } = sym.shape;
    let subdiv = [];
    let sub0, sub1, newSymbol, char = sym.char;
    char = 'b'
    let newRot0 = randChoice([rot, v3(0,90,0).add(rot)]);
    let newRow1 = randChoice([rot, v3(0,90,0).add(rot)]);
    let random = Math.random();
    if (random < 0.33 || sym.iter >= HOUSE_MAX_ITER) {
      newSymbol = sym.copy();
      newSymbol.char = 'b';
      return [newSymbol];
    } else if (random < 0.66) {
      // yz-subdiv
      sub0 = new Shape('box', v3(-size.x / 4,0,0).add(pos), v3(0.5, upperRand(), 1).multiply(size), newRot0, color);
      sub1 = new Shape('box', v3(size.x / 4,0,0).add(pos), v3(0.5, upperRand(), 1).multiply(size), newRow1, color);
    } else {
      // xy-subdiv
      sub0 = new Shape('box', v3(0,0,-size.z / 4).add(pos), v3(1, upperRand(), 0.5).multiply(size), newRot0, color);
      sub1 = new Shape('box', v3(0,0,size.z / 4).add(pos), v3(1, upperRand(), 0.5).multiply(size), newRow1, color);
    }

    newSymbol = new Symbol(char, sub0, sym.iter + 1);
    subdiv.push(newSymbol);

    newSymbol = new Symbol(char, sub1, sym.iter + 1)
    subdiv.push(newSymbol);

    return subdiv;
  }

  createBuildings() {
    this.buildings = [];
    for (let i = -this.sizex / 2 + 5; i < this.sizex / 2 - 5; i++) {
      for (let j = -this.sizey / 2 + 5; j < this.sizey / 2 - 5; j++) {
        let { grid } = this;
        let { zone } = grid.get(i, j);

        let char = 'B';
        let type = 'box';
        let pos = v3(i, 0, j);
        let girth = Math.min(3, grid.zones/zone);
        let size = v3(girth, zone, girth);
        let color = rgb(randInt(130, 170), randInt(130, 170), Math.floor(zone * 255 / grid.zones));
        let r = Math.random();
        switch (zone) {
          case 1:
            if (r < 0.003) {
              let house = Symbol.genericSymbol({char, type, pos, size, color});
              this.buildings.push(house);
              grid.add(house);
            }
            break;
          case 2:
            if (r < 0.007) {
              let house = Symbol.genericSymbol({char, type, pos, size, color});
              this.buildings.push(house);
              grid.add(house);
            }
            break;
          case 4:
            if (r < 0.02) {
              let house = Symbol.genericSymbol({char, type, pos, size, color});
              this.buildings.push(house);
              grid.add(house);
            }
            break;
          case 5:
            if (r < 0.04) {
              let house = Symbol.genericSymbol({char, type, pos, size, color});
              this.buildings.push(house);
              grid.add(house);
            }
            break;
          case 3:
            break;
          default:
        }
        if (zone === 3) {
          continue;
        }
      }
    }
    return this.buildings;
  }

  genGround(sym) {
    let groundShape = new Shape('plane', v3(), v3(this.sizex,this.sizey,1), v3(90,0,0), rgb(3, 105, 32));
    let groundSymbol = new Symbol('G', groundShape);
    return groundSymbol;
  }

  genRoof(sym) {
    let { char, shape: {type, pos, size, rot, color}, iter } = sym;
    let { zone } = this.grid.get(pos.x, pos.z);
    let newType = randChoice(ROOF_TYPES);
    let newSize = size.clone();
    let newColor = rgb(color.r + 60, color.g + 60, color.b + 60);
    let newPos = v3(0,size.y / 2, 0).add(pos);
    if (zone >= 3) {
      newType = 'box';
      newSize = v3(0.8 * size.x, 0.3, 0.8 * size.z);
      newPos = v3(0, size.y, 0).add(pos);
    }
    let roofShape = new Shape(newType, newPos, newSize, rot, newColor);
    let roofSymbol = new Symbol('R', roofShape, iter + 1);
    return roofSymbol;
  }

  genWindows(sym) {
    let { char, shape: {type, pos, size, rot, color}, iter } = sym;
    let shape, symbol, newPos, windows = [];
    let numWindows = this.grid.get(pos.x, pos.y).zone;

    for (let i = 0; i < numWindows; i++) {
      newPos = v3(randSign() * size.x / 2, randRange(0.3,0.8) * size.y, randRange(-0.3,0.3) * size.z).add(pos);
      shape = new Shape('window', newPos, v3(0.0022,0.0018,0.0022), rot, rgb(255,255,255));
      symbol = new Symbol('W', shape, iter + 1);
      windows.push(symbol);

      newPos = v3(randRange(-0.3,0.3) * size.x, randRange(0.3,0.8) * size.y, randSign() * size.z / 2).add(pos);
      shape = new Shape('window', newPos, v3(0.0022,0.0018,0.0022), v3(0,90,0).add(rot), rgb(255,255,255));
      symbol = new Symbol('W', shape, iter + 1);
      windows.push(symbol);
    }

    return windows;
  }

  genDoor(sym) {
    let { char, shape: {type, pos, size, rot, color}, iter } = sym;
    let shape, symbol, newPos;

    newPos = v3(randSign() * size.x / 2, 0, randRange(-0.4,0.4) * size.z).add(pos);
    shape = new Shape('door', newPos, v3(.2,.2,.2), v3(0,90,0).add(rot), rgb(255,255,255));
    symbol = new Symbol('D', shape, iter + 1);

    return symbol;
  }

  createTrees() {
    let trees = [];
    for (let i = -this.sizex / 2 + 5; i < this.sizex / 2 - 5; i++) {
      for (let j = -this.sizey / 2 + 5; j < this.sizey / 2 - 5; j++) {
        let { zone } = this.grid.get(i,j);
        let r = Math.random();

        let nothingNear = this.grid.neighbors(i,j,3).filter((n) => {
          return n.shape.type === 'box';
        }).length === 0;
        switch (zone) {
          case 1:
            if (r < 0.04 && nothingNear) {
              let tree = this.genTree(i, j);
              trees.push(tree);
            }
            break;
          case 2:
            if (r < 0.04 && nothingNear) {
              let tree = this.genTree(i, j);
              trees.push(tree);
            }
            break;
          case 3:
            if (r < 0.4 && nothingNear) {
              let tree = this.genTree(i, j);
              trees.push(tree);
            }
            break;
        }
      }
    }
    return trees;
  }

  createGridRoads() {
    this.roads = [];

    // generate driveways
    this.buildings.forEach((building) => {
      let { char, shape: {type, pos, size, rot, color}, iter } = building;
      let cell = this.grid.get(pos.x, pos.z);
      let neighbors = this.grid.neighbors(pos.x, pos.y, 3);
      let roads = neighbors.filter((n) => {
        return n.char === 'O';
      });
      if (!roads.length) {
        let startPos = pos;
        let endPos = randChoice([v3(size.x,0,0), v3(-size.x,0,0), v3(0,0,size.z), v3(0,0,-size.z)]).add(pos)
        let road = this.genRoad(pos, endPos);
        this.roads.push(road);
      }
    });
    let unconnected = this.buildings.slice();
    // connect all roads
    let closest, ms = Infinity;
    while (unconnected.length > 0) {
      let b = unconnected.pop();
      this.roads.forEach((r) => {
        let s = Math.abs(b.shape.pos.x - r.shape.pos.x) + Math.abs(b.shape.pos.y - r.shape.pos.y);
        if (s < ms) {
          closest = r;
          ms = s;
        }
      });
      this.roads.push(this.genRoad(b.shape.pos, closest.shape.pos));
    }


    return this.roads;
  }

  // stochastic initialization, convex optimization
  createRoadsConvex(numRoads) {
    let roads = [];
    let points = [];
    let scores = [];
    let min = -100, max = 100, size = max - min, maxEdges = 2;
    for (let i = 0; i < numRoads; i++) {
      let np = randChoice([
        v3(randRange(min, max), 0, 0),
        v3(0, 0, randRange(min, max))
      ]);
      np.edges = 0; // hacky
      points.push(np);
    }

    let score = (a, b) => {
      let diff = v3().subVectors(a,b);
      let dist = diff.length();
      let angle = Math.atan(diff.z / diff.x) * 180 / Math.PI;
      let w = [100,-10,1000];
      let f = [];
      f[0] = dist / size;
      f[1] = Math.min(Math.abs(90 - angle), Math.abs(0 - angle));
      f[2] = a.edges + b.edges;

      return dot(w,f);
    }

    for (let i = 0; i < numRoads; i++) {
      scores[i] = {};
      for (let e = 0; e < numRoads; e++) {
        for (let j = 0; j < numRoads; j++) {
          if (i === j) {
            continue;
          }
          let s = score(points[i], points[j]);
          scores[i][`${s}`] = j;
        }
        let connectTo = points[scores[i][Math.max(...Object.keys(scores[i]))]];
        connectTo.edges++;
        points[i].edges++;
        roads.push(this.genRoad(points[i], connectTo));
      }
    }
    return roads;
  }

  createRoadsGenerative(numRoads) {
    let roads = [];
    let min = -50;
    let max = 50;
    let pos = v3(randRange(min, max), 0, randRange(min, max));
    let dir = randChoice([0,45,90,135,180,225,270,315]) + randRange(-10,10);
    let len = randRange(25, 50);
    roads.push(this.genRoad2(pos, len, dir));
    for (let i = 0; i < numRoads; i++) {
      // pos = v(randRange(10, 30)).multiplyScalar(dir).add(pos);
      pos = v3(1, 0, Math.tan(dir * Math.PI / 180)).normalize().multiplyScalar(randRange(10,len)).add(pos);
      dir = randChoice([0,45,90,135,180,225,270,315]) + randRange(-10,10);
      len = randRange(25, 50);
      roads.push(this.genRoad2(pos, len, dir));
    }
    return roads;
  }

  genTree(px, pz) {
    let newType = randChoice(TREE_TYPES);
    let newSize = v3(0.4,randRange(0.3,0.6),0.4);
    let treeShape = new Shape(newType, v3(px,0,pz), newSize, v3(), rgb(44, 68, 0));
    let treeSymbol = new Symbol('E', treeShape);
    return treeSymbol;
  }

  genRoad(a, b) {
    // let { char, shape: {type, pos, size, rot, color}, iter } = this;
    let shape, symbol;
    let diff = v3().subVectors(a,b);
    let dist = diff.length();
    let newPos = v3(0.5,0.5,0.5).multiply(v3().addVectors(a,b));
    let newRot = v3(0,Math.atan2(diff.z, diff.x) * 180 / Math.PI,0);
    let newSize = v3(dist, 0.01, 0.5);
    shape = new Shape('box', newPos, newSize, newRot, rgb(15,15,15));
    symbol = new Symbol('O', shape, 0);
    return symbol;
  }

  genRoad2(pos, len, dir) {
    // let { char, shape: {type, pos, size, rot, color}, iter } = this;
    let shape, symbol;
    shape = new Shape('box', pos, v3(0.5, 0.01, len), v3(0,dir,0), rgb(15,15,15));
    symbol = new Symbol('O', shape, 0);
    return symbol;
  }

  doIterations(numIters) {
    if (this.cache[numIters]) {
      return this.cache[numIters];
    }
    let nextState = [];
    this.doIterations(numIters - 1).forEach((sym) => {
      let successors = this.applyGrammar(sym);
      if (successors) {
        nextState.push(...successors);
      }
    });
    return nextState;
  }

  copyState() {
    return this.state.map((sym) => {
      return sym.copy();
    });
  }

  _clearCache() {
    this.cache = {
      0: this.axiom
    };
  }
}
