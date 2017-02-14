// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.successorString = str; // The string that will replace the char that maps to this Rule
}

// TODO: Implement a linked list class and its requisite functions
// as described in the homework writeup
function LinkedList() {
	this.head = undefined;
	this.tail = undefined;
}

function LinkedListNode() {
	this.character = '';
	this.prev = undefined;
	this.next = undefined;
}

// TODO: Turn the string into linked list
export function StringToLinkedList(input_string) {
	// ex. assuming input_string = "F+X"
	// you should return a linked list where the head is
	// at Node('F') and the tail is at Node('X')
	var ll = new LinkedList();

	var prev = undefined;
	for (var i = 0; i < input_string.length; i++) {
		var node = new LinkedListNode();
		node.character = input_string.charAt(i);
		node.prev = prev;
		if (prev) {
			prev.next = node;
		}
		prev = node;

		if (i == 0) {
			ll.head = node;
		}

		if (i == input_string.length - 1) {
			ll.tail = node;
		}
	}

	return ll;
}

// TODO: Return a string form of the LinkedList
export function LinkedListToString(linkedList) {
	// ex. Node1("F")->Node2("X") should be "FX"
	var temp = [];
	for (var node = linkedList.head; node != linkedList.tail; node = node.next) {
		temp.push(node.character);
	}
	var result = temp.join("");
	return result;
}

// TODO: Given the node to be replaced,
// insert a sub-linked-list that represents replacementString
function replaceNode(linkedList, node, replacementString) {
}

function pickRuleFromDistr(distribution) {
	var rules = [];
	var probs = [];
	for (var i = 0; i < distribution.length; i++) {
		rules.push(distribution[i].successorString);
		probs.push(distribution[i].probability);
	}
	var filtered = probs.filter(function(val) { return val > 0; });
	var minProb = Math.min.apply(null, filtered);
	var probs = probs.map(function(x) { return Math.round(x / minProb); });
	var cmlProbs = [];
	probs.reduce(function(a,b,i) { return cmlProbs[i] = a+b; }, 0);

	var r = Math.random() * cmlProbs[cmlProbs.length-1]-0.0000001; // ensure always less than max
	for (var i = 0; i < cmlProbs.length; i++) {
		if (r < cmlProbs[i]) {
			return rules[i];
		}
	}
	console.log("No Rules to pick from!");
}

export default function Lsystem(axiom, grammar, iterations) {
	// default LSystem
	this.axiom = "X";
	this.grammar = {};
	// this.grammar['X'] = [
	// 	new Rule(1.0, '[-FX][+FX]')
	// ];
	this.iterations = 0;
	this.expansions = {};

	// Set up the axiom string
	if (typeof axiom !== "undefined") {
		this.axiom = axiom;
	}

	// Set up the grammar as a dictionary that
	// maps a single character (symbol) to a Rule.
	if (typeof grammar !== "undefined") {
		this.grammar = Object.assign({}, grammar);
	}

	// Set up iterations (the number of times you
	// should expand the axiom in DoIterations)
	if (typeof iterations !== "undefined") {
		this.iterations = iterations;
	}

	// A function to alter the axiom string stored
	// in the L-system
	this.UpdateAxiom = function(axiom) {
		// Setup axiom
		if (typeof axiom !== "undefined") {
			this.axiom = axiom;
			this.expansions = {};
		}
	}

	this.UpdateRules = function(rules) {
		this.grammar = {};
		this.expansions = {};
		for (var i = 0; i < rules.length; i++) {
			var entry = rules[i];
			var prob = entry.Prob;
			var data = entry.Rule.replace(/\s/g, "").split("=");
			if (data.length == 2) {
				var symbol = data[0];
				var rule = data[1];
				var R = new Rule(prob, rule);
				if (!this.grammar[symbol]) {
					this.grammar[symbol] = [];
				}
				this.grammar[symbol].push(R);
			} else {
				console.log("Invalid Rule: " + i);
			}
		}
	}

	this.DoExpansion = function(n) {
		if (n < 0) {
			throw 'Invalid number of expansions!';
		}

		if (n == 0) {
			this.expansions[0] = this.axiom;
		} else if (!this.expansions[n]) {
			var prev = this.DoExpansion(n-1);
			var expsn = [];
			for (var i = 0; i < prev.length; i++) {
				var c = prev.charAt(i);
				if (this.grammar[c] && this.grammar[c].length > 0) {
					var r = pickRuleFromDistr(this.grammar[c]);
					expsn.push(r);
				} else {
					expsn.push(c);
				}
			}
			this.expansions[n] = expsn.join("");
		}
		return this.expansions[n];
	}

	// TODO
	// This function returns a linked list that is the result
	// of expanding the L-system's axiom n times.
	// The implementation we have provided you just returns a linked
	// list of the axiom.
	this.DoIterations = function(n) {
		if (!this.expansions[n]) {
			this.DoExpansion(n);
		}
		var lSystemLL = StringToLinkedList(this.expansions[n]);
		return lSystemLL;
	}
}
