import Stats from 'stats-js'
import DAT from 'dat-gui'

import LSystem from './LSystem';
import Turtle from './Turtle';

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE)

const defaultAxiom = 'FX';
const defaultGrammar = ``;

export default class Framework {
  constructor (axiom = defaultAxiom, grammar = defaultGrammar) {
    this.scene = new THREE.Scene();

    this.lsystem = new LSystem(axiom, grammar);
    this.turtle = new Turtle(this.scene);

    this.gui = new DAT.GUI();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.stats = new Stats();
    // could be multiple lights
    this.light = new THREE.DirectionalLight( 0xffffff, 1 );
  }

  /***********
   * ACTIONS *
   ***********/

  clearScene() {
    for(let i = this.scene.children.length - 1; i >= 0; i--) {
      let obj = this.scene.children[i];
      this.scene.remove(obj);
    }
    this.scene.add(this.light);
  }

  doLsystem(iterations) {
    let result = this.lsystem.doIterations(iterations);
    this.turtle.reset();
    this.turtle = new Turtle(this.scene);
    this.turtle.renderSymbols(result);
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
    this.rendererSetup();
    this.statsSetup();
    this.lightSetup();
    this.guiSetup();
  }

  cameraSetup() {
    this.camera.position.set(1, 1, 2);
    this.camera.lookAt(new THREE.Vector3(0,0,0));
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
    this.light.color.setHSL(0.1, 1, 0.95);
    this.light.position.set(1, 3, 2);
    this.light.position.multiplyScalar(10);
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

    this.gui.add(this.guiVars, 'iterations', 0, 12).step(1).onChange((val) => {
      // clearScene(turtle);
      // this.doLsystem(this.lsystem, val, turtle);
    });
  }

  /******************
   * EVENT HANDLERS *
   ******************/

  onLoad() {
    document.body.appendChild(this.stats.domElement);
    document.body.appendChild(this.renderer.domElement);
    this.clearScene();
    this.setup();
    this.run();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onUpdate() {

  }

}
