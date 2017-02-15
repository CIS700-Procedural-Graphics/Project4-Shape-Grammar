
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
import Builder from './builder.js'
import OBJLoader from './OBJLoader.js'
import Turtle from './turtle.js'
import CTurtle from './cturtle.js'
import Lsystem, {LinkedListToString} from './lsystem.js'

var settings = {
    seed: 1.0,
    resetCamera: function() {},
    newSeed: function(newVal) { settings.seed = Math.random(); },
    size: 10.0,
    resolution: 64,
    split: 0.0,
    numBuildings: 500
}

var lsystem_settings = {
    Axiom: "A",
    Rules: [
        {Rule: "A=[[[RRRM]RRRM]RRRM]", Prob: 1.0},
        {Rule: "B=RMB", Prob: 1.0},
        {Rule: "C=MC", Prob: 5.0},
        {Rule: "C=M", Prob: 1.0},
        {Rule: "R=-MR", Prob: 1.0},
        {Rule: "R=+MR", Prob: 1.0},
        {Rule: "R=*MR", Prob: 1.0},
        {Rule: "R=/MR", Prob: 1.0},
        {Rule: "P=*MR", Prob: 1.0},
        {Rule: "P=/MR", Prob: 1.0},
        {Rule: "M=[RB]PMC", Prob: 1.0},
    ],
    iterations: 4,
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

var STATUS = {
  VACANT    : {value: 1, name: "Vacant",     color: 0xd1cfca},
  OCCUPIED  : {value: 2, name: "Occupied",   color: 0x2c2a2d},
};


var city = {
    grid: [],
    maps: {}
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


  var roads = gui.addFolder('Roads');
  roads.add(lsystem_settings, 'Axiom')
  for (var i = 0; i < lsystem_settings.Rules.length; i++) {
      roads.add(lsystem_settings.Rules[i], 'Rule');
      roads.add(lsystem_settings.Rules[i], 'Prob');
  }
  roads.add(lsystem_settings, 'Render').onChange(function() {
      regenerateCity(framework);
  });
  roads.open();

  regenerateCity(framework);
}

function resizeCanvas(canvas) {
  var canvas2 = document.createElement('canvas');
  canvas2.width    = 512;
  canvas2.height   = 512;
  var context = canvas2.getContext( '2d' );
  context.imageSmoothingEnabled        = false;
  context.webkitImageSmoothingEnabled  = false;
  context.mozImageSmoothingEnabled     = false;
  context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
  return canvas2;
}

function getMapValue(canvas, ni, nj) {
  var i = canvas.width * ni;
  var j = canvas.height * nj;
  var context = canvas.getContext('2d');
  var pixel = context.getImageData(i, j, 1, 1);
  var data = pixel.data;
  return new THREE.Vector4(data[0], data[1], data[2], data[3]/255);
}

function generateTexture() {
  var size = settings.resolution;
  var canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  var context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, size, size);

  // generate grass texture
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      var r = Math.floor(50 * Math.random()) + 100;
      var g = Math.floor(50 * Math.random()) + 150;
      var b = Math.floor(50 * Math.random());
      context.fillStyle = 'rgb(' + [r, g, b].join( ',' )  + ')';
      context.fillRect( i, j, 1, 1 );
    }
  }

  // generate roads
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      var norm_i = i / size;
      var norm_j = j / size;
      var rgba = getMapValue(city.maps['roads'], norm_i, norm_j);
      if (rgba.x < 250) {
        context.fillStyle = 'rgba(' + [30, 30, 30, (255 - rgba.x) / 255].join( ',' )  + ')';
        context.fillRect( i, j, 1, 1 );
      }
    }
  }
  return resizeCanvas(canvas);
}

function loadMapFromCanvas(framework, key, canvas) {
  var scene = framework.scene;
  var renderer = framework.renderer;
  var texture = new THREE.Texture(canvas);
  texture.anisotropy = renderer.getMaxAnisotropy();
  texture.needsUpdate = true;
  var material  = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  });
  var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
  var plane = new THREE.Mesh( geometry, material );
  plane.rotateX(Math.PI / 2.0);
  plane.name = key;
  scene.add(plane);
  city.maps[key] = canvas;
  console.log(city.maps);
  console.log(key+" is done");
  return canvas;
}

function loadMapFromPath(framework, key, path) {
  var promise = new Promise(function(resolve, reject) {
    var img = new Image();
    img.onload = function () {
      var canvas  = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      var context = canvas.getContext('2d');
      context.drawImage(img, 0, 0);
      if (loadMapFromCanvas(framework, key, canvas)) {
        resolve("Stuff worked!");
      } else {
        reject(Error("It broke"));
      }
    };
    img.src = path;
  });
  return promise;
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
          city.grid[i].push({
            zone: ZONES.UNZONED.value,
            status: STATUS.VACANT.value
          });
      }
    }

    // generate roads
    var lsys = new Lsystem(lsystem_settings.Axiom);
    lsys.UpdateRules(lsystem_settings.Rules);
    var result = lsys.DoIterations(lsystem_settings.iterations);
    // turtle = new Turtle(city.grid);
    // turtle.renderSymbols(result);

    var cturtle = new CTurtle(256,256);
    var turtle_canvas = cturtle.renderSymbols(result);
    loadMapFromCanvas(framework, 'roads', turtle_canvas);
    // var debug = document.getElementById('debug');
    // debug.appendChild(turtle_canvas);

    loadMapFromPath(framework, 'population', './maps/population.png')
      .then(function(response) {
        try {
          generateTerrain(framework);
          generateBuildings(framework);
        } catch (error) {
          console.log("error " + error);
        }
      }, function(error) {
        console.error("Failed!", error);
      });


    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    scene.add(light);
    var light = new THREE.PointLight( 0xffffff, 10, 100 );
    light.position.set( 50, 50, 50 );
    scene.add(light);
}


function generateTerrain(framework) {
  var scene = framework.scene;
  var renderer = framework.renderer;

  var geometry = new THREE.PlaneBufferGeometry( settings.size, settings.size, 1 );
  var texture = new THREE.Texture(generateTexture());
  texture.anisotropy = renderer.getMaxAnisotropy();
  texture.needsUpdate = true;
  var material  = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  });
  var plane = new THREE.Mesh( geometry, material );

  plane.rotateX(Math.PI / 2.0);
  plane.name = "terrain";
  scene.add(plane);
}

// function generateRoads() {
//
//     // vertical streets
//     for (var i = 0; i < settings.resolution; i+=16) {
//         for (var j = 0; j < settings.resolution; j++) {
//             city.grid[i][j] = { zone: ZONES.ROAD.value };
//         }
//     }
//
//     // horizontal streets
//     for (var i = 0; i < settings.resolution; i+=8) {
//         for (var j = 0; j < settings.resolution; j++) {
//             city.grid[j][i] = { zone: ZONES.ROAD.value };
//         }
//     }
// }


function generateBuildings(framework) {
    var scene = framework.scene;
    var loader = new THREE.TextureLoader();
    var square_size = settings.size / settings.resolution;
    var half_square_size = 0.5 * settings.size / settings.resolution;
    var offset = settings.size / 2.0 - square_size / 2.0;
    var builder = new Builder();

    var building_sizes = {
      small: [
        [0.5,0.5,0.5],
        [0.5,1,0.5]
      ],
      medium: [
        [3,3,6],
        [3,3,10],
      ],
      large: [
        [3,4,35],
        [4,4,40]
      ]
    }

    var canvas = document.createElement('canvas');
    canvas.width = settings.resolution;
    canvas.height = settings.resolution;
    var context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0,0,settings.resolution, settings.resolution);
    context.fillStyle = '#000000';

    var debug = document.getElementById('debug');
    debug.appendChild(canvas);

    for (var n = 0; n < settings.numBuildings; n++) {
      // randomly pick points
      var norm_i = Math.random();
      var norm_j = Math.random();

      // keep point based on probability (relative to population)
      var rgba = getMapValue(city.maps['population'], norm_i, norm_j);

      var keep = Math.random() * 255;
      if (keep > rgba.x) {

        // pick a building size semi-randomly
        if (keep < 100) {
          var building_size = building_sizes.large[Math.floor(Math.random()*4)%2]
        } else if (keep < 200) {
          var building_size = building_sizes.medium[Math.floor(Math.random()*4)%2]
        } else {
          continue;
        }

        // check that the building fits in the location
        var i = Math.floor(norm_i * settings.resolution);
        var j = Math.floor(settings.resolution - norm_j * settings.resolution);
        console.log(i+", "+j);
        var bbox_x = [-Math.floor((building_size[0]+1)/2), Math.floor((building_size[0]+1)/2)];
        var bbox_z = [-Math.floor((building_size[1]+1)/2), Math.floor((building_size[1]+1)/2)];
        var isVacant = true;
        for (var q = bbox_x[0]; q < bbox_x[1]; q++) {
          for (var r = bbox_z[0]; r < bbox_z[1]; r++) {

            // bbox must not be out of grid and must not be occupied
            if ((q+i).clamp(0,settings.resolution-1) != q+i ||
                (r+j).clamp(0,settings.resolution-1) != r+j ||
                city.grid[q+i][r+j].status != STATUS.VACANT.value) {
                isVacant = false;
                break;
            }
          }
        }

        console.log(isVacant);
        if (isVacant) {
          // generate building
          var scale_factor = 0.5 * settings.size / settings.resolution; // 0.5 bc box size is half size width
          var density = Math.pow((255 - rgba.x) / 255, 2) * 20;
          var density = 0.4;
          var options = {
              length: scale_factor * building_size[0],
              width: scale_factor * building_size[1],
              height: scale_factor * (building_size[2] + (Math.random() * building_size[2]))
          };
          var building = builder.generateBuilding(options);
          building.position.set(i * square_size - offset, 0, j * square_size - offset);
          scene.add(building);

          for (var q = bbox_x[0]; q < bbox_x[1]; q++) {
            for (var r = bbox_z[0]; r < bbox_z[1]; r++) {
              city.grid[q+i][r+j].status = STATUS.OCCUPIED.value;
            }
          }
          console.log(city.grid);
        }
      }
    }






    // var roads = city.maps['roads'];
    //
    //
    // for (var i = 0; i < settings.resolution; i++) {
    //     for (var j = 0; j < settings.resolution; j++) {
    //
    //
    //       var isClear = true;
    //       for (var k = -1; k < 2; k++) {
    //         for (var m = -1; m < 2; m++) {
    //           var norm_i = (i + k) / settings.resolution;
    //           var norm_j = (settings.resolution - (j + m)) / settings.resolution;
    //           var rgba = getMapValue(roads, norm_i, norm_j);
    //           if (rgba.x != 255) {
    //             isClear = false;
    //             break;
    //           }
    //         }
    //       }
    //
    //       if (isClear) {
    //         if (Math.random() < 0.3) {
    //             continue;
    //         }
    //
    //         var norm_i = i / settings.resolution;
    //         var norm_j = (settings.resolution - j) / settings.resolution;
    //         var rgba = getMapValue(city.maps['population'], norm_i, norm_j);
    //
    //         var density = Math.pow((255 - rgba.x) / 255, 2) * 20;
    //         var options = {
    //             zone: city.grid[i][j].zone,
    //             length: settings.size / settings.resolution,
    //             width: settings.size / settings.resolution,
    //             height: density * settings.size / settings.resolution * Math.random()
    //         };
    //         var building = builder.generateBuilding(options);
    //         building.position.set(i * square_size - offset, 0, j * square_size - offset);
    //         scene.add(building);
    //       }
    //     }
    // }

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

    var i = 1;
    for (var key in city.maps) {
      var plane = scene.getObjectByName(key);
      plane.position.set(0, -i * settings.split, 0);
      i++;
    }
}


/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * Source: http://strd6.com/2010/08/useful-javascript-game-extensions-clamp/
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
