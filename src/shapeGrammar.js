const THREE = require('three')

var ShapeEnum = Object.freeze({Ring: 0, Wall: 1, Roof1: 2, Roof2: 3, Block: 4});
var material = new THREE.MeshLambertMaterial();

/*
State of a single shape in the grammar.
pos: postion
scale: scale
yaw: rotation about world Y axis
symbol: the type of shape that this will be
*/
var Shape = function(pos, scale, yaw, symbol, terminal) {
	return {
		pos: new THREE.Vector3(pos.x, pos.y, pos.z),
		scale: new THREE.Vector3(scale.x, scale.y, scale.z),
		yaw: yaw,
		type: symbol,
		terminal: terminal
	}
}

/*
The exported GrammarSystem class.
 - The grammar system has a list of shapes that are data the grammar can iterate on
 - As an optimization, there is only a single merged mesh
 - Also responsible for adding to scene and removing self from scene
*/
export default class GrammarSystem {
	

	constructor(scene) {
		this.scene = scene;
		this.allShapes = []; // will contain every single 
		this.geometry = new THREE.Geometry();
		this.addShape(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), 0.0, ShapeEnum.Ring, false);
		this.mesh = undefined;
	}

	// add a single shape to the grammar with specified values
	addShape(pos, scale, yaw, type, terminal) {
		var s = new Shape(pos, scale, yaw, type, terminal);
		this.allShapes.push(s);
		// merge into existing geometry
		var geom = new THREE.CylinderGeometry(1, 1, 1);
		geom.applyMatrix( new THREE.Matrix4().makeScale(scale.x, scale.y, scale.z));
		geom.applyMatrix( new THREE.Matrix4().makeRotationY(yaw));
		geom.applyMatrix( new THREE.Matrix4().makeTranslation(pos.x, pos.y, pos.z));
		this.geometry.merge(geom, geom.matrix);
	}

	// add a single already-created shape
	addWholeShape(shape) {
		// add a single shape to the grammar with specified values
		this.allShapes.push(shape);
		// merge into existing geometry
		var geom = new THREE.CylinderGeometry(1, 1, 1);
		geom.applyMatrix( new THREE.Matrix4().makeScale(shape.scale.x, shape.scale.y, shape.scale.z));
		geom.applyMatrix( new THREE.Matrix4().makeRotationY(shape.yaw));
		geom.applyMatrix( new THREE.Matrix4().makeTranslation(shape.pos.x, shape.pos.y, shape.pos.z));
		this.geometry.merge(geom, geom.matrix);
	}

	// completely removes all geometry and information
	resetGrammar() {
		var g = this.scene.getObjectByName("grammarGeo"); 
		if (g !== undefined) {
			this.scene.remove(g);
			this.mesh = undefined;
		}
		this.allShapes = [];
		this.geometry = new THREE.Geometry();
		//this.addShape(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), 0.0, ShapeEnum.Ring, false);
	}

	// resets the shape grammar to its initial state
	clearIterations() {
		this.resetGrammar();
		this.addShape(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), 0.0, ShapeEnum.Ring, false);
		this.finalizeGrammar();
	}


	// divides this shape and adds the new ones to the list
	subdivide(shape, shapeList) {
		var xS = Math.cos(shape.yaw * Math.PI / 180.0);
		var zS = Math.sin(shape.yaw * Math.PI / 180.0);

		var s1 = new Shape(new THREE.Vector3(shape.pos.x + 0.5 * xS * shape.scale.x, shape.pos.y, shape.pos.z  + 0.5 * zS * shape.scale.z),
						new THREE.Vector3(shape.scale.x * 0.5, shape.scale.y * 0.5, shape.scale.z * 0.5),
						shape.yaw + 15.0, ShapeEnum.Ring, false);
		var s2 = new Shape(new THREE.Vector3(shape.pos.x - 0.5 * xS * shape.scale.x, shape.pos.y, shape.pos.z + 0.5 * zS * shape.scale.z),
						new THREE.Vector3(shape.scale.x * 0.5, shape.scale.y * 0.5, shape.scale.z * 0.5),
						shape.yaw - 15.0, ShapeEnum.Ring, false);
		shapeList.push(s1);
		shapeList.push(s2);
	}

	// creates a tower on the edge of the ring

	// places houses in a reasonable way along the ring

	// creates a more detailed wall segment on the ring

	// caps this shape with a roof and terminates it

	// creates a tower on this building

	// apply a rule to each non - terminal shape in the grammar
	iterateGrammar() {
		// begin a new list of shapes
		var newShapes = [];

		// for each shape, apply an appropriate rule
		for (var i = 0; i < this.allShapes.length; i++) {
			if (this.allShapes[i].type == ShapeEnum.Ring && !this.allShapes[i].terminal) {
				this.subdivide(this.allShapes[i], newShapes);
				console.log("subdivided");
			} else {
				// this shape is terminal. Simply add it to the list
				newShapes.push(this.allShapes[i]);
			}
		}

		// clear out the old information and geometry
		this.resetGrammar();

		// add every shape from the iteration
		for (var i = 0; i < newShapes.length; i++) {
			this.addWholeShape(newShapes[i]);
		}

		// render the new shape grammar
		this.finalizeGrammar();
	}

	// takes the merged geometry and applies it to the scene
	finalizeGrammar() {
		if (this.mesh == undefined) {
			this.mesh = new THREE.Mesh(this.geometry, material);
			this.mesh.name = "grammarGeo";
			this.scene.add(this.mesh);
		}
	}

}