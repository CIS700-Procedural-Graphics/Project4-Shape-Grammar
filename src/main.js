
const THREE = require('three') // older modules are imported like this. You shouldn't have to worry about this much
const OBJLoader = require('three-obj-loader')(THREE)
import Framework from './framework'
import {Shape} from './lsystem.js'
import Lsystem from './lsystem.js'
import Voronoi from './rhill-voronoi-core.js'

//initialize obj loading before anything, or else multithreading causes issues
var typeToObjMap = initializeMap();
var shapeSet;

//bias and gain functions for building height and color
function bias(b, t) {
    return Math.pow(t, Math.log(b) / Math.log(0.5));
}
function gain(g, t) {
    if (t < 0.5) {
        return bias(1.0 - g, 2.0*t) / 2; 
    }
    else {
        return 1 - bias(1.0 - g, 2.0 - 2.0*t) / 2;
    }
}

// called after the scene loads
function onLoad(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  // initialize a simple box and material
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.set(0xffffff);
  //directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);

  var ambientLight = new THREE.AmbientLight( 0x505050 ); // soft white light
  scene.add( ambientLight );

  // set camera position
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));

  shapeSet = new Set();

  //initialize the ground
  var planeGeometry = new THREE.PlaneGeometry(800, 600);
  var planeMaterial = new THREE.MeshLambertMaterial({color: 0x8BA870, side: THREE.DoubleSide, shading: THREE.FlatShading });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  //apply rotation
  plane.applyMatrix(new THREE.Matrix4().makeRotationFromQuaternion(
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1.0, 0.0, 0.0), -Math.PI/2.0)
    ));
  scene.add(plane);

  /*
  //SINGLE BUILDING DEBUGGING PURPOSES
  var building = new Shape('A');
  //apply translation
  var mat6 = new THREE.Matrix4();
  mat6.makeTranslation(20, 0, 0);
  building.mat = mat6;
  //apply scale
  building.scale = new THREE.Vector3(7, 20, 5);
  building.geom_type = 'Apartment';
  building.terminal = false;
  shapeSet.add(building);
  */
  
  //compute Voronoi diagram
  var voronoi = new Voronoi();
  var sites = [];
  var diagram;
  var xo = 0;
  var yo = 0;
  var dxSampling = 150;
  var dySampling = 150;
  for (var i=0; i<25; i++) {
    sites.push({
      /*
      //random sampling
      x:Math.round(xo+2*(Math.random()-0.5)*dxSampling),
      y:Math.round(yo+2*(Math.random()-0.5)*dySampling)
      */
      //stratified sampling
      x: dxSampling*2.0/5.0*(i%5.0) - dxSampling + Math.random()*dxSampling*2.0/5.0,
      y: dySampling*2.0/5.0*Math.floor(i/5.0) - dySampling + Math.random()*dySampling*2.0/5.0
    });
  }
  var bbox = {xl:-400,xr:400,yt:-300,yb:300};
  diagram = voronoi.compute(sites, bbox);

  //draw Voronoi diagram
  if ( diagram ) {

    var edges = diagram.edges;
    var nEdges = edges.length;
    var v1, v2;
    if (nEdges) {

      var singleStreetGeometry = new THREE.Geometry();
      var edge;

      while (nEdges--) {

        //get the two vertices that make up the line
        edge = edges[nEdges];
        v1 = edge.va;
        v2 = edge.vb;

        //VORONOI EDGES DEBUGGING PURPOSES
        //var stroke = new THREE.Geometry();
        //stroke.vertices.push(new THREE.Vector3(v1.x, 0, v1.y));
        //stroke.vertices.push(new THREE.Vector3(v2.x, 0, v2.y));
        //var lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        //var line = new THREE.Line( stroke, lineMaterial );
        //scene.add( line );

        //create and add street to scene
        var streetMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
        //apply scale
        var dx = v2.x - v1.x;
        var dz = v2.y - v1.y;
        var streetLength = Math.sqrt(dx*dx + dz*dz);
        streetMesh.applyMatrix(new THREE.Matrix4().makeScale(streetLength, 1, 2));
        //apply rotation
        var streetVec = new THREE.Vector2(dx, dz);
        var angle = -1.0* streetVec.angle();
        streetMesh.applyMatrix(new THREE.Matrix4().makeRotationFromQuaternion(
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0.0, 1.0, 0.0), angle)
          ));
        //apply translation
        var midpoint = new THREE.Vector3((v1.x + v2.x)/2.0, 0.0, (v1.y + v2.y)/2.0);
        streetMesh.applyMatrix(new THREE.Matrix4().makeTranslation(midpoint.x, midpoint.y, midpoint.z));
        singleStreetGeometry.merge(streetMesh.geometry, streetMesh.matrix);

        //bound the buildings near center of plane
        if (streetLength > 25 &&  streetLength < 120 &&
          Math.abs(midpoint.x) < dxSampling && Math.abs(midpoint.z) < dySampling) {
          //make primitve shape for future buildings using the street edge
          var futureBuildings = new Shape('N');
          //apply translation
          futureBuildings.mat = new THREE.Matrix4().makeTranslation(midpoint.x, midpoint.y, midpoint.z);
          //apply rotation
          futureBuildings.mat.multiply(new THREE.Matrix4().makeRotationFromQuaternion(
            new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle)
            ));

          var distanceToCenter = Math.sqrt(midpoint.x*midpoint.x + midpoint.z*midpoint.z); //center is the origin
          var t = 1.0 - (distanceToCenter / Math.sqrt(dxSampling*dxSampling + dySampling*dySampling));
          var buildingHeight = Math.max(Math.round(50.0 * gain(0.8, t)), 4.0);
          //width and length are dependent on street length
          futureBuildings.scale = new THREE.Vector3(streetLength, buildingHeight, streetLength);
          futureBuildings.geom_type = 'FutureBuildings';
          futureBuildings.terminal = false;
          shapeSet.add(futureBuildings);
        }
        
      }

      var streetMaterial = new THREE.MeshLambertMaterial({ color: 0x708090, shading: THREE.FlatShading });
      var singleStreetMesh = new THREE.Mesh(singleStreetGeometry, streetMaterial);
      scene.add(singleStreetMesh);

    }
  }

  var lsys = new Lsystem(shapeSet);
  shapeSet = lsys.doIterations(8);

  //parse the shape set and adds to scene
  parseShapeSet(scene);
}

/*
// clears the scene by removing all geometries added by turtle.js
function clearScene(turtle) {
  var obj;
  for( var i = turtle.scene.children.length - 1; i > 2; i--) {
      obj = turtle.scene.children[i];
      turtle.scene.remove(obj);
  }
}

function doLsystem(lsystem, iterations, turtle, anglefactor) {
    var result = lsystem.doIterations(iterations);
    turtle.clear();
    turtle = new Turtle(turtle.scene, iterations, anglefactor);
    turtle.renderSymbols(result);
}
*/

function initializeMap() {
  var tempMap = new Map();
  var objLoader = new THREE.OBJLoader();

  //apartment objects
  objLoader.load('/geo/SimpleApartmentBaseSide.obj', function(obj) { typeToObjMap.set('ApartmentBaseSide', obj.children[0].geometry) });
  objLoader.load('/geo/SimpleApartmentBaseCorner.obj', function(obj) { typeToObjMap.set('ApartmentBaseCorner', obj.children[0].geometry) });
  objLoader.load('/geo/SimpleApartmentFloorSide1.obj', function(obj) { tempMap.set('ApartmentFloorSide1', obj.children[0].geometry); });
  objLoader.load('/geo/SimpleApartmentFloorCorner1.obj', function(obj) { tempMap.set('ApartmentFloorCorner1', obj.children[0].geometry); });
  objLoader.load('/geo/SimpleApartmentFloorSide2.obj', function(obj) { tempMap.set('ApartmentFloorSide2', obj.children[0].geometry); });
  objLoader.load('/geo/SimpleApartmentFloorCorner2.obj', function(obj) { tempMap.set('ApartmentFloorCorner2', obj.children[0].geometry); });
  objLoader.load('/geo/SimpleApartmentRoofSide.obj', function(obj) { typeToObjMap.set('ApartmentRoofSide', obj.children[0].geometry) });
  objLoader.load('/geo/SimpleApartmentRoofCorner.obj', function(obj) { typeToObjMap.set('ApartmentRoofCorner', obj.children[0].geometry) });
  objLoader.load('/geo/SimpleApartmentRoofCenter.obj', function(obj) { typeToObjMap.set('ApartmentRoofCenter', obj.children[0].geometry) });

  //skyscraper objects
  objLoader.load('/geo/SimpleSkyscraperSide.obj', function(obj) { typeToObjMap.set('SkyscraperSide', obj.children[0].geometry) });
  objLoader.load('/geo/SimpleSkyscraperCorner.obj', function(obj) { typeToObjMap.set('SkyscraperCorner', obj.children[0].geometry) });
  objLoader.load('/geo/SimpleSkyscraperRoof.obj', function(obj) { typeToObjMap.set('SkyscraperRoof', obj.children[0].geometry) });

  return tempMap;
}

function palette(t) {
  return new THREE.Color(
    0.5 + 0.3*Math.cos( 6.28318*(1.0*t+0.0) ), 
    0.5 + 0.3*Math.cos( 6.28318*(1.0*t+0.1) ), 
    0.5 + 0.3*Math.cos( 6.28318*(1.0*t+0.2) ));
}

function parseShapeSet(scene) {

  //var singleGeometry = new THREE.Geometry();
  var dxSampling = 150;
  var dySampling = 150;

  for (var shape of shapeSet.values()) {

    var box;
    if (typeof typeToObjMap.get(shape.geom_type) !== "undefined") {
      box = typeToObjMap.get(shape.geom_type);
    }
    else {
      box = new THREE.Geometry();
    }

    //set color based on distance from center (colorFactor) and height from ground (palette)
    var position = new THREE.Vector3(0, 0, 0).applyMatrix4(shape.mat);
    var distanceToCenter = Math.sqrt(position.x*position.x + position.z*position.z); //center is the origin
    var t = 1.0 - (distanceToCenter / Math.sqrt(dxSampling*dxSampling + dySampling*dySampling));
    var colorFactor = gain(0.7, t)*0.7+0.3;
    var material;
    if (shape.geom_type === 'SkyscraperCorner' || shape.geom_type === 'SkyscraperSide' || 
      shape.geom_type === 'SkyscraperRoof') {
      material = new THREE.MeshLambertMaterial({color: palette(50.0/60.0).multiplyScalar(colorFactor), shading: THREE.FlatShading });
    }
    else {
      material = new THREE.MeshLambertMaterial({color: palette(position.y/80.0).multiplyScalar(colorFactor), shading: THREE.FlatShading });
    }

    var boxMesh = new THREE.Mesh(box, material);

    //apply scale
    boxMesh.applyMatrix(new THREE.Matrix4().makeScale(shape.scale.x, shape.scale.y, shape.scale.z));
    //apply transformation
    boxMesh.applyMatrix(shape.mat);
    scene.add(boxMesh);

    //singleGeometry.merge(boxMesh.geometry, boxMesh.matrix);

  }
  
  //var singleMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, wireframe: false});
  //var mesh = new THREE.Mesh(singleGeometry, singleMaterial);
  //scene.add(mesh);

}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
