
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import ShapeGrammar from './shapegrammar.js'
import City from './city.js'

var objLoader = new THREE.OBJLoader();

var geo1;
var geo2;

var voronoi = !true;

// called after the scene loads
function onLoad(framework) {
  
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // Scene set up
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);

  scene.add(directionalLight);

  camera.position.set(1, 1, 5);
  camera.lookAt(new THREE.Vector3(0,0,0));
  camera.updateProjectionMatrix();


  objLoader.load('Build11_obj.obj', function(obj) {
    // LOOK: This function runs after the obj has finished loading
    geo1 = obj.children[0].geometry;
    objLoader.load('Build10_obj.obj', function(obj) {
      // LOOK: This function runs after the obj has finished loading
      geo2 = obj.children[0].geometry;
      var city = new City.City(scene, geo1, geo2);
      city.render(voronoi);
    });
  });

  // Gui variables
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
