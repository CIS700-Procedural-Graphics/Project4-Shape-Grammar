const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
    this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
    this.successorString = str; // The string that will replace the char that maps to this Rule
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

class Shape {
    constructor() {
        this.position = { x: getRandom(-100,100), y: 0, z: getRandom(-100,100)}; 
        this.scale = { x: getRandom(1,10), y: getRandom(1,50), z: getRandom(1, 10)};
        this.symbol = ''; // name of the associated geometry for this symbol
        this.geom = {}; 
    }
}

class Node {
    constructor() {
        this.prevNode = null;
        this.nextNode = null;
        this.shape = new Shape();
    }
    getShape() {
        return this.shape;
    }
    setShape(newShape) {
        this.shape = new Shape();
        this.shape.symbol = newShape;
    }
    getNext() {
        return this.nextNode;
    }
    setNext(newNext) {
        this.nextNode = newNext; 
    }
    getPrev() {
        return this.prevNode;
    }
    setPrev(newPrev) {
        this.prevNode = newPrev;
    }
}

class LinkedList {
    constructor() {
        this.startNode = new Node();
        this.length = 0; 
    }

    // adds a node to the end of the linked list
    addNodeWithShape(nodeShape) {
        if (this.length == 0) {
            var newNode = new Node();
            newNode.setShape(nodeShape);
            this.startNode = newNode;
        } else {
            var temp = this.startNode;
            while (temp.getNext() != null) {
                temp = temp.getNext();
            }
            var newNode = new Node();
            newNode.setShape(nodeShape);
            newNode.setPrev(temp);
            temp.setNext(newNode);
        } 
        this.length += 1;
    }

    getStartNode() {
        return this.startNode;
    }

    getLength() {
        return this.length;
    }

    deleteNode(nodeToDelete) {
        var prevNode = nodeToDelete.getPrev();
        var nextNode = nodeToDelete.getNext(); 
        if (prevNode == null && nextNode == null) {
            this.startNode = null;
        } else if (prevNode == null && nextNode != null) {
            this.startNode = nextNode;
            nextNode.setPrev(null);
        } else if (prevNode != null && nextNode == null) {
            prevNode.setNext(null);
        } else {
            nextNode.setPrev(prevNode);
            prevNode.setNext(nextNode);
        }
        this.length--;
    }

    linkNodes(nodeA, nodeB) {
        if (nodeA != null) {
            nodeA.setNext(nodeB);
        } 
        if (nodeB != null) {
            nodeB.setPrev(nodeA);
        }
    }

    addGeometries(scene) {
        
    }

    // given the desired node to replace and an array of replacement symbols
    expandNode(scene, nodeToExpand, replacementShapes) {
        if (replacementShapes.length > 0) {
            var nullNode = new Node();
            var prevNode = nodeToExpand.getPrev();
            var nextNode = nodeToExpand.getNext();
            this.deleteNode(nodeToExpand);
            var simpleAdd = true;
            if (this.length > 0) simpleAdd = !simpleAdd;
            for (var i = 0; i < replacementShapes.length; i++) {
                if (!simpleAdd) {
                    var newNode = new Node();
                    newNode.setShape(replacementShapes[i]);
                    this.linkNodes(prevNode, newNode);
                    prevNode = newNode;
                    if (i == replacementShapes.length - 1) {
                        this.linkNodes(newNode, nextNode);
                    }
                } else {
                    var newNode = this.addNodeWithShape(replacementShapes[i]);
                }
                
                this.length++;
            }
        }
    }
}


// TODO: Turn the string into linked list 
export function stringToLinkedList(input_string) {
    // ex. assuming input_string = "F+X"
    // you should return a linked list where the head is 
    // at Node('F') and the tail is at Node('X')
    var shapes = input_string.split("");
    var ll = new LinkedList();
    for (var i = 0; i < shapes.length; i++) {
        ll.addNodeWithShape(shapes[i]);
    }
    return ll;
}

// TODO: Return a string form of the LinkedList
export function linkedListToString(linkedList) {
    // ex. Node1("F")->Node2("X") should be "FX"
    var result = "";
    var temp = linkedList.getStartNode();
    while (temp != null) {
        result += temp.getShape().symbol;
        temp = temp.getNext();
    }
    return result;
}

// TODO: Given the node to be replaced, 
// insert a sub-linked-list that represents replacementString
function replaceNode(scene, linkedList, node, replacementString) {
    var replacementStringArray = replacementString.split("");
    linkedList.expandNode(scene, node, replacementStringArray);
}

export default function ShapeSystem(scene, axiom, grammar, iterations) {
    // default LSystem
    var numBuildings = getRandomInt(10, 50);
    var axiomString = "";
    for (var i = 1; i <= numBuildings; i++) {
        axiomString += "X";
    }
    this.axiom = axiomString;// FX";
    this.grammar = {};
    this.grammar['X'] = [new Rule(1.0, 'FFF')];
    this.iterations = 0; 
    
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

    // TODO
    // This function returns a linked list that is the result 
    // of expanding the L-system's axiom n times.
    // The implementation we have provided you just returns a linked
    // list of the axiom.
    this.doIterations = function(n) {   
        var lSystemLL = stringToLinkedList(this.axiom);
        for (var i = 0; i < n; i++) {
            var temp = lSystemLL.getStartNode();
            var lSystemLength = lSystemLL.getLength();
            for (var j = 0; j < lSystemLength; j++) {
                console.log(temp);
                if (temp == null) break;
                console.log(temp.getShape());
                var grammarRuleArray = this.grammar[temp.getShape().symbol];
                if (grammarRuleArray != null) {
                    var replacementString = '';
                    var determineRule = Math.random();
                    console.log(determineRule);
                    var tempMin = 0;
                    var tempMax = 0;
                    for (var k = 0; k < grammarRuleArray.length; k++) {
                        tempMax += grammarRuleArray[k].probability;
                        if (determineRule >= tempMin && determineRule <= tempMax) {
                            replacementString = grammarRuleArray[k].successorString;
                            break;
                        } 
                        tempMin += grammarRuleArray[k].probability; 
                    }
                    replaceNode(scene, lSystemLL, temp, replacementString);
                } 
                temp = temp.getNext(); 
            }
        }
        console.log(lSystemLL);

        var node = lSystemLL.getStartNode();
        do {
            console.log("making cube");
            //based on values in shape attributes
            var geometry = new THREE.BoxGeometry( node.shape.scale.x, node.shape.scale.y, node.shape.scale.z);
            var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
            var cube = new THREE.Mesh( geometry, material );
            cube.position.setX(node.shape.position.x);
            cube.position.setY(node.shape.position.y);
            cube.position.setZ(node.shape.position.z);
            scene.add( cube );
            node = node.getNext();
        } while (node.getNext() != null) 
        console.log(scene);

        return lSystemLL;
    }
}