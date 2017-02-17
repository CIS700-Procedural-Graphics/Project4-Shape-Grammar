global.THREE = require('three');
const createApp = require('scene-template');
const createLoop = require('raf-loop');
const path = require('path');
const MTLLoader = require('./');
const OBJLoader = require('jser-three-obj-loader')(THREE);
const mtlLoader = new MTLLoader();
let loader = new THREE.OBJLoader();
mtlLoader.setBaseUrl('./assets/');
mtlLoader.setPath('./assets/');
let light = new THREE.AmbientLight(0xffffff, 1.5);
mtlLoader.load('spider.mtl', (matl) => {
  matl.preload();
  loader.setMaterials(matl);
  loader.load('./assets/spider.obj', function(obj) {
    createScene(obj);
  });
});

function createScene(obj) {

  const opts = {
    renderer: {
      antialias: true
    },
    controls: {
      theta: 50 * Math.PI / 180,
      phi: -50 * Math.PI / 180,
      distance: 150,
      type: 'orbit'
    },
    objects: [
      obj,
      light
    ]
  };
  // Create our basic ThreeJS application
  const {
    renderer,
    camera,
    scene,
    updateControls
  } = createApp(opts);
  // for threejs inspector
  window.scene = scene;
  renderer.setClearColor(0xffffff);
  // Start our render loop
  createLoop((dt) => {
    // update time in seconds
    // material.uniforms.time.value += dt / 1000;
    // render
    updateControls();
    renderer.render(scene, camera);
  }).start();
}
