const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

export default {
  symbol: 'Chimney',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  color: COLOR.CHIMNEY,
  position: function () {
    var position = this.parent.position();
    var scale = this.parent.scale();

    position.x += THREE.Math.randInt(-0.5, 0.5);
    position.y += THREE.Math.randInt(-2, -1);
    position.z += (scale.z - 3);

    return position.clone();
  },
  scale: function () {
    var scale = new THREE.Vector3(1, 1, 4);

    return scale.clone();
  },
  terminal: true,
  successors: function() {
    return [];
  }
};

var STDoor = {
  symbol: 'Door',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  color: COLOR.DOOR,
  position: function () {
    var position = this.parent.position();
    var rand = THREE.Math.randInt(0, 1);
    var y = rand ? -2.6 : 2.6;

    position.add(new THREE.Vector3(-1.6, y, 0));

    return position;
  },
  scale: function () {
    var scale = new THREE.Vector3(0.5, 0.2, 1);

    return scale;
  },
  successors: function () {
    return [];
  }
};