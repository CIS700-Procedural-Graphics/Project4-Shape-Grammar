import { Symbol, Shape } from './Symbol';

const THREE = require('three');

export class Rule {
  constructor(prob, symbol) {
    this.prob = prob;
    this.symbol = symbol;
  }
}

export default class LSystem {
  constructor(axiom, grammar) {
    this.axiom = this._parseAxiom(axiom);
    this.grammar = this._parseGrammar(grammar);
    this.state = this.axiom.map((sym) => {
      return sym.copy();
    }); // deep copy
    this.cache = {
      0: this.axiom
    };
  }

  doIterations(numIters) {
    if (cache[numIters]) {
      return cache[numIters];
    }
    let newState = [];
    this.doIterations(numIters - 1).forEach((sym) => {
      newState.push(sym.next());
    });
    return newState;
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
    let shape = new Shape('cube', new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
    axiom.push(new Symbol('F', shape, ''));
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
