const THREE = require('three')

// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.successorString = str; // The string that will replace the char that maps to this Rule
};

// Implement a linked list class and its requisite functions
// as described in the homework writeup
// WARNING: position is at BOTTOM CENTER of shape, as defined in OBJ files
export class Shape {
	constructor(symbol) {
    	this.symbol = symbol;
	    //this.position = new THREE.Vector3(0, 0, 0); 
	    //this.rotation = new THREE.Vector3(0, 0, 0);
	    this.mat; //keeps track of position and rotation
	    this.scale; //scale.y is the height of shape
	    this.terminal;
	    this.geom_type;
	}
};

//axiom will be a set of shapes
export default class Lsystem {

	constructor(shapes) {
		this.shapes = new Set();
		this.grammar = {};

		//splitting into building rules
		this.grammar['N'] = [
			new Rule(1.0, 'x')
		];
		this.grammar['X'] = [
			new Rule(1.0, 'v')
		];

		//apartment rules
		this.grammar['A'] = [
			new Rule(1.0, 'bmr')
		];
		this.grammar['M'] = [
			new Rule(1.0, 'f')
		];
		this.grammar['F'] = [
			new Rule(1.0, 'w')
		];
		this.grammar['B'] = [
			new Rule(1.0, 'w')
		];
		this.grammar['R'] = [
			new Rule(1.0, 'w')
		];

		//skyscraper rules
		this.grammar['S'] = [
			new Rule(0.6, 'ht'),
			new Rule(0.4, 'g')
		];
		this.grammar['U'] = [
			new Rule(1.0, 'ht')
		];

		//binds grammar to method stored in this class
	    this.renderGrammar = {
	        'x' : this.splitStreet.bind(this),
	        'v' : this.splitStreetSide.bind(this),

	        'b' : this.makeBase.bind(this),
	        'm' : this.makeMiddle.bind(this),
	        'r' : this.makeRoof.bind(this),
	        'f' : this.makeFloors.bind(this),
	        'w' : this.makeWindows.bind(this),

	        'h' : this.makeSkyscraperBase.bind(this),
	        't' : this.makeSkyscraperRoof.bind(this),
	        'g' : this.stackSkyscraper.bind(this)
	    };
	    
		// Set up the axiom shapes
		if (typeof shapes !== "undefined") {
			this.shapes = shapes;
		}
	};

	// A function to alter the axiom string stored 
	// in the L-system
	updateShapes(shapes) {
		// Setup axiom
		if (typeof shapes !== "undefined") {
			this.shapes = shapes;
		}
	};

	// This function returns a shapeset that is the result 
	// of expanding the L-system's shapes n times.
	doIterations(n) {	

		var finalShapes = this.shapes;

		for (var count = 0; count < n; count++) {
			//iterate through the current shapes
			for(var shape of finalShapes.values()) {

				//if shape is terminal, do not replace using grammar
				if (!shape.terminal) {
					//iterate through the grammar to find matching symbol
					for (var key in this.grammar) {
						if (shape.symbol === key) {
							var seed = Math.random();
							var sumProbability = 0.0;
							//iterate through the rules for matched symbol, using probability to pick a rule
							for (var i = 0; i < this.grammar[key].length; i++) {
								var rule = this.grammar[key][i];
								sumProbability += rule.probability;
								if (seed <= sumProbability) {

									//walk through successor string and apply each function to shape
									for (var j = 0; j < rule.successorString.length; j++) {
										var successor = rule.successorString[j];
										//get the bind function associated with symbol
										var func = this.renderGrammar[successor];
								        if (func) {
								            func(finalShapes, shape);
								            finalShapes.delete(shape);
								        }
							    	}

							        //break forloop through rules, since rule is found
									break;
								}
							}
							//break forloop through grammar, since symbol is found
							break;
						}
					}

				}
	        }
    	}

		return finalShapes;
	};

	splitStreet(shapeSet, replacedShape) {

		var buildingScaleX = 3.0*replacedShape.scale.x/5.0;
		var buildingScaleZ = replacedShape.scale.z/9.0 + 2.0;
		//offset buildings from center of street
		var displacement = (buildingScaleZ / 2.0) + 5.0;

		var shape1 = new Shape('X');
		shape1.mat = new THREE.Matrix4().copy(replacedShape.mat);
		//apply translation
	 	shape1.mat.multiply(new THREE.Matrix4().makeTranslation(0.0, 0.0, displacement));
	 	//apply scale
		shape1.scale = new THREE.Vector3( buildingScaleX, replacedShape.scale.y, buildingScaleZ);
		shape1.terminal = false;
		shape1.geom_type = 'StreetSide';
		shapeSet.add(shape1);

		var shape2 = new Shape('X');
		shape2.mat = new THREE.Matrix4().copy(replacedShape.mat);
		//apply translation
	 	shape2.mat.multiply(new THREE.Matrix4().makeTranslation(0.0, 0.0, -displacement));
	 	//apply scale
		shape2.scale = new THREE.Vector3( buildingScaleX, replacedShape.scale.y, buildingScaleZ);
		shape2.terminal = false;
		shape2.geom_type = 'StreetSide';
		shapeSet.add(shape2);
	};

	splitStreetSide(shapeSet, replacedShape) {
		var buildingType;
		var geometryType;
		var totalX = 0;
		var maxX = Math.round(replacedShape.scale.x);
		while (totalX < maxX) {
			var spaceBetweenBuilding = Math.round(Math.random() * 3.0) + 2.0;
			totalX = totalX + spaceBetweenBuilding;
			var buildingScaleX = Math.round(Math.random() * replacedShape.scale.x / 3.0) + 5.0;
			//if over the maximum width, clamp it
			if (totalX + buildingScaleX > maxX) {
				buildingScaleX = maxX - totalX;
			}
			if (buildingScaleX >= 5.0) {

				//add a little bit of randomness to the height of building
				var height = Math.max(Math.round(replacedShape.scale.y + Math.random()*10.0), 5.0);
				//type of building depends on the height
				if (height > 30.0) {
					buildingType = 'S';
					geometryType = 'Skyscraper';
				}
				else {
					buildingType = 'A';
					geometryType = 'Apartment';
				}

				var shape1 = new Shape(buildingType);
				shape1.geom_type = geometryType;
				shape1.mat = new THREE.Matrix4().copy(replacedShape.mat);

				//apply translation
				var dx = totalX + (buildingScaleX/2.0) - (replacedShape.scale.x/2.0);
			 	shape1.mat.multiply(new THREE.Matrix4().makeTranslation(dx, 0.0, 0.0));

			 	//add a little bit of randomness to z scale of building
			 	var buildingScaleZ = Math.max(replacedShape.scale.z - Math.round(-Math.random()*4.0+2.0), 4.0);
			 	//set the width to be buildingScaleX
				shape1.scale = new THREE.Vector3(buildingScaleX, height, buildingScaleZ);
				shape1.terminal = false;
				shapeSet.add(shape1);
				totalX = totalX + buildingScaleX;
			}
		}
	};

	makeBase(shapeSet, replacedShape) {
		var shape = new Shape('B');
		shape.mat = new THREE.Matrix4().copy(replacedShape.mat);
		shape.scale = new THREE.Vector3(replacedShape.scale.x, 1, replacedShape.scale.z);
		shape.terminal = false;
		shape.geom_type = 'ApartmentBase';
		shapeSet.add(shape);
	};

	makeRoof(shapeSet, replacedShape) {
		var shape = new Shape('R');
		shape.mat = new THREE.Matrix4().copy(replacedShape.mat);

		//apply translation
		var mat6 = new THREE.Matrix4();
	 	mat6.makeTranslation(0.0, replacedShape.scale.y - 1.0, 0.0);
	 	shape.mat.multiply(mat6);

		shape.scale = new THREE.Vector3(replacedShape.scale.x, 1, replacedShape.scale.z);
		shape.terminal = false;
		shape.geom_type = 'ApartmentRoof';
		shapeSet.add(shape);

		var roofCenter = new Shape('C');
		roofCenter.mat = new THREE.Matrix4().copy(replacedShape.mat);
	 	roofCenter.mat.multiply(mat6);
	 	roofCenter.scale = new THREE.Vector3(replacedShape.scale.x-2.0, 1.0, replacedShape.scale.z-2.0);
	 	roofCenter.terminal = true;
	 	roofCenter.geom_type = 'ApartmentRoofCenter';
	 	shapeSet.add(roofCenter);
	};

	makeMiddle(shapeSet, replacedShape) {
		var shape = new Shape('M');
		shape.mat = new THREE.Matrix4().copy(replacedShape.mat);

		//apply translation
	 	shape.mat.multiply(new THREE.Matrix4().makeTranslation(0, 2.0, 0));

		shape.scale = new THREE.Vector3(replacedShape.scale.x, replacedShape.scale.y - 3.0, replacedShape.scale.z);
		shape.terminal = false;
		shape.geom_type = 'ApartmentMiddle';
		shapeSet.add(shape);
	};

	makeFloors(shapeSet, replacedShape) {
		var sumFloorHeight = 0;
		while (sumFloorHeight < replacedShape.scale.y) {
			var floorHeight = Math.round(1.0 + Math.random());
			if (sumFloorHeight + floorHeight >  replacedShape.scale.y) {
				floorHeight = 1;
			}
			var shape = new Shape('F');
			shape.mat = new THREE.Matrix4().copy(replacedShape.mat);

			//apply translation
		 	shape.mat.multiply(new THREE.Matrix4().makeTranslation(0, sumFloorHeight, 0));

			shape.scale = new THREE.Vector3(replacedShape.scale.x, floorHeight, replacedShape.scale.z);
			shape.terminal = false;
			if (floorHeight == 1) {
				shape.geom_type = 'ApartmentFloor1';
			}
			else {
				shape.geom_type = 'ApartmentFloor2';
			}
			shapeSet.add(shape);
			sumFloorHeight += floorHeight;
		}
	};

	makeWindows(shapeSet, replacedShape) {

		//determine the type of windows to make
		var side_type, corner_type;
		if (replacedShape.geom_type === 'ApartmentFloor1') {
			side_type = 'ApartmentFloorSide1';
			corner_type = 'ApartmentFloorCorner1';
		}
		else if (replacedShape.geom_type === 'ApartmentFloor2'){
			side_type = 'ApartmentFloorSide2';
			corner_type = 'ApartmentFloorCorner2';
		}
		else if (replacedShape.geom_type === 'ApartmentBase') {
			side_type = 'ApartmentBaseSide';
			corner_type = 'ApartmentBaseCorner';
		}
		else {
			side_type = 'ApartmentRoofSide';
			corner_type = 'ApartmentRoofCorner';
		}

		//boolean to see whether shape created is corner or side
		var isCorner = true;

		//front side of floor
		var xPos = (replacedShape.scale.x/2.0) - 0.5;
		var zPos = (replacedShape.scale.z/2.0) - 0.5;
		var endXPos = -(replacedShape.scale.x/2.0) + 0.5;
		while (xPos > endXPos) {
			var shape = new Shape('W');
			shape.mat = new THREE.Matrix4().copy(replacedShape.mat);

			//apply translation
		 	shape.mat.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));

			shape.scale = new THREE.Vector3(1.0, 1.0, 1.0);
			shape.terminal = true;
			if (isCorner) {
				shape.geom_type = corner_type;
				isCorner = false;
			}
			else {
				shape.geom_type = side_type;
			}
			shapeSet.add(shape);
			xPos -= 1;
		}
		isCorner = true;

		//right side of floor (if positive z axis is facing toward you)
		xPos = (replacedShape.scale.x/2.0) - 0.5;
		zPos = -(replacedShape.scale.z/2.0) + 0.5;
		var endZPos = (replacedShape.scale.z/2.0) - 0.5;
		while (zPos < endZPos) {
			var shape = new Shape('W');
			shape.mat = new THREE.Matrix4().copy(replacedShape.mat);

			//apply translation
		 	shape.mat.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));

		 	//apply rotation
		 	shape.mat.multiply(new THREE.Matrix4().makeRotationFromQuaternion(
		 		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/2.0)
		 		));

			shape.scale = new THREE.Vector3(1.0, 1.0, 1.0);
			shape.terminal = true;
			if (isCorner) {
				shape.geom_type = corner_type;
				isCorner = false;
			}
			else {
				shape.geom_type = side_type;
			}
			shapeSet.add(shape);
			zPos += 1;
		}
		isCorner = true;

		//back side of floor
		xPos = -(replacedShape.scale.x/2.0) + 0.5;
		zPos = -(replacedShape.scale.z/2.0) + 0.5;
		endXPos = (replacedShape.scale.x/2.0) - 0.5;
		while (xPos < endXPos) {
			var shape = new Shape('W');
			shape.mat = new THREE.Matrix4().copy(replacedShape.mat);

			//apply translation
		 	shape.mat.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));

		 	//apply rotation
		 	shape.mat.multiply(new THREE.Matrix4().makeRotationFromQuaternion(
		 		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
		 		));

			shape.scale = new THREE.Vector3(1.0, 1.0, 1.0);
			shape.terminal = true;
			if (isCorner) {
				shape.geom_type = corner_type;
				isCorner = false;
			}
			else {
				shape.geom_type = side_type;
			}
			shapeSet.add(shape);
			xPos += 1;
		}
		isCorner = true;

		//left side of floor
		xPos = -(replacedShape.scale.x/2.0) + 0.5;
		zPos = (replacedShape.scale.z/2.0) - 0.5;
		endZPos = -(replacedShape.scale.z/2.0) + 0.5;
		while (zPos > endZPos) {
			var shape = new Shape('W');
			shape.mat = new THREE.Matrix4().copy(replacedShape.mat);

			//apply translation
		 	shape.mat.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));

			//apply rotation
		 	shape.mat.multiply(new THREE.Matrix4().makeRotationFromQuaternion(
		 		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 3.0*Math.PI/2.0)
		 		));

			shape.scale = new THREE.Vector3(1.0, 1.0, 1.0);
			shape.terminal = true;
			if (isCorner) {
				shape.geom_type = corner_type;
				isCorner = false;
			}
			else {
				shape.geom_type = side_type;
			}
			shapeSet.add(shape);
			zPos -= 1;
		}
		isCorner = true;
	}

	makeSkyscraperBase(shapeSet, replacedShape) {

		//determine the type of windows to make
		var side_type = 'SkyscraperSide';
		var corner_type = 'SkyscraperCorner';

		//boolean to see whether shape created is corner or side
		var isCorner = true;

		//front side of floor
		var xPos = (replacedShape.scale.x/2.0) - 0.5;
		var zPos = (replacedShape.scale.z/2.0) - 0.5;
		var endXPos = -(replacedShape.scale.x/2.0) + 0.5;
		while (xPos > endXPos) {
			var shape = new Shape('W');
			shape.mat = new THREE.Matrix4().copy(replacedShape.mat);

			//apply translation
		 	shape.mat.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));

			shape.scale = new THREE.Vector3(1.0, replacedShape.scale.y - 1.0, 1.0);
			shape.terminal = true;
			if (isCorner) {
				shape.geom_type = corner_type;
				isCorner = false;
			}
			else {
				shape.geom_type = side_type;
			}
			shapeSet.add(shape);
			xPos -= 1;
		}
		isCorner = true;

		//right side of floor (if positive z axis is facing toward you)
		xPos = (replacedShape.scale.x/2.0) - 0.5;
		zPos = -(replacedShape.scale.z/2.0) + 0.5;
		var endZPos = (replacedShape.scale.z/2.0) - 0.5;
		while (zPos < endZPos) {
			var shape = new Shape('W');
			shape.mat = new THREE.Matrix4().copy(replacedShape.mat);

			//apply translation
		 	shape.mat.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));

		 	//apply rotation
		 	shape.mat.multiply(new THREE.Matrix4().makeRotationFromQuaternion(
		 		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/2.0)
		 		));

			shape.scale = new THREE.Vector3(1.0, replacedShape.scale.y - 1.0, 1.0);
			shape.terminal = true;
			if (isCorner) {
				shape.geom_type = corner_type;
				isCorner = false;
			}
			else {
				shape.geom_type = side_type;
			}
			shapeSet.add(shape);
			zPos += 1;
		}
		isCorner = true;

		//back side of floor
		xPos = -(replacedShape.scale.x/2.0) + 0.5;
		zPos = -(replacedShape.scale.z/2.0) + 0.5;
		endXPos = (replacedShape.scale.x/2.0) - 0.5;
		while (xPos < endXPos) {
			var shape = new Shape('W');
			shape.mat = new THREE.Matrix4().copy(replacedShape.mat);

			//apply translation
		 	shape.mat.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));

		 	//apply rotation
		 	shape.mat.multiply(new THREE.Matrix4().makeRotationFromQuaternion(
		 		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
		 		));

			shape.scale = new THREE.Vector3(1.0, replacedShape.scale.y - 1.0, 1.0);
			shape.terminal = true;
			if (isCorner) {
				shape.geom_type = corner_type;
				isCorner = false;
			}
			else {
				shape.geom_type = side_type;
			}
			shapeSet.add(shape);
			xPos += 1;
		}
		isCorner = true;

		//left side of floor
		xPos = -(replacedShape.scale.x/2.0) + 0.5;
		zPos = (replacedShape.scale.z/2.0) - 0.5;
		endZPos = -(replacedShape.scale.z/2.0) + 0.5;
		while (zPos > endZPos) {
			var shape = new Shape('W');
			shape.mat = new THREE.Matrix4().copy(replacedShape.mat);

			//apply translation
		 	shape.mat.multiply(new THREE.Matrix4().makeTranslation(xPos, 0, zPos));

			//apply rotation
		 	shape.mat.multiply(new THREE.Matrix4().makeRotationFromQuaternion(
		 		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 3.0*Math.PI/2.0)
		 		));

			shape.scale = new THREE.Vector3(1.0, replacedShape.scale.y - 1.0, 1.0);
			shape.terminal = true;
			if (isCorner) {
				shape.geom_type = corner_type;
				isCorner = false;
			}
			else {
				shape.geom_type = side_type;
			}
			shapeSet.add(shape);
			zPos -= 1;
		}
		isCorner = true;

	}

	makeSkyscraperRoof(shapeSet, replacedShape) {
		var shape = new Shape('T');
		shape.mat = new THREE.Matrix4().copy(replacedShape.mat);
	 	shape.mat.multiply(new THREE.Matrix4().makeTranslation(0, replacedShape.scale.y - 1.0, 0));
	 	//scale the edges down a litle bit, to match window thickness (exact numbers from obj file)
		shape.scale = new THREE.Vector3(replacedShape.scale.x-0.146*2, 1, replacedShape.scale.z-0.146*2);
		shape.terminal = true;
		shape.geom_type = 'SkyscraperRoof';
		shapeSet.add(shape);
	}

	stackSkyscraper(shapeSet, replacedShape) {

		//base case, if skyscraper is getting too small
		if (replacedShape.scale.x <= 4.0 || replacedShape.scale.z <= 4.0 || replacedShape.scale.y <= 7.0) {
			//does not stack anymore, type 'U'
			var skyscraper = new Shape('U');
			skyscraper.mat = new THREE.Matrix4().copy(replacedShape.mat);
			skyscraper.scale = new THREE.Vector3(replacedShape.scale.x, replacedShape.scale.y, replacedShape.scale.z);
			skyscraper.terminal = false;
			skyscraper.geom_type = 'Skyscraper';
			shapeSet.add(skyscraper);
			return;
		}

		//bottom does not stack anymore, type 'U'
		var bottomHeight = Math.round(replacedShape.scale.y / 2.618);
		var bottomSkyscraper = new Shape('U');
		bottomSkyscraper.mat = new THREE.Matrix4().copy(replacedShape.mat);
		bottomSkyscraper.scale = new THREE.Vector3(replacedShape.scale.x, bottomHeight, replacedShape.scale.z);
		bottomSkyscraper.terminal = false;
		bottomSkyscraper.geom_type = 'Skyscraper';
		shapeSet.add(bottomSkyscraper);

		//top can continue to stack, type 'S'
		var topSkyscraper = new Shape('S');
		topSkyscraper.mat = new THREE.Matrix4().copy(replacedShape.mat);
		//apply translation
	 	topSkyscraper.mat.multiply(new THREE.Matrix4().makeTranslation(0, bottomHeight, 0));
	 	//apply scale, height is original - bottomHeight, scale down x and z
		topSkyscraper.scale = new THREE.Vector3(replacedShape.scale.x-1.0, replacedShape.scale.y-bottomHeight, replacedShape.scale.z-1.0);
		topSkyscraper.terminal = false;
		topSkyscraper.geom_type = 'Skyscraper';
		shapeSet.add(topSkyscraper);
	}

}