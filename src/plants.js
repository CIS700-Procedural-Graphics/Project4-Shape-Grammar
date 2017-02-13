const THREE = require('three');
var Random = require("random-js");

import { LSystem, LContext, LRule, LInstruction, DummyInstruction } from './lsystem.js'

function toRadians(degrees)
{
	return degrees * Math.PI / 180.0;
}

function randomTwistRotation(random, twist)
{
	var a = twist;
	var euler = new THREE.Euler(0, a * random.real(.75, 1), 0);
	var quat = new THREE.Quaternion();
	quat.setFromEuler(euler);
	return quat;
}

function randomQuaternion(random, amplitude)
{
	var a = amplitude * .5;
	var euler = new THREE.Euler(a * random.real(-1,1, true), a * random.real(-1,1, true), a * random.real(-1,1, true));
	var quat = new THREE.Quaternion();
	quat.setFromEuler(euler);
	return quat;
}

class CrossSectionParameters
{
	constructor(a, b, m1, m2, n1, n2, n3)
	{
		this.a = a;
		this.b = b;
		this.m1 = m1;
		this.m2 = m2;
		this.n1 = n1;
		this.n2 = n2;
		this.n3 = n3;
	}

	evaluate(t)
	{
		var term1 = Math.pow(Math.abs(Math.cos(this.m1 * t * .25) / this.a), this.n2);
		var term2 = Math.pow(Math.abs(Math.sin(this.m2 * t * .25) / this.b), this.n3);
		return Math.pow(term1 + term2, -1.0 / this.n1);
	}

	copy()
	{
		return new CrossSectionParameters(this.a, this.b, this.m1, this.m2, this.n1, this.n2, this.n3);
	}
}

class PlantContext extends LContext
{
	constructor(position, rotation, branchLength, branchRadius, crossSection, random) 
	{
		super();

		this.position = position.clone();
		this.rotation = rotation.clone();
		this.branchLength = branchLength;
		this.branchRadius = branchRadius;
		this.random = random;
		this.crossSection = crossSection;
		this.renderable = false;
		this.flower = false;
		this.depth = 0;
	}

	copy()
	{
		var c = new PlantContext(this.position, this.rotation, this.branchLength, this.branchRadius, this.crossSection.copy(), this.random);
		c.depth = this.depth;
		return c;
	}
}

class LInstructionOverride extends LInstruction
{
	constructor(symbolCharacter, instruction)
	{
		super();
		this.symbolCharacter = symbolCharacter;
		this.instruction = instruction;
	}

	symbol()
	{
		return this.symbolCharacter;
	}

	evaluate(context, stack)
	{
		return this.instruction.evaluate(context, stack);
	}
}

// A more specific instruction that can modify branches
class BranchInstruction extends LInstruction
{
	constructor(sizeFactor, radiusFactor)
	{
		super();
		this.sizeFactor = sizeFactor;
		this.radiusFactor = radiusFactor;
	}

	symbol() { return "B"; }

	evaluate(context, stack)
	{
		var c = context;
		c.branchLength *= this.sizeFactor;
		c.branchRadius *= this.radiusFactor;
		c.branched = true;

		// For now, when branching we lose all fine details
		c.crossSection = new CrossSectionParameters(1,1,1,1,1,1,1);
		return c;
	}
}

class RootInstruction extends LInstruction 
{  
	constructor(sizeFactor)
	{
		super();
		this.sizeFactor = sizeFactor;
	}

	symbol() { return "R"; }

	evaluate(context, stack) 
	{
		var c = context;
		c.position.add(new THREE.Vector3(0, context.branchLength * .2, 0).applyQuaternion(c.rotation));
		c.renderable = true;
		c.branchRadius *= this.sizeFactor;
		return c;
	}
}

// Main branch
class ForwardInstruction extends LInstruction 
{
	constructor(twistFactor)
	{
		super();
		this.twistFactor = twistFactor;
	}

	symbol() { return "F"; }

	evaluate(context, stack) 
	{
		var c = context;
		c.position.add(new THREE.Vector3(0, context.branchLength, 0).applyQuaternion(c.rotation));
		c.branchRadius += c.random.real(-.2, .2, true) * c.branchRadius;
		c.rotation.multiply(randomTwistRotation(c.random, this.twistFactor));
		c.renderable = true;
		c.depth++;
		return c;
	}
}

class DetailInstruction extends LInstruction 
{
	constructor(rotationFactor, minLength, maxLength, twistFactor)
	{
		super();
		this.rotationFactor = rotationFactor;
		this.minLength = minLength;
		this.maxLength = maxLength;
		this.twistFactor = twistFactor;
	}

	symbol() { return "Q"; }

	evaluate(context, stack) 
	{
		var c = context;
		c.position.add(new THREE.Vector3(0, c.random.real(this.minLength, this.maxLength) * c.branchLength, 0).applyQuaternion(c.rotation));
		c.renderable = true;		
		c.rotation.multiply(randomTwistRotation(c.random, this.twistFactor));		
		c.rotation.multiply(randomQuaternion(c.random, this.rotationFactor));
		c.branchRadius += c.random.real(-.1, .1, true) * c.branchRadius;
		c.depth++;
		return c;
	}
}

class RotatePositiveInstruction extends LInstruction
{
	constructor(angle)
	{
		super();
		this.angle = angle;
	}

	symbol() { return "+"; }

	evaluate(context, stack) {
		var c = context;

		var euler = new THREE.Euler(0, c.random.real(-Math.PI, Math.PI), this.angle * c.random.real(.5, 1));
		var quat = new THREE.Quaternion();
		quat.setFromEuler(euler);

		c.rotation.multiply(quat);

		// Jump to the boundary of the tree
		c.position.add(new THREE.Vector3(0, context.branchRadius, 0).applyQuaternion(c.rotation));
		
		return c;
	}
}

class RotateNegativeInstruction extends LInstruction
{
	symbol() { return "-"; }

	evaluate(context, stack) {
		var c = context;
		
		var euler = new THREE.Euler(0, c.random.real(-Math.PI, Math.PI), -1.25 * c.random.real(.5, 1));
		var quat = new THREE.Quaternion();
		quat.setFromEuler(euler);

		c.rotation.multiply(quat);

		// Jump to the boundary of the tree
		c.position.add(new THREE.Vector3(0, context.branchRadius, 0).applyQuaternion(c.rotation));
		return c;
	}
}

class FlowerInstruction extends LInstruction
{
	symbol() { return "W"; }

	evaluate(context, stack) 
	{
		context.flower = true;
		return context;
	}
}

export default class PlantLSystem
{
	constructor() {} 

	expand()
	{
		return this.system.expand();
	}

	evaluate()
	{
		// (a, b, m1, m2, n1, n2, n3)
		var crossSection = new CrossSectionParameters(1,1,2,10,-1.5,1,1);
		var state = new PlantContext(new THREE.Vector3(0,0,0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,0)), 1.0, .95, crossSection, this.system.random);
		return this.system.evaluate(state);
	}

	generateCrossSectionVertices(geometry, state, subdivs, lastSectionOfBranch, nextState)
	{
		var centerPoint = state.position;

		for(var s = 0; s < subdivs; s++)
		{
			var theta = s * 2 * 3.1415 / subdivs;
			var x = Math.cos(theta);
			var y = Math.sin(theta);

			var r = state.crossSection.evaluate(theta) * state.branchRadius;

			if(lastSectionOfBranch)
				r *= .5;

			var quat = state.rotation;

			if(state.branched && nextState != null)
				quat = nextState.rotation;

			var point = centerPoint.clone().add(new THREE.Vector3(x * r, 0, y * r).applyQuaternion(quat));

			geometry.vertices.push(point);
		}
	}

	generateMesh()
	{
		var plantContainer = new THREE.Group();
		
		var material = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x333333 });
		material.side = THREE.DoubleSide;

		var stateArray = this.evaluate();

		var t = performance.now();

		var flowerGeometry = new THREE.SphereBufferGeometry(.1, 16, 16);
		var geometry = new THREE.Geometry();
		var prevPosition = stateArray[0].position;
		var subdivs = this.subdivisions;
		var segments = 0;
		var maxDepth = 0;

		// We need to find the max depth, so that we can normalize other stuff
		for(var i = 0; i < stateArray.length; i++)
			if(stateArray[i].depth > maxDepth)
				maxDepth = stateArray[i].depth;

		// We always draw backwards, with consideration of branching and the first case
		for(var i = 0; i < stateArray.length; i++)
		{
			var p = stateArray[i].position;
			var offset = geometry.vertices.length - subdivs;

			var lastSectionOfBranch = (i == stateArray.length - 1) || stateArray[i+1].branched;

			// Note: if the grammar branched, we need to redraw the initial set of vertices
			if(i == 0 || stateArray[i].renderable || stateArray[i].branched)
			{
				var nextState = i < stateArray.length - 1 ? stateArray[i+1] : null;
				this.generateCrossSectionVertices(geometry, stateArray[i], subdivs, lastSectionOfBranch, nextState);
			}

			if(stateArray[i].flower)
			{
				var sphere = new THREE.Mesh(flowerGeometry, material);
				var scale = this.system.random.real(.15, 4);
				sphere.position.copy(stateArray[i].position.add(new THREE.Vector3(0, -scale * .1, 0)));

				sphere.scale.set(scale, scale, scale);
				plantContainer.add(sphere);
			}

			if((prevPosition.distanceTo(p) > .01 && stateArray[i].renderable))
			{
				// console.log(stateArray[i].position);
				// console.log(stateArray[i-1].position);
				// console.log('')

				if(offset >= 0)
				{
					for(var v = 0; v < subdivs; v++)
					{
						var v1 = offset + v;
						var v2 = offset + ((v + 1) % subdivs);
						var v3 = offset + subdivs + ((v + 1) % subdivs);

						var v4 = offset + v;
						var v5 = offset + subdivs + ((v + 1) % subdivs);
						var v6 = offset + subdivs + v;

						geometry.faces.push(new THREE.Face3(v3, v2, v1));
						geometry.faces.push(new THREE.Face3(v6, v5, v4));
					}

					segments++;
				}
			}

			prevPosition = p;
		}

		// console.log(stateArray);

		geometry.mergeVertices();
		geometry.computeVertexNormals();

		// console.log("Mesh generation took " + t.toFixed(1) + "ms (" + segments + " segments, " + subdivs + " subdivs, " + geometry.vertices.length  + " vertices)");

		var mesh = new THREE.Mesh(geometry, material);

		plantContainer.add(mesh);
		return plantContainer;
	}

	getLineDebugger()
	{
		var material = new THREE.LineBasicMaterial({ color: 0xffffff });
		material.transparent = true;
		material.depthTest = false;

		var geometry = new THREE.Geometry();

		var stateArray = this.evaluate();

		var prevPosition = stateArray[0].position;
		var subdivs = 8;

		for(var i = 0; i < stateArray.length; i++)
		{
			var p = stateArray[i].position;

			if(i == 0 || (prevPosition.distanceTo(p) > .01 && stateArray[i].renderable))
			{
				this.generateCrossSectionVertices(geometry, stateArray[i], subdivs, null);
				geometry.vertices.push(p);
			}

			prevPosition = p;
		}

		return new THREE.Line(geometry, material);
	}
}

export class MainCharacter extends PlantLSystem
{
	constructor(seed, iterations)
	{
		super();

		var instructions = [new ForwardInstruction(toRadians(35)), 
						new DummyInstruction("X"), 
						new DummyInstruction("Y"), 
						new FlowerInstruction(),
						new RotateNegativeInstruction(), 
						new RotatePositiveInstruction(toRadians(90)),
						new BranchInstruction(.8, .6),
						new DetailInstruction(toRadians(40), .3, .6, toRadians(5)),
						new RootInstruction(.7),
						new LInstructionOverride("E", new DetailInstruction(toRadians(10), .3, .2, toRadians(5)))];

		var rules = [];

		// Two arms rule
		rules.push(new LRule("X", "[B-QQQQQY][B+QQQQQY]", 1.0));

		// Arms details (fingers?)
		rules.push(new LRule("Y", "[B-QX][B+QX]QQ", .75));
		rules.push(new LRule("Y", "QW", .25));

		// Detailing the main branch
		rules.push(new LRule("F", "EEFXE", .85));
		rules.push(new LRule("F", "FXF", .15));

		var random = new Random(Random.engines.mt19937().seed(seed));
		this.system = new LSystem("RRRRFXEEEEX", instructions, rules, iterations, random);
		this.subdivisions = 32;
	}
}


class CactusBranchInstruction extends LInstruction
{
	symbol() { return "C" };

	evaluate(context, stack) 
	{
		var c = context;

		var euler = new THREE.Euler(0, c.random.real(-Math.PI, Math.PI), Math.PI * .5);
		var quat = new THREE.Quaternion();
		quat.setFromEuler(euler);

		// Jump to the boundary of the tree
		c.position.add(new THREE.Vector3(0, context.branchRadius , 0).applyQuaternion(quat));
		
		c.branchRadius *= .5;
		c.rotation.multiply(quat);
		return c;
	}
}

class CactusForward extends LInstruction
{
	symbol() { return "F" };

	evaluate(context, stack) 
	{
		var c = context;

		c.position.add(new THREE.Vector3(0, context.branchLength, 0).applyQuaternion(c.rotation));
		c.branchRadius += c.random.real(-.1, .1, true) * c.branchRadius;
		// c.rotation.multiply(randomTwistRotation(c.random, this.twistFactor));

		var euler = new THREE.Euler(0, 0, -.35);
		var quat = new THREE.Quaternion();
		quat.setFromEuler(euler);

		var dir = new THREE.Vector3(0,1,0).applyQuaternion(c.rotation)

		if(Math.abs(dir.y - 1.0) > .1)
			c.rotation.multiply(quat);


		c.renderable = true;
		c.depth++;
		return c;
	}
}

export class CactusCharacter extends PlantLSystem
{
	evaluate()
	{
		// (a, b, m1, m2, n1, n2, n3)
		var crossSection = new CrossSectionParameters(1,1,18,18,2.225,1,10);
		var state = new PlantContext(new THREE.Vector3(0,0,0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,0)), .4, 1.25, crossSection, this.system.random);
		return this.system.evaluate(state);
	}

	constructor(seed, iterations)
	{
		super();

		var instructions = [new CactusForward(), 
						new DummyInstruction("X"), 
						new DummyInstruction("Y"),
						new CactusBranchInstruction(),
						new FlowerInstruction(),
						new RotateNegativeInstruction(), 
						new RotatePositiveInstruction(toRadians(90)),
						new BranchInstruction(.8, .6),
						new DetailInstruction(toRadians(0), .5, .5, toRadians(0)),
						new RootInstruction(.8),
						new LInstructionOverride("E", new CactusForward())];

		var rules = [];

		rules.push(new LRule("F", "FF", .3)); // Grow Rule
		// rules.push(new LRule("F", "E", .5));
		rules.push(new LRule("E", "EE", 1.0)); // Grow Rule
		rules.push(new LRule("X", "[CE]", 1.0));

		var random = new Random(Random.engines.mt19937().seed(seed));
		// this.system = new LSystem("RRFFRRR", instructions, rules, 5, random);

		this.system = new LSystem("RFXFXFXFFF", instructions, rules, iterations, random);
		this.subdivisions = 128;
	}
}

class WillowInstruction extends LInstruction
{
	symbol() { return "T" };
	

	evaluate(context, stack) 
	{
		var c = context;

		c.position.add(new THREE.Vector3(0, context.branchLength, 0).applyQuaternion(c.rotation));
		c.branchRadius += c.random.real(-.1, .1, true) * c.branchRadius;
		// c.rotation.multiply(randomTwistRotation(c.random, this.twistFactor));

		var euler = new THREE.Euler(0, 0, .35);
		var quat = new THREE.Quaternion();
		quat.setFromEuler(euler);

		var dir = new THREE.Vector3(0,1,0).applyQuaternion(c.rotation)

		if(Math.abs(dir.y + 1.0) > .1)
			c.rotation.multiply(quat);

		c.renderable = true;
		c.depth++;
		return c;
	}
}



export class WillowCharacter extends PlantLSystem
{
	evaluate()
	{
		// (a, b, m1, m2, n1, n2, n3)
		var crossSection = new CrossSectionParameters(1,1,18,18,2.225,1,10);
		var state = new PlantContext(new THREE.Vector3(0,0,0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,0)), 1.0, 1.25, crossSection, this.system.random);
		return this.system.evaluate(state);
	}

	constructor(seed, iterations)
	{
		super();

		var instructions = [new ForwardInstruction(toRadians(45)), 
						new DummyInstruction("X"), 
						new DummyInstruction("Y"),
						new FlowerInstruction(),
						new WillowInstruction(),
						new RotateNegativeInstruction(), 
						new RotatePositiveInstruction(toRadians(90)),
						new BranchInstruction(.8, .6),
						new DetailInstruction(toRadians(15), .5, .5, toRadians(20)),
						new RootInstruction(.8)];

		var rules = [];

		rules.push(new LRule("Q", "QQ", 1.0)); // Grow Rule
		rules.push(new LRule("T", "TT", 1.0)); // Grow Rule

		rules.push(new LRule("X", "[B+QT][B-QT]X", 1.0)); // Grow Rule

		var random = new Random(Random.engines.mt19937().seed(seed));

		this.system = new LSystem("RRQX", instructions, rules, iterations, random);
		this.subdivisions = 64;
	}
}
