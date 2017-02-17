// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.stringToLinkedList = stringToLinkedList;
exports.linkedListToString = linkedListToString;
exports['default'] = Lsystem;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function Rule(prob, str) {
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.successorString = str; // The string that will replace the char that maps to this Rule
}

var ListNode = function ListNode(data) {
	_classCallCheck(this, ListNode);

	this.prev = null;
	this.next = null;
	this.data = data;
};

exports.ListNode = ListNode;

var LinkedList = (function () {
	function LinkedList() {
		_classCallCheck(this, LinkedList);

		this.head = null;
		this.tail = null;
	}

	// TODO: Turn the string into linked list

	_createClass(LinkedList, [{
		key: 'add',
		value: function add(node) {

			if (!this.tail) {
				this.head = node;
				this.tail = node;

				return;
			}

			node.prev = this.tail;
			this.tail.next = node;
			this.tail = node;
		}
	}, {
		key: 'addFront',
		value: function addFront(node) {
			var n = this.head;

			this.head = node;
			node.next = n;
			n.prev = node;
		}
	}, {
		key: 'addBack',
		value: function addBack(node) {
			var n = this.tail;

			this.tail = node;
			n.next = node;
			node.prev = n;
		}
	}, {
		key: 'addAt',
		value: function addAt(index, node) {
			var n = this.head;
			var i = 0;
			var size = this.size();

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
					var prev = n.prev;
					var next = n;

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
	}, {
		key: 'removeFront',
		value: function removeFront() {
			var n = this.head;

			this.head = n.next;
			this.head.prev = null;
		}
	}, {
		key: 'removeBack',
		value: function removeBack() {
			var n = this.tail;

			this.tail = n.prev;
			this.tail.next = null;
		}
	}, {
		key: 'removeAt',
		value: function removeAt(index) {
			var n = this.head;
			var i = 0;
			var size = this.size();

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
					var prev = n.prev;
					var next = n.next;

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
	}, {
		key: 'getAt',
		value: function getAt(index) {
			var n = this.head;
			var i = 0;

			while (n) {
				if (i == index) {
					return n.data;
				}

				n = n.next;
				i++;
			}

			throw new Error('Unable to get node at this index');
		}
	}, {
		key: 'clear',
		value: function clear() {
			this.head = null;
			this.tail = null;
		}
	}, {
		key: 'size',
		value: function size() {
			var n = this.head;
			var i = 0;

			while (n) {
				i++;
				n = n.next;
			}

			return i;
		}
	}, {
		key: 'print',
		value: function print() {
			var n = this.head;
			var ret = [];

			while (n) {
				ret.push(n.data);
				n = n.next;
			}

			return ret;
		}
	}]);

	return LinkedList;
})();

exports.LinkedList = LinkedList;

function stringToLinkedList(input_string) {
	// ex. assuming input_string = "F+X"
	// you should return a linked list where the head is
	// at Node('F') and the tail is at Node('X')
	var ll = new LinkedList();
	return ll;
}

// TODO: Return a string form of the LinkedList

function linkedListToString(linkedList) {
	// ex. Node1("F")->Node2("X") should be "FX"
	var result = "";
	return result;
}

// TODO: Given the node to be replaced,
// insert a sub-linked-list that represents replacementString
function replaceNode(linkedList, node, replacementString) {}

function Lsystem(axiom, grammar, iterations) {
	// default LSystem
	this.axiom = "FX";
	this.grammar = {};
	this.grammar['X'] = [new Rule(1.0, '[-FX][+FX]')];
	this.iterations = 0;

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
	this.updateAxiom = function (axiom) {
		// Setup axiom
		if (typeof axiom !== "undefined") {
			this.axiom = axiom;
		}
	};

	// TODO
	// This function returns a linked list that is the result
	// of expanding the L-system's axiom n times.
	// The implementation we have provided you just returns a linked
	// list of the axiom.
	this.doIterations = function (n) {
		var lSystemLL = StringToLinkedList(this.axiom);
		return lSystemLL;
	};
}