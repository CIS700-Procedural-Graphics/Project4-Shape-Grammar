const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import PerlinNoiseMultiOctave from './perlinNoise'

export default class ShapeRenderer {
	constructor(buildingSet, roadSet, scene) {
		this.buildingSet = buildingSet;
		this.roadSet = roadSet;
		this.scene = scene;
		this.numBuildings = buildingSet.size;
	}
	
	drawGeometry() {
		//assemble all geometry into one buffer using merge() then add to scene
		// var allGeometry = new THREE.Object3D();
		
		
		
		for(let currentRoadSegment of this.roadSet.values()) {
			for(let currentRoadMesh of currentRoadSegment.meshSet.values()) {
				this.scene.add(currentRoadMesh);
			}
		}
		
		// console.log(this.geometrySet);
		for(let currentBuildingNode of this.buildingSet.values()) {
			// allGeometry.mergeMesh(currentGeoNode.mesh); //can only use this for geometry of the same type! e.g. box, cylinder, etc
			// console.log(currentGeoNode);
			// console.log(currentBuildingNode);
			//scale the city upwards according to population density
			
			var noiseScale = 0.1;
			var perlinNoiseValue = PerlinNoiseMultiOctave(currentBuildingNode.mesh.position.x * noiseScale, currentBuildingNode.mesh.position.y, currentBuildingNode.mesh.position.z  * noiseScale);
			perlinNoiseValue += 1;
			perlinNoiseValue /= 2;
			var noiseIntensity = 25;
			// console.log(perlinNoiseValue);
			
			currentBuildingNode.mesh.scale.y *= perlinNoiseValue * noiseIntensity;
			currentBuildingNode.mesh.position.y += currentBuildingNode.mesh.scale.y * 0.5;
			this.scene.add(currentBuildingNode.mesh);
			// console.log(currentBuildingNode.mesh);
			// console.log(currentGeoNode.mesh.castShadow);
		}
		// this.scene.add(allGeometry);
		// console.log(this.roadSet.values());
	}
}
