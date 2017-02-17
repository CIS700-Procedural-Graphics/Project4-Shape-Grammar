
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
//import Lsystem, {LinkedListToString} from './lsystem.js'
//import Turtle from './turtle.js'
import Building from './building.js'

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

  var light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );

  // set camera position
  camera.position.set(200, 400, 500);
  camera.lookAt(new THREE.Vector3(0,0,0));

  ////// gui
  
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

	var obj = { generate:function(){ makeBuildings(framework) }};

	gui.add(obj,'generate');

  //user-changeable seed
  //hack into scene
  scene.stauffUserSeed = 37;
  gui.add( scene, 'stauffUserSeed', 0, 9999).name('user seed').step(1);

  makeBuildings(framework);

}

function getRandom(seed){
   //random number
	var date = new Date();
	var seed1 = seed + (date.getTime() % 13);
	var seed2 = seed - (date.getTime() % 17);
   var vec = new THREE.Vector2(seed1,seed2);
   return Math.abs( ( Math.sin( vec.dot( new THREE.Vector2(12.9898,78.233))) * 43758.5453 ) % 1 );
}

function makeBuildings(framework){
  //clear scene
  var obj;
  for( var i = framework.scene.children.length - 1; i > 3; i--) {
      obj = framework.scene.children[i];
      framework.scene.remove(obj);
  }

  //quick regular grid

  var xbound = 100;
  var zbound = 100;
  var xstep = 50;
  var zstep = 50;
  for( var xoff = -xbound; xoff < xbound; xoff += xstep ){
   for( var zoff = -zbound; zoff < zbound; zoff += zstep ){
	  var center = new THREE.Vector3( xoff, 0, zoff);
	  var heightScale = 1.1 - ( Math.sqrt( xoff * xoff + zoff * zoff ) / Math.sqrt( xbound * xbound + zbound * zbound ) );
	  var height = Math.ceil(heightScale * 30 /*floors*/) + getRandom( framework.scene.stauffUserSeed ) * 4;
	  var diff = getRandom( framework.scene.stauffUserSeed ) * 5
	  //generate!
	  var building = new Building(
					'test', /* style */
					center, /*center*/
					new THREE.Vector3(0,0,1), /*orientation*/
					height, /*startHeight in floors*/
					18 - diff, /*startWidth in wall units */
					18 - diff / 2, /*startDepth*/
					framework.scene,
					0 /*recursion depth*/);
	  //hack in a diff random number
	  framework.scene.stauffUserSeed = getRandom( 81 ) * 81;
  
	  //generate and render
	  building.generate();
   }
  }
	//ground plane  				
	var geometry = new THREE.PlaneGeometry(400.0, 400.0, 5, 5);
	var material = new THREE.MeshBasicMaterial( {color: 0x333333} );
	var mesh = new THREE.Mesh( geometry, material );		
	mesh.rotateX( -3.14159 / 2 );
	framework.scene.add(mesh);
	
}
// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
