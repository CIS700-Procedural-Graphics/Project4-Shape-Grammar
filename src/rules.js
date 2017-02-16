const THREE = require('three');
import { Node } from './linkedlist'
import { Geometry } from './main'


export function Rule(prob, func) {
	this.probability = prob; 
	this.getSuccessors = func;
}


const terminalRule = (node) => {
	node.terminate();
	var set = new Set();
	set.add(node);
	return set;
};


/**
 * Helper function that creates a new node with the given shape
 * and initializes its position, rotation, and scale to the oldNode
 */
function copyNodePos(oldNode, shape, iter) {
	var newNode = new Node(shape);
	newNode.position.set(
		oldNode.position.x,
		oldNode.position.y,
		oldNode.position.z);
	newNode.rotation.set(
		oldNode.rotation.x,
		oldNode.rotation.y,
		oldNode.rotation.z);
	newNode.scale.set(
		oldNode.scale.x,
		oldNode.scale.y,
		oldNode.scale.z);

	newNode.maxHeight = oldNode.maxHeight;
	newNode.iteration = iter;

	return newNode;
}


/**
 * Returns the bbox in terms of size for the given node
 * i.e. [width, height, length]
 */
function getBbox(node) {
	var box = Geometry[node.shape].obj.bbox.getSize();
	box.x *= node.scale.x;
	box.y *= node.scale.y;
	box.z *= node.scale.z;
	return box;
}


/**
 * Generates a rule that terminates the current node and adds 
 * a roofName on top 
 */
function roofRule(node, roofName, iter) {
	node.terminate();
	var set = new Set();
	var roof = copyNodePos(node, roofName, iter);

	roof.terminate();
	var nodeBox = getBbox(node);
	var roofBox = getBbox(roof);

	roof.position.y += nodeBox.y / 2 + roofBox.y /2;

	set.add(node);
	set.add(roof);
	return set;
}

function growUpwardsRule(node, shape, iter) {
	node.terminate();
	var set = new Set();
	var floor = copyNodePos(node, shape, iter);
	var nodeBox = getBbox(node);

	floor.position.y += nodeBox.y;

	set.add(node);
	set.add(floor);
	return set;

}


// TODO: pass in iteration # when creating new nodes ?
export const GrammarRules = 
{
	// ----------- Apartment buildings ------------- //
	'GROUND_FLOOR_APT': [ 
		new Rule(1, (node, iter) => { 
			var set = new Set();
			var big = copyNodePos(node, 'FLOOR_APT', iter);
			var little = copyNodePos(node, 'FLOOR_APT', iter);
			var nodeBox = getBbox(node);

			var n = Math.floor(((Math.random() * 4) % 4));
			var angle = n * Math.PI / 2;
			node.rotation.y += angle;

			var zScale = Math.random() * 0.6 + 0.2;
			var xScale = Math.random() * 0.6 + 0.2;

			big.scale.z *= zScale;	
			big.position.z += nodeBox.z / 2 * zScale

			little.scale.x *= xScale;
			little.scale.z *= (1 - zScale);
			little.position.x += nodeBox.x / 2 * (1 - xScale);
			little.position.z -= nodeBox.z / 2 * (1 - zScale - 0.1);

			set.add(big);
			set.add(little);
			return set;
		}),
	],
	'FLOOR_APT' :[
		new Rule(0.8, (node, iter) => { //Grow upwards
			if (node.position.y > node.maxHeight * Geometry['FLOOR_APT'].sizeRatio) {
				return roofRule(node, 'ROOF_APT', iter);
			} else {
				return growUpwardsRule(node, 'FLOOR_APT', iter);
			}
		}),
	],

	
	'GROUND_FLOOR_SKY':[ 
		//TODO: add rule to replace this with shops n stuff ?? 
		new Rule(1, (node, iter) => {
			node.terminate();
			var set = new Set();
			var floor = copyNodePos(node, 'FLOOR_SKY', iter);

			var scale = 1 * node.maxHeight/3;//Math.random() + 1;
			floor.scale.x *= scale;
			floor.scale.z *= scale;

			set.add(floor);
			return set;
		}),	
	],
	'FLOOR_SKY': [
		new Rule(0.8, (node, iter) => { //Grow upwards
			if (node.position.y > node.maxHeight * Geometry['FLOOR_SKY'].sizeRatio) {
				return roofRule(node, 'ROOF_SKY', iter);
			} else {
				return growUpwardsRule(node, 'FLOOR_SKY', iter);
			}
		}),
		new Rule(0.07, (node, iter) => { //Get smaller
			node.terminate();
			var set = new Set();
			var floor = copyNodePos(node, 'FLOOR_SKY', iter);

			var nodeBox = getBbox(node);
			floor.position.y += nodeBox.y;

			var scale = 0.9; 
			floor.scale.x *= scale;
			floor.scale.z *= scale;

			set.add(node);
			set.add(floor);
			return set;
		})
	],

	// ----------- Parks -------------
	'PARK': [
		new Rule(0.9, (node, iter) => {
			var set = new Set();
			var tree = copyNodePos(node, 'TREE', iter);
			var nodeBox = getBbox(node);
			tree.position.y += getBbox(tree).y / 2;
			var xOffset =  (Math.random() * 2 - 1) * nodeBox.x / 2;
			console.log(xOffset);
			tree.position.x += xOffset;
			tree.position.z += (Math.random() * 2 - 1) * nodeBox.z / 2;

			//TODO: random rotation

			set.add(node);
			set.add(tree);
			return set;
		}), 
		new Rule(0.1, terminalRule),
	],
}