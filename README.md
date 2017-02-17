# Procedural City
<img src="top-view.jpg" width="500">

## Objective
Use L-Systems to create a procedurally generated city.

## Inspiration
My inspiration for this project was Asterix's village, which is a vision I kept for most part of my project until I realizzed technical incapabilities like slow obj loading that made me make a more simplistic version of the village that meets the requirements.
<img src="asterix.jpg" width="500">

## Process
I started by designing a grammar for my houses. I added variations like levels, color of the roof, chimney and subdivision.
This is what different instances of the same iteration look like -
<img src="house1.jpg" width="500">
<img src="house2.jpg" width="500">
<img src="house3.jpg" width="500">
<img src="house4.jpg" width="500">

This is what different iterations look like -
<img src="iteration1.jpg" width="500">
<img src="iteration2.jpg" width="500">
<img src="iteration2.jpg" width="500">
<img src="iteration4.jpg" width="500">

Once I was done with this, I thought about how I want to lay out my city. After several trials, I decided to use a pcurve to define my city shape and surround it with forests. I wanted this to change everytime too, so I now I change the bias of the curves everytime.
<img src="forest1.jpg" width="500">
<img src="forest2.jpg" width="500">

Then, I wrote a function that takes in the radius and population to make a "cluster" of houses.
This is how the cluster of houses looks like for different populations.
<img src="pop1.jpg" width="500">
<img src="pop2.jpg" width="500">
<img src="pop3.jpg" width="500">
<img src="pop4.jpg" width="500">

This is how the cluster of houses looks like for different radii.
<img src="rad1.jpg" width="500">
<img src="rad2.jpg" width="500">
<img src="rad3.jpg" width="500">
<img src="rad4.jpg" width="500">

Finally, I integrated my cluster function into a nested for loop to place clusters in some parts of the land. This is also randomized, but stays within the city bounds.

Here are some instances of the city generation.
<img src="city1.jpg" width="500">
<img src="city2.jpg" width="500">
<img src="city3.jpg" width="500">

And here are some city skyline photos.
<img src="skyline1.jpg" width="500">
<img src="skyline2.jpg" width="500">
