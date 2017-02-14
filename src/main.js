const THREE = require('three');
import Framework from './framework'
import Lsystem, {linkedListToString} from './lsystem'
import turtle from './turtle'
import ShapeGrammar from './shapegrammar'
import { Node } from './linkedlist'
const OBJLoader = require('jser-three-obj-loader');
OBJLoader(THREE); 

const Geometry = {
  SHORT_HOUSE: {
    path: 'window_house.obj', // for test
    obj: {}
  },
  TOWER: {
    path: 'tall_tower.obj', // for test
    obj: {},
  },
  FLOOR_APT: {
    path: 'floor.obj',
    obj: {},
  },
  GROUND_FLOOR_APT: {
    path: 'floor.obj',
    obj: {},
  },
  FLOOR_SKY: {
    path: 'skyscraper_floor.obj',
    obj: {}
  },
  GROUND_FLOOR_SKY: {
    path: 'skyscraper_floor.obj',
    obj: {}
  },
  STORE_FRONT: {
    path: 'floor.obj',
    obj: {}
  }
}

var loaded = 0; // Are the geometries loaded? 
var rendered = false; // Have the shapes been rendered?

var scene;
var shapeGrammar;

function onLoad(framework) {
  scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);

  var ambientLight = new THREE.AmbientLight(0x404040);
  ambientLight.intensity = 2;
  scene.add(ambientLight);

  camera.position.set(1, 40, 70);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // Initialize 
  loadGeometries();
  resetShapeGrammar();


  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  gui.add(shapeGrammar, 'iterations', 0, 50).step(1).onChange(function(newVal){
    shapeGrammar.iterations = newVal;
    clearScene();
    resetShapeGrammar();
    rendered = false;
  });

  var button = {
    rerender: function() {     
      clearScene();
      resetShapeGrammar();
      rendered = false;
    }
  };

  gui.add(button,'rerender');
}


/**
  * Clears the scene by removing all geometries 
  */
function clearScene() {
  var obj;
  for( var i = scene.children.length - 1; i > 1; i--) {
    obj = scene.children[i];
    scene.remove(obj);
  }
}

function resetShapeGrammar() {
  if (shapeGrammar) {
    var iter = shapeGrammar.iterations;
  }

  var shapes = new Set();

  var apt = new Node('GROUND_FLOOR_APT', 0)
  apt.position.set(0, 0, 0);

  var skyscraper = new Node('GROUND_FLOOR_SKY');
  skyscraper.position.set(3, 0, 3);

  shapes.add(apt);
  shapes.add(skyscraper);
  shapeGrammar = new ShapeGrammar(shapes);

  if (iter) {
    shapeGrammar.iterations = iter;
  }
}

//TODO: function initialiing based on noise / city etc. 
// create city class for this probability


/**
  * Load custom geometry .obj's from the assets folder.
  * Increments loaded when finished loading an object.
  * Called once when the scene loads.
  */
function loadGeometries() {
  var objLoader = new THREE.OBJLoader();

  //TODO: replace with custom material, or MTLLoader
  var material = new THREE.MeshLambertMaterial({
    color: 0xffffff
  });

  objLoader.setPath('./../assets/');

  for (var shape in Geometry) {
    var objPath = Geometry[shape].path;

    objLoader.load(objPath, function(s){ 
      return ((obj) => {
        obj.position.set(0, 0, 0);
        obj.rotation.set(0, 0, 0);
        obj.scale.set(1, 1, 1);

        obj.bbox = new THREE.Box3().setFromObject(obj);
        obj.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            child.geometry.center();
          }
        })

        obj.material = material;
        Geometry[s].obj = obj;
       
        loaded += 1;
      });
    }(shape));
  }
}


/**
  * Renders the given shapeGrammar
  */
function renderShapeGrammar(iterations) {
  var set = shapeGrammar.doIterations(iterations, Geometry);
  set.forEach((node) => {
    var geo = Geometry[node.shape].obj.clone();

    geo.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z);
    geo.scale.set(node.scale.x, node.scale.y, node.scale.z);
    geo.position.set(node.position.x, node.position.y, node.position.z);
    
    scene.add(geo);
    rendered = true;
  });
}

function onUpdate(framework) {
  if (!rendered && loaded == Object.keys(Geometry).length) {
    renderShapeGrammar(shapeGrammar.iterations);
  }
}

// When the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
