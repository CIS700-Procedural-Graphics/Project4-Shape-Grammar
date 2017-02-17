
# Project 4: Shape Grammar

**General approach:**

In this short summary, I'll briefly go over (1) how I designed my city layout, (2) how I created the shape grammar, and (3) any further implementation details along the way.

**Code structure:**

My codebase is divided up into a number of different sections and files:

 - `main.js`: This is the main runner, which sets up the framework and initializes the city and shape grammar.  This file also creates shadows, lights, and sets up the camera.
 - `city.js`: This file holds the `City` class, which in turn handles all aspects of rendering a city.  This includes: rendering the base plane, rendering the rings and line divisions (streets), and rendering the cells and the buildings within them.
 - `shapeGrammar.js`: This file is responsible for maintaining the shape grammar and advancing it any number of iterations.
 - `shape_types/[shape_type].js`: Inside this folder are the various geometries that can be created in my shape grammar.  These include chimneys, garages, houses, etc...
 - There are other files, but the ones above are the main ones.

**City layout:**

My city is created and rendered in the following manner.  First, I render the base plane of the city.  Second, I render `n` concentric rings on the plane, of various radii.  Third, I draw lines at various points between the rings to create divisions connecting rings with one another.  Fourth, I render thicker geometries (streets) on these rings and divisions.  Fifth, I divide up my plane into a number of cells (like a grid), and render a building on any cell that is far enough away from a street.  At this point... the city has been rendered!  This class has been designed in such a way that various properties of the city can be manipulated as member variables of the class.

**Shape grammar:**

Instead of using the given LSystem class, I created a new `shapeGrammar.js` file with a `ShapeGrammar` class because I wanted a more flexible implementation.  This class begins by instantiating a starting axiom.  Then the method `doIterations()` is run, which advances the intial axiom according to the shapes' successor rules.  Finally, the class renders the final result of the shape grammar to the scene.  There is also the option to apply per-shape-grammar-instance state data to each shape grammar, via the method `applyState(shapes)`.  For example, location and density data can be passed into each instance of the shape grammar, thus allowing buildings in different locations to have completely different final results.

**Rules:**

 - `Building`: Depending on the location of the building, its successors are either `Base`, `Mid`, and `Top` shapes, or `House` and `Garage` shapes.  The former are for skyscraper-looking buildings, and the latter are for residential-looking buildings.  The height of a `Building` is dependent on its location.
 - `Base`: Successor is a `DoubleDoor`.
 - `Mid`: Successors are a number of `Floor` shapes, depending on the height of the building.
 - `Top`: Successor is a `Silo` with a random height.
 - `Floor`: Successors are a number of `Window` shapes, with random colors.
 - `Window`: Terminal
 - `DoubleDoor`: Terminal
 - `Silo`: Successor is an `Antenna`.
 - `Antenna`: Terminal
 - `House`: Successors are a `Door` and a `Roof`. The door is placed to the back of the house.
 - `Door`: Terminal
 - `Roof`: Successor is a `Chimney` in a random location.
 - `Chimney`: Terminal
 - `Garage`: Successor is a `GarageDoor` in a random location
 - `GarageDoor`: Terminal

---

For this assignment you'll be building directly off of Project 3. To make things easier to keep track of, please fork and clone this repository [https://github.com/CIS700-Procedural-Graphics/Project4-Shape-Grammar](https://github.com/CIS700-Procedural-Graphics/Project4-Shape-Grammar) and copy your Project 3 code to start.

**Goal:** to model an urban environment using a shape grammar.

**Note:** We’re well aware that a nice-looking procedural city is a lot of work for a single week. Focus on designing a nice building grammar. The city layout strategies outlined in class (the extended l-systems) are complex and not expected. We will be satisfied with something reasonably simple, just not a uniform grid!

## Symbol Node (5 points)
Modify your symbol node class to include attributes necessary for rendering, such as
- Associated geometry instance
- Position
- Scale
- Anything else you may need

## Grammar design (55 points)
- Design at least five shape grammar rules for producing procedural buildings. Your buildings should vary in geometry and decorative features (beyond just differently-scaled cubes!). At least some of your rules should create child geometry that is in some way dependent on its parent’s state. (20 points)
    - Eg. A building may be subdivided along the x, y, or z axis into two smaller buildings
    - Some of your rules must be designed to use some property about its location. (10 points)
    - Your grammar should have some element of variation so your buildings are non-deterministic.  Eg. your buildings sometimes subdivide along the x axis, and sometimes the y. (10 points)
- Write a renderer that will interpret the results of your shape grammar parser and adds the appropriate geometry to your scene for each symbol in your set. (10 points)

## Create a city (30 points)
- Add a ground plane or some other base terrain to your scene (0 points, come on now)
- Using any strategy you’d like, procedurally generate features that demarcate your city into different areas in an interesting and plausible way (Just a uniform grid is neither interesting nor plausible). (20 points)
    - Suggestions: roads, rivers, lakes, parks, high-population density
    - Note, these features don’t have to be directly visible, like high-population density, but they should somehow be visible in the appearance or arrangement of your buildings. Eg. High population density is more likely to generate taller buildings
- Generate buildings throughout your city, using information about your city’s features. Color your buildings with a method that uses some aspect of its state. Eg. Color buildings by height, by population density, by number of rules used to generate it. (5 points)
- Document your grammar rules and general approach in the readme. (5 points)
- ???
- Profit.

## Make it interesting (10)
Experiment! Make your city a work of art.


## Warnings:
You can very easily blow up three.js with this assignment. With a very simple grammar, our medium quality machine was able to handle 100 buildings with 6 generations each, but be careful if you’re doing this all CPU-side.

## Suggestions for the overachievers:
Go for a very high level of decorative detail!
Place buildings with a strategy such that buildings have doors and windows that are always accessible.
Generate buildings with coherent interiors
If dividing your city into lots, generate odd-shaped lots and create building meshes that match their shape ie. rather than working with cubes, extrude upwards from the building footprints you find to generate a starting mesh to subdivide rather than starting with platonic geometry.
