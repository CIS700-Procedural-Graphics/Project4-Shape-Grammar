const THREE = require('three');
const $ = require("jquery");

var allRoofsColor = 0x1B5E9B;
var globalPos = [0,0,0];
var globalRadius = 0;

function Rule(ruleType, succ) {
	this.type = ruleType;
	this.predecessor = "*";
	this.cond = null;
	//this.probability = prob;
	this.successor = succ;
	this.priority = 10;
}

export function Shape(shapeSymbol) {
    this.symbol = shapeSymbol;
	this.geometry = -1;
	this.position = [0,0,0];
	this.rotation = [0,0,0];
	this.scale = [1,1,1];
	this.terminal = false;
	this.dimensions = [];
	this.applicableRules = [];
	this.color = 0xFFFFFF;
}


function subdivide(shape, rule) {

	
	//var params = rule.successor.match(/ *\([^)]*\) */g); //save params	
	
	//subdivide rule
	//console.log(rule.successor);
	var re = /([A-Za-z]):(\d+\.?\d*)/;  // X:0.5
	var symbolParams = rule.successor.match(re); //get params
	var successors = [];
	var axis = symbolParams[1];
	var numDivision = symbolParams[2];
	
	var index = 0;
	
	switch(axis) {
		case 'X':
			index = 0;
			break;
		case 'Y':
			index = 1;
			break;
		case 'Z':
			index = 2;
			break;
		default:
			return [shape];
			break;
	}
	
	//console.log(shape.dimensions);
	for (var i = 0; i < numDivision; i++) {
					
		var newObject = $.extend(true, {}, shape);
		//newObject.scale = newObject.scale.map(function(x) { return x/2.0; });
		newObject.scale[index] /= numDivision;
		newObject.position[index] -= (shape.dimensions[index]*shape.scale[index] - newObject.dimensions[index]*newObject.scale[index]) / 2.0;
		newObject.position[index] += (shape.dimensions[index]*shape.scale[index]/numDivision) * i;
		newObject.terminal = false;
		successors.push(newObject);
	
	}

	return successors;
}


function addRoofs(shape, rule) {
	
	var successors = [shape];

	var newObject = $.extend(true, {}, shape);
	newObject.symbol = "roof" + shape.symbol.charAt(4) + ".obj";
	newObject.geometry = parseInt(shape.symbol.charAt(4))+2;
	newObject.terminal = false;
	
	var colors2 = [0xCFC096,0x4A741F, 0x1E3B01,0x2A1C0F,0x292B33]; //jg
	var colors3 = [0xC7C7C7,0xBFFFCE,0xF6E94A,0x344317,0x478116]; //plf
	var colors4 = [0xFF4823,0xFFFF86,0xB1EB8A,0x66B37B,0x029171]; //p
	var colors5 = [0x314841,0x8B8B65,0xFFCB7C,0xFF8437,0xF33616];  //os

	
	switch(globalRadius) {
    case 10:
        newObject.color = colors2[getRandomInt(0,4)];
        break;
    case 20:
        newObject.color = colors3[getRandomInt(0,4)];
        break;
	case 30:
        newObject.color = colors4[getRandomInt(0,4)];
        break;
    case 40:
        newObject.color = colors5[getRandomInt(0,4)];
        break;
    default:
        newObject.color = colors2[getRandomInt(0,4)];
	}

	successors.push(newObject);
	
	return successors;
}


function addWindows(shape, rule) {
	
	var side = -1;
	
	if (rule.successor == '+') {
		side = 1;
	}
	
	var successors = [shape];

	var newObject = $.extend(true, {}, shape);
	//newObject.scale = newObject.scale.map(function(x) { return x/2.0; });
	newObject.scale[2] /= 3.0;
	newObject.scale[0] /= 3.0;
	newObject.scale[1] /= 4.0;
	//newObject.scale = newObject.scale.map(function(x) { return x/6.0; });
	newObject.position[1] += shape.dimensions[1]/3.0 * 1.5;
	
	if (newObject.position[0] >= 0) {
		newObject.position[0] += shape.dimensions[0]*shape.scale[0]/2.3 * side;
	} else
		newObject.position[0] -= shape.dimensions[0]*shape.scale[0]/2.3 * side;
	newObject.rotation = [0,Math.PI/2,0];
	newObject.terminal = false;
	newObject.color = 0x000000;

	successors.push(newObject);
	
	return successors;
}

function scaleShape(shape, rule) {
	
	var re = /([A-Za-z]):(\d+\.?\d*),([A-Za-z]):(\d+\.?\d*),([A-Za-z]):(\d+\.?\d*)/;
	var symbolParams = rule.successor.match(re); //get params	
	
	var newObject = $.extend(true, {}, shape);
	
	newObject.scale[0] *= parseFloat(symbolParams[2]);
	newObject.scale[1] *= parseFloat(symbolParams[4]);
	newObject.scale[2] *= parseFloat(symbolParams[6]);

	return [newObject];
}


function translateShape(shape, rule) {
	
	var re = /([A-Za-z]):([+-]?\d+\.?\d*),([A-Za-z]):([+-]?\d+\.?\d*),([A-Za-z]):([+-]?\d+\.?\d*)/;
	var symbolParams = rule.successor.match(re); //get params	
	//sconsole.log(symbolParams);
	
	var newObject = $.extend(true, {}, shape);
	
	newObject.position[0] += parseFloat(symbolParams[2]);
	newObject.position[1] += parseFloat(symbolParams[4]);
	newObject.position[2] += parseFloat(symbolParams[6]);
 
	return [newObject];
}


function rotateShape(shape, rule) {
	
	var re = /([A-Za-z]):([+-]?\d+\.?\d*)/;  // X:0.5
	var symbolParams = rule.successor.match(re); //get params
	//console.log(symbolParams);
	
	var newObject = $.extend(true, {}, shape);
	
	newObject.rotation[1] += parseFloat(symbolParams[2]);
 
	return [newObject];
	
}


function applyRandomRule(shape, rules, rule_priority) {

	
	
	for (var i in rules)  {
		
		var rule = rules[i];
		
		if ((rule.priority == 1) && (rule_priority == 1)) {
			return scaleShape(shape,rule);
		} else if ((rule.priority == 2) && (rule_priority == 2)) {
			return rotateShape(shape,rule);
		}else if ((rule.priority == 3) && (rule_priority == 3)) {
			return translateShape(shape,rule);
		}else if ((rule.priority == 4) && (rule_priority == 4)) {
			return addRoofs(shape,rule);
		}else if ((rule.priority == 5) && (rule_priority == 5)) {
			return subdivide(shape,rule);
		}else if ((rule.priority == 6) && (rule_priority == 6)) {
			return addWindows(shape,rule);
		}
		
		
	}
	
	//for every rule check if its predecessor matches the shape, if so, apply the rule

}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export function generateRules(i) {

	var rules = [];
	
	var posFactor = Math.max(Math.abs(globalPos[0])/30,Math.abs(globalPos[2])/30);
	
	var sx = 0.5 * clamp(posFactor, 1.0, 1.3);
	var sy = 1 + (Math.random()/2*i) * posFactor;//Math.random()+1;
	var sz = Math.random()/2+1 * clamp(posFactor, 1.0, 1.3);//Math.random()+1;

	var scaleRule = new Rule(0, 'X:'+ sx + 
							 	',Y:' + sy +
							 	',Z:' + sz);
	scaleRule.priority = 1;
	rules.push(scaleRule);
	
	//var ry = getRandomInt(0,4)/2.0 * Math.PI;
	var ry = 1.0/2.0 * Math.PI * i;
	//console.log(ry);
	var rotateRule = new Rule(1, 'Y:' + ry);
	rotateRule.priority = 2;
	rules.push(rotateRule);
	
	var rx = 0.0;
	var rz = 0.0;
	var axis = 'Z';

	if (i % 3 == 0) {
		
		//rx += Math.random() > 0.5 ? 0.5 : -0.5;
		rx += 0.5;
		
	} else if (i % 3 == 1) {
		
		rz += Math.random() > 0.5 ? 0.5 : -0.5;
	} else if (i % 3 == 2) {
		
		rx -= 0.5;
		axis = 'D';
		//rx += 0.5;
	}
	
//	var rx = (Math.random()-0.5) * 2.0;
//	var rz = (Math.random()-0.5) * 2.0;
	
	var translateRule = new Rule(2, 'X:' + rx + ',Y:0.0,Z:' + rz);	
	//console.log(translateRule);
	translateRule.priority = 3;
	rules.push(translateRule);
	
	var roofRule = new Rule(3, '1');	
	roofRule.priority = 4;
	rules.push(roofRule);
	
	
	var subdivRule = new Rule(4, axis + ':' + getRandomInt(3, 5));
	subdivRule.priority = 5;
	rules.push(subdivRule);
	
	var windowRule = new Rule(5, '+');
	windowRule.priority = 6;
	rules.push(windowRule);
	
	return rules;
}

function parseShapeGrammar(shapes, rules, iterations) {
	
	//var newShapeList = [];
	for (var i = 0; i < iterations; i++) {
		//console.log(shapes);
		for (var j = shapes.length - 1; j >= 0; j--) {	

			var shape = shapes[j];
			
			var result = shape.symbol.indexOf("roof") > -1;
			if (result)
				continue;
			
			rules = generateRules(j);
			if (!shape.terminal) {

				var successors = applyRandomRule(shape, rules, i+1);
				shapes = shapes.concat(successors);
				//console.log(successors);

				var index = shapes.indexOf(shape);
				//console.log(index);
				if (index > -1) {
					shapes.splice(index, 1);
				}

			}

		}
		
	}
	
	return shapes;
}


export default function ShapeGrammar(axiom, grammar, iterations) {
	
	this.rules = generateRules();
	this.shapes = [];
	this.position = [0,0,0];
	this.cityRadius = 0;
	
	this.doIterations = function(n) {
		
		//var colors = [0x1B5E9B,0x1B9044,0xBB8319,0xAB342D,0x5D6168];
		var colors2 = [0xCFC096,0x4A741F, 0x1E3B01,0x2A1C0F,0x292B33]; //jg
		var colors3 = [0xC7C7C7,0xBFFFCE,0xF6E94A,0x344317,0x478116]; //plf
		var colors4 = [0xFF4823,0xFFFF86,0xB1EB8A,0x66B37B,0x029171]; //p
		var colors5 = [0x314841,0x8B8B65,0xFFCB7C,0xFF8437,0xF33616];  //os
		allRoofsColor = colors2[getRandomInt(0,4)];
		globalPos = this.position;
		globalRadius = this.cityRadius;
			
		var num = Math.random() > 0.5 ? 1 : 3; 
		var s = this.shapes.slice(0, num);
		return parseShapeGrammar(s, this.rules, n);
	}
}