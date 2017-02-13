var Random = require("random-js");

class LContext
{
	constructor()
	{
		this.branched = false;
	}

	copy()
	{
		return new LContext();
	}
}


// An instruction is essentially a symbol with logic, context, stack and (TODO) parameters
class LInstruction
{
	symbol() { return "A"; }
	evaluate(context, stack) { return context; }
}

// Dummy instructions can be anything, they are used for replacement
// Generic instruction
class DummyInstruction extends LInstruction 
{
	constructor(symbol) { super(); this.dummySymbol = symbol; }

	symbol() { return this.dummySymbol; }

	evaluate(context, stack) {
		return null;
	}
}

// Generic instruction
class PushInstruction extends LInstruction 
{  
	symbol() { return "["; }

	evaluate(context, stack) {
		stack.push(context);
		return null;
	}
}

// Generic instruction
class PullInstruction extends LInstruction
{
	symbol() { return "]"; }

	evaluate(context, stack) {
		var c = stack.pop(context);
		c.branched = true;
		return c;
	}
}

// A grammar chain is a doubly linked list of instructions
// that can be modified by given rules
class LInstructionChain 
{
  constructor()
  {
    this.root = null;
    this.last = null;
  }

  push(value) 
  {
    if(this.root == null)
    {
      this.root = { prev: null, next: null, value: value, new : false};
      this.last = this.root;
    }
    else if(this.last != null)
    {
      var node = { prev: this.last, next: null, value: value, new : true};
      this.last.next = node;
      this.last = node;
    }

    return this.last;
  }

  // Evaluates a chain of instructions, both with a context and a stack
  evaluate(initialState)
  {    
    var contextStack = [];
    var context = initialState;
    var stateArray = [context.copy()];

    this.evaluateInternal(function(node) {
      var c = node.value.evaluate(context.copy(), contextStack);

      // Some instructions may not want to modify the context
      if(c != null)
      {
      	// Debug data :D
      	c.relatedInstruction = node.value;
      	stateArray.push(c);

      	context = c;
      }
    });

    return stateArray;
  }

  evaluateInternal(evaluateFunc)
  {
    this.iterate(null, null, evaluateFunc);
  }

  // General purpose iteration function
  iterate(condition, returnFunc, evaluateFunc = null)
  {
    var node = this.root;

    while(node != null) {

      if(evaluateFunc != null)
        evaluateFunc(node);

      if(returnFunc != null && condition != null && condition(node))
        return returnFunc(node);

      node = node.next;
    }

    return null;
  }

  toString() 
  {
    var result = "";
    this.evaluateInternal(function(node) { result += node.value.symbol(); } );
    return result;
  }

  findAll(value) 
  {
    var nodes = [];
    this.iterate(null, null, function(node) { if(node.value == value) nodes.push(node); });
    return nodes;
  }

  find(value) 
  {
    return this.iterate(function(node){return node.value == value;}, function(node) { return node } );
  }

  // Because we're expanding in-place, we must be careful not to 
  // expand recently added nodes that come from a previous replacement
  // in the same expansion cycle. 
  expand(rules, random)
  {
	var node = this.root;

    while(node != null) 
    {
    	// Get next before replacement
		var next = node.next;

	  	for(var pred in rules)
	  	{
	  		if (rules.hasOwnProperty(pred))
	  		{
	  			var ruleArray = rules[pred];
	  			var replaced = false;

	  			var randomValue = random.real(0, 1, true);

	  			for(var r = 0; r < ruleArray.length && !replaced; r++)
		  		{
	  				if(node.value == ruleArray[r].predecessor)
	  				{
	  					if(ruleArray[r].probability >= 1.0 || ruleArray[r].probability > randomValue)
	  					{
		  					this.replace(node, ruleArray[r].successor);
		  					replaced = true;
		  					break;
		  				}
		  				else
		  				{
		  					randomValue -= ruleArray[r].probability;
		  				}
	  				}
		  		}
	  		}
	  	}

		node = next;
    }
  }

  // Now it only replaces one symbol. TODO context aware rules
  replaceSymbol(v, values)
  {
    this.replace(this.find(v), values);
  }

  replace(node, values) 
  {
    if(node == null)
      return;

    var prevNode = node.prev;
    this.last = prevNode;

    if(this.root == node)
      this.root = this.last;

    for(var i = 0; i < values.length; i++)
      this.push(values[i]);

    // Reconnect the chain, while ignoring the replaced node
    if(this.last != null)
    {
      this.last.next = node.next;

      if(node.next != null)
        node.next.prev = this.last;

      // Make sure we update the last node
      while(this.last.next != null)
        this.last = this.last.next;
    }
  }
}

// Just an auxiliary container of strings
function LRule(predecessor, successor, probability)
{
	this.predecessor = predecessor;
	this.successor = successor;
	this.probability = probability;
}

function LSystem(axiom, instructions, rules, iterations, random) 
{
	this.registerInstruction = function(instruction)
	{
		this.instructionMap[instruction.symbol()] = instruction;
	}

	this.getInstruction = function(symbol) 
	{
		if(!(symbol in this.instructionMap))
			console.error("Symbol " + symbol + " not present in instruction map!");

		return this.instructionMap[symbol];
	}

	this.parseAxiom = function(axiomSymbols) 
	{
		this.chain = new LInstructionChain();

		for(var i = 0; i < axiomSymbols.length; i++)
			this.chain.push(this.getInstruction(axiomSymbols[i]));
	}

	this.updateAxiom = function(axiom) 
	{
		this.axiom = axiom;
		this.parseAxiom(axiom);
	}

	this.parseRule = function(predecessor, successorList, probability)
	{
		var predInstruction = this.getInstruction(predecessor);
		var successorInstructions = [];

		for(var i = 0; i < successorList.length; i++)
			successorInstructions.push(this.getInstruction(successorList[i]));

		if(!(predecessor in this.ruleMap))
			this.ruleMap[predecessor] = [];

		this.ruleMap[predecessor].push( { predecessor: predInstruction, successor: successorInstructions, probability: probability });
	}

	this.expand = function()
	{
		var t = performance.now();

		// Reset the chain
		this.updateAxiom(this.axiom);

		for(var i = 0; i < this.iterations; i++)
		{
			this.chain.expand(this.ruleMap, this.random);
		}

		t = performance.now() - t;

		// console.log("Expansion took " + t.toFixed(1) + "ms");

		return this.chain;
	}

	this.evaluate = function(initialState) 
	{
		return this.chain.evaluate(initialState);
	}

	this.iterations = iterations;
	this.instructionMap = {};
	this.ruleMap = {};
	this.chain = new LInstructionChain();
	this.random = random;

	// Register common instructions
	this.registerInstruction(new PushInstruction());
	this.registerInstruction(new PullInstruction());

	for(var i = 0; i < instructions.length; i++)
		this.registerInstruction(instructions[i]);

	for(var r = 0; r < rules.length; r++)
		this.parseRule(rules[r].predecessor, rules[r].successor, rules[r].probability);

	this.updateAxiom(axiom);
}

export {LSystem, LContext, LRule, LInstruction, DummyInstruction}