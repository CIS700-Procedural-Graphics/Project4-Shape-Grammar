const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

import STFloor from './floor.js'

export default {
  symbol: 'Mid',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  color: COLOR.CEMENT,
  removable: false,
  position: function () {
    var buildingHeight = this.parent.scale().z;
    var baseHeight = buildingHeight * 0.15;
    var position = this.parent.position();

    position.add(new THREE.Vector3(0, 0, baseHeight));

    return position.clone();
  },
  scale: function () {
    var buildingHeight = this.parent.scale().z;
    var midHeight = buildingHeight * 0.7;
    var scale = new THREE.Vector3(5, 5, midHeight);

    return scale.clone();
  },
  successors: function () {
    var buildingHeight = this.parent.scale().z;
    var midHeight = buildingHeight * 0.7;
    var floors = 10;
    var sides = 4;
    var floorHeight = midHeight / floors;
    var successors = [];

    if (buildingHeight > 17) {
      for (var i = 0; i < floors; i++) {
        for (var j = 0; j < sides; j++) {
          var floor = new Shape(STFloor, this);

          floor.set('id', i);
          floor.set('floors', floors);
          floor.set('side', j);

          successors.push(floor);
        }
      }
    }

    return successors;
  }
};