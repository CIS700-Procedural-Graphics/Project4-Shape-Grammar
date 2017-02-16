import { Symbol, Shape } from './Symbol';

const THREE = require('three');
const v3 = (x, y, z) => { return new THREE.Vector3(x, y, z); };
const WHITE = rgb(255, 255, 255);
const BLACK = rgb(0, 0, 0);

function rgb(r, g, b) {
  return {r, g, b};
}


export class Rule {
  constructor(prob, symbol) {
    this.prob = prob;
    this.symbol = symbol;
  }
}

export default class LSystem {
  constructor(axiom, grammar) {
    this.axiom = this._parseAxiom(axiom);
    // this.grammar = this._parseGrammar(grammar);

    if (window.mode === window.DEBUGGING) {
      // let box = new Shape('box', v3(0, 0, 0), v3(2, 1, 2), v3(0, 0, 0), WHITE);
      // let symbol = new Symbol('H', box);
      let building = Symbol.genericSymbol({char: 'B', type: 'box'});
      this.axiom = [
        building,
        Symbol.genGround(),
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
      // Ground Rule: G -> O*
      case 'G':
        successors.push(symbol.copy());
        break;
      case 'O':
        break;
      // Building Rule: B -> (B 0.25|BB 0.75), b when terminal
      case 'B':
        successors.push(...symbol.subBuilding());
        break;
      // Terminal Building Rule: b -> bRWD
      case 'b':
        successors.push(symbol.copy());
        successors.push(symbol.genRoof());
        successors.push(symbol.genWindows());
        // successors.push(symbol.genDoor())
        break;
      // Terminal Roof Rule
      case 'R':
        break;
      default:
    }
    return successors;
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
