
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Buildings from './shape.js'
import Shape from './shape.js'

var buildings; // object
var totalGeo = new THREE.Geometry(); // all geometry
var materials = []; // all materials
var town; // mesh of all boxes

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
  camera.position.set(3,3,3);
  camera.lookAt(new THREE.Vector3(0,0,0));

  buildings = new Buildings(scene);
  buildings.doIterations();
  build(buildings);

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
  gui.add(buildings, 'iterations', 0, 20).step(1).onChange(function(newVal) {
    buildings.clear(); // clear shape array
    buildings.doIterations(); // populate Shape array
    build(buildings); // draw shapes
  });
  gui.addColor(buildings, 'color').onChange(function(newVal) {
    build(buildings);
  });
}

function makeGeometry(shapes) {
  console.log(shapes);
    for (var i = 0; i < shapes.length; i ++) {
      var geometry = new THREE.BoxGeometry(1,1,1);
      geometry.scale(shapes[i].scale.x, shapes[i].scale.y, shapes[i].scale.z);
      shapes[i].color = (Math.random()*0xFFFFFF<<0);
      var mat = new THREE.MeshLambertMaterial( {color: shapes[i].color, emissive: 0x111111} )
      for (var j = 0; j < 6; j++) {
        materials.push(mat);
      }
      
      var geo = new THREE.Mesh(geometry, mat);

      //Orient the flower to the turtle's current direction
      var quat = new THREE.Quaternion();
      quat.setFromUnitVectors(new THREE.Vector3(0,1,0), shapes[i].rot);
      var mat4 = new THREE.Matrix4();
      mat4.makeRotationFromQuaternion(quat);
      geometry.applyMatrix(mat4);

      //Move the flower so its base rests at the turtle's current position
      var mat5 = new THREE.Matrix4();
      mat5.makeTranslation(shapes[i].pos.x, shapes[i].pos.y, shapes[i].pos.z);
      geometry.applyMatrix(mat5);

      totalGeo.merge(geo.geometry, geo.matrix, i);
    }
  }

function build(buildings) {
  // console.log(buildings.scene);

  buildings.scene.remove(totalGeo); // remove mesh
  totalGeo.dispose(); // remove geometry
  totalGeo = new THREE.Geometry(); // create fresh geometry
  materials = []; // remove materials
  makeGeometry(buildings.shapes); // add to one geo
  town = new THREE.Mesh(totalGeo, new THREE.MultiMaterial( materials ));
  buildings.scene.add(town); // draw one geo
}

// called on frame updates
function onUpdate(framework) {  
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
