
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'


var settings = {
    seed: 1.0,
    resetCamera: function() {},
    newSeed: function(newVal) { settings.seed = Math.random(); },
    size: 5.0,
    split: 0.0
}

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
  camera.position.set(0, -10, 10);
  camera.lookAt(new THREE.Vector3(0,0,0));

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
  gui.add(settings, 'resetCamera').onChange(function() {
      camera.position.set(0, -10, 10);
      camera.lookAt(new THREE.Vector3(0,0,0));
  });
  gui.add(settings, 'newSeed');
  gui.add(settings, 'size', 1, 10);
  gui.add(settings, 'split', 0, 10);

  draw(framework);
}

function draw(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.name = "plane_terrain";
  scene.add( plane );

  var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.name = "plane_popDensity";
  scene.add( plane );

  var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.name = "plane_landValue";
  scene.add( plane );


}

// called on frame updates
function onUpdate(framework) {
    var scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;

    var plane_terrain = scene.getObjectByName("plane_terrain");
    if (plane_terrain !== undefined) {
        plane_terrain.geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
    }

    var plane_popDensity = scene.getObjectByName("plane_popDensity");
    if (plane_popDensity !== undefined) {
        plane_popDensity.geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
        plane_popDensity.position.set(0, 0, -settings.split);
    }

    var plane_landValue = scene.getObjectByName("plane_landValue");
    if (plane_landValue !== undefined) {
        plane_landValue.geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
        plane_landValue.position.set(0, 0, -2 * settings.split);
    }


}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
