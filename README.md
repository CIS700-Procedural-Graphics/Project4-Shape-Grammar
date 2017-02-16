
# Project 4: Shape Grammar

I wanted to go for a city in the nighttime, so I used outlines that sort of represent how a city is lit at night.
I tackled this project by first creating my rules against cubes. I then loaded two building OBJs and had to figure out their scale against a unit cube and adjust them so they still worked with the rules I created.

## Grammar Design
I made six rules:
Stack: C-> AA, creates two stacks of buildings that further subdivide in the top and bottom
Base, Bridge, or Normal Building: D->AEEE, D->C, D-> AEA, E is a terminal shape, that either represents the bridges or the base of a building. D nondeterministicly determines which result to produce.
Subdivide: A->AB, B->A This is the recursive subdividing of the left and half of the shape. It randomly determines which of two building meshes to use as its geometry.

My rules use the location to determine the placement of the subdivided components. The location is also passed to a noise function, which determines the height that is calculated for the rules.

## Building Results
![](https://raw.githubusercontent.com/emily-vo/Project4-Shape-Grammar/master/buildingtype1.png)
![](https://raw.githubusercontent.com/emily-vo/Project4-Shape-Grammar/master/buildingtype2.png)
![](https://raw.githubusercontent.com/emily-vo/Project4-Shape-Grammar/master/buildingtype3.png)

## City Planning
I used a noise function to simulate population density. I then tested at each vertex of a plane if the 3D noise value is greater than some threshold. If the noise is high enough, the building is created. You can also see in the skyline that the noise also dictates the height of the buildings generated.
THe buildings are colored some shade of blue based on the length of the grammar of the buildings.


## Skyline
![](https://raw.githubusercontent.com/emily-vo/Project4-Shape-Grammar/master/Skyline.png)

## Layout
![](https://raw.githubusercontent.com/emily-vo/Project4-Shape-Grammar/master/noisygrid.png)