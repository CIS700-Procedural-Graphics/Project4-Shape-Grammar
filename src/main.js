
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Building from './shape.js'
import Shape from './shape.js'
import Layout from './block.js'
import Block from './block.js'
import {popMap} from './perlin.js'

var sx = 0.5; var sz = 0.5;
var roadWidth = 0.25;
var scene;
var building; // object
var layout;
var totalGeo = new THREE.Geometry(); // all geometry
var materials = []; // all materials
var town; // mesh of all boxes
var cityX = 10; var cityZ = 10;
var mat = {
  uniforms: {
    ground: {value: popMap(cityX, cityZ) }
    },
  vertexShader: require('./shaders/ground-vert.glsl'),
  fragmentShader: require('./shaders/ground-frag.glsl')
};

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
    geo.applyMatrix(mat4);

    //Move the flower so its base rests at the turtle's current position
    var mat5 = new THREE.Matrix4();
    mat5.makeTranslation(shapes[i].pos.x, shapes[i].pos.y, shapes[i].pos.z);
    geo.applyMatrix(mat5);

    totalGeo.merge(geo.geometry, geo.matrix, i);
  }
}

// construction 
function layoutBlock(block) {
  
  var rot = new THREE.Vector3();
  var scale = new THREE.Vector3();
  // shrink points to fit within block
  var scaledP = [];
  for (var j = 0; j < 4; j++) {
    scaledP.push(block.p[j].clone());
    var shrink = block.center.clone().sub(scaledP[j]);
    scaledP[j].add(shrink.multiplyScalar(roadWidth));
  }

  // each side of the quadrilateral block
  for (var i = 0; i < 4; i++) {
    var dir = scaledP[(i+1)%4].clone().sub(scaledP[i]);
    rot.y = Math.atan2(dir.z, dir.x);
    var len = dir.length();
    var pos;
    // number of houses on a block edge
    for (var j = 1; j < len; j++) {
      pos = scaledP[i].clone().lerp(scaledP[(i+1)%4],j/len);

      var x = Math.floor(pos.x);
      var y = Math.floor(pos.z);
      scale = new THREE.Vector3(sx,mat.uniforms['ground'].value[x][y],sz);
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
    
    layoutBlock(layout.blocks[i]);
  }
  town = new THREE.Mesh(totalGeo, new THREE.MultiMaterial( materials ));
  layout.scene.add(town); // draw one geo
}

// called on frame updates
function onUpdate(framework) {  
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
