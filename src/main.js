
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import ShapeSystem, {stringToLinkedList, linkedListToString, replaceNode} from './shapegrammar.js'

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
  scene.background = new THREE.Color('skyblue');

  // set camera position
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));

  var geometry = new THREE.PlaneGeometry( 300, 300 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );

  var xAxis = new THREE.Vector3(1,0,0);
  var yAxis = new THREE.Vector3(0,1,0);
  var zAxis = new THREE.Vector3(0,0,1);
  plane.rotateOnAxis(xAxis, 1.5708);
  console.log(plane.position);
  scene.add( plane );

  var sys = new ShapeSystem(scene);
  sys.doIterations(2);

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
}

function doLsystem(lsystem, iterations, turtle) {
    var result = lsystem.doIterations(iterations);
    turtle.clear();
    turtle = new Turtle(turtle.scene);
    turtle.renderSymbols(result);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
