
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import ShapeSystem from './shapesystem'
import Shape from './shape.js'


// Materials
var lambertWhite = new THREE.MeshLambertMaterial( {color: 0xffffff} );

// Geometry
var boxGeo = new THREE.BoxGeometry( 1, 1, 1 );

// Mesh
var cubeMesh = new THREE.Mesh( boxGeo, lambertWhite );

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
  camera.position.set(50, 100, 200);
  camera.lookAt(new THREE.Vector3(0,0,0));

  var axiom = [new Shape()];
  var ss = new ShapeSystem(axiom, scene);

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  gui.add(ss, 'iterate');

  var geometry = new THREE.PlaneGeometry( 20, 20, 32 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.rotateX(Math.PI / 2.0);
  scene.add( plane );

  // ss.axiom[0].subdivide(0);
  ss.traverse(scene);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
