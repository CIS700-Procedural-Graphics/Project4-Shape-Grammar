
# Project 4: Shape Grammar

This project took many different directions before arriving at its final product. So there are a lot of implementation details that never made it into the completed town but I will outline here since they could be used for other styles of cities and since they took time and effort. 

Overall details:
Shape contains the symbol of the geometry used for iterating through the shape grammars, a terminal flag, and vectors for rotation, position, and scale stored in a Draw object. 

Block contains the four points that define the four corners of a neighborhood block. These points are generated with subdivides that allow random street intersections to occur without creating blocks that are too small for a house to fit on. In order to draw houses on each block, new points are defined inside of the original block to insure no intersecting houses. Each house was also oriented to always face the street. At the last minute I decided to make a rural scene rather than a city scene so these blocks are not used in the final implementation. 

Perlin contains the perlin noise code from Project 1 redefined in Javascript

The main javascript file contains most of the code to draw the object. Since my computer is a potato, all the geometries created are stored in one mesh. As new objects are created, they are stored in arrays of the different types of geometries (made in Maya). when the geometries are loaded, a build function is called that merges all the objects in the array to the overall scene mesh. The mesh is added to the scene in onUpdate only after all objects have been loaded. The function layout block is not used, but is instead replaced with countryLayout.  

The town in constructed with a flat plane representing the water and a perlin distorted plane to represent rolling hills. Since humans require water, the buildings are constructed near the waterline while the trees and nature are towards higher ground. The building orientation and positions are random to simulate an old (pre car) town. Don't worry, I also made a more city like town if you uncomment the code and reuse the blocks as described above.

The shape grammar consists of creating floors and nearby "garages" (except not garages because this is a pre-car town, remember?). There are also huts, and fancier temples near the water. 

Required details:
Symbol node = Shape class
grammar rules include:
	subdivideScaleX: cut in half and scale one half
	subdivideScaleZ
	subdivideX: cut in the correct number of adjacent pieces
	subdivideZ
	add: create a duplicate on this geometry on top of this one 
	addDoor: this function uses the property of location by only placing "fancy" doors with columns like a temple near the water (low y value)
	addRoof
most grammar rules are probabilitic and will choose up to 3 different possibilities
demarcate city with hills and rivers (also blocks originally). essentially based on a perlin noise map
Buildings are based on city features from the location of water to the height of the hills to nearby buildings

Extra details:
shadow casting
perlin noise
added trees, cars, fancy geometry