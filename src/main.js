
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import GrammarSystem from './shapeGrammar.js'

// the shape grammar
var city;

// gradients for improved perlin noise
var gradients = [new THREE.Vector2(1.0, 0), new THREE.Vector2(-1.0, 0),
      new THREE.Vector2(0, 1.0), new THREE.Vector2(0, -1.0),
      new THREE.Vector2(0.7071, 0.7071), new THREE.Vector2(-0.7071, 0.7071),
      new THREE.Vector2(0.7071, -0.7071), new THREE.Vector2(-0.7071, -0.7071)];

// hash table for improved perlin noise
var pHash = [151,160,137,91,90,15,
   131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
   190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
   88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
   77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
   102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
   135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
   5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
   223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
   129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
   251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
   49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
   138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];


function lerp(a, b, t) {
    return (t * b + (1.0 - t) * a);
}

//2D perlin noise
function getNoise(u, v, samples) {
    var xs = u * samples;
    var ys = v * samples;

    var xlb = Math.floor(xs);
    var ylb = Math.floor(ys);

    var i = pHash[pHash[xlb + pHash[ylb]]] / 256.0;
    var g = gradients[Math.floor(i * 8.0)];
    var p = new THREE.Vector2(xs - xlb, ys - ylb);
    var dll = g.dot(p);

    i = pHash[pHash[xlb + 1 + pHash[ylb]]] / 256.0;
    g = gradients[Math.floor(i * 8.0)];
    p = new THREE.Vector2(xs - xlb - 1.0, ys - ylb);
    var dlr = g.dot(p);

    i = pHash[pHash[xlb + pHash[ylb + 1]]] / 256.0;
    g = gradients[Math.floor(i * 8.0)];
    p = new THREE.Vector2(xs - xlb, ys - ylb - 1.0);
    var dul = g.dot(p);


    i = pHash[pHash[xlb + 1 + pHash[ylb + 1]]] / 256.0;
    g = gradients[Math.floor(i * 8.0)];
    p = new THREE.Vector2(xs - xlb - 1.0, ys - ylb - 1.0);
    //console.log(g);
    var dur = g.dot(p);


    return lerp(lerp(dll, dlr, xs - xlb), lerp(dul, dur, xs - xlb), ys - ylb);
}

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