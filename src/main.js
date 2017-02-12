
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'


var settings = {
    seed: 1.0,
    resetCamera: function() {},
    newSeed: function(newVal) { settings.seed = Math.random(); },
    size: 10.0,
    resolution: 64,
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
  camera.position.set(0, -10, 10);
  camera.lookAt(new THREE.Vector3(0,0,0));

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });
  gui.add(settings, 'resetCamera').onChange(function() {
      camera.position.set(0, -10, 10);
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
  plane.name = "plane_terrain";
  scene.add( plane );

  var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.name = "plane_popDensity";
  scene.add( plane );

  var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.name = "plane_landValue";
  scene.add( plane );

  regenerateCity(framework);

  var square_size = settings.size / settings.resolution;
  var offset = settings.size / 2.0 - square_size / 2.0;
  for (var i = 0; i < settings.resolution; i++) {
      for (var j = 0; j < settings.resolution; j++) {
          var grid_color = getZoneProperties(city.grid[i][j].zone).color;
          var geometry = new THREE.PlaneBufferGeometry( square_size - 0.01, square_size - 0.01, 1 );
          var material = new THREE.MeshBasicMaterial( {color: grid_color} );
          var plane = new THREE.Mesh( geometry, material );
          plane.position.set(i * square_size - offset, j * square_size - offset, 0.01);
          plane.name = "square";
          scene.add( plane );
      }
  }

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
}

function generateRoads() {
    var x = Math.floor(Math.random() * settings.resolution);
    var y = Math.floor(Math.random() * settings.resolution);

    for (var i = 0; i < 100; i++) {
        var r = Math.random();
        if (r < 0.2) {
            x += 1;
        } else {
            y += 1;
        }
        if (within(x, 0, settings.resolution) && within(y, 0, settings.resolution)) {
            city.grid[x][y] = { zone: ZONES.ROAD.value };
        } else {
            x = Math.floor(Math.random() * settings.resolution);
            y = Math.floor(Math.random() * settings.resolution);
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
        plane_popDensity.position.set(0, 0, -settings.split);
    }

    var plane_landValue = scene.getObjectByName("plane_landValue");
    if (plane_landValue !== undefined) {
        plane_landValue.geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
        plane_landValue.position.set(0, 0, -2 * settings.split);
    }


}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
