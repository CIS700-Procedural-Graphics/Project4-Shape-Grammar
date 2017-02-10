const THREE = require('three')

export default class Parser
{
    constructor(scene, grammar)
    {
        this.scene = scene;

        // TODO: Start by adding rules for '[' and ']' then more!
        // Make sure to implement the functions for the new rules inside Turtle
        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                
            };
        } else {
            this.renderGrammar = grammar;
        }
    }


    // Call the function to which the input symbol is bound.
    // Look in the Turtle's constructor for examples of how to bind
    // functions to grammar symbols.
    renderSymbol(symbolNode)
    {
        // var func = this.renderGrammar[symbolNode.character];
        var func = this.renderGrammar[symbolNode.grammar];
        if (func) {
            func();
        }
    };

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(linkedList)
    {
        var currentNode;
        //  for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next)
        for(currentNode = linkedList.first; currentNode != null; currentNode = currentNode.next)
        {
            this.renderSymbol(currentNode);
        }
    }
}
