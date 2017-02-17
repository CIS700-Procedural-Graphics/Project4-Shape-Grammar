const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import PerlinNoiseMultiOctave from './perlinNoise'

// A class that represents a symbol replacement rule to
// be used when expanding an L-system or Shape grammar.
function Rule(prob, f) {
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.shapeFunc = f; // The func that will be called when we apply this rule to a geometry
}

// SymbolNode class contains information about a piece of geometry in city
class SymbolNode {
	constructor(grammarSymbol, position, terminal) {
		//default symbol node geometry:
		var geometry = new THREE.BoxGeometry(1, 1, 1);
		var nodeColor = Math.min(Math.max(Math.random(), 0.1), 0.5);
		var material = new THREE.MeshLambertMaterial( { color : nodeColor });
		this.grammarSymbol = grammarSymbol;
		this.terminal = terminal; // true/false
		
		this.mesh = new THREE.Mesh( geometry, material );
		this.mesh.position.set(position.x, position.y, position.z);
		this.mesh.castShadow = true;
	}
}

// City class contains information regarding characteristics such as geography, population density, etc
// class City {
// 	constructor() {
// 		this.shapeGrammar = new ShapeGrammar(); //Grammar associated with this City
// 	}
// }

class RoadSegment { // roads also need houses along them. For now, one on either side
	constructor(startPoint, endPoint) { //all roads are perfectly straight lines
		this.startPoint = startPoint;
		this.endPoint = endPoint;
		this.meshSet = new Set;
	}
}

// Return a set of symbol nodes representing the input string
function getSetFromString(inputString, position) {
	var symbolSet = new Set();
	
	//Create a symbolNode from each character in the string
	for(var i = 0, len = inputString.length; i < len; i++) {
		var symbolNode = new SymbolNode(inputString.charAt(i), position, false);
		symbolSet.add(symbolNode);
	}
	return symbolSet;
}

// Implementation of Grammar Rules

// Subdivide the node (currently should be a cube) to make to nodes
// Then add the new node into the set of geometry
function subdivideCubeNodeX(node, geometrySet) {
	// console.log('made it here');
	// console.log(geometrySet);
	var newCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
	var newCubeColor = Math.min(Math.max(Math.random(), 0.1), 0.5);
	var newCubeMaterial = new THREE.MeshLambertMaterial({ color : new THREE.Color(newCubeColor, newCubeColor, newCubeColor) });
	var newCubeMesh = new THREE.Mesh( newCubeGeometry, newCubeMaterial );
	newCubeMesh.castShadow = true;
	
	//alter the position of the new cube - just subdivide along the x-axis
	newCubeMesh.position.x = node.mesh.position.x - node.mesh.scale.x * 0.25;
	// console.log(node.mesh.scale);
	node.mesh.position.x += node.mesh.scale.x * 0.25;
	
	//alter the scale of the objects
	newCubeMesh.scale.x = node.mesh.scale.x * 0.5;
	node.mesh.scale.x *= 0.5;
	
	// newCubeMesh.position.y = node.mesh.position.y + 1;
	newCubeMesh.position.z = node.mesh.position.z;
	
	var newCubeNode = new SymbolNode('C', newCubeMesh.position, false);
	newCubeNode.mesh = newCubeMesh;
	geometrySet.add(newCubeNode);
	geometrySet.add(node);
	return geometrySet;
}

// Subdivide the node (currently should be a cube) to make to nodes
// Then add the new node into the set of geometry
function subdivideCubeNodeZ(node, geometrySet) {
	// console.log('made it here');
	// console.log(geometrySet);
	var newCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
	var newCubeColor = Math.min(Math.max(Math.random(), 0.1), 0.5);
	var newCubeMaterial = new THREE.MeshLambertMaterial({ color : new THREE.Color(newCubeColor, newCubeColor, newCubeColor) });
	var newCubeMesh = new THREE.Mesh( newCubeGeometry, newCubeMaterial );
	newCubeMesh.castShadow = true;
	
	//alter the position of the new cube - just subdivide along the x-axis
	newCubeMesh.position.z = node.mesh.position.z - node.mesh.scale.z * 0.25;
	// console.log(node.mesh.scale);
	node.mesh.position.z += node.mesh.scale.z * 0.25;
	
	//alter the scale of the objects
	newCubeMesh.scale.z = node.mesh.scale.z * 0.5;
	node.mesh.scale.z *= 0.5;
	
	// newCubeMesh.position.y = node.mesh.position.y + 1;
	newCubeMesh.position.x = node.mesh.position.x;
	
	var newCubeNode = new SymbolNode('C', newCubeMesh.position, false);
	newCubeNode.mesh = newCubeMesh;
	geometrySet.add(newCubeNode);
	geometrySet.add(node);
	return geometrySet;
}

function randomScaleX(node, geometrySet) {
	var randomScale = Math.random();
	// randomScale *= 2;
	node.mesh.scale.x *= randomScale;
	geometrySet.add(node);
	return geometrySet;
}

function randomScaleY(node, geometrySet) {
	var randomScale = Math.random();
	// randomScale *= 2;
	node.mesh.scale.y *= randomScale;
	geometrySet.add(node);
	return geometrySet;
}

function randomScaleZ(node, geometrySet) {
	var randomScale = Math.random();
	// randomScale *= 2;
	node.mesh.scale.z *= randomScale;
	geometrySet.add(node);
	return geometrySet;
}

function becomeS(node, geometrySet) {
	node.grammarSymbol = 'S';
	geometrySet.add(node);
	return geometrySet;
}

function becomeC(node, geometrySet) {
	node.grammarSymbol = 'C';
	geometrySet.add(node);
	return geometrySet;
}

//Utility Functions

// Union two sets together.
function unionSets(A, B) {
	var union = new Set();
	for (let currEleA of A.values()) {
		union.add(currEleA);
	}
	for (let currEleB of B.values()) {
		union.add(currEleB);
	}
	return union;
}

function lerp(a, b, w) {
	return (1 - w) * a + b * w;
}

/*
   Shape Grammar "class" contains the dictionary of grammar for the shapes in the city
   as well as the set containing all geometry in the scene.
*/

export default function ShapeGrammar(axiom, grammar) {
	this.position = new THREE.Vector3(0, 0, 0);
	this.axiom = "C"; //For now, C = cube
	this.grammar = {};
	
	//Add rules to our grammar
	this.grammar['C']  = [
		new Rule(0.45, subdivideCubeNodeX),
		new Rule(0.45, subdivideCubeNodeZ),
		new Rule(0.1, becomeS)
	];
	
	this.grammar['S'] = [
		new Rule(0.2, randomScaleX),
		new Rule(0.2, randomScaleY),
		new Rule(0.2, randomScaleZ),
		new Rule(0.4, becomeC)
	];
	
	// Set up the axiom string
	if (typeof axiom !== "undefined") {
		this.axiom = axiom;
	}

	// Set up the grammar as a dictionary that 
	// maps a single character (symbol) to a Rule.
	if (typeof grammar !== "undefined") {
		this.grammar = Object.assign({}, grammar);
	}
	
	// A function to alter the axiom string stored 
	// in the L-system / Shape grammar
	this.updateAxiom = function(axiom) {
		// Setup axiom
		if (typeof axiom !== "undefined") {
			this.axiom = axiom;
		}
	}
	
	//getRandomRule(nodeGrammarSymbol)
	
	// This function is called by the forEach callback in doIteration(n)
	this.applyGrammarRules = function(element, set) {
		//add the node(s) associated with the grammar rule and then remove the original from the set
		
		//here use a function to determine which rule to use
		//var replacementString = this.grammar[element.grammarSymbol][0].successorString; // = getRandomRule();
		var runningProbability = -0.001;
		var randomNum = Math.random();
		var possibleRules = this.grammar[element.grammarSymbol];
		var replacementFunc;
		for(var i = 0; i < possibleRules.length; i++) {
			var currentRule = this.grammar[element.grammarSymbol][i];
			runningProbability += currentRule.probability;
			if(randomNum < runningProbability) {
				replacementFunc = currentRule.shapeFunc;
				break;
			}
		}
		if(typeof replacementFunc != "undefined") {
			set = replacementFunc(element, set);
		}
	}
	
	// Apply the grammar to the axiom n times and then
	// return the set of geometry to be placed into the city
	this.doIterations = function(n, roadNetwork) {
		var geometrySet = this.placeBuildingsAlongRoads(roadNetwork);//getSetFromString(this.axiom, this.position);
		if(n == 0) {
			return geometrySet;
		} else {
			var originalSet = geometrySet;
			var replacementNodeSet = new Set(); // Will contain the nodes to add according to the grammar
			for(var i = 0; i < n; i++) { // For each iteration, operate on the set
				
				// Apply the rules of the shape grammar to every node
				var self = this;
				for(let value of geometrySet) {
					self.applyGrammarRules(value, replacementNodeSet);
				}
				// Accumulate the nodes from the applied grammar rules
				geometrySet = unionSets(geometrySet, replacementNodeSet);
			}
			// console.log(geometrySet);
			return geometrySet;
		}
	}
	
	// This function returns a set of geometry oriented according to a concentric
	// arrangement of roads
	this.generateRoadNetwork = function() {
		//*** For now roads will be renderer using very small planes at whatever interval
		//*** ShapeRenderer will be used to create and render the planes
		var roads = new Set(); //first circular layer of roads around the city
		
		var previousLayerPositions = new Array();
		// First create a circle around the city located at this.position using n intervals
		var thetaIncrement = Math.PI / 4; //make this procedural
		// var cityRadius = 10; // make this procedural
		
		//This code creates a ring of roads around the city
		
		var numRings = 5; //make procedural
		var currentRadius = 5; //starting radius
		for(var i = 0; i < numRings; i++) {
			currentRadius *= 1.5;
			for(var theta = 0; theta < 2 * Math.PI; theta += thetaIncrement) {
				var xPos = Math.cos(theta) * currentRadius + this.position.x;
				var zPos = Math.sin(theta) * currentRadius + this.position.z;
				
				var nextXPos = Math.cos(theta + thetaIncrement) * currentRadius + this.position.x;
				var nextZPos = Math.sin(theta + thetaIncrement) * currentRadius + this.position.z;
				previousLayerPositions.push(new THREE.Vector3(nextXPos, this.position.y, nextZPos));
				var currentRingRoadSegment = new RoadSegment(new THREE.Vector3(xPos, this.position.y, zPos), new THREE.Vector3(nextXPos, this.position.y, nextZPos));
				roads.add(currentRingRoadSegment);
			}
		}
		
		//Then create the final outgoing radial roads
		for(var theta = 0; theta < 2 * Math.PI; theta += thetaIncrement) {
			var xPos = Math.cos(theta) * currentRadius + this.position.x;
			var zPos = Math.sin(theta) * currentRadius + this.position.z;
			var currentOutwardRoadSegment = new RoadSegment(this.position, new THREE.Vector3(xPos, this.position.y, zPos));
			roads.add(currentOutwardRoadSegment);
		}
		
		//Create geometry for the road segments
		this.createRoadGeometry(roads);
		return roads;
	}
	
	this.createRoadGeometry = function(roadNetwork) {
		for(let currentRoadSegment of roadNetwork.values()) {
			//now draw the roads progressively using the same technique but increment the position
			var roadPosIncrement = 0.1; //10 segments of plane geometry per road segment
			
			//Rotation is the same for each segment of this road segment, so it's outside the for loop
			
			// Rotate the default forward vector (0, 0, 1) to match the direction of the road
			var roadDirection = new THREE.Vector3();
			roadDirection.x = currentRoadSegment.endPoint.x - currentRoadSegment.startPoint.x;
			roadDirection.y = currentRoadSegment.endPoint.y - currentRoadSegment.startPoint.y;
			roadDirection.z = currentRoadSegment.endPoint.z - currentRoadSegment.startPoint.z;
			roadDirection = roadDirection.normalize();
			
			var amountToRotate = Math.acos(new THREE.Vector3(0, 0, 1).dot(roadDirection));
			
			if(roadDirection.x < 0) {
				amountToRotate *= -1;
			}
			
			// for(var u = 0; u < 1; u += roadPosIncrement) { //gradually lerp between the start and end position
				// Create a plane at the midpoint, rotate it to have the same orientation as the 
				// road segment, then scale it accordingly
				var roadGeometry = new THREE.PlaneGeometry(1, 1);
				var roadMaterial = new THREE.MeshPhysicalMaterial( {color: new THREE.Color(0.1, 0.1, 0.1)/*0x778899*/, side: THREE.DoubleSide} );
				roadMaterial.roughness = 1;
				roadMaterial.metalness = 0;
				var roadMesh = new THREE.Mesh( roadGeometry, roadMaterial );
				
				var roadScale = currentRoadSegment.startPoint.distanceTo(currentRoadSegment.endPoint);// * roadPosIncrement;
				
				var roadPos = new THREE.Vector3();
				roadPos.x = lerp(currentRoadSegment.startPoint.x, currentRoadSegment.endPoint.x, 0.5);
				roadPos.y = lerp(currentRoadSegment.startPoint.y, currentRoadSegment.endPoint.y, 0.5);
				roadPos.z = lerp(currentRoadSegment.startPoint.z, currentRoadSegment.endPoint.z, 0.5);
				
				roadMesh.rotateY(amountToRotate);
				roadMesh.rotateX(0.5 * Math.PI);
				
				roadMesh.scale.y = roadScale;	
				roadMesh.scale.x = 0.5;
				roadMesh.position.set(roadPos.x, roadPos.y, roadPos.z);
				roadMesh.receiveShadow = true;
				
				currentRoadSegment.meshSet.add(roadMesh);
			// }
		}
	}
	
	// Place an instance of the axiom of this shape grammar on either side of each road segment
	this.placeBuildingsAlongRoads = function(roadNetwork) {
		var buildingSet = new Set();
		for(let currentRoadSegment of roadNetwork) {
			// cross this road segment direction with the world up-vector to get a direction in which
			// to place a building. then do it again in the opposite direction
			
			//get the direction of the road
			var roadDirection = new THREE.Vector3();
			roadDirection.x = currentRoadSegment.endPoint.x - currentRoadSegment.startPoint.x;
			roadDirection.y = currentRoadSegment.endPoint.y - currentRoadSegment.startPoint.y;
			roadDirection.z = currentRoadSegment.endPoint.z - currentRoadSegment.startPoint.z;
			
			//place multiple buildings along the road
			//make the number of buildings a function of its length
			var roadLength = roadDirection.length();
			
			//now we finish the direction computation
			roadDirection = roadDirection.normalize();
			var upVector = new THREE.Vector3(0, 1, 0);
			var cityPlacementDir = upVector.cross( roadDirection );
			
			//back to the number of buildings
			var randomness = Math.random(); //make this a little random to jitter the number of buildings
			randomness *= 2;
			randomness -= 1;
			var numBuildings = Math.floor(roadLength / (5 + randomness));
			var increment = 1 / numBuildings;
			
			for(var u = 0; u < 1; u += increment) {
				//Get the midpoint of the road
				var roadPos = new THREE.Vector3();
				roadPos.x = lerp(currentRoadSegment.startPoint.x, currentRoadSegment.endPoint.x, u);
				roadPos.y = lerp(currentRoadSegment.startPoint.y, currentRoadSegment.endPoint.y, u);
				roadPos.z = lerp(currentRoadSegment.startPoint.z, currentRoadSegment.endPoint.z, u);
				
				// use.add(),make the new vector3s first
				var buildingOnePos = new THREE.Vector3(0, 0, 0);
				var buildingTwoPos = new THREE.Vector3(0, 0, 0);
				buildingOnePos.add(cityPlacementDir);
				buildingOnePos.add(roadPos);
				cityPlacementDir.multiplyScalar(-1);
				buildingTwoPos.add(cityPlacementDir);
				buildingTwoPos.add(roadPos);
				
				var buildingOneNodeSet = getSetFromString(this.axiom, buildingOnePos);
				var buildingTwoNodeSet = getSetFromString(this.axiom, buildingTwoPos);
				
				for(let currentNode of buildingOneNodeSet) {
					buildingSet.add(currentNode);
				}
				
				for(let currentNode of buildingTwoNodeSet) {
					buildingSet.add(currentNode);
				}
			}
		}
		return buildingSet;
	}
}