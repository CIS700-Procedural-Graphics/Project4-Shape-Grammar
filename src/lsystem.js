const THREE = require('three')

// A class that represents a symbol replacement rule to
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

// toolbox functions
function lerp(a, b, t) {
    return a * (1- t) + b * t; 
}

// --------------------------------------------------------------------------------------------------------------
// CHANGE THE LSYSTEM FUNCTION 
export default function Lsystem(scene, importGeom, axiom, grammar, iterations) {

    //add in a curve (that some houses will follow)
	var spline = new THREE.SplineCurve3([
	    new THREE.Vector3(0,0,0),
	    new THREE.Vector3(7,0,7),
	    new THREE.Vector3(9,0,15)
	]);
	var geometry = new THREE.Geometry();
	var splinePoints = spline.getPoints(100);
    var material = new THREE.LineBasicMaterial({color: 0x6699FF, linewidth: 10, fog:true});
	for(var i = 0; i < splinePoints.length; i++){
	    geometry.vertices.push(splinePoints[i]);  
	}
	var line = new THREE.Line(geometry, material);
	// scene.add(line);

    // second curve 
	var spline1 = new THREE.SplineCurve3([
	    new THREE.Vector3(6,0,0),
	    new THREE.Vector3(12,0,7),
	    new THREE.Vector3(13,0,15)
	]);
	var geometry1 = new THREE.Geometry();
	var splinePoints1 = spline1.getPoints(100);
    var material1 = new THREE.LineBasicMaterial({color: 0x6699FF});
	for(var i = 0; i < splinePoints1.length; i++){
	    geometry1.vertices.push(splinePoints1[i]);  
	}
	var line = new THREE.Line(geometry1, material1);
	// scene.add(line);

    // third curve 
	var spline2 = new THREE.SplineCurve3([
	    new THREE.Vector3(-3,0,1),
	    new THREE.Vector3(-7,0,6),
	    new THREE.Vector3(-8,0,12)
	]);
	var geometry2 = new THREE.Geometry();
	var splinePoints2 = spline2.getPoints(70);
    var material2 = new THREE.LineBasicMaterial({color: 0x6699FF});
	for(var i = 0; i < splinePoints2.length; i++){
	    geometry2.vertices.push(splinePoints2[i]);  
	}
	var line2 = new THREE.Line(geometry2, material2);
	// scene.add(line2);

 // ---------------------------------------------------------------------------------------------------
 var count = 0; 
	// Context-based functions 
	// predecessor is a grammarNode 
	function subdivide(pred, shapeArr) {
		// divide original pred into two different nodes
		// node 1: scaled half width, half the height
		// node 2: scale half width, same height! 
		var oScaX = pred.scale.x; var oScaY = pred.scale.y; var oScaZ = pred.scale.z;

		if (count < 100) {
			var oPosX = splinePoints[count].x; 
			var oPosY = splinePoints[count].y; 
			var oPosZ = splinePoints[count].z;
		} else if (count < 200) { 
			var oPosX = splinePoints1[count - 100].x; 
			var oPosY = splinePoints1[count - 100].y; 
			var oPosZ = splinePoints1[count - 100].z;
		} else {
			var oPosX = splinePoints2[count - 200].x; 
			var oPosY = splinePoints2[count - 200].y; 
			var oPosZ = splinePoints2[count - 200].z;
		}
		count += 15; 
		// var houseOrient = lerp(-0.5, -3.0, oPosZ / 50.0);

		var newNode1 = new ShapeNode('Y', pred.geom, pred.pos, pred.scale);
		var newNode2 = new ShapeNode('Y', pred.geom, pred.pos, pred.scale);

		var x = Math.random();
		if (x > 0.5) {
			// Case 1 : divide evenly on X axis  
			// then move the positon of both, and scale them
			newNode1.scale = new THREE.Vector3(oScaX * 0.5, oScaY * 0.5, oScaZ * 1);
			newNode2.scale = new THREE.Vector3(oScaX * 0.5, oScaY * 1, oScaZ * 1);

			newNode1.pos = new THREE.Vector3(oPosX - newNode1.scale.x * 0.75 , oPosY - newNode1.scale.y * 1.10, oPosZ);
			newNode2.pos = new THREE.Vector3(oPosX + newNode2.scale.x * 0.75 , oPosY, oPosZ);

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

			newNode1.pos = new THREE.Vector3(oPosX - newNode2.scale.x * 0.75 , -0.2 , oPosZ);
			newNode2.pos = new THREE.Vector3(oPosX + newNode1.scale.x * 0.75 , -0.2 - 0.23, oPosZ);

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
		if (count < 100) {
			var oPosX = splinePoints[count].x; 
			var oPosY = splinePoints[count].y; 
			var oPosZ = splinePoints[count].z;
		} else if (count < 200) { 
			var oPosX = splinePoints1[count - 100].x; 
			var oPosY = splinePoints1[count - 100].y; 
			var oPosZ = splinePoints1[count - 100].z;
		} else {
			var oPosX = splinePoints2[count - 200].x; 
			var oPosY = splinePoints2[count - 200].y; 
			var oPosZ = splinePoints2[count - 200].z;
		}
		count += 15; 


		var newNode1 = new ShapeNode('Z', pred.geom, pred.pos, pred.scale);
		var newNode2 = new ShapeNode('Z', pred.geom, pred.pos, pred.scale);
		var newNode3 = new ShapeNode('Z', pred.geom, pred.pos, pred.scale);

		// NOW GENERALIZE. if you have a cube 
		// then move the positon of both, and scale them
		newNode1.scale = new THREE.Vector3(oScaX * 0.4, oScaY * 0.5, oScaZ * 0.5);
		newNode1.pos = new THREE.Vector3(oPosX - 0.4 , oPosY - 0.55, oPosZ + 0.7);

		newNode2.scale = new THREE.Vector3(oScaX * 0.4, oScaY * 0.5, oScaZ * 0.5);
		newNode2.pos = new THREE.Vector3(oPosX + 0.4 , oPosY - 0.55, oPosZ + 0.7);

		newNode3.scale = new THREE.Vector3(oScaX * 1.0, oScaY * 1.0, oScaZ * 0.5);
		newNode3.pos = new THREE.Vector3(oPosX , oPosY , oPosZ);

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
		if (count < 100) {
			var oPosX = splinePoints[count].x; 
			var oPosY = splinePoints[count].y; 
			var oPosZ = splinePoints[count].z;
		} else if (count < 200) { 
			var oPosX = splinePoints1[count - 100].x; 
			var oPosY = splinePoints1[count - 100].y; 
			var oPosZ = splinePoints1[count - 100].z;
		} else {
			var oPosX = splinePoints2[count - 200].x; 
			var oPosY = splinePoints2[count - 200].y; 
			var oPosZ = splinePoints2[count - 200].z;
		}
		count += 15; 

		var newNode1 = new ShapeNode('Z', pred.geom, pred.pos, pred.scale);

		// NOW GENERALIZE. if you have a cube 
		// then move the positon of both, and scale them
		newNode1.scale = new THREE.Vector3(oScaX * 0.7, oScaY * 2.0, oScaZ * 0.7);
		newNode1.pos = new THREE.Vector3(oPosX , oPosY + 1.0, oPosZ );

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
		if (count < 100) {
			var oPosX = splinePoints[count].x; 
			var oPosY = splinePoints[count].y; 
			var oPosZ = splinePoints[count].z;
		} else if (count < 200) { 
			var oPosX = splinePoints1[count - 100].x; 
			var oPosY = splinePoints1[count - 100].y; 
			var oPosZ = splinePoints1[count - 100].z;
		} else {
			var oPosX = splinePoints2[count - 200].x; 
			var oPosY = splinePoints2[count - 200].y; 
			var oPosZ = splinePoints2[count - 200].z;
		}
		count += 15; 

		var newNode1 = new ShapeNode('Z', chosenGeom, pred.pos, pred.scale);
		newNode1.pos = new THREE.Vector3(oPosX + 1 , oPosY , oPosZ );

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
	this.axiom = 'XXXXXXXXXXXXXXXXXX'; // add in X's if you want some behavior
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