
const THREE = require('three');
const MeshLine = require('three.meshline');

import Framework from './framework'
import ShapeGrammar, {Shape} from './shapeGrammar.js'
import City from './city.js'


var config = {
	cityIterations : 5,
	buildingIterations : 6
};

// called after the scene loads
function onLoad(framework) {
	var scene = framework.scene;
	var camera = framework.camera;
	var renderer = framework.renderer;
	var gui = framework.gui;
	var stats = framework.stats;

	// initialize a simple box and material
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	directionalLight.color.setHSL(0.1, 1, 0.95);
	directionalLight.position.set(1, 3, 2);
	directionalLight.position.multiplyScalar(10);
	scene.add(directionalLight);

	// set camera position
	camera.position.set(70, 30, -10);
	camera.lookAt(new THREE.Vector3(0,0,0));

	/*gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
		camera.updateProjectionMatrix();
	});
	
	gui.add(config, 'cityIterations', 0, 10).onChange(function(newVal) {
		
		scene.children.forEach(function(object){
			scene.remove(object);
		});
		
		loadShapes(shapeNames, 0, [], [], scene, [0,0,0]);
	
	});
			
	
	gui.add(config, 'buildingIterations', 0, 6).onChange(function(newVal) {
		
		scene.children.forEach(function(object){
			scene.remove(object);
		});
		
		loadShapes(shapeNames, 0, [], [], scene, [0,0,0]);
	
	});*/
	
	var loader = new THREE.TextureLoader();
	var texture = loader.load( 'images/sunset.jpg');
    scene.background = texture;

	var shapeNames = ['base1.obj','base2.obj','base3.obj', 'roof1.obj','roof2.obj','roof3.obj'];
		
	loadShapes(shapeNames, 0, [], [], scene, [0,0,0]);
	
}


//recursively load all the axiom shapes in shapeNames
//call the shapegrammer on the axiom shapes
//render the shapes returned from shapegrammar
// shapeGeometry : holds initial shape objs 
// shapeList : holds attributes of the initial shapes (axiom)
function loadShapes(shapeNames, i, shapeList, shapeGeometry, scene, pos) {
	
	var objLoader = new THREE.OBJLoader();
	objLoader.load('shapes/'.concat(shapeNames[i]), function(obj) {

		var shapeGeo = obj.children[0].geometry;
		shapeGeometry.push(shapeGeo);

		var box = new THREE.Box3().setFromObject( obj.children[0] );

		var shape = new Shape(shapeNames[i]);
		shape.geometry = i;
		shape.terminal = false;
		shape.dimensions = [box.getSize().x, box.getSize().y, box.getSize().z];
		
		shape.position = pos;
		
		var result = shape.symbol.indexOf("roof") > -1;
		if (!result)
			shapeList.push(shape);
		
		if (i < shapeNames.length-1)
			loadShapes(shapeNames, i+1, shapeList, shapeGeometry, scene, pos)
			
		else {
			
				
			var city = new City();
			city.shapes = shapeList;
			city.buildingGeometry = shapeGeometry;
			city.buildingIterations = config.buildingIterations;
			var ob = city.doIterations(config.cityIterations, 5);
			scene.add(ob);
			
			
			//FOR DEBUGGING
			/*var shapeGrammar = new ShapeGrammar();
			shapeGrammar.shapes = shapeList;
			 
			var all = renderShapes(shapeGrammar.doIterations(6), shapeGeometry, [0,0,0]);
			scene.add(all);*/
			
		}
			
	});	
	
}


//FOR DEBUGGING
function renderShapes(shapes, geometry, offset) {
	
	var lambertGray = new THREE.MeshLambertMaterial({ color: 0x555555, side: THREE.DoubleSide });
	
	var sceneShapes = new THREE.Object3D();
	var singleGeometry = new THREE.Geometry();
	//console.log(shapes.length);
	
	for (var i = 0; i < shapes.length; i++) {
		
		var s = shapes[i];
		lambertGray = new THREE.MeshLambertMaterial({ color: 0x555555, side: THREE.DoubleSide });
		//lambertGray.wireframe = true;
		//console.log(s.position);
		//var shapeGeo = obj.children[0].geometry;
		var shapeGeo = geometry[s.geometry];
		var shapeMesh = new THREE.Mesh(shapeGeo, lambertGray);
		//var shapeMesh = geometry.children[s.geometry];
		//console.log(s.rotation);
		shapeMesh.scale.set(s.scale[0],s.scale[1],s.scale[2]);
		shapeMesh.position.set(s.position[0]+offset[0],s.position[1]+offset[1],s.position[2]+offset[2]);	
		shapeMesh.rotation.set(s.rotation[0],s.rotation[1],s.rotation[2]);
		//shapeMesh.name = "roof1";
		//console.log(shapeMesh);
		shapeMesh.updateMatrix();
		//singleGeometry.merge(shapeMesh.geometry, shapeMesh.matrix);
		shapeMesh.material.color.setHex( s.color );
		sceneShapes.add(shapeMesh);
	
	}
	 
	return sceneShapes;
		
}

// called on frame updates
function onUpdate(framework) {}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
