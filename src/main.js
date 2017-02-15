
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
const OBJLoader = require('three-obj-loader')(THREE)
import Framework from './framework'
import Building from './shape.js'
import Shape from './shape.js'
import Layout from './block.js'
import Block from './block.js'
import {popMap} from './perlin.js'

var sx = 0.5; var sz = 0.5;
var cityX = 30; var cityZ = 30;
var treeGeo;
var roofGeo;
var roadWidth = 2;
var scene;
var building; // object
var layout;

// geometries
var totalGeo = new THREE.Geometry(); 
var totalRoad = new THREE.Geometry();
var totalTree = new THREE.Geometry();
var materials = []; // all materials

// meshes
var town; 
var ground;
var trees;

// materials
var green = new THREE.MeshLambertMaterial( {color: 0x003300} );
// var mat = {
//   uniforms: {
//     ground: {value: popMap(cityX, cityZ) }
//     },
//   vertexShader: require('./shaders/ground-vert.glsl'),
//   fragmentShader: require('./shaders/ground-frag.glsl')
// };

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
  camera.position.set(30,30,0);
  camera.lookAt(new THREE.Vector3(15,0,15));

    var loader = new THREE.CubeTextureLoader();
    var urlPrefix = 'images/skymap/';

    var skymap = new THREE.CubeTextureLoader().load([
        urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
        urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
        urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ] );

    scene.background = skymap;

  var objLoader = new THREE.OBJLoader();
    var obj1 = objLoader.load('tree.obj', function(obj1) {
        var obj2 = objLoader.load('roof.obj', function(obj2) {
          treeGeo = obj1.children[0].geometry;
          roofGeo = obj2.children[0].geometry;
          // ground
          var geometry = new THREE.PlaneGeometry( 30,30 );
          geometry.rotateX(Math.PI/2);
          geometry.translate(15,-0.5,15);
          var material = new THREE.MeshBasicMaterial( {color: 0x005500, side: THREE.DoubleSide} );
          var plane = new THREE.Mesh( geometry, material );
          scene.add( plane );

          // create town with buildings
          layout = new Layout(scene);
          layout.doIterations();
          cityPlan(layout);
        });
    });

  
}

// add shapes into total geometry
function build(shapes) {
  for (var i = 0; i < shapes.length; i ++) {
    var geometry;
    if (shapes[i].geo == 1) geometry = new THREE.BoxGeometry(3,3,3);
    else {
      geometry = roofGeo;
    }
    geometry.scale(shapes[i].scale.x, shapes[i].scale.y, shapes[i].scale.z);
    var mat = new THREE.MeshLambertMaterial( {color: shapes[i].color, emissive: 0x111111} )

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

    if (shapes[i].geo == 1) totalGeo.merge(geo.geometry, geo.matrix);
    else layout.scene.add(geo);
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
    var x = block.p[(j+1)%4].clone().sub(block.p[j]).normalize().multiplyScalar(1.5);
    var y = block.p[Math.abs(j-1)%4].clone().sub(block.p[j]).normalize().multiplyScalar(1.5);
    scaledP[j].add(x).add(y);
  }

  // each side of the quadrilateral block
  for (var i = 0; i < 4; i++) {
    var dir = scaledP[(i+1)%4].clone().sub(scaledP[i]);
    rot.y = Math.atan2(dir.z, dir.x);
    var len = dir.length()/2;
    var pos;
    var roadPos;
    // number of houses on a block edge
    for (var j = 1; j < len; j++) {
      pos = scaledP[i].clone().lerp(scaledP[(i+1)%4],j/len);
      var x = Math.floor(pos.x);
      var y = Math.floor(pos.z);
      scale = new THREE.Vector3(sx,1,sz);
      building = new Building(scene, pos, rot, scale);
      building.doIterations();
      build(building.shapes);
    }
    //roads
    for (var k = 0; k < 3 * len; k ++) {
      roadPos = block.p[i].clone().lerp(block.p[(i+1)%4],k/len/3);
      var geometry = new THREE.PlaneGeometry( 0.5, 0.5 );
      geometry.rotateX(-Math.PI/2);
      var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
      var circle = new THREE.Mesh( geometry, material );
      var mat5 = new THREE.Matrix4();
      mat5.makeTranslation(roadPos.x, -0.499, roadPos.z);
      circle.applyMatrix(mat5);
      totalRoad.merge(circle.geometry, circle.matrix);
    }

    // tree
    var tree = new THREE.Mesh(treeGeo, green);
    var mat5 = new THREE.Matrix4();
    mat5.makeTranslation(block.center.x, -0.499, block.center.z);
    tree.applyMatrix(mat5);
    layout.scene.add(tree);
  }
}

// construct entire city
function cityPlan(layout) {
  console.log(layout.blocks);
  for (var i = 0; i < layout.blocks.length; i++) {
    layoutBlock(layout.blocks[i]);
  }
  town = new THREE.Mesh(totalGeo, new THREE.MeshLambertMaterial({color: 0x555555}));
  ground = new THREE.Mesh(totalRoad, new THREE.MeshLambertMaterial({color: 0x444444}))
  //trees = new THREE.Mesh(totalTree, new THREE.MeshLambertMaterial({color: 0x001100}))
  layout.scene.add(town); // draw one geo
  layout.scene.add(ground);
  //layout.scene.add(trees);
}

// called on frame updates
function onUpdate(framework) {  
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
