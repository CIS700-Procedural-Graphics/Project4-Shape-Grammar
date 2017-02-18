
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

var lambertWhite = new THREE.MeshLambertMaterial( {color: 0xffffff} );

// Generate a random color
function randColor() {
	return Math.random() * 0xffffff;
};

function mapRand(start, end) {
	return Math.random() * (end - start) + start;
};

function mat_randColor() {
	return new THREE.MeshLambertMaterial({color:randColor()});
}

// Shape Node
// parent: parent of the node
// boundingbox: bounding box of the shape in world space
// geometry: geometry to render
// children
export default class Shape {
	constructor(parent, mesh, name) {
		if (arguments.length === 0) {
			// Default empty
			this.parent = null;
			// this.boundingBox = new THREE.BoxGeometry(10, 10, 10);
			this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1),
				lambertWhite);
			this.mesh.scale.set(10, 10, 10);
			this.mesh.position.set(0, 5, 0);
			this.iteration = 0;

			// For continuation purposes
			this.name = 'building';
		} else {
			if (name) {
				this.name = name;
			} else {
				this.name = '';
			}

			this.parent = parent;
			// this.boundingBox = boundingBox;
			this.mesh = mesh;

			if (parent !== null) {
				this.iteration = this.parent.iteration + 1;
			} else {
				this.iteration = 0;
			}
		}

		this.show = true;
		this.division = ''; // Current subdivision
		this.children = [];
	};

	// Creates floors
	// Can only create on a building that has floors for the first time
	// This should only happen once per building and should really be the first thing that happens
	createFloors(numFloors) {
		this.show = false;
		this.name = ''; // No longer a building

		// subdivide
		var s_factor = 0.5;

		var s = this.mesh.scale;
		var p = this.mesh.position;

		var s_child = s.clone();
		var s_axis;

		if (numFloors != null && numFloors > 0) {
			numFloors = Math.floor(numFloors);
			s_axis = 1.0 / numFloors;
		} else {
			numFloors = 2.0;
			s_axis = 0.5;
		}

		s_axis = s.y * s_axis;
		s_child.setComponent(1, s_axis);

		for(var i = 0; i < numFloors; i++) {
			var child = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0),
			new THREE.MeshLambertMaterial( {color: randColor()} ));
			child.scale.set(s_child.x, s_child.y, s_child.z);

			child.position.set(p.x, p.y - s.y / 2.0 + s_axis / 2.0 + s_axis * i, p.z);
			var shape = new Shape(this, child, 'floor');
			
			if (i == 0) {
				shape.name = 'bottom';
			}
			else if (i == numFloors - 1) {
				shape.name = 'top';
			}
			this.children.push(shape);
		}
	};

	// Subdivides Evenly in Half
	// Should not be used for in y direction, instead use floor creation
	subdivide(axis) { // 0 = x, 1 = y, 2 = z
		if (this.children.length === 0) {
			var s = this.mesh.scale;
			var p = this.mesh.position;

			// Random heights for the two different subdivisions
			var h1 = mapRand(s.y / 2.0, s.y);
			var h2 = mapRand(s.y / 2.0, s.y);

			if (axis == null) {
				axis = 0;
			}

			this.name = ''; // No longer a building once there are floors
			this.show = false;


			var sx1, sx2, sz1, sz2;

			if (axis == 0) {
				sx1 = mapRand(s.x / 4.0, s.x / 2.0);
				sx2 = mapRand(s.x / 4.0, s.x / 2.0);

				sz1 = mapRand(s.z / 2.0, s.z);
				sz2 = mapRand(s.z / 2.0, s.z);

				var p_left = new THREE.Vector3(
					p.x - sx1 / 2.0, 
					p.y - s.y / 2.0 + h1 / 2.0, 
					p.z - s.z / 2.0 + sz1 / 2.0);
				var p_right = new THREE.Vector3(
					p.x + sx2 / 2.0,
					p.y - s.y / 2.0 + h2 / 2.0, 
					p.z - s.z / 2.0 + sz2 / 2.0);
				
				var left = new THREE.Mesh(
								new THREE.BoxGeometry(1.0, 1.0, 1.0),
								mat_randColor());
				left.scale.set(sx1, h1, sz1);
				
				var right = new THREE.Mesh(
								new THREE.BoxGeometry(1.0, 1.0, 1.0),
								mat_randColor());
				right.scale.set(sx2, h2, sz2);

				left.position.set(p_left.x, p_left.y, p_left.z);
				right.position.set(p_right.x, p_right.y, p_right.z);

				// Add to the children
				this.children.push(new Shape(this, left, 'building'));
				this.children.push(new Shape(this, right, 'building'));
			} else {
				sx1 = mapRand(s.x / 2.0, s.x);
				sx2 = mapRand(s.x / 2.0, s.x);

				sz1 = mapRand(s.z / 4.0, s.z / 2.0);
				sz2 = mapRand(s.z / 4.0, s.z / 2.0);

				var p_left = new THREE.Vector3(
					p.x - s.x / 2.0 + sx1 / 2.0, 
					p.y - s.y / 2.0 + h1 / 2.0, 
					p.z - sz1 / 2.0);
				var p_right = new THREE.Vector3(
					p.x - s.x / 2.0 + sx2 / 2.0,
					p.y - s.y / 2.0 + h2 / 2.0, 
					p.z + sz2 / 2.0);
				
				var left = new THREE.Mesh(
								new THREE.BoxGeometry(1.0, 1.0, 1.0),
								mat_randColor());
				left.scale.set(sx1, h1, sz1);
				
				var right = new THREE.Mesh(
								new THREE.BoxGeometry(1.0, 1.0, 1.0),
								mat_randColor());
				right.scale.set(sx2, h2, sz2);

				left.position.set(p_left.x, p_left.y, p_left.z);
				right.position.set(p_right.x, p_right.y, p_right.z);

				// Add to the children
				this.children.push(new Shape(this, left, 'building'));
				this.children.push(new Shape(this, right, 'building'));
			}

		} else {
			for(var i = 0; i < this.children.length; i++) {
				this.children[i].subdivide(i % 2);
			}
		}
	};

		// Returns a (1, 1, 1) rectangular prism with the top shrunk in so that when scaled
	// to the input it looks like a oning of a building in the forbidden city
	createOningGeometry(scale, width) {
	  if (!width) {
	  	width = 1.0; // Standard width of the oning
	  }

	  var oning = new THREE.BoxGeometry( 1.0, 1.0, 1.0 );
	  var v = oning.vertices; 

	  // console.log(oning.vertices);
	  var sx = (scale.x - width) / (scale.x * 2.0);
	  var sz = (scale.z - width) / (scale.z * 2.0);

	  v[0].set(sx, 0.5, sz);
	  v[1].set(sx, 0.5, -sz);
	  v[4].set(-sx, 0.5, -sz);
	  v[5].set(-sx, 0.5, sz);
	  var oning_mesh = new THREE.Mesh(oning, new THREE.MeshLambertMaterial());
	  oning_mesh.scale.set(scale.x, scale.y, scale.z);
	  return oning_mesh;
	};

	createRoofGeometry(scale, width) {
		this.name = '';

		if (!width) {
			width = 2.0;
		}

		var roof = new THREE.BoxGeometry( 1.0, 1.0, 1.0 );
		var v = roof.vertices;

		var sx, sz;
		if (scale.x <= scale.z) {
			sx = (scale.x - width) / (scale.x * 2.0);
			sz = 0.0;
		} else { // scale.z > scale.x
			sx = 0.0;
			sz = (scale.z - width) / (scale.z * 2.0);
		}

		v[0].set(sx, 0.5, sz);
		v[1].set(sx, 0.5, -sz);
		v[4].set(-sx, 0.5, -sz);
		v[5].set(-sx, 0.5, sz);
		
		var roof_mesh = new THREE.Mesh(roof, new THREE.MeshLambertMaterial());
		roof_mesh.scale.set(scale.x, scale.y, scale.z);

		var p = this.mesh.position;
		roof_mesh.position.set(p.x, p.y + scale.y, p.z);

		this.children.push(new Shape(this, roof_mesh, 'roof'));

		//return roof_mesh;
	};

	// Scale of the space
	// Width for how much space on the perimeter should the columns take up
	createBoxwColGeometry(scale, width) {
		this.name = '';

		if (!width) {
			width = 0.25;
		}

		var sx = (scale.x - width) / scale.x;
		var sz = (scale.z - width) / scale.z;

		var geo = new THREE.BoxGeometry( sx, 1.0, sz );
		var v = geo.vertices;

		var r = width / 4.0;
		
		var colGeo1 = new THREE.CylinderGeometry(r, r, 1.0, 10.0);
		colGeo1.scale(1.0/scale.x, 1.0, 1.0/scale.z);
		colGeo1.translate(sx / 2.0 + r, 0.0, sz / 2.0 + r);

		var colGeo2 = new THREE.CylinderGeometry(r, r, 1.0, 10.0);
		colGeo2.scale(1.0/scale.x, 1.0, 1.0/scale.z);
		colGeo2.translate(sx / 2.0 + r, 0.0, -sz / 2.0 - r);

		var colGeo3 = new THREE.CylinderGeometry(r, r, 1.0, 10.0);
		colGeo3.scale(1.0/scale.x, 1.0, 1.0/scale.z);
		colGeo3.translate(-sx / 2.0 - r, 0.0, sz / 2.0 + r);

		var colGeo4 = new THREE.CylinderGeometry(r, r, 1.0, 10.0);
		colGeo4.scale(1.0/scale.x, 1.0, 1.0/scale.z);
		colGeo4.translate(-sx / 2.0 - r, 0.0, -sz / 2.0 - r);

		geo.merge(colGeo1);
		geo.merge(colGeo2);
		geo.merge(colGeo3);
		geo.merge(colGeo4);

		var mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial());
		mesh.scale.set(scale.x, scale.y, scale.z);
		var p = this.mesh.position;
		mesh.position.set(p.x, p.y, p.z);

		this.mesh = mesh;
	}

	// THIS IS WHERE ALL THE GRAMMAR IS BASICALLY
	// This is called by the ShapeSystem whatever.
	iterate() {
		var r = Math.random();

		if (this.children.length > 0) {
			for(var i = 0; i < this.children.length; i++) {
				this.children[i].iterate();
			}
		}

		// This is a finished intermediate node that no longer matters in terms of iteration
		if (this.name == '') {
			return;
		} else if (this.name == 'building') {
			// Subdivision into more buildings
			if (r < 0.8) {
				if (r < 0.4) {
					this.subdivide(0);
				} else {
					this.subdivide(1);
				}

			// Divides the building into at least 2 floors
			// More floors the taller the building is though
			} else {
				this.createFloors(Math.floor(Math.random() * this.mesh.scale.y) + 2);
			}
		} else if (this.name == 'top') {
			if (r  < 0.8) {
				// make a roof
				console.log('making a roof');
				this.createRoofGeometry(this.mesh.scale, this.mesh.scale.x / 4.0);
			}
		} else if (this.name == 'bottom') {
			if (r < 0.5) {
				// add columns
				console.log('adding some columns');
				this.createBoxwColGeometry(this.mesh.scale, this.mesh.scale.x / 4.0);
			}
		}
	};

	draw(scene, n) {
		// if (n < this.iteration && this.children.length != 0) {
		if (this.children.length > 0) {
			for(var i = 0; i < this.children.length; i++) {
				this.children[i].draw(scene, n);
			}
		}
		if (this.show === true) {
			scene.add(this.mesh);
		} 
		else {
			scene.remove(this.mesh);
		}
	};
}