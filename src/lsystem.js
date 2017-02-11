const THREE = require('three')

// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar
// predecessor : a shapeNode
// sucessor : another shapeNode? i guess 
export function Rule(prob, predecessor, successor) {
	// the successor is based on some function with input predecessor, predecessor is a SHAPENODE! 
	this.predecessor = predecessor; 

	// first set the successor to null... i guess 
	this.successor = successor;

	// The probability that this Rule will be used
	this.probability = prob;
}

// Grammar node class (for shape grammar) 
// add more stuff? idk 
export function ShapeNode(symbol, geom, pos, scale) {
	this.sym = symbol;
	this.geom = geom;
	this.pos = pos; // for a mesh, these are already inherent? 
	this.scale = scale; // for a mesh, these are already inherent? 
}

// function stringToNodeSet(string) {
// 	// change input axiom into a set of GrammarNodes
// 	for (var i = 0; i < string.length; i++) {
// 	}
// }	

// --------------------------------------------------------------------------------------------------------------
// CHANGE THE LSYSTEM FUNCTION 
export default function Lsystem(axiom, grammar, iterations) {

	// holds all the geometry
	this.shapeArr = []; 

	// what are some context-based functions? 
	// predecessor is a grammarNode 
	function subdivide(pred, shapeArr) {
		// divide original pred into two different nodes
		// node 1: scaled half width, half the height
		// node 2: scale half width, same height! 
		var oScaX = pred.scale.x; var oScaY = pred.scale.y; var oScaZ = pred.scale.z;
		var oPosX = pred.pos.x; var oPosY = pred.pos.y; var oPosZ = pred.pos.z; 

		var newNode1 = new ShapeNode('Y', pred.geom, pred.pos, pred.scale);
		var newNode2 = new ShapeNode('Y', pred.geom, pred.pos, pred.scale);

		// NOW GENERALIZE. if you have a cube 
		// then move the positon of both, and scale them
		newNode1.scale = new THREE.Vector3(oScaX * 0.5, oScaY * 0.5, oScaZ * 1);
		newNode2.scale = new THREE.Vector3(oScaX * 0.5, oScaY * 1, oScaZ * 1);

		newNode1.pos = new THREE.Vector3(oPosX - newNode1.scale.x * 0.5, oPosY - newNode1.scale.y * 0.5, 0);
		newNode2.pos = new THREE.Vector3(oPosX + newNode2.scale.x * 0.5, oPosY, 0);

		// splice out original node
		var chosenIndex = 0;
		// console.log(this.shapeArr);
		for (var i = 0; i < shapeArr.length; i++) {
			if (pred === shapeArr[i]) {
				chosenIndex = i;
			}
		}
		shapeArr.splice(chosenIndex, 1);

		// push in the two new Shape nodes 
		shapeArr.push(newNode1);
		shapeArr.push(newNode2); 
	}

	// default LSystem
	this.axiom = 'X';
	this.grammar = {};

	this.iterations = 0; 

	// make a "default" ShapeNode (to use as axiom)
	var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: 0x9ab021 } );
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(1,1,1);

	var ogShapeNode = new ShapeNode("X", geometry, mesh.position, mesh.scale);

	// tryna get things to werk .. 
	var xGram = new Rule(1.0, ogShapeNode, null);
	this.shapeArr.push(xGram); 
	// I don't think i actually need this 
	subdivide(xGram.predecessor, this.shapeArr); 

	this.grammar['X'] = [
		xGram
	];
	// add new rulezzz ! idk man idk.... idk.... so sad ....  
	
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
	this.updateAxiom = function(axiom) {
		// Setup axiom
		if (typeof axiom !== "undefined") {
			this.axiom = axiom;
		}
	}

	//TODO:: RETURN A SET OF SYMBOL NODES WHICH REFERS TO GRAMMAR S... . . . ok 
	this.doIterations = function(n) {	
		var lSystemLL = [];

		return this.shapeArr;
	}
}