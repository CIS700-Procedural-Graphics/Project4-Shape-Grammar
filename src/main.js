
const THREE = require('three');
const _ = require('lodash');
import Framework from './framework'
import Lsystem, { LinkedListToString } from './lsystem.js'
import Turtle from './turtle.js'
import City from './city.js'

var turtle;

function renderLight(scene) {
  var directionalLight = new THREE.DirectionalLight(0xffffff, 1);

  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);

  scene.add(directionalLight);
}

function setCamera(camera) {
  camera.position.set(0, 0, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function onLoad(framework) {
  var { scene, camera, renderer, gui, stats } = framework;

  renderLight(scene);
  setCamera(camera);

  var city = new City(scene);

  city.renderBase();
  city.renderNodes();
  city.renderEdges();
}


function onUpdate(framework) {

}

Framework.init(onLoad, onUpdate);
