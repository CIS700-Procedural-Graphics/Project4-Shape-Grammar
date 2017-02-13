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
	    this.position = new THREE.Vector3(0, 0, 0); //WARNING: position is at the BOTTOM of the shape
	    this.rotation = new THREE.Vector3(0, 0, 0);
	    this.scale = new THREE.Vector3(1, 1, 1); //scale.y is the height of shape
	    this.terminal = false;
	}
};

//axiom will be a set of shapes
export default class Lsystem {

	constructor(shapes, iterations) {
		this.shapes = new Set();
		this.grammar = {};
		this.grammar['X'] = [
			new Rule(1.0, 'bmr')
		];
		/*
		this.grammar['M'] = [
			new Rule(1.0, 'f')
		];
		*/
		this.iterations = 0;

		//binds grammar to method stored in this class
	    this.renderGrammar = {
	        'b' : this.makeBase.bind(this),
	        'm' : this.makeMiddle.bind(this),
	        'r' : this.makeRoof.bind(this)
	        //'f' : this.makeFloors.bind(this)
	    };
	    
		// Set up the axiom shapes
		if (typeof shapes !== "undefined") {
			this.shapes = shapes;
		}
		// Set up iterations (the number of times you 
		// should expand the axiom in DoIterations)
		if (typeof iterations !== "undefined") {
			this.iterations = iterations;
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
		console.log(finalShapes);

		for (var count = 0; count < n; count++) {

			var tempShapes = new Set();
			console.log("count");
			//iterate through the current shapes
			for(var shape of finalShapes.values()) {
				console.log("inside this");
				//if shape is terminal, do not replace using grammar, just add to new set
				if (shape.terminal) {
					tempShapes.add(shape);
				}
				else {
					console.log('iterating');
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

    	console.log(finalShapes);
		return finalShapes;
	};

	makeBase(shapeSet, replacedShape) {
		var shape = new Shape('B');
		shape.position = new THREE.Vector3(replacedShape.position.x, replacedShape.position.y, replacedShape.position.z);
		shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y, replacedShape.rotation.z);
		shape.scale = new THREE.Vector3(replacedShape.scale.x, 1, replacedShape.scale.z);
		shape.terminal = true;
		shapeSet.add(shape);
	};

	makeMiddle(shapeSet, replacedShape) {
		var shape = new Shape('M');
		shape.position = new THREE.Vector3(replacedShape.position.x, replacedShape.position.y + 1.0, replacedShape.position.z);
		shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y, replacedShape.rotation.z);
		shape.scale = new THREE.Vector3(replacedShape.scale.x, replacedShape.scale.y - 2.0, replacedShape.scale.z);
		shape.terminal = true;
		shapeSet.add(shape);
	};

	makeRoof(shapeSet, replacedShape) {
		var shape = new Shape('R');
		shape.position = new THREE.Vector3(replacedShape.position.x, replacedShape.position.y + replacedShape.scale.y - 1.0, replacedShape.position.z);
		shape.rotation = new THREE.Vector3(replacedShape.rotation.x, replacedShape.rotation.y, replacedShape.rotation.z);
		shape.scale = new THREE.Vector3(replacedShape.scale.x, 1, replacedShape.scale.z);
		shape.terminal = true;
		shapeSet.add(shape);
	};

	/*
	makeFloors(shapeSet, replacedShape) {

	};
	*/

}