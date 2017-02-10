//skybox images from: https://github.com/simianarmy/webgl-skybox/tree/master/images

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Shape from './shape.js'

var myShape = require('./shape.js');

var building_Material = new THREE.ShaderMaterial({
  // uniforms:
  // {
  //   feathercolor:
  //   {
  //       type: "v3",
  //       value: new THREE.Vector3( 0.0902, 0.1961, 0.5411 )
  //       // value: new THREE.Color(0x17328A)
  //   }
  // },
  vertexShader: require('./shaders/buildings-vert.glsl'),
  fragmentShader: require('./shaders/buildings-frag.glsl')
});

var guiParameters = {
    BranchColor: new THREE.Color(0x17328A),// [23,50,138],
    LeafColor: [216,42,42],
    FruitColor: [17,191,52],
}

function changeGUI(framework)
{
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // var f1 = gui.addFolder('Colors');
  // f1.addColor(guiParameters, 'BranchColor').onChange(function(newVal)
  // {
  //   guiParameters.BranchColor = (new THREE.Color(newVal)).getHex();
  //   console.log(guiParameters.BranchColor);
  //   doLsystem(lsys, lsys.iterations, turtle);
  // });
  // f1.addColor(guiParameters, 'LeafColor').onChange(function(newVal)
  // {
  //   guiParameters.LeafColor = newVal;
  // });
  // f1.addColor(guiParameters, 'FruitColor').onChange(function(newVal)
  // {
  //   guiParameters.FruitColor = newVal;
  // });

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
}

function setupLightsandSkybox(framework)
{
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // Set light
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);

  // set skybox
  var loader = new THREE.CubeTextureLoader();
  var urlPrefix = 'images/skymap/';
  var skymap = new THREE.CubeTextureLoader().load([
      urlPrefix + 'skyposx.png', urlPrefix + 'skynegx.png',
      urlPrefix + 'skyposy.png', urlPrefix + 'skynegy.png',
      urlPrefix + 'skyposz.png', urlPrefix + 'skynegz.png'
  ] );
  scene.background = skymap;

  // set camera position
  camera.position.set(0, 1, 5);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // scene.add(lambertCube);
  scene.add(directionalLight);
}


// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  setupLightsandSkybox(framework);
  changeGUI(framework);

}

// called on frame updates
function onUpdate(framework)
{

}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
