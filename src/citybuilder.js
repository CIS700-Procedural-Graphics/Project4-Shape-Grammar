const THREE = require('three');
import ShapeGrammar from './shapegrammar.js'


class BuildingNode {
	constructor(sym, geo, pos, scale) {
		this.symbol = sym;
		this.geometry = geo;
		this.position = pos;
		this.scale = scale;
    this.subdiv_cnt = 0;
	}
}

export default class CityBuilder {
  constructor(initial_state, tree_mesh, generations) {
    this.uptown_buildings = [];
    this.midtown_buildings = [];
    this.downtown_buildings = [];
    this.terminal_buildings = [];
    this.plants = [];
    this.generations = generations;
    this.shapegrammar = new ShapeGrammar();
    

    // define base geometries
    var skyscraper = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    var skyscraper_material = new THREE.MeshLambertMaterial({color: '#c0c0c0'});
    // skyscraper_material.specular.set('#ffffff');
    // skyscraper_material.shininess = 20;
    // skyscraper.computeFaceNormals();
    skyscraper.computeVertexNormals();
    var skyscraper_mesh = new THREE.Mesh(skyscraper, skyscraper_material);
    skyscraper_mesh.position.y = skyscraper_mesh.geometry.parameters.height / 2.0;

    var brownstone = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    var brownstone_material = new THREE.MeshLambertMaterial({color: '#7c5946'});
    brownstone.computeVertexNormals();
    var brownstone_mesh = new THREE.Mesh(brownstone, brownstone_material);
    brownstone_mesh.position.y = brownstone_mesh.geometry.parameters.height / 2.0;

    var loft = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    var loft_material = new THREE.MeshLambertMaterial({color: '#d2691e'});
    loft.computeVertexNormals();
    var loft_mesh = new THREE.Mesh(loft, loft_material);
    loft_mesh.position.y = loft_mesh.geometry.parameters.height / 2.0;

    this.geometries = {
      skyscraper: skyscraper_mesh,
      brownstone: brownstone_mesh,
      loft: loft_mesh,
      tree: tree_mesh
    }
    this.initialize_city(initial_state);
  }

  initialize_city(initial_state) {
    for (var i = 0; i < initial_state.length; i++) {
      switch(initial_state[i]) {
        case 'U':
          var pos = new THREE.Vector3(0, 0, -8);
          var scale = new THREE.Vector3(1, 1, 1);
          var building_node = new BuildingNode('U', this.geometries.brownstone.clone(), pos, scale);
          this.uptown_buildings.push(building_node);
          break;
        case 'M':
          var pos = new THREE.Vector3(0, 0, 0);
          var scale = new THREE.Vector3(1, 1, 1);
          var building_node = new BuildingNode('M', this.geometries.skyscraper.clone(), pos, scale);
          this.midtown_buildings.push(building_node);
          break;
        case 'D':
          var pos = new THREE.Vector3(0, 0, 7);
          var scale = new THREE.Vector3(1, 1, 1);
          var building_node = new BuildingNode('D', this.geometries.loft.clone(), pos, scale);
          this.downtown_buildings.push(building_node);
          break;
        case 'P':
          var pos = new THREE.Vector3(0, 0, -3.5);
          var scale = new THREE.Vector3(1.0/600, 1.0/600, 1.0/600);
          var building_node = new BuildingNode('P', this.geometries.tree.clone(), pos, scale);
          this.plants.push(building_node);
          break;
      }
    }
  }

  expand_city() {
    for (var i = 0; i < this.generations; i++) {
      var new_developments = [];
      // uptown expansion
      for (var j = 0; j < this.uptown_buildings.length; j++) {
        var building = this.uptown_buildings[j];
        var sym = building.symbol;
        if (sym === 'U' && building.subdiv_cnt > 2) {
          building.symbol = 'B';
          continue;
        }
        if (this.shapegrammar.grammar[sym]) {
          var rand = Math.random();
          var sum = 0;
          var successor;
          for (var k = 0; k < this.shapegrammar.grammar[sym].length; k++) {
            var rule = this.shapegrammar.grammar[sym][k];
            sum += rule.probability;
            if (sum >= rand) {
              successor = rule.successor;
              break;
            }
          }
          this.subdivide(new_developments, building, 'U', successor);
          building.subdiv_cnt += 1;
        }
      }
      this.uptown_buildings = this.uptown_buildings.concat(new_developments);

      // midtown expansion
      new_developments = [];
      for (var j = 0; j < this.midtown_buildings.length; j++) {
        var building = this.midtown_buildings[j];
        var sym = building.symbol;
        if (sym === 'M' && building.subdiv_cnt > 2) {
          building.symbol = 'S';
          continue;
        }
        if (this.shapegrammar.grammar[sym]) {
          var rand = Math.random();
          var sum = 0;
          var successor;
          for (var k = 0; k < this.shapegrammar.grammar[sym].length; k++) {
            var rule = this.shapegrammar.grammar[sym][k];
            sum += rule.probability;
            if (sum >= rand) {
              successor = rule.successor;
              break;
            }
          }
          this.subdivide(new_developments, building, 'M', successor);
          building.subdiv_cnt += 1;
        }
      }
      this.midtown_buildings = this.midtown_buildings.concat(new_developments);

      // downtown expansion
      new_developments = [];
      for (var j = 0; j < this.downtown_buildings.length; j++) {
        var building = this.downtown_buildings[j];
        var sym = building.symbol;
        if (sym === 'D' && building.subdiv_cnt > 2) {
          building.symbol = 'L';
          continue;
        }
        if (this.shapegrammar.grammar[sym]) {
          var rand = Math.random();
          var sum = 0;
          var successor;
          for (var k = 0; k < this.shapegrammar.grammar[sym].length; k++) {
            var rule = this.shapegrammar.grammar[sym][k];
            sum += rule.probability;
            if (sum >= rand) {
              successor = rule.successor;
              break;
            }
          }
          this.subdivide(new_developments, building, 'D', successor);
          building.subdiv_cnt += 1;
        }
      }
      this.downtown_buildings = this.downtown_buildings.concat(new_developments);

      // central park expansion
      var new_plants = [];
      for (var j = 0; j < this.plants.length; j++) {
        var plant = this.plants[j];
        if (plant.subdiv_cnt > 1) {
          plant.symbol = 'F';
          continue;
        }
        var sym = plant.symbol;
        if (this.shapegrammar.grammar[sym]) {
          var rand = Math.random();
          var sum = 0;
          var successor;
          for (var k = 0; k < this.shapegrammar.grammar[sym].length; k++) {
            var rule = this.shapegrammar.grammar[sym][k];
            sum += rule.probability;
            if (sum >= rand) {
              successor = rule.successor;
              break;
            }
          }
          this.subdivide(new_plants, plant, 'P', successor);
          plant.subdiv_cnt += 1;
        }
      }
      this.plants = this.plants.concat(new_plants);
    }
  }

  // take buiilding, and create new buildings based off of successor string
  subdivide(building_list, building, section, successor) {
    if (successor === 'F') {
      return;
    }
    else if (successor === 'G') {
      var geometry_clone = building.geometry.geometry.clone();
      var garden_material = new THREE.MeshLambertMaterial({color: '#76EE00'});
      var new_mesh = new THREE.Mesh(geometry_clone, garden_material);
      var new_pos = new THREE.Vector3(building.position.x, 0.1 * building.scale.y, building.position.z);
      var scale = new THREE.Vector3(building.scale.x / 2.0, 0.5, building.scale.z / 2.0);
      var term = new BuildingNode(successor, new_mesh, new_pos, scale);
      this.terminal_buildings.push(term);
    }
    else if (successor === 'T') {
      var cylinder_tank = new THREE.CylinderGeometry(building.scale.x / 50, building.scale.x / 50, building.scale.y / 20);
      var tank_material = new THREE.MeshLambertMaterial({color: '#663300'});
      var tank_mesh = new THREE.Mesh(cylinder_tank, tank_material);
      var tank_pos = new THREE.Vector3(building.position.x, 0.1 * building.scale.y, building.position.z);
      var tank_scale = new THREE.Vector3(1, 0.5, 1);
      var term = new BuildingNode(successor, tank_mesh, tank_pos, tank_scale);

      var tank_top = new THREE.ConeGeometry(building.scale.x / 25, building.scale.y / 40);
      var tank_top_mesh = new THREE.Mesh(tank_top, tank_material);
      var tank_top_pos = new THREE.Vector3(building.position.x, 0.1 * building.scale.y + building.scale.y / 60, building.position.z);
      var tank_top_scale = new THREE.Vector3(1, 0.5, 1);
      var term_top = new BuildingNode(successor, tank_top_mesh, tank_top_pos, tank_top_scale);

      this.terminal_buildings.push(term);
      this.terminal_buildings.push(term_top)
    }
    
    if (section === 'P') {
      var randX = Math.random() * 2 - 1;
      var randY;
      var randZ = Math.random() * 5 - 6;
      var new_pos = new THREE.Vector3(randX, 0, randZ);
      switch(successor) {
        case '1':
          randY = Math.random() + 0.5;
          break;
        case '2':
          randY = Math.random() + 1;
          break;
        case '3':
          randY = Math.random() * 3 + 1;
          break;
      }
      var new_mesh = building.geometry.clone();
      var scale = new THREE.Vector3(1/600, randY/600, 1/600);
      var sub = new BuildingNode(section, new_mesh, new_pos, scale);
      building_list.push(sub);
    }
    else {
      for (var l = 0; l < successor.length; l++) {
        var offset = this.get_random_road_width(section);
        var new_pos;
        if (successor[l] === 'N') {
          new_pos = new THREE.Vector3(building.position.x, 0, building.position.z + offset);
        }
        else if (successor[l] === 'S') {
          new_pos = new THREE.Vector3(building.position.x, 0, building.position.z - offset);

        }
        else if (successor[l] === 'E') {
          new_pos = new THREE.Vector3(building.position.x + offset, 0, building.position.z);
        }
        else {
          new_pos = new THREE.Vector3(building.position.x - offset, 0, building.position.z);
        }

        // check to makesure new_pos is doesn't violate zoning laws!
        if (section === 'U' && ((new_pos.z < -10 || new_pos.z > -4 || new_pos.x < -5.0 || new_pos.x > 5.0 ) || (new_pos.z > -6 && new_pos.x > -1 && new_pos.x < 1))) {
          break;
        }
        else if (section === 'M' && ((new_pos.z < -4.0 || new_pos.z > 4.0 || new_pos.x < -5.0 || new_pos.x > 5.0) || (new_pos.z < -1 && new_pos.x > -1 && new_pos.x < 1))) {
          break;
        }
        else if (section === 'D' && (new_pos.z < 4 || new_pos.z > 10 || new_pos.x < -5.0 || new_pos.x > 5.0)) {
          break;
        }
        else {
          var geometry_clone = building.geometry.geometry.clone();
          var material_clone = building.geometry.material.clone();
          var new_mesh = new THREE.Mesh(geometry_clone, material_clone);
          var color = this.get_random_color(section);
          var scale = this.get_random_scale(section);
          new_mesh.material.color.setHex(color);
          var sub = new BuildingNode(section, new_mesh, new_pos, scale);
          building_list.push(sub);
        }
      }
    }
    return building_list;
  }

  get_random_road_width(section) {
    if (section === 'U') {
      return Math.random() + 1.2;
    }
    else if (section === 'M') {
      return Math.random() + 1.2;
    }
    else {
      return Math.random() + 1.5;
    }
  }

  get_random_scale(section) {
    var x, y, z;
    if (section === 'U') {
      x = Math.random() * 3 + 1; 
      y = Math.random() * 20 + 1;
      z = Math.random() * 2 + 1;
      return new THREE.Vector3(x, y, z);    }
    else if (section === 'M') {
      x = Math.random() * 4 + 1; 
      y = Math.random() * 40 + 1;
      z = Math.random() * 3 + 1;
      return new THREE.Vector3(x, y, z);
    }
    else {
      x = Math.random() * 5 + 1; 
      y = Math.random() * 10 + 1;
      z = Math.random() * 4 + 1;
      return new THREE.Vector3(x, y, z);
    }
  }

  get_random_color(section) {
    var rand = Math.random();
    if (section === 'U') {
      if (rand < 0.33) {
        return 0x841f27;
      }
      else if (rand >= 0.33 && rand < 0.66) {
        return 0x7c5946;
      }
      else {
        return 0x5d4234;
      }
    }
    else if (section === 'M') {
      if (rand < 0.33) {
        return 0xcae1e9;
      }
      else if (rand >= 0.33 && rand < 0.66) {
        return 0xffffff;
      }
      else {
        return 0xb0e0e6;
      }
    }
    else {
      if (rand < 0.33) {
        return 0xda7a37;
      }
      else if (rand >= 0.33 && rand < 0.66) {
        return 0xbc8f8f;
      }
      else {
        return 0x766b5d;
      }
    }
  }
}