
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

  // set camera position
  camera.position.set(0, 0, 10);
  camera.lookAt(new THREE.Vector3(0,0,0));

  ////// gui
  
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });


  //generate!
  var building = new Building(
  				'test', /* style */
  				new THREE.Vector3(0,0,0), /*center*/
  				new THREE.Vector3(0,0,1), /*orientation*/
  				10, /*startHeight in floors*/
  				6, /*startWidth in wall units */
  				4, /*startDepth*/
  				scene);
  				
		var geometry = new THREE.PlaneGeometry(5.0, 5.0, 5, 5);
		var material = new THREE.MeshBasicMaterial( {color: 0x888811} );
		var mesh = new THREE.Mesh( geometry, material );		
		scene.add(mesh);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
