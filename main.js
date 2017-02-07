const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'

var feather_Material = new THREE.ShaderMaterial({
  // uniforms:
  // {
  //   feathercolor:
  //   {
  //       type: "v3",
  //       value: new THREE.Vector3( 0.0902, 0.1961, 0.5411 )
  //       // value: new THREE.Color(0x17328A)
  //   }
  // },
  vertexShader: require('./shaders/building-vert.glsl'),
  fragmentShader: require('./shaders/building-frag.glsl')
});

var guiParameters = {

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

  // set camera position
  camera.position.set(0, 1, 20);
  camera.lookAt(new THREE.Vector3(0,0,0));

  // scene.add(lambertCube);
  scene.add(directionalLight);
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

  // gui.add(lsys, 'axiom').onChange(function(newVal) {
  //   lsys.UpdateAxiom(newVal);
  //   doLsystem(lsys, lsys.iterations, turtle);
  // });
  //
  // gui.add(lsys, 'iterations', 0, 7).step(1).onChange(function(newVal) {
  //   clearScene(turtle);
  //   doLsystem(lsys, newVal, turtle);
  // });
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

// clears the scene by removing all geometries added by turtle.js
// function clearScene(turtle) {
//   var obj;
//   for( var i = turtle.scene.children.length - 1; i > 3; i--) {
//       obj = turtle.scene.children[i];
//       turtle.scene.remove(obj);
//   }
// }
//
// function doLsystem(lsystem, iterations, turtle) {
//     var result = lsystem.DoIterations(iterations);
//     turtle.clear();
//     turtle = new Turtle(turtle.scene);
//         turtle.branchcolor = guiParameters.BranchColor;
//     turtle.renderSymbols(result);
// }

// called on frame updates
function onUpdate(framework)
{

}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
