
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Builder from './builder.js'
import OBJLoader from './OBJLoader.js'
import Turtle from './turtle.js'
import Lsystem, {LinkedListToString} from './lsystem.js'

var settings = {
    seed: 1.0,
    resetCamera: function() {},
    newSeed: function(newVal) { settings.seed = Math.random(); },
    size: 10.0,
    resolution: 128,
    split: 0.0
}

var lsystem_settings = {
    Axiom: "[[[RA]RA]RA]",
    Rules: [
        {Rule: "A=RMA", Prob: 0.5},
        {Rule: "R=-R", Prob: 1.0},
        {Rule: "R=+R", Prob: 1.0},
        {Rule: "R=*R", Prob: 1.0},
        {Rule: "R=/R", Prob: 1.0},
        {Rule: "R=MMR", Prob: 10.0},
        {Rule: "R=M", Prob: 0.5},
    ],
    iterations: 6,
    Render: function() {}
}

var turtle;

var ZONES = {
  UNZONED    : {value: 1, name: "Unzoned",     color: 0xd1cfca},
  ROAD       : {value: 2, name: "Road",        color: 0x2c2a2d},
  RESIDENTIAL: {value: 3, name: "Residential", color: 0x1fbc14},
  COMMERCIAL : {value: 4, name: "Commerical",  color: 0x7c14bc},
  INDUSTRIAL : {value: 5, name: "Industrial",  color: 0xddac30}
};


var city = {
    grid: []
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
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);

  // set camera position
  camera.position.set(0, 10, 10);
  camera.lookAt(new THREE.Vector3(0,0,0));

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
  gui.add(settings, 'resetCamera').onChange(function() {
      camera.position.set(0, 10, 10);
      camera.lookAt(new THREE.Vector3(0,0,0));
  });
  gui.add(settings, 'newSeed');
  gui.add(settings, 'split', 0, 10);


  var f2 = gui.addFolder('Roads');
  f2.add(lsystem_settings, 'Axiom')
  for (var i = 0; i < lsystem_settings.Rules.length; i++) {
      f2.add(lsystem_settings.Rules[i], 'Rule');
      f2.add(lsystem_settings.Rules[i], 'Prob');
  }


  f2.add(lsystem_settings, 'Render').onChange(function() {
      regenerateCity(framework);
  });
  f2.open();

  regenerateCity(framework);
}


function draw(framework) {

}

function generateTexture() {
  var w = city.grid.length - 1;
  var h = city.grid[0].length - 1;
  // build a small canvas 32x64 and paint it in white
  var canvas  = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  var context = canvas.getContext('2d');
  // plain it in white
  context.fillStyle    = '#ffffff';
  context.fillRect( 0, 0, w, h );
  // draw the window rows - with a small noise to simulate light variations in each room

  for (var i = 0; i < w; i++) {
      for (var j = 0; j < h; j++) {
          var x = Math.floor(city.grid.length * i / w);
          var y = Math.floor(city.grid[0].length * j / h);
          if (city.grid[x][h-y].zone == ZONES.ROAD.value) {
              context.beginPath();
              context.arc(i,j,1,0,2*Math.PI,false);
              context.fillStyle = '#333';
              context.fill();
        } else {
            var r = Math.floor(50 * Math.random()) + 100;
            var g = Math.floor(50 * Math.random()) + 150;
            var b = Math.floor(50 * Math.random());
            context.fillStyle = 'rgb(' + [r, g, b].join( ',' )  + ')';
            context.fillRect( i, j, 1, 1 );
        }
      }
  }

  // build a bigger canvas and copy the small one in it
  // This is a trick to upscale the texture without filtering
  var canvas2 = document.createElement( 'canvas' );
  canvas2.width    = 512;
  canvas2.height   = 512;
  var context = canvas2.getContext( '2d' );
  // disable smoothing
  context.imageSmoothingEnabled        = false;
  context.webkitImageSmoothingEnabled  = false;
  context.mozImageSmoothingEnabled     = false;
  // then draw the image
  context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
  // return the just built canvas2

  var debug = document.getElementById("debug");
  debug.appendChild(canvas2);

  return canvas2;
}

function loadMap(key, path) {

}

function getZoneProperties(zoneValue) {
    var myKeys = Object.keys(ZONES);
    var matchingKeys = myKeys.filter(function(key){
        return ZONES[key].value == zoneValue;
    });
    return ZONES[matchingKeys[0]];
}

function regenerateCity(framework) {
    var scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;

    // clear scene
    scene.children.forEach(function(object){
        scene.remove(object);
    });


    // reset grid
    city.grid = [];
    for (var i = 0; i < settings.resolution; i++) {
      city.grid.push([]);
      for (var j = 0; j < settings.resolution; j++) {
          city.grid[i].push({zone: ZONES.UNZONED.value});
      }
    }

    // generate roads
    var lsys = new Lsystem(lsystem_settings.Axiom);
    lsys.UpdateRules(lsystem_settings.Rules);
    var result = lsys.DoIterations(lsystem_settings.iterations);
    turtle = new Turtle(city.grid);
    turtle.renderSymbols(result);

    generateRoads();

    var texture = new THREE.Texture(generateTexture());
    texture.anisotropy = renderer.getMaxAnisotropy();
    texture.needsUpdate = true;

    // build the mesh
    var material  = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide
    });

    // redraw planes
    var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
    // var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    plane.rotateX(Math.PI / 2.0);
    plane.name = "plane_terrain";
    scene.add( plane );

    var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
    var material = new THREE.MeshLambertMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    plane.rotateX(Math.PI / 2.0);
    plane.name = "plane_popDensity";
    scene.add( plane );

    var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
    var material = new THREE.MeshLambertMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    plane.rotateX(Math.PI / 2.0);
    plane.name = "plane_landValue";
    scene.add( plane );


    generateBuildings(framework);
    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add( light );
    var light = new THREE.PointLight( 0xffffff, 10, 100 );
    light.position.set( 50, 50, 50 );
    scene.add( light );
}

function generateRoads() {

    // vertical streets
    for (var i = 0; i < settings.resolution; i+=16) {
        for (var j = 0; j < settings.resolution; j++) {
            city.grid[i][j] = { zone: ZONES.ROAD.value };
        }
    }

    // horizontal streets
    for (var i = 0; i < settings.resolution; i+=8) {
        for (var j = 0; j < settings.resolution; j++) {
            city.grid[j][i] = { zone: ZONES.ROAD.value };
        }
    }
}

// http://stackoverflow.com/questions/934012/get-image-data-in-javascript
function getBase64FromImageUrl(url) {
    var img = new Image();

    img.setAttribute('crossOrigin', 'anonymous');

    img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width =this.width;
        canvas.height =this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        // alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));



        var imgd = ctx.getImageData(10, 11, 512, 512);
        var pix = imgd.data;
        console.log(pix.length);
    };

    img.src = url;

}

function generateBuildings(framework) {
    var scene = framework.scene;
    var loader = new THREE.TextureLoader();
    var square_size = settings.size / settings.resolution;
    var half_square_size = 0.5 * settings.size / settings.resolution;
    var offset = settings.size / 2.0 - square_size / 2.0;
    var builder = new Builder();

    for (var i = 0; i < settings.resolution; i++) {
        for (var j = 0; j < settings.resolution; j++) {


            if (city.grid[i][j].zone == ZONES.UNZONED.value) {
                if (Math.random() < 0.5) {
                    continue;
                }
                var options = {
                    zone: city.grid[i][j].zone,
                    length: settings.size / settings.resolution,
                    width: settings.size / settings.resolution,
                    height: settings.size / settings.resolution
                };
                var building = builder.generateBuilding(options);
                building.position.set(i * square_size - offset, 0.05, j * square_size - offset);
                scene.add(building);
            } else if (city.grid[i][j].zone == ZONES.ROAD.value) {
                // var grid_color = getZoneProperties(city.grid[i][j].zone).color;
                // var geometry = new THREE.PlaneBufferGeometry( square_size, square_size, 1 );
                // // var material = new THREE.MeshBasicMaterial( {color: grid_color} );
                // var plane = new THREE.Mesh( geometry, road_material );
                // plane.rotateX(Math.PI / 2.0);
                // plane.position.set(i * square_size - offset, 0.01, j * square_size - offset);
                // plane.name = "square";
                // scene.add( plane );
            }
        }
    }

}

function within(x, low, high) {
    return x > low && x < high;
}

// called on frame updates
function onUpdate(framework) {
    var scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;

    var plane_terrain = scene.getObjectByName("plane_terrain");
    if (plane_terrain !== undefined) {
        plane_terrain.geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
    }

    var plane_popDensity = scene.getObjectByName("plane_popDensity");
    if (plane_popDensity !== undefined) {
        plane_popDensity.geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
        plane_popDensity.position.set(0, -settings.split, 0);
    }

    var plane_landValue = scene.getObjectByName("plane_landValue");
    if (plane_landValue !== undefined) {
        plane_landValue.geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
        plane_landValue.position.set(0, -2 * settings.split, 0);
    }


}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
