
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
//import Lsystem, {LinkedListToString} from './lsystem.js'
import Turtle from './turtle.js'
const OBJLoader = require('three-obj-loader')(THREE)

//global scope turtle
var turtle;

var it = function(){
    this.RunGeneration = function(){
        turtle.RunGeneration();
    }
}


// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

    //initializing the turtle
    turtle = new Turtle(framework.scene, framework.renderer);
    turtle.init();   
    
  // initialize a simple box and material
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);

  // set camera position
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
    
    var kaipan = new it();
    gui.add(kaipan, 'RunGeneration').onclick;
    

//  gui.add(lsys, 'axiom').onChange(function(newVal) {
//    lsys.UpdateAxiom(newVal);
//    doLsystem(lsys, lsys.iterations, turtle);
//  });
//
//    //changing grammar
//    gui.add(grammar, 'F').onChange(function(newVal) {
//        clearScene(turtle);
//        lsys.UpdateGrammarF(newVal);
//        doLsystem(lsys, lsys.iterations, turtle);
//  });
//    
//    gui.add(grammar, 'Prob_F').onChange(function(newVal) {
//        clearScene(turtle);
//        lsys.UpdateGrammarProbF(newVal);
//        doLsystem(lsys, lsys.iterations, turtle);
//  });
//    
//    gui.add(grammar, 'X').onChange(function(newVal) {
//        clearScene(turtle);
//        lsys.UpdateGrammarX(newVal);
//        doLsystem(lsys, lsys.iterations, turtle);
//  });
//    
//    gui.add(grammar, 'Prob_X').onChange(function(newVal) {
//        clearScene(turtle);
//        lsys.UpdateGrammarProbX(newVal);
//        doLsystem(lsys, lsys.iterations, turtle);
//  });
//
//    gui.add(grammar, 'A').onChange(function(newVal) {
//        clearScene(turtle);
//        lsys.UpdateGrammarA(newVal);
//        doLsystem(lsys, lsys.iterations, turtle);
//  });
//    
//    gui.add(grammar, 'Prob_A').onChange(function(newVal) {
//        clearScene(turtle);
//        lsys.UpdateGrammarProbA(newVal);
//        doLsystem(lsys, lsys.iterations, turtle);
//  });
//    
//  
//  //changing iterations  
//  gui.add(lsys, 'iterations', 0, 100).step(1).onChange(function(newVal) {
//    clearScene(turtle);
//    doLsystem(lsys, newVal, turtle);
//  });
    
//    gui.add(turtle, "angle", 0, 360).step(1).onChange(function(newVal)
//    {
//        //turtle.angle = newVal;
//        //console.log(turtle.angle);
//        turtle.setAngle(newVal);
//    });
//    
}

// clears the scene by removing all geometries added by turtle.js
//function clearScene(turtle) {
//  var obj;
//  for( var i = turtle.scene.children.length - 1; i > 3; i--) {
//      obj = turtle.scene.children[i];
//      turtle.scene.remove(obj);
//  }
//}
//
//function doLsystem(lsystem, iterations, turtle) {
//    var result = lsystem.DoIterations(iterations);
//    turtle.clear();
//    turtle = new Turtle(turtle.scene);
//    turtle.renderSymbols(result);
//}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
