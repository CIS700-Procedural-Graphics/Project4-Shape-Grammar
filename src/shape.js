const THREE = require('three')

// A class that represents functions applied to shapes
function Rule(prob, func) {
	this.prob = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	// this.cond = cond; // a condition required to apply this rule
	this.func = func; // function that applies to shape
}

var scope;


// TODO: shape call for geometric and Tranformation data
var Shape = function(sym, pos, rot, scale) {
	this.sym = sym;
	this.geo = null;
	this.color = 0x000000;
	this.pos = pos;
	this.rot = rot;
	this.scale = scale;
	this.terminal = false;
}

function copyState(shape) {
	var position = new THREE.Vector3();
	var rotation = new THREE.Vector3();
	var size = new THREE.Vector3();
	position.copy(shape.pos);
	rotation.copy(shape.rot);
	size.copy(shape.scale);
	var result = new Shape(shape.sym, position, rotation, size);
	
	return result;
}

export default class Building {
	constructor(scene, pos, rot, scale, iterations) {
		// default LSystem
		this.scene = scene;
		this.axiom = new Shape('B', pos, rot, scale);
		this.grammar = {};
		this.grammar['B'] = [new Rule(0.25, this.subdivideX(0.5, 0.5)),
							new Rule(0.25, this.subdivideY(0.5, 0.5)),
							new Rule(0.5, this.subdivideZ(0.5, 0.5))];
		this.iterations = 1; 
		this.curr = this.axiom;
		this.shapes = [this.axiom];
		this.color = 0xff1111;
		this.sizeX = 0.5;
		this.sizeZ = 0.5;
		scope = this;
		
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
		return function() {
			var len = scope.curr.scale.x;
			var zero = scope.curr.pos.x - len/2;
			var pos1 = zero + c * len / 2;
			var pos2 = zero + c * len + (1 - c) * len / 2; 
			var s1 = copyState(scope.curr);
			s1.pos.x = pos1;
			s1.scale.x = c*len;
			var s2 = copyState(scope.curr);
			s2.pos.x = pos2;
			s2.scale.x = (1-c)*len;
			// shrink second partition by s
			s1.scale.y *= s;
			s1.pos.y = s1.pos.y - (s2.scale.y - s1.scale.y)/2;
			// replace current with one division and push the other
			scope.updateCurr(s1);
			scope.shapes.push(s2);
		}
	}

	subdivideY(c, s) {
		return function() {
		
			var len = scope.curr.scale.y;
			var zero = scope.curr.pos.y - len/2;
			var pos1 = zero + c * len / 2;
			var pos2 = zero + c * len + (1 - c) * len / 2; 
			var s1 = copyState(scope.curr);
			s1.pos.y = pos1;
			s1.scale.y = c*len;
			var s2 = copyState(scope.curr);
			s2.pos.y = pos2;
			s2.scale.y = (1-c)*len;
			// shrink second partition by s
			s2.scale.x *= s; s2.scale.z *= s;
			//s2.pos.y = s2.pos.y + (s2.scale.y + s1.scale.y)/2;
			s1.sym = "M";
			// replace current with one division and push the other
			scope.updateCurr(s1);
			scope.shapes.push(s2);
		}
		
	}

	subdivideZ(c, s) {
		return function() {
			var len = scope.curr.scale.z;
			var zero = scope.curr.pos.z - len/2;
			var pos1 = zero + c * len / 2;
			var pos2 = zero + c * len + (1 - c) * len / 2; 
			var s1 = copyState(scope.curr);
			s1.pos.z = pos1;
			s1.scale.z = c*len;
			var s2 = copyState(scope.curr);
			s2.pos.z = pos2;
			s2.scale.z = (1-c)*len;
			// shrink second partition by s
			s1.scale.y *= s;
			s1.pos.y = s1.pos.y - (s2.scale.y - s1.scale.y)/2;
			// replace current with one division and push the other
			scope.updateCurr(s1);
			scope.shapes.push(s2);
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