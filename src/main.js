
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Lsystem, {linkedListToString} from './lsystem.js'
import Turtle from './turtle.js'
import House from './house-lsystem.js'
import Parser from './house-parser.js'
import {pcurve} from './helpers.js'

var turtle;
var parser;
var userInput = {
  iterations : 2,
  width : 0.2,
  angle : 60
}

// called after the scene loads
function onLoad(framework) {
  var {scene, camera, renderer, gui, stats} = framework;

  scene.background = new THREE.Color( 0x80d9ff );
  
  // Set light
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight)

  // set camera position
  camera.position.set(22, 20, 0);
  camera.lookAt(new THREE.Vector3(0,0,0));

  var geometry = new THREE.PlaneGeometry( 100, 100, 1, 1 );
  var material = new THREE.MeshPhongMaterial( { color: 0x6B8E23 } );
  var floor = new THREE.Mesh( geometry, material );
  floor.material.side = THREE.DoubleSide;
  floor.rotation.x = 3.14 / 2;
  scene.add( floor );

  var parser = new Parser(scene, userInput.iterations);
  var iterations = userInput.iterations;

  var c11 = Math.random();
  var c12 = Math.random();
  var c21 = Math.random();
  var c22 = Math.random();
for (var i = -45; i <= 45; i+= 3)
  {
      var j1 = 50 * pcurve(c11, c12, (i + 50) / 100);
      var j2 = - 50 * pcurve(c21, c22, (i + 50) / 100);
      for (var j = -45; j <= 45; j+= 3)
      {
        if ((j > j1 || j < j2))
        {
          var pos = new THREE.Vector3(i + rand(1.5), 0, j + rand(1.5));
          var lsys = new Lsystem();
          turtle = new Turtle(scene, pos, userInput.angle, userInput.width);
          doLsystem(lsys, userInput.iterations, turtle, pos);
        }
        else if ((i % 10 == 0) && (j % 10 == 0) && 
          (i > - 35 && i < 35) && (j > - 35 && j < 35) && 
          (j < (j1 - 10) && j > (j2 + 10)))
        {
            createCluster(new THREE.Vector3(i, 0, j), 10 + Math.random() * 5, 8 - Math.random() * 2, parser);
        }
      }
  }

}

function clearScene(parser) {
  var obj;
  for( var i = parser.scene.children.length - 1; i > 3; i--) {
      obj = parser.scene.children[i];
      parser.scene.remove(obj);
  }
}

function doLsystem(lsystem, iterations, turtle, position) {
    var result = lsystem.doIterations(iterations);
    turtle.clear();
    turtle = new Turtle(turtle.scene, position, userInput.angle, userInput.width);
    turtle.renderSymbols(result);
}

function makeHouse(house, iterations, parser) {
    var result = house.doIterations(iterations);
    parser.clear();
    parser = new Parser(parser.scene, iterations);
    parser.renderSymbols(result);
}

function createCluster(position, radius, population, parser)
{
  var d = radius - population;
  for (var i = position.x - radius; i < position.x + radius; i+= d)
    {
      for (var j = position.z - radius; j < position.z + radius; j+= d)
      {
          var pos = new THREE.Vector3(i + rand(1.5), 0, j + rand(1.5));
          if (Math.random() < 0.5)
          {
            var iterations = userInput.iterations;
            iterations *= population / 4;
            var house = new House(pos);
            makeHouse(house, iterations, parser);
        }
      }
    }
}

function rand(factor)
{
  if (Math.random() > 0.5)
  {
    return - Math.random() * factor;
  }
  else
  {
    return Math.random() * factor;
  }
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);