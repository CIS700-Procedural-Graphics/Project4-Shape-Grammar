import { Symbol, Shape } from './Symbol';
import { v3, rgb, randSign, upperRand, randRange, randChoice } from './Utils'

const THREE = require('three');
const WHITE = rgb(255, 255, 255);
const BLACK = rgb(0, 0, 0);

class Grid {
  constructor() {
    this.grid = {};
  }

  add(a, b, o) {
    this.grid[`${a},${b}`] = o;
  }

  addSym(sym) {
    let p = sym.shape.pos;
    this.grid[`${p.x},${p.z}`] = sym;
  }

  get(a, b) {
    return this.grid[`${a},${b}`];
  }

  remove(a, b) {
    delete this.grid[`${a},${b}`];
  }

  clear() {

  }
}

export default class LSystem {
  constructor(axiom, grammar) {
    this.axiom = this._parseAxiom(axiom);
    this.grid = new Grid();
    // this.grammar = this._parseGrammar(grammar);

    if (window.mode === window.DEMO) {
      // let box = new Shape('box', v3(0, 0, 0), v3(2, 1, 2), v3(0, 0, 0), WHITE);
      // let symbol = new Symbol('H', box);
      let building = Symbol.genericSymbol({char: 'B', type: 'box'});
      let ground = Symbol.genGround();
      this.axiom = [
        building,
        ground,
        Symbol.genRoad(v3(-1,0,-1), v3(1,0,1))
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
    this.grid.addSym(symbol);
    switch (char) {
      // Ground Rule: G -> O*
      case 'G':
        successors.push(symbol.copy());
        break;
      case 'O':
        successors.push(symbol.copy());
        break;
      // Building Rule: B -> (B 0.25|BB 0.75)D, b when terminal
      case 'B':
        successors.push(...symbol.subBuilding());
        successors.push(symbol.genDoor())
        break;
      // Terminal Building Rule: b -> bRWWWD
      case 'b':
        successors.push(symbol.copy());
        successors.push(symbol.genRoof());
        successors.push(...symbol.genWindows());
        break;
      // Terminal Roof Rule
      case 'R':
        break;
      case 'D':
        successors.push(symbol.copy());
        break;
      default:
    }
    return successors;
  }

  createRoads() {
    let roads = [];
    let points = [];
    let min = -100, max = 100;
    for (let i = 0; i < 10; i++) {
      points.push(v3(randRange(-100, 100), 0, randRange(-100, 100)));
    }

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

  updateAxiom(axiom) {
    this.axiom = axiom;
    this._clearCache();
  }

  updateGrammar(grammar) {
    this.grammar = grammar;
    this._clearCache();
  }

  _clearCache() {
    this.cache = {
      0: this.axiom
    };
  }

  _parseAxiom(a) {
    if (typeof a !== 'string') {
      return a;
    }
    let axiom = [];
    //TODO: parse the axioms...
    // let shape = new Shape('cube', new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
    // axiom.push(new Symbol('F', shape, ''));
    return axiom;

  }

  _parseGrammar(g) {
    if (typeof grammar !== 'string') {
      return grammar;
    }
    if (grammar === '') {
      return {};
    }
    let grammar = {};
    let rules = g.split('\n');
    rules.map((rule) => {
      let [lvalue, rvalue] = rule.split('=>');
      let [rsym, prob] = lvalue.split(',');
      rsym = rsym.trim();
      prob = prob.trim();
      rvalue = rvalue.trim();
      if (!grammar[rsym]) {
        grammar[rsym] = [
          new Rule(parseFloat(prob), rvalue)
        ];
      } else {
        grammar[rsym].push(new Rule(parseFloat(prob), rvalue));
      }
    });
    return this._normalize(grammar);

  }

  _normalize(g) {
    for (let key in g) {
      let sum = 0;
      let rules = g[key];
      for (let i = 0; i < rules.length; i++) {
        sum += rules[i].prob;
      }
      for (let i = 0; i < rules.length; i++) {
        rules[i].prob /= sum;
      }
    }
    return g;
  }

}
