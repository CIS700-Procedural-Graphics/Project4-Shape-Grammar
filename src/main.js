
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import LSystem from './lsystem.js'
import Turtle from './turtle.js'
import {PlantLSystem, MainCharacter, CactusCharacter, WillowCharacter}  from './plants.js'

var turtle;

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
  camera.position.set(2, 3, 4);
  camera.lookAt(new THREE.Vector3(0,2,0));


  var UserSettings = 
  {
    iterations : 5,
    willow : null,
    main : null,
    cactus : null,
    rebuild : function() { RebuildTrees(scene, UserSettings) }
  }

  // // initialize LSystem and a Turtle to draw
  // var lsys = new Lsystem();
  // turtle = new Turtle(scene);

  gui.add(UserSettings, 'rebuild', 0, 180);
  // gui.add(lsys, 'axiom').onChange(function(newVal) {
  //   lsys.UpdateAxiom(newVal);
  //   doLsystem(lsys, lsys.iterations, turtle);
  // });

  gui.add(UserSettings, 'iterations', 0, 8).step(1).onChange(function(newVal) {
    // clearScene(turtle);
    // doLsystem(lsys, newVal, turtle);
    RebuildTrees(scene, UserSettings);
  });

  // var lSystem = new LSystem("FX", "", 10);
  // lSystem.expand();

  var lSystem = new MainCharacter(2234, 5);
  var expandedChain = lSystem.expand();

  var mesh = lSystem.generateMesh();
  mesh.scale.set(.3, .3, .3);
  scene.add(mesh);

  var cactus = new CactusCharacter(6565, 6);
  cactus.expand();
  var cactusMesh = cactus.generateMesh();
  cactusMesh.position.set(2, 0, 0);
  cactusMesh.scale.set(.2, .2, .2);
  scene.add(cactusMesh);

  var willow = new WillowCharacter(2135, 5);
  willow.expand();
  var willowMesh = willow.generateMesh();
  willowMesh.position.set(-2, 0, 0);
  willowMesh.scale.set(.2, .2, .2);
  scene.add(willowMesh);

  UserSettings.willow = willowMesh;
  UserSettings.main = mesh;
  UserSettings.cactus = cactusMesh;
}

function RebuildTrees(scene, UserSettings)
{
  scene.remove(UserSettings.willow);
  scene.remove(UserSettings.main);
  scene.remove(UserSettings.cactus);

  var lSystem = new MainCharacter(performance.now(), UserSettings.iterations);
  lSystem.expand();
  var mesh = lSystem.generateMesh();
  mesh.scale.set(.3, .3, .3);
  scene.add(mesh);

  var cactus = new CactusCharacter(performance.now(), UserSettings.iterations);
  cactus.expand();
  var cactusMesh = cactus.generateMesh();
  cactusMesh.position.set(2, 0, 0);
  cactusMesh.scale.set(.2, .2, .2);
  scene.add(cactusMesh);

  var willow = new WillowCharacter(performance.now(), UserSettings.iterations);
  willow.expand();
  var willowMesh = willow.generateMesh();
  willowMesh.position.set(-2, 0, 0);
  willowMesh.scale.set(.2, .2, .2);
  scene.add(willowMesh);


  UserSettings.willow = willowMesh;
  UserSettings.main = mesh;
  UserSettings.cactus = cactusMesh;

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
    var result = lsystem.DoIterations(iterations);
    turtle.clear();
    turtle = new Turtle(turtle.scene);
    turtle.renderSymbols(result);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
