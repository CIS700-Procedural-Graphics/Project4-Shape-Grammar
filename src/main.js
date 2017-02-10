
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import ShapeGrammar from './shapeGrammar'
import ShapeRenderer from './shapeRenderer'

//OBJ Loading
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

/*
OBJLoader = new THREE.OBJLoader();
OBJLoader.load('res/OBJs/leaf.obj', function(obj) {
    leafGeometry = obj.children[0].geometry;
});
*/

var shapeRenderer;
var cityGeometry;
var iterations = { value : 0 };

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;
  
  
  //Set up directional light
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  
  scene.add(directionalLight);
  
  // var helper = new THREE.CameraHelper(spotlight.shadow.camera);
  // scene.add(helper);
  
  // set skybox
  var loader = new THREE.CubeTextureLoader();
  var urlPrefix = 'res/images/skymap/';

  var skymap = new THREE.CubeTextureLoader().load([
      urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
      urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
      urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
  ] );
  scene.background = skymap;
  
  //Add the ground plane
  var planeGeometry = new THREE.PlaneGeometry(750, 750);
  var planeMaterial = new THREE.MeshPhongMaterial( {color: 0x778899, side: THREE.DoubleSide} );
  planeMaterial.shininess = 5; //default 30
  var planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
  planeMesh.rotateX(90 * Math.PI / 180);
  planeMesh.position.set(0, -1, 0);
  //planeMesh.receiveShadow = true;
  scene.add(planeMesh);
  
  // set camera position
  camera.position.set(18.5, 27, 8);
  camera.lookAt(new THREE.Vector3(0,0,0));
  
  //Create a new Shape Grammar
  var shapeGrammar = new ShapeGrammar();
  cityGeometry = shapeGrammar.doIterations(0); //return set of nodes
  
  //Create an instance of the shape renderer
  shapeRenderer = new ShapeRenderer(cityGeometry, scene);
  shapeRenderer.drawGeometry();
  
  shapeRenderer.doShapeGrammar = function() {
  	clearScene(this);
  	cityGeometry = shapeGrammar.doIterations(iterations.value);
  	shapeRenderer.geometrySet = cityGeometry;
  	this.drawGeometry();
  }
  
  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
  
  gui.add(iterations, 'value', 0, 5).step(1).name('# of Iterations');
  gui.add(shapeRenderer, 'doShapeGrammar').name('Do Shape Grammar');
}

function clearScene(shapeRenderer) {
	var sceneObject;
	// console.log('Scene Objects: ')
	for(var i = shapeRenderer.scene.children.length - 1; i > 1; i--) {
		sceneObject = shapeRenderer.scene.children[i];
		shapeRenderer.scene.remove(sceneObject);
		// console.log(sceneObject);
	}
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
