const THREE = require('three')

// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.successorString = str; // The string that will replace the char that maps to this Rule
};

// Implement a linked list class and its requisite functions
// as described in the homework writeup
export class Shape {
	constructor(symbol) {
    	this.symbol = symbol;
	    this.position = new THREE.Vector3(0, 0, 0); //WARNING: position is at BOTTOM CENTER of shape, as defined in OBJ files
	    this.rotation = new THREE.Vector3(0, 0, 0);
	    this.scale = new THREE.Vector3(1, 1, 1); //scale.y is the height of shape
	    this.terminal = false;
	    this.geom_type = 'Unknown';
	}
};

//axiom will be a set of shapes
export default class Lsystem {

	constructor(shapes) {
		this.shapes = new Set();
		this.grammar = {};

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
			new Rule(1.0, 'ht')
		];

		//binds grammar to method stored in this class
	    this.renderGrammar = {
	        'b' : this.makeBase.bind(this),
	        'm' : this.makeMiddle.bind(this),
	        'r' : this.makeRoof.bind(this),
	        'f' : this.makeFloors.bind(this),
	        'w' : this.makeWindows.bind(this),

	        'h' : this.makeSkyscraperBase.bind(this),
	        't' : this.makeSkyscraperRoof.bind(this)
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

			var tempShapes = new Set();

			//iterate through the current shapes
			for(var shape of finalShapes.values()) {
				//if shape is terminal, do not replace using grammar, just add to new set
				if (shape.terminal) {
					tempShapes.add(shape);
				}
				else {
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
								            func(tempShapes, shape);
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
	        finalShapes = tempShapes;
    	}

		return finalShapes;
	};

	makeBase(shapeSet, replacedShape) {
		var shape = new Shape('B');
		shape.position = new THREE.Vector3(replacedShape.position.x, replacedShape.position.y, replacedShape.position.z);
		shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y, replacedShape.rotation.z);
		shape.scale = new THREE.Vector3(replacedShape.scale.x, 1, replacedShape.scale.z);
		shape.terminal = false;
		shape.geom_type = 'ApartmentBase';
		shapeSet.add(shape);
	};

	makeRoof(shapeSet, replacedShape) {
		var shape = new Shape('R');
		shape.position = new THREE.Vector3(replacedShape.position.x, replacedShape.position.y + replacedShape.scale.y - 1.0, replacedShape.position.z);
		shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y, replacedShape.rotation.z);
		shape.scale = new THREE.Vector3(replacedShape.scale.x, 1, replacedShape.scale.z);
		shape.terminal = false;
		shape.geom_type = 'ApartmentRoof';
		shapeSet.add(shape);
	};

	makeMiddle(shapeSet, replacedShape) {
		var shape = new Shape('M');
		shape.position = new THREE.Vector3(replacedShape.position.x, replacedShape.position.y + 2.0, replacedShape.position.z);
		shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y, replacedShape.rotation.z);
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
			shape.position = new THREE.Vector3(replacedShape.position.x, replacedShape.position.y + sumFloorHeight, replacedShape.position.z);
			shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y, replacedShape.rotation.z);
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
		var xPos = replacedShape.position.x + (replacedShape.scale.x/2.0) - 0.5;
		var zPos = replacedShape.position.z + (replacedShape.scale.z/2.0) - 0.5;
		var endXPos = replacedShape.position.x - (replacedShape.scale.x/2.0) + 0.5;
		while (xPos > endXPos) {
			var shape = new Shape('W');
			shape.position = new THREE.Vector3(xPos, replacedShape.position.y, zPos);
			shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y, replacedShape.rotation.z);
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
		xPos = replacedShape.position.x + (replacedShape.scale.x/2.0) - 0.5;
		zPos = replacedShape.position.z - (replacedShape.scale.z/2.0) + 0.5;
		var endZPos = replacedShape.position.z + (replacedShape.scale.z/2.0) - 0.5;
		while (zPos < endZPos) {
			var shape = new Shape('W');
			shape.position = new THREE.Vector3(xPos, replacedShape.position.y, zPos);
			shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y + 90.0, replacedShape.rotation.z);
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
		xPos = replacedShape.position.x - (replacedShape.scale.x/2.0) + 0.5;
		zPos = replacedShape.position.z - (replacedShape.scale.z/2.0) + 0.5;
		endXPos = replacedShape.position.x + (replacedShape.scale.x/2.0) - 0.5;
		while (xPos < endXPos) {
			var shape = new Shape('W');
			shape.position = new THREE.Vector3(xPos, replacedShape.position.y, zPos);
			shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y + 180.0, replacedShape.rotation.z);
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
		xPos = replacedShape.position.x - (replacedShape.scale.x/2.0) + 0.5;
		zPos = replacedShape.position.z + (replacedShape.scale.z/2.0) - 0.5;
		endZPos = replacedShape.position.z - (replacedShape.scale.z/2.0) + 0.5;
		while (zPos > endZPos) {
			var shape = new Shape('W');
			shape.position = new THREE.Vector3(xPos, replacedShape.position.y, zPos);
			shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y + 270.0, replacedShape.rotation.z);
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
		var xPos = replacedShape.position.x + (replacedShape.scale.x/2.0) - 0.5;
		var zPos = replacedShape.position.z + (replacedShape.scale.z/2.0) - 0.5;
		var endXPos = replacedShape.position.x - (replacedShape.scale.x/2.0) + 0.5;
		while (xPos > endXPos) {
			var shape = new Shape('H');
			shape.position = new THREE.Vector3(xPos, replacedShape.position.y, zPos);
			shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y, replacedShape.rotation.z);
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
		xPos = replacedShape.position.x + (replacedShape.scale.x/2.0) - 0.5;
		zPos = replacedShape.position.z - (replacedShape.scale.z/2.0) + 0.5;
		var endZPos = replacedShape.position.z + (replacedShape.scale.z/2.0) - 0.5;
		while (zPos < endZPos) {
			var shape = new Shape('H');
			shape.position = new THREE.Vector3(xPos, replacedShape.position.y, zPos);
			shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y + 90.0, replacedShape.rotation.z);
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
		xPos = replacedShape.position.x - (replacedShape.scale.x/2.0) + 0.5;
		zPos = replacedShape.position.z - (replacedShape.scale.z/2.0) + 0.5;
		endXPos = replacedShape.position.x + (replacedShape.scale.x/2.0) - 0.5;
		while (xPos < endXPos) {
			var shape = new Shape('H');
			shape.position = new THREE.Vector3(xPos, replacedShape.position.y, zPos);
			shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y + 180.0, replacedShape.rotation.z);
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
		xPos = replacedShape.position.x - (replacedShape.scale.x/2.0) + 0.5;
		zPos = replacedShape.position.z + (replacedShape.scale.z/2.0) - 0.5;
		endZPos = replacedShape.position.z - (replacedShape.scale.z/2.0) + 0.5;
		while (zPos > endZPos) {
			var shape = new Shape('H');
			shape.position = new THREE.Vector3(xPos, replacedShape.position.y, zPos);
			shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y + 270.0, replacedShape.rotation.z);
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
		shape.position = new THREE.Vector3(replacedShape.position.x, replacedShape.position.y + replacedShape.scale.y - 1.0, replacedShape.position.z);
		shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y, replacedShape.rotation.z);
		shape.scale = new THREE.Vector3(replacedShape.scale.x, 1, replacedShape.scale.z);
		shape.terminal = true;
		shape.geom_type = 'SkyscraperRoof';
		shapeSet.add(shape);
	}

}