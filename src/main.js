
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Builder from './builder.js'
import OBJLoader from './OBJLoader.js'

var settings = {
    seed: 1.0,
    resetCamera: function() {},
    newSeed: function(newVal) { settings.seed = Math.random(); },
    size: 10.0,
    resolution: 3,
    split: 0.0
}

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

  for (var i = 0; i < settings.resolution; i++) {
      city.grid.push([]);
      for (var j = 0; j < settings.resolution; j++) {
          city.grid[i].push({zone: ZONES.UNZONED.value});
      }
  }

  draw(framework);
}

function draw(framework) {
  var scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

  var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.rotateX(Math.PI / 2.0);
  plane.name = "plane_terrain";
  scene.add( plane );

  var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.rotateX(Math.PI / 2.0);
  plane.name = "plane_popDensity";
  scene.add( plane );

  var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.rotateX(Math.PI / 2.0);
  plane.name = "plane_landValue";
  scene.add( plane );

  regenerateCity(framework);
}

function getZoneProperties(zoneValue) {
    var myKeys = Object.keys(ZONES);
    var matchingKeys = myKeys.filter(function(key){
        return ZONES[key].value == zoneValue;
    });
    return ZONES[matchingKeys[0]];
}

function regenerateCity(framework) {
    generateRoads();
    generateBuildings(framework);
}

function generateRoads() {
    // vertical streets
    for (var i = 0; i < settings.resolution; i+=8) {
        for (var j = 0; j < settings.resolution; j++) {
            city.grid[i][j] = { zone: ZONES.ROAD.value };
        }
    }

    // horizontal streets
    for (var i = 0; i < settings.resolution; i+=4) {
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

        alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));



        var imgd = ctx.getImageData(10, 11, 512, 512);
        var pix = imgd.data;
        console.log(pix.length);
    };

    img.src = url;

}

function generateBuildings(framework) {
    var scene = framework.scene;

    getBase64FromImageUrl('./maps/population.png')

    var loader = new THREE.TextureLoader();
    // //Manager from ThreeJs to track a loader and its status
    // var manager = new THREE.LoadingManager();
    // //Loader for Obj from Three.js
    // var modelLoader = new THREE.OBJLoader( manager );
    //
    // modelLoader.load('./models/single_arch.obj', function ( object ) {
    //     console.log(object);
    //     object.scale.set(0.1,0.1,0.1);
    //     scene.add(object);
    // });



    loader.load('./textures/floor06.tga', function ( texture ) {
        // var geometry = new THREE.BoxGeometry(1, 1, 1);
        var road_material = new THREE.MeshBasicMaterial({map: texture, overdraw: 0.5, side: THREE.DoubleSide});
        // var mesh = new THREE.Mesh(geometry, material);
        // scene.add(mesh);

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
                    building.position.set(i * square_size - offset + Math.random() - 0.5, 0.05, j * square_size - offset + Math.random() - 0.5);
                    scene.add(building);
                } else if (city.grid[i][j].zone == ZONES.ROAD.value) {
                    var grid_color = getZoneProperties(city.grid[i][j].zone).color;
                    var geometry = new THREE.PlaneBufferGeometry( square_size, square_size, 1 );
                    // var material = new THREE.MeshBasicMaterial( {color: grid_color} );
                    var plane = new THREE.Mesh( geometry, road_material );
                    plane.rotateX(Math.PI / 2.0);
                    plane.position.set(i * square_size - offset, 0.01, j * square_size - offset);
                    plane.name = "square";
                    scene.add( plane );
                }
            }
        }

    });

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
