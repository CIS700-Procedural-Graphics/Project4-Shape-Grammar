const THREE = require('three');
const Random = require("random-js");

import * as Common from './common.js'

class Voronoi
{
	constructor()
	{

	}
}

// 2D only!
class ConvexHull
{
	constructor()
	{		
		this.bounds = null;
		this.segments = [];
	}

	getCenter()
	{
		var c = new THREE.Vector2(0,0);

		for(var p = 0; p < this.points.length; p++)
			c.add(this.points[p]);

		c.multiplyScalar(1.0 / this.points.length);

		return c;
	}
		
	addSegment(normal, direction, midpoint, min, max)
	{
		this.segments.push({ valid : false, normal: normal, dir: direction, midpoint: midpoint, min : min, max : max });
	}

	sort()
	{
	}

	updateBounds()
	{
		this.bounds = null;

		for(var h = 0; h < this.segments.length; h++)
		{
			if(this.segments[h].valid)
			{
				var segment = this.segments[h];
				var from = segment.midpoint.clone().add(segment.dir.clone().multiplyScalar(segment.min));
				var to = segment.midpoint.clone().add(segment.dir.clone().multiplyScalar(segment.max));
				
				if(this.bounds == null)
					this.bounds = new Common.Bounds(from, from);

				this.bounds.encapsulate(from);
				this.bounds.encapsulate(to);
			}
		}
	}

	calculateSegments()
	{
		for(var i = 0; i < this.segments.length; i++)
		{
			for(var j = 0; j < this.segments.length; j++)
			{
				if(i == j)
					continue;

				var s1 = this.segments[i];
				var s2 = this.segments[j];

				// Parallel
				if(Math.abs(s1.dir.dot(s2.normal)) < .001)
					continue;

				var diff = s2.midpoint.clone().sub(s1.midpoint);
				var det = s2.dir.x * s1.dir.y - s2.dir.y * s1.dir.x;

				var u = (diff.y * s2.dir.x - diff.x * s2.dir.y) / det;
				var v = (diff.y * s1.dir.x - diff.x * s1.dir.y) / det;

				var newPoint = s1.midpoint.clone().add(s1.dir.clone().multiplyScalar(u));
				var insideHull = true;

				// This is the naive, N^3 intersection test method
				for(var k = 0; k < this.segments.length; k++)
				{
					if(k != j && k != i)
					{
						var dP = newPoint.clone().sub(this.segments[k].midpoint);
						
						// Remember normals are inverted, this is why it is > 0 and not <= 0
						if(this.segments[k].normal.clone().dot(dP) > 0)
							insideHull = false;
					}
				}

				if(!insideHull)
					continue;

				s1.min = Math.min(s1.min, u);
				s1.max = Math.max(s1.max, u);
				s1.valid = true;
			}
		}

		this.updateBounds();
	}

	isValid()
	{
		var valid = 0;

		for(var h = 0; h < this.segments.length; h++)
		{
			if(this.segments[h].valid)
				valid++;
		}
		
		return valid > 2;
	}

	// Returns two copies
	splitComplex(axis, splitDistance)
	{
		var h1 = new ConvexHull();
		var h2 = new ConvexHull();
	
		var tangent = new THREE.Vector2( -axis.y, axis.x);
		var offset = axis.clone().multiplyScalar(splitDistance);

		var oldPoints = this.points;

		h1.addSegment(axis, tangent, offset, 1000, -1000);
		h2.addSegment(axis.clone().negate(), tangent.clone().negate(), offset, 1000, -1000);

		for(var h = 0; h < this.segments.length; h++)
		{
			var segment = this.segments[h];

			// Some pruning
			if(segment.valid)
			{
				h1.addSegment(segment.normal, segment.dir, segment.midpoint, segment.min, segment.max);
				h2.addSegment(segment.normal, segment.dir, segment.midpoint, segment.min, segment.max);
			}
		}

		h1.calculateSegments();
		h2.calculateSegments();

		return [h1, h2];
	}
}

class Generator
{
	constructor()
	{		
	}

	sliceHullSet(hulls, axis, subdivisions, scale, intersectionFunction)
	{
		for(var h = 0; h < hulls.length; h++)
			hulls[h].added = false;

		var newHulls = [];
		for(var x = 0; x < subdivisions + 1; x++)
		{
			var t = x / subdivisions;
			var sliceOffset = t * scale;

			for(var h = 0; h < hulls.length; h++)
			{
				var hull = hulls[h];

				if(intersectionFunction(hull, sliceOffset))
				{
					var split = hull.splitComplex(axis, sliceOffset);

					if(split[0].isValid())
						newHulls.push(split[0]);

					if(split[1].isValid())
						newHulls.push(split[1]);
				}
				else
				{
					if(!hull.added)
					{
						hull.added = true;
						newHulls.push(hull);
					}
				}
			}
		}

		return newHulls;
	}
	
	// Algorithm overview:
	// Build voronoi with half plane intersection tests, based on a jittered grid
	// (super important each point is inside each cell)
	// Generate convex hulls
	// Subdivide convex hulls in X and Y, 9 times
	build(scene)
	{
		// count * count final points
		var count = 40;
		var scale = 2;
  		var random = new Random(Random.engines.mt19937().autoSeed());

  		var geometry = new THREE.Geometry();
  		var pointsGeo = new THREE.Geometry();
  		var points = [];
		var xAxis = new THREE.Vector2( 1, 0 );
		var yAxis = new THREE.Vector2( 0, 1 );

  		// From center
  		var randomAmplitude = .499;

  		// Distribute points
  		for(var x = 0; x < count; x++)
  		{
  			points.push(new Array());

  			for(var y = 0; y < count; y++)
  			{
  				var r1 = random.real(-1, 1) * randomAmplitude * scale;
  				var r2 = random.real(-1, 1) * randomAmplitude * scale;

  				var p = new THREE.Vector2( x * scale + .5 + r1, y * scale + .5 + r2);
  				points[x].push(p);
  			}
  		}

  		// Build half planes, and finding their convex hulls
  		var hulls = [];

  		for(var x = 0; x < count; x++)
  		{
  			for(var y = 0; y < count; y++)
  			{
  				var p = points[x][y];
  				var hull = new ConvexHull();

  				// Find all planes for all close neighbors within 3 cells
  				for(var i = -2; i < 3; i++)
  				{
  					for(var j = -2; j < 3; j++)
  					{
  						if(x+i >= 0 && y+j >= 0 && x+i < count && y+j < count)
  						{
  							var neighbor = points[x+i][y+j];

  							var normal = neighbor.clone().sub(p).normalize();
  							var midpoint = neighbor.clone().add(p).multiplyScalar(.5);
  							var tangent = new THREE.Vector2( -normal.y, normal.x );

  							// var segment = { valid : false, normal: normal, dir: tangent, midpoint: midpoint, min : 1000, max : -1000 }

  							hull.addSegment(normal, tangent, midpoint, 1000, -1000);
  						}
  					}
  				}

  				hull.calculateSegments();
				hulls.push(hull);
  			}
  		}

  		// Subdivide everything 9 times in X and Y
		hulls = this.sliceHullSet(hulls, xAxis, 9, count * scale, function(hull, sliceOffset){ return hull.bounds.intersectsX(sliceOffset); });
		hulls = this.sliceHullSet(hulls, yAxis, 9, count * scale, function(hull, sliceOffset){ return hull.bounds.intersectsY(sliceOffset); });
		console.log("Hulls: " + hulls.length);

		// Save geo for display
		for(var h = 0; h < hulls.length; h++)
		{
			for(var s = 0; s < hulls[h].segments.length; s++)
			{
				var segment = hulls[h].segments[s];

				if(!segment.valid)
					continue;

				var from = segment.midpoint.clone().add(segment.dir.clone().multiplyScalar(segment.min));
				var to = segment.midpoint.clone().add(segment.dir.clone().multiplyScalar(segment.max));
				
				geometry.vertices.push(new THREE.Vector3( from.x, 0, from.y ))
				geometry.vertices.push(new THREE.Vector3( to.x, 0, to.y ))

				pointsGeo.vertices.push(new THREE.Vector3( from.x, 0, from.y));
				pointsGeo.vertices.push(new THREE.Vector3( to.x, 0, to.y));
			}

			// var center = hulls[h].getCenter();
			// pointsGeo.vertices.push(new THREE.Vector3( center.x, 0, center.y));
		}

  		console.log(geometry.vertices.length);

  		var lineMaterial = new THREE.LineBasicMaterial( {color: 0xffffff} );
		var line = new THREE.LineSegments(geometry, lineMaterial);
		scene.add(line);

		var pointsMaterial = new THREE.PointsMaterial( { color: 0xffffff } )
		pointsMaterial.size = .1;
		var pointsMesh = new THREE.Points( pointsGeo, pointsMaterial );
		scene.add( pointsMesh );
	}
}

export {Generator}