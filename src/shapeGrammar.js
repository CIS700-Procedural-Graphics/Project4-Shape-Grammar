const THREE = require('three')
const OBJLoader = require('three-obj-loader')(THREE)
import {getNoise} from './noise.js'

var ShapeEnum = Object.freeze({Ring: 0, Wall: 1, Roof1: 2, 
								Roof2: 3, Block: 4, Tower: 5, 
								Wedge: 6, Emplacement: 7, Cyl: 8, 
								Other: 999});
var material = new THREE.MeshPhongMaterial();
var objLoader = new THREE.OBJLoader();
var objLibrary = [];

// used to scale or cull building placements
function populationDensity(x, z) {
	var u = (x - 10.0) / -20.0;
	var v = (z - 10.0) / -20.0;
	return getNoise(u, v, 8.0);
}

/*
State of a single shape in the grammar.
pos: postion
scale: scale
yaw: rotation about world Y axis
symbol: the type of shape that this will be
*/
var Shape = function(pos, scale, yaw, symbol, terminal, iter) {
	return {
		pos: new THREE.Vector3(pos.x, pos.y, pos.z),
		scale: new THREE.Vector3(scale.x, scale.y, scale.z),
		yaw: yaw,
		type: symbol,
		terminal: terminal,
		iter: iter
	}
}

/*
The exported GrammarSystem class.
 - The grammar system has a list of shapes that are data the grammar can iterate on
 - As an optimization, there is only a single merged mesh
 - Also responsible for adding to scene and removing self from scene
*/
export default class GrammarSystem {
	
	// adds dummies to the list of objs, then reloads when obj is ready
	// usually takes only a few ms
	loadAllObjs(selfRef) {
		var mContainer1 = new THREE.Geometry();

		objLibrary.push(mContainer1);
		objLoader.load('./resources/ring.obj', function(obj) {
			var g = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
			g.applyMatrix( new THREE.Matrix4().makeScale(8, 8, 8));
			g.applyMatrix( new THREE.Matrix4().makeTranslation(0, 2, 0));
			
			objLibrary[0].merge(g, objLibrary[0].matrix);

			selfRef.clearIterations();
		});

		var dummy2 = new THREE.Geometry();
		objLibrary.push(dummy2);
		objLoader.load('./resources/emplacement.obj', function(obj) {
			var g = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
			g.applyMatrix( new THREE.Matrix4().makeRotationY(0.5 * Math.PI / 180.0));
			
			objLibrary[1].merge(g, g.matrix);

			selfRef.clearIterations();
		});


		var dummy3 = new THREE.Geometry();
		objLibrary.push(dummy3);
		objLoader.load('./resources/roundroof.obj', function(obj) {
			var g = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
			
			objLibrary[2].merge(g, g.matrix);

			selfRef.clearIterations();
		});

		var dummy4 = new THREE.Geometry();
		objLibrary.push(dummy4);
		objLoader.load('./resources/angleroof.obj', function(obj) {
			var g = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
			g.applyMatrix( new THREE.Matrix4().makeScale(4, 4, 4));
			objLibrary[3].merge(g, g.matrix);

			selfRef.clearIterations();
		});

	}

	constructor(scene) {
		
		this.scene = scene;
		this.allShapes = []; // will contain every single 
		this.geometry = new THREE.Geometry();
		this.mesh = undefined;
		this.numIterations = 1;
		this.loadAllObjs(this);

		this.addShape(new THREE.Vector3(0, 0, 0), 
			new THREE.Vector3(1, 1, 1), 0.0, ShapeEnum.Ring, false, 1);
		this.addShape(new THREE.Vector3(0, 0, 15), 
			new THREE.Vector3(2, 2, 2), 35.0, ShapeEnum.Block, false, 1);
	}



	// add a single shape to the grammar with specified values
	addShape(pos, scale, yaw, type, terminal, iter) {
		
		var s = new Shape(pos, scale, yaw, type, terminal, iter);
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

			case ShapeEnum.Wedge:
				geom = new THREE.CylinderGeometry(2, 2.4, 2, 3);
				geom.applyMatrix( new THREE.Matrix4().makeTranslation(0, 1, 0));
				geom.applyMatrix( new THREE.Matrix4().makeScale(1, 1, 4));
				geom.computeFlatVertexNormals();
				geom.normalsNeedUpdate = true;
				break;

			case ShapeEnum.Tower:
				var g1 = new THREE.BoxGeometry(0.6, 2, 0.6);
				g1.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2, 0));
				geom = new THREE.BoxGeometry(0.5, 2, 0.5);
				geom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 4, 0));
				geom.merge(g1, g1.matrix);
				break;

			case ShapeEnum.Emplacement:
				geom = objLibrary[1].clone();
				break;

			case ShapeEnum.Roof1:
				geom = objLibrary[2].clone();
				break;

			case ShapeEnum.Roof2:
				geom = objLibrary[3].clone();
				break;

			case ShapeEnum.Cyl:
				geom = new THREE.CylinderGeometry(8, 8, 2, 20);
				geom.applyMatrix( new THREE.Matrix4().makeTranslation(0, 1, 0));
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
		this.addShape(shape.pos, shape.scale, shape.yaw, shape.type, shape.terminal, shape.iter);
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
		this.addShape(new THREE.Vector3(0, 0, 0), 
			new THREE.Vector3(1, 1, 1), 0.0, ShapeEnum.Ring, false, 1);
		var outerWall = new Shape(new THREE.Vector3(0, -2, 0), new THREE.Vector3(1.2, 1, 1.2),
			0, ShapeEnum.Wall, false, 1);
		this.addWholeShape(outerWall);
		this.finalizeGrammar();
	}


	// caps this shape with a roof and terminates it
	buildRoof(shape, shapeList) {
		var longestSide = Math.max(shape.scale.x, shape.scale.z);
		var roof;
		if (shape.scale.x > shape.scale.z) {
			roof = new Shape(new THREE.Vector3(shape.pos.x, 4 * shape.scale.y +shape.pos.y, shape.pos.z), 
				new THREE.Vector3(shape.scale.z, shape.scale.x, shape.scale.x),
				 shape.yaw + 90, ShapeEnum.Roof2, true, shape.iter + 1);

		} else {
			roof = new Shape(new THREE.Vector3(shape.pos.x, 4 * shape.scale.y +shape.pos.y, shape.pos.z), 
				new THREE.Vector3(shape.scale.x, shape.scale.z, shape.scale.z),
				 shape.yaw, ShapeEnum.Roof2, true, shape.iter + 1);
		}


		//console.log("snorf");
		shapeList.push(roof);
	}

	// creates a tower on this building

	// divides this shape and adds the new ones to the list
	subdivide(shape, shapeList) {
		var xS = Math.cos(shape.yaw * Math.PI / 180.0);
		var zS = Math.sin(shape.yaw * Math.PI / 180.0);

		if (Math.random() < 0.1 || shape.scale.x < 0.1 || shape.scale.z < 0.1) {
			shape.terminal = true;
			shapeList.push(shape);
			this.buildRoof(shape, shapeList);
			return;
		}


		var s1; var s2;
		var d; var s;
		if (Math.random() > 0.5) {
			d = new THREE.Vector2(0, shape.scale.z);
			d.rotateAround(new THREE.Vector2(0, 0), shape.yaw * Math.PI / 180.0);
			s = new THREE.Vector3(shape.scale.x, shape.scale.y, 0.45 * shape.scale.z);
		} else {
			d = new THREE.Vector2(shape.scale.x, 0);
			d.rotateAround(new THREE.Vector2(0, 0), shape.yaw * Math.PI / 180.0);
			s = new THREE.Vector3(0.4 * shape.scale.x, shape.scale.y, shape.scale.z);
		}

		s1 = new Shape(new THREE.Vector3(shape.pos.x + d.x,
				shape.pos.y, shape.pos.z - d.y), s.multiply(new THREE.Vector3(1, 1.0 - Math.random() * 0.2, 1)),
				 shape.yaw, ShapeEnum.Block, false, shape.iter + 1);
		s2 = new Shape(new THREE.Vector3(shape.pos.x - d.x,
				shape.pos.y, shape.pos.z + d.y), s.multiply(new THREE.Vector3(1, 1.0 - Math.random() * 0.2, 1)),
				 shape.yaw, ShapeEnum.Block, false, shape.iter + 1);
			
		shapeList.push(s1);
		shapeList.push(s2);
	}


	// creates another layer of the city
	buildLayer(shape, shapeList) {
		var x = (8.0 - 1.5 * shape.iter) / 8.0;
		var y = (8.0 - 0.5 * shape.iter) / 8.0;
		var s = new THREE.Vector3(x, y, x)
		var check = this.numIterations > 3;

		var layer = new Shape(new THREE.Vector3(shape.pos.x, shape.pos.y + 2 * shape.scale.y, shape.pos.z),
						s,
						shape.yaw, check? ShapeEnum.Cyl : ShapeEnum.Ring, false, shape.iter + 1);


		var cliff = new Shape(new THREE.Vector3(0, 0, 0),
		 				new THREE.Vector3(1, y * (shape.iter + 2), 1), 
						 0, ShapeEnum.Wedge, true, 1);
			

		shape.terminal = true; // end iteration on original
		shapeList.push(shape); // preserve original
		shapeList.push(cliff);
		shapeList.push(layer);
	}


	// places houses in a reasonable way along the ring
	placeRadial(shape, shapeList) {
		var inner = (8.0 - 1.5 * (shape.iter - 1.0));
		var outer = (8.0 - 1.5 * (shape.iter - 2.0));
		var rCenter = 0.5 * (inner + outer) - 0.05;
		var arc = 2 * Math.PI * rCenter * 
		console.log(rCenter);
		var rScale = 0.5 * 0.25 * (outer - inner);
		var topLayer = shape.type == ShapeEnum.Cyl;
		var rowOffset = (Math.random() - 0.5) * 5.0 + 4.5;
		for (var i = 0; i < 20; i++) {
			var offset = (Math.random() - 0.5) * 2.0;
			var theta = i * 360.0 / 40 + offset + rowOffset + (topLayer? 0 : offset);
			theta = topLayer ? theta * 2 : theta;
			if (Math.abs(theta - 90) < 10) continue; // avoid the wedge
			var rct = rCenter * Math.cos(theta * Math.PI / 180.0);
			var rst = rCenter * Math.sin(theta * Math.PI / 180.0);
			//console.log(theta);

			var pop = populationDensity(rct, rst);
			if (pop < -0.2) continue; // not populous enough for a building

			var s = new Shape(new THREE.Vector3(rct, shape.pos.y, rst),
				new THREE.Vector3(1.4 * rScale, 
					(topLayer ? 2.0 : 1.0) * 0.3 * inner * (1 + pop) * (rScale), 
					(topLayer ? 2.0 : 1.0) *shape.scale.z * 1.5 * rScale),
				-theta, ShapeEnum.Block, 
				false, shape.iter + 1);
			shapeList.push(s);
		}

		if (shape.type == ShapeEnum.Cyl) {
			shape.terminal = true;
			shapeList.push(shape);
		}
	}

	// places a building atop an existing emplacement
	buildEmplacement(shape, shapeList) {
		var pop = 1.0 + populationDensity(shape.pos.x, shape.pos.z);

		var s = new Shape(new THREE.Vector3(shape.pos.x, shape.pos.y, shape.pos.z),
						new THREE.Vector3(shape.scale.x * 0.25, pop * shape.scale.y * 0.25, shape.scale.z * 0.5 * 0.25),
						shape.yaw, ShapeEnum.Block, false, shape.iter + 1);
		shapeList.push(s);
		shape.terminal = true;
		shapeList.push(shape);
	}

	// creates a tower on the wall
	buildWallTower(shape, shapeList) {
		var rad = 8 * shape.scale.z;
		var numTowers = Math.floor(Math.random() * 5.0);
		var offset = Math.random() * 180.0 / numTowers;

		// wall emplacements
		for (var i = 0; i < 10; i++) {
			if (Math.random() < 0.6) continue;
			var theta = i * 18.0 + 9.0;
			if (Math.abs(theta - 90) < 10) continue; // avoid the wedge
			var ct = Math.cos(theta * Math.PI / 180.0)
			var st = Math.sin(theta * Math.PI / 180.0)

			var rct = rad * ct;
			var rst = rad * st;

			var s = new Shape(new THREE.Vector3(rct, shape.pos.y + 4 * shape.scale.y, rst), 
				new THREE.Vector3(shape.scale.x, shape.scale.y + (Math.random() - 0.5) * 0.2, shape.scale.z), 
				90-theta, ShapeEnum.Emplacement, false, shape.iter + 1);
			shapeList.push(s);
		}

		// wall towers
		for (var i = 0; i <= 10; i++) {
			if (Math.random() < 0.7) continue;
			var theta = i * 18.0;
			if (Math.abs(theta - 90) < 10) continue; // avoid the wedge
			var ct = Math.cos(theta * Math.PI / 180.0)
			var st = Math.sin(theta * Math.PI / 180.0)

			var rct = rad * ct;
			var rst = rad * st;

			var o = 1 + (Math.random() - 0.5) * 0.3;

			var s = new Shape(new THREE.Vector3(rct, shape.pos.y, rst), 
				new THREE.Vector3(shape.scale.x, o * shape.scale.y, shape.scale.z),
				 -theta, ShapeEnum.Tower, true, shape.iter + 1);
			shapeList.push(s);

			var r = new Shape(new THREE.Vector3(rct, shape.pos.y + 5 * o * shape.scale.y, rst), 
				new THREE.Vector3(0.7 * shape.scale.x, 0.7 * shape.scale.x, 0.7 * shape.scale.z),
				 -theta, ShapeEnum.Roof1, true, shape.iter + 1);
			shapeList.push(r);
		}

		if (shape.type == ShapeEnum.Wall) {
			shape.terminal = true;
			shapeList.push(shape);
		}

	}	

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
						this.placeRadial(this.allShapes[i], newShapes);
						this.buildWallTower(this.allShapes[i], newShapes);
						break;
					case ShapeEnum.Block:
						this.subdivide(this.allShapes[i], newShapes);
						break;
					case ShapeEnum.Wall:
						this.buildWallTower(this.allShapes[i], newShapes);
						break;
					case ShapeEnum.Cyl:
						this.placeRadial(this.allShapes[i], newShapes);
						break;
					case ShapeEnum.Emplacement:
						this.buildEmplacement(this.allShapes[i], newShapes);
						break;
					default:
						newShapes.push(this.allShapes[i]);
						break;
				}
			} else {
				// this shape is terminal. Simply add it to the list
				if (this.allShapes[i].type == ShapeEnum.Block) {
					//this.buildRoof(this.allShapes[i], newShapes);
				}
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