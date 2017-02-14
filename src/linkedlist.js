const THREE = require('three');

export class Node {
	constructor(shape, iter) {
		this.prev = null;
		this.next = null;
		this.scale = new THREE.Vector3(1, 1, 1);
		this.position = new THREE.Vector3(0, 0, 0);
		this.rotation = new THREE.Vector3(0, 0, 0);
		this.terminal = false;
		// this.id = (new Date()).getTime();


		if (shape) {
			this.shape = shape;
		} else {
			this.shape = 'GROUND_FLOOR';
		}

		if(iter) {
			this.iteration = iter;
		} else {
			this.iteration = 0;
		}
	}

	setPrev(prev) {
		this.prev = prev;
	}

	setNext(next) {
		this.next = next;
	}

	setIteration(iter) {
		this.iter = iter;
	}

	terminate() {
		this.terminal = true;
	}
}

export class LinkedList {
	constructor() {

	}

	addNode(node) {
		if (this.tail) {
			this.tail.setNext(node);
			node.setPrev(this.tail);
			node.setNext(null);
			this.tail = node;
		} else {
			this.head = node;
			this.tail = node;
		}
	}
}

export default {
	Node: Node,
	LinkedList: LinkedList
}

