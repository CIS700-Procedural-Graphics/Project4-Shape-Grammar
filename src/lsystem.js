// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
    this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
    this.successorString = str; // The string that will replace the char that maps to this Rule
}

// TODO: Implement a linked list class and its requisite functions
// as described in the homework writeup
function Node(symbol, iter) {
    this.next = null;
    this.prev = null;
    this.symbol = symbol;
    this.iter = iter;
}

function LinkedList() {
    this.head = null;
    this.length = 0;
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

function addLeaves(linkedList, iter)
{
    for(var currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) {
        if (currentNode.symbol == 'F' && currentNode.iter == iter)
        {
            var node = new Node('L', iter + 1);
            var next = currentNode.next;
            linkedList.link(currentNode, node);
            if (next)
            {
                linkedList.link(node, next);
            }
        }
    }
}

export default function Lsystem(axiom, grammar, iterations) {
    // default LSystem
    this.axiom = "FKKX";
    this.grammar = {};
    this.grammar['X'] = [
        new Rule(0.2, '[-FX][+FX][<FX][>FX]'),
        new Rule(0.1, '[-FXG][+FX][<FX]'),
        new Rule(0.1, '[-FX][+FXG][>FX]'),
        new Rule(0.1, '[-FX][<FX][>FX]'),
        new Rule(0.1, '[+FX][<FX][>FXG]'),
        new Rule(0.1, '[-FX]'),
        new Rule(0.1, '[+FX]'),
        new Rule(0.1, '[<FX]'),
        new Rule(0.1, '[>FX]'),

    ];
    this.grammar['G'] = [
        new Rule(0.8, 'G'),
        new Rule(0.2, 'L')
    ];
    this.grammar['K'] = [
        new Rule(0.5, 'K'),
        new Rule(0.5, 'X')
    ];
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
        addLeaves(lSystemLL, n);
        return lSystemLL;
    }
}