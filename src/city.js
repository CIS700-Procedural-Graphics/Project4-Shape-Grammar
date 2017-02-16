const THREE = require('three');
import ShapeGrammar from './shapegrammar.js'
import Noise from './noise.js'


var flatMat = new THREE.MeshPhongMaterial( { color: 0x000000, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1});
flatMat.shading = THREE.FlatShading;
var lineMat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );


function City (scene) {
	this.shapeGrammars = [];
	
	// Create plane 
	var planeWidth = 15;
	var geometry = new THREE.PlaneGeometry( planeWidth, planeWidth, planeWidth - 1, planeWidth*1.5 - 1);
	var material = new THREE.MeshBasicMaterial( {color: 0x0a0c30, side: THREE.DoubleSide, wireframe: false} );
	this.plane = new THREE.Mesh( geometry, material );
	this.plane.rotateX((90 * Math.PI)/180);
	this.scene = scene;

	this.render = function() {
		this.scene.add(this.plane);
		// Create new shape grammar at each vertex on the plane
		for (var i = 0; i < this.plane.geometry.vertices.length; i++) {
			var vertex = this.plane.geometry.vertices[i];
			if (Noise.generateNoise(vertex.x, vertex.y, vertex.y) > 1.4){
				var building = new ShapeGrammar.ShapeGrammar('D', this.scene, 5, vertex, 1.5*Noise.generateNoise(vertex.x, vertex.z, vertex.y));
				building.render();
			}
			
		}
		this.plane.scale.x = 200*this.plane.scale.x;
		this.plane.scale.y = 200*this.plane.scale.y;
	}
}
export default {
	City: City
}