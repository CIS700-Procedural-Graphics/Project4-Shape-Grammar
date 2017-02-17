# Procedural City
<img src="top-view.png" width="500">

## Objective
Use L-Systems to create a procedurally generated city.

## Inspiration
My inspiration for this project was Asterix's village, which is a vision I kept for most part of my project until I realizzed technical incapabilities like slow obj loading that made me make a more simplistic version of the village that meets the requirements.
<br>
<img src="asterix.jpg" width="500">

## Process
I started by designing a grammar for my houses. I added variations like levels, color of the roof, chimney and subdivision. <br>
This is what different instances of the same iteration look like -
<br>
<img src="house1.jpg" width="500">
<img src="house2.jpg" width="500">
<img src="house3.jpg" width="500">
<img src="house4.jpg" width="500">
<br>
This is what different iterations look like - <br>
<img src="iteration1.jpg" width="500">
<img src="iteration2.jpg" width="500">
<img src="iteration2.jpg" width="500">
<img src="iteration4.jpg" width="500">
<br>
Once I was done with this, I thought about how I want to lay out my city. After several trials, I decided to use a pcurve to define my city shape and surround it with forests. I wanted this to change everytime too, so I now I change the bias of the curves everytime.<br>
<img src="forest1.jpg" width="500">
<img src="forest2.jpg" width="500">
<br>
Then, I wrote a function that takes in the radius and population to make a "cluster" of houses.<br>
This is how the cluster of houses looks like for different populations.<br>
<img src="pop1.jpg" width="500">
<img src="pop2.jpg" width="500">
<img src="pop3.jpg" width="500">
<img src="pop4.jpg" width="500">
<br>
This is how the cluster of houses looks like for different radii.<br>
<img src="rad1.jpg" width="500">
<img src="rad2.jpg" width="500">
<img src="rad3.jpg" width="500">
<img src="rad4.jpg" width="500">
<br>
Finally, I integrated my cluster function into a nested for loop to place clusters in some parts of the land. This is also randomized, but stays within the city bounds.
<br>
Here are some instances of the city generation.<br>
<img src="city1.jpg" width="500">
<img src="city2.jpg" width="500">
<img src="city3.jpg" width="500">
<br>
And here are some city skyline photos.<br>
<img src="skyline1.png" width="500">
<img src="skyline2.png" width="500">
