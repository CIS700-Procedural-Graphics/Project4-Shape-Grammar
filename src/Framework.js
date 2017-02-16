import Stats from 'stats-js'
import DAT from 'dat-gui'

import LSystem from './LSystem';
import Drawer from './Drawer';
import { v3, rgb, randColor, randGray, randSign, upperRand, randRange } from './Utils'

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE)
const OBJLoader = require('three-obj-loader')(THREE)

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
    this.meshes = {}; // imported meshes
    this.iterations = 7; // default testing
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
    let result = this.lsystem.doIterations(Math.floor(this.iterations));
    Framework.printSymbols(result);
    this.drawer = new Drawer(this.scene, this.meshes);
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
    this.rendererSetup();
    this.statsSetup();
    this.lightSetup();
    this.guiSetup();
  }

  loadResources(callback) {
    let objLoader = new THREE.OBJLoader();
    let textureLoader = new THREE.CubeTextureLoader();
    let workGroup = 5;
    let finalCallback = (dbg) => {
      workGroup--;
      if (workGroup <= 0) {
        callback();
      }
    }

    let loadObj = (name, color, obj) => {
      let lambert = new THREE.MeshLambertMaterial({color: 0x888888, side: THREE.DoubleSide});
      let geometry = obj.children[0].geometry;
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material = geometry;
        }
      });
      this.meshes[name] = new THREE.Mesh(geometry, lambert);
      finalCallback('name');
    }

    let skymap = new THREE.CubeTextureLoader().load([
      'img/px.jpg', 'img/nx.jpg',
      'img/py.jpg', 'img/ny.jpg',
      'img/pz.jpg', 'img/nz.jpg'
    ], (texture) => {
      this.background = texture;
      finalCallback('texture');
    });

    objLoader.load('obj/tower.obj', loadObj.bind(this, 'tower', 0x888888));
    objLoader.load('obj/lpt_0.obj', loadObj.bind(this, 'lpt_0', 0x888888));
    objLoader.load('obj/lpt_1.obj', loadObj.bind(this, 'lpt_1', 0x888888));
    objLoader.load('obj/lpt_2.obj', loadObj.bind(this, 'lpt_2', 0x888888));
    objLoader.load('obj/door.obj', loadObj.bind(this, 'door', 0x888888));
    objLoader.load('obj/window.obj', loadObj.bind(this, 'window', 0xffffff));

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
    this.loadResources(() => {
      this.setup();
      this.clearScene();
      this.doLsystem()
      this.run();
    });
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
