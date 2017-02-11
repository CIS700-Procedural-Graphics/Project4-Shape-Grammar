
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Lsystem, {LinkedListToString} from './lsystem.js'
import Turtle from './turtle.js'
//include build/three.min.js
//import * from 'three'
//js/Three.js
//OrbitControls.js



var turtle;

var waterNormals;

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
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));


//WATER
  // waterNormals = new THREE.TextureLoader().load('textures/waternormals.jpg');
  // waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
  //
  // water = new THREE.Water(renderer, camera, scene, {
  //   textureWidth: 512,
  //   textureHeight: 512,
  //   waterNormals: waterNormals,
  //   alpha: 1.0,
  //   sunDirection: directionalLight.position.clone().normalize(),
  //   sunColor: 0xffffff,
  //   waterColor: 0x001e0f,
  //   distortionScale: 50.0
  // });
  //
  // mirrorMesh = new THREE.Mesh(
  //   new THREE.PlaneBufferGeometry(parameters.width * 500, parameters.height * 500),
  //   water.material
  // );
  //
  // mirrorMesh.add(water);
  // mirrorMesh.rotation.x = - Math.PI * 0.5;
  // scene.add(mirrorMesh);


//SKYBOX
  // var cubeMap = new THREE.CubeTexture( [] );
  // cubeMap.format = THREE.RGBFormat;
  // var loader = new THREE.ImageLoader();
  //
  // loader.load( 'textures/skyboxsun25degtest.png', function ( image ) {
  //   var getSide = function ( x, y ) {
  //     var size = 1024;
	// 		var canvas = document.createElement( 'canvas' );
	// 		canvas.width = size;
	// 		canvas.height = size;
	// 		var context = canvas.getContext( '2d' );
	// 		context.drawImage( image, - x * size, - y * size );
	// 		return canvas;
	// 	};
  //   cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
  //   cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
  //   cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
  //   cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
  //   cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
  //   cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
  //   cubeMap.needsUpdate = true;
  // } );
  //
  // var cubeShader = THREE.ShaderLib[ 'cube' ];
  // cubeShader.uniforms[ 'tCube' ].value = cubeMap;
  // var skyBoxMaterial = new THREE.ShaderMaterial( {
  //   fragmentShader: cubeShader.fragmentShader,
  //   vertexShader: cubeShader.vertexShader,
  //   uniforms: cubeShader.uniforms,
  //   depthWrite: false,
  //   side: THREE.BackSide
  // } );
  //
  //
  // var skyBox = new THREE.Mesh(
  //   new THREE.BoxGeometry( 1000000, 1000000, 1000000 ),
  //   skyBoxMaterial
  // );
  //
  // scene.add( skyBox );





  // initialize LSystem and a Turtle to draw
  // var lsys = new Lsystem();
  // turtle = new Turtle(scene);
  //
  // gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
  //   camera.updateProjectionMatrix();
  // });
  //
  // gui.add(lsys, 'axiom').onChange(function(newVal) {
  //   lsys.updateAxiom(newVal);
  //   doLsystem(lsys, lsys.iterations, turtle);
  // });
  //
  // gui.add(lsys, 'iterations', 0, 5).step(1).onChange(function(newVal) {
  //   clearScene(turtle);
  //   doLsystem(lsys, newVal, turtle);
  // });
  //
  // //call toonshader function with new offset
  // //call dolsystem
  //
  // gui.add(lsys, 'randomVal', 0.1, 0.7).onChange(function(newVal) {
  //   //make function in lsystem to change randomval
  //   lsys.updateRandomVal(newVal);
  //   doLsystem(lsys, lsys.iterations, turtle);
  // })
  //
  // gui.add(turtle, 'angle', 10, 80).onChange(function(newVal) {
  //   //make function in lsystem to change randomval
  //   //lsys.updateRandomVal(newVal);
  //   turtle.updateAngle(newVal);
  //   doLsystem(lsys, lsys.iterations, turtle);
  // })
  //
  // gui.add(turtle, 'cylinderWidth', 0.1, 0.6).onChange(function(newVal) {
  //   //make function in lsystem to change randomval
  //   //lsys.updateRandomVal(newVal);
  //   turtle.updateCylinderWidth(newVal);
  //   doLsystem(lsys, lsys.iterations, turtle);
  // })


  //SOMETHING IS UP WITH THE COLOR. HOW DO I INCORPORATE BOTH THE COLOR PICKER AND CHANGING COLOR IN TURTLE
  // var colorChanger = function() {
  //   this.branchColor = "#ffae23"; // CSS string
  //   // this.color1 = [ 0, 128, 255 ]; // RGB array
  //   // this.color2 = [ 0, 128, 255, 0.3 ]; // RGB with alpha
  //   // this.color3 = { h: 350, s: 0.9, v: 0.3 }; // Hue, saturation, value
  //
  //   turtle.updateBranchColor(this.branchColor);
  //   doLsystem(lsys, lsys.iterations, turtle);
  // };
  // var text = new colorChanger();
  // gui.addColor(text, 'branchColor');
  //
  //
  // gui.add(turtle, 'branchColor', 0x00cccc, 0xfff000).onChange(function(newVal) {
  //   turtle.updateBranchColor(newVal);
  //   doLsystem(lsys, lsys.iterations, turtle);
  // })



}//end onload function


// clears the scene by removing all geometries added by turtle.js
function clearScene(turtle) {
  var obj;
  for( var i = turtle.scene.children.length - 1; i > 3; i--) {
      obj = turtle.scene.children[i];
      turtle.scene.remove(obj);
  }
}

function doLsystem(lsystem, iterations, turtle) {
    var result = lsystem.DoIterations(iterations);
    turtle.clear();
    turtle = new Turtle(turtle.scene);
    turtle.renderSymbols(result);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
