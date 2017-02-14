// import { Node } from './linkedlist'
import { Rule, GrammarRules } from './rules'

export default class ShapeGrammar {
  constructor (initial_set, iterations) {
    this.grammar = GrammarRules;
    this.shapeSet = new Set();

    if (initial_set) {
      initial_set.forEach((s) => this.shapeSet.add(s));
    }

    this.iterations = iterations ? iterations : 4; // Defaults to 4 iters
  }


  /**
   * Picks grammar rule based on probabilities
   */
  pickRule(rules) {
    var rand = Math.random(); 
    var loBound, hiBound;

    for (var j = 0; j < rules.length; j++) {
      var pr = rules[j].probability;
      if (j === 0) {
        loBound = 0;
        hiBound = pr;
      } else {
        loBound = hiBound;
        hiBound += pr;
      }

      if (rand >= loBound && rand <= hiBound) { 
        return rules[j];
      }
    }

    return false;
  }

  
  /**
   * Expands the ShapeGrammar's initial geometry
   * for the given number of iterations
   */
  doIterations(iterations, GeometryRef) { 
    var succ = new Set();

    for (var i = 0; i < iterations; i++) {
      this.shapeSet.forEach((node) => {
        if (!node.terminal) {
          var rules = this.grammar[node.shape];
          var rule = rules ? this.pickRule(rules) : false;

          if (rule) {
            var successors = rule.getSuccessors(node, GeometryRef); // Apply rule
            this.shapeSet.delete(node); // Delete old shape
            successors.forEach((s) => succ.add(s)); // Add new ones
          }
         }
      });
      succ.forEach((n) => this.shapeSet.add(n));  
    }
    return this.shapeSet;
  }
}