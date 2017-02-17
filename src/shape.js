const THREE = require('three')
import Draw from './draw.js'

// A class that represents functions applied to shapes
function Rule(prob, func) {
	this.prob = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.func = func; // function that applies to shape
}

var scope;

// TODO: shape call for geometric and Tranformation data
var Shape = function(sym, pos, rot, scale) {
	this.sym = sym;
	this.color = 0x555555;
	this.geo = 1;
	this.obj = new Draw(pos, rot, scale);
	this.segments = 4;
	this.terminal = true;
}

function copyState(shape) {
	var position = new THREE.Vector3();
	var rotation = new THREE.Vector3();
	var size = new THREE.Vector3();
	position.copy(shape.obj.pos);
	rotation.copy(shape.obj.rot);
	size.copy(shape.obj.scale);
	var result = new Shape(shape.sym, position, rotation, size);
	
	return result;
}

export default class Building {
	constructor(scene, pos, rot, scale, iterations) {
		// default LSystem
		this.scene = scene;
		this.axiom = new Shape('A', pos, rot, scale);
		this.grammar = {};
		// A: starting grammar
		// B: 
		this.grammar['A'] = [new Rule(1, this.subdivideX('H','H',3)),
							new Rule(0.3, this.subdivideScaleZ('M', 'D')),
							new Rule(0.4, this.subdivideX('M', 'D', 1))];
		// this.grammar['M'] = [new Rule(0.25, this.add('X', 'T', 1)), // num of floors
		// 					new Rule(0.25, this.add('X', 'T', 2)),
		// 					new Rule(0.5, this.add('X', 'T', 3))];
		// this.grammar['X'] = [new Rule(0.5, this.subdivideX('Y', 'Y', 3)),
		// 					new Rule(0.5, this.subdivideX('Y', 'Y', 2))];
		// this.grammar['Y'] = [new Rule(0.5, this.subdivideZ('BRICK', 'BRICK', 3)),
		// 					new Rule(0.5, this.subdivideZ('BRICK', 'BRICK', 2))]; // H are bricks, final
		// this.grammar['D'] = [new Rule(0.5, this.subdivideX('BRICK', 'Door', 1)),
		// 					new Rule(0.5, this.subdivideX('Door', 'BRICK', 1))];
		// this.grammar['Door'] = [new Rule(0.5, this.nothing('DOOR')),
		// 						new Rule(0.5, this.nothing('FANCY'))];
		// this.grammar['T'] = [new Rule(1, this.addRoof('R'))]; 
		// this.grammar['R'] = [new Rule(0.25, this.addChim('CHIM')),
		// 						new Rule(0.75, this.nothing('ROOF'))];
		this.iterations = 1; 
		this.curr = this.axiom;
		this.shapes = [this.axiom];
		this.color = 0xff1111;
		this.sizeX = 0.5;
		this.sizeZ = 0.5;
		this.rot = rot;
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
		this.curr.obj.rot = shape.obj.rot;
		this.curr.obj.pos = shape.obj.pos;
		this.curr.obj.scale = shape.obj.scale;
		this.curr.terminal = shape.terminal;
	}

	// rule functions
	nothing(a) {
		return function() {
			scope.curr.sym = a;
		}
	}

	subdivideScaleX(a,b) {
		return function(a,b) {
			var c = 0.5 + (Math.random()-0.5)*0.25;
			var s = 0.5 + (Math.random()-0.5)*0.25;
			var len = scope.curr.obj.scale.x;
			var zero = scope.curr.obj.pos.x - len/2;
			var pos1 = zero + c * len / 2;
			var pos2 = zero + c * len + (1 - c) * len / 2; 
			var s1 = copyState(scope.curr);
			s1.obj.pos.x = pos1;
			s1.obj.scale.x = c*len;
			s1.sym = a;
			var s2 = copyState(scope.curr);
			s2.obj.pos.x = pos2;
			s2.obj.scale.x = (1-c)*len;
			s2.sym = b;
			// shrink second partition by s
			s1.obj.scale.z *= s;
			s1.obj.pos.z = s1.obj.pos.z - (s2.obj.scale.z - s1.obj.scale.z)/2;
			// replace current with one division and push the other
			scope.updateCurr(s1);
			scope.shapes.push(s2);
		}
	}

	add(a,b, num) {
		return function() {
			var s = (Math.random()-0.5)*0.25;
			var len = scope.curr.obj.scale.y;
			var arr = [];
			for (var i = 0; i < num; i ++) {
				arr[i] = copyState(scope.curr);
				arr[i].obj.pos.y += len;
				arr[i].sym = a;
				if (i != 0 && i != (num - 1)) scope.shapes.push(arr[i]);
			} 
			// replace current with one division and push the other
			arr[num-1].sym = b;
			//scope.updateCurr(arr[0]);
			scope.shapes.push(arr[num-1]);
		}
		
	}

	subdivideScaleZ(a,b) {
		return function() {
			var c = 0.5 + (Math.random()-0.5)*0.25;
			var s = 0.5 + (Math.random()-0.5)*0.25;
			var len = scope.curr.obj.scale.z;
			var zero = scope.curr.obj.pos.z - len/2;
			var pos1 = zero + c * len / 2;
			var pos2 = zero + c * len + (1 - c) * len / 2; 
			var s1 = copyState(scope.curr);
			s1.obj.pos.z = pos1;
			s1.obj.scale.z = c*len;
			s1.sym = a;
			var s2 = copyState(scope.curr);
			s2.obj.pos.z = pos2;
			s2.obj.scale.z = (1-c)*len;
			s2.sym = b;
			// shrink second partition by s
			s1.obj.scale.x *= s;
			s1.obj.pos.x = s1.obj.pos.x - (s2.obj.scale.x - s1.obj.scale.x)/2;
			// replace current with one division and push the other
			scope.updateCurr(s1);
			scope.shapes.push(s2);
		}
	}

	subdivideX(a, b, num) {
		return function() {
			// debugger;
			var angle = scope.rot.y;
			var dir = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle)).normalize();
			var len = scope.curr.obj.scale.x;
			var width = len/num;
			var zero = scope.curr.obj.pos.x - len/2 - width/2;
			var pos = zero;
			var arr = [];
			var zo = scope.curr.obj.pos.clone().add(dir.clone().multiplyScalar(i*width));
			for (var i = 0; i < num; i ++) {
				pos += width;
				arr.push(copyState(scope.curr));
				arr[i].obj.pos = scope.curr.obj.pos.clone().add(
					dir.clone().multiplyScalar(i*width));
				//arr[i].obj.pos.rotateOnAxis(new THREE.Vector3(0,1,0), angle);
				arr[i].obj.scale.x = width;
				arr[i].sym = a;
				if (i != 0 && i != (num - 1)) scope.shapes.push(arr[i]);
			} 
			// replace current with one division and push the other
			arr[num-1].sym = b;
			scope.updateCurr(arr[0]);
			scope.shapes.push(arr[num-1]);
		}
	}

	subdivideZ(a, b, num) {
		return function() {
			var len = scope.curr.obj.scale.z;
			var width = len/num;
			var zero = scope.curr.obj.pos.z - len/2 - width/2;
			var pos = zero;
			var arr = [];
			for (var i = 0; i < num; i ++) {
				pos += width;
				arr.push(copyState(scope.curr));
				arr[i].obj.pos.z = pos;
				arr[i].obj.scale.z = width;
				arr[i].sym = a;
				if (i != 0 && i != (num - 1)) scope.shapes.push(arr[i]);
			} 
			// replace current with one division and push the other
			arr[num-1].sym = b;
			scope.updateCurr(arr[0]);
			scope.shapes.push(arr[num-1]);
		}
	}

	addRoof(a) {
		return function() {
			scope.curr.obj.scale.multiplyScalar(1.1);
			scope.curr.obj.pos.y += scope.curr.obj.scale.y/2 + 4; 
			scope.curr.terminal = false;
			scope.curr.sum = a;
		}
	}

	addChim(a) {
		return function() {
			var c = copyState(scope.curr);
			c.obj.scale = new THREE.Vector3(0.1,1.1*c.obj.scale.y,0.1);
			c.sym = a;
			scope.shapes.push(c);
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
				if (this.grammar[this.shapes[j].sym] !== undefined && this.shapes[j].terminal) {
					var f = this.selectRule(this.shapes[j].sym);
					f();
				}
			}
		}
	}
}