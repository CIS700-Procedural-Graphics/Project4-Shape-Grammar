
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import GrammarSystem from './shapeGrammar.js'
import {getNoise} from './noise.js'

// the shape grammar
var city;

// curve helpers for terrain deformation
function bias(b, t) {
    return Math.pow(t, Math.log(b) / Math.log(0.5));
}

function gain(g, t) {

    if(t < 0.5) return bias(t * 2.0, g) / 2.0;
    else return bias(t * 2.0 - 1.0,1.0 - g) / 2.0 + 0.5;
}


// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  scene.fog = new THREE.Fog(0xffffff, 1, 60);
  scene.fog.color.setHSL( 0.55, 0.4, 0.8 );

  // initialize a simple box and material
  var box = new THREE.IcosahedronBufferGeometry(1, 6);

  var mat = new THREE.MeshLambertMaterial();
  var adamCube = new THREE.Mesh(box, mat);

  // set camera position
  camera.position.set(3, 5, 15);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // scene.add(adamCube);
  city = new GrammarSystem(scene);
  city.finalizeGrammar();

  makeTerrain(scene);

  var audioLoader = new THREE.AudioLoader();
  var listener = new THREE.AudioListener();
  var sound = new THREE.Audio(listener);
  camera.add(listener);

  //Load a sound and set it as the Audio object's buffer
  audioLoader.load( 'resources/gondor.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();
  }); 

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);
    scene.add(directionalLight);

  // edit params and listen to changes like this
  // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  var obj = { Iterate:function(){ city.iterateGrammar() },
              Clear:function(){ city.clearIterations()} };

  gui.add(obj,'Iterate');
  gui.add(obj,'Clear');
}

function makeTerrain(scene) {
  var planeGeo = new THREE.PlaneGeometry(30, 30, 40, 40);
  var planeMat = new THREE.MeshPhongMaterial();
  planeGeo.applyMatrix( new THREE.Matrix4().makeRotationX(-Math.PI / 2.0));

  var verts = planeGeo.vertices;
  for (var i = 0; i < verts.length; i++) {
    var u = (verts[i].x - 15.0) / -30.0;
    var v = (verts[i].z - 15.0) / -30.0;
    var bv2 = bias(0.4, v);
    var bv = bias(0.20 + 0.05 * getNoise(u, v, 6.0), gain(0.25 + 0.15 * getNoise(u, v, 6.0), v));
    verts[i].y += bv2  * getNoise(u, v, 16.0) + bv2 * 2 * getNoise(u, v, 8.0) - 0.4 + 15.0 * bv;
    verts[i].z += 0.2 * getNoise(u, gain(0.40, v), 16.0);

  }

  planeGeo.verticesNeedUpdate = true;
  planeGeo.computeFaceNormals();
  planeGeo.computeVertexNormals();
  planeGeo.normalsNeedUpdate = true;

  var plane = new THREE.Mesh(planeGeo, planeMat);
  scene.add(plane);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);