const THREE = require('three')

// A class that represents functions applied to shapes
function Rule(prob, func) {
	this.prob = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.func = func; // function that applies to shape
}

// TODO: shape call for geometric and Tranformation data
var Shape = function(sym, pos, rot, scale) {
	this.sym = sym;
	this.geo = null;
	this.pos = pos;
	this.rot = rot;
	this.scale = scale;
	this.terminal = false;
}

function copyState(shape) {
	var result = new Shape(shape.sym, shape.pos, shape.rot, shape.scale);
	return result;

}

export default class Buildings {
	constructor(scene, axiom, grammar, iterations) {
		// default LSystem
		this.scene = scene;
		this.axiom = new Shape('B', new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1));
		this.grammar = {};
		this.grammar['B'] = [new Rule(0.25, this.subdivideX.bind(this, 0.75, 0.5)),
							new Rule(0.25, this.subdivideY.bind(this, 0.35, 0.5)),
							new Rule(0.5, this.subdivideZ.bind(this, 0.35, 0.5))];
		this.iterations = 0; 
		this.curr = this.axiom;
		this.shapes = [this.axiom];
		this.color = 0xff1111;
		
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
	}

	clear() {
        this.shapes = [this.axiom];  
        this.curr = this.axiom; 
    }

    // A function to alter the axiom string stored 
	// in the L-system
	updateAxiom(axiom) {
		// Setup axiom
		if (typeof axiom !== "undefined") {
			this.axiom = axiom;
		}
	}

	updateCurr(shape) {
		this.curr.sym = shape.sym;
		this.curr.geo = shape.geo;
		this.curr.rot = shape.rot;
		this.curr.pos = shape.pos;
		this.curr.scale = shape.scale;
		this.curr.terminal = shape.terminal;
	}

	// rule functions
	subdivideX(c, s) {
		// scale and position two partitions
		var len = this.curr.scale.x;
		var zero = this.curr.pos.x - len/2;
		var pos1 = zero + c * len / 2;
		var pos2 = zero + c * len + (1 - c) * len / 2; 
		var s1 = copyState(this.curr);
		s1.pos.x = pos1;
		s1.scale.x = c*len;
		var s2 = copyState(this.curr);
		s2.pos.x = pos2;
		s2.scale.x = (1-c)*len;
		// shrink second partition by s
		s1.scale.y = s;
		s1.pos.y = s1.pos.y - (s2.scale.y - s1.scale.y)/2;
		// replace current with one division and push the other
		this.updateCurr(s1);
		this.shapes.push(s2);
	}

	subdivideY(c, s) {
		// scale and position two partitions
		var len = this.curr.scale.y;
		var zero = this.curr.pos.y - len/2;
		var pos1 = zero + c * len / 2;
		var pos2 = zero + c * len + (1 - c) * len / 2; 
		var s1 = copyState(this.curr);
		s1.pos.y = pos1;
		s1.scale.y = c*len;
		var s2 = copyState(this.curr);
		s2.pos.y = pos2;
		s2.scale.y = (1-c)*len;
		// shrink second partition by s
		s2.scale.x = s; s2.scale.z = s;
		s2.pos.y = s2.pos.y + (s2.scale.y + s1.scale.y)/2;
		s2.sym = "M";
		// replace current with one division and push the other
		this.updateCurr(s1);
		this.shapes.push(s2);
	}

		// rule functions
	subdivideZ(c, s) {
		// scale and position two partitions
		var len = this.curr.scale.z;
		var zero = this.curr.pos.z - len/2;
		var pos1 = zero + c * len / 2;
		var pos2 = zero + c * len + (1 - c) * len / 2; 
		var s1 = copyState(this.curr);
		s1.pos.z = pos1;
		s1.scale.z = c*len;
		var s2 = copyState(this.curr);
		s2.pos.z = pos2;
		s2.scale.z = (1-c)*len;
		// shrink second partition by s
		s1.scale.y = s;
		s1.pos.y = s1.pos.y - (s2.scale.y - s1.scale.y)/2;
		// replace current with one division and push the other
		this.updateCurr(s1);
		this.shapes.push(s2);
	}

	makeOne(shape) {
	  var geometry = new THREE.BoxGeometry(1,1,1);
	  geometry.scale(shape.scale.x, shape.scale.y, shape.scale.z);
	  var material = new THREE.MeshLambertMaterial( {color: 0x333333, emissive: this.color} );
	  var geo = new THREE.Mesh( geometry, material );

	  this.scene.add( geo );

	  //Orient the flower to the turtle's current direction
	  var quat = new THREE.Quaternion();
	  quat.setFromUnitVectors(new THREE.Vector3(0,1,0), shape.rot);
	  var mat4 = new THREE.Matrix4();
	  mat4.makeRotationFromQuaternion(quat);
	  geo.applyMatrix(mat4);

	  //Move the flower so its base rests at the turtle's current position
	  var mat5 = new THREE.Matrix4();
	  mat5.makeTranslation(shape.pos.x, shape.pos.y, shape.pos.z);
	  geo.applyMatrix(mat5);
	};

	makeGeometry(shapes) {
	  for (var i = 0; i < shapes.length; i ++) {
	    this.makeOne(shapes[i]);
	  }
	}

	selectRule(str) {
		var x = Math.random();
		var i = 0;
		var sum = this.grammar[str][i].prob;
		while (x > sum) {
			i = i + 1;
			var rule = this.grammar[str][i];
			sum += this.grammar[str][i].prob;
		}
		return this.grammar[str][i].func;
	}

	// TODO
	// This function returns a list of shapes to be rendered
	doIterations() {	
		for (var i = 0; i < this.iterations; i++) {
			var len = this.shapes.length;
			for (var j = 0; j < len; j ++) {
				this.curr = this.shapes[j];
				// if a rule exists
				if (this.grammar[this.shapes[j].sym] !== undefined) {
					var f = this.selectRule(this.shapes[j].sym);
					f();
				}
			}
		}
		return this.shapes;
	}
}