
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);
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
  var geometry = new THREE.PlaneGeometry( 160, 160 );
  var material = new THREE.MeshLambertMaterial( {color: 0x1eef0f, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.position.set(0,-1.01,0);
  plane.rotation.set(3.1415/2.0, 0, 0);
  plane.receiveShadows = true;
  scene.add(plane);

  //build layout
  var roadGeo = new THREE.PlaneGeometry( 2, 2 );
  var roadMaterial = new THREE.MeshLambertMaterial( {color: 0x8d8d8d, side: THREE.DoubleSide} );

  for(var i = 0; i < 60; i++)
  {
      var road1 = new THREE.Mesh( roadGeo, roadMaterial );
      road1.position.set(-60, -1, (i - 30)*2);
      road1.rotation.set(3.1415/2.0, 0, 0);
      scene.add(road1);
      var road2 = new THREE.Mesh( roadGeo, roadMaterial );
      road2.position.set(60, -1, (i - 30)*2);
      road2.rotation.set(3.1415/2.0, 0, 0);
      scene.add(road2);
  }

  var curves = new Array(5);  

  for(var i = -40; i <= 40; i += 20)
  {
      var points = new Array(5);
      for(var j = -60; j <= 60; j += 30)
      {
          var offset = Math.random() * 10 - 5;
          points[(j + 60)/30] = (new THREE.Vector3(j, -1, i + offset));
      }
      curves[(i + 40)/20] = (new THREE.CatmullRomCurve3( [
          points[0], points[1], points[2], points[3], points[4]
      ] ));
  }

  // initialize LSystem and a Turtle to draw
  turtle = new Turtle(scene);

  for(var i = 0; i < curves.length; i++)
  {
      var thisCurve = curves[i];
      for(var j = 0; j < 100; j++)
      {
          var road = new THREE.Mesh( roadGeo, roadMaterial );
          road.position.set(thisCurve.getPoints(100)[j].x, thisCurve.getPoints(100)[j].y, thisCurve.getPoints(100)[j].z);
          road.rotation.set(3.1415/2.0, 0, 0);
          scene.add(road);
      }
      for(var k = 4; k < thisCurve.getLength() - 8; k += 8)
      {
          var len = Math.floor(thisCurve.getLength()/8);
          var pos = new THREE.Vector3(thisCurve.getPoints(len)[(k+4)/8].x, thisCurve.getPoints(len)[(k+4)/8].y + 1, thisCurve.getPoints(len)[(k+4)/8].z + 4);
          var ang = thisCurve.getTangent((k+4)/8).angleTo(new THREE.Vector3(0, 0, 1));
          var rot = new THREE.Vector3(0, ang, 0);
          var zaxis = thisCurve.getTangent((k+4)/8);
          var xaxis = new THREE.Vector3(zaxis.x, zaxis.y, zaxis.z);
          xaxis.applyAxisAngle(new THREE.Vector3(0, 1, 0), 3.1415/2.0);
          lsys = new Lsystem();
          doLsystem(lsys, 2, turtle, pos, rot, xaxis, zaxis);
          var road1 = new THREE.Mesh( roadGeo, roadMaterial );
          road1.position.set(thisCurve.getPoints(len)[(k+4)/8].x - 1, thisCurve.getPoints(len)[(k+4)/8].y, thisCurve.getPoints(len)[(k+4)/8].z + 1.5);
          road1.rotation.set(3.1415/2.0, 0, 0);
          scene.add(road1);

          var pos = new THREE.Vector3(thisCurve.getPoints(len)[(k+4)/8].x, thisCurve.getPoints(len)[(k+4)/8].y + 1, thisCurve.getPoints(len)[(k+4)/8].z - 4);
          var ang = thisCurve.getTangent((k+4)/8).angleTo(new THREE.Vector3(0, 0, 1));
          var rot = new THREE.Vector3(0, ang + 3.1415, 0);
          var tang = thisCurve.getTangent((k+4)/8);
          var zaxis = new THREE.Vector3(-tang.x, tang.y, -tang.z);
          var xaxis = new THREE.Vector3(zaxis.x, zaxis.y, zaxis.z);
          xaxis.applyAxisAngle(new THREE.Vector3(0, 1, 0), 3.1415/2.0);
          lsys = new Lsystem();
          doLsystem(lsys, 2, turtle, pos, rot, xaxis, zaxis);
          var road2 = new THREE.Mesh( roadGeo, roadMaterial );
          road2.position.set(thisCurve.getPoints(len)[(k+4)/8].x + 1, thisCurve.getPoints(len)[(k+4)/8].y, thisCurve.getPoints(len)[(k+4)/8].z - 1.5);
          road2.rotation.set(3.1415/2.0, 0, 0);
          scene.add(road2);
      }
  }

  var objLoader = new THREE.OBJLoader();
  objLoader.load('tree.obj', function(obj){

      // LOOK: This function runs after the obj has finished loading
      var treeGeo = obj.children[0].geometry; 
      var material = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
      var green = new THREE.Vector3((31.0/255.0), (102.0/255.0), (45.0/255.0));
      var brown = new THREE.Vector3((110.0/255.0), (58.0/255.0), (23.0/255.0));
      var treeColor = new THREE.ShaderMaterial({
            uniforms: {
                roofColor: {value: green},
                wallColor: {value: brown},
            },
            //using my own shaders to create white pink gradient
            vertexShader: require('./shaders/house-vert.glsl'),
            fragmentShader: require('./shaders/house-frag.glsl')
        });

  for(var i = 0; i < curves.length-1; i++)
  {
      for(var j = 5; j < 95; j += 2)
      {
          var zlow = curves[i].getPoints(100)[j].z;
          var zhigh = curves[i+1].getPoints(100)[j].z;
          var zdist = zhigh - zlow;
          //console.log(zdist);
          if(zdist > 16)
          {
              for(var k = zlow + 8; k <= zhigh - 8; k+=2)
              {
                  var rando = Math.random();
                  if(rando < 0.5)
                  {
                      var tree = new THREE.Mesh(treeGeo, treeColor);
                      var offset1 = Math.random()*2-1;
                      var offset2 = Math.random()*2-1;
                      tree.position.set(curves[i].getPoints(100)[j].x + offset1, -0.5, k + offset2);
                      tree.scale.set(0.75, 1.0, 0.75);
                      scene.add(tree);
                  }
              }
          } 
      }
  }
  });

  objLoader.load('lamppost.obj', function(obj){

      // LOOK: This function runs after the obj has finished loading
      var lampGeo = obj.children[0].geometry; 
      var material = new THREE.MeshLambertMaterial( {color: 0x2c2b2b, side: THREE.DoubleSide} );

      for(var i = -35; i < 40; i += 10)
      {
          var lamp1 = new THREE.Mesh(lampGeo, material);
          lamp1.position.set(-61, 0.5, i+3);
          lamp1.rotation.set(0, 3.1415/2.0, 0);
          lamp1.scale.set(0.4, 0.6, 0.4);
          scene.add(lamp1);

          var lamp2 = new THREE.Mesh(lampGeo, material);
          lamp2.position.set(-59, 0.5, i-3);
          lamp2.rotation.set(0, -3.1415/2.0, 0);
          lamp2.scale.set(0.4, 0.6, 0.4);
          scene.add(lamp2);

          var lamp3 = new THREE.Mesh(lampGeo, material);
          lamp3.position.set(59, 0.5, i+3);
          lamp3.rotation.set(0, 3.1415/2.0, 0);
          lamp3.scale.set(0.4, 0.6, 0.4);
          scene.add(lamp3);

          var lamp4 = new THREE.Mesh(lampGeo, material);
          lamp4.position.set(61, 0.5, i-3);
          lamp4.rotation.set(0, -3.1415/2.0, 0);
          lamp4.scale.set(0.4, 0.6, 0.4);
          scene.add(lamp4);
      }

  for(var i = 0; i < curves.length; i++)
  {
      for(var j = 1; j < 99; j += 8)
      {
          var lamp1 = new THREE.Mesh(lampGeo, material);
          lamp1.position.set(curves[i].getPoints(100)[j].x, 0.5, curves[i].getPoints(100)[j].z + 1);
          lamp1.rotation.set(0, 3.1415, 0);
          lamp1.scale.set(0.4, 0.6, 0.4);
          scene.add(lamp1);

          var lamp2 = new THREE.Mesh(lampGeo, material);
          lamp2.position.set(curves[i].getPoints(100)[j].x, 0.5, curves[i].getPoints(100)[j].z - 1);
          lamp2.scale.set(0.4, 0.6, 0.4);
          scene.add(lamp2);
      }
  }
  });
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
        if(rando2 < 0.2)
        {
            wall = blue;
        }
        else if(rando2 < 0.6)
        {
            wall = white;
        }
        else
        {
            wall = tan;
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

function doLsystem(lsystem, iterations, turtle, pos, rot, xax, zax) {
    var result = lsystem.doIterations(iterations, pos, rot, new THREE.Vector3(2.0, 1.0, 1.0), getMaterial(), xax, zax, false);
    turtle.renderSymbols(result);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
