const THREE = require('three');
import ShapeGrammar from './shapegrammar.js'
import Noise from './noise.js'


var flatMat = new THREE.MeshPhongMaterial( { color: 0x000000, polygonOffset: true, 
	polygonOffsetFactor: 1, polygonOffsetUnits: 1});
flatMat.shading = THREE.FlatShading;
var lineMat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );


function City (scene, g1, g2) {
	var loader = new THREE.TextureLoader();
  	var background = new THREE.TextureLoader().load('src/gradient.jpg');

	var planeWidth = 20;

	// use torus for circular layout, and use plane as ground
	var torusGeo = new THREE.TorusGeometry(planeWidth, planeWidth * (3.95 / 4), planeWidth * 3, planeWidth * 3, Math.PI * (4 / 1.5));
	var planeGeo = new THREE.PlaneGeometry( planeWidth, planeWidth, planeWidth - 1, planeWidth*1.5 - 1);

	var material = new THREE.MeshBasicMaterial( {color: 0x162744, side: THREE.DoubleSide, wireframe: false} );
	var mat = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, wireframe: true} );
	
	this.plane = new THREE.Mesh( planeGeo, material );
	this.torus = new THREE.Mesh( torusGeo, mat );
	this.plane.rotateX((90 * Math.PI)/180);
	this.torus.rotateX((90 * Math.PI)/180);
	this.scene = scene;

	this.scene.add(this.plane);
	
	// Create new shape grammar at each vertex on the plane using noise
	// Create a radial layout
	for (var i = 0; i < this.torus.geometry.vertices.length; i++) {
		var vertex = this.torus.geometry.vertices[i];
		if (vertex.z >= 0) {
			var probability = Noise.generateNoise(vertex.x, vertex.y, vertex.y);

			// scale probability by distance from the center
			var vert = new THREE.Vector3(vertex.x, 0, vertex.y);
			var dist = vertex.distanceToSquared(new THREE.Vector3(0, 0, 0));
			probability = Noise.generateNoise(vertex.x, vertex.y, vertex.z) * dist;
			if (Math.floor(probability) % 3 == 1 && 
				probability > 50 &&
				probability < 1000) {
				var building = new ShapeGrammar.ShapeGrammar('D', this.scene, 5, vertex, 
					30 / Math.sqrt(probability), g1, g2);
				building.render();
			}
		}
	}

	var building = new ShapeGrammar.ShapeGrammar('D', this.scene, 5, new THREE.Vector3(0, 0, 0), 
				Noise.generateNoise(vertex.x, vertex.z, vertex.y), g1, g2);
	building.render();
	
	this.plane.scale.x = 200*this.plane.scale.x;
	this.plane.scale.y = 200*this.plane.scale.y;
}
export default {
	City: City
}