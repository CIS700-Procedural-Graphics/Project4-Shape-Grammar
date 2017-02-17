
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import RenderEngine from './renderengine'
import CityBuilder from './citybuilder.js'
const OBJLoader = require('three-obj-loader')(THREE)

var re;
var sg;
var cb;

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // initialize a simple box and material
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.25 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);

  var ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  var audio_listener = new THREE.AudioListener();
  var nyc = new THREE.Audio(audio_listener);
  var nyc_loader = new THREE.AudioLoader();
  nyc_loader.load('nyc.mp3', function(buffer) {
    nyc.setBuffer(buffer);
    nyc.setLoop(true);
    nyc.setVolume(0.5);
    nyc.play();
  });


  // set camera position
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  var loader = new THREE.OBJLoader();
  loader.load('tree.obj', function(object) {
    var lambertGreen = new THREE.MeshLambertMaterial({ color: 0x228B22, side: THREE.DoubleSide });
    var tree_geo = object.children[0].geometry;
    tree_geo.computeFaceNormals();
    tree_geo.computeVertexNormals();
    var tree_mesh = new THREE.Mesh(tree_geo, lambertGreen);
    tree_mesh.name = "tree";

    cb = new CityBuilder('UMDP', tree_mesh, 12);
    re = new RenderEngine(scene);
    cb.expand_city();
    re.init_scene();
    re.build_scene(cb.uptown_buildings);
    re.build_scene(cb.midtown_buildings);
    re.build_scene(cb.downtown_buildings);
    re.build_scene(cb.plants);
    re.build_terminal_shapes(cb.terminal_buildings);
  });
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
