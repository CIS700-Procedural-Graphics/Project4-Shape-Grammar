const THREE = require('three')

// A class that represents functions applied to blocks
function Rule(prob, func) {
	this.prob = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	// this.cond = cond; // a condition required to apply this rule
	this.func = func; // function that applies to the block
}

var scope;
var cityX = 30; var cityZ = 30;
var blockWidth = 4;

// block defined by its four corners
var Block = function(sym) {
	this.sym = sym;
	// Vector2
	this.p = [];
	this.p.push(new THREE.Vector3(0,0,0));				// p4	----	p3
	this.p.push(new THREE.Vector3(cityX,0,0)); 		// |			|
	this.p.push(new THREE.Vector3(cityX,0,cityZ));	// |			|
	this.p.push(new THREE.Vector3(0,0,cityZ));		// p1	----	p2
	this.center = new THREE.Vector3();
	this.x = true; 
	this.z = true;
}

function computeCentroid(block) {
	var p1 = new THREE.Vector3();
	var p2 = new THREE.Vector3();
	var centroid = new THREE.Vector3();
	var area = 0;
	var sArea = 0;
	for (var i = 0; i < 4; i++) {
		p1 = block.p[i];
		p2 = block.p[(i+1)%4];
		area = p1.x * p2.z - p2.x * p1.z;
		sArea += area;
		centroid.x += (p1.x + p2.x)*area;
		centroid.z += (p1.z + p2.z)*area;
	}
	sArea *= 0.5;
	centroid.x /= (6*sArea);
	centroid.z /= (6*sArea);
	block.center = centroid;
}

// function to return a NEW Block with the same parameters as the input
function copyState(block) {
	var result = new Block(block.sym)
	result.terminal = block.terminal;
	result.p[0].copy(block.p[0]);
	result.p[1].copy(block.p[1]);
	result.p[2].copy(block.p[2]);
	result.p[3].copy(block.p[3]);
	return result;
}

function cubicPulse(center, width, x) {
  	x = Math.abs(x - center);
   	if (x > width) return 0;
   	x /= width;
   	return 1 - x*x*(3-2*x);
}
	
// return a value between probability between 0.25 - 0.75 (avoid tiny blocks)
function cutEdge() {
	var x = Math.random(); // [0,1)
	//var value = cubicPulse(0.5, 0.5, x); // [0,1) with higher probability around 0.5
	return x * 0.4 + 0.3;
}

export default class Layout {
	constructor(scene, iterations) {
		this.scene = scene;
		this.axiom = new Block('B');
		this.grammar = {};
		this.grammar['B'] = [new Rule(0.5, this.subdivide(0, 1)),
							new Rule(0.5, this.subdivide(1, 1))];
		this.iterations = 3; 
		this.curr = this.axiom;
		this.blocks = [this.axiom];

		scope = this;
	
		// Set up iterations (the number of times you 
		// should expand the axiom in DoIterations)
		if (typeof iterations !== "undefined") {
			this.iterations = iterations;
		}
	}

	clear() {
        this.blocks = [this.axiom];  
        this.curr = this.axiom; 
    }

	subX(b, n) {
		if (n <= 0) {
			return;
		} else {
			var z1 = cutEdge();
			var z2 = cutEdge();
			var m1 = b.p[0].clone().lerp(b.p[1],z1);
			var m2 = b.p[3].clone().lerp(b.p[2],z2);
			if (Math.abs( m1.x - b.p[0].x)<blockWidth || Math.abs(m1.x - b.p[1].x)<blockWidth ||
				Math.abs( m2.x - b.p[2].x)<blockWidth || Math.abs(m2.x - b.p[3].x)<blockWidth) {
				b.x = false;
				return;
			}
			var bl = copyState(b);
			b.p[1].z = m1.z; b.p[1].x = m1.x;
			b.p[2].z = m2.z; b.p[2].x = m2.x;
			bl.p[0].z = m1.z; bl.p[0].x = m1.x;
			bl.p[3].z = m2.z; bl.p[3].x = m2.x;
			this.blocks.push(bl);
			this.curr = bl;
			this.subX(bl, n - 1);
		}
	}

	subZ(b, n) {
		if (n <= 0) {
			return;
		} else {
			var z1 = cutEdge();
			var z2 = cutEdge();
			var m1 = b.p[0].clone().lerp(b.p[3],z1);
			var m2 = b.p[1].clone().lerp(b.p[2],z2);
			if (Math.abs(m1.z - b.p[0].z)<blockWidth || Math.abs(m1.z - b.p[3].z)<blockWidth ||
				Math.abs(m2.z - b.p[2].z)<blockWidth || Math.abs(m2.z - b.p[1].z)<blockWidth) {
				b.z = false;
				return;
			}
			var bl = copyState(b);
			b.p[3].z = m1.z; b.p[3].x = m1.x;
			b.p[2].z = m2.z; b.p[2].x = m2.x;
			bl.p[0].z = m1.z; bl.p[0].x = m1.x;
			bl.p[1].z = m2.z; bl.p[1].x = m2.x;
			this.blocks.push(bl);
			this.curr = bl;
			this.subZ(bl, n - 1);
		}
	}

	// divisions along axis, num cuts => num+1 blocks
	subdivide(axis, num) { 
		return function() {
			if (axis == 0 && scope.curr.x) { // X axis
				scope.subX(scope.curr, num);				
			} else if (axis == 1 && scope.curr.z) { // Z axis
				scope.subZ(scope.curr, num);
			}
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

	// This function returns a list of blocks
	doIterations() {
		// debugger;
		for (var i = 0; i < this.iterations; i++) {
			var len = this.blocks.length;
			for (var j = 0; j < len; j ++) {
				this.curr = this.blocks[j];
				// if a rule exists
				if (this.grammar[this.blocks[j].sym] !== undefined) {
					var f = this.selectRule(this.blocks[j].sym);
					f();
				}
			}
		}
		// calculate centroid;
		for (var k = 0; k < this.blocks.length; k++) {
			computeCentroid(this.blocks[k]); 
		}
		return this.blocks;
	}
}