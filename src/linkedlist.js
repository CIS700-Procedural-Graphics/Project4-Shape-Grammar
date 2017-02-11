const THREE = require('three'); 

const Geometry = {
	WINDOW_WALL:'',
	WINDOWLESS_WALL: '',
	ROOF: '',
	TALL_HOUSE: '', // for test 
	SHORT_HOUSE: './../assets/window_house.obj', // for test
	TOWER: './../assets/tall_tower.obj', // for test
}

export class Node {
	constructor(symbol, iter) {
		this.symbol = symbol;
		this.prev = null;
		this.next = null;
		this.scale = new THREE.Vector3(1, 1, 1);
		this.position = new THREE.Vector3(0, 0, 0);
		this.rotation = new THREE.Vector3(0, 0, 0);
		this.terminal = false;

		this.geometryType = Geometry.SHORT_HOUSE;
		
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