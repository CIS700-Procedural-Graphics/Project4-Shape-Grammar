
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
// import Lsystem, {LinkedListToString} from './lsystem.js'
//import Node from ./lsystem.js
import Turtle from './turtle.js'

var turtle;

// var img = [];
// var img1 = [];
// for(var i=0; i<40; i++)
// {
//   img[i]=[];
//   img1[i]=[];
// }

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
  camera.position.set(10, 10, 20);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // initialize LSystem and a Turtle to draw
  //var lsys = new Lsystem();
  turtle = new Turtle(scene);
  turtle.start();
  //console.log(scene);

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
  var update= new GUIoptions();
  gui.add(update,'iterate').onclick;
  // gui.add(update, 'kaipan', 0, 12).step(1).onChange(function(newVal) {
  //
  // });
}

var GUIoptions = function()
{
  //this.kaipan = 0.1;
	this.iterate=function(){
    turtle.renderSymbols();
		};
}

// clears the scene by removing all geometries added by turtle.js
function clearScene(turtle) {
  var obj;
  for( var i = turtle.scene.children.length - 1; i > 3; i--) {
      obj = turtle.scene.children[i];
      turtle.scene.remove(obj);
  }
}

function doLsystem(lsystem, iterations, turtle) {
    // var result = lsystem.doIterations(iterations);
    // turtle.clear();
    // turtle = new Turtle(turtle.scene);
    turtle.renderSymbols(result);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
