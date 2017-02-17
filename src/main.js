
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
//import Lsystem, {LinkedListToString} from './lsystem.js'
import Turtle from './turtle.js'
const OBJLoader = require('three-obj-loader')(THREE)

//global scope turtle
var turtle;

var it = function(){
    this.RunGeneration = function(){
        turtle.RunGeneration();
    }
}


// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

    //initializing the turtle
    turtle = new Turtle(framework.scene, framework.renderer);
    turtle.init();   
    
  // initialize a simple box and material
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);

  // set camera position
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
    
    var kaipan = new it();
    gui.add(kaipan, 'RunGeneration').onclick;
    
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
