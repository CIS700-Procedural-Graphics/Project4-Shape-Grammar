# [Project 4: Shape Grammar](https://github.com/CIS700-Procedural-Graphics/Project4-Shape-Grammar)


Created a procedural city using Shape grammars. Road map of city is first generated using a uniform radial approach creating circular main roads. Minor roads are also added to connect main roads.

The size and color of the buildings are dependent on the distance from the center of city. Buildings get smaller as you get closer to the center and the color palette used for the roofs of the buildings changes between every main road.

Grammar Rules for Building (ordered by priority):

1. Scale Rule - Scale shape along X, Y or Z axis
2. Rotate Rule - Rotate shape along X, Y or Z axis 
3. Translate Rule - Translate shape along X, Y or Z axis
4. Roof Rule - Add roof to shape
5. Subdivide Rule - Subdivides shape along X, Y or Z axis
6. Windows Rule - Add window to shape

