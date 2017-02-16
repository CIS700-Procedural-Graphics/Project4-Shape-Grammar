class Rule {
	constructor(prob, succ) {
		this.probability = prob;
		this.successor = succ;
	}
}

export default class ShapeGrammar {
	constructor() {
		this.grammar = {};
		this.grammar['M'] = [
			new Rule(1.0, 'MM')
		]
	}

	expand() {
		var shape_ll = stringToLinkedList(this.initial_state);
		for (var i = 0; i < this.iterations; i++) {
			var curr = shape_ll.head;
			while (curr !== undefined) {
				var sym = curr.symbol;
				if (this.grammar[sym]) {
					var rand = Math.rand();
					var sum = 0;
					var successor_str;
					for (var i = 0; i < this.grammar[sym].length; i++) {
						var rule = this.grammar[sym][i];
						sum += rule.probability;
						if (sum >= rand) {
							successor_str = rule.successor;
							break;
						}
					}
					var old_next = curr.next;
					replaceShapeNode(shape_ll, curr, successor_str);
					curr = old_next;
				}
				else {
					curr = curr.next;
				}
			}
		}
		return shape_ll;
	}
}