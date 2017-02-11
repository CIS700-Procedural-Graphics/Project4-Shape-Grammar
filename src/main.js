//skybox images from: https://github.com/simianarmy/webgl-skybox/tree/master/images

const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Shape from './shape.js'

var shapeType = require('./shape.js');

/*
var building_Material = new THREE.ShaderMaterial({
  uniforms:
  {
    shapeColor:
    {
        type: "v3",
        value: new THREE.Color(0xB266FF) // violet
    }
  },
  vertexShader: require('./shaders/buildings-vert.glsl'),
  fragmentShader: require('./shaders/buildings-frag.glsl')
});
*/
// var guiParameters = {}

// var cube = new THREE.BoxGeometry( 1, 1, 1 );
// // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
// var cube1 = new THREE.Mesh( cube, building_Material );

var shapeList = [];

var shapeGrammar = {
        // '+' : this.rotateTurtle.bind(this, 30, 0, 30),
        // '-' : this.rotateTurtle.bind(this, -30, 0, -30),
        // 'F' : this.makeCylinder.bind(this, 2, 0.1),
        // 'X' : this.makeCylinder.bind(this, 2, 0.1), //branch
        // 'A' : this.makeFruit.bind(this, 0.2), //leaf
        // 'L' : this.makeLeaf.bind(this, 0.1, 0.2), //fruit
        // 'a' : this.radialrotate.bind(this), //radial growth
        // '[' : this.saveState.bind(this),
        // ']' : this.respawnAtState.bind(this)
    };
//shape extrusion
/*
var shape = new THREE.Shape();
shape.moveTo( 0, 0 );
var numSteps = 10, stepSize = 10;

for ( var i = 0; i < numSteps; i ++ ) {

    shape.lineTo( i * stepSize, ( i + 1 ) * stepSize );
    shape.lineTo( ( i + 1 ) * stepSize, ( i + 1 ) * stepSize );

}

var extrudeSettings = { amount: 100, bevelEnabled: false };
var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

var material = new THREE.MeshBasicMaterial( {color: 0xffffff } );
var steps = new THREE.Mesh( geometry, material );
*/

function changeGUI(gui, camera)
{
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

function setupLightsandSkybox(scene, camera)
{
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

  //set plane
  var geometry = new THREE.PlaneGeometry( 100, 100, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0x696969, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.rotateX(90 * 3.14/180);
  scene.add( plane );

  //create grid
  var size = 50;
  var divisions = 50;
  var gridHelper = new THREE.GridHelper( size, divisions );
  scene.add( gridHelper );

  // set camera position
  camera.position.set(0, 1, 5);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // scene.add(lambertCube);
  scene.add(directionalLight);
}

function addToScene(scene)
{
  //change building.shapeColor everytime you add something to the scene
  // scene.add( cube1 );
}

function addToShapeList(shape)
{
  shapeList.push(shape);
}

function replaceShape(shape)
{
  var func = shapeGrammar[shape.type];
  if (func) {
      func();
  }
}

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  setupLightsandSkybox(scene, camera);
  changeGUI(gui, camera);

  for(var i=0; i<shapeList.length; i++)
  {
    replaceShape(shapeList[i]);
  }
  // addToScene(scene); //things can be added when they are made maybe
}

// called on frame updates
function onUpdate(framework)
{}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
