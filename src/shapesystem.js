import Shape from './shape.js'
import Framework from './framework'

function Rule(successor, probability) {
	this.successor = sucessor;
	this.probability = probability;
}

export default function shapeSystem(axiom, grammar, scene) {
	if (axiom instanceof Shape) {
		this.axiom = axiom;
	} else {
		this.axiom = new Shape();
	}

	this.grammar = grammar;
	this.iteration = 0;
	this.scene = scene;

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

	var a = false;

	this.traverse = function(scene) {
		if (a === false) {
			axiom.subdivide();
			a = true;
		}

		axiom.draw(scene, this.iterations);
	}
	// This function returns a linked list that is the result 
	// of expanding the L-system's axiom n times.
	// The implementation we have provided you just returns a linked
	// list of the axiom.
	// this.doIterations = function(n) {
	// 	draw(i, scene) {
	// 		if (i < this.iteration) {
	// 			for(var i = 0; i < this.children.length; i++) {
	// 				this.children.draw(i, scene);
	// 			}
	// 		} else if (i == this.iteration) {
	// 			scene
	// 		} else {
	// 			return;
	// 		}
	// 	}
	// }

}