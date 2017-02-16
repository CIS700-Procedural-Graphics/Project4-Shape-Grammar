
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
const OBJLoader = require('three-obj-loader');
OBJLoader(THREE)
import Framework from './framework'
import Building from './shape.js'
import Shape from './shape.js'
import Draw from './draw.js'
import Layout from './block.js'
import Block from './block.js'
import {popMap} from './perlin.js'

// paramters
var sx = 0.5; var sz = 0.5;
var cityX = 30; var cityZ = 30;
var roadWidth = 2;
var numCars = 6;

var scene;
var building; // object
var layout;

// loaded objects
var treeGeo;var roofGeo;var carGeo;var brickGeo;
var doorGeo;var fancyGeo; var roadGeo; var chimGeo;

// arrays of pos, scale, rot of individual object types
var arrRoof = []; var arrBrick = []; var arrDoor = []; 
var arrFancy = []; var arrTree = []; var arrCar = [];
var arrRoad = []; var arrChim = [];

// geometries
var totalGeo = new THREE.BufferGeometry(); 
var totalRoad = new THREE.BufferGeometry();
var totalTree = new THREE.BufferGeometry();

// meshes
var town; 

var line = new THREE.LineBasicMaterial({ color: 0xffffff });

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

  // ground plane
  var geometry = new THREE.PlaneGeometry( 40, 40 );
  geometry.rotateX(Math.PI/2);
  geometry.translate(15,-0.5,15);
  var material = new THREE.MeshBasicMaterial( {color: 0x005500, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  scene.add( plane );

  roadGeo = new THREE.PlaneBufferGeometry( 0.5, 0.5 );
  chimGeo = new THREE.BoxBufferGeometry(1,1,1);

  layout = new Layout(scene);
  layout.doIterations();

  for (var i = 0; i < layout.blocks.length; i++) {
    layoutBlock(layout.blocks[i]);
  }

    // draw trees
    var objLoader = new THREE.OBJLoader();
  var obj = objLoader.load('tree.obj', function(obj) {
      treeGeo = obj.children[0].geometry;
      treeGeo.computeVertexNormals();
      //treeGeo.normalsNeedUpdate = true;
      var mat = new THREE.MeshLambertMaterial( {color: 0x003300} );
    drawTrees(layout);
    build(arrTree, treeGeo, mat);
  });

    // draw cars
    var obj = objLoader.load('car.obj', function(obj) {
      carGeo = obj.children[0].geometry;
      carGeo.computeVertexNormals();
      //carGeo.normalsNeedUpdate = true;

      drawCars(layout);
      carGeo.scale(0.4, 0.4, 0.4);
      var mat = new THREE.MeshLambertMaterial( {color: 0x003300} );
      build(arrCar, carGeo, mat);    
  });

    var obj = objLoader.load('brick.obj', function(obj) {
      brickGeo = obj.children[0].geometry;
      brickGeo.computeVertexNormals();
      //brickGeo.normalsNeedUpdate = true;
      var mat = new THREE.MeshLambertMaterial( {color: 0x555555} );
      build(arrBrick, brickGeo, mat);
    });

    var obj = objLoader.load('door.obj', function(obj) {
      doorGeo = obj.children[0].geometry;
      doorGeo.computeVertexNormals();
      //doorGeo.normalsNeedUpdate = true; 
      var mat = new THREE.MeshLambertMaterial( {color: 0x555555} );   
      build(arrDoor, doorGeo, mat);
    });

    var obj = objLoader.load('fancy.obj', function(obj) {
      fancyGeo = obj.children[0].geometry; 
      fancyGeo.computeVertexNormals();
      //fancyGeo.normalsNeedUpdate = true; 
      var mat = new THREE.MeshLambertMaterial( {color: 0x555555} );   
      build(arrFancy, fancyGeo, mat);
    });

    var obj = objLoader.load('roof.obj', function(obj) {
      roofGeo = obj.children[0].geometry;  
      roofGeo.computeVertexNormals();
      //roofGeo.normalsNeedUpdate = true;  
      var mat = new THREE.MeshLambertMaterial( {color: 0x553333} );
      build(arrRoof, roofGeo, mat);
    });

    
    build(arrRoad, roadGeo,new THREE.MeshLambertMaterial( {color: 0x000000} )); 
    town = new THREE.Mesh(totalGeo);
    console.log(totalGeo);
    console.log(town);

    //ground = new THREE.Mesh(totalRoad, new THREE.MeshLambertMaterial({color: 0x444444}))
  layout.scene.add(town); // draw one geo
  //layout.scene.add(ground);
}

// add shapes into total geometry
function build(shapes, geo, mat) {
  var quat = new THREE.Quaternion();
  var mat4 = new THREE.Matrix4();
  var mat5 = new THREE.Matrix4();
  for (var i = 0; i < shapes.length; i ++) {
      geo.rotateY(shapes[i].rot.y);
      geo.scale(shapes[i].scale.x, shapes[i].scale.y, shapes[i].scale.z);

      var Wline = new THREE.Line(geo, line);
      layout.scene.add(Wline);
      var mesh = new THREE.Mesh(geo, mat);

      //rotation and translation
      //geo.rotation.set(shapes[i].rot.x, shapes[i].rot.y, shapes[i].rot.z);
      
      //Move the flower so its base rests at the turtle's current position
      var mat5 = new THREE.Matrix4();
      mat5.makeTranslation(shapes[i].pos.x, shapes[i].pos.y, shapes[i].pos.z);
      mesh.applyMatrix(mat5);

      totalGeo.merge(mesh.geometry, mesh.matrix);
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
    rot.y = -Math.atan2(dir.z, dir.x);
    var len = dir.length();
    var pos;
    var houses = len/3;
    // number of houses on a block edge
    for (var j = 1; j < houses; j++) {
      var jitter = 0.8* (Math.random() - 0.5);
      pos = scaledP[i].clone().lerp(scaledP[(i+1)%4],(j)/houses);
      var x = Math.floor(pos.x);
      var y = Math.floor(pos.z);
      scale = new THREE.Vector3(sx,1,sz);
      building = new Building(scene, pos, rot, scale);
      building.doIterations();
      for (var l =0; l < building.shapes.length; l++) {
        switch (building.shapes[l].sym) {
          case 'BRICK':
          arrBrick.push(building.shapes[l].obj); break;
          case 'DOOR':
          arrDoor.push(building.shapes[l].obj); break;
          case 'FANCY':
          arrFancy.push(building.shapes[l].obj); break;
          case 'ROOF':
          arrRoof.push(building.shapes[l].obj); break;
          case 'CHIM':
          arrChim.push(building.shapes[l].obj);
        }
      }
    }
    //roads
    var road = 3 * len;
    for (var k = 0; k < road; k ++) {
      var roadPos = block.p[i].clone().lerp(block.p[(i+1)%4],k/road); roadPos.y = -0.499;
      var roadScale = new THREE.Vector3(1,1,1);
      var roadRot = new THREE.Vector3(rot.x-Math.PI/2, rot.y, rot.z);
      arrRoad.push(new Draw(roadPos, roadRot, roadScale));
    }
  }
}

// trees added in block center; larger area -> more trees; more random offset with larger block/width
function drawTrees(layout) {
  for (var i = 0; i < layout.blocks.length; i++) { 
    var min = Math.min(layout.blocks[i].length, layout.blocks[i].width);
    if (min > 6) {
      for (var l = 0; l < min/2; l++) {
        var x = layout.blocks[i].center.x + (Math.random()-0.5)*layout.blocks[i].length/2;
        var z = layout.blocks[i].center.z + (Math.random()-0.5)*layout.blocks[i].width/2;
        var pos = new THREE.Vector3(x, -0.499, z);
        var rot = new THREE.Vector3();
        var scale = new THREE.Vector3(1,1,1);
        arrTree.push(new Draw(pos,rot,scale));
      }
    }
  }
}

function drawCars(layout) {
  for (var i = 0; i < numCars; i ++) {
    var b = Math.floor(10*Math.random());
    var s = Math.floor(4*Math.random());
    var l = Math.random();
    var loc = layout.blocks[b%layout.blocks.length].p[s].clone(); loc.y = -0.2;
    var rot = new THREE.Vector3();
    var scale = new THREE.Vector3(1,1,1);
    if (s == 0 || s == 2) rot.y = Math.PI/2;
    arrCar.push(new Draw(loc, rot, scale));
  }
}

// called on frame updates
function onUpdate(framework) {  
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
