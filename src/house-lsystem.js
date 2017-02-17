const THREE = require('three')
// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
    this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
    this.successorString = str; // The string that will replace the char that maps to this Rule
}

function Node(symbol, iter) {
    this.next = null;
    this.prev = null;
    this.symbol = symbol;
    this.iter = iter;
}

function LinkedList(pos) {
    this.head = null;
    this.length = 0;
    this.scale = new THREE.Vector3(1.0, 1.0, 1.0);
    this.position = new THREE.Vector3(0, 0, 0);
    if (pos)
    {
        this.position = pos;
    }
}

LinkedList.prototype.getTailNode = function() {
    var currentNode = this.head;
    while (currentNode.next != null) {
        currentNode = currentNode.next;
    }
    return currentNode;
}

LinkedList.prototype.add = function(symbol, iter) {
    var node = new Node(symbol, iter);
    var currentNode = this.head;
    if (currentNode == null) {
        this.head = node;
        this.length = 1;
        return;
    }
    var tail = this.getTailNode();
    this.link(tail, node);
    this.length++;
}

LinkedList.prototype.link = function(first, second) {
    if (first != null)
    {
        first.next = second;
        if (second != null)
        {
            second.prev = first;
        }
    }
}

// TODO: Turn the string into linked list 
export function stringToLinkedList(input_string, iter) {
    // ex. assuming input_string = "F+X"
    // you should return a linked list where the head is 
    // at Node('F') and the tail is at Node('X')
    var ll = new LinkedList();
    for (var i = 0; i < input_string.length; i++) {
        ll.add(input_string[i], iter);
    }
    return ll;
}

// TODO: Return a string form of the LinkedList
export function linkedListToString(linkedList) {
    // ex. Node1("F")->Node2("X") should be "FX"
    var result = "";
    var currentNode = linkedList.head;
    while (currentNode != null) {
        result += currentNode.symbol;
        currentNode = currentNode.next;
    }
    return result;
}

// TODO: Given the node to be replaced, 
// insert a sub-linked-list that represents replacementString
function replaceNode(linkedList, node, replacementString, iter) {
    
    var nodeBefore = node.prev;
    var nodeAfter = node.next;

    var stringList = stringToLinkedList(replacementString, iter);
    var tail = stringList.getTailNode();

    if (nodeBefore == null && nodeAfter == null) {
        linkedList.head = stringList.head;
    }
    else if (nodeBefore == null)
    {
        linkedList.head = stringList.head;
        linkedList.link(tail, nodeAfter);
    }
    else if (nodeAfter == null) {
        linkedList.link(nodeBefore, stringList.head);
    }
    else {
        linkedList.link(nodeBefore, stringList.head);
        linkedList.link(tail, nodeAfter);
    }

    linkedList.length+= replacementString.length - 1;
    return linkedList;
}

export default function House(position, axiom, grammar, iterations) {
    this.axiom = "XR";
    this.grammar = {};
    this.grammar['X'] = [
        new Rule(0.34, 'LX'),
        new Rule(0.33, 'CX'),
        new Rule(0.33, 'SX')
    ];
    this.grammar['R'] = [
        new Rule(0.5, 'BK'),
        new Rule(0.5, 'YK')
    ];
    this.grammar['K'] = [
        new Rule(0.5, 'WE'),
        new Rule(0.5, 'K')
    ];
    this.iterations = 0;
    this.position = new THREE.Vector3(0, 0, 0);

    if (position !== "undefined")
    {
        this.position = position;
    } 
    
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
        //this.doIterations(iterations);
    }

    // A function to alter the axiom string stored 
    // in the L-system
    this.updateAxiom = function(axiom) {
        // Setup axiom
        if (typeof axiom !== "undefined") {
            this.axiom = axiom;
        }
    }

    // A function to alter the axiom string stored 
    // in the L-system
    this.updateGrammar = function(rule) {
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
        var lSystemLL = stringToLinkedList(this.axiom, 0);
        lSystemLL.position = this.position;
        for (var i = 0; i < n; i++) {
            var currentNode = lSystemLL.head;
            
            while (currentNode != null) {
                var next = currentNode.next;
                var symbol = currentNode.symbol;
                var iter = currentNode.iter;

                if (this.grammar[symbol])
                {
                    var rand = Math.random();
                    var sum = 0.0;
                    var rules = this.grammar[symbol];
                    for (var j = 0; j < rules.length; j++)
                    {
                        sum += rules[j].probability;
                        if (rand <= sum)
                        {
                            replaceNode(lSystemLL, currentNode, rules[j].successorString, i + 1);
                            break;
                        }
                    }
                }
                currentNode = next;
            }
        }
        return lSystemLL;
    }
}