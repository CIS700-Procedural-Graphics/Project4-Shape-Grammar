
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Lsystem, {LinkedListToString} from './lsystem.js'
import Turtle from './turtle.js'

// create new feather material 
    var featherMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_color: {value : 0.0 },
    },
    vertexShader: require('./shaders/feather-vert.glsl'),
    fragmentShader: require('./shaders/feather-frag.glsl')
  });

var turtle;
var lMesh; 
var branchAngle = 8.0;
var branching = 1; 

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // set background
  renderer.setClearColor (0xf2caba, 1);

  // initialize a simple box and material
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 2, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);
  // add in an ambient light 
  var light = new THREE.AmbientLight( 0x404040, 2);
  scene.add(light);

  // set camera position
  camera.position.set(10, 5, 10);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // add in ground plane
  var material = new THREE.MeshLambertMaterial( { color: 0xfdfcfc , side: THREE.DoubleSide} );
  var geometry = new THREE.PlaneGeometry( 100, 100, 30 );
  var plane = new THREE.Mesh( geometry, material );
  plane.rotateX(-Math.PI/2);
  // plane.translateZ(-0.5);
  scene.add( plane );

  // load leaf mesh
  // var objLoader = new THREE.OBJLoader();
  // objLoader.load('geo/cube.obj', function(obj) {
  //   var leafGeo = obj.children[0].geometry;
  //   var leafMat = new THREE.MeshLambertMaterial( {color: 0x9ab021} );
  //   var leafMesh = new THREE.Mesh(leafGeo, leafMat);
  //   lMesh = leafMesh;
  //   lMesh.position.set(0,1,0); 
  //   scene.add(lMesh);
  // });

  // initialize LSystem and a Turtle to draw  
  var lsys = new Lsystem();

  turtle = new Turtle(scene, lMesh, branchAngle);

  doLsystem(lsys,1,turtle, scene); 
  // clearScene(turtle);

  // GUI stuff
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

}

// clears the scene by removing all geometries added by turtle.js
function clearScene(turtle) {
  var obj;
  for( var i = turtle.scene.children.length - 1; i > 3; i--) {
      obj = turtle.scene.children[i];
      turtle.scene.remove(obj);
  } 
}

// completes the lsystem
function doLsystem(lsystem, iterations, turtle, scene) {
  var material = new THREE.MeshLambertMaterial( { color: 0x9ab021 } );
    var result = lsystem.doIterations(iterations);
    // turtle.clear();
    // turtle = new Turtle(turtle.scene, lMesh, branchAngle);
    // turtle.renderSymbols(result);

    // HW4 trying to render something
    for (var i = 0; i < result.length; i++) {
      // console.log("loop "  + i + ": "  + result[i]);
      var mesh = new THREE.Mesh( result[i].geom, material );
      mesh.position.set(result[i].pos.x,result[i].pos.y,result[i].pos.z);
      mesh.scale.set(result[i].scale.x, result[i].scale.y, result[i].scale.z);
      scene.add(mesh);
    }
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
