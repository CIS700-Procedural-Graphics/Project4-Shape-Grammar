
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import ShapeGrammar from './shapeGrammar'
import ShapeRenderer from './shapeRenderer'
import PerlinNoiseMultiOctave from './perlinNoise'

//OBJ Loading
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

/*
OBJLoader = new THREE.OBJLoader();
OBJLoader.load('res/OBJs/leaf.obj', function(obj) {
    leafGeometry = obj.children[0].geometry;
});
*/

var shapeRenderer;
var cityGeometry;
var roadNetwork;
var iterations = { value : 5 };

//Perlin Noise tweaks
var noiseTerrainScale = 0.003;
var noiseTerrainIntensity = 20;

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;
  
  scene.fog = new THREE.Fog( 0xffffff, 1, 75 );
  scene.fog.color.setHSL( 0.55, 0.2, 0.8 );
  
  
  //Set up directional light
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(139, 147, 123);
  directionalLight.position.multiplyScalar(0.1);
  directionalLight.castShadow = true;
  
  //Set up shadow and shadow camera properties
  directionalLight.shadow.mapSize.width = 8192;
  directionalLight.shadow.mapSize.height = 8192;
  directionalLight.shadow.camera.left = -1000;
  directionalLight.shadow.camera.bottom = -1000;
  directionalLight.shadow.camera.right = 1000;
  directionalLight.shadow.camera.top = 1000;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 1000;
  
  scene.add(directionalLight);
  
  // var helper = new THREE.CameraHelper(spotlight.shadow.camera);
  // scene.add(helper);
  
  // Set skybox
  var loader = new THREE.CubeTextureLoader();
  var urlPrefix = 'res/images/skymap/';

  var skymap = new THREE.CubeTextureLoader().load([
      urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
      urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
      urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
  ] );
  scene.background = skymap;
  
  // Set camera position
  camera.position.set(18.5, 27, 8);
  camera.lookAt(new THREE.Vector3(0,0,0));
  
  // Add the ground
  var planeWidth = 550;
  var planeLength = 550;
  
  //Add the plane to the scene but also return it
  var groundPlaneMesh = addTerrainToScene(framework, planeWidth, planeLength);
  
  OBJLoader = new THREE.OBJLoader();
  OBJLoader.load('res/OBJs/Godzilla.obj', function(obj) {
  	var godzillaOBJ = obj.children[0].geometry;
  	var godzillaMaterial = new THREE.MeshPhysicalMaterial( { color : 0x556B2F } );
  	var godzillaMesh = new THREE.Mesh( godzillaOBJ, godzillaMaterial );
  	godzillaMesh.scale.set(0.11, 0.11, 0.11);
  	godzillaMesh.position.z -= 42;
  	godzillaMesh.name = "Godzilla";
  	scene.add(godzillaMesh);
  });
  
  // Decide where to start the city
  //for now this will just randomly place a starting cube within the bounds of the plane
  var randomXPos = Math.floor(Math.random() * planeWidth * 0.5 - planeWidth * 0.25);
  var randomZPos = Math.floor(Math.random() * planeLength * 0.5 - planeLength * 0.25);
  
  // Create a new Shape Grammar
  var shapeGrammar = new ShapeGrammar();
  // shapeGrammar.position.set(randomXPos, 10, randomZPos);
  shapeGrammar.position.set(0, 0.02, 0);
  roadNetwork = shapeGrammar.generateRoadNetwork();
  cityGeometry = shapeGrammar.doIterations(iterations.value, roadNetwork); //return set of nodes
  
  
  // setCityOnGround(cityGeometry, roadNetwork, groundPlaneMesh);
  
  // Create an instance of the shape renderer
  shapeRenderer = new ShapeRenderer(cityGeometry, roadNetwork, scene);
  shapeRenderer.drawGeometry();
  
  shapeRenderer.doShapeGrammar = function() {
  	clearScene(this);
  	cityGeometry = shapeGrammar.doIterations(iterations.value, roadNetwork);
  	// console.log(cityGeometry);
  	shapeRenderer.buildingSet = cityGeometry;
  	shapeRenderer.numBuildings = cityGeometry.size;
  	// setCityOnGround(cityGeometry, roadNetwork, groundPlaneMesh);
  	this.drawGeometry();
  }
  
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
  
  gui.add(iterations, 'value', 0, 10).step(1).name('# of Iterations');
  gui.add(shapeRenderer, 'doShapeGrammar').name('Do Shape Grammar');
}

function clearScene(shapeRenderer) {
	var sceneObject;
	for(var i = 0; i < shapeRenderer.numBuildings - 1; i++) {
		// console.log(shapeRenderer.scene.children.length);
		// console.log(shapeRenderer.numBuildings);
		sceneObject = shapeRenderer.scene.children[shapeRenderer.scene.children.length - 1];
		// console.log(sceneObject);
		if(sceneObject.name != "Godzilla") {
			shapeRenderer.scene.remove(sceneObject);
		}
	}
}


// function setCityOnGround(cityGeometry, roadNetwork, groundPlaneMesh) {
// 	for(let currentNode of cityGeometry) {
// 		// Set each node's position to the perlin noise value
// 		var nodePos = currentNode.mesh.position;
// 		var perlinNoiseValue = PerlinNoiseMultiOctave(nodePos.x * noiseTerrainScale, 0, nodePos.z * noiseTerrainScale);
// 		currentNode.mesh.position.y += perlinNoiseValue * noiseTerrainIntensity + 0.51;
		
// 		// Rotate each node according to the surface normal of the plane below it
// 		var currentPosition = currentNode.mesh.position;
// 		var ray = new THREE.Raycaster(new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z), new THREE.Vector3(0, -1, 0), 0.1, 100);
// 		var groundIntersections = ray.intersectObject(groundPlaneMesh, false);
		
// 		// Use the first intersection we get. Note, we assume that the geometry intersects with the plane (keep the plane sufficiently large)
// 		var surfaceNormal = groundIntersections[0].face.normal;
// 		// Now compute the axis and amount of rotation to rotate this geometry to match the surface normal
// 		var upVector = new THREE.Vector3(0, 1, 0);
// 		var axis = upVector.cross( surfaceNormal );
// 		var amountToRotate = Math.acos( surfaceNormal.dot( upVector ));
		
// 		//Construct a quaternion from this axis/angle pair
// 		var quat = new THREE.Quaternion();
// 		quat.setFromAxisAngle( axis, -amountToRotate );
		
// 		//Extract the euler angles from the quaternion and rotate the geometry
// 		var euler = new THREE.Euler();
// 		euler.setFromQuaternion( quat );
		
// 		var eulerAsVec = euler.toVector3();
		
// 		//Default rotation order is XYZ
// 		currentNode.mesh.geometry.rotateX(eulerAsVec.x)
// 		currentNode.mesh.geometry.rotateY(eulerAsVec.y);
// 		currentNode.mesh.geometry.rotateZ(eulerAsVec.z);
// 	}
	
// 	for(let currentRoadSegment of roadNetwork) {
// 		for(let currentRoadMesh of currentRoadSegment.meshSet.values()) {
// 			// Set each node's position to the perlin noise value
// 			var nodePos = currentRoadMesh.position;
// 			var perlinNoiseValue = PerlinNoiseMultiOctave(nodePos.x * noiseTerrainScale, 0, nodePos.z * noiseTerrainScale);
// 			currentRoadMesh.position.y += perlinNoiseValue * noiseTerrainIntensity + 0.5;
			
// 			// Rotate each node according to the surface normal of the plane below it
// 			var currentPosition = currentRoadMesh.position;
// 			var ray = new THREE.Raycaster(new THREE.Vector3(currentPosition.x, currentPosition.y - 1, currentPosition.z), new THREE.Vector3(0, -1, 0), 0.1, 100);
// 			var groundIntersections = ray.intersectObject(groundPlaneMesh, false);
			
// 			if(typeof groundIntersections[0] != "undefined") {
// 				// Use the first intersection we get. Note, we assume that the geometry intersects with the plane (keep the plane sufficiently large)
// 				var surfaceNormal = groundIntersections[0].face.normal;
// 				// Now compute the axis and amount of rotation to rotate this geometry to match the surface normal
// 				var upVector = new THREE.Vector3(0, 1, 0);
// 				var axis = upVector.cross( surfaceNormal );
// 				var amountToRotate = Math.acos( surfaceNormal.dot( upVector ));
				
// 				//Construct a quaternion from this axis/angle pair
// 				var quat = new THREE.Quaternion();
// 				quat.setFromAxisAngle( axis, -amountToRotate );
				
// 				//Extract the euler angles from the quaternion and rotate the geometry
// 				var euler = new THREE.Euler();
// 				euler.setFromQuaternion( quat );
				
// 				var eulerAsVec = euler.toVector3();
				
// 				//Default rotation order is XYZ
// 				currentRoadMesh.geometry.rotateX(eulerAsVec.x)
// 				currentRoadMesh.geometry.rotateY(eulerAsVec.y);
// 				currentRoadMesh.geometry.rotateZ(eulerAsVec.z);
// 			}
			
			
// 		}
// 	}
// }

function addTerrainToScene(framework, width, length) {
	//Add the ground plane
	var planeGeometry = new THREE.PlaneGeometry(width, length, 1, 1);
	
	var planeMaterial = new THREE.MeshPhysicalMaterial( {color: 0x0A290A/*0x778899*/, side: THREE.DoubleSide} );
	planeMaterial.roughness = 1;
	planeMaterial.metalness = 0;
	
	//Apply perlin noise to each vertex of the plane
	var planeVertices = planeGeometry.vertices;
	planeGeometry.dynamic = true;
	
	// for(var i = 0; i < planeVertices.length; i++) {
	// 	var perlinNoiseValue = PerlinNoiseMultiOctave(planeVertices[i].x * noiseTerrainScale, 0, planeVertices[i].y * noiseTerrainScale);
	// 	// planeVertices[i].z += perlinNoiseValue * noiseTerrainIntensity;
	// }
	
	//Set the vertices
	planeGeometry.vertices = planeVertices;
	planeGeometry.verticeNeedUpdate = true;
	
	//Recompute the normals
	planeGeometry.computeFaceNormals();
	planeGeometry.computeVertexNormals();
	
	var planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
	planeMesh.rotateX(0.5 * Math.PI);
	// planeMesh.position.set(0, 0, 0);
	planeMesh.receiveShadow = true;
	
	framework.scene.add(planeMesh);
	return planeMesh;
}

// called on frame updates
function onUpdate(framework) {
	// console.log(framework.camera.position);
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
