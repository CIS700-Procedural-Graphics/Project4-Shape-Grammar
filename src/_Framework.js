const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE)
import Stats from 'stats-js'
import DAT from 'dat-gui'

// when the scene is done initializing, the function passed as `callback` will be executed
// then, every frame, the function passed as `update` will be executed
function init(callback, update) {
  let stats = new Stats();
  stats.setMode(1);

  document.body.appendChild(stats.domElement);

  let gui = new DAT.GUI();
  console.log(window.innerHeight);

  window.addEventListener('load', function() {
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    let renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x020202, 0);

    window.addEventListener('resize', function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    document.body.appendChild(renderer.domElement);

    let framework = {gui, stats, scene, camera, renderer};

    (function tick() {
      stats.begin();
      update(framework);
      renderer.render(scene, camera);
      stats.end();
      requestAnimationFrame(tick);
    })();

    return callback(framework);
  });
}


export default {
  init: init
}
