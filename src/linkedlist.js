export default class LinkedList {
	constructor() {
		this.head = null;
		this.tail = null;
	};

	// Pushes node with value into the LL
	push(value) {
		var node = {
			value: value,
			next: null,
			prev: null
		}

		if (this.head === null) {
			// First element
			this.head = node;
			this.tail = node;
		} else {
			// Add to end of list
			node.prev = this.tail;
			this.tail.next = node;
			this.tail = node; // Update tail
		}
	};

	// Pops node off of the LL
	pop() {
		// 0 Elements
		if (this.head === null) {
			return null;
		}

		// 1 Element
		else if (this.tail === this.head) {
			var node = this.head;
			
			this.head = null;
			this.tail = null;

			return node;
		}

		// 2+ Elements
		else {
			var node = this.tail;
			this.tail = this.tail.prev;
			this.tail.next = null;

			return node;
		}
	};

	// Returns a string version of the LL
	toString() {
		if (this.head === null) {
			return '';
		} else {
			var curr = this.head;
			var result = '';

			while (curr !== null) {
				result += curr.value;
				curr = curr.next;
			}

			return result;
		} 
	};

	// Clones the LL
	clone() {
		return JSON.parse(JSON.stringify(this));
	};
}

