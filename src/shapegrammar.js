const THREE = require('three');

var objLoader = new THREE.OBJLoader();
var geo1;
var geo2;

// rescale geometry to be of unit cube size
var GEO1SCALE = new THREE.Vector3(1 / 125, 1 / 200, 1 / 130);
var GEO2SCALE = new THREE.Vector3(1 / 350, 1 / 400, 1 / 230);

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

// SET OF RULES
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

	left.material = parent.material;
	right.material = parent.material;
	
	// Determine scale randomly
	var ly = Math.random();
	var lz = Math.random();
	var ry = Math.random();
	var rz = Math.random();

	if (ly < 0.6) ly = 0.6;
	if (lz < 0.6) lz = 0.6;
	if (ry < 0.6) ry = 0.6;
	if (rz < 0.6) rz = 0.6;
	
	// rescale so that the x dimension of both sides are half of the parent
	left.scale = new THREE.Vector3(parent.scale.x / 2, 
		parent.scale.y, lz * parent.scale.z);
	right.scale = new THREE.Vector3(parent.scale.x / 2, 
		parent.scale.y, rz * parent.scale.z);


	// Determine displacement
	var leftX = parent.position.x - parent.scale.x / 2 + left.scale.x / 2;
	var rightX = parent.position.x + parent.scale.x / 2 - right.scale.x / 2;
	left.position = new THREE.Vector3(leftX, parent.position.y, parent.position.z);
	right.position = new THREE.Vector3(rightX, parent.position.y, parent.position.z);

	newShapes.push(left);
	newShapes.push(right);

	return newShapes;
}

// B -> A
// Terminal shape
function noTrans(parent) {
	parent.symbol = 'B';
	return [parent];
}

// C -> AA
// Creates two stacked components
// higher box is slightly smaller
function stack(parent) {
	var newShapes = [];
	var up = new SymbolNode('A', geo2);
	var down = new SymbolNode('A', geo1);
	up.material = parent.material;
	down.material = parent.material;
	newShapes.push(up);
	newShapes.push(down);

	up.scale = up.scale.multiplyVectors(parent.scale.clone(), new THREE.Vector3(0.75, 0.5, 0.75));
	down.scale = new THREE.Vector3(parent.scale.x, 0.5 * parent.scale.y, parent.scale.z);

	up.position = parent.position.clone();
	up.position.y = parent.position.y + up.scale.y / 2;
	
	down.position = parent.position.clone();
	newShapes.push(up);
	newShapes.push(down);
	return newShapes;
}

// D -> A
// D -> C
// D -> AEA
// This function is a nondeterministic rule to determine main building structure
function buildBaseOrBridge(parent) {
	var newShapes = [];

	// Build base and main building
	var buildingMain;
	buildingMain = new SymbolNode('A', geo1);
	buildingMain.geomScale = GEO1SCALE;
	buildingMain.material = parent.material;
	buildingMain.scale.multiplyVectors(parent.scale, new THREE.Vector3(1, 0.8, 0.8));
	buildingMain.position = parent.position.clone();


	//Decides whether this building is normal, based, or bridged
	var RV = Math.random();
	if (RV < (1.0 / 3.0)) {
		//builds with base
		if (Math.random() < 0.4) {
			buildBase(parent, newShapes);
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
		buildBridge(parent, newShapes);
	}
	return newShapes;
}

// Encapsulate grammar methods
// Param: axiom, scene, number of replace iterations,
// position of the building, height of the building,
// two geometries to pass into nodes
function ShapeGrammar(axiom, scene, iterations, 
						origin, noise, g1, g2) {
	geo1 = g1;
	geo2 = g2;
	this.axiom = axiom;
	this.grammar = [];
	this.iterations = iterations;
	this.scene = scene;
	this.height = 2.0 * noise;
	this.material;
	
	// cosine palate input values
	var a = new THREE.Vector3(-3.142, -0.162, 0.688);
	var b = new THREE.Vector3(1.068, 0.500, 0.500);
	var c = new THREE.Vector3(3.138, 0.688, 0.500);
	var d = new THREE.Vector3(0.000, 0.667, 0.500);
	var t = this.height - Math.floor(this.height);

	// set material color to the pallete result
	var result = palleteColor(a, b, c, t, d);
	this.material = new THREE.MeshLambertMaterial({ color: result });
	this.material.color.setRGB(result.r, result.g, result.b);
	this.material.color.addScalar(0.95);
	
	// Init grammar for shapes
	for (var i = 0; i < this.axiom.length; i++) {
		var node = new SymbolNode(axiom.charAt(i), new THREE.BoxGeometry(1, 1, 1));
		node.scale = new THREE.Vector3(1, this.height, 1);
		node.position = new THREE.Vector3(origin.x, -0.02, origin.y);
		node.material = this.material;

		// add the node to the grammar
		this.grammar[i] = node;
	} 

	// Function to compute shape grammar for a number of iterations
	// Swaps out characters for their grammar rule value
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
	// Uses node data from shape grammar to create a mesh
	this.render = function() {
		this.compute();

		for (var i = 0; i < this.grammar.length; i++) {
			var node = this.grammar[i];

			// create mesh for building
			var mesh = new THREE.Mesh(node.geometry, this.material);
			
			// set color of buildings to be the color stored in this instance
			var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
			mat.color = this.material.color.clone();
			

			// create geometry for wireframe
			var geo = new THREE.EdgesGeometry(  node.geometry );

			// add mesh outlines
			var wireframe = new THREE.LineSegments( geo, mat );
			mesh.add(wireframe);
			
			// set position
			var p = node.position.clone();
			var r = node.rotation.clone();

			// set rotation
			mesh.position.set(p.x, p.y, p.z);
			mesh.rotation.set(r.x, r.y, r.z);

			// set scale
			var m = new THREE.Vector3().multiplyVectors(node.geomScale, node.scale);
			mesh.scale.set(m.x, m.y, m.z);

			mesh.updateMatrix();
			this.scene.add(mesh);
		}
	}
}

// HELPER FUNCTIONS
// Determine color using IQ palletes and cosine function
function palleteColor(a, b, c, t, d) {
	c.multiplyScalar(t);
	c.add(d);
	c.multiplyScalar(6.28318);
	c.x = Math.cos(c.x);
	c.y = Math.cos(c.y);
	c.z = Math.cos(c.z);
	c.multiply(b);
	c.add(a);
	//console.log(c);
	return new THREE.Color(c.x, c.y, c.z);
}

function buildBridge(parent, newShapes) {
	// Switches up geom
	var RV = Math.random();
	
	var leftGeo, rightGeo;
	var leftScale, rightScale;

	leftGeo = geo2;
	leftScale = GEO2SCALE;
	rightGeo = geo1;
	rightScale = GEO1SCALE;

	if (RV < (1.0 / 3.0)) {
		leftGeo = geo1;
		leftScale = GEO1SCALE;
	} else if (RV < 0.5) {
		leftGeo = geo1;
		leftScale = GEO1SCALE;
		rightGeo = geo2;
		rightScale = GEO2SCALE;
	} else if (RV < 0.75) {
		rightGeo = geo2;
		rightScale = GEO2SCALE;
	}

	var left = new SymbolNode('A', leftGeo);
	var right = new SymbolNode('B', rightGeo);
	left.geomScale = leftScale;
	right.geomScale = rightScale;
	left.material = parent.material;
	right.material = parent.material;

	var bridge = new SymbolNode('E', new THREE.BoxGeometry(1, 1, 1));
	bridge.material = parent.material;
	
	// Determine scale randomly
	var ly = Math.random();
	var lz = Math.random();
	var ry = Math.random();
	var rz = Math.random();

	if (ly < 0.6) ly = 0.6;
	if (lz < 0.6) lz = 0.6;
	if (ry < 0.6) ry = 0.6;
	if (rz < 0.6) rz = 0.6;
	
	left.scale = new THREE.Vector3(parent.scale.x / 3, 
		parent.scale.y, lz * parent.scale.z);
	right.scale = new THREE.Vector3(parent.scale.x / 3, 
		parent.scale.y, rz * parent.scale.z);

	// Determine displacement
	left.position = parent.position.clone();
	left.position.x = parent.position.x - parent.scale.x / 2 + left.scale.x / 3;

	right.position = parent.position.clone();
	right.position.x = parent.position.x + parent.scale.x / 2 - right.scale.x / 3;;
	
	bridge.scale.x = parent.scale.x * 0.75;
	bridge.scale.y = parent.scale.y / 12;
	bridge.scale.z = Math.min(left.scale.z, right.scale.z) / 4;
	
	bridge.position = parent.position.clone();
	bridge.position.y = parent.position.y + parent.scale.y / 2;
	
	// add left and right buildings, and then add bridge
	newShapes.push(left);
	newShapes.push(right);
	newShapes.push(bridge);
}

// build base for the seed string
function buildBase(parent, newShapes) {
	var baseBottom = new SymbolNode('E', new THREE.BoxGeometry(1, 1, 1));
	var baseMiddle = new SymbolNode('E', new THREE.BoxGeometry(1, 1, 1));
	var baseTop = new SymbolNode('E', new THREE.BoxGeometry(1, 1, 1));

	baseBottom.material = parent.material;
	baseMiddle.material = parent.material;
	baseTop.material = parent.material;

	baseBottom.scale.y = 0.25;
	baseBottom.position = parent.position.clone();
	
	baseMiddle.scale = new THREE.Vector3(0.75, 0.5, 0.75);
	baseMiddle.position = parent.position.clone();
	
	baseTop.scale = new THREE.Vector3(0.5, 0.75, 0.5);
	baseTop.position = parent.position.clone();
}

export default {
	ShapeGrammar : ShapeGrammar,
	SymbolNode : SymbolNode,
}