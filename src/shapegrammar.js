class Rule {
	constructor(prob, succ) {
		this.probability = prob;
		this.successor = succ;
	}
}

export default class ShapeGrammar {
	constructor() {
		this.grammar = {};
    this.grammar['U'] = [
      new Rule(0.3, 'N'),
      new Rule(0.3, 'S'),
      new Rule(0.2, 'E'),
      new Rule(0.2, 'W')
    ]
		this.grammar['M'] = [
			new Rule(0.25, 'N'),
      new Rule(0.25, 'S'),
      new Rule(0.25, 'E'),
      new Rule(0.25, 'W')
		]
    this.grammar['D'] = [
      new Rule(0.3, 'N'),
      new Rule(0.3, 'S'),
      new Rule(0.2, 'E'),
      new Rule(0.2, 'W')
    ]
    this.grammar['P'] = [
      new Rule(0.33, '1'),
      new Rule(0.33, '2'),
      new Rule(0.33, '3')
    ]
    // the below two grammars are parent dependant! 
    // this one builds a garden on top of a sky scraper (LUXURIOUS MIDTOWN)
    this.grammar['S'] = [
      new Rule(0.50, 'G'),
      new Rule(0.50, 'F')
    ]
    // this one makes water towers on top of a loft (SOHO)
    this.grammar['L'] = [
      new Rule(0.8, 'T'),
      new Rule(0.2, 'F')
    ]
    // this one makes water towers on top of a brownstone (UPTOWN)
    this.grammar['B'] = [
      new Rule(0.25, 'T'),
      new Rule(0.75, 'F')
    ]
 	}
}