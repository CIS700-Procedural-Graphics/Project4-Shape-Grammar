
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import {Shape} from './lsystem.js'
import Lsystem from './lsystem.js'
//import Lsystem, {linkedListToString} from './lsystem.js'
//import Turtle from './turtle.js'

//var turtle;

/*
var Sliders = function() {
  this.anglefactor = 1.0;
};
var sliders = new Sliders();
*/

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // initialize a simple box and material
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.set(0xFFDAB9);
  //directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);

  // set camera position
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // initialize LSystem and a Turtle to draw
  var shapeSet = new Set();

  var building = new Shape('X');
  building.position = new THREE.Vector3(0, 0, 0);
  building.rotation = new THREE.Vector3(0, 0, 0);
  building.scale = new THREE.Vector3(6, 8, 6);
  shapeSet.add(building);
  console.log(shapeSet.values());

  
  var lsys = new Lsystem(shapeSet, 3);
  shapeSet = lsys.doIterations(3);
  //turtle = new Turtle(scene);


  var singleGeometry = new THREE.Geometry();
  for (var shape of shapeSet.values()) {
    console.log("called");
    var box = new THREE.BoxGeometry(1, 1, 1);
    var boxMesh = new THREE.Mesh(box);

    //apply scale
    var mat4 = new THREE.Matrix4();
    mat4.makeScale(shape.scale.x, shape.scale.y, shape.scale.z);
    boxMesh.applyMatrix(mat4);

    //apply rotation

    //apply translation
    var mat6 = new THREE.Matrix4();
    mat6.makeTranslation(shape.position.x, shape.position.y + (shape.scale.y/2.0), shape.position.z);
    boxMesh.applyMatrix(mat6);

    singleGeometry.merge(boxMesh.geometry, boxMesh.matrix);
  }
  var material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});
  var mesh = new THREE.Mesh(singleGeometry, material);
  scene.add(mesh);


  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  /*
  gui.add(lsys, 'axiom').onChange(function(newVal) {
    lsys.UpdateAxiom(newVal);
    doLsystem(lsys, lsys.iterations, turtle, sliders.anglefactor);
  });

  gui.add(lsys, 'iterations', 0, 5).step(1).onChange(function(newVal) {
    clearScene(turtle);
    doLsystem(lsys, newVal, turtle, sliders.anglefactor);
  });

  gui.add(sliders, 'anglefactor', 0.5, 1.5).step(0.05).onChange(function(newVal) {
    clearScene(turtle);
    doLsystem(lsys, lsys.iterations, turtle, sliders.anglefactor);
  });
  */
}

/*
// clears the scene by removing all geometries added by turtle.js
function clearScene(turtle) {
  var obj;
  for( var i = turtle.scene.children.length - 1; i > 2; i--) {
      obj = turtle.scene.children[i];
      turtle.scene.remove(obj);
  }
}

function doLsystem(lsystem, iterations, turtle, anglefactor) {
    var result = lsystem.doIterations(iterations);
    turtle.clear();
    turtle = new Turtle(turtle.scene, iterations, anglefactor);
    turtle.renderSymbols(result);
}
*/

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
