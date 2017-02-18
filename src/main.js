require('file-loader?name=[name].[ext]!../index.html');




const THREE = require('three');
import Framework from './framework'
import Lsystem, {linkedListToString} from './lsystem'
import turtle from './turtle'
import ShapeGrammar from './shapegrammar'
import { Node } from './linkedlist'
import City from './city'
import {Geometry} from './ref'
const MTLLoader = require('three-mtl-loader'); 
const OBJLoader = require('jser-three-obj-loader');
OBJLoader(THREE);



var loaded = 0; // Are the geometries loaded? 
var rendered = false; // Have the shapes been rendered?
var initRender = true; // Generate a new shapeSet or use existing existing one?
var shadowsOn = false;

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
  directionalLight2.intensity = 0.5;
  scene.add(directionalLight2)

  var ambientLight = new THREE.AmbientLight(0x404040);
  ambientLight.intensity = 2;
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

  scene.background = new THREE.Color(0.85, 0.95, 1);

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


/**
 * Creates a new shape grammar, keeping the number of iterations
 * from the gui, then triggers a full rerender
 */
function resetShapeGrammar() {
  var iter = shapeGrammar ? shapeGrammar.iterations : null;
  var shapes = city.makeCity();
  shapeGrammar = new ShapeGrammar(city);
  shapeGrammar.iterations = iter ? iter : shapeGrammar.iterations;
  initRender = true;
  rendered = false;
}


/**
  * Load custom geometry .obj's from the assets folder.
  * Increments loaded when finished loading an object.
  * Called once when the scene loads.
  */
function loadGeometries() {
  var mtlLoader = new MTLLoader();

  // mtlLoader.setPath('./../assets/');

  for (var shape in Geometry) {
    var path = Geometry[shape].path;
    mtlLoader.load(Geometry[shape].mtlFile, 
      function(shape){
        return (
          function(materials){
            materials.preload();
            var path = Geometry[shape].path;

            var objLoader = new THREE.OBJLoader();
            // objLoader.setPath('./../assets/');
            objLoader.setMaterials(materials);

            objLoader.load(Geometry[shape].objFile, function(s){ 
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
  // TODO: replace with real ground, and roads, etc
  var mat = new THREE.MeshLambertMaterial({color: new THREE.Color(0.67, 0.70, 0.75)});
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(200,200), mat);
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

    var color =  Geometry[node.shape].obj.material.color;
   
    geo.material = new THREE.MeshPhongMaterial(Geometry[node.shape].obj.material);
    geo.material.color = new THREE.Color(color.r, color.g, color.b)
    geo.material.color.addScalar(node.colorOffset);

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
