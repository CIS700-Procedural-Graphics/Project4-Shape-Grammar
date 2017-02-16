
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
			this.boundingBox = new THREE.BoxGeometry(10, 10, 10);
			this.mesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10),
				lambertWhite);
			this.iteration = 0;
		} else {
			this.parent = parent;
			this.boundingBox = boundingBox;
			this.mesh = mesh;
			this.iteration = this.parent.iteration + 1;
		}

		this.children = [];
	};


	// If there is any Z subdivision then 
	subdivide() { // 0 = x, 1 = y, 2 = z
		// if (this.children.length === 0) {
		// 	// subdivide
		// 	var axis = 0;

		// 	if (axis == 0) {
		// 		var s = this.parent.boundingBox

		// 		Shape a = new Shape(this, this.parent.boundingBox )
		// 	} else if (axis == 1) {

		// 	} else {

		// 	}


		// } else {
		// 	for(var i = 0; i < this.children.length; i++) {
		// 		this.children[i].subdivide();
		// 	}
		// }
	};

	draw(scene) {
		scene.add(this.mesh);
	};

	drawBbox(scene) {
		var geo = new THREE.EdgesGeometry( this.boundingBox );
		var mat = new THREE.LineBasicMaterial( { color: 0x00ffff, linewidth: 2 } );
		var wireframe = new THREE.LineSegments( geo, mat );
		scene.add( wireframe );
	};
}