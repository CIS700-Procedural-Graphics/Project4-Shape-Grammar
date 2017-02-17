const THREE = require('three');
import Framework from './framework'
import Lsystem, {linkedListToString} from './lsystem'
import turtle from './turtle'
import ShapeGrammar from './shapegrammar'
import { Node } from './linkedlist'
import City from './city'

const OBJLoader = require('jser-three-obj-loader');
OBJLoader(THREE);

const MTLLoader = require('three-mtl-loader'); 

// TODO: put this in its own file?
export const Geometry = {
  SHORT_HOUSE: {
    path: 'window_house', // for test
    obj: {}
  },
  TOWER: {
    path: 'tall_tower', // for test
    obj: {},
  },
  FLOOR_APT: {
    path: 'floor',
    obj: {},
    sizeRatio: 1.7,
  },
  GROUND_FLOOR_APT: {
    path: 'floor',
    obj: {},
  },
  ROOF_APT: {
    path: 'apartment_roof', 
    obj: {}
  },
  FLOOR_SKY: {
    path: 'skyscraper_floor',
    obj: {},
    sizeRatio: 4,
  },
  GROUND_FLOOR_SKY: {
    path: 'skyscraper_floor',
    obj: {},
  },
  ROOF_SKY: {
    path: 'skyscraper_roof', //TODO: replace
    obj: {}
  },
  PARK: {
    path: 'park',
    obj: {},
  },
  TREE: {
    path: 'tree',
    obj:{},
  }
  // STORE_FRONT: { // -> can function as GROUND_FLOOR_APT or GROUND_FLOOR_SKY
  //   path: '', //TODO
  //   obj: {},
  // },

  //TODO: STORE_FRONT
}

var loaded = 0; // Are the geometries loaded? 
var rendered = false; // Have the shapes been rendered?
var initRender = true;
var shadowsOn = false;//true;

var scene;
var shapeGrammar;
var city;

function renderLights() {

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 4, 2);
  directionalLight.position.multiplyScalar(100);
  directionalLight.intensity = 0.2;

  directionalLight.castShadow = true;
  directionalLight.shadow.camera.right = 60;
  directionalLight.shadow.camera.left = -60;
  directionalLight.shadow.camera.top = 60;
  directionalLight.shadow.camera.bottom = -60;

  directionalLight.shadow.mapSize.width = 4096;
  directionalLight.shadow.mapSize.height = 4096;
  scene.add(directionalLight);

  var directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight2.color.setHSL(0.1, 1, 0.95);
  directionalLight2.position.set(1, 4, 2);
  directionalLight2.position.multiplyScalar(100);
  directionalLight2.intensity = 0.4;
  scene.add(directionalLight2)


  var ambientLight = new THREE.AmbientLight(0x404040);
  ambientLight.intensity = 2.5;
  scene.add(ambientLight);
}

function onLoad(framework) {
  scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  renderer.shadowMap.enabled = true;
  renderer.antialias = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderLights();

  camera.position.set(1, 40, 70);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // Initialize 
  city = new City();
  loadGeometries();
  resetShapeGrammar();

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  gui.add(shapeGrammar, 'iterations', 0, 70).step(1).onChange(function(newVal){
    shapeGrammar.iterations = newVal;
    clearScene();
    initRender = false;
    rendered = false;
  });

  var button = {
    rerender: function() {     
      clearScene();
      resetShapeGrammar();
      rendered = false;
    },
    shadows: function() {     
      clearScene();
      initRender = false;
      rendered = false;
      shadowsOn = !shadowsOn;
    }
  };

  gui.add(button,'rerender');
  gui.add(button,'shadows');
}


/**
  * Clears the scene by removing all geometries 
  * (Leaves the 3 lights)
  */
function clearScene() {
  var obj;
  for( var i = scene.children.length - 1; i > 3; i--) {
    obj = scene.children[i];
    scene.remove(obj);
  }
}

function resetShapeGrammar() {
  if (shapeGrammar) {
    var iter = shapeGrammar.iterations;
  }

  var shapes = city.makeCity();

  shapeGrammar = new ShapeGrammar(city);
  initRender = true;

  if (iter) {
    shapeGrammar.iterations = iter;
  }
}

/**
  * Load custom geometry .obj's from the assets folder.
  * Increments loaded when finished loading an object.
  * Called once when the scene loads.
  */
function loadGeometries() {
  
  var mtlLoader = new MTLLoader();

  //TODO: replace with custom material, or MTLLoader
  var material = new THREE.MeshLambertMaterial({
    color: 0x554444
  });

  mtlLoader.setPath('./../assets/');

  for (var shape in Geometry) {
    var path = Geometry[shape].path;
    mtlLoader.load(path + '.mtl', 
      function(shape){
        return (
          function(materials){
            materials.preload();
            var path = Geometry[shape].path;

            var objLoader = new THREE.OBJLoader();
            objLoader.setPath('./../assets/');
            objLoader.setMaterials(materials);

            objLoader.load(path + '.obj', function(s){ 
              return (function(obj){
                obj.position.set(0, 0, 0);
                obj.rotation.set(0, 0, 0);
                obj.scale.set(1, 1, 1);

                obj.bbox = new THREE.Box3().setFromObject(obj);
                obj.traverse(function(child) {
                  if (child instanceof THREE.Mesh) {
                    child.geometry.center();
                    obj.material = child.material;
                  }
                })

                Geometry[s].obj = obj;

                obj.castShadow = shadowsOn;
                obj.receiveShadow = shadowsOn;

                var color = obj.material.color;
                obj.material =  new THREE.MeshPhongMaterial(obj.material);
                obj.material.color = color;
               
                loaded += 1;
              });
            }(shape));
        }
      );

    }(shape));
  }
}


/**
  * Renders the given shapeGrammar
  */
function renderShapeGrammar(iterations) {


  // ground
  var mat = new THREE.MeshLambertMaterial({color: 0xaaaaaa});
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(60,60), mat);
  mesh.rotation.x = Math.PI / 2;
  mesh.material.side = THREE.DoubleSide;
  mesh.position.set(20,-0.1,20);
  mesh.receiveShadow = shadowsOn;
  mesh.castShadow = shadowsOn;
  scene.add(mesh);


  var set = initRender ? shapeGrammar.doIterations(iterations) : shapeGrammar.shapeSet;
  set.forEach((node) => {
    var geo = Geometry[node.shape].obj.clone();

    geo.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z);
    geo.scale.set(node.scale.x, node.scale.y, node.scale.z);
    geo.position.set(node.position.x, node.position.y, node.position.z);

    
    geo.material = Geometry[node.shape].obj.material;

    geo.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = geo.material;
        child.castShadow = shadowsOn;
        child.receiveShadow = shadowsOn;
      }
    });

    
    if (node.iteration <= iterations) {
     scene.add(geo);
    }
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
