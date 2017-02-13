
const THREE = require('three');
const _ = require('lodash');
import Framework from './framework'
import Lsystem, { LinkedListToString } from './lsystem.js'
import City from './city.js'
import ShapeGrammar from './shapeGrammar.js'

var turtle;

function renderLight(scene) {
  var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);

  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, -10, 10);
  directionalLight.position.multiplyScalar(10);

  scene.add(directionalLight);
  scene.add(ambientLight);
}

function setCamera(camera) {
  camera.position.set(0, 0, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function onLoad(framework) {
  var { scene, camera, renderer, gui, stats } = framework;

  renderLight(scene);
  setCamera(camera);

  var shapeGrammar = new ShapeGrammar(scene);
  var city = new City(scene, shapeGrammar);

  city.renderBase();
  city.renderRings();
  city.renderDivisions();
  city.renderCells();
  city.renderBuildings();
  // city.renderRiver();


}


function onUpdate(framework) {

}

Framework.init(onLoad, onUpdate);
