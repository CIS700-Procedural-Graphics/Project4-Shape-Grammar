
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Building from './shape.js'
import Shape from './shape.js'
import Layout from './block.js'
import Block from './block.js'

var sx = 0.5; var sz = 0.5;
var roadWidth = 0.5;
var scene;
var building; // object
var layout;
var totalGeo = new THREE.Geometry(); // all geometry
var materials = []; // all materials
var town; // mesh of all boxes

// called after the scene loads
function onLoad(framework) {
  scene = framework.scene;
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
  camera.position.set(15,15,15);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // ground
  var geometry = new THREE.PlaneGeometry( 10,10 );
  geometry.rotateX(Math.PI/2);
  geometry.translate(5,-0.5,5);
  var material = new THREE.MeshBasicMaterial( {color: 0xd3d3d3, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  scene.add( plane );

  // create town with buildings
  layout = new Layout(scene);
  layout.doIterations();
  cityPlan(layout);
}

// add shapes into total geometry
function build(shapes) {
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

// draw one building
function build(shapes) {
  //building.scene.remove(totalGeo); // remove mesh
  //totalGeo.dispose(); // remove geometry
  //totalGeo = new THREE.Geometry(); // create fresh geometry
  //materials = []; // remove materials
  makeGeometry(building.shapes); // add to one geo
  }

// construction 
function layoutBlock(block, s) {
  
  var rot = new THREE.Vector3(0,0,0);
  var scale = new THREE.Vector3(sx,s,sz);
  // shrink points to fit within block
  var scaledP = [];
  scaledP.push(block.p[0].clone().add(block.center.clone().sub(block.p[0])));
  scaledP.push(block.p[1].clone().add(block.center.clone().sub(block.p[1])));
  scaledP.push(block.p[2].clone().add(block.center.clone().sub(block.p[2])));
  scaledP.push(block.p[3].clone().add(block.center.clone().sub(block.p[3])));

  // each side of the quadrilateral block
  for (var i = 0; i < 4; i++) {
    var dir = scaledP[(i+1)%4].clone().sub(scaledP[i]);
    var len = dir.length();
    dir.normalize();
    var pos = scaledP[i].clone().add(dir);
    // number of houses on a block edge
    for (var j = 1; j < len; j++) {
      pos.add(dir);
      building = new Building(scene, pos, rot, scale);
      building.doIterations();
      build(building.shapes);
    }
  }
}

// construct entire city
function cityPlan(layout) {
  console.log(layout.blocks);
  for (var i = 0; i < layout.blocks.length; i++) {
    var x = Math.floor(layout.blocks[i].p[0].x);
    var y = Math.floor(layout.blocks[i].p[0].y);
    layoutBlock(layout.blocks[i], layout.map[x][y]);
  }
  town = new THREE.Mesh(totalGeo, new THREE.MultiMaterial( materials ));
  layout.scene.add(town); // draw one geo
}

// called on frame updates
function onUpdate(framework) {  
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
