const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much

// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.successorString = str; // The string that will replace the char that maps to this Rule
}

// TODO: Implement a linked list class and its requisite functions
// as described in the homework writeup
export class Node {
	constructor(character, prev, next){
		this.character = character;
		this.prev = prev;
		this.next = next;
	}
}

export class LinkedList {
	constructor() {
		this.head = null;
	}
	append( node ){
		if( this.head === null ){
			this.head = node;
			return;
		}
		var n = this.head;
		var done = false;
		while( ! done ) {
			if( n.next === null ){
				n.next = node;
				return;
			}
			n = n.next;
		}
	}
}

//Find the last node in a list of node, not necessarily
// a LinkedList
export function getLastNode( firstNode ) {
	var lastNode = firstNode;
	while( lastNode.next !== null )
	  lastNode = lastNode.next;
	return lastNode;
}

//Append node B to node A
//Returns A
export function appendNode( A, B ){
	A.next = B;
	B.prev = A;
	return A;
}

// Take a string and make linked nodes,
// but not a full LinkedList.
// Returns the first node
export function stringToNodes(input_string){
	var prev = null;
	var first = null
	for( var i=0; i < input_string.length; i++ ){
		var node = new Node( input_string.charAt(i), prev, null );		
		if( first === null )
		  //Begin of list
		  first = node;
		else
		  //Point predecessor to this new node
		  prev.next = node;
		//point the node to its predecessor
		node.prev = prev;
		//set up for next iteration
		prev = node;
	}
	return first;
}
// TODO: Turn the string into linked list 
export function StringToLinkedList(input_string) {
	// ex. assuming input_string = "F+X"
	// you should return a linked list where the head is 
	// at Node('F') and the tail is at Node('X')
	var ll = new LinkedList();
	ll.head = stringToNodes(input_string);
	return ll;
}

// TODO: Return a string form of the LinkedList
export function LinkedListToString(linkedList) {
	// ex. Node1("F")->Node2("X") should be "FX"
	var result = "";
	var node = linkedList.head;
	while( node !== null ){
	  result += node.character;
	  node = node.next;
	}
	return result;
}

// TODO: Given the node to be replaced, 
// insert a sub-linked-list that represents replacementString
function replaceNode(linkedList, node, replacementString) {
	var firstNewNode = stringToNodes( replacementString );
	firstNewNode.prev = node.prev;
	var next = null;
	if( linkedList.head === node ){
		next = node.next;
		linkedList.head = firstNewNode;
	} else {
		node.prev.next = firstNewNode;
		next = node.next;
	}
	//point to the old node's next node
	var lastNewNode = getLastNode( firstNewNode );
	lastNewNode.next = next;
	if( next !== null )
		next.prev = lastNewNode;
}

export default function Lsystem(axiom, grammar, iterations) {
	// default LSystem
	this.axiom = "FA";
	this.grammar = {};
	this.grammar['A'] = [
		new Rule(0.55, '[YY-CFA][YY+CFA]'),
		new Rule(0.25, '[yyy--CFA][y++CFA]'),
		new Rule(0.2, '[ZZcccA]' )
	];
	this.grammar['B'] = [
		new Rule(0.0, ''),
		new Rule(0.0, ''),
		new Rule(0.0, '' )
	];
	this.grammar['C'] = [
		new Rule(0.0, ''),
		new Rule(0.0, ''),
		new Rule(0.0, '' )
	];
	this.iterations = 10; 
	this.prevIterations = -1;
	
	this.startingRotations = [10,0,0];
	
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

	this.getRandom = function(x,y){
	   var vec = new THREE.Vector2(x,y);
 	   return Math.abs( ( Math.sin( vec.dot( new THREE.Vector2(12.9898,78.233))) * 43758.5453 ) % 1 );
	}

	//Normalize rule probabilities
	this.normalizeRuleProbabilities = function () {
		for (var property in this.grammar) {
			if (this.grammar.hasOwnProperty(property)) {
				// do stuff
				var ruleArr = this.grammar[property];		
				var sum = 0;
				for( var i = 0; i < ruleArr.length; i++ ) {
					sum += ruleArr[i].probability;
				};
				if( sum > 0)
 				  for( var i = 0; i < ruleArr.length; i++ ) {
					  ruleArr[i].probability /= sum;
				  };
			}
		}

	}
	//For this node's character, check if there's an expansion for it
	// and return the string. Otherwise just return ''.
	this.getRuleExpansion = function( node, seed1, seed2 ){
		if( this.grammar[node.character] === undefined ){
			//console.log('getRuleExp: no expansion for ', node.character);
		    return '';
		}
		//console.log('getRuleExp: expanding ', node.character);
		
		var date = new Date();
		seed1 += (date.getTime() % 7);
		seed2 -= (date.getTime() % 11);
		
		//We've got a match. Choose rule variation based on probability.
		//Assumes cumulative probability w/in a rule character is 1.0
		var rand = this.getRandom(seed1, seed2); // [0,1], hopefully nicely distributed
		var cutoff = 0;
		var result = '';
		var ruleArr = this.grammar[node.character];		
		//NOTE: don't use array.ForEach here, cuz we can't break out of that loop
		for( var i = 0; i < ruleArr.length; i++ ) {
			var element = ruleArr[i];
			cutoff += element.probability;
			if( rand <= cutoff ){
				//Make a list of linked nodes from the string
				//console.log('getRuleExp - matched - element: ', element);
				result = element.successorString;
				//console.log('getRuleExp: chose rule ', result, ' rand, cutoff: ', rand, cutoff );
				break;
			}
		};
		
		//should only get here when total probs for a rule set don't sum to 1.0
		if( result == '' && cutoff >= 1.0 )
			//alert('getRuleExpansion...oops!');
			console.log('WARNING: getRuleExpansion...oops! No result. cutoff, rand: ', cutoff, rand);
		return result;		
	}

	// TODO
	// This function returns a linked list that is the result 
	// of expanding the L-system's axiom n times.
	// The implementation we have provided you just returns a linked
	// list of the axiom.
	this.doIterations = function(numIts) {
		//Get the linked list representing the axom
		var lSystemLL = StringToLinkedList(this.axiom);
		/*console.log('axiom: ', this.axiom);
		console.log('lSystemLL ', lSystemLL );
		console.log('head ', lSystemLL.head );
		console.log('last ', getLastNode(lSystemLL.head) );*/
		
		//Normalize the rule probabilities
		this.normalizeRuleProbabilities();
		
		//Run through N interations of expanding rules
		//0 iterations is just the axiom, so for n==1 we just do one iteration
		for( var iter = 1; iter <= numIts; iter++ ){
			for( var node = lSystemLL.head; node !== null; node=node.next ){
				//For this node's character, check if there's an expansion for it
				// and return the new node list for it. Otherwise just return this node.
				var string = this.getRuleExpansion( node, iter+1, numIts );
				//console.log('doIts: string: ', string);
				if( string != '' )
					replaceNode(lSystemLL, node, string);
				//debug
				//var str = LinkedListToString(lSystemLL);
				//console.log('iteration ', iter, ' of ', numIts);
				//console.log('lsys ll to string: ', str );
			}
		}
		
		var str = LinkedListToString(lSystemLL);
		console.log('Final lsys ll to string: ', str );
		return lSystemLL;
	}
}