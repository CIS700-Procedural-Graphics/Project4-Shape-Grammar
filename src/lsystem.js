// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, str) {
  this.probability = prob;
  this.successorString = str;
}

class LinkedList {
  constructor() {
    this.head = undefined;
    this.tail = undefined;
  }

  add_first(value) {
   var node = new Node(undefined, undefined, value);
    if (this.head === undefined) {
      this.head = node;
      this.tail = node;
    }
    else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
  }

  add_last(value) {
    var node = new Node(undefined, undefined, value);
    if (this.tail === undefined) {
      this.head = node;
      this.tail = node;
    }
    else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
  }

  remove_first() {
    var temp = this.head;
    if (this.head === undefined) {
      return;
    }
    else if (this.head.next === undefined) {
      this.head = undefined;
      this.tail = undefined;
    }
    else {
      this.head.next.prev = undefined;
      this.head = this.head.next;
    }
    temp.next = undefined;
  }

  remove_last() {
    var temp = this.tail;
    if (this.tail === undefined) {
      return;
    }
    else if (this.head === this.tail) {
      this.head = undefined;
      this.tail = undefined;
    }
    else {
      this.tail.prev.next = undefined;
      this.tail = this.tail.prev;
    }
    temp.prev = undefined;
  }

  // this method will only be called on valid nodes
  link_nodes(n1, n2) {
    if (n1 !== undefined) {
      n1.next = n2;
    }
    else {
      this.head = n2;
    }
    if (n2 !== undefined) {
      n2.prev = n1;
    }
    else {
      this.tail = n1;
    }
  }
}

class Node {
  constructor(next, prev, symbol) {
    this.next = next;
    this.prev = prev;
    this.sym = symbol;
  }
}

export function stringToLinkedList(input_string) {
    var ll = new LinkedList();
    for (var i = 0, len = input_string.length; i < len; i++) {
      ll.add_last(input_string[i]);
    }
    return ll;
}

export function linkedListToString(linkedList) {
  var result = "";
  var curr = linkedList.head;
  while (curr !== undefined) {
    result += curr.sym;
    curr = curr.next;
  }
  return result;
}

function print_list(linkedList) {
  var curr = linkedList.head;
  var res = '';
  while (curr !== undefined) {
    res += curr.sym;
    curr = curr.next;
  }
  console.log(res);
}
// insert a sub-linked-list that represents replacementString
function replaceNode(linkedList, node, replacementString) {
  var new_list = stringToLinkedList(replacementString);
  var new_list_head = new_list.head;
  var new_list_tail = new_list.tail;
  // append head of new list
  if (node === linkedList.head) {
    linkedList.link_nodes(undefined, new_list_head);
  }
  else {
    linkedList.link_nodes(node.prev, new_list_head);
  }
  // then do tail of new list
  if (node === linkedList.tail) {
    linkedList.link_nodes(new_list_tail, undefined);
  }
  else {
    linkedList.link_nodes(new_list_tail, node.next);
  }
}

export default function Lsystem(axiom, grammar, iterations) {
  // default LSystem, B: Branch
  // this.axiom = "BW[+BW][-BW][(BW][)BW]";
  this.axiom = "BX"
  this.grammar = {};
  this.grammar['X'] = [
    new Rule(0.3, '[-BLX][<BLX]'),
    new Rule(0.1, 'BLX'),
    new Rule(0.3, '[-BX][+BLX]BL[>BLX][(BLX]'),
    new Rule(0.3, '[-BLX][+BLX][)BLX]')
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
    for (var i = 0; i < this.iterations; i++) {
      this.expand(lSystemLL);
    }
    return lSystemLL;
  }

  this.expand = function(symbol_list) {
    var curr = symbol_list.head;
    // print_list(symbol_list);
    while (curr !== undefined) {
      // look at each symbol, find it in the dictionary
      var sym = curr.sym;
      if (sym === '[' || sym === ']' || sym === '+' || sym == '-') {
        curr = curr.next;
        continue;
      }
      if (this.grammar[sym]) {
        // generate a random number
        var rand = Math.random();
        // probabilistically choose a rule
        var sum = 0;
        var replacement_str;
        for (var i = 0; i < this.grammar[sym].length; i++) {
          var rule = this.grammar[sym][i];
          sum += rule.probability;
          if (sum >= rand) {
            replacement_str = rule.successorString;
            break;
          }
        }
        // insert this linkedlist in place of the current node, CAREFULLY
        var old_next = curr.next;
        replaceNode(symbol_list, curr, replacement_str);
        curr = old_next;
      }
      else {
        curr = curr.next;
      }
    }
  }
}
