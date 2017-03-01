
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
var Parameters = function() {
  this.cityX = 50;
  this.cityZ = 50;
  this.roadWidth = 2;
  this.numCars = 6;
  this.waterlevel = 0.1;
  this.trees = 0.4;
  this.buildings = 0.3;
  this.map = popMap(this.cityX, this.cityZ);
  this.render = function() {rebuild();};
}
var params = new Parameters();

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

// scene components
var totalGeo = new THREE.Geometry(); 
var totalMat = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  shading: THREE.SmoothShading,
  vertexColors: THREE.VertexColors
});
var totalMesh = new THREE.Mesh(totalGeo, totalMat);
var plane; var water;
var plane_material = new THREE.MeshLambertMaterial( {color: 0x2B6815, side: THREE.DoubleSide} );


var initialized = false;
var done = []; 
for (var i = 0; i < 5; i ++) {
  done[i] = false;
}

function bias(b, t) {
  return Math.pow(t, Math.log(b) / Math.log(0.5));
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
  directionalLight.position.set(5, 10, 6);
  directionalLight.position.multiplyScalar(10);
  directionalLight.castShadow = true;  // SHADOWS
  directionalLight.shadow.mapSize.width = 2048;  // default
  directionalLight.shadow.mapSize.height = 2048; // default
  directionalLight.shadow.camera.top = params.cityZ;
  directionalLight.shadow.camera.bottom = -params.cityZ;
  directionalLight.shadow.camera.left = -params.cityX;
  directionalLight.shadow.camera.right = params.cityX;
  directionalLight.shadow.camera.near = 0.5;       // default
  directionalLight.shadow.camera.far = 500;      // default
  directionalLight.target = new THREE.DirectionalLight(params.cityX, 0, params.cityZ);
  scene.add(directionalLight.target);
  scene.add(directionalLight);

  var hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
  scene.add(hemisphereLight);

  // set camera position
  camera.position.set(30,30,0);
  camera.lookAt(new THREE.Vector3(params.cityX/2,0,params.cityZ/2));

  var loader = new THREE.CubeTextureLoader();
  var urlPrefix = 'images/skymap/';

  var skymap = new THREE.CubeTextureLoader().load([
    urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
    urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
    urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ] );

  scene.background = skymap;

  draw();

    // draw trees 
    var objLoader = new THREE.OBJLoader();
    var obj = objLoader.load('tree.obj', function(obj) {
      treeGeo = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
      done[0] = true;
      //drawTrees(layout);
      build(arrTree, treeGeo, '0x063600');
    });

    var obj = objLoader.load('brick.obj', function(obj) {
      brickGeo = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
      brickGeo.computeBoundingBox();
      done[1] = true;
      build(arrBrick, brickGeo,'0x604938');
    });

    var obj = objLoader.load('door.obj', function(obj) {
      doorGeo = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
      done[2] = true;
      build(arrDoor, doorGeo, '0x604938');
    });

    var obj = objLoader.load('fancy.obj', function(obj) {
      fancyGeo = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry); 
      done[3] = true;
      build(arrFancy, fancyGeo,'0x604938');
    });

    var obj = objLoader.load('roof.obj', function(obj) {
      roofGeo = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);  
      done[4] = true;
      build(arrRoof, roofGeo, '0x604938');
    });

    setupGUI(gui);

  }

function setupGUI(gui) {
  gui.add(params, 'trees', 0, 1);
  gui.add(params, 'buildings', 0, 1);
  gui.add(params, 'waterlevel', 0, 1);
  gui.add(params, 'cityX', 0, 100).step(1).onChange(function(value) {
    params.cityZ = value;
  });
  gui.add(params, 'render');
}

function remove() {
  arrRoof = []; arrBrick = []; arrDoor = []; 
  arrFancy = []; arrTree = []; arrCar = [];
  arrRoad = []; arrChim = [];

  scene.remove(plane); 
  scene.remove(water);
  totalGeo.dispose();
  scene.remove(totalMesh);
}

function rebuild() {
  remove();
  draw();
  build(arrTree, treeGeo, '0x063600');
  build(arrBrick, brickGeo,'0x604938');
  build(arrDoor, doorGeo, '0x604938');
  build(arrFancy, fancyGeo,'0x604938');
  build(arrRoof, roofGeo, '0x604938');
  totalMesh = new THREE.Mesh(totalGeo, totalMat);
  totalMesh.castShadow = true;
  totalMesh.receiveShadow = true;
  scene.add(totalMesh);
}

function draw() {
    // ground plane

  totalGeo = new THREE.Geometry();
  var geometry = new THREE.PlaneGeometry( params.cityX, params.cityZ,
    params.cityX-1,params.cityZ-1 );
  geometry.rotateX(Math.PI/2);
  geometry.translate(params.cityX/2,-0.5,params.cityZ/2);
  var num = 0;
  for (var i = params.cityZ-1; i >= 0; i--) {
    for (var j = 0; j < params.cityX; j++) {
      geometry.vertices[num].y += 5*params.map[j][i];
        if (geometry.vertices[num].y > (-0.5 + params.waterlevel)
          && geometry.vertices[num].y < 1
          && j%3 == 0 && i%3 ==0 && Math.random() > params.buildings) {
          countryLayout(geometry.vertices[num]);
        }
      if (geometry.vertices[num].y > 1
        && geometry.vertices[num].y *Math.random() < params.trees) {
        var pos = geometry.vertices[num];
      var rot = new THREE.Vector3(0,0,0);
      var scale = new THREE.Vector3(1,1,1);
      arrTree.push(new Draw(pos,rot,scale));
      }
    num++;
    }
  }

plane = new THREE.Mesh( geometry, plane_material );
plane.castShadow = true;
plane.receiveShadow = true;
scene.add( plane );
    //build(arrRoad, roadGeo, '0x000000'); 

    var flat = new THREE.PlaneGeometry( params.cityX, params.cityZ,params.cityX-1,params.cityZ-1 );
    flat.rotateX(Math.PI/2);
    flat.translate(params.cityX/2,-0.5 + params.waterlevel,params.cityZ/2);
    var waterM= new THREE.MeshLambertMaterial( {color: 0x024469, side: THREE.DoubleSide} );
    water = new THREE.Mesh( flat, waterM );
    water.castShadow = true;
    water.receiveShadow = true;
    scene.add(water);
}

// add shapes into total geometry
function build(shapes, geo, color) {
  for (var i = 0; i < shapes.length; i ++) {
    var geometry = new THREE.Geometry();
    geometry.copy(geo);
      // colors
      for (var j = 0; j < geometry.faces.length; j++) {
        geometry.faces[j].color.setHex(color);
      }
      var mesh = new THREE.Mesh(geometry);
      
      mesh.scale.set(shapes[i].scale.x, shapes[i].scale.y, shapes[i].scale.z);
      mesh.rotation.set(shapes[i].rot.x, shapes[i].rot.y, shapes[i].rot.z);
      mesh.position.set(shapes[i].pos.x, shapes[i].pos.y, shapes[i].pos.z);

      mesh.updateMatrix();

      totalGeo.mergeMesh(mesh);
      geometry.dispose();
    }
  }

  function countryLayout(pos) {

    var rot = new THREE.Vector3(0,Math.random(), 0);
    var s = Math.random() + 0.5;
    var scale = new THREE.Vector3(s,s,s);
    var pos2 = new THREE.Vector3(pos.x, pos.y + 0.5, pos.z);
    building = new Building(scene, pos2, rot, scale);
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
    // var line = new THREE.Geometry();
    // line.vertices.push(scaledP[(i+1)%4], scaledP[i]);
    // var line = new THREE.Line(line, material);
    // layout.scene.add(line);

    rot.y = - Math.atan2(dir.z/len, dir.x/len);
    var houses = len/3;
    // number of houses on a block edge
    for (var j = 1; j < houses; j++) {
      //var jitter = 0.8* (Math.random() - 0.5);
      var pos = scaledP[i].clone().lerp(scaledP[(i+1)%4],(j)/houses);
      var x = Math.floor(pos.x);
      var y = Math.floor(pos.z);
      pos.y += 5 *params.map[x][y];
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
        var x = Math.floor(pos.x);
        var y = Math.floor(pos.z);
        pos.y += 5 *params.map[x][y];
        var rot = new THREE.Vector3();
        var scale = new THREE.Vector3(1,1,1);
        arrTree.push(new Draw(pos,rot,scale));
      }
    }
  }
}

function drawCars(layout) {
  for (var i = 0; i < params.numCars; i ++) {
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
  var write = true; 
  if (!initialized) {
    for (var i = 0; i < done.length; i ++) {
     write = write && done[i];
   }
   if (write) {
    totalMesh = new THREE.Mesh(totalGeo, totalMat);
    totalMesh.castShadow = true;
    totalMesh.receiveShadow = true;
    scene.add(totalMesh);
    initialized = true;
  }
}

}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
