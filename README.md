
# Project 4: Shape Grammar

For this assignment you'll be building directly off of Project 3. To make things easier to keep track of, please fork and clone this repository [https://github.com/CIS700-Procedural-Graphics/Project4-Shape-Grammar](https://github.com/CIS700-Procedural-Graphics/Project4-Shape-Grammar) and copy your Project 3 code to start.

**Goal:** to model an urban environment using a shape grammar.


## Implementation Details

I have divided implementation into the main.js file and the shape.js file.

shape.js contains most of the functions that implement the various rules in the Shape class. These are signified by a single digit identifier, and they create shape objects that identify which geometry to use to draw the rule with.

main.js contains the logic to expand the grammar list, which is stored in a global all shapes list variable. There's one function to expand the list by calling their respective rule functions in the Shape class. There's another function to iterate through this list (once it's been completely expanded) and draw all their geometry.

The rules I have implemented are:

1. subdividing along Y axis
2. creating a tower of cylinders
3. creating cylinder towers along a bezier curve
4. creating an archway of hearts along a bezier curve
5. creating a spiraling tower

Since formation of the buildings are randomly chosen, refresh the page to get different configurations!

Note: I used this example for the implementation of the water shader
https://threejs.org/examples/?q=shad#webgl_shaders_ocean


## Images


![alt text](https://github.com/CIS-461-2017/path-tracer-episode-ii-attack-of-the-rays-MegSesh/blob/master/renders/rendered_images_uniform_recur1_ONball.png "Image 1")


![alt text](https://github.com/CIS-461-2017/path-tracer-episode-ii-attack-of-the-rays-MegSesh/blob/master/renders/rendered_images_uniform_recur1_ONball.png "Image 1")


![alt text](https://github.com/CIS-461-2017/path-tracer-episode-ii-attack-of-the-rays-MegSesh/blob/master/renders/rendered_images_uniform_recur1_ONball.png "Image 1")



![alt text](https://github.com/CIS-461-2017/path-tracer-episode-ii-attack-of-the-rays-MegSesh/blob/master/renders/rendered_images_uniform_recur1_ONball.png "Image 1")
