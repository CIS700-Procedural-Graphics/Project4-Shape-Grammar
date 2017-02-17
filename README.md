# [HW4: Shape Grammar](https://github.com/CIS700-Procedural-Graphics/Project4-Shape Grammar)

## Project Description

Procedurally modeled a city layout and the buildings inside it using shape grammar.

### Overall description

The project goes about creating a city, which is created anew every time a item of the gui is updated.
Every building is modeled procedurally based on shape grammar rules and the city layout is similarly randomized.
Various GUI controls were added to give the project more life.

GUI controls let you:

1. Change the position that the city will spawn around

2. Change the iterations applied to buildings for creating variation

3. Change the density of the city

4. Change the field of view of the camera

### Things Done:

#### main.js description

1. Create multiple layers of circles of increasing size centered at the same point.

2. Have major roads along alternate segments joining these circles. Permanent roads.

3. Have minor roads be created randomly that connect various arcs of circles.

4. Place buildings inside the circles in between roads.

#### shape.js description

##Shape Grammar rules

1. Subdivide buildings randomly about x or z axis

2. scale every building randomly

3. Place windows on buildings depending upon the length and width of the building. And The windows are all above the ground floor.

4. Add a door randomly on one of the faces of the building and randomly jitter its position along that wall.

5. Add roof tops to buildings, depending on the shape and size of the buildings.

6. Give every building a random color.

7. All features added after the main cube building structure are shaded based on position.
