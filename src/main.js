
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import GrammarSystem from './shapeGrammar.js'
import {getNoise} from './noise.js'

// the shape grammar
var city;
var iterations = 0;
var animPlayed = false;

var lastTime = Date.now();

var pic = THREE.ImageUtils.loadTexture('./resources/denethor.jpg');

var settings = {
  volume: 0.5
};

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
    sound.setVolume(0.0);
    sound.play();
  }); 


  renderer.shadowMapEnabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  //renderer.shadowMapSoft = true;
  renderer.shadowCameraNear = 1;
  renderer.shadowCameraFar = 50;
  //renderer.shadowCameraFov = 50;
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(3, 2, 2);
  directionalLight.position.multiplyScalar(10);
  directionalLight.castShadow = true;
  //directionalLight.shadowCameraVisible = true;
  directionalLight.shadow.mapSize.width = 2048;  
  directionalLight.shadow.mapSize.height = 2048; 
  directionalLight.shadowCameraBottom = -25;
  directionalLight.shadowCameraTop = 25;
  directionalLight.shadowCameraLeft = -25;
  directionalLight.shadowCameraRight = 25;
  directionalLight.shadow.camera.near = 0.5;      
  directionalLight.shadow.camera.far = 50      


  scene.add(directionalLight);


  var helper = new THREE.CameraHelper( directionalLight.shadow.camera );
  //scene.add( helper );
  var hLight = new THREE.HemisphereLight(0xeef5ff, 0x010120, 0.2);
  scene.add(hLight);

  // edit params and listen to changes like this
  // more information here: https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  var obj = { Iterate:function(){ city.iterateGrammar(); iterations++;},
              Clear:function(){ city.clearIterations(); iterations = 0; animPlayed = false;} };

  gui.add(obj,'Iterate');
  gui.add(obj,'Clear');
  gui.add(settings, 'volume', 0.0, 1.0).onChange(function(newVal) {
    sound.setVolume(newVal);
  });
}

function makeTerrain(scene) {
  var planeGeo = new THREE.PlaneGeometry(30, 30, 40, 40);
  var planeMat = new THREE.MeshPhongMaterial( {
    side: THREE.DoubleSide,
    color: 0xaaaaaa
  });
  planeGeo.applyMatrix( new THREE.Matrix4().makeRotationX(-Math.PI / 2.0));

  var verts = planeGeo.vertices;
  for (var i = 0; i < verts.length; i++) {
    var u = (verts[i].x - 15.0) / -30.0;
    var v = (verts[i].z - 15.0) / -30.0;
    var bv2 = bias(0.4, v);
    var bv = bias(0.20 + 0.05 * getNoise(u, v, 6.0), gain(0.25 + 0.15 * getNoise(u, v, 6.0), v));
    verts[i].y += bv2  * getNoise(u, v, 16.0) + bv2 * 2 * getNoise(u, v, 8.0) - 0.4 + 15.0 * bv + 0.4;
    verts[i].z += 0.2 * getNoise(u, gain(0.40, v), 16.0);

  }

  planeGeo.verticesNeedUpdate = true;
  planeGeo.computeFaceNormals();
  planeGeo.computeVertexNormals();
  planeGeo.normalsNeedUpdate = true;

  var plane = new THREE.Mesh(planeGeo, planeMat);
  plane.castShadow = true;
  plane.receiveShadow = true;
  scene.add(plane);
}

// called on frame updates
function onUpdate(framework) {
  var denethor = framework.scene.getObjectByName("unfortunateSteward"); 
  var t = Date.now();
  var dt = (t - lastTime) / 1000.0;
  lastTime = t;
  if (denethor !== undefined) {
    // run denethor off the cliff
    var vel = denethor.userdata.v;
    denethor.position.x = dt * vel.x + denethor.position.x;
    denethor.position.y = dt * vel.y + denethor.position.y;
    denethor.position.z = dt * vel.z + denethor.position.z;
    if (denethor.position.z > 8.1) {
      denethor.userdata.v.y -= 1.1 * dt;
    }

    if (denethor.position.y <= 0) {
      framework.scene.remove(denethor);
      console.log("plonk");
    }
  } else if (iterations >= 4 && !animPlayed) {
    // make a burning denethor
    var geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    geo.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0.1, 0));
    var mat = new THREE.MeshBasicMaterial({map: pic});
    denethor = new THREE.Mesh(geo, mat);
    denethor.name = "unfortunateSteward";
    denethor.userdata = {v: new THREE.Vector3(0, 0, 1)};
    denethor.position.y = 9.0;
    denethor.position.z = 1.0;
    //denethor.material.color.setHex(0xff8800);
    denethor.castShadow = true;
    framework.scene.add(denethor);
    console.log("AAAAAAAAAaaaaaaaaaa~....");
    animPlayed = true;
  }
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);