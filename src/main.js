const THREE = require('three');
import Framework from './framework'

import * as Building from './building.js'

var UserSettings = 
{
  iterations : 5
}

function onLoad(framework) 
{
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

  var profile = new Building.Profile();
  profile.addPoint(1.0, 0.0);
  profile.addPoint(1.0, 1.0);

  profile.addPoint(.9, 1.0);
  profile.addPoint(.9, 1.1);
  profile.addPoint(.8, 1.1);
  profile.addPoint(.8, 1.0);

  profile.addPoint(0.5, 1.0);
  profile.addPoint(0.5, 2.0);
  profile.addPoint(0.0, 2.0);

  var lot = new Building.BuildingLot();
  var subdivs = 15;
  for(var i = 0; i < subdivs; i++)
  {
    var a = i * Math.PI * 2 / subdivs;
    lot.addPoint(Math.cos(a), Math.sin(a));
  }
  // lot.addPoint(1.0, 1.0);
  // lot.addPoint(1.0, -1.0);
  // lot.addPoint(-1.0, -1.0);
  // lot.addPoint(-1.0, 1.0);
  // lot.addPoint(.5, 1.5);

  var shape = new Building.MassShape();
  var mesh = shape.generateMesh(lot, profile);

  scene.add(mesh);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
