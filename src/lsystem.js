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

// --------------------------------------------------------------------------------------------------------------
// CHANGE THE LSYSTEM FUNCTION 
export default function Lsystem(scene, importGeom, axiom, grammar, iterations) {
    //add in a curve (that the houses should follow)
	var spline = new THREE.SplineCurve3([
	    new THREE.Vector3(0,0,0),
	    new THREE.Vector3(7,0,5),
	    new THREE.Vector3(10,0,10)
	]);

	var geometry = new THREE.Geometry();
	var splinePoints = spline.getPoints(50);
    // var material = new THREE.MeshLambertMaterial( { color: 0xd69651 } );
    var material = new THREE.LineBasicMaterial({color: 0x6699FF, linewidth: 10, fog:true});

	for(var i = 0; i < splinePoints.length; i++){
	    geometry.vertices.push(splinePoints[i]);  
	}
	var line = new THREE.Line(geometry, material);
	scene.add(line);

 // ---------------------------------------------------------------------------------------------------
 var count = 0; 
	// Context-based functions 
	// predecessor is a grammarNode 
	function subdivide(pred, shapeArr) {
		// divide original pred into two different nodes
		// node 1: scaled half width, half the height
		// node 2: scale half width, same height! 
		var oScaX = pred.scale.x; var oScaY = pred.scale.y; var oScaZ = pred.scale.z;
		var oPosX = pred.pos.x; var oPosY = pred.pos.y; var oPosZ = pred.pos.z; 

		var newNode1 = new ShapeNode('Y', pred.geom, pred.pos, pred.scale);
		var newNode2 = new ShapeNode('Y', pred.geom, pred.pos, pred.scale);

		var x = Math.random();
		if (x > 0.5) {
					// Case 1 : divide evenly on X axis  
			// then move the positon of both, and scale them
			newNode1.scale = new THREE.Vector3(oScaX * 0.5, oScaY * 0.5, oScaZ * 1);
			newNode2.scale = new THREE.Vector3(oScaX * 0.5, oScaY * 1, oScaZ * 1);

			newNode1.pos = new THREE.Vector3(oPosX - newNode1.scale.x * 0.75 + count, oPosY - newNode1.scale.y * 1.10, 0);
			newNode2.pos = new THREE.Vector3(oPosX + newNode2.scale.x * 0.75 + count, oPosY, 0);

			count += 5; 
			// splice out original node
			var chosenIndex = 0;
			for (var i = 0; i < shapeArr.length; i++) {
				if (pred === shapeArr[i]) {
					chosenIndex = i;
				}
			}
			shapeArr.splice(chosenIndex, 1);

			// push in the two new Shape nodes 
			shapeArr.push(newNode1);
			shapeArr.push(newNode2); 

		} else {
			// Case 2: divide X axis, opposite is shorter side 
			// then move the positon of both, and scale them
			newNode1.scale = new THREE.Vector3(oScaX * 0.5, oScaY * 0.8, oScaZ * 1);
			newNode2.scale = new THREE.Vector3(oScaX * 0.5, oScaY * 0.6, oScaZ * 1);

			newNode1.pos = new THREE.Vector3(oPosX - newNode2.scale.x * 0.75 + count, -0.2 , 0);
			newNode2.pos = new THREE.Vector3(oPosX + newNode1.scale.x * 0.75 + count, -0.2 - 0.23, 0);

			count += 3; 

			// splice out original node
			var chosenIndex = 0;
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
	}

	function subdivideThree(pred, shapeArr) {
		var oScaX = pred.scale.x; var oScaY = pred.scale.y; var oScaZ = pred.scale.z;
		var oPosX = pred.pos.x; var oPosY = pred.pos.y; var oPosZ = pred.pos.z; 

		var newNode1 = new ShapeNode('Z', pred.geom, pred.pos, pred.scale);
		var newNode2 = new ShapeNode('Z', pred.geom, pred.pos, pred.scale);
		var newNode3 = new ShapeNode('Z', pred.geom, pred.pos, pred.scale);

		// NOW GENERALIZE. if you have a cube 
		// then move the positon of both, and scale them
		newNode1.scale = new THREE.Vector3(oScaX * 0.4, oScaY * 0.5, oScaZ * 0.5);
		newNode1.pos = new THREE.Vector3(oPosX - 0.4 + count, oPosY - 0.55, oPosZ + 0.7);

		newNode2.scale = new THREE.Vector3(oScaX * 0.4, oScaY * 0.5, oScaZ * 0.5);
		newNode2.pos = new THREE.Vector3(oPosX + 0.4 + count, oPosY - 0.55, oPosZ + 0.7);

		newNode3.scale = new THREE.Vector3(oScaX * 1.0, oScaY * 1.0, oScaZ * 0.5);
		newNode3.pos = new THREE.Vector3(oPosX + count, oPosY , oPosZ);

		count += 3; 

		// splice out original node
		var chosenIndex = 0;
		for (var i = 0; i < shapeArr.length; i++) {
			if (pred === shapeArr[i]) {
				chosenIndex = i;
			}
		}
		shapeArr.splice(chosenIndex, 1);

		// push in the two new Shape nodes 
		shapeArr.push(newNode1);
		shapeArr.push(newNode2); 
		shapeArr.push(newNode3); 
	}

	// make some tall buildings 
	function divideTall(pred, shapeArr) {
		var oScaX = pred.scale.x; var oScaY = pred.scale.y; var oScaZ = pred.scale.z;
		var oPosX = pred.pos.x; var oPosY = pred.pos.y; var oPosZ = pred.pos.z; 

		var newNode1 = new ShapeNode('Z', pred.geom, pred.pos, pred.scale);

		// NOW GENERALIZE. if you have a cube 
		// then move the positon of both, and scale them
		newNode1.scale = new THREE.Vector3(oScaX * 0.7, oScaY * 2.0, oScaZ * 0.7);
		newNode1.pos = new THREE.Vector3(oPosX + count, oPosY + 1.0, oPosZ );

		count += 3; 

		// splice out original node
		var chosenIndex = 0;
		for (var i = 0; i < shapeArr.length; i++) {
			if (pred === shapeArr[i]) {
				chosenIndex = i;
			}
		}
		shapeArr.splice(chosenIndex, 1);

		// push in the two new Shape nodes 
		shapeArr.push(newNode1);
	}

		// make some tall buildings 
	function divideAngle(pred, shapeArr, chosenGeom) {
		var oScaX = pred.scale.x; var oScaY = pred.scale.y; var oScaZ = pred.scale.z;
		var oPosX = pred.pos.x; var oPosY = pred.pos.y; var oPosZ = pred.pos.z; 

		var newNode1 = new ShapeNode('Z', chosenGeom, pred.pos, pred.scale);

		// NOW GENERALIZE. if you have a cube 
		// then move the positon of both, and scale them
		// newNode1.scale = new THREE.Vector3(oScaX * 0.7, oScaY * 2.0, oScaZ * 0.7);
		newNode1.pos = new THREE.Vector3(oPosX + 1 + count, oPosY , oPosZ );

		count += 3; 

		// splice out original node
		var chosenIndex = 0;
		for (var i = 0; i < shapeArr.length; i++) {
			if (pred === shapeArr[i]) {
				chosenIndex = i;
			}
		}
		shapeArr.splice(chosenIndex, 1);

		// push in the two new Shape nodes 
		shapeArr.push(newNode1);
	}


// trying to merge geometry. sad 
	function addDoor(pred, shapeArr, chosenGeom) {
		var oScaX = pred.scale.x; var oScaY = pred.scale.y; var oScaZ = pred.scale.z;
		var oPosX = pred.pos.x; var oPosY = pred.pos.y; var oPosZ = pred.pos.z; 

		var newNode1 = new ShapeNode('Z', chosenGeom, pred.pos, pred.scale);

		newNode1.pos = new THREE.Vector3(oPosX , oPosY + 10, oPosZ );

		// push in the new door node
		shapeArr.push(newNode1);
	}
 // ---------------------------------------------------------------------------------------------------
	// default LSystem
	this.axiom = 'XXXXXXXX'; // add in X's if you want some behavior
	this.grammar = {};
	this.iterations = 0; 
	this.importGeom = importGeom;
	this.scene = scene;

	// holds all the geometry
	this.shapeArr = []; 

	// Loop through the axiom to generate rules 
	for (var i = 0; i < this.axiom.length; i++) { 
		// check all the grammar rules
		if (this.axiom.charAt(i) === 'X') {
			// make a "default" ShapeNode (to use as axiom)
			var ogShapeNode = new ShapeNode('X', importGeom[0], new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1));
			// make a new rule
			// var xGram = new Rule(1.0, ogShapeNode, null);
			// push the rule onto the shapeArr..? 
			this.shapeArr.push(ogShapeNode); 
			// call subdivide on the rule 
			var x = Math.random();
			if (x < 0.5) {
				subdivide(ogShapeNode, this.shapeArr); 
			} else if (x < 0.7) {
				subdivideThree(ogShapeNode, this.shapeArr); 
			} else if (x < 0.85) {
				divideTall(ogShapeNode, this.shapeArr);
			} else {
				divideAngle(ogShapeNode, this.shapeArr, this.importGeom[1]);
			}

			// // trying to add in a door only works for the first iteration. 
			// addDoor(ogShapeNode, this.shapeArr, importGeom[2]);
		} 

	}
	
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

	// this function iterates through the current shape array, and renders every piece of geometry. 
	this.doIterations = function(n) {	
	    for (var i = 0; i < this.shapeArr.length; i++) {
	  		var material = new THREE.MeshLambertMaterial( { color: 0xd5b990 } );
	     	 var mesh = new THREE.Mesh( this.shapeArr[i].geom, material );
	     	 mesh.position.set(this.shapeArr[i].pos.x,this.shapeArr[i].pos.y,this.shapeArr[i].pos.z);
	     	 mesh.scale.set(this.shapeArr[i].scale.x, this.shapeArr[i].scale.y, this.shapeArr[i].scale.z);
	     	 scene.add(mesh);
	    }
	}
}