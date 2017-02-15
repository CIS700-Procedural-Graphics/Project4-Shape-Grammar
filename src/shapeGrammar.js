const THREE = require('three')
const OBJLoader = require('three-obj-loader')(THREE)

var ShapeEnum = Object.freeze({Ring: 0, Wall: 1, Roof1: 2, Roof2: 3, Block: 4});
var material = new THREE.MeshPhongMaterial();
var objLoader = new THREE.OBJLoader();
var objLibrary = [];



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
	
	loadAllObjs() {
		var mContainer1 = new THREE.Geometry();
		mContainer1.applyMatrix( new THREE.Matrix4().makeTranslation(0, 2, 0));
		mContainer1.applyMatrix( new THREE.Matrix4().makeScale(8, 1, 8));
		objLibrary.push(mContainer1);
		objLoader.load('./ring.obj', function(obj) {
			//console.log(obj);
			//console.log(obj.children);

			var g = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
			g.applyMatrix( new THREE.Matrix4().makeScale(8, 8, 8));
			g.applyMatrix( new THREE.Matrix4().makeTranslation(0, 2, 0));
			
			objLibrary[0].merge(g, objLibrary[0].matrix);

		});
	}

	constructor(scene) {
		this.loadAllObjs();
		this.scene = scene;
		this.allShapes = []; // will contain every single 
		this.geometry = new THREE.Geometry();
		this.mesh = undefined;
		this.numIterations = 1;

		this.addShape(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), 0.0, ShapeEnum.Ring, false);
		this.addShape(new THREE.Vector3(0, 0, 15), new THREE.Vector3(2, 2, 2), 35.0, ShapeEnum.Block, false);
	}



	// add a single shape to the grammar with specified values
	addShape(pos, scale, yaw, type, terminal) {
		
		var s = new Shape(pos, scale, yaw, type, terminal);
		this.allShapes.push(s);
		// merge into existing geometry
		var geom;
		switch(type) {
			case ShapeEnum.Ring: 
				var ring = objLibrary[0].clone();

    			geom = new THREE.CylinderGeometry(8, 8, 2, 20);
				geom.applyMatrix( new THREE.Matrix4().makeTranslation(0, 1, 0));
				geom.merge(ring, ring.matrix);
				break;
				
			case ShapeEnum.Block:
				geom = new THREE.BoxGeometry(4, 4, 4);
				geom.applyMatrix( new THREE.Matrix4().makeTranslation(0, 2, 0));
				break;

			case ShapeEnum.Wall:
				geom = objLibrary[0].clone();
				break;

			default:
				geom = new THREE.CylinderGeometry(8, 8, 2, 20);
				geom.applyMatrix( new THREE.Matrix4().makeTranslation(0, 1, 0));
				break;

		}
		
		geom.applyMatrix( new THREE.Matrix4().makeScale(scale.x, scale.y, scale.z));
		geom.applyMatrix( new THREE.Matrix4().makeRotationY(yaw * Math.PI / 180.0));
		geom.applyMatrix( new THREE.Matrix4().makeTranslation(pos.x, pos.y, pos.z));
		this.geometry.merge(geom, geom.matrix);
	}

	// add a single already-created shape
	addWholeShape(shape) {
		this.addShape(shape.pos, shape.scale, shape.yaw, shape.type, shape.terminal);
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
		this.numIterations = 1;
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


		var s1; var s2;
		var d; var s;
		if (Math.random() > 0.5) {
			d = new THREE.Vector2(0, shape.scale.z);
			d.rotateAround(new THREE.Vector2(0, 0), shape.yaw * Math.PI / 180.0);

			s = new THREE.Vector3(shape.scale.x, shape.scale.y, 0.49 * shape.scale.z);
			/*s1 = new Shape(new THREE.Vector3(shape.pos.x + zS * shape.scale.x,
				shape.pos.y, shape.pos.z + xS * shape.scale.z), s, shape.yaw, ShapeEnum.Block, false);
			s2 = new Shape(new THREE.Vector3(shape.pos.x - zS * shape.scale.x,
				shape.pos.y, shape.pos.z - xS * shape.scale.z), s, shape.yaw, ShapeEnum.Block, false);
			*/

			console.log("bark");
		} else {
			d = new THREE.Vector2(shape.scale.x, 0);
			d.rotateAround(new THREE.Vector2(0, 0), shape.yaw * Math.PI / 180.0);

			s = new THREE.Vector3(0.49 * shape.scale.x, shape.scale.y, shape.scale.z);

			

			console.log("snorf");
		}

		s1 = new Shape(new THREE.Vector3(shape.pos.x + d.x,
				shape.pos.y, shape.pos.z - d.y), s, shape.yaw, ShapeEnum.Block, false);
		s2 = new Shape(new THREE.Vector3(shape.pos.x - d.x,
				shape.pos.y, shape.pos.z + d.y), s, shape.yaw, ShapeEnum.Block, false);
			
		shapeList.push(s1);
		shapeList.push(s2);
	}

	// creates a tower on the edge of the ring
	buildLayer(shape, shapeList) {
		var x = (8.0 - 1.5 * this.numIterations) / 8.0;
		var y = (8.0 - 0.5 * this.numIterations) / 8.0;
		var s = new THREE.Vector3(x, y, x)

		var layer = new Shape(new THREE.Vector3(shape.pos.x, shape.pos.y + 2 * shape.scale.y, shape.pos.z),
						s,
						shape.yaw, ShapeEnum.Ring, this.numIterations > 3);



		shapeList.push(shape); // preserve original

		shapeList.push(layer);
	}
	// places houses in a reasonable way along the ring

	// creates a more detailed wall segment on the ring

	// caps this shape with a roof and terminates it

	// creates a tower on this building

	// creates a more centrally located tower

	// apply a rule to each non - terminal shape in the grammar
	iterateGrammar() {
		

		// begin a new list of shapes
		var newShapes = [];
		var newIter = this.numIterations + 1;



		// for each shape, apply an appropriate rule
		for (var i = 0; i < this.allShapes.length; i++) {
			if (!this.allShapes[i].terminal) {
				switch(this.allShapes[i].type) {
					case ShapeEnum.Ring:
						this.buildLayer(this.allShapes[i], newShapes);
						break;
					case ShapeEnum.Block:
						this.subdivide(this.allShapes[i], newShapes);
						break;
					default:
						newShapes.push(this.allShapes[i]);
						break;
				}
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

		var outerWall = new Shape(new THREE.Vector3(0, -2, 0), new THREE.Vector3(1.2, 1, 1.2),
			0, ShapeEnum.Wall, false);
		this.addWholeShape(outerWall);

		// render the new shape grammar
		this.numIterations = newIter;
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