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
		sMatrix.makeScale(.9, .9, .9);

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
				matrix.multiply(sMatrix);

				cube.applyMatrix(matrix);
			}
		}

		// If the rotation is full, then we need to update the data 
		// structure
		var tmpArray = [];
		if(fequals(degrees, -90))
		{
			for(var x = 0; x < 3; x++)
			{
				tmpArray.push(new Array());

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
					this.segments[p.x][p.y][p.z] = tmpArray[x][y];
				}

			// We swapped
			return true;
		}

		return false;
	}

	build()
	{
		var container = new THREE.Object3D();
		var boxGeo = new THREE.BoxGeometry( 1, 1, 1 );
		var planeGeo = new THREE.PlaneGeometry(1, 1, 1, 1 );

		var blackMaterial = new THREE.MeshLambertMaterial( {color: 0x777777} );
		
		this.segments = []

		for(var x = 0; x < 3; x++)
		{
			this.segments.push(new Array());

			for(var y = 0; y < 3; y++)
			{
				this.segments[x].push(new Array());

				for(var z = 0; z < 3; z++)
				{
					var mat = new THREE.MeshLambertMaterial( {color: 0x000000} );
					mat.color = new THREE.Color( (y + z) / 3, 0.0, 0.0 );

					if(x == 1)
						mat.color = new THREE.Color( 0.0, (y + z) / 3,  0.0 );
					else if(x == 2)
						mat.color = new THREE.Color(0.0, 0.0, (y + z) / 3);

					var cube = new THREE.Mesh( boxGeo, mat );
					cube.position.copy(new THREE.Vector3( x - 1, y - 1, z - 1));
					cube.scale.copy(new THREE.Vector3( .9, .9, .9 ))
					container.add(cube);

					// Index is x * 3 * 3 + y * 3 + z
					this.segments[x][y].push(cube);
				}
			}
		}

		return container;
	}


} 

export {Rubik}