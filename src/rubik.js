const THREE = require('three');

function fequals(a, b)
{
	return Math.abs(a-b) < .001;
}

class Rubik
{
	constructor()
	{
		this.segments = [];
		this.animating = false;
		this.currentAxis = 0;
		this.currentPlane = 0;
		this.currentLength = 1.0;
		this.time = 0;
		this.callback = null;
	}

	animate(axis, plane, length, callback)
	{
		this.animating = true;
		this.currentAxis = axis;
		this.currentPlane = plane;
		this.currentLength = length;
		this.time = 0;
		this.callback = callback;
	}

	update(deltaTime)
	{
		if(!this.animating)
			return;

		this.time += deltaTime;

		var t = THREE.Math.clamp(this.time / this.currentLength, 0.0, 1.0);

		t = THREE.Math.smoothstep(t, 0, 1);
		var angle = t * 90;
		var swapped = false;

		if(this.currentAxis == 0)
			swapped = this.rotateX(angle, this.currentPlane);
		else if(this.currentAxis == 1)
			swapped = this.rotateY(angle, this.currentPlane);
		else if(this.currentAxis == 2)
			swapped = this.rotateZ(angle, this.currentPlane);

		if(swapped)
		{
			this.animating = false;
			this.time = 0;

			if(this.callback != null)
				this.callback();
		}
	}

	rotateX(degrees, xPlane)
	{
		return this.rotateInternal(degrees, xPlane, new THREE.Vector3( 1, 0, 0), function(x, y, plane) {
			return new THREE.Vector3( plane, x, y );
		});
	}

	rotateY(degrees, yPlane)
	{
		return this.rotateInternal(degrees, yPlane, new THREE.Vector3( 0, 1, 0), function(x, y, plane) {
			return new THREE.Vector3( y, plane, x );
		});
	}

	rotateZ(degrees, zPlane)
	{
		return this.rotateInternal(degrees, zPlane, new THREE.Vector3( 0, 0, 1), function(x, y, plane) {
			return new THREE.Vector3( x, y, plane );
		});
	}

	rotateInternal(degrees, plane, axis, indexFunction)
	{
		var rad = THREE.Math.degToRad(THREE.Math.clamp(degrees, -90, 90));
		var tMatrix = new THREE.Matrix4();
		var sMatrix = new THREE.Matrix4();
		var rMatrix = new THREE.Matrix4();
		// sMatrix.makeScale(.9, .9, .9);

		for(var i = 0; i < 3; i++)
		{
			for(var j = 0; j < 3; j++)
			{
				var p = indexFunction(i, j, plane);
				var cube = this.segments[p.x][p.y][p.z];

				var matrix = new THREE.Matrix4();
				cube.matrix.copy(matrix);

				rMatrix.makeRotationAxis(axis, rad);
				tMatrix.makeTranslation(p.x - 1, p.y - 1, p.z - 1);

				matrix = rMatrix.clone();
				matrix.multiply(tMatrix);
				matrix.multiply(cube.userData.rotationAccum);

				cube.applyMatrix(matrix);
			}
		}

		// If the rotation is full, then we need to update the data 
		// structure
		var tmpArray = [];
		var shapeArray = [];
		if(fequals(degrees, -90))
		{
			for(var x = 0; x < 3; x++)
			{
				tmpArray.push(new Array());
				shapeArray.push(new Array());

				for(var y = 0; y < 3; y++)
				{
					var p = indexFunction(2 - y, x, plane);
					tmpArray[x][y] = this.segments[p.x][p.y][p.z];
				}
			}
		} 
		else if(fequals(degrees, 90))
		{
			for(var x = 0; x < 3; x++)
			{
				tmpArray.push(new Array());
				shapeArray.push(new Array());

				for(var y = 0; y < 3; y++)
				{
					var p = indexFunction(y, 2 - x, plane);
					tmpArray[x][y] = this.segments[p.x][p.y][p.z];
				}
			}
		}

		// Now we effectively swap everything
		if(tmpArray.length > 0)
		{
			for(var x = 0; x < 3; x++)
				for(var y = 0; y < 3; y++)
				{
					var p = indexFunction(x, y, plane);

					var segment = tmpArray[x][y];
					segment.userData.rotationAccum.premultiply(rMatrix);
					this.segments[p.x][p.y][p.z] = segment;
				}

			// We swapped
			return true;
		}

		return false;
	}

	// Assumes userData = { index, offset}
	attachShapesToFace(shapes)
	{
		for(var i = 0; i < shapes.length; i++)
		{
			var shape = shapes[i];
			var index = shape.userData.index;
			var offset = shape.userData.offset;

			var overallScale = .55 / 3;

			// Front face
			if(index >= 27 && index < 36)
			{
				var x = (index - 27) % 3;
				var y = Math.floor((index - 27) / 3);
				var z = 0;

				shape.rotateX(Math.PI * -.5);
				shape.translateY(.5);
				shape.scale.set(overallScale, overallScale, overallScale);
				this.segments[x][y][z].add(shape);
				this.segments[x][y][z].userData.shape = shape;
			}

			// Top face
			if(index >= 0 && index < 9)
			{
				var x = index % 3;
				var y = 2;
				var z = Math.floor(index / 3);

				// shape.rotateX(Math.PI * -.5);
				shape.translateY(.5);
				shape.scale.set(overallScale, overallScale, overallScale);
				this.segments[x][y][z].add(shape);
				this.segments[x][y][z].userData.shape = shape;
			}

			// Down face
			if(index >= 9 && index < 18)
			{
				var x = (index - 9) % 3;
				var y = 0;
				var z = Math.floor((index - 9) / 3);

				shape.rotateX(Math.PI * -1);
				shape.translateY(.5);
				shape.scale.set(overallScale, overallScale, overallScale);
				this.segments[x][y][z].add(shape);
				this.segments[x][y][z].userData.shape = shape;
			}

			// Left face
			if(index >= 18 && index < 27)
			{
				var x = 2;
				var y = (index - 18) % 3;
				var z = Math.floor((index - 18) / 3);

				shape.rotateZ(Math.PI * -.5);
				shape.translateY(.5);
				shape.scale.set(overallScale, overallScale, overallScale);
				this.segments[x][y][z].add(shape);
				this.segments[x][y][z].userData.shape = shape;
			}

			// Right face
			if(index >= 36 && index < 45)
			{
				var x = 0;
				var y = (index - 36) % 3;
				var z = Math.floor((index - 36) / 3);

				shape.rotateZ(Math.PI * .5);
				shape.translateY(.5);
				shape.scale.set(overallScale, overallScale, overallScale);
				this.segments[x][y][z].add(shape);
				this.segments[x][y][z].userData.shape = shape;
			}

			// Last face
			if(index >= 45 && index < 54)
			{
				var x = (index - 45) % 3;
				var y = Math.floor((index - 45) / 3);
				var z = 2;

				shape.rotateX(Math.PI * .5);
				shape.translateY(.5);
				shape.scale.set(overallScale, overallScale, overallScale);
				this.segments[x][y][z].add(shape);
				this.segments[x][y][z].userData.shape = shape;
			}
		}
	}

	build()
	{
		var container = new THREE.Object3D();
		var boxGeo = new THREE.BoxGeometry( 1, 1, 1 );
		var planeGeo = new THREE.PlaneGeometry(1, 1, 1, 1 );

		this.segments = []

		for(var x = 0; x < 3; x++)
		{
			this.segments.push(new Array());

			for(var y = 0; y < 3; y++)
			{
				this.segments[x].push(new Array());

				for(var z = 0; z < 3; z++)
				{
					var colorDebugging = z;
					var mat = new THREE.MeshPhongMaterial( {color: 0x888888} );
					mat.shininess = 5;
					mat.specular = new THREE.Color(.2,.2,.3);
					// mat.color = new THREE.Color(1, 0.0, 0.0 );

					// if(colorDebugging == 1)
					// 	mat.color = new THREE.Color( 0.0, 1,  0.0 );
					// else if(colorDebugging == 2)
					// 	mat.color = new THREE.Color(0.0, 0.0, 1);

					var cube = new THREE.Mesh( boxGeo, mat );
					cube.position.copy(new THREE.Vector3( x - 1, y - 1, z - 1));
					// cube.scale.copy(new THREE.Vector3( .9, .9, .9 ))
					container.add(cube);

					// Index is x * 3 * 3 + y * 3 + z
					this.segments[x][y].push(cube);
					cube.userData = { rotationAccum : new THREE.Matrix4() };
				}
			}
		}

		return container;
	}


} 

export {Rubik}