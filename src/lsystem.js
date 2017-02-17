// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
	this.probability = prob;
	this.successorString = str;
}

export class ListNode {
	constructor(data) {
		this.prev = null;
		this.next = null;
		this.data = data;
	}
}

export class LinkedList {
	constructor() {
		this.head = null;
		this.tail = null;
	}

	add(node) {

		if (!this.tail) {
			this.head = node;
			this.tail = node;

			return;
		}

		node.prev = this.tail;
		this.tail.next = node;
		this.tail = node;
	}

	addFront(node) {
		let n = this.head;

		this.head = node;
		node.next = n;
		n.prev = node;
	}

	addBack(node) {
		let n = this.tail;

		this.tail = node;
		n.next = node;
		node.prev = n;
	}

	addAt(index, node) {
		let n = this.head;
		let i = 0;
		let size = this.size();

		if (index == 0) {
			this.addFront(node);
			return;
		}

		if (index == size) {
			this.addBack(node);
			return;
		}

		while (n) {
			if (i == index) {
				let prev = n.prev;
				let next = n;

				if (prev) {
					prev.next = node;
				}

				node.prev = prev;
				node.next = next;

				if (next) {
					next.prev = node;
				}

				return;
			}

			n = n.next;
			i++;
		}

		throw new Error('Unable to add node at this index');
	}

	removeFront() {
		let n = this.head;

		this.head = n.next;
		this.head.prev = null;
	}

	removeBack() {
		let n = this.tail;

		this.tail = n.prev;
		this.tail.next = null;
	}

	removeAt(index) {
		let n = this.head;
		let i = 0;
		let size = this.size();

		if (index == 0) {
			this.removeFront();
			return;
		}

		if (index == size) {
			this.removeBack();
			return;
		}

		while (n) {
			if (i == index) {
				let prev = n.prev;
				let next = n.next;

				if (prev) {
					prev.next = next;
				}

				if (next) {
					next.prev = prev;
				}

				return;
			}

			n = n.next;
			i++;
		}

		throw new Error('Unable to remove node at this index');
	}

	getAt(index) {
		let n = this.head;
		let i = 0;

		while (n) {
			if (i == index) {
				return n.data;
			}

			n = n.next;
			i++;
		}

		throw new Error('Unable to get node at this index');
	}

	clear() {
		this.head = null;
		this.tail = null;
	}

	size() {
		let n = this.head;
		let i = 0;

		while (n) {
			i++;
			n = n.next;
		}

		return i;
	}

	print() {
		let n = this.head;
		let ret = [];

		while (n) {
			ret.push(n.data);
			n = n.next;
		}

		return ret;
	}

	fromString(input) {
		let arr = input.split('');

		for (let i = 0; i < arr.length; i++) {
			let n = new ListNode(arr[i]);
			this.add(n);
		}
	}

	toString() {
		return this.print().join('');
	}
}

// Turn the string into linked list
export function StringToLinkedList(input_string) {
	var ll = new LinkedList();
	ll.fromString(input_string);

	return ll;
}

// Return a string form of the LinkedList
export function LinkedListToString(linkedList) {
	var result = linkedList.toString();

	return result;
}

// Replace node with the nodes generated from rules
function replaceNode(linkedList, node, index, rules) {
	var ranges = [];
	var start = 0;

	// Convert the probabilities to ranges
	for (var i = 0; i < rules.length; i++) {
		var rule = rules[i];
		var prob = rule.probability;

		var range = {
			lo: start,
			hi: start + prob
		};

		ranges.push(range);
		start += prob;
	}

	var i = 0;
	var rand = Math.random() * start;

	// Choose a random number and select the corresponding range
	for (var i = 0; i < ranges.length; i++) {
		var range = ranges[i];

		if (rand >= range.lo && rand < range.hi) {
			break;
		}
	}

	var replace = rules[i].successorString;
	var arr = replace.split('');
	var next = node.next;
	var start = node;

	// Based on our rule selection, make the replacement.
	for (var i = 0; i < arr.length; i++) {
		var a = arr[i];
		var n = new ListNode(a);

		node.next = n;
		n.prev = node;

		node = n;
	}

	if (next) {
		node.next = next;
		next.prev = node;
	}

	linkedList.removeAt(index);

	return replace.length;
}

export default function Lsystem(axiom, grammar, iterations) {

	// Default LSystem
	this.axiom = 'FX';
	this.grammar = {};
	this.grammar['X'] = [
		new Rule(0.25, '[+F][>F<X>F<F]'),
		new Rule(0.25, '[<F][-F+X-F+F]'),
		new Rule(0.5, '[+F-X][-F]')
	];
	this.grammar['F'] = [
		new Rule(0.2, 'FFX'),
		new Rule(0.6, 'FLL'),
		new Rule(0.2, 'FOL')
	];
	this.iterations = 8;

	if (typeof axiom !== 'undefined') {
		this.axiom = axiom;
	}

	if (typeof grammar !== 'undefined') {
		this.grammar = Object.assign({}, grammar);
	}


	// Set up iterations (the number of times you
	// should expand the axiom in DoIterations)
	if (typeof iterations !== 'undefined') {
		this.iterations = iterations;
	}

	// A function to alter the axiom string stored
	// in the L-system
	this.UpdateAxiom = function(axiom) {
		if (typeof axiom !== 'undefined') {
			this.axiom = axiom;
		}
	}

	this.UpdateGrammar = function(grammar) {
		if (typeof grammar !== 'undefined') {
			this.grammar = Object.assign({}, grammar);
		}
	}

	// This function returns a linked list that is the result
	// of expanding the L-system's axiom n times.
	// The implementation we have provided you just returns a linked
	// list of the axiom.
	this.DoIterations = function(iterations) {
		var lSystemLL = StringToLinkedList(this.axiom);
		let i = 0;

		// For each iteration
	  while (i < iterations) {
			let n = lSystemLL.head;
			let next = n.next;
			let index = 0;

			// Iterate over every node in our linked list and replace
			// it if there exists a replacement rule.
			while (n) {
				let data = n.data;
				let rules = this.grammar[data];

				next = n.next;

				if (rules) {
					var len = replaceNode(lSystemLL, n, index, rules);
					index += (len - 1);
				}

				n = next;
				index++;
			}

			i++;
		}

		return lSystemLL;
	}
}