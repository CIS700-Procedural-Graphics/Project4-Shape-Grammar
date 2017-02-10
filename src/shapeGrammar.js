const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much

// A class that represents a symbol replacement rule to
// be used when expanding an L-system or Shape grammar.
function Rule(prob, f) {
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.shapeFunc = f; // The func that will be called when we apply this rule to a geometry
}

// SymbolNode class contains information about a piece of geometry in city
class SymbolNode {
	constructor(grammarSymbol, terminal) {
		//default symbol node geometry:
		var geometry = new THREE.BoxGeometry(1, 1, 1);
		var material = new THREE.MeshLambertMaterial( { color : 0xffffff });
		this.grammarSymbol = grammarSymbol;
		this.terminal = terminal; //true/false
		
		this.mesh = new THREE.Mesh( geometry, material );
	}
}

// City class contains information regarding characteristics such as geography, population density, etc
class City {
	constructor() {
		this.shapeGrammar = new ShapeGrammar(); //Grammar associated with this City
	}
}

// Return a set of symbol nodes representing the input string
function getSetFromString(inputString) {
	var symbolSet = new Set();
	
	//Create a symbolNode from each character in the string
	for(var i = 0, len = inputString.length; i < len; i++) {
		var symbolNode = new SymbolNode(inputString.charAt(i), false);
		symbolSet.add(symbolNode);
	}
	return symbolSet;
}

// Subdivide the node (currently should be a cube) to make to nodes
// Then add the new node into the set of geometry
function subdivideCubeNode(node, geometrySet) {
	// console.log('made it here');
	// console.log(geometrySet);
	var newCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
	var newCubeMaterial = new THREE.MeshLambertMaterial({ color : (new THREE.Color(node.mesh.material.color)).multiplyScalar(0.5) });
	var newCubeMesh = new THREE.Mesh( newCubeGeometry, newCubeMaterial );
	
	//alter the position of the new cube - just subdivide along the x-axis
	newCubeMesh.position.x = node.mesh.position.x - node.mesh.scale.x / 4;
	node.mesh.position.x += node.mesh.scale.x / 4;
	
	//alter the scale of the objects
	newCubeMesh.scale.x = node.mesh.scale.x * 0.5;
	node.mesh.scale.x *= 0.5;
	//node.mesh.material.color = new THREE.Color(0xff0000);
	
	newCubeMesh.position.y = node.mesh.position.y + 1;
	
	var newCubeNode = new SymbolNode('C', false);
	newCubeNode.mesh = newCubeMesh;
	geometrySet.add(newCubeNode);
	// console.log(node);
	geometrySet.add(node);
	return geometrySet;
}

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

/*
   Shape Grammar "class" contains the dictionary of grammar for the shapes in the city
   as well as the set containing all geometry in the scene.
*/

export default function ShapeGrammar(axiom, grammar) {
	this.axiom = "C"; //For now, C = cube
	this.grammar = {};
	
	//Add rules to our grammar
	this.grammar['C']  = [
		new Rule(1.0, subdivideCubeNode)
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
		var replacementFunc = this.grammar[element.grammarSymbol][0].shapeFunc;
		// console.log(this.grammar[element.grammarSymbol][0]);
		// console.log(replacementFunc);
		if(typeof replacementFunc != "undefined") {
			// console.log(element);
			set = replacementFunc(element, set);
		}
		//var replacementNodes = getSetFromString(replacementString);
		//addSetToSet(replacementNodes, geometrySet); //add the new nodes to the original set
		//set.delete(element);
		// console.log(replacementString);
	}
	
	// Apply the grammar to the axiom n times and then
	// return the set of geometry to be placed into the city
	this.doIterations = function(n) {
		var geometrySet = getSetFromString(this.axiom);
		if(n == 0) {
			return geometrySet;
		} else {
			var originalSet = geometrySet;
			var replacementNodeSet = new Set(); //will contain the nodes to add according to the grammar
			for(var i = 0; i < n; i++) { //For each iteration, operate on the set
				
				//apply the rules of the shape grammar to every node
				var self = this;
				for(let value of geometrySet) {
					self.applyGrammarRules(value, replacementNodeSet);
				}
				
				//Accumulate the nodes from the applied grammar rules
				geometrySet = unionSets(geometrySet, replacementNodeSet);
			}
			return geometrySet;
		}
	}
}