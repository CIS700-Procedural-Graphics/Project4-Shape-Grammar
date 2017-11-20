
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import ShapeGrammar from './shapegrammar.js'
import City from './city.js'

var objLoader = new THREE.OBJLoader();

var geo1;
var geo2;

var voronoi = !true;

var points = new THREE.Geometry();
var velocities = [];

// Create particle system
for ( var i = 0; i < 10000; i ++ ) {
  var p = new THREE.Vector3();
  p.x = THREE.Math.randFloatSpread( 200 );
  p.y = THREE.Math.randFloatSpread( 200 );
  p.z = THREE.Math.randFloatSpread( 200 );
  points.vertices.push( p );
  velocities.push(-Math.random() / 5);
  points.lights = true;
}

var whiteCol = new THREE.PointsMaterial( { color: 0xffffff, size: 0.5, 
  map: new THREE.TextureLoader().load('src/particle.png'),
  blending: THREE.AdditiveBlending,
  transparent: true  } )

var starField = new THREE.Points( points, whiteCol );

  

// called after the scene loads
function onLoad(framework) {
  
  var scene = framework.scene;
  scene.add( starField );
  
  // make night sky background
  var loader = new THREE.TextureLoader();
  var background = new THREE.TextureLoader().load('src/darkbluepainting.jpg');
  scene.background = background;

  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // Scene set up
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);

  scene.add(directionalLight);

  var backLight = new THREE.DirectionalLight( 0xffffff, 1 );
  backLight.color.setHSL(0.1, 1, 0.95);
  backLight.position.set(1, 3, -2);
  backLight.position.multiplyScalar(10);

  scene.add(backLight);

  camera.position.set(1, 10, 5);
  camera.lookAt(new THREE.Vector3(0,0,0));
  camera.updateProjectionMatrix();


  
  objLoader.load('Build11_obj.obj', function(obj) {
    // LOOK: This function runs after the obj has finished loading
    geo1 = obj.children[0].geometry;
    objLoader.load('Build10_obj.obj', function(obj) {
      // LOOK: This function runs after the obj has finished loading
      geo2 = obj.children[0].geometry;
      var city = new City.City(scene, geo1, geo2);
    });
  });

  // Gui variables
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
}

// called on frame updates
function onUpdate(framework) {
  for ( var i = 0; i < 10000; i ++ ) {
      points.vertices[i].y += velocities[i];
      if (points.vertices[i].y <= 0.0) {
        points.vertices[i].y = 20;
      }
      points.lights = true;
    }
  starField.geometry.verticesNeedUpdate = true;
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
