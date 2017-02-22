
# Project 4: Shape Grammar

**Goal:** to model an urban environment using a shape grammar. 

**Note:** We’re well aware that a nice-looking procedural city is a lot of work for a single week. Focus on designing a nice building grammar. The city layout strategies outlined in class (the extended l-systems) are complex and not expected. We will be satisfied with something reasonably simple, just not a uniform grid!

## Symbol Node
Instead of modifying my symbol node class, I actually used that class from the previous homework just for rule creation and assembly. From there i built off a TreeNode class which included the heirarchy and building up locations of each of my objects. This allowed me to build up in scale and easily connect objects to one another by particular dimension choices based on current height value of the object being added and maintain parental attributes for the children as well.

## Grammar design
Designing five shape grammar rules: 
[: adding new child to current TreeNode and now building from that child node - if no attributes are ever assigned to this child, then it will keep its parents attributes in terms of color and geometric shape.
]: finished building current child so going back up a level in the tree, so now on a parent node or if there's no parent node, stay on the current node.
F: switch from current node to the parent's parent [if it exists] - allows for jumping around tree levels
A: setting color of current node to random color. during rendering if color attribute is not assigned - gets coloring based on height
B: current object being changed to random geometry based on given possibilities [cube, cylinder, cone]
C: set current obj material to phong with random coloring and highlight with opp/partialcomplementary coloring
D: used to build the base environment - bottom terrain. This is part of the Tree itself (the first node), because it allowed me to easily maintain location and xyDimensions of how I wanted the buildings to be created in the environment.

Wrote a renderer for the TreeNode class that follows the given rules and based on input given properly places geometry in space in the scene.

## Create a city
Added a ground plane and skybox. Built from the ground plane using my TreeNode system such that each level of children was built directly on top of their parent and depending on the number of children a particular arrangement would be created for them to be positioned on top of the parent. Generating buildings throughout my city using information about the city's features by using their parent's information about the city. Basically, color and location attributes carry down from parent to child if not already declared in the child. 


## Photos of renders

When building: started first by making sure I understand how the placement of the blocks should be. The below render wa not built in the TreeNode design but in fact just manual placement of blocks based on positions of other blocks to make sure I understood how to do it properly.
//img1


