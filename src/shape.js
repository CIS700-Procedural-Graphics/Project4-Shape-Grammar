
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
			this.mesh.scale.set(5, 5, 5);
			this.mesh.position.set(0, 2.5, 0);
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
				var child = new THREE.Mesh(new THREE.BoxGeometry(s_child.x, s_child.y, s_child.z),
				new THREE.MeshLambertMaterial( {color: randColor()} ));

				child.position.set(p.x, p.y - s.y / 2.0 + s_axis / 2.0 + s_axis * i, p.z);
				this.children.push(new Shape(this, child, i.toString())); // Indicate what floor it is
			}
	};

	// Subdivides Evenly in Half
	// Should not be used for in y direction, instead use floor creation
	subdivide(axis) { // 0 = x, 1 = y, 2 = z
		// if (axis == 0) {
		// 	axis = 1;
		// } else {
		// 	axis = 0;
		// }

		// axis = 1;

		console.log(axis)

		// this.show == false;

		var s = this.mesh.scale;
		var p = this.mesh.position;

		// Random heights for the two different subdivisions
		var h1 = mapRand(s.y / 2.0, s.y);
		var h2 = mapRand(s.y / 2.0, s.y);


		if (this.children.length === 0) {
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