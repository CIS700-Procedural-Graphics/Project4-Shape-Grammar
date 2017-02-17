const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

import STWindow from './window.js'

export default {
  symbol: 'Floor',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  color: COLOR.CEMENT,
  position: function () {
    var position = this.parent.position();
    var side = this.side;
    var id = this.id;
    var floors = this.floors;
    var midHeight = this.parent.scale().z;
    var baseHeight = this.parent.position().z;
    var floorHeight = midHeight / floors;

    var floorPosition = new THREE.Vector3(0, -2.6, floorHeight * id);

    floorPosition.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI * (side / 2));

    position.add(floorPosition);

    return position.clone();
  },
  scale: function () {
    var id = this.id;
    var floors = this.floors;
    var side = this.side;
    var midHeight = this.parent.scale().z;
    var floorHeight = midHeight / floors;

    var x;
    var y;
    var z = floorHeight;

    if (side % 2 == 0) {
      x = 5;
      y = 0.1;
    } else {
      x = 0.1;
      y = 5;
    }

    var scale = new THREE.Vector3(x, y, z);

    return scale.clone();
  },
  successors: function () {
    var successors = [];

    for (var i = 0; i < 5; i++) {
      var window = new Shape(STWindow, this);

      window.set('id', i);

      successors.push(window);
    }

    return successors;
  }
};