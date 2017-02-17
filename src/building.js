const THREE = require('three');

class Shape
{
	constructor(size)
	{
		this.children = [];
		this.active = true;
		this.size = size;
		this.hasComponents = false;
	}
}

// The object that defines the boundaries of the mass shape
class BuildingLot
{
	constructor()
	{
		this.points = [];
		this.normals = [];
	}

	addPoint(x, y)
	{
		this.points.push(new THREE.Vector2(x, y));
	}

	buildNormals()
	{
		var l = this.points.length;

		for(var i = 0; i < l; i++)
		{
			var prev = ((i == 0) ? l - 1 : i - 1);
			var next = (i+1) % l;

			var p = this.points[i];
			var prevP = this.points[prev];
			var nextP = this.points[next];

			var t1 = prevP.clone().sub(p).normalize();
			var t2 = p.clone().sub(nextP).normalize();

			var n1 = new THREE.Vector2(-t1.y, t1.x);
			var n2 = new THREE.Vector2(-t2.y, t2.x);

			var n = n1.add(n2).multiplyScalar(.5);
			this.normals[i] = n.normalize();
		}
	}
}

// The profile of an extrusion
class Profile
{
	constructor()
	{
		this.points = [];
	}

	addPoint(x, y)
	{
		this.points.push(new THREE.Vector2(x, y));
	}
}

class MassShape
{
	constructor(lot, profile)
	{
		this.lot = lot;
		this.profile = profile;
	}

	generateMesh()
	{
		this.lot.buildNormals();

		var material = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x333333 });
		var geometry = new THREE.Geometry();

		var boundaryVertexCount = this.lot.points.length;
		var offset = 0;
		
		for(var i = 0; i < this.profile.points.length; i++)
		{
			var profilePoint = this.profile.points[i];
			var profileDiff = (i == 0) ? new THREE.Vector2(0,0) : (profilePoint.clone().sub(this.profile.points[i-1]));

			for(var j = 0; j < boundaryVertexCount; j++)
			{
				var boundaryPoint = this.lot.points[j];
				var boundaryNormal = this.lot.normals[j];

				var vertex = new THREE.Vector3(boundaryPoint.x, profilePoint.y, boundaryPoint.y);

				var displ = boundaryNormal.clone().multiplyScalar(profilePoint.x - 1.0);
				vertex.add(new THREE.Vector3(displ.x, 0.0, displ.y));

				geometry.vertices.push(vertex);
			}

			// Ignore first row of vertices
			if(i > 0)
			{
				for(var v = 0; v < boundaryVertexCount; v++)
				{
					var v1 = offset + v;
					var v2 = offset + ((v + 1) % boundaryVertexCount);
					var v3 = offset + boundaryVertexCount + ((v + 1) % boundaryVertexCount);

					var v4 = offset + v;
					var v5 = offset + boundaryVertexCount + ((v + 1) % boundaryVertexCount);
					var v6 = offset + boundaryVertexCount + v;

					geometry.faces.push(new THREE.Face3(v3, v2, v1));
					geometry.faces.push(new THREE.Face3(v6, v5, v4));

				}

				offset += boundaryVertexCount;
			}
		}

		geometry.mergeVertices();
		geometry.computeFlatVertexNormals();

		var mesh = new THREE.Mesh(geometry, material);

		this.geometry = geometry;
		this.mesh = mesh;
		return mesh;
	}
}

class Rule
{
	constructor()
	{
		this.componentWise = false;
	}

	evaluateOverall(shape)
	{
	}

	evaluateComponent(shape, scope)
	{
	}

	evaluate(shape, scene)
	{
		if(this.componentWise)
		{
			var material = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x333333 });
			var geometry = new THREE.BoxGeometry( 1, 1, 1 );
			for(var f = 0; f < shape.geometry.faces.length; f += 2)
			{
				var face = shape.geometry.faces[f];

				var v1 = shape.geometry.vertices[face.b];
				var v2 = shape.geometry.vertices[face.a];
				var v3 = shape.geometry.vertices[face.c];

				var height = v2.clone().sub(v1).length();
				var width = v3.clone().sub(v1).length();

				var u = v2.clone().sub(v1).normalize();
				var v = v3.clone().sub(v1).normalize();

				var repetitionsU = 4;
				var repetitionsV = 4;

				if(face.normal.y > .1 || height < .5)
					continue;

				for(var r = 0; r < repetitionsU; r++)
				{
					for(var rV = 0; rV < repetitionsV; rV++)
					{
						var cube = new THREE.Mesh( geometry, material );
						var t = r / repetitionsU;
						var tV = rV / repetitionsV;
						cube.position.copy(u.clone().multiplyScalar(t * height).add(v.clone().multiplyScalar(tV * width).add(v1)));
						cube.scale.set(.1 * width, .1 * height, .1);
						cube.lookAt(cube.position.clone().add(face.normal));
						scene.add( cube );
					}
				}
			}
		}
		else
		{
			evaluateOverall(shape);
		}
	}
}

class ShapeBuilder
{
	constructor()
	{
		this.shapes = [];
		this.iterations = 5;
	}

}

export {Shape, Rule, BuildingLot, Profile, MassShape}