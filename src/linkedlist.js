const THREE = require('three');

export class Node {
	constructor(shape, iter) {
		this.scale = new THREE.Vector3(1, 1, 1);
		this.position = new THREE.Vector3(0, 0, 0);
		this.rotation = new THREE.Vector3(0, 0, 0);
		this.terminal = false;
		this.maxHeight = 5;
		this.shape = shape ? shape : 'GROUND_FLOOR_APT';
		this.iteration = iter ? iter : 0;		
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

