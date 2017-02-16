//skybox images from: https://github.com/simianarmy/webgl-skybox/tree/master/images

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Shape from './shape.js'
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

var shapeType = require('./shape.js');
var flag_loaded = 2; //array of flags
//------------------------------------------------------------------------------
// var shapeList = [];
var sampler = []; //array of vector2's
var guiParameters = {
  buildingIterations: 4.0,
  city_center_x: 0.01,
  city_center_z: 0.01,
  levelOfDetail: 5,
  towerRadius: 5
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
// var box = new THREE.BoxBufferGeometry( 1, 1, 1 );
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
  gui.add(guiParameters, 'buildingIterations', 0, 4).step(1).onChange(function(newVal) {
    guiParameters.buildingIterations = newVal;
    onreset(scene);
  });

  gui.add(guiParameters, 'towerRadius', 3, 10).step(1).onChange(function(newVal) {
    guiParameters.levelOfDetail = newVal;
    onreset(scene);
  });

  gui.add(guiParameters, 'city_center_x', -30.0, 30.0).onChange(function(newVal) {
    guiParameters.city_center_x = newVal;
    onreset(scene);
  });
  gui.add(guiParameters, 'city_center_z', -30.0, 30.0).onChange(function(newVal) {
    guiParameters.city_center_z = newVal;
    onreset(scene);
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
      urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
      urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
      urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
  ] );
  scene.background = skymap;

  //set plane
  var geometry = new THREE.PlaneGeometry( 150, 150, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0x696969, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.rotateX(90 * 3.14/180);
  plane.position.set(0,-0.02,0);
  scene.add( plane );

  // set camera position
  camera.position.set(0, 5, -8);
  camera.lookAt(new THREE.Vector3(0,0,0));
}

function loadGeometry()
{
  var objLoader1 = new THREE.OBJLoader();
  objLoader1.load('geometry/floorDivision.obj', function(obj)
  {
      floorDivisionGeo = obj.children[0].geometry;
      floorDivisionMesh = new THREE.Mesh(floorDivisionGeo, building_Material);
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

function onreset(scene)
{
  cleanscene(scene);
  // finalbuildingGeneration(scene);
  // renderbuildings(scene);
}

//------------------------------------------------------------------------------
function cleanscene(scene)
{
  for( var i = scene.children.length - 1; i >= 0; i--)
  {
    var obj = scene.children[i];
    scene.remove(obj);
  }

  //set plane
  var geometry = new THREE.PlaneGeometry( 150, 150, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0x696969, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.position.set(0,-0.02,0);
  plane.rotateX(90 * 3.14/180);
  scene.add( plane );

  createCity(scene);
}

function finalbuildingGeneration(scene, shapeList)
{
  //actual cubes and buildings
  for(var i=0; i<guiParameters.buildingIterations; i++)
  {
    var l = shapeList.length;
    for(var j=0; j<l; j++)
    {
      if((shapeList[j].scale.x > 1.5) && (shapeList[j].scale.z > 1.5))
      {
        if (j != 0) j=j+1;
        shapeList[j].createbuilding(shapeList, j);
      }
    }
  }

  //now we have terminal geometry so added features to them
  //roofs
  var objLoader4 = new THREE.OBJLoader();
  objLoader4.load('geometry/roofCastleType.obj', function(obj)
  {
      roofCastleTypeGeo = obj.children[0].geometry;
      roofCastleTypeMesh = new THREE.Mesh(roofCastleTypeGeo, building_Material);
      var l = shapeList.length;
      for(var j=0; j<l; j++)
      {
        shapeList[j].addRoofcastle(shapeList[j], scene, roofCastleTypeMesh);
      }
  });

  //windows
  var objLoader7 = new THREE.OBJLoader();
  objLoader7.load('geometry/window_s.obj', function(obj)
  {
      window_sGeo = obj.children[0].geometry;
      window_sMesh = new THREE.Mesh(window_sGeo, building_Material);
      var l = shapeList.length;
      for(var j=0; j<l; j++)
      {
        shapeList[j].addWindows(shapeList[j], scene, window_sMesh);
      }
  });

  //doors
  var objLoader3 = new THREE.OBJLoader();
  objLoader3.load('geometry/door.obj', function(obj)
  {
      doorGeo = obj.children[0].geometry;
      doorMesh = new THREE.Mesh(doorGeo, building_Material);
      var l = shapeList.length;
      for(var j=0; j<l; j++)
      {
        shapeList[j].addDoor(shapeList[j], scene, doorMesh);
      }
  });
}

function renderbuildings(scene, shapeList)
{
    for(var j=0; j<shapeList.length; j++)
    {
      shapeList[j].mesh.scale.set( shapeList[j].scale.x, shapeList[j].scale.y, shapeList[j].scale.z );
      shapeList[j].mesh.position.set( shapeList[j].pos.x, shapeList[j].pos.y, shapeList[j].pos.z );
      scene.add(shapeList[j].mesh);
    }
}

//------------------------------------------------------------------------------

function createCity(scene)
{
  var PI = 3.14159;
  var circleList = [];
  var curvePointsList = [];
  var radius = guiParameters.towerRadius;

  // var tube = 1;
  // var arc = 6.3; //in radians
  // var geotorus = new THREE.TorusBufferGeometry( radius, tube, 6, 15, arc); // (radius, tube, radialSegments, tubularSegments, arc)
  // var mtorus = new THREE.MeshBasicMaterial( { color: (new THREE.Color(Math.random(), Math.random(), Math.random())).getHex() } );
  // var torus = new THREE.Mesh( geotorus, mtorus );
  // torus.position.set(guiParameters.city_center_x, tube*0.5, guiParameters.city_center_z);
  // torus.rotateX(PI * 0.5);
  // scene.add( torus );

  //-------------------------------- create circle Layers ---------------------------
  var numberOfLayers = 3;
  var segments = guiParameters.levelOfDetail*2;
  var numroadplanes = 20;

  for(var i=0; i<numberOfLayers ;i++)
  {
    var circlegeo = new THREE.CircleGeometry( radius + i*20, segments );
    circlegeo.rotateX(-PI*0.5);
    // var mat = new THREE.MeshBasicMaterial( { color:  (new THREE.Color(Math.random(), Math.random(), Math.random())).getHex() , side: THREE.DoubleSide} );
    var mat = new THREE.MeshBasicMaterial( { color: 0x696969 , side: THREE.DoubleSide} );
    var circle = new THREE.Mesh( circlegeo, mat ); // first vertex is the center the others are points on the circle,
                                                  // starting alligned with the +x axis
    circle.position.set(guiParameters.city_center_x, 0.01 *(numberOfLayers-i) + 0.05, guiParameters.city_center_z);
    circleList.push(circle);
    scene.add( circleList[circleList.length-1] );
  }

  for(var i=0; i<numberOfLayers-1 ;i++)
  {
    for(var j=0; j<segments; j=j+2)
    {
      var curve = new THREE.SplineCurve( [
        new THREE.Vector2( circleList[i].geometry.vertices[j+1].x, circleList[i].geometry.vertices[j+1].z ),
        new THREE.Vector2( circleList[i+1].geometry.vertices[j+1].x, circleList[i+1].geometry.vertices[j+1].z )
      ] );

      var path = new THREE.Path( curve.getPoints( numroadplanes ) );
      var roadpoints = path.createPointsGeometry( numroadplanes );
      curvePointsList.push(roadpoints);

      for(var k=0; k<numroadplanes ;k++)
      {
        var geo = new THREE.PlaneGeometry( 1, 1, 1 );
        var mat = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
        var roadplane = new THREE.Mesh( geo, mat );
        roadplane.rotateX(PI * 0.5);
        roadplane.position.set(roadpoints.vertices[k].x + guiParameters.city_center_x, 0.1, roadpoints.vertices[k].y + guiParameters.city_center_z);
        roadplane.scale.set(1.5,1.5,1.5);
        scene.add( roadplane );
      }
    }

    for(var j=1; j<segments; j=j+2)
    {
        var shapeList = [];
        var shape1 = new Shape(0, cube);
        shape1.scale = new THREE.Vector3( 10, 1, 10 );
        shape1.pos.set(circleList[i].geometry.vertices[j+1].x + guiParameters.city_center_x,
                       shape1.scale.y/2.0 ,
                       circleList[i].geometry.vertices[j+1].z + guiParameters.city_center_z);
        shapeList.push(shape1);
        finalbuildingGeneration(scene, shapeList);
        renderbuildings(scene, shapeList);
    }
  }

  for(var i=0; i<curvePointsList.length ;i++)
  {
    var prob = Math.random() * 2;
    prob = Math.floor(prob);

    if(prob)
    {
      var curve;
      var t = guiParameters.towerRadius;
      if(i == (t*2 - 1))
      {
        curve = new THREE.SplineCurve( [
          new THREE.Vector2( curvePointsList[i].vertices[numroadplanes].x, curvePointsList[i].vertices[numroadplanes].y ),
          new THREE.Vector2( curvePointsList[t].vertices[numroadplanes].x, curvePointsList[t].vertices[numroadplanes].y )
          ] );
      }
      else if(i == t-1)
      {
        curve = new THREE.SplineCurve( [
          new THREE.Vector2( curvePointsList[i].vertices[numroadplanes].x, curvePointsList[i].vertices[numroadplanes].y ),
          new THREE.Vector2( curvePointsList[0].vertices[numroadplanes].x, curvePointsList[0].vertices[numroadplanes].y )
          ] );
      }
      else
      {
        curve = new THREE.SplineCurve( [
          new THREE.Vector2( curvePointsList[i].vertices[numroadplanes].x, curvePointsList[i].vertices[numroadplanes].y ),
          new THREE.Vector2( curvePointsList[i+1].vertices[numroadplanes].x, curvePointsList[i+1].vertices[numroadplanes].y )
          ] );
      }

      var path = new THREE.Path( curve.getPoints( numroadplanes*2 ) );
      var roadpoints = path.createPointsGeometry( numroadplanes*2 );

      for(var k=0; k<numroadplanes*2 ;k++)
      {
        var geo = new THREE.PlaneGeometry( 1, 1, 1 );
        var mat = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
        var roadplane = new THREE.Mesh( geo, mat );
        roadplane.rotateX(PI * 0.5);
        roadplane.position.set(roadpoints.vertices[k].x + guiParameters.city_center_x, 0.1, roadpoints.vertices[k].y + guiParameters.city_center_z);
        roadplane.scale.set(1.5,1.5,1.5);
        scene.add( roadplane );
      }
    }
  }
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

  //--------------------------- Add starting shapes here -----------------------
  // var shape1 = new Shape(0, cube);
  // shape1.scale = new THREE.Vector3( 10, 1, 10 );
  // shape1.pos.setY(shape1.scale.y/2.0);
  // shapeList.push(shape1);

  //--------------------------- create city here -----------------------
  createCity(scene);

  // finalbuildingGeneration(scene);
  // renderbuildings(scene);
}

// called on frame updates
function onUpdate(framework)
{}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
