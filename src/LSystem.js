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
      this.axiom = [
        Symbol.genGround(),
        Symbol.genHouse('H'),
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

  doIterations(numIters) {
    if (this.cache[numIters]) {
      return this.cache[numIters];
    }
    let nextState = [];
    this.doIterations(numIters - 1).forEach((sym) => {
      // sym.next().forEach((nextSym) => {
      //   nextState.push(nextSym);
      // });
      let successors = this.applyGrammar(sym);
      if (successors) {
        successors.forEach((ns) => {
          nextState.push(ns);
        });
      }
    });
    return nextState;
  }

  applyGrammar(symbol) {
    let { char, shape: {pos, size, rot, color}, iter } = symbol;
    let random = Math.random();
    let successors = [];
    switch (char) {
      // Ground
      case 'G':
        successors.push(Symbol.genGround());
        break;
      // House Rule: H -> HR(T|H)
      case 'H':
        successors.push(symbol.copy());
        if (random < 0.1) {
          successors.push(Symbol.genHouse('H', symbol, {nextLevel: true}));
        } else {
          successors.push(Symbol.genRoof(symbol));
        }
        if (random < 0.1) {
          successors.push(Symbol.genHouse('H', symbol));
        }
        break;
      // Terminal Symbols
      case 'R':
      case 'T':
        break;
    }
    return successors;
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
