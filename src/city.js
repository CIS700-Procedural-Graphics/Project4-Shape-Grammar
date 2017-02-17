const THREE = require('three');
const Random = require("random-js");

import * as Common from './common.js'
import * as Building from './building.js'

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
		this.area = 0;
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

	calculateArea()
	{
		var area = 0;
		for(var i = 0; i < this.vertices.length; i++)
		{
			var nextIndex = (i+1) % this.vertices.length;

			var v = this.vertices[i];
			var next = this.vertices[nextIndex];

			area += v.x * next.y - v.y * next.x;
		}

		this.area = Math.abs(area) * .5;
	}

	// Sorts the vertices with the gift wrapping algorithm
	sortVertices()
	{
		var unorderedVertices = this.vertices;
		this.vertices = [];

		if(unorderedVertices.length == 0)
			return;

		var leftmostPoint = unorderedVertices[0];

		for(var i = 1; i < unorderedVertices.length; i++)
			if(unorderedVertices[i].x < leftmostPoint.x)
				leftmostPoint = unorderedVertices[i];

        function isLeft(a, b, c)
        {
    	    return ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x)) > 0;
        }

		var currentPoint = leftmostPoint;
		var endpoint = unorderedVertices[0];
		var i = 0;
		do
		{
			this.vertices.push(currentPoint);
			endpoint = unorderedVertices[0];

			for(var j = 1; j < unorderedVertices.length; j++)
			{
				if((endpoint === currentPoint) || isLeft(currentPoint, endpoint, unorderedVertices[j]))
					endpoint = unorderedVertices[j];
			}

			currentPoint = endpoint;
			i++;
		}
		while(i < unorderedVertices.length * 2 && !(endpoint === this.vertices[0]));

		if(unorderedVertices.length != this.vertices.length)
			console.log("Convex hull vertex sort did not work: " + unorderedVertices.length + " original points, result: " + this.vertices.length)

		this.calculateArea();
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

		return valid > 2 && this.segments.length > 2;
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
	// Extract sections from this subdivision
	// Ignore border sections, as I have no time to deal with edge cases (no pun intended)
	buildHulls(scene, random)
	{
		// count * count final points
		var count = 30;
		var scale = 2;

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

		var boundedHulls = new Array();

		for(var i = 0; i < 6; i++)
			boundedHulls.push(new Array());

		// Save geo for display
		for(var h = 0; h < hulls.length; h++)
		{
			var hull = hulls[h];

			if(!hull.isValid())
				continue;

			hull.calculateVertices();

			var bounded = false;
			for(var b = 0; b < cellBounds.length; b++)
			{
				if(cellBounds[b].contains(hull.midpoint))
				{
					bounded = true;
					boundedHulls[b].push(hull);
					break;
				}
			}

			if(!bounded)
				continue;

			hull.sortVertices();
			
			var height = 0;
			pointsGeo.vertices.push(new THREE.Vector3( hull.midpoint.x, height, hull.midpoint.y));

			for(var i = 0; i < hull.vertices.length; i++)
			{
				var i1 = (i+1) % hull.vertices.length;
				var v = hull.vertices[i];
				var v1 = hull.vertices[i1];

				geometry.vertices.push(new THREE.Vector3( v.x, height, v.y ));
				geometry.vertices.push(new THREE.Vector3( v1.x, height, v1.y ));

				pointsGeo.vertices.push(new THREE.Vector3( v.x, height, v.y ));
			}
		}

  // 		console.log(geometry.vertices.length);

  		var lineMaterial = new THREE.LineBasicMaterial( {color: 0xffffff} );
		var line = new THREE.LineSegments(geometry, lineMaterial);
		scene.add(line);

		var pointsMaterial = new THREE.PointsMaterial( { color: 0xffffff } )
		pointsMaterial.size = .1;
		var pointsMesh = new THREE.Points( pointsGeo, pointsMaterial );
		scene.add( pointsMesh );


		return boundedHulls;
	}

	buildLots(hullContainer, random)
	{
		var lotContainer = [];

		for(var i = 0; i < hullContainer.length; i++)
		{
			lotContainer.push(new Array());
			var hulls = hullContainer[i];

			for(var h = 0; h < hulls.length; h++)
			{
				var hull = hulls[h];

				// If it is too small, no lot
				// If it is medium sized, it can be ignored with a probability
				if(hull.area > .5 && (random.real(0,1) > .1 || hull.area > 1.5))
				{
					var lot = new Building.BuildingLot();

					// Yes, directly reuse them ;)
					lot.points = hull.vertices;
					lot.buildNormals();
					lot.hasCap = true;

					lotContainer[i].push(lot);
				}
			}
		}

		return lotContainer;
	}

	build(scene)
	{
  		var random = new Random(Random.engines.mt19937().autoSeed());
		var hulls = this.buildHulls(scene, random);
		var lots = this.buildLots(hulls, random);

		var baseLotProfile = new Building.Profile();
		baseLotProfile.addPoint(1.1, 0.0);
		baseLotProfile.addPoint(1.1, .025);
		baseLotProfile.addPoint(1.2, .025);
		baseLotProfile.addPoint(1.2, .075);
		baseLotProfile.addPoint(1.3, .075);

		for(var i = 0; i < lots.length; i++)
		{
			for(var j = 0; j < lots[i].length; j++)
			{
				// The blocks profiles are also mass shapes
				var shape = new Building.MassShape(lots[i][j], baseLotProfile);
				var mesh = shape.generateMesh();
				scene.add(mesh);
			}
		}
	}
}

export {Generator}