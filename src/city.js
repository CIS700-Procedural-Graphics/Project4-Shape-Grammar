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
		this.vertices = [];
		this.midpoint = new THREE.Vector2(0,0);
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
		this.segments.push({ valid : false, normal: normal.clone(), dir: direction.clone(), midpoint: midpoint.clone(), min : 1000, max : -1000});
	}

	sort()
	{
	}

	calculateVertices()
	{
		this.vertices = [];
		this.midpoint = new THREE.Vector2(0,0);

		function addVertex(v, vertices, midpoint)
		{
			for(var i = 0; i < vertices.length; i++)
				if(v.distanceTo(vertices[i]) < .01)
					return;

			vertices.push(v);
			midpoint.add(v);
		}

		for(var s = 0; s < this.segments.length; s++)
		{
			var segment = this.segments[s];

			if(!segment.valid)
				continue;

			var from = segment.midpoint.clone().add(segment.dir.clone().multiplyScalar(segment.min));
			var to = segment.midpoint.clone().add(segment.dir.clone().multiplyScalar(segment.max));
			
			addVertex(from, this.vertices, this.midpoint);
			addVertex(to, this.vertices, this.midpoint);
		}

		if(this.vertices.length > 0)
			this.midpoint.multiplyScalar(1.0 / this.vertices.length);
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

		h1.addSegment(axis, tangent, offset);
		h2.addSegment(axis.clone().negate(), tangent.clone().negate(), offset);

		for(var h = 0; h < this.segments.length; h++)
		{
			var segment = this.segments[h];

			// Some pruning
			if(segment.valid)
			{
				h1.addSegment(segment.normal, segment.dir, segment.midpoint);
				h2.addSegment(segment.normal, segment.dir, segment.midpoint);
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
		var newHulls = [];

		for(var h = 0; h < hulls.length; h++)		
		{
			var hull = hulls[h];	
			var intersected = false;

			for(var x = 0; x < subdivisions + 1 && !intersected; x++)
			{
				var t = x / subdivisions;
				var sliceOffset = t * scale;			

				if(intersectionFunction(hull, sliceOffset))
				{
					var split = hull.splitComplex(axis, sliceOffset);

					if(split[0].isValid())
						newHulls.push(split[0]);

					if(split[1].isValid())
						newHulls.push(split[1]);

					intersected = true;
				}
			}

			if(!intersected)
				newHulls.push(hull);
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
		var count = 30;
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
  							hull.addSegment(normal, tangent, midpoint);
  						}
  					}
  				}

  				hull.calculateSegments();
				hulls.push(hull);
  			}
  		}

  		// Subdivide everything 11 times in X and Y
  		// Then we take the inner 9x9 grids to build a cube
		hulls = this.sliceHullSet(hulls, xAxis, 11, count * scale, function(hull, sliceOffset){ return hull.bounds.intersectsX(sliceOffset); });
		hulls = this.sliceHullSet(hulls, yAxis, 11, count * scale, function(hull, sliceOffset){ return hull.bounds.intersectsY(sliceOffset); });
		console.log("Hulls: " + hulls.length);

		var cellScale = count * scale / 11;
		var cellBounds = [];

		// Top cell
		cellBounds.push(new Common.Bounds(new THREE.Vector2( 4 * cellScale, 1 * cellScale ), new THREE.Vector2( 7 * cellScale, 4 * cellScale )));
		cellBounds.push(new Common.Bounds(new THREE.Vector2( 4 * cellScale, 7 * cellScale ), new THREE.Vector2( 7 * cellScale, 10 * cellScale )));
		
		// Horizontal cells
		cellBounds.push(new Common.Bounds(new THREE.Vector2( 1 * cellScale, 4 * cellScale ), new THREE.Vector2( 4 * cellScale, 7 * cellScale )));
		cellBounds.push(new Common.Bounds(new THREE.Vector2( 4 * cellScale, 4 * cellScale ), new THREE.Vector2( 7 * cellScale, 7 * cellScale )));
		cellBounds.push(new Common.Bounds(new THREE.Vector2( 7 * cellScale, 4 * cellScale ), new THREE.Vector2( 10 * cellScale, 7 * cellScale )));

		// Last cell
		cellBounds.push(new Common.Bounds(new THREE.Vector2( 7 * cellScale, 7 * cellScale ), new THREE.Vector2( 10 * cellScale, 10 * cellScale )));

		// Save geo for display
		for(var h = 0; h < hulls.length; h++)
		{
			if(!hulls[h].isValid())
				continue;

			hulls[h].calculateVertices();

			var bounded = false;
			for(var b = 0; b < cellBounds.length; b++)
			{
				if(cellBounds[b].contains(hulls[h].midpoint))
					bounded = true;
			}

			if(!bounded)
				continue;
			
			var height = 0;
			pointsGeo.vertices.push(new THREE.Vector3( hulls[h].midpoint.x, height, hulls[h].midpoint.y));

			for(var s = 0; s < hulls[h].segments.length; s++)
			{
				var segment = hulls[h].segments[s];

				if(!segment.valid)
					continue;

				var from = segment.midpoint.clone().add(segment.dir.clone().multiplyScalar(segment.min));
				var to = segment.midpoint.clone().add(segment.dir.clone().multiplyScalar(segment.max));
				
				geometry.vertices.push(new THREE.Vector3( from.x, height, from.y ))
				geometry.vertices.push(new THREE.Vector3( to.x, height, to.y ))

				pointsGeo.vertices.push(new THREE.Vector3( from.x, height, from.y));
				pointsGeo.vertices.push(new THREE.Vector3( to.x, height, to.y));
			}
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