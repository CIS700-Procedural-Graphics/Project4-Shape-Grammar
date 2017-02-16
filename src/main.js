
const THREE = require('three') // older modules are imported like this. You shouldn't have to worry about this much
const OBJLoader = require('three-obj-loader')(THREE)
import Framework from './framework'
import {Shape} from './lsystem.js'
import Lsystem from './lsystem.js'

var shapeSet;
//initialize obj loading before anything, or else multithreading causes issues
var typeToObjMap = initializeMap();

/*
var Sliders = function() {
  this.anglefactor = 1.0;
};
var sliders = new Sliders();
*/

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // initialize a simple box and material
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.set(0xffffff);
  //directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);

  // set camera position
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // initialize LSystem and a Turtle to draw
  shapeSet = new Set();

  var building = new Shape('A');
  building.position = new THREE.Vector3(0, 0, 0);
  building.rotation = new THREE.Vector3(0, 0, 0);
  building.scale = new THREE.Vector3(7, 15, 5);
  building.geom_type = 'Apartment';
  shapeSet.add(building);
  
  var lsys = new Lsystem(shapeSet);
  shapeSet = lsys.doIterations(3);

  //parse the shape set and adds to scene
  parseShapeSet(scene);

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  /*
  gui.add(lsys, 'axiom').onChange(function(newVal) {
    lsys.UpdateAxiom(newVal);
    doLsystem(lsys, lsys.iterations, turtle, sliders.anglefactor);
  });

  gui.add(lsys, 'iterations', 0, 5).step(1).onChange(function(newVal) {
    clearScene(turtle);
    doLsystem(lsys, newVal, turtle, sliders.anglefactor);
  });

  gui.add(sliders, 'anglefactor', 0.5, 1.5).step(0.05).onChange(function(newVal) {
    clearScene(turtle);
    doLsystem(lsys, lsys.iterations, turtle, sliders.anglefactor);
  });
  */
}

/*
// clears the scene by removing all geometries added by turtle.js
function clearScene(turtle) {
  var obj;
  for( var i = turtle.scene.children.length - 1; i > 2; i--) {
      obj = turtle.scene.children[i];
      turtle.scene.remove(obj);
  }
}

function doLsystem(lsystem, iterations, turtle, anglefactor) {
    var result = lsystem.doIterations(iterations);
    turtle.clear();
    turtle = new Turtle(turtle.scene, iterations, anglefactor);
    turtle.renderSymbols(result);
}
*/

function initializeMap() {
  var tempMap = new Map();
  var objLoader = new THREE.OBJLoader();
  objLoader.load('/geo/ApartmentBaseSide.obj', function(obj) { typeToObjMap.set('ApartmentBaseSide', obj.children[0].geometry) });
  objLoader.load('/geo/ApartmentBaseCorner.obj', function(obj) { typeToObjMap.set('ApartmentBaseCorner', obj.children[0].geometry) });
  objLoader.load('/geo/ApartmentFloorSide1.obj', function(obj) { tempMap.set('ApartmentFloorSide1', obj.children[0].geometry); });
  objLoader.load('/geo/ApartmentFloorCorner1.obj', function(obj) { tempMap.set('ApartmentFloorCorner1', obj.children[0].geometry); });
  objLoader.load('/geo/ApartmentFloorSide2.obj', function(obj) { tempMap.set('ApartmentFloorSide2', obj.children[0].geometry); });
  objLoader.load('/geo/ApartmentFloorCorner2.obj', function(obj) { tempMap.set('ApartmentFloorCorner2', obj.children[0].geometry); });
  objLoader.load('/geo/ApartmentRoofSide.obj', function(obj) { typeToObjMap.set('ApartmentRoofSide', obj.children[0].geometry) });
  objLoader.load('/geo/ApartmentRoofCorner.obj', function(obj) { typeToObjMap.set('ApartmentRoofCorner', obj.children[0].geometry) });

  objLoader.load('/geo/SkyscraperSide.obj', function(obj) { typeToObjMap.set('SkyscraperSide', obj.children[0].geometry) });
  objLoader.load('/geo/SkyscraperCorner.obj', function(obj) { typeToObjMap.set('SkyscraperCorner', obj.children[0].geometry) });
  objLoader.load('/geo/SkyscraperRoof.obj', function(obj) { typeToObjMap.set('SkyscraperRoof', obj.children[0].geometry) });

  return tempMap;
}

function parseShapeSet(scene) {

  var material = new THREE.MeshLambertMaterial({color: 0xffffff, wireframe: false});
  //var singleGeometry = new THREE.Geometry();

  for (var shape of shapeSet.values()) {

    var box;
    if (typeof typeToObjMap.get(shape.geom_type) !== "undefined") {
      box = typeToObjMap.get(shape.geom_type);
    }
    else {
      box = new THREE.BoxGeometry(1, 1, 1);
    }
    var boxMesh = new THREE.Mesh(box, material);

    //apply scale
    var mat4 = new THREE.Matrix4();
    mat4.makeScale(shape.scale.x, shape.scale.y, shape.scale.z);
    boxMesh.applyMatrix(mat4);

    //apply rotation
    if (shape.rotation.x != 0) {
        var q = new THREE.Quaternion();
        //forward rotation is not affected by angle factor, rotation about the trunk
        q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), shape.rotation.x * Math.PI/180.0);
        var mat5 = new THREE.Matrix4();
        mat5.makeRotationFromQuaternion(q);
        boxMesh.applyMatrix(mat5);
    }
    if (shape.rotation.y != 0) {
        var q = new THREE.Quaternion();
        //up rotation is not affected by angle factor, main trunk curve
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), shape.rotation.y * Math.PI/180.0);
        var mat5 = new THREE.Matrix4();
        mat5.makeRotationFromQuaternion(q);
        boxMesh.applyMatrix(mat5);
    }
    if (shape.rotation.z != 0) {
        var q = new THREE.Quaternion();
        q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), shape.rotation.z * Math.PI/180.0);
        var mat5 = new THREE.Matrix4();
        mat5.makeRotationFromQuaternion(q);
        boxMesh.applyMatrix(mat5);
    }

    //apply translation
    var mat6 = new THREE.Matrix4();
    mat6.makeTranslation(shape.position.x, shape.position.y, shape.position.z);
    boxMesh.applyMatrix(mat6);
    scene.add(boxMesh);
    //singleGeometry.merge(boxMesh.geometry, boxMesh.matrix);
  }
  
  //var mesh = new THREE.Mesh(singleGeometry, material);
  //scene.add(mesh);

}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
