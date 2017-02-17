
# Suzville
## A proceedural city generated by a shape grammar
For this project, I designed a shape grammar that creates urban buildings, and designed a city layout to place the buildings generated by my shape grammar. The overall result is a proceedurally generated city!
### Shape Grammar Design
* **Shape Node**: This is the basic building block for my grammar. A shape node knows its shape, its max height, its position/rotation/scale, and its iteration number.
* **Grammar rules**
  * Skyscrapers
    * Skyscrapers grow non-deterministically, but with a greater probability than apartments.
    * Skyscrapers shrink non-deterministically, to mimic 
  * Apartments
    * Apartments also grow non-deterministically, but for equivalent max heights, an apartment's and a skyscraper's height will be controlled by the max height multiplied by a size ratio determined by the city design (i.e. apartment: 1.5, skyscraper: 4), so that they grow to approprate heights. 
  * Parks 
    * Parks generate trees. 
    * Both the number and placement of trees within a park are non-deterministic.

### City Layout Design
* **City Blocks**
  * Blocks are placed according to city size, road size, and block size (set and easily changed by a city instance)
  * Block size is flexible: building placement adapts to the block size by scaling each building accordingly, so that there are no buildings unreachable in the middle of a block, and so that the block is filled length-wise like in actual cities.
  * Building choice: blocks are filled according to a shape ratio calculated by the block generator. For example, higher density blocks will have a higher ratio of skyscrapers to apartments.
  * Park blocks: in the real cities I have seen, parks usually fill up an entire block. Going off that, I decide block-wise whether there will be a park, and then fill the block with park nodes. 
* **City density**
  * In my layout design, I have equated city density with building height and building choice.
  * Buildings toward the center are more likely to be taller and fatter, and more likely to be skyscrapers
  * While high-level density is determined by a buildings location within the city (center or marginal), local density is calculated by a multi-octave noise function.
 
### Interactivity
* Shadows: the user can turn shadows on and off
* Iteration number: the user can see how the buildings are placed and then subsequently grow
* Rerendering: a rerender button has been included for easy regeneration
* More to come!


