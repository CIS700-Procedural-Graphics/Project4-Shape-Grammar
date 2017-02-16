const THREE = require('three');
const Random = require("random-js");

import Framework from './framework'
import * as Building from './building.js'
import * as Rubik from './rubik.js'
import * as City from './city.js'

var UserSettings = 
{
  iterations : 5
}

var Engine = 
{
  initialized : false,
  time : 0.0,
  deltaTime : 0.0,
  clock : null,

  music : null,

  loadingBlocker : null,
  materials : [],

  rubik : null,
  rubikTime : 0,
}

function onLoad(framework) 
{
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


  // initialize a simple box and material
  var directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight2.color.setHSL(0.1, 1, 0.95);
  directionalLight2.position.set(-1, -3, -2);
  directionalLight2.position.multiplyScalar(10);
  scene.add(directionalLight2);

  // set camera position
  camera.position.set(9, 7, 9);
  camera.lookAt(new THREE.Vector3(0,0,0));

  var profile = new Building.Profile();
  profile.addPoint(1.0, 0.0);
  profile.addPoint(1.0, 1.0);

  profile.addPoint(.9, 1.0);
  profile.addPoint(.9, 1.1);
  profile.addPoint(.8, 1.1);
  profile.addPoint(.8, 1.0);

  profile.addPoint(0.7, 1.0);
  profile.addPoint(0.6, 2.0);
  profile.addPoint(0.0, 2.0);

  var lot = new Building.BuildingLot();
  var subdivs = 25;
  for(var i = 0; i < subdivs; i++)
  {
    var a = i * Math.PI * 2 / subdivs;
    var r = 1.0 - Math.pow(Math.sin(a * 10) * .5 + .5, 5.0) * .5 + 1.0 ;
    lot.addPoint(Math.cos(a) * r, Math.sin(a) * r);
  }

  var shape = new Building.MassShape(lot, profile);
  var mesh = shape.generateMesh();
  // scene.add(mesh);

  var rule = new Building.Rule();
  rule.componentWise = true;
  // rule.evaluate(shape, scene);

  Engine.rubik = new Rubik.Rubik();
  var rubikMesh = Engine.rubik.build();
  // scene.add(rubikMesh);

  // Init Engine stuff
  Engine.scene = scene;
  Engine.renderer = renderer;
  Engine.clock = new THREE.Clock();
  Engine.camera = camera;
  Engine.initialized = true;

  var random = new Random(Random.engines.mt19937().seed(2545));

  var speed = .15;


  var city = new City.Generator();
  city.build(scene);

  var callback = function() {
    Engine.rubik.animate(random.integer(0, 2), random.integer(0, 2), speed, callback);
  };

  Engine.rubik.animate(0, 0, speed, callback);
}

// called on frame updates
function onUpdate(framework) 
{
  if(Engine.initialized)
  {
    var screenSize = new THREE.Vector2( framework.renderer.getSize().width, framework.renderer.getSize().height );
    var deltaTime = Engine.clock.getDelta();

    Engine.time += deltaTime;
    Engine.cameraTime += deltaTime;
    Engine.deltaTime = deltaTime;

    Engine.rubik.update(deltaTime);
  }
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
