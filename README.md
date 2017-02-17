
# Project 4: Shape Grammar

## Generating Buildings
All buildings start off as a single box geometry of sizes (small, medium, large)
with some minor variations. The height of the buildings are determined by a population map
that can be imported from an image file.

The first iteration of the shape grammar determines whether the building will have
side panels.

A=>C,  A=>S

In the next iteration, the side panels will terminate. The other symbols will randomly
select between uniform vertical division of the block, or the same division with
differentiation of the top and bottom levels.

C=>U, C=>T/U/B, S=>X

The next iteration adds details to the levels. The top levels have a ticker or a
scaled block. The bottom levels are scaled larger. The middle levels select between
alternating level sizes, billboards or signs.

U=>{billboards, signs, alternate scaling}

## Placing Buildings
The entire city is represented by a grid system like Sim City. Each time
a building is placed, the grid locations are marked as occupied to prevent overlapping buildings.

Buildings are placed probabilistically based on the population map using
the pointalism algorithm we talked about in class. Random points are selected from
the grid and will be kept or discarded using the population map value as a threshold.

I also implemented a HTML5 canvas based lsystem to generate the roads. This is
still a work in progress as it does not take into account any additional parameters.
My intention is to translate the canvas values into the city grid. This way, buildings
will not over lap with roads.

## Fun Features
The ticker textures on the top of buildings are generated procedurally. Normally,
we load an image into Three.js to use as a texture, but its actually possible to use
an HTML5 canvas instead[2]! Just draw on a canvas element and then pass it directly
into THREE.texture(canvas).

# Resources
[1] Borrowed some of the ticker messages from Sim City: http://simcity.wikia.com/wiki/List_of_news_ticker_messages
[2] Procedural Textures using canvas: http://learningthreejs.com/blog/2013/08/02/how-to-do-a-procedural-city-in-100lines/
[3] Subversion city generator for inspiration: https://www.youtube.com/watch?v=FR9xI0GgrBY
[4] Also Mirror's Edge for inspiration: http://imgur.com/LsvEPJW
