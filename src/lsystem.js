const THREE = require('three')

var shapeSet;

// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
function Rule(prob, func) {
	this.probability = prob; // The probability that this Rule will be used when replacing a shape in the grammar
	this.func = func;
}


 function Shape(symbol, pos, rot, scale, material, x, z, door) {
    // if we want to access these later, we need to bind them to 'this'
    this.symbol = symbol;
    this.pos = pos; //position of center of geometry
    this.rot = rot;
    this.scale = scale; //scale on geometry
    this.material = material;
    this.xaxis = x;
    this.zaxis = z; // x and z used to move position based on current rotation
    this.hasDoor = door;
}

function config1(initShape, s) //subdivide in z, make front half half the width and shift to one side
{	
	if(shapeSet.size != 0)
	{
		var scale1 = new THREE.Vector3(initShape.scale.x, initShape.scale.y, initShape.scale.z);
		scale1.x *= 0.5;
		var pos1 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos1.x = pos1.x - 0.75*initShape.xaxis.x;
		pos1.y = pos1.y - 0.75*initShape.xaxis.y;
		pos1.z = pos1.z - 0.75*initShape.xaxis.z;
		shapeSet.add(new Shape('D', pos1, initShape.rot, scale1, initShape.material, initShape.xaxis, initShape.zaxis , false));

		var scale2 = new THREE.Vector3(initShape.scale.x, initShape.scale.y, initShape.scale.z);
		scale2.x *= 0.5;
		scale2.z *= 0.5;
		var pos2 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos2.x = pos2.x + 0.75*initShape.xaxis.x;
		pos2.y = pos2.y + 0.75*initShape.xaxis.y;
		pos2.z = pos2.z + 0.75*initShape.xaxis.z;

		var rando = Math.random(); //decides if front piece goes on left or right of the house
		if(rando < 0.5)
		{
			pos2.x = pos2.x - 1.0*initShape.zaxis.x;
			pos2.y = pos2.y - 1.0*initShape.zaxis.y;
			pos2.z = pos2.z - 1.0*initShape.zaxis.z;
			shapeSet.add(new Shape('B', pos2, initShape.rot, scale2, initShape.material, initShape.xaxis, initShape.zaxis, false));
		}
		else
		{
			pos2.x = pos2.x + 1.0*initShape.zaxis.x;
			pos2.y = pos2.y + 1.0*initShape.zaxis.y;
			pos2.z = pos2.z + 1.0*initShape.zaxis.z;
			shapeSet.add(new Shape('E', pos2, initShape.rot, scale2, initShape.material, initShape.xaxis, initShape.zaxis), false);
		}

		shapeSet.delete(initShape);
	}	
}

function config2(initShape, s) //subdivide in z, make two new shapes rotated to face front in front half
{
	if(shapeSet.size != 0)
	{
		var scale1 = new THREE.Vector3(initShape.scale.x, initShape.scale.y, initShape.scale.z);
		scale1.x *= 0.5;
		var pos1 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos1.x = pos1.x - 0.75*initShape.xaxis.x;
		pos1.y = pos1.y - 0.75*initShape.xaxis.y;
		pos1.z = pos1.z - 0.75*initShape.xaxis.z;
		shapeSet.add(new Shape('D', pos1, initShape.rot, scale1, initShape.material, initShape.xaxis, initShape.zaxis, false));

		var scale2 = new THREE.Vector3(initShape.scale.x, initShape.scale.y, initShape.scale.z);
		scale2.x *= 0.4;
		scale2.z *= 0.5;
		var rot = new THREE.Vector3(initShape.rot.x, initShape.rot.y, initShape.rot.z);
		rot.y += 3.1415/2.0;
		var xax = new THREE.Vector3(initShape.xaxis.x, initShape.xaxis.y, initShape.xaxis.z);
		xax.applyAxisAngle(new THREE.Vector3(0, 1, 0), 3.1415/2.0);
		var zax = new THREE.Vector3(initShape.zaxis.x, initShape.zaxis.y, initShape.zaxis.z);
		zax.applyAxisAngle(new THREE.Vector3(0, 1, 0), 3.1415/2.0);

		var pos2 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos2.x = pos2.x + 0.5*initShape.xaxis.x;
		pos2.y = pos2.y + 0.5*initShape.xaxis.y;
		pos2.z = pos2.z + 0.5*initShape.xaxis.z;
		pos2.x = pos2.x - 1.25*initShape.zaxis.x;
		pos2.y = pos2.y - 1.25*initShape.zaxis.y;
		pos2.z = pos2.z - 1.25*initShape.zaxis.z;
		var shape2 = new Shape('C', pos2, rot, scale2, initShape.material, xax, zax, false);
		shapeSet.add(shape2);

		var pos3 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos3.x = pos3.x + 0.5*initShape.xaxis.x;
		pos3.y = pos3.y + 0.5*initShape.xaxis.y;
		pos3.z = pos3.z + 0.5*initShape.xaxis.z;
		pos3.x = pos3.x + 1.25*initShape.zaxis.x;
		pos3.y = pos3.y + 1.25*initShape.zaxis.y;
		pos3.z = pos3.z + 1.25*initShape.zaxis.z;
		var shape3 = new Shape('C', pos3, rot, scale2, initShape.material, xax, zax, false);
		shapeSet.add(shape3);

		var rando = Math.random();
		if(rando < 0.5)
		{
			shape2.hasDoor = true;
		}
		else
		{
			shape3.hasDoor = true;
		}

		shapeSet.delete(initShape);
	}
}

function config3(initShape, s) //subdivide in z, make three new shapes rotated to face front in front half
{
	if(shapeSet.size != 0)
	{
		var scale1 = new THREE.Vector3(initShape.scale.x, initShape.scale.y, initShape.scale.z);
		scale1.x *= 0.5;
		var pos1 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos1.x = pos1.x - 0.75*initShape.xaxis.x;
		pos1.y = pos1.y - 0.75*initShape.xaxis.y;
		pos1.z = pos1.z - 0.75*initShape.xaxis.z;
		shapeSet.add(new Shape('D', pos1, initShape.rot, scale1, initShape.material, initShape.xaxis, initShape.zaxis));

		var scale2 = new THREE.Vector3(initShape.scale.x, initShape.scale.y, initShape.scale.z);
		scale2.x *= 0.3;
		scale2.z *= 0.5;
		var rot = new THREE.Vector3(initShape.rot.x, initShape.rot.y, initShape.rot.z);
		rot.y += 3.1415/2.0;
		var xax = new THREE.Vector3(initShape.xaxis.x, initShape.xaxis.y, initShape.xaxis.z);
		xax.applyAxisAngle(new THREE.Vector3(0, 1, 0), 3.1415/2.0);
		var zax = new THREE.Vector3(initShape.zaxis.x, initShape.zaxis.y, initShape.zaxis.z);
		zax.applyAxisAngle(new THREE.Vector3(0, 1, 0), 3.1415/2.0);

		var pos2 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos2.x = pos2.x + 0.5*initShape.xaxis.x;
		pos2.y = pos2.y + 0.5*initShape.xaxis.y;
		pos2.z = pos2.z + 0.5*initShape.xaxis.z;
		var shape2 = new Shape('C', pos2, rot, scale2, initShape.material, xax, zax, false);
		shapeSet.add(shape2);

		var pos3 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos3.x = pos3.x + 0.5*initShape.xaxis.x;
		pos3.y = pos3.y + 0.5*initShape.xaxis.y;
		pos3.z = pos3.z + 0.5*initShape.xaxis.z;
		pos3.x = pos3.x - 1.6*initShape.zaxis.x;
		pos3.y = pos3.y - 1.6*initShape.zaxis.y;
		pos3.z = pos3.z - 1.6*initShape.zaxis.z;
		var shape3 = new Shape('C', pos3, rot, scale2, initShape.material, xax, zax, false);
		shapeSet.add(shape3);

		var pos4 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos4.x = pos4.x + 0.5*initShape.xaxis.x;
		pos4.y = pos4.y + 0.5*initShape.xaxis.y;
		pos4.z = pos4.z + 0.5*initShape.xaxis.z;
		pos4.x = pos4.x + 1.6*initShape.zaxis.x;
		pos4.y = pos4.y + 1.6*initShape.zaxis.y;
		pos4.z = pos4.z + 1.6*initShape.zaxis.z;
		var shape4 = new Shape('C', pos4, rot, scale2, initShape.material, xax, zax, false);
		shapeSet.add(shape4);

		var rando = Math.random();
		if(rando < 0.333)
		{
			shape2.hasDoor = true;
		}
		else if (rando < 0.666)
		{
			shape3.hasDoor = true;
		}
		else
		{
			shape4.hasDoor = true;
		}

		shapeSet.delete(initShape);
	}
}

function modif1(initShape, s) //add half sized shape to left side of parent shape
{
	if(shapeSet.size != 0)
	{
		var scale1 = new THREE.Vector3(initShape.scale.x, initShape.scale.y, initShape.scale.z);
		scale1.x *= 0.5;
		scale1.y *= 0.75;
		scale1.z *= 0.5;
		var pos1 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos1.x = pos1.x + 1.75*initShape.zaxis.x;
		pos1.y = pos1.y + 1.75*initShape.zaxis.y;
		pos1.z = pos1.z + 1.75*initShape.zaxis.z;
		pos1.y -= 0.25;
		shapeSet.add(new Shape('T', pos1, initShape.rot, scale1, initShape.material, initShape.xaxis, initShape.zaxis, false));

		var scale = new THREE.Vector3(0.5, 1.0, 0.1);
		var pos2 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos2.x = pos2.x + 2.4*initShape.zaxis.x;
		pos2.y = pos2.y + 2.4*initShape.zaxis.y;
		pos2.z = pos2.z + 2.4*initShape.zaxis.z;
		pos2.y -= 0.5;
		pos2.x = pos2.x + .15*initShape.xaxis.x;
		pos2.y = pos2.y + .15*initShape.xaxis.y;
		pos2.z = pos2.z + .15*initShape.xaxis.z;
		shapeSet.add(new Shape('G', pos2, initShape.rot, scale, initShape.material, initShape.xaxis, initShape.zaxis, false));
	}
}

function modif2(initShape, s) //add half sized shape to right side of parent shape
{
	if(shapeSet.size != 0)
	{
		var scale1 = new THREE.Vector3(initShape.scale.x, initShape.scale.y, initShape.scale.z);
		scale1.x *= 0.5;
		scale1.y *= 0.75;
		scale1.z *= 0.5;
		var pos1 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos1.x = pos1.x - 1.75*initShape.zaxis.x;
		pos1.y = pos1.y - 1.75*initShape.zaxis.y;
		pos1.z = pos1.z - 1.75*initShape.zaxis.z;
		pos1.y -= 0.25;
		shapeSet.add(new Shape('T', pos1, initShape.rot, scale1, initShape.material, initShape.xaxis, initShape.zaxis));

		var scale = new THREE.Vector3(0.5, 1.0, 0.1);
		var pos2 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos2.x = pos2.x - 2.4*initShape.zaxis.x;
		pos2.y = pos2.y - 2.4*initShape.zaxis.y;
		pos2.z = pos2.z - 2.4*initShape.zaxis.z;
		pos2.x = pos2.x + .15*initShape.xaxis.x;
		pos2.y = pos2.y + .15*initShape.xaxis.y;
		pos2.z = pos2.z + .15*initShape.xaxis.z;
		pos2.y -= 0.5;
		shapeSet.add(new Shape('G', pos2, initShape.rot, scale, initShape.material, initShape.xaxis, initShape.zaxis, false));
	}
}

function modif3(initShape, s) //remove this shape returning empty set
{
	if(shapeSet.size != 0)
	{
		shapeSet.delete(initShape);

		if(initShape.hasDoor)
		{
			var scale = new THREE.Vector3(0.5, 1.0, 0.1);
			var pos1 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
			pos1.y -= 0.5;
			shapeSet.add(new Shape('G', pos1, initShape.rot, scale, initShape.material, initShape.xaxis, initShape.zaxis, false));
		}		
	}
}

function modif4(initShape, s) //do nothing to this shape, return it unchanged
{
	if(shapeSet != 0)
	{
		if(initShape.hasDoor)
		{
			var scale = new THREE.Vector3(0.5, 1.0, 0.1);
			var pos1 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
			pos1.x = pos1.x - 1.25*initShape.zaxis.x;
			pos1.y = pos1.y - 1.25*initShape.zaxis.y;
			pos1.z = pos1.z - 1.25*initShape.zaxis.z;
			pos1.y -= 0.5;
			shapeSet.add(new Shape('G', pos1, initShape.rot, scale, initShape.material, initShape.xaxis, initShape.zaxis, false));
		}
	}
}

function modif5(initShape, s) //scale height of this shape by 1.25
{
	if(shapeSet.size != 0)
	{
		var scale1 = new THREE.Vector3(initShape.scale.x, initShape.scale.y, initShape.scale.z);
		scale1.y *= 1.25;
		var pos1 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos1.y += 0.25;
		shapeSet.add(new Shape('T', pos1, initShape.rot, scale1, initShape.material, initShape.xaxis, initShape.zaxis));

		shapeSet.delete(initShape);

		if(initShape.hasDoor)
		{
			var scale = new THREE.Vector3(0.5, 1.0, 0.1);
			var pos2 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
			pos2.x = pos2.x - 1.25*initShape.zaxis.x;
			pos2.y = pos2.y - 1.25*initShape.zaxis.y;
			pos2.z = pos2.z - 1.25*initShape.zaxis.z;
			pos2.y -= 0.5;
			shapeSet.add(new Shape('G', pos2, initShape.rot, scale, initShape.material, initShape.xaxis, initShape.zaxis, false));
		}
	}
}

function modif6(initShape, s) //scale height of this shape by 1.5
{
	if(shapeSet.size != 0)
	{
		var scale1 = new THREE.Vector3(initShape.scale.x, initShape.scale.y, initShape.scale.z);
		scale1.y *= 1.5;
		var pos1 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos1.y += 0.5;
		shapeSet.add(new Shape('T', pos1, initShape.rot, scale1, initShape.material, initShape.xaxis, initShape.zaxis));

		shapeSet.delete(initShape);

		if(initShape.hasDoor)
		{
			var scale = new THREE.Vector3(0.5, 1.0, 0.1);
			var pos2 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
			pos2.x = pos2.x - 1.25*initShape.zaxis.x;
			pos2.y = pos2.y - 1.25*initShape.zaxis.y;
			pos2.z = pos2.z - 1.25*initShape.zaxis.z;
			pos2.y -= 0.5;
			shapeSet.add(new Shape('G', pos2, initShape.rot, scale, initShape.material, initShape.xaxis, initShape.zaxis, false));
		}
	}
}

function modif7(initShape, s) //scale height by 1.5, add a chimney on left side
{
	if(shapeSet.size != 0)
	{
		var scale1 = new THREE.Vector3(initShape.scale.x, initShape.scale.y, initShape.scale.z);
		scale1.y *= 1.5;
		var pos1 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos1.y += 0.5;
		shapeSet.add(new Shape('T', pos1, initShape.rot, scale1, initShape.material, initShape.xaxis, initShape.zaxis));

		shapeSet.delete(initShape);

		var scale = new THREE.Vector3(0.5, 5.0, 0.5);
		var pos2 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos2.y += 2.0;
		pos2.x = pos2.x - 1.5*initShape.zaxis.x;
		pos2.y = pos2.y - 1.5*initShape.zaxis.y;
		pos2.z = pos2.z - 1.5*initShape.zaxis.z;
		pos2.x = pos2.x - 0.5*initShape.xaxis.x;
		pos2.y = pos2.y - 0.5*initShape.xaxis.y;
		pos2.z = pos2.z - 0.5*initShape.xaxis.z;
		shapeSet.add(new Shape('F', pos2, initShape.rot, scale, initShape.material, initShape.xaxis, initShape.zaxis));
	}
}

function modif8(initShape, s) //scale height by 1.5, add a chimney on right side
{
	if(shapeSet.size != 0)
	{
		var scale1 = new THREE.Vector3(initShape.scale.x, initShape.scale.y, initShape.scale.z);
		scale1.y *= 1.5;
		var pos1 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos1.y += 0.5;
		shapeSet.add(new Shape('T', pos1, initShape.rot, scale1, initShape.material, initShape.xaxis, initShape.zaxis));

		shapeSet.delete(initShape);

		var scale = new THREE.Vector3(0.5, 5.0, 0.5);
		var pos2 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos2.y += 2.0;
		pos2.x = pos2.x + 1.5*initShape.zaxis.x;
		pos2.y = pos2.y + 1.5*initShape.zaxis.y;
		pos2.z = pos2.z + 1.5*initShape.zaxis.z;
		pos2.x = pos2.x - 0.5*initShape.xaxis.x;
		pos2.y = pos2.y - 0.5*initShape.xaxis.y;
		pos2.z = pos2.z - 0.5*initShape.xaxis.z;
		shapeSet.add(new Shape('F', pos2, initShape.rot, scale, initShape.material, initShape.xaxis, initShape.zaxis));
	}
}

function modif9(initShape, s) //don't scale height, add a chimney on left side
{
	if(shapeSet.size != 0)
	{
		var scale = new THREE.Vector3(0.5, 4.0, 0.5);
		var pos2 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos2.y += 1.0;
		pos2.x = pos2.x - 1.5*initShape.zaxis.x;
		pos2.y = pos2.y - 1.5*initShape.zaxis.y;
		pos2.z = pos2.z - 1.5*initShape.zaxis.z;
		pos2.x = pos2.x - 0.5*initShape.xaxis.x;
		pos2.y = pos2.y - 0.5*initShape.xaxis.y;
		pos2.z = pos2.z - 0.5*initShape.xaxis.z;
		shapeSet.add(new Shape('F', pos2, initShape.rot, scale, initShape.material, initShape.xaxis, initShape.zaxis));
	}
}

function modif10(initShape, s) //don't scale height, add a chimney on right side
{
	if(shapeSet.size != 0)
	{
		var scale = new THREE.Vector3(0.5, 4.0, 0.5);
		var pos2 = new THREE.Vector3(initShape.pos.x, initShape.pos.y, initShape.pos.z);
		pos2.y += 1.0;
		pos2.x = pos2.x + 1.5*initShape.zaxis.x;
		pos2.y = pos2.y + 1.5*initShape.zaxis.y;
		pos2.z = pos2.z + 1.5*initShape.zaxis.z;
		pos2.x = pos2.x - 0.5*initShape.xaxis.x;
		pos2.y = pos2.y - 0.5*initShape.xaxis.y;
		pos2.z = pos2.z - 0.5*initShape.xaxis.z;
		shapeSet.add(new Shape('F', pos2, initShape.rot, scale, initShape.material, initShape.xaxis, initShape.zaxis));
	}
}

function parseA(initShape, s)
{
	var rando = Math.random();

	if(rando < 0.2)
	{
		config1(initShape, s);
	}
	else if(rando < 0.6)
	{
		config2(initShape, s);
	}	
	else
	{
		config3(initShape, s);
	}
}

function parseC(initShape, s)
{
	var rando = Math.random();

	if(rando < 0.2)
	{
		modif3(initShape, s);
	}
	else if(rando < 0.4)
	{
		modif4(initShape, s);
	}	
	else if(rando < 0.7)
	{
		modif5(initShape, s);
	}
	else 
	{
		modif6(initShape, s);
	}
}

function parseD(initShape, s)
{
	var rando = Math.random();

	if(rando < 0.25)
	{
		modif7(initShape, s);
	}
	else if(rando < 0.5)
	{
		modif8(initShape, s);
	}	
	else if(rando < 0.75)
	{
		modif9(initShape, s);
	}
	else 
	{
		modif10(initShape, s);
	}
}

export default function Lsystem(axiom, grammar, iterations) {
	// default LSystem
	this.axiom = "A";
	shapeSet = new Set();
	
	// Set up the axiom string
	if (typeof axiom !== "undefined") {
		this.axiom = axiom;
	}

	// Set up the grammar as a dictionary that 
	// maps a single character (symbol) to a Rule.
	if (typeof grammar !== "undefined") {
		this.grammar = Object.assign({}, grammar);
	}
	
	// Set up iterations (the number of times you 
	// should expand the axiom in DoIterations)
	if (typeof iterations !== "undefined") {
		this.iterations = iterations;
	}

	// TODO
	// This function returns a linked list that is the result 
	// of expanding the L-system's axiom n times.
	// The implementation we have provided you just returns a linked
	// list of the axiom.
	this.doIterations = function(n, startPos, startRot, startScale, material, xaxis, zaxis, door) {	
		shapeSet.clear();
		var initShape = new Shape('A', startPos, startRot, startScale, material, xaxis, zaxis, door);
		shapeSet.add(initShape);

		for(var i = 0; i < n; i++)
		{
			var temp = shapeSet;
			temp.forEach(function(shape) 
			{ 
				if(shape.symbol == 'A')
				{
					parseA(shape, shapeSet);
				}
				else if(shape.symbol == 'B')
				{
					modif1(shape, shapeSet);
				}
				else if(shape.symbol == 'C')
				{
					parseC(shape, shapeSet);
				}
				else if(shape.symbol == 'D')
				{
					parseD(shape, shapeSet);	
				}
				else if(shape.symbol == 'E')
				{
					modif2(shape, shapeSet);
				}
			});

		}
		return shapeSet;
	}
}