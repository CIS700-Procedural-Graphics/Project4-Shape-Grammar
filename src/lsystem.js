// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
    this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
    this.successorString = str; // The string that will replace the char that maps to this Rule
}

// TODO: Implement a linked list class and its requisite functions
// as described in the homework writeup
class Node {
    constructor() {
        this.prevNode = null;
        this.nextNode = null;
        this.symbol = '';
    }
    getSymbol() {
        return this.symbol;
    }
    setSymbol(newSymbol) {
        this.symbol = newSymbol;
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
    addNodeWithSymbol(nodeSymbol) {
        if (this.length == 0) {
            var newNode = new Node();
            newNode.setSymbol(nodeSymbol);
            this.startNode = newNode;
        } else {
            var temp = this.startNode;
            while (temp.getNext() != null) {
                temp = temp.getNext();
            }
            var newNode = new Node();
            newNode.setSymbol(nodeSymbol);
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

    // given the desired node to replace and an array of replacement symbols
    expandNode(nodeToExpand, replacementSymbols) {
        var symbol = nodeToExpand.getSymbol();
        if (replacementSymbols.length > 0) {
            var nullNode = new Node();
            var prevNode = nodeToExpand.getPrev();
            var nextNode = nodeToExpand.getNext();
            this.deleteNode(nodeToExpand);
            var simpleAdd = true;
            if (this.length > 0) simpleAdd = !simpleAdd;
            for (var i = 0; i < replacementSymbols.length; i++) {
                if (!simpleAdd) {
                    var newNode = new Node();
                    newNode.setSymbol(replacementSymbols[i]);
                    this.linkNodes(prevNode, newNode);
                    prevNode = newNode;
                    if (i == replacementSymbols.length - 1) {
                        this.linkNodes(newNode, nextNode);
                    }
                } else {
                    this.addNodeWithSymbol(replacementSymbols[i]);
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
    var symbols = input_string.split("");
    var ll = new LinkedList();
    for (var i = 0; i < symbols.length; i++) {
        ll.addNodeWithSymbol(symbols[i]);
    }
    console.log(ll);
    return ll;
}

// TODO: Return a string form of the LinkedList
export function linkedListToString(linkedList) {
    // ex. Node1("F")->Node2("X") should be "FX"
    var result = "";
    var temp = linkedList.getStartNode();
    while (temp != null) {
        result += temp.getSymbol();
        temp = temp.getNext();
    }
    return result;
}

// TODO: Given the node to be replaced, 
// insert a sub-linked-list that represents replacementString
function replaceNode(linkedList, node, replacementString) {
    var replacementStringArray = replacementString.split("");
    linkedList.expandNode(node, replacementStringArray);
}

export default function Lsystem(axiom, grammar, iterations) {
    // default LSystem
    this.axiom = "X";// FX";
    this.grammar = {};
    // this.grammar['X'] = [
    //     new Rule(1.0, '[-FX][+FX]')
    // ];
    this.grammar['F'] = [new Rule(0.7, 'FF'), new Rule(0.3, '[-FK][+FK]F[-FK][+FK]')];//new Rule(0.2, '[-F][F][+F]'), new Rule(0.5, 'F[+F]F[-F]F'), new Rule(0.3, '[+F]F[-F][F]')];
    this.grammar['X'] = [new Rule(1.0, 'F−[[X]+X]+F[+FX]−X')];
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
                if (temp == null) break;
                var grammarRuleArray = this.grammar[temp.getSymbol()];
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
                    replaceNode(lSystemLL, temp, replacementString);
                } 
                temp = temp.getNext(); 
            }
        }
        return lSystemLL;
    }
}