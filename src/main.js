
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import WaterShader from './waterShader.js'
WaterShader(THREE);
import Framework from './framework'
import Lsystem, {LinkedListToString} from './lsystem.js'
import Turtle from './turtle.js'
import Shape from './shape.js'


//======================================= GLOBAL VARIABLES =======================================
//to get water texture
var waterNormals;

//global shapes list. this contains Shape objects
var allShapesList = [];
var water;
var pointsList = [];
var pointsList2 = [];
var pointsList3 = [];

function createRoads(scene, _pointsList, numPoints, offset, ctrlPt1, ctrlPt2, ctrlPt3, ctrlPt4) {
  var numCurvePoints = numPoints;//50;

  var bezierCurve = new THREE.CubicBezierCurve(
    new THREE.Vector3(ctrlPt1.x, ctrlPt1.y, ctrlPt1.z),//( -50, -1, -30 ),
    new THREE.Vector3(ctrlPt2.x, ctrlPt2.y, ctrlPt2.z),//( -20, 0,  -5),
    new THREE.Vector3(ctrlPt3.x, ctrlPt3.y, ctrlPt3.z),//( 10, 1, 20 ),
    new THREE.Vector3(ctrlPt4.x, ctrlPt4.y, ctrlPt4.z)//( 30, 0, 30 )
  );
  var bezierPath = new THREE.Path( bezierCurve.getPoints( numCurvePoints ) );
  var bezierGeometry = bezierPath.createPointsGeometry( numCurvePoints );

  //var cgeom = new THREE.Geometry();
  //cgeom.vertices = bezierCurve.getPoints(numCurvePoints);
  //console.log(cgeom.vertices);  //WHY DOES THIS GIVE ME VECTOR2s?????

  // var bezierMaterial = new THREE.LineBasicMaterial( { color : 0xff0000 } );
  // var bezierCurveObject = new THREE.Line(bezierGeometry, bezierMaterial );
  // bezierCurveObject.rotateX(Math.PI / 2.0);
  // scene.add(bezierCurveObject);


  //add the feather obj at every point along the curve
  for(var i = 0; i < numCurvePoints; i++)
  {
      //ADD PLANES TO SEE IF ITS DRAWING PROPERLY
      // var geometry = new THREE.PlaneGeometry( 1, 1, 1, 1);  //width, height, width segments, height segments
      // geometry.rotateX(Math.PI / 2.0);  //rotate it to be flat
      // var material = new THREE.MeshBasicMaterial( {color: 0xcccccc, side: THREE.DoubleSide, wireframe: true} );
      // var planeMesh = new THREE.Mesh(geometry, material);
      //
      // //set position of every feather to be the point at i
      // planeMesh.position.set(bezierGeometry.vertices[i].x, 0, bezierGeometry.vertices[i].y * 50);
      // planeMesh.scale.set(3.0, 3.0, 3.0);
      // scene.add(planeMesh);

      //add to the points list so that I can use it later
      var point = new THREE.Vector3(bezierGeometry.vertices[i].x, 0, bezierGeometry.vertices[i].y * offset);
      _pointsList.push(point);
  }//end for loop
}//end createRoads function


function createArch(scene, _pointsList, numPoints, ctrlPt1, ctrlPt2, ctrlPt3, ctrlPt4)
{
  var numCurvePoints = numPoints;

  var bezierCurve = new THREE.CubicBezierCurve(
    new THREE.Vector3(ctrlPt1.x, ctrlPt1.y, ctrlPt1.z),
    new THREE.Vector3(ctrlPt2.x, ctrlPt2.y, ctrlPt2.z),
    new THREE.Vector3(ctrlPt3.x, ctrlPt3.y, ctrlPt3.z),
    new THREE.Vector3(ctrlPt4.x, ctrlPt4.y, ctrlPt4.z)
  );
  var bezierPath = new THREE.Path( bezierCurve.getPoints( numCurvePoints ) );
  var bezierGeometry = bezierPath.createPointsGeometry( numCurvePoints );

  //TO TEST WHETHER ITS DRAWING PROPERLY
  // var bezierMaterial = new THREE.LineBasicMaterial( { color : 0xff0000 } );
  // var bezierCurveObject = new THREE.Line(bezierGeometry, bezierMaterial );
  //bezierCurveObject.rotateX(Math.PI / 2.0);
  // scene.add(bezierCurveObject);

  for(var i = 0; i < numCurvePoints; i++)
  {
      //add to the points list so that I can use it later
      var point = new THREE.Vector3(bezierGeometry.vertices[i].x, bezierGeometry.vertices[i].y, bezierGeometry.vertices[i].z);
      _pointsList.push(point);
  }//end for loop

}

//======================================= ON LOAD FUNCTION =======================================
// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // initialize a simple box and material
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);


  // set skybox
  var loader = new THREE.CubeTextureLoader();
  var urlPrefix = 'images/skymap/';

  var skymap = new THREE.CubeTextureLoader().load([
    urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
    urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
    urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
  ] );

  scene.background = skymap;


  // set camera position
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));


  //make ground plane that'll be all the land
  var geometry = new THREE.PlaneGeometry( 100, 100, 25, 25);  //width, height, width segments, height segments
  geometry.rotateX(Math.PI / 2.0);  //rotate it to be flat
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.position.set(0, -20, 0);
  //scene.add( plane );


  //FILL UP THE POINTS LIST
  createRoads(scene, pointsList, 50, 10,
    new THREE.Vector3(30, 10, 0),
    new THREE.Vector3(10, 0, 0),
    new THREE.Vector3(-20, -10, 0),
    new THREE.Vector3(-50, 0, 0));

    // createRoads(scene, pointsList, 50, 5,
    //   new THREE.Vector3(30, 10, 0),
    //   new THREE.Vector3(10, 0, 0),
    //   new THREE.Vector3(-20, -10, 0),
    //   new THREE.Vector3(-50, 0, 0));

  createRoads(scene, pointsList2, 50, 8,
    new THREE.Vector3(30, 50, 0),
    new THREE.Vector3(10, 0, 0),
    new THREE.Vector3(-20, 80, 0),
    new THREE.Vector3(-50, 0, 0));

  // createRoads(scene, pointsList, 50, 5,
  //   new THREE.Vector3(-50, -10, 0),
  //   new THREE.Vector3(-20, 0, 0),
  //   new THREE.Vector3(10, 10, 0),
  //   new THREE.Vector3(30, 0, 0));

  createArch(scene, pointsList3, 50,
    new THREE.Vector3(-150, 150, 0),
    new THREE.Vector3(-110, 300, 0),
    new THREE.Vector3(110, 300, 0),
    new THREE.Vector3(150, 150, 0));


  //WATER SHADER -----------------------------------------------------------------------

  scene.add( new THREE.AmbientLight( 0x444444 ) );
	var light = new THREE.DirectionalLight( 0xffffbb, 1 );
	light.position.set( - 1, 1, - 1 );
	scene.add( light );

  waterNormals = new THREE.TextureLoader().load('textures/waternormals.jpg');
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
  // debugger;
  var parameters = {
		width: 2000,
		height: 2000,
		widthSegments: 250,
		heightSegments: 250,
		depth: 1500,
		param: 4,
		filterparam: 1
	};

  water = new THREE.Water(renderer, camera, scene, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: waterNormals,
    alpha: 1.0,
    sunDirection: light.position.clone().normalize(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 50.0
  });

  var mirrorMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(parameters.width * 500, parameters.height * 500),
    water.material
  );

  mirrorMesh.add(water);
  mirrorMesh.rotation.x = - Math.PI * 0.5;
  scene.add(mirrorMesh);



  //PROCEDURAL CITY GENERATION  -----------------------------------------------------------------------

  //create beginning shapes list
  // var geom_startCube = new THREE.BoxGeometry( 5, 5, 5 );	//width, height, depth
  // var material_startCube = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  // var startCubeMesh = new THREE.Mesh( geom_startCube, material_startCube );

  //THREE.Vector3(5, 5, 5), THREE.Vector3(0, 1, 0), THREE.Vector3(1, 1, 1), 1);
  // startCubeMesh.position.set(5, 5, 5);
  // startCubeMesh.rotation.set(0, 1, 0);
  // startCubeMesh.scale.set(1, 1, 1);

  var material_startCube = new THREE.MeshBasicMaterial( {color: 0x000000} );
  var startCube = new Shape(scene, "S", new THREE.Vector3(-50, 30, 50), new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), 1, material_startCube);
  startCube.drawable = false;
  startCube.expandable = true;
  allShapesList.push(startCube);

  var material_startCyl = new THREE.MeshBasicMaterial( {color: 0x000000} );
  var startCyl = new Shape(scene, "S", new THREE.Vector3(0, 50, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), 3, material_startCyl);
  startCyl.drawable = false;
  allShapesList.push(startCyl);


  var material_startHeart = new THREE.MeshBasicMaterial( {color: 0x000000} );
  var startHeart = new Shape(scene, "S", new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), 6, material_startHeart);
  startHeart.drawable = false;
  allShapesList.push(startHeart);

  var material_startStack = new THREE.MeshBasicMaterial( {color: 0x000000} );
  var startStack = new Shape(scene, "S", new THREE.Vector3(0, 0, 50), new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1), 7, material_startStack);
  startHeart.drawable = false;
  allShapesList.push(startStack);




  //call expandList
  //console.log("SHAPE LIST BEFORE EXPAND CALL");
  //console.log(allShapesList);

  expandList(allShapesList, 3);

  //console.log("ALL SHAPES LIST LENGTH: " + allShapesList.length);
  //console.log("PRINTING OUT SHAPES LIST");
  //console.log(allShapesList);

  //call drawShapes
  drawShapes(allShapesList, scene);


  //DEBUGGING BECAUSE DRAWSHAPES WASNT WORKING
  // for(var i = 0; i < allShapesList.length; i++)
  // {
  //   var currShape = allShapesList[i];
  //   var geom_mesh = currShape.mesh;
  //
  //   // geom_mesh.rotation.set(currShape.orientation.x, currShape.orientation.y, currShape.orientation.z);
  //   // geom_mesh.scale.set(currShape.scale.x, currShape.scale.y, currShape.scale.z);
  //   // geom_mesh.position.set(currShape.position.x, currShape.position.y, currShape.position.z);
  //
  //
  //   //IN HERE, JUST GET THE SHAPES SYMBOL AND DRAW THE CORRESPONDING GEOMETRY MESH ACCORDING TO THAT SYMBOL
  //   //HAVE SHAPE CLASS JUST HAVE THE BLUEPRINTS FOR THE MESH, NOT THE MESH OBJECT ITSELF
  //
  //   scene.add( geom_mesh );
  // }//end for i




}//end onload function


//======================================= EXPAND GLOBAL SHAPES LIST FUNCTION =======================================
function expandList(shapeList, iterations) {


    /* ITERATE THROUGH GLOBAL SHAPES LIST, CALL RENDERSHAPES, AND CONTINUOUSLY UPDATE GLOBAL SHAPES LIST */
    for(var n = 0; n < iterations; n++)
    {
      var original_len = allShapesList.length;
      //console.log("in for loop shapelist length: " + shapeList.length);
      //console.log(shapeList);

      for(var i = 0; i < original_len; i++)
      {
        var currShape = shapeList[i];

        //@params: shapeList, functionID, space b/w buildings, towerLength
        if(currShape.expandable == true)
        {
          currShape.expandable = false;
          var offsetRandom = Math.random() * 5;
          currShape.renderShape(shapeList, currShape.id, offsetRandom, 5, pointsList, pointsList2, pointsList3);

        }

        //console.log("IM IN FOR I THROUGH SHAPELIST FOR LOOP");

        //call currShape's function
        //save its output (which should be other shapes)
        //append to end of allShapesList	//OR APPEND IN THE FUNCTION DIRECTLY ITSELF
        //remove currShape

      }//end for i


      //console.log("shape list length: " + shapeList.length);
    }//end for n
}


//======================================= SHAPE DRAWING/RENDERING FUNCTION =======================================
function drawShapes(shapeList, scene) {

  /* ITERATE THROUGH GLOBAL SHAPES LIST AND DRAW EACH SHAPE */
  for(var i = 0; i < shapeList.length; i++)
  {

    var currShape = shapeList[i];
    var geomMeshString = currShape.meshString;

    //console.log("shape list length: " + shapeList.length);
    //console.log(currShape);

    if(geomMeshString == "B")// && currShape.drawable == true)
    {
      console.log("IM IN THE B IF CASE");
      console.log(currShape);
      //console.log("IM HERE IN THE B CASE");
      //draw box geometry and add to scene
      var geometry = new THREE.BoxGeometry( 1, 1, 1);	//width, height, depth
      var material = currShape.material;//new THREE.MeshBasicMaterial( {color: 0x00ff00} );
      var geom_mesh = new THREE.Mesh( geometry, material );
      geom_mesh.rotation.set(currShape.rotation.x, currShape.rotation.y, currShape.rotation.z);
      geom_mesh.scale.set(currShape.scale.x, currShape.scale.y, currShape.scale.z);
      geom_mesh.position.set(currShape.position.x, currShape.position.y, currShape.position.z);
      scene.add( geom_mesh );
    }

    //this only works when iterations >= 2
    if(geomMeshString == "C")
    {
      var radiusSegments = Math.floor((Math.random() * 25) + 3);
      var geometry = new THREE.CylinderGeometry(1, 1, 1, radiusSegments); //radius top, radius bottom, height, radiusSegments
      var material = currShape.material;
      var geom_mesh = new THREE.Mesh(geometry, material);
      geom_mesh.rotation.set(currShape.rotation.x, currShape.rotation.y, currShape.rotation.z);
      geom_mesh.scale.set(currShape.scale.x, currShape.scale.y, currShape.scale.z);
      geom_mesh.position.set(currShape.position.x, currShape.position.y, currShape.position.z);
      scene.add( geom_mesh );
    }

    if(geomMeshString == "H")
    {
      var x = 0, y = 0;

      var heartShape = new THREE.Shape();

      heartShape.moveTo( x + 5, y + 5 );
      heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
      heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
      heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
      heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
      heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
      heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

      var geometry = new THREE.ShapeGeometry( heartShape );
      var material = currShape.material;//new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
      var mesh = new THREE.Mesh( geometry, material ) ;
      mesh.rotation.set(currShape.rotation.x + Math.PI, currShape.rotation.y, currShape.rotation.z);
      mesh.scale.set(currShape.scale.x, currShape.scale.y, currShape.scale.z);
      mesh.position.set(currShape.position.x, currShape.position.y, currShape.position.z);
      scene.add( mesh );

      // var geometry = new THREE.BoxGeometry( 1, 1, 1);	//width, height, depth
      // var material = currShape.material;//new THREE.MeshBasicMaterial( {color: 0x00ff00} );
      // var geom_mesh = new THREE.Mesh( geometry, material );
      // geom_mesh.rotation.set(currShape.rotation.x, currShape.rotation.y, currShape.rotation.z);
      // geom_mesh.scale.set(currShape.scale.x, currShape.scale.y, currShape.scale.z);
      // geom_mesh.position.set(currShape.position.x, currShape.position.y, currShape.position.z);
      // scene.add( geom_mesh );
    }

  }//end for i

}//end drawShapes function


//======================================= ON UPDATE FUNCTION =======================================
// called on frame updates
function onUpdate(framework) {
  if (water) {
    water.material.uniforms.time.value += 1.0 / 60.0;
    water.render();
  }
}


// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
