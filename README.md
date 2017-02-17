
# Project 4: Shape Grammar

[MINIS-TIRITH](https://mccannd.github.io/Project4-Shape-Grammar/) 

Mini-Minas Tirith!

Controls:
-Iterate to advance the shape grammar stage
-Clear to completely reset the city.
-Volume to adjust the music

Grammar rules:
-Each floor / tier will distribute houses radially according to a 'population map' which coincidentally modeled by perlin noise
-Walls can spawn towers and emplacements
-Emplacements can spawn more houses
-Houses can subdivide into more houses or halt with a roof
-The city will boost by one tier each iteration

Other notes:
- Light is using shadow-mapping a directional light, and a hemisphere light. No custom shaders until I can figure out how to access the map
- Surprisingly performant. Merging all of the meshes into one call is very helpful
- The mountain terrain is procedurally generated as well
- Once the city reaches its full height, a particular movie scene plays...