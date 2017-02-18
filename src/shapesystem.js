const THREE = require('three');
import Shape from './shape.js'
import Framework from './framework'

function Rule(successor, probability) {
	this.successor = sucessor;
	this.probability = probability;
}

export default function shapeSystem(axiom, scene) {
	if (axiom) {
		this.axiom = axiom;
	} else {
		this.axiom = [new Shape()];
	}

	// LOL JK FORGET THIS, JUST GO TO ITERATE I MEAN IT"S JUST THERE, BYE
	// this.grammar = {
	// 	'bottom' : 'create columns',
	// 	'building' : 'createFloors or subdivide',
	// 	'middle': 'possible oning',
	// 	'top': 'add a roof'
	// }; 

	//this.grammar = grammar;
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

	this.traverse = function() {
		for (var i = 0; i < axiom.length; i++) {
			axiom[i].draw(this.scene, this.iterations);
		}
	}

	this.iterate = function() {
		for (var i = 0; i < axiom.length; i++) {
			var a = axiom[i];

			// Iterate
			a.iterate();
		}

		this.traverse();
		

		this.iterations++
		console.log('iterate');
	}
}