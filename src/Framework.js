import Stats from 'stats-js'
import DAT from 'dat-gui'

import LSystem from './LSystem';
import Drawer from './Drawer';

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE)

const defaultAxiom = 'P';
const defaultGrammar = ``;

export default class Framework {
  constructor (axiom = defaultAxiom, grammar = defaultGrammar) {
    this.scene = new THREE.Scene();

    this.lsystem = new LSystem(axiom, grammar);

    this.gui = new DAT.GUI();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.stats = new Stats();

    this.iterations = 4; // default testing
  }

  /***********
   * ACTIONS *
   ***********/

  clearScene() {
    for(let i = this.scene.children.length - 1; i >= 0; i--) {
      let obj = this.scene.children[i];
      this.scene.remove(obj);
    }
    this.lights.forEach((l) => {
      this.scene.add(l);
    });
    this.scene.background = this.background;
  }

  doLsystem() {
    let result = this.lsystem.doIterations(this.iterations);
    Framework.printSymbols(result);
    this.drawer = new Drawer(this.scene);
    this.drawer.renderSymbols(result);
  }

  run() {
    this.stats.begin();
    this.onUpdate();
    this.renderer.render(this.scene, this.camera);
    this.stats.end();
    requestAnimationFrame(this.run.bind(this));
  }

  /********************
   * FRAMEWORK SETUP  *
   ********************/
  setup() {
    this.cameraSetup();
    this.sceneSetup();
    this.rendererSetup();
    this.statsSetup();
    this.lightSetup();
    this.guiSetup();
  }

  cameraSetup() {
    this.camera.position.set(1, 1, 2);
    this.camera.lookAt(new THREE.Vector3(0,0,0));
    let controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.target.set(0, 0, 0);
    controls.rotateSpeed = 0.3;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 2.0;
  }

  sceneSetup() {
    let loader = new THREE.CubeTextureLoader();
    let urlPrefix = 'img/';

    let skymap = new THREE.CubeTextureLoader().load([
        urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
        urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
        urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ] );

    this.background = skymap;
  }

  rendererSetup() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x020202, 0);
  }

  statsSetup() {
    this.stats.setMode(1);
  }

  lightSetup() {
    let dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(1, 3, 2);
    dirLight.position.multiplyScalar(10);
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.3);

    this.lights = [dirLight, ambientLight];
  }

  guiSetup() {
    let textArea = document.getElementById('grammar');
    textArea.value = defaultGrammar;
    document.addEventListener('click', (e) => {
      if (e.target !== textArea) {
       textArea.blur();
      }
    });

    this.guiVars = {
      'fov': 75,
      'axiom': defaultAxiom,
      'iterations': 0
    };

    this.gui.add(this.guiVars, 'fov', 0, 180).onChange((val) => {
      this.camera.updateProjectionMatrix();
    });

    this.gui.add(this.guiVars, 'axiom').onChange((val) => {
      // this.lsystem.UpdateAxiom(val);
      // this.doLsystem(this.lsystem, this.lsystem.iterations, turtle);
    });

    this.gui.add(this, 'iterations', 0, 12).step(1).onChange((val) => {
      this.clearScene();
      this.doLsystem();
    });
  }

  /******************
   * EVENT HANDLERS *
   ******************/

  onLoad() {
    document.body.appendChild(this.stats.domElement);
    document.body.appendChild(this.renderer.domElement);
    this.setup();
    this.clearScene();
    this.doLsystem()
    this.run();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onUpdate() {

  }

  /*******************
   * DEBUGGING TOOLS *
   *******************/

  static printSymbols(symbols) {
    let str = "";
    symbols.forEach((sym) => {
      str += sym.char;
    });
    console.log(str);
    return str;
  }

}
