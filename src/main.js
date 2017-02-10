
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Lsystem, {LinkedListToString} from './lsystem.js'
import Turtle from './turtle.js'

var lsys;
var turtle;
var numIters;
var flowerGeo;
var time;

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // initialize a simple box and material
  var directionalLight = new THREE.PointLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 5, 5);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);

  // set camera position
  camera.position.set(0, 20, 20);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  var loader = new THREE.TextureLoader();
  var background = new THREE.TextureLoader().load('Sky-Blue-Sky.jpg');
  scene.background = background;

  //ground plane of grass
  var geometry = new THREE.PlaneGeometry( 100, 100 );
  var material = new THREE.MeshLambertMaterial( {color: 0x1eef0f, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.position.set(0,-5.0,0);
  plane.rotation.set(3.1415/2.0, 0, 0);
  plane.receiveShadows = true;
  scene.add(plane);

  // initialize LSystem and a Turtle to draw
  lsys = new Lsystem();
  turtle = new Turtle(scene);

  doLsystem(lsys, 2, turtle);
}

function getMaterial()
{
  var roof;
        var wall;
        //all the colors that might be used for the house
        var white = new THREE.Vector3(1.0, 1.0, 1.0);
        var tan = new THREE.Vector3((220.0/255.0), (198.0/255.0), (165.0/255.0));
        var blue = new THREE.Vector3((172.0/255.0), (210.0/255.0), (243.0/255.0));
        var charcoal = new THREE.Vector3((88.0/255.0), (87.0/255.0), (86.0/255.0));
        var grey = new THREE.Vector3((142.0/255.0), (142.0/255.0), (142.0/255.0));

        var rando = Math.random();
        if(rando < 0.6)
        {
            roof = charcoal;
        }
        else
        {
            roof = grey;
        }

        var rando2 = Math.random();
        if(rando2 < 0.1)
        {
            wall = blue;
        }
        else if(rando2 < 0.5)
        {
            wall = white;
        }
        else if(rando2 < 0.8)
        {
            wall = tan;
        }
        else
        {
            wall = tan; //turn to brick
        }

        var houseColor = new THREE.ShaderMaterial({
            uniforms: {
                roofColor: {value: roof},
                wallColor: {value: wall},
            },
            //using my own shaders to create white pink gradient
            vertexShader: require('./shaders/house-vert.glsl'),
            fragmentShader: require('./shaders/house-frag.glsl')
        });
        return houseColor;
}

function doLsystem(lsystem, iterations, turtle) {
    var result = lsystem.doIterations(iterations, new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(0.0, 3.1415/2.0, 0.0), new THREE.Vector3(2.0, 1.0, 1.0), getMaterial(), new THREE.Vector3(0.0, 0.0, 1.0), new THREE.Vector3(1.0, 0.0, 0.0), false);
    turtle.renderSymbols(result);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
