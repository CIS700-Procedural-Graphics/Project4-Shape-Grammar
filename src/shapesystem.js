const THREE = require('three');
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
			axiom.createFloors(3);
			//axiom.subdivide();
			a = true;
		}

		axiom.draw(scene, this.iterations);
	}

	// Returns a (1, 1, 1) rectangular prism with the top shrunk in so that when scaled
	// to the input it looks like a oning of a building in the forbidden city
	this.createOningGeometry = function(scale, width) {
	  if (!width) {
	  	width = 1.0; // Standard width of the oning
	  }

	  var oning = new THREE.BoxGeometry( 1.0, 1.0, 1.0 );
	  var v = oning.vertices; 

	  console.log(oning.vertices);
	  var sx = (scale.x - width) / (scale.x * 2.0);
	  var sz = (scale.z - width) / (scale.z * 2.0);

	  v[0].set(sx, 0.5, sz);
	  v[1].set(sx, 0.5, -sz);
	  v[4].set(-sx, 0.5, -sz);
	  v[5].set(-sx, 0.5, sz);
	  var oning_mesh = new THREE.Mesh(oning, new THREE.MeshLambertMaterial());
	  oning_mesh.scale.set(scale.x, scale.y, scale.z);
	  return oning_mesh;
	}

	this.createRoofGeometry = function(scale, width) {
		if (!width) {
			width = 2.0;
		}

		var roof = new THREE.BoxGeometry( 1.0, 1.0, 1.0 );
		var v = roof.vertices;

		var sx, sz;
		if (scale.x >= scale.z) {
			sx = (scale.x - width) / (scale.x * 2.0);
			sz = 0.0;
		} else { // scale.z > scale.x
			sx = 0.0;
			sz = (scale.z - width) / (scale.z * 2.0);
		}

		v[0].set(sx, 0.5, sz);
		v[1].set(sx, 0.5, -sz);
		v[4].set(-sx, 0.5, -sz);
		v[5].set(-sx, 0.5, sz);
		
		var roof_mesh = new THREE.Mesh(roof, new THREE.MeshLambertMaterial());
		roof_mesh.scale.set(scale.x, scale.y, scale.z);

		return roof_mesh;
	}

}