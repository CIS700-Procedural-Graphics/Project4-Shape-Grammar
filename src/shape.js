
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

var lambertWhite = new THREE.MeshLambertMaterial( {color: 0xffffff} );

// Shape Node
// parent: parent of the node
// boundingbox: bounding box of the shape in world space
// geometry: geometry to render
// children
export default class Shape {
	constructor(parent, mesh) {
		if (arguments.length === 0) {
			// Default empty
			this.parent = null;
			// this.boundingBox = new THREE.BoxGeometry(10, 10, 10);
			this.mesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10),
				lambertWhite);
			this.iteration = 0;
		} else {
			this.parent = parent;
			// this.boundingBox = boundingBox;
			this.mesh = mesh;

			if (parent !== null) {
				this.iteration = this.parent.iteration + 1;
			} else {
				this.iteration = 0;
			}
		}

		this.division = ''; // Current subdivision
		this.children = [];
	};


	// If there is any Z subdivision then 
	subdivide() { // 0 = x, 1 = y, 2 = z
		if (this.children.length === 0) {
			// subdivide
			var axis = 2; // Just do this for now.

			var s = this.mesh.scale;
			var p = this.mesh.position;

			if (axis == 0) {
				var s_child = new THREE.Vector3(s.x / 2.0, s.y, s.z);
				var p_left = new THREE.Vector3(p.x - s.x / 4.0, p.y, p.z);
				var p_right = new THREE.Vector3(p.x + s.x / 4.0, p.y, p.z);
				
				var left = new THREE.Mesh(
								new THREE.BoxGeometry(s_child.x, s_child.y, s_child.z),
								lambertWhite);

				lambertWhite = new THREE.MeshLambertMaterial( {color: 0x00ffff} );
				
				var right = new THREE.Mesh(
								new THREE.BoxGeometry(s_child.x, s_child.y, s_child.z),
								lambertWhite);
				left.position.set(p_left.x, p_left.y, p_left.z);
				right.position.set(p_right.x, p_right.y, p_right.z);
				this.children.push(new Shape(this, left));
				this.children.push(new Shape(this, right));
			} else if (axis == 1) {
				var s = this.mesh.scale;
				var p = this.mesh.position;

				var s_child = new THREE.Vector3(s.x, s.y / 2.0, s.z);

				var p_bottom = new THREE.Vector3(p.x, p.y - s.y / 4.0, p.z);
				var p_top = new THREE.Vector3(p.x, p.y + s.y / 4.0, p.z);

				var bottom = new THREE.Mesh(
					new THREE.BoxGeometry(s_child.x, s_child.y, s_child.z),
					lambertWhite);
				bottom.position.set(p_bottom.x, p_bottom.y, p_bottom.z);

				lambertWhite = new THREE.MeshLambertMaterial( {color: 0x00ffff} );
				var top = new THREE.Mesh(
					new THREE.BoxGeometry(s_child.x, s_child.y, s_child.z),
					lambertWhite);
				top.position.set(p_top.x, p_top.y, p_top.z);

				this.children.push(new Shape(this, top));
				this.children.push(new Shape(this, bottom));

			} else {
				var s = this.mesh.scale;
				var p = this.mesh.position;

				var s_child = new THREE.Vector3(s.x, s.y, s.z / 2.0);

				var p_front = new THREE.Vector3(p.x, p.y, p.z + s.z / 4.0);
				var p_back = new THREE.Vector3(p.x, p.y, p.z - s.z / 4.0);

				var front = new THREE.Mesh(
					new THREE.BoxGeometry(s_child.x, s_child.y, s_child.z),
					lambertWhite);
				front.position.set(p_front.x, p_front.y, p_front.z);

				lambertWhite = new THREE.MeshLambertMaterial( {color: 0x00ffff} );
				var back = new THREE.Mesh(
					new THREE.BoxGeometry(s_child.x, s_child.y, s_child.z),
					lambertWhite);
				back.position.set(p_back.x, p_back.y, p_back.z);

				this.children.push(new Shape(this, front));
				this.children.push(new Shape(this, back));
			}
		} else {
			for(var i = 0; i < this.children.length; i++) {
				this.children[i].subdivide();
			}
		}
	};

	draw(scene, n) {
		// if (n < this.iteration && this.children.length != 0) {
		if (this.children.length > 0) {
			for(var i = 0; i < this.children.length; i++) {
				this.children[i].draw(scene, n);
			}
		} else {
			// this.drawBbox(scene);
			scene.add(this.mesh);
			//this.subdivide();
		}
	};

	drawBbox(scene) {
		var geo = new THREE.EdgesGeometry( this.mesh.geometry );
		var mat = new THREE.LineBasicMaterial( { color: 0x00ffff, linewidth: 2 } );
		var wireframe = new THREE.LineSegments( geo, mat );
		scene.add( wireframe );
	};
}