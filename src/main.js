
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Buildings from './shape.js'
import Shape from './shape.js'

var buildings;

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
  camera.position.set(40, 0, 0);
  camera.lookAt(new THREE.Vector3(0,0,0));

    //   // set skybox
    // var loader = new THREE.CubeTextureLoader();
    // var urlPrefix = 'images/skymap/';

    // var skymap = new THREE.CubeTextureLoader().load([
    //     urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
    //     urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
    //     urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    // ] );

    // scene.background = skymap;

  buildings = new Buildings(scene);
 
  build(buildings, buildings.iterations);

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
  gui.add(buildings, 'iterations', 0, 20).step(1).onChange(function(newVal) {
    clearScene(buildings);
    build(buildings, newVal);
  });
  gui.addColor(buildings, 'color').onChange(function(newVal) {
    clearScene(buildings);
    buildings.makeGeometry(buildings.shapes);
  });
}

function clearScene(buildings) {
  var obj;
  for( var i = buildings.scene.children.length - 1; i > 3; i--) {
      obj = buildings.scene.children[i];
      buildings.scene.remove(obj);
  }
}

function build(buildings, iterations) {
    var shapes = buildings.doIterations(iterations);
    buildings.clear();
    //turtle = new Turtle(turtle.scene);
    buildings.makeGeometry(shapes);
    // console.log(buildings);
}

// called on frame updates
function onUpdate(framework) {  
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
