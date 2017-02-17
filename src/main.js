
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

// total
var totalGeo = new THREE.Geometry(); 
var totalMat = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  shading: THREE.SmoothShading,
  vertexColors: THREE.VertexColors
});
var totalMesh = new THREE.Mesh(totalGeo, totalMat);


var initialized = false;
var done = []; 
for (var i = 0; i < 6; i ++) {
  done[i] = false;
}

// called after the scene loads
function onLoad(framework) {
  scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  renderer.shadowMap.enabled = true; // SHADOW
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  var gui = framework.gui;
  var stats = framework.stats;

  // initialize a simple box and material
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  directionalLight.castShadow = true;  // SHADOWS
  directionalLight.shadow.mapSize.width = 2048;  // default
  directionalLight.shadow.mapSize.height = 2048; // default
  directionalLight.shadow.camera.top = 30;
  directionalLight.shadow.camera.bottom = -30;
  directionalLight.shadow.camera.left = -30
  directionalLight.shadow.camera.right = 30;
  directionalLight.shadow.camera.near = 0.5;       // default
  directionalLight.shadow.camera.far = 500;      // default
  scene.add(directionalLight);

  var helper = new THREE.CameraHelper( directionalLight.shadow.camera );
scene.add( helper );

  var hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.2);
  scene.add(hemisphereLight);

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

  roadGeo = new THREE.PlaneGeometry( 0.5, 0.5 );
  chimGeo = new THREE.BoxGeometry(1,1,1);

  layout = new Layout(scene);
  layout.doIterations();

   var axisHelper = new THREE.AxisHelper (5);
  layout.scene.add(axisHelper);

  for (var i = 0; i < layout.blocks.length; i++) {
    layoutBlock(layout.blocks[i]);
  }

    // draw trees 
    var objLoader = new THREE.OBJLoader();
  var obj = objLoader.load('tree.obj', function(obj) {
      treeGeo = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
      done[0] = true;
      drawTrees(layout);
      build(arrTree, treeGeo, 10, 70, 10);
  });

    // draw cars
    var obj = objLoader.load('car.obj', function(obj) {
      carGeo = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
      done[1] = true;
      drawCars(layout);
      carGeo.scale(0.4, 0.4, 0.4);
      build(arrCar, carGeo, 255, 16,16);    
  });

    var obj = objLoader.load('brick.obj', function(obj) {
      brickGeo = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
      brickGeo.computeBoundingBox();
      done[2] = true;
      build(arrBrick, brickGeo,96, 73, 56);
    });

    var obj = objLoader.load('door.obj', function(obj) {
      doorGeo = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
      done[3] = true;
      build(arrDoor, doorGeo, 96, 73, 56);
    });

    var obj = objLoader.load('fancy.obj', function(obj) {
      fancyGeo = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry); 
      done[4] = true;
      build(arrFancy, fancyGeo,96, 73, 56);
    });

    var obj = objLoader.load('roof.obj', function(obj) {
      roofGeo = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);  
      done[5] = true;
      build(arrRoof, roofGeo, 109, 102, 69);
    });

    // ground plane
    var geometry = new THREE.PlaneGeometry( cityX, cityZ,cityX-1,cityZ-1 );
    console.log(geometry);
    geometry.rotateX(Math.PI/2);
    geometry.translate(15,-0.5,15);
    var num = 0;
    for (var i = cityZ-1; i >= 0; i--) {
      for (var j = 0; j < cityX; j++) {
        geometry.vertices[num].y += 5*layout.map[j][i];
        num++;
      }
    }
    var material = new THREE.MeshBasicMaterial( {color: 0x005500, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    plane.castShadow = true;
    plane.receiveShadow = true;
    scene.add( plane );
    build(arrRoad, roadGeo, 38, 37, 32); 
}

// add shapes into total geometry
function build(shapes, geo, r, g, b) {
  for (var i = 0; i < shapes.length; i ++) {
      var geometry = new THREE.Geometry();
      geometry.copy(geo);
      // colors
      var color = r.toString(16) + g.toString(16) + b.toString(16);
      for (var j = 0; j < geometry.faces.length; j++) {
        geometry.faces[j].color.setHex('0x' + color);
      }
      var mesh = new THREE.Mesh(geometry);
      
      mesh.scale.set(shapes[i].scale.x, shapes[i].scale.y, shapes[i].scale.z);
      mesh.rotation.set(shapes[i].rot.x, shapes[i].rot.y, shapes[i].rot.z);
      mesh.position.set(shapes[i].pos.x, shapes[i].pos.y, shapes[i].pos.z);

      mesh.updateMatrix();

      totalGeo.mergeMesh(mesh);
  }
}

// construction 
function layoutBlock(block) {
  
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
    var rot = new THREE.Vector3();
    var scale = new THREE.Vector3();
    var dir = scaledP[(i+1)%4].clone().sub(scaledP[i]);
    var len = dir.length();
    var material = new THREE.LineBasicMaterial({
  color: 0x0000ff
});
    var line = new THREE.Geometry();
    line.vertices.push(scaledP[(i+1)%4], scaledP[i]);
    var line = new THREE.Line(line, material);
    layout.scene.add(line);

    rot.y = - Math.atan2(dir.z/len, dir.x/len);
    var houses = len/3;
    // number of houses on a block edge
    for (var j = 1; j < houses; j++) {
      //var jitter = 0.8* (Math.random() - 0.5);
      var pos = scaledP[i].clone().lerp(scaledP[(i+1)%4],(j)/houses);
      var x = Math.floor(pos.x);
      var y = Math.floor(pos.z);
      pos.y += 5 *layout.map[x][y];
      scale = new THREE.Vector3(1,1,1);
      building = new Building(scene, pos, rot, scale);
      building.doIterations();
      for (var l =0; l < building.shapes.length; l++) {
        switch (building.shapes[l].sym) {
          case 'DOOR':
          arrDoor.push(building.shapes[l].obj); break;
          case 'FANCY':
          arrFancy.push(building.shapes[l].obj); break;
          case 'ROOF':
          arrRoof.push(building.shapes[l].obj); break;
          case 'CHIM':
          arrChim.push(building.shapes[l].obj); break
          case 'BRICK':
          default:
          arrBrick.push(building.shapes[l].obj); 
        }
      }
    }
    //roads
    var road = 3 * len;
    for (var k = 0; k < road; k ++) {
      var roadPos = block.p[i].clone().lerp(block.p[(i+1)%4],k/road); roadPos.y = -0.499;
      var roadScale = new THREE.Vector3(1,1,1);
      var roadRot = new THREE.Vector3(-Math.PI/2,0,0);
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
      // var x = Math.floor(loc.x);
      // var y = Math.floor(loc.z);
      // loc.y += 5 *layout.map[x][y];
    var rot = new THREE.Vector3();
    var scale = new THREE.Vector3(1,1,1);
    if (s == 0 || s == 2) rot.y = Math.PI/2;
    arrCar.push(new Draw(loc, rot, scale));
  }
}

// called on frame updates
function onUpdate(framework) { 
  var write = true; 
  if (!initialized) {
    for (var i = 0; i < done.length; i ++) {
       write = write && done[i];
    }
    if (write) {
      totalMesh = new THREE.Mesh(totalGeo, totalMat);
      totalMesh.castShadow = true;
      totalMesh.receiveShadow = true;
      layout.scene.add(totalMesh);
      initialized = true;
    }
  }
  
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
