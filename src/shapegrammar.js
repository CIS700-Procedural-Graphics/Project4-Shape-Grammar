const THREE = require('three');

var objLoader = new THREE.OBJLoader();
var geo1;
var geo2;

var GEO1SCALE = new THREE.Vector3(1 / 125, 1 / 200, 1 / 130);
var GEO2SCALE = new THREE.Vector3(1 / 350, 1 / 400, 1 / 230);
// Materials
var flatMat = new THREE.MeshPhongMaterial( { color: 0x000000, 
	polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
flatMat.shading = THREE.FlatShading;
var lineMat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );

// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function SymbolNode(symbol, geometry) {
	this.parent = null;
	this.symbol = symbol;
	this.geometry = geometry;
	this.position = new THREE.Vector3(0, 0, 0);
	this.scale = new THREE.Vector3(1, 1, 1);
	this.rotation = new THREE.Vector3(0, 0, 0);
	this.material = null;
	this.geomScale = new THREE.Vector3(1, 1, 1);
}

// A -> AB
function subdivideX(parent) {
	var newShapes = [];
	var left = new SymbolNode('A', geo1);
	var right = new SymbolNode('B', geo2);
	left.geomScale = GEO1SCALE;
	right.geomScale = GEO2SCALE;
	
	// Switches up geom
	var RV = Math.random();

	if (RV < 0.25) {
		left = new SymbolNode('A', geo2);
		right = new SymbolNode('B', geo1);
		left.geomScale = GEO2SCALE;
		right.geomScale = GEO1SCALE;
	}
	else if (RV < 0.5) {
		left = new SymbolNode('A', geo1);
		right = new SymbolNode('B', geo1);
		left.geomScale = GEO1SCALE;
		right.geomScale = GEO1SCALE;

	}
	else if (RV < 0.75) {
		left = new SymbolNode('A', geo2);
		right = new SymbolNode('B', geo2);
		left.geomScale = GEO2SCALE;
		right.geomScale = GEO2SCALE;
	}

	left.material = flatMat;
	right.material = flatMat;
	
	// Determine scale randomly
	var ly = Math.random();
	var lz = Math.random();
	var ry = Math.random();
	var rz = Math.random();

	if (ly < 0.6) {
		ly = 0.6;
	}
	if (lz < 0.6) {
		lz = 0.6;
	}
	if (ry < 0.6) {
		ry = 0.6;
	}
	if (rz < 0.6) {
		rz = 0.6;
	}
	// 
	left.scale = new THREE.Vector3(parent.scale.x / 2, 
		parent.scale.y, lz * parent.scale.z);
	right.scale = new THREE.Vector3(parent.scale.x / 2, 
		parent.scale.y, rz * parent.scale.z);


	// Determine displacement
	left.position.z = parent.position.z;
	right.position.z = parent.position.z;
	left.position.x = parent.position.x - parent.scale.x / 2 + left.scale.x / 2;
	right.position.x = parent.position.x + parent.scale.x / 2 - right.scale.x / 2;
	left.position.y = parent.position.y;
	right.position.y = parent.position.y;

	newShapes.push(left);
	newShapes.push(right);

	return newShapes;
}

// B -> A
function noTrans(parent) {
	parent.symbol = 'B';
	return [parent];
}

// C -> AA
// Creates two stacked components
function stack(parent) {
	var newShapes = [];
	var up = new SymbolNode('A', geo2);
	var down = new SymbolNode('A', geo1);
	up.material = flatMat;
	down.material = flatMat;
	newShapes.push(up);
	newShapes.push(down);

	up.scale.x = 0.75*parent.scale.x;
	down.scale.x = parent.scale.x;
	up.scale.y = 0.5*parent.scale.y;
	down.scale.y = 0.5*parent.scale.y;
	up.scale.z = 0.75*parent.scale.z;
	down.scale.z = parent.scale.z;
	up.position.y = parent.position.y + up.scale.y / 2;
	down.position.y = parent.position.y;
	up.position.x = parent.position.x;
	down.position.x = parent.position.x;
	up.position.z = parent.position.z;
	down.position.z = parent.position.z;


	newShapes.push(up);
	newShapes.push(down);
	return newShapes;
}

// D -> A
// D -> C
// D -> AEA
function buildBaseOrBridge(parent) {
	var newShapes = [];
	var baseBottom = new SymbolNode('E', new THREE.BoxGeometry(1, 1, 1));
	var baseMiddle = new SymbolNode('E', new THREE.BoxGeometry(1, 1, 1));
	var baseTop = new SymbolNode('E', new THREE.BoxGeometry(1, 1, 1));

	// Build base and main building
	var buildingMain;
	buildingMain = new SymbolNode('A', geo1);
	buildingMain.geomScale = GEO1SCALE;

	baseBottom.material = flatMat;
	baseMiddle.material = flatMat;
	baseTop.material = flatMat;
	buildingMain.material = flatMat;

	buildingMain.scale = parent.scale;
	buildingMain.scale.x = parent.scale.x * 0.8;
	buildingMain.scale.z = parent.scale.z * 0.8;
	buildingMain.position.x = parent.position.x;
	buildingMain.position.y = parent.position.y;
	buildingMain.position.z = parent.position.z;
	
	baseBottom.scale.y = 0.25;
	baseBottom.position.x = parent.position.x;
	baseBottom.position.y = parent.position.y;
	baseBottom.position.z = parent.position.z;
	
	baseMiddle.scale.y = 0.5;
	baseMiddle.scale.x = 0.75;
	baseMiddle.scale.z = 0.75;
	baseMiddle.position.x = parent.position.x;
	baseMiddle.position.y = parent.position.y;
	baseMiddle.position.z = parent.position.z;
	
	baseTop.scale.y = 0.75;
	baseTop.scale.x = 0.50;
	baseTop.scale.z = 0.50;
	baseTop.position.x = parent.position.x;
	baseTop.position.z = parent.position.z;
	baseTop.position.y = parent.position.y;

	//Decides whether this building is normal, based, or bridged
	var RV = Math.random();
	if (RV < 0.3333) {
		//builds with base
		if (Math.random() < 0.4) {
			newShapes.push(baseBottom);
			newShapes.push(baseMiddle);
			newShapes.push(baseTop);
		}
		newShapes.push(buildingMain);
	}
	else if (RV < 0.75) {
		//No base or bridge
		buildingMain.symbol = 'C';
		buildingMain.scale = parent.scale;
		newShapes.push(buildingMain);
	}
	else {
		var left = new SymbolNode('A', geo1);
		var right = new SymbolNode('B', geo2);
		var bridge = new SymbolNode('E', new THREE.BoxGeometry(1, 1, 1));
		left.geomScale = GEO1SCALE;
		right.geomScale = GEO2SCALE;
		
		// Switches up geom
		var RV = Math.random();
	
		if (RV < 0.25) {
			left = new SymbolNode('A', geo2);
			right = new SymbolNode('B', geo1);
			left.geomScale = GEO2SCALE;
			right.geomScale = GEO1SCALE;
		}
		else if (RV < 0.5) {
			left = new SymbolNode('A', geo1);
			right = new SymbolNode('B', geo1);
			left.geomScale = GEO1SCALE;
			right.geomScale = GEO1SCALE;
	
		}
		else if (RV < 0.75) {
			left = new SymbolNode('A', geo2);
			right = new SymbolNode('B', geo2);
			left.geomScale = GEO2SCALE;
			right.geomScale = GEO2SCALE;
		}

		left.material = flatMat;
		right.material = flatMat;
		bridge.material = flatMat;
		
		// Determine scale randomly
		var ly = Math.random();
		var lz = Math.random();
		var ry = Math.random();
		var rz = Math.random();
	
		if (ly < 0.6) {
			ly = 0.6;
		}
		if (lz < 0.6) {
			lz = 0.6;
		}
		if (ry < 0.6) {
			ry = 0.6;
		}
		if (rz < 0.6) {
			rz = 0.6;
		}
		
		left.scale = new THREE.Vector3(parent.scale.x / 3, 
			parent.scale.y, lz * parent.scale.z);
		right.scale = new THREE.Vector3(parent.scale.x / 3, 
			parent.scale.y, rz * parent.scale.z);
	
	
		// Determine displacement
		left.position.z = parent.position.z;
		right.position.z = parent.position.z;
		left.position.x = parent.position.x - parent.scale.x / 2 + left.scale.x / 3;
		right.position.x = parent.position.x + parent.scale.x / 2 - right.scale.x / 3;
		left.position.y = parent.position.y;
		right.position.y = parent.position.y;
		bridge.scale.x = parent.scale.x * 0.75;
		bridge.scale.y = parent.scale.y / 12;
		bridge.scale.z = Math.min(left.scale.z, right.scale.z) / 4;
		bridge.position.x = parent.position.x;
		bridge.position.z = parent.position.z;
		bridge.position.y = parent.position.y + parent.scale.y / 2;
		newShapes.push(left);
		newShapes.push(right);
		newShapes.push(bridge);
	}
	return newShapes;
}


// Encapsulate grammar methods
function ShapeGrammar(axiom, scene, iterations, origin, height, g1, g2) {
	geo1 = g1;
	geo2 = g2;
	this.axiom = axiom;
	this.material = flatMat.clone();
	this.grammar = [];
	this.iterations = iterations;
	this.scene = scene;
	this.height = height;
	// Init grammar for shapes
	for (var i = 0; i < this.axiom.length; i++) {
		var node = new SymbolNode(axiom.charAt(i), new THREE.BoxGeometry(1, 1, 1));
		node.scale = new THREE.Vector3(1, height, 1);
		node.position.x = origin.x;
		node.position.z = origin.y;
		node.position.y = origin.z;
		node.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		var mesh = new THREE.Mesh(node.geometry, node.material);
		mesh.position.x += 1;
		this.grammar[i] = node;
	} 
	// Function to compute shape grammar for a number of iterations
	this.compute = function() {
		// Repeats for number of iterations
		for (var k = 0; k < this.iterations; k++) {
			
			/*
			 * Adds children instances to a resulting array 
			 * and replaces grammar with new list
			 */
			var newArr = [];
			for (var i = 0; i < this.grammar.length; i++) {
				var symbolNode = this.grammar[i];
				// Subdivide rule
				if (symbolNode.symbol == 'A') {
					this.grammar.splice(i, 1);
					//var newSymbols = subdivideX(symbolNode);
					var newSymbols = subdivideX(symbolNode);
					// Add new symbols to the grammar
					for (var j = 0; j < newSymbols.length; j++) {
						newArr.push(newSymbols[j]);
					}
				}
				// Self rule
				else if (symbolNode.symbol == 'B') {
					this.grammar.splice(i, 1);
					var newSymbols = noTrans(symbolNode);
					// Add new symbols to the grammar
					for (var j = 0; j < newSymbols.length; j++) {
						newArr.push(newSymbols[j]);
					}
				}
				else if (symbolNode.symbol == 'C') {
					this.grammar.splice(i, 1);
					var newSymbols = stack(symbolNode);
					// Add new symbols to the grammar
					for (var j = 0; j < newSymbols.length; j++) {
						newArr.push(newSymbols[j]);
					}
				}
				else if (symbolNode.symbol == 'D') {
					this.grammar.splice(i, 1);
					var newSymbols = buildBaseOrBridge(symbolNode);
					// Add new symbols to the grammar
					for (var j = 0; j < newSymbols.length; j++) {
						newArr.push(newSymbols[j]);
					}
				}
			}
			for (var j = 0; j < newArr.length; j++) {
				this.grammar.push(newArr[j]);
			}
		}
	}

	// Function to render resulting shape grammar
	this.render = function() {
		this.compute();

		for (var i = 0; i < this.grammar.length; i++) {
			var node = this.grammar[i];
			//this.material.color.r += this.height / 15;
			//this.material.color.g += Math.pow(this.height, 2) / 40;
			var bcomp = this.grammar.length / 55;
			//console.log(bcomp);
			//this.material.color.r += bcomp;
			//this.material.color.g += bcomp;
			this.material.color.b += bcomp;
			//console.log(this.height/5);
			var mesh = new THREE.Mesh(node.geometry, this.material);
			var geo = new THREE.EdgesGeometry(  node.geometry ); 
			var wireframe = new THREE.LineSegments( geo, lineMat );
			mesh.add(wireframe);
			// Set position
			mesh.position.set(node.position.x, node.position.y, node.position.z);

			// Set rotation
			mesh.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z);

			// Set scale
			mesh.scale.set(node.geomScale.x*node.scale.x, node.geomScale.y*node.scale.y, 
				node.geomScale.y*node.scale.z);

			mesh.updateMatrix();
			this.scene.add(mesh);
		}
	}
}

export default {
	ShapeGrammar : ShapeGrammar,
	SymbolNode : SymbolNode,
}