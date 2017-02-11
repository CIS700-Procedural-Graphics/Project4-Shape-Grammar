/*
PROJECT 4 NOTES:

- make a building generator
- make a city generator
- do lsystem grammar for shape grammar
- make some simple rules
  - take a cube and subdivide randomly along x axis
  - do the same but for y axis (to get that tower look)


load in obj for different blocks
- plain wall
- plain wall with a window
- plain wall with a door
- tower

*/



var allShapesList = {};	//this is like our axiom. i.e. --> {a, c, d, b}

//======================================================== SHAPE GRAMMAR CLASS ===============================================================
function ShapeGrammar(iterations){	//input number of iterations

	/*
	['A'] = {	new shapeRule(0.6, subdivideX), new shapeRule(0.4, subdivideY)	}
	*/


	var currShape;

	for(var n = 0; n < iterations; n++)
	{
		for(var i = 0; i < allShapesList.length; i++)
		{
			currShape = allShapesList[i];

			//call currShape's function
			//save its output (which should be other shapes)
			//append to end of allShapesList	//OR APPEND IN THE FUNCTION DIRECTLY ITSELF
			//remove currShape

		}//end for i
	}//end for n
}//end function render shapes


//======================================================== SHAPE RULE CLASS ===============================================================
// A class that represents a function replacement rule to
// be used when expanding an L-system grammar.
function shapeRule(prob, func) {
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.function = func; // The shapes that will replace the char that maps to this Rule
}//end Rule class


//PLAIN WALL
// var geometry = new THREE.BoxGeometry( 1, 2, 0.5 );	//width, height, depth
// var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
// var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );


//new shapeRule
//takes an input shape, outputs a different shape
function subdivideX(currShape) {
	var currShapePos = currShape.position;

	//create 2 new cubes with positions offsetted from original position

	//add to all shapes

}


//======================================================== SYMBOL NODE CLASS ===============================================================
function SymbolNode(geom, pos, scale) {
	//associated geometry instance
	//position
	//scale
	this.geometry = geom;
	this.position = pos;
	this.scale = scale;
}




//======================================================== RULE CLASS ===============================================================
// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.successorString = str; // The string that will replace the char that maps to this Rule
}//end Rule class




/* //=================================================== LINKED LIST & NODE CLASSES ============================================================
You should write a Linked List class with Nodes that contain at least the following information:

    - The next node in the linked list
    - The previous node in the linked list
    - The grammar symbol at this point in the overall string

We also recommend that you write the following functions to interact with your linked list:

- A function to symmetrically link two nodes together (e.g. Node A’s next is Node B, and Node B’s prev is Node A)

- A function to expand one of the symbol nodes of the linked list by replacing it with several new nodes.
        This function should look at the list of rules associated with the symbol in the linked list’s grammar dictionary,
        then generate a uniform random number between 0 and 1 in order to determine which of the Rules should be used
        to expand the symbol node. You will refer to a Rule’s probability and compare it to your random number in order
        to determine which Rule should be chosen.
	(NOTE: THIS IS ESSENTIALLY JUST REPLACENODE)
*/

function Node(gramSym, i) {
	this.previous = null;
	this.next = null;
	this.grammarSym = gramSym;
	this.index = i;
	//this.replaceable = replaceBool;

	this.linkNodes = function(nodeA, nodeB) {
		//nodeA.next = nodeB;
		nodeA.next = nodeB;
		//nodeB.previous = nodeA;
		nodeB.previous = nodeA;
	}//end linkNodes function

}//end Node class

function LinkedList() {
	this.head = null;
	this.tail = null;
	this._length = 0;
}//end LinkedList class




//=================================================== EXTERNAL FUNCTIONS ==========================================================

// TODO: Implement a linked list class and its requisite functions
// as described in the homework writeup

// TODO: Turn the string into linked list
export function StringToLinkedList(input_string) {
	// ex. assuming input_string = "F+X"
	// you should return a linked list where the head is
	// at Node('F') and the tail is at Node('X')
	//console.log(input_string);
	//console.log(input_string.length);

	var ll = new LinkedList();

	var headNode = new Node(input_string.charAt(0), 0);
	//console.log(input_string.charAt(0));	//THIS GIVES ME F

	ll.head = headNode;
	ll._length++;

	var currNode = headNode;

	for(var x = 1; x < input_string.length; x++)
	{
		var currSym = input_string.charAt(x);
		//console.log(input_string.charAt(x));

		var newNode = new Node(currSym, x)

		currNode.next = newNode;
		newNode.previous = currNode;
		currNode = newNode;
		ll._length++;
	}//end for x

	ll.tail = currNode;	//curr should be the last one technically

	return ll;
}


// TODO: Return a string form of the LinkedList
export function LinkedListToString(linkedList) {
	// ex. Node1("F")->Node2("X") should be "FX"
	var result = "";
	var currSym = "";

	var currNode = linkedList.head;
	var nextNode = currNode.next;

	while(nextNode != null)
	{
		currSym = currNode.grammarSym;
		result += currSym;
		nextNode = nextNode.next;
	}

	return result;
}

// TODO: Given the node to be replaced,
// insert a sub-linked-list that represents replacementString
function replaceNode(linkedList, node, replacementString) {

	//what to do with replacement string
	//find what rule to do
	//maybe you have a function called applyrandom rule
	//returns rule you need to implement
	//rule has a successor string
	//use that string, make a linked list out of it, and use that to replace the node

	//cut out node and replace with linked list you get from return of stringToLinkedList

	var currNodePrev = node.previous;
	var currNodeNext = node.next;

	var subLL = StringToLinkedList(replacementString);
	var replaceNodeHead = subLL.head;
	var replaceNodeTail = subLL.tail;


	//node is at head of linkedlist
	if(node.previous === null)
	{
		replaceNodeHead.previous = null;
		linkedList.head = replaceNodeHead;
	}
	else {
		currNodePrev.next = replaceNodeHead;
		replaceNodeHead.previous = currNodePrev;
	}

	//if node is at tail of linkedlist
	if(node.next === null)
	{
		replaceNodeTail.next = null;
		linkedList.tail = replaceNodeTail;
	}
	else{
		currNodeNext.previous = replaceNodeTail;
		replaceNodeTail.next = currNodeNext;
	}

}//end replace node function




//=================================================== LSYSTEM CLASS ==============================================================
export default function Lsystem(axiom, grammar, iterations) {
	// default LSystem
	this.axiom = "FX";//"FFX";//FX
	this.grammar = {};
	this.grammar['X'] = [//'X'] = [
		new Rule(1.0, 'FF-[-F+F+S+FX]+[+F-F-S-FX]X'),//'F[RX][LX][SX]FX')
		new Rule(0.4, 'F[RX][LX][SX]FX')	//change this between 0.1 and 0.7

		//change axiom
		//change rotation


		/* Cool looking sword like tree
			this.axiom = "FFFX";
			this.grammar = {};
			this.grammar['X'] = [
			new Rule(1.0, 'F[RX][LX]FX')*/

		/*	new Rule(0.7, '[-FX][+FX]'),
				new Rule(0.3,'FF-[-F+RX]+[-F+RX]')*/

		/*	new Rule(0.3, '[-FX][+FX]'),
				new Rule(0.7,'FF-[-F-LX]+[-F+RX]')*/


		//FF-[-F-L]+[-F-F+R] --> bigger creepy hand
		//FF-[-F-L]+[-F+R] --> creepy hand
		//FFF-[-F+F-L]+[+F-F+R]
		//FFF-[-F+F-L]+[+F-F-R]
		//FF-[-F+F+L]+[+F-F-R]'
		//Side tree: F=FF-[-F+F+F]+[+F-F-F]
		//[FF-FX][+FRX][-FLX]
		//'FFF[-X][+RX][-LX]'

	];
	this.iterations = 0;
	this.randomVal = 0.1;

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
	}//end updateAxiom function

	this.updateRandomVal = function(randVal) {
		if(typeof randVal !== "undefined") {
			this.grammar['X'] = [
				new Rule(1.0, 'FF-[-F+F+S+FX]+[+F-F-S-FX]X'),
				new Rule(randVal, 'F[RX][LX][SX]FX')];
		}
	}




	// TODO
	// This function returns a linked list that is the result
	// of expanding the L-system's axiom n times.
	// The implementation we have provided you just returns a linked
	// list of the axiom.
	this.DoIterations = function(n) {
		var lSystemLL = StringToLinkedList(this.axiom);

		for(var r = 0; r < n; r++)
		{
			var currNode = lSystemLL.head;

			while(currNode !== null)
			{
				var nextOfCurrSym = currNode.next;
				var currSym = currNode.grammarSym;
				var rulesArray = this.grammar[currSym];

				if(typeof rulesArray !== "undefined")
				{
					var replacementStr = "";

					var randomVal = Math.random();	//returns value between [0, 1)
					var ProbVal1 = rulesArray[0].probability;
					var ProbVal2 = rulesArray[1].probability;

					if(randomVal < ProbVal1 && randomVal > ProbVal2)
					{
						replacementStr = rulesArray[0].successorString;
					}
					else {
						replacementStr = rulesArray[1].successorString;
					}

					//THIS DOESNT WORK FOR SOME REASON
					// var currTotal = 0.0;
					// console.log(randomVal);
					// //iterate through the array of rules for this currSym
					// for(var x = 0; x < rulesArray.length; x++)
					// {
					// 	var currProbVal = rulesArray[x].probability
					// 	currTotal += currProbVal;
					// 	if(randomVal < currTotal)
					// 	{
					// 		replacementStr = rulesArray[x].successorString;
					// 	}//end if
					// }//end for loop

					replaceNode(lSystemLL, currNode, replacementStr);

				}//end if currsym is in dictionary
				currNode = nextOfCurrSym;
			}//end while loop
		}//end for loop
		return lSystemLL;
	}//end doIterations function
}//end LSystem Class
