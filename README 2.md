
The objective of this assignment is to create an L System parser and generate interesting looking plants. Start by forking and then cloning this repository: [https://github.com/CIS700-Procedural-Graphics/Project3-LSystems](https://github.com/CIS700-Procedural-Graphics/Project3-LSystems)

# Description

**Linked List:**

I began by implementing a basic doubly-linked list in `lsystem.js` using the new ES6 class methodology.  I also added a file `tests.js` (and added an npm command `npm run tests`) where I tested out the linked list functionality.

**LSystem Implementation:**

Then, I added additional methods to my linked list implementation to transform it into more of an "LSystem" use case.  For example, I wrote the method `replaceNode()` that replaces a character in the linked list with its replacement rule, and the method `doIterations()`, which runs multiple iterations of the LSystem replacement process.  My LSystem can also handle multiple rules with a given probability distribution.

**Turtle:**

After finishing the linked list and LSystem, I started on the turtle implementation.  I added a number of member variables to my turtle (including `rotY`, `rotZ`, `flowerColor`, etc...) to allow for the turtle's rendering to be customized by the user.  I added four additional grammar rules, listed below:

- `<`: Rotate in the Y direction X degrees
- `>`: Rotate in the Y direction -X degrees
- `O`: Draw a flower
- `L`: Draw a leaf

I also added THREE.JS geometries for leaves and flowers (which are essentially just basic shapes).

**GUI:**

Almost every aspect of the turtle and the LSystem can be customized in the dat.gui sidebar. The LSystem iterations, initial axiom, and rules (probabilities and replacements) can all be tweaked.  Additionally, the turtle's rotations (in both Y and Z), cylinder dimensions, and all colors can be customized.

**Design technique:**

To be honest, I essentially just added and tweaked rules here and there until I was able to generate a plant I thought looked cool.  I experimented with different probabilities, and tried to position leaves and flowers in reasonable looking positions.

**Screenshots:**

![Screenshot A](https://raw.githubusercontent.com/zelliott/Project3-LSystems/master/images/plant_a.png)

![Screenshot B](https://raw.githubusercontent.com/zelliott/Project3-LSystems/master/images/plant_b.png)

![Screenshot C](https://raw.githubusercontent.com/zelliott/Project3-LSystems/master/images/plant_c.png)


# L-System Parser

lsystem.js contains classes for L-system, Rule, and LinkedList. Here’s our suggested structure:

**The Symbol Nodes/Linked List:**

Rather than representing our symbols as a string like in many L-system implementations, we prefer to use a linked list. This allows us to store additional information about each symbol at time of parsing (e.g. what iteration was this symbol added in?) Since we’re adding and replacing symbols at each iteration, we also save on the overhead of creating and destroying strings, since linked lists of course make it easy to add and remove nodes. You should write a Linked List class with Nodes that contain at least the following information:

- The next node in the linked list
- The previous node in the linked list
- The grammar symbol at theis point in the overal string

We also recommend that you write the following functions to interact with your linked list:

- A function to symmetrically link two nodes together (e.g. Node A’s next is Node B, and Node B’s prev is Node A)
- A function to expand one of the symbol nodes of the linked list by replacing it with several new nodes. This function should look at the list of rules associated with the symbol in the linked list’s grammar dictionary, then generate a uniform random number between 0 and 1 in order to determine which of the Rules should be used to expand the symbol node. You will refer to a Rule’s probability and compare it to your random number in order to determine which Rule should be chosen.

**Rules:**

These are containers for the preconditions, postconditions and probability of a single replacement operation. They should operate on a symbol node in your linked list.

**L-system:**

This is the parser, which will loop through your linked list of symbol nodes and apply rules at each iteration.

Implement the following functions in L-System so that you can apply grammar rules to your axiom given some number of iterations. More details and implementation suggestions about  functions can be found in the TODO comments

- `stringToLinkedList(input_string)`
- `linkedListToString(linkedList)`
- `replaceNode(linkedList, node, replacementString)`
- `doIterations(num)`

## Turtle

`turtle.js` has a function called renderSymbol that takes in a single node of a linked list and performs an operation to change the turtle’s state based on the symbol contained in the node. Usually, the turtle’s change in state will result in some sort of rendering output, such as drawing a cylinder when the turtle moves forward. We have provided you with a few example functions to illustrate how to write your own functions to be called by renderSymbol; these functions are rotateTurtle, moveTurtle, moveForward, and makeCylinder. If you inspect the constructor of the Turtle class, you can see how to associate an operation with a grammar symbol.

- Modify turtle.js to support operations associated with the symbols `[` and `]`
    - When you parse `[` you need to store the current turtle state somewhere
    - When you parse `]` you need to set your turtle’s state to the most recently stored state. Think of this a pushing and popping turtle states on and off a stack. For example, given `F[+F][-F]`, the turtle should draw a Y shape. Note that your program must be capable of storing many turtle states at once in a stack.

- In addition to operations for `[` and `]`, you must invent operations for any three symbols of your choosing.


## Interactivity

Using dat.GUI and the examples provided in the reference code, make some aspect of your demo an interactive variable. For example, you could modify:

1. the axiom
2. Your input grammer rules and their probability
3. the angle of rotation of the turtle
4. the size or color or material of the cylinder the turtle draws, etc!

## L-System Plants

Design a grammar for a new procedural plant! As the preceding parts of this assignment are basic computer science tasks, this is where you should spend the bulk of your time on this assignment. Come up with new grammar rules and include screenshots of your plants in your README. For inspiration, take a look at Example 7: Fractal Plant in Wikipedia: https://en.wikipedia.org/wiki/L-system Your procedural plant must have the following features

1. Grow in 3D. Take advantage of three.js!
2. Have flowers or leaves that are added as a part of the grammar
3. Variation. Different instances of your plant should look distinctly different!
4. A twist. Broccoli trees are cool and all, but we hope to see sometime a little more surprising in your grammars

# Publishing Your code

Running `npm run deploy` will automatically build your project and push it to gh-pages where it will be visible at `username.github.io/repo-name`. NOTE: You MUST commit AND push all changes to your MASTER branch before doing this or you may lose your work. The `git` command must also be available in your terminal or command prompt. If you're using Windows, it's a good idea to use Git Bash.