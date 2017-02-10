const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much

export default class ShapeRenderer {
	constructor(geometrySet, scene) {
		this.geometrySet = geometrySet;
		this.scene = scene;
	}
	
	drawGeometry() {
		//assemble all geometry into one buffer using merge() then add to scene
		// var allGeometry = new THREE.Object3D();
		
		// console.log(this.geometrySet);
		for(let currentGeoNode of this.geometrySet.values()) {
			// allGeometry.mergeMesh(currentGeoNode.mesh); //can only use this for geometry of the same type! e.g. box, cylinder, etc
			// console.log(currentGeoNode);
			this.scene.add(currentGeoNode.mesh);
		}
		// this.scene.add(allGeometry);
	}
}