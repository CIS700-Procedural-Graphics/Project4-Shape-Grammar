//skybox images from: https://github.com/simianarmy/webgl-skybox/tree/master/images

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Shape from './shape.js'
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

var shapeType = require('./shape.js');
var flag_loaded = 2; //array of flags
//------------------------------------------------------------------------------
var shapeList = [];
var guiParameters = {
  iterations: 1.0,
  city_center_x: 0.01,
  city_center_z: 0.01,
  regenerate: 0,
  levelOfDetail: 2
}

var building_Material = new THREE.ShaderMaterial({
  uniforms:
  {
    shapeColor:
    {
        type: "v3",
        value: new THREE.Color(0xB266FF) // violet
    },
    lightVec:
    {
        type: "v3",
        value: new THREE.Vector3( 10, 10, 10 )
    }
  },
  vertexShader: require('./shaders/buildings-vert.glsl'),
  fragmentShader: require('./shaders/buildings-frag.glsl')
});

//------------------------------------------------------------------------------
//various geometries and meshes for the city and buildings
var box = new THREE.BoxGeometry( 1, 1, 1 );
var cube = new THREE.Mesh( box, building_Material );

var balconyGeo = new THREE.Geometry();
var balconyMesh = new THREE.Mesh(); //loaded in later

var doorGeo = new THREE.Geometry();
var doorMesh = new THREE.Mesh(); //undefined; //loaded in later

var floorDivisionGeo = new THREE.Geometry();
var floorDivisionMesh = new THREE.Mesh(); //undefined; //loaded in later

var roofCastleTypeGeo = new THREE.Geometry();
var roofCastleTypeMesh = new THREE.Mesh(); //undefined; //loaded in later

var roofChimneyTypeGeo = new THREE.Geometry();
var roofChimneyTypeMesh = new THREE.Mesh(); //undefined; //loaded in later

var window_lGeo = new THREE.Geometry();
var window_lMesh = new THREE.Mesh(); //undefined; //loaded in later

var window_sGeo = new THREE.Geometry();
var window_sMesh = new THREE.Mesh(); //undefined; //loaded in later
//------------------------------------------------------------------------------
function changeGUI(gui, camera, scene)
{
  gui.add(guiParameters, 'iterations', 0, 5).step(1).onChange(function(newVal) {
    guiParameters.iterations = newVal;
  });

  gui.add(guiParameters, 'city_center_x', -50.0, 50.0).onChange(function(newVal) {
    guiParameters.city_center_x = newVal;
  });
  gui.add(guiParameters, 'city_center_z', -50.0, 50.0).onChange(function(newVal) {
    guiParameters.city_center_z = newVal;
  });
  gui.add(guiParameters, 'levelOfDetail', { Low: 1, Average: 2, High: 3 }).onChange(function(newVal) {
    guiParameters.levelOfDetail = newVal;
  });
  gui.add(guiParameters, 'regenerate', { Yes: 1, No: 0 } ).onChange(function(newVal) {
    guiParameters.regenerate = newVal;
    if(guiParameters.regenerate == 1)
    {
      //Do all the things to regenerate the damn city
      cleanscene(scene);
      finalgeneration();
    }
  });

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
}

function setupLightsandSkybox(scene, camera)
{
  // Set light
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);
  building_Material.lightVec = directionalLight.position;

  // // set skybox
  var loader = new THREE.CubeTextureLoader();
  var urlPrefix = 'images/skymap/';
  var skymap = new THREE.CubeTextureLoader().load([
      urlPrefix + 'skyposx.png', urlPrefix + 'skynegx.png',
      urlPrefix + 'skyposy.png', urlPrefix + 'skynegy.png',
      urlPrefix + 'skyposz.png', urlPrefix + 'skynegz.png'
  ] );
  scene.background = skymap;

  //set plane
  var geometry = new THREE.PlaneGeometry( 100, 100, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0x696969, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.rotateX(90 * 3.14/180);
  scene.add( plane );

  //create grid
  var size = 50;
  var divisions = 50;
  var gridHelper = new THREE.GridHelper( size, divisions );
  scene.add( gridHelper );

  // set camera position
  camera.position.set(0, 5, 30);
  camera.lookAt(new THREE.Vector3(0,0,0));
}

function loadGeometry()
{
  var objLoader1 = new THREE.OBJLoader();
  objLoader1.load('geometry/floorDivision.obj', function(obj)
  {
      floorDivisionGeo = obj.children[0].geometry;
      floorDivisionMesh = new THREE.Mesh(floorDivisionGeo, building_Material);
      // floorDivisionMesh.name = "undefined";
      // floorDivisionMesh.scale.set(1,1,1);
      // scene.add(floorDivisionMesh);
  });

  var objLoader2 = new THREE.OBJLoader();
  objLoader2.load('geometry/balcony.obj', function(obj)
  {
      balconyGeo = obj.children[0].geometry;
      balconyMesh = new THREE.Mesh(balconyGeo, building_Material);
      // balconyMesh.name = "blehh";
  });

  var objLoader3 = new THREE.OBJLoader();
  objLoader3.load('geometry/door.obj', function(obj)
  {
      doorGeo = obj.children[0].geometry;
      doorMesh = new THREE.Mesh(doorGeo, building_Material);
      // doorMesh.name = "undefined";
  });

  var objLoader4 = new THREE.OBJLoader();
  objLoader4.load('geometry/roofCastleType.obj', function(obj)
  {
      roofCastleTypeGeo = obj.children[0].geometry;
      roofCastleTypeMesh = new THREE.Mesh(roofCastleTypeGeo, building_Material);
      // roofCastleTypeMesh.name = "undefined";
  });

  var objLoader5 = new THREE.OBJLoader();
  objLoader5.load('geometry/roofChimneyType.obj', function(obj)
  {
      roofChimneyTypeGeo = obj.children[0].geometry;
      roofChimneyTypeMesh = new THREE.Mesh(roofChimneyTypeGeo, building_Material);
      // roofChimneyTypeMesh.name = "undefined";
  });

  var objLoader6 = new THREE.OBJLoader();
  objLoader6.load('geometry/window_l.obj', function(obj)
  {
      window_lGeo = obj.children[0].geometry;
      window_lMesh = new THREE.Mesh(window_lGeo, building_Material);
      // window_lMesh.name = "undefined";
  });

  var objLoader7 = new THREE.OBJLoader();
  objLoader7.load('geometry/window_s.obj', function(obj)
  {
      window_sGeo = obj.children[0].geometry;
      window_lMesh = new THREE.Mesh(window_sGeo, building_Material);
      // window_sMesh.name = "undefined";
  });
}

//------------------------------------------------------------------------------
function cleanscene(scene)
{
  for(var j=0; j<shapeList.length; j++)
  {
    scene.remove(shapeList[j].mesh);
  }
}

function finalgeneration()
{
  for(var i=0; i<1; i++)
  {
    var l = shapeList.length;
    for(var j=0; j<l; j++)
    {
      shapeList[j].replaceShape(shapeList, j);
    }
  }
}

function render(scene)
{
    for(var j=0; j<shapeList.length; j++)
    {
      shapeList[j].mesh.scale.set( shapeList[j].scale.x, shapeList[j].scale.y, shapeList[j].scale.z );
      shapeList[j].mesh.position.set( shapeList[j].pos.x, shapeList[j].pos.y, shapeList[j].pos.z );
      scene.add(shapeList[j].mesh);
    }
}

function AfterLoading(scene)
{
  //--------------------------- Add starting shapes here -----------------------
  var shape1 = new Shape(scene, 0, cube);
  shape1.scale = new THREE.Vector3( 1, 1, 1 );
  shape1.pos.setY(shape1.scale.y/2.0);
  shapeList.push(shape1);

  if(flag_loaded == 3)
  {
    console.log(balconyMesh);
    balconyMesh.position.set(10,0,0);
    scene.add(balconyMesh);
    console.log("zdzxcv  " + scene.getObjectByName(balconyMesh));

    doorMesh.position.set(8,0,0);
    scene.add(doorMesh);
    floorDivisionMesh.position.set(6,0,0);
    scene.add(floorDivisionMesh);
    roofCastleTypeMesh.position.set(4,0,0);
    scene.add(roofCastleTypeMesh);
    roofChimneyTypeMesh.position.set(2,0,0);
    scene.add(roofChimneyTypeMesh);
    window_lMesh.position.set(0,0,0);
    scene.add(window_lMesh);
    window_sMesh.position.set(-2,0,0);
    scene.add(window_sMesh);
  }

  //--------------------------- Do things to shapes here -----------------------
  finalgeneration();
  render(scene);
}

//------------------------------------------------------------------------------
// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  setupLightsandSkybox(scene, camera);
  changeGUI(gui, camera, scene);
  guiParameters.city_center_x = (-10.0 + Math.random() * 20.0);
  guiParameters.city_center_z = (-10.0 + Math.random() * 20.0);
  // loadGeometry();

  //--------------------------- Add starting shapes here -----------------------
  var shape1 = new Shape(0, cube);
  shape1.scale = new THREE.Vector3( 10, 2, 10 );
  shape1.pos.setY(shape1.scale.y/2.0);
  shapeList.push(shape1);

  // setTimeout(function() {
  //   balconyMesh.position.set(10,0,0);
  //   scene.add(balconyMesh);
  //
  //   doorMesh.position.set(8,0,0);
  //   scene.add(doorMesh);
  //
  //   floorDivisionMesh.position.set(6,0,0);
  //   scene.add(floorDivisionMesh);
  //
  //   roofCastleTypeMesh.position.set(4,0,0);
  //   scene.add(roofCastleTypeMesh);
  //
  //   roofChimneyTypeMesh.position.set(2,0,0);
  //   scene.add(roofChimneyTypeMesh);
  //
  //   window_lMesh.position.set(0,0,0);
  //   scene.add(window_lMesh);
  //
  //   window_sMesh.position.set(-2,0,0);
  //   scene.add(window_sMesh);
  // }, 20); //increase the number of milliseconds if the loadgeometry is taking too long

  //--------------------------- Do things to shapes here -----------------------
  finalgeneration();
  render(scene);
}

// called on frame updates
function onUpdate(framework)
{
  guiParameters.regenerate = 0;
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
