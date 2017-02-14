const THREE = require('three');
import { Node } from './linkedlist'

export function Rule(prob, func) {
	this.probability = prob; 
	this.getSuccessors = func;
}

const terminalRule = (node, ref) => {
	node.terminate();
	var set = new Set();
	set.add(node);
	return set;
};

const PI = 3.14159263;

// TODO: pass in iteration # when creating new nodes
export const GrammarRules = 
{
	'GROUND_FLOOR_APT': [ // Apartment buildings
		new Rule(1, (node, ref) => { 
			var set = new Set();
			var big = new Node('FLOOR_APT');
			var little = new Node('FLOOR_APT');
			var nodeBox = ref[node.shape].obj.bbox.getSize();

			var n = Math.floor(((Math.random() * 4) % 4));
			var angle = n * Math.PI / 2;
			node.rotation.y += angle;

			var zScale = Math.random() * 0.6 + 0.2;
			var xScale = Math.random() * 0.6 + 0.2;

			big.scale.set(
				node.scale.x,
				node.scale.y,
				node.scale.z * zScale);

			big.rotation.set(
				node.rotation.x,
				node.rotation.y,
				node.rotation.z);

			big.position.set(
				node.position.x,
				node.position.y,
				node.position.z + nodeBox.z / 2 * zScale);

			little.scale.set(
				node.scale.x * xScale,
				node.scale.y,
				node.scale.z * (1 - zScale));

			little.rotation.set(
				node.rotation.x,
				node.rotation.y,
				node.rotation.z);

			little.position.set(
				node.position.x + nodeBox.x / 2 * (1 - xScale),
				node.position.y,
				node.position.z - nodeBox.z / 2 * (1 - zScale - 0.1));

			set.add(big);
			set.add(little);
			return set;
		}),
	],
	'FLOOR_APT' :[
		new Rule(0.9, (node, ref) => { //Grow upwards
			node.terminate();
			var set = new Set();
			var floor = new Node('FLOOR_APT');

			var nodeBox = ref[node.shape].obj.bbox.getSize();
			var fBox = ref['FLOOR_APT'].obj.bbox.getSize();

			floor.position.set(
				node.position.x,
				node.position.y + nodeBox.y,
				node.position.z);

			floor.rotation.set(
				node.rotation.x,
				node.rotation.y,
				node.rotation.z);

			floor.scale.set(
				node.scale.x,
				node.scale.y,
				node.scale.z);

			set.add(node);
			set.add(floor);
			return set;
		}),
		new Rule(0.001, terminalRule)
	],
	'GROUND_FLOOR_SKY':[
		//TODO: add rule to replace this with shops n stuff ?? 
		new Rule(1, (node, ref) => {
			node.terminate();
			var set = new Set();
			var floor = new Node('FLOOR_SKY');

			floor.position.set(
				node.position.x,
				node.position.y,
				node.position.z);

			floor.rotation.set(
				node.rotation.x,
				node.rotation.y,
				node.rotation.z);

			var scale = Math.random() + 1;

			floor.scale.set(
				node.scale.x * scale,
				node.scale.y,
				node.scale.z * scale);

			set.add(floor);
			return set;
		}),	
	],
	'FLOOR_SKY': [
		new Rule(0.80, (node, ref) => { //Grow upwards
			node.terminate();
			var set = new Set();
			var floor = new Node('FLOOR_SKY');

			var nodeBox = ref[node.shape].obj.bbox.getSize();
			var fBox = ref['FLOOR_SKY'].obj.bbox.getSize();

			floor.position.set(
				node.position.x,
				node.position.y + nodeBox.y,
				node.position.z);

			floor.rotation.set(
				node.rotation.x,
				node.rotation.y,
				node.rotation.z);

			floor.scale.set(
				node.scale.x,
				node.scale.y,
				node.scale.z);

			set.add(node);
			set.add(floor);
			return set;
		}),
		new Rule(0.07, (node, ref) => { //Get smaller
			node.terminate();
			var set = new Set();
			var floor = new Node('FLOOR_SKY');

			var nodeBox = ref[node.shape].obj.bbox.getSize();
			var fBox = ref['FLOOR_SKY'].obj.bbox.getSize();

			floor.position.set(
				node.position.x,
				node.position.y + nodeBox.y,
				node.position.z);

			floor.scale.set(
				node.scale.x * 0.9,
				node.scale.y,
				node.scale.z * 0.9);


			set.add(node);
			set.add(floor);
			return set;
		}),
		new Rule(0.001, terminalRule)
	]
}