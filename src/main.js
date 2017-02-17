
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

  var axiom = new Shape();
  var ss = new ShapeSystem(axiom, boxGeo, cubeMesh);

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  // gui.add(lsys, 'axiom').onChange(function(newVal) {
  //   lsys.updateAxiom(newVal);
  //   doLsystem(lsys, lsys.iterations, turtle);
  // });

  gui.add(ss, 'iteration').onChange(function(newVal) {
    console.log('iterate');
  });


  // var obj = new THREE.Object3D();
  // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
  // var cube = new THREE.Mesh( geometry, material );

  // var a = new THREE.CylinderGeometry( 1, 1, 1);
  // a.position = new THREE.Vector3(0, 0, 5);
  // var cylinder = new THREE.Mesh(a, new THREE.MeshBasicMaterial( {color: 0x0000ff} ) );

  // var mat5 = new THREE.Matrix4();
  //       mat5.makeTranslation(5, 0, 0);
  //       cylinder.applyMatrix(mat5);

  //       cube.add(cylinder);
  // obj.add(cube);
  // scene.add(obj);
  // // scene.add(cylinder);

  // var ballGeo = new THREE.SphereGeometry(10,35,35);
  // var material = new THREE.MeshLambertMaterial(); 
  // var ball = new THREE.Mesh(ballGeo, material);

  // var pendulumGeo = new THREE.CylinderGeometry(1, 1, 50, 16);
  // ball.updateMatrix();
  // pendulumGeo.merge(ball.geometry, ball.matrix);

  // var pendulum = new THREE.Mesh(pendulumGeo, material);
  // scene.add(pendulum);

  var geometry = new THREE.PlaneGeometry( 5, 20, 32 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.rotateX(Math.PI / 2.0);
  scene.add( plane );

  var o = ss.createOningGeometry(new THREE.Vector3(4.0, 1.0, 10.0));
  o.position.set(0.0, 0.5, 0.0);
  o.scale.set(4.0, 1.0, 10.0);

  scene.add(o);

  //scene.add(roof_mesh);
  //ss.traverse(scene);
}

// // clears the scene by removing all geometries added by turtle.js
// function clearScene(turtle) {
//   var obj;
//   for( var i = turtle.scene.children.length - 1; i > 3; i--) {
//       obj = turtle.scene.children[i];
//       turtle.scene.remove(obj);
//   }
// }

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
