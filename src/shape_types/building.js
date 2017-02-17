const THREE = require('three');
const _ = require('lodash');

import COLOR from '../color.js'
import Shape from '../shape.js'

import STBase from './base.js'
import STMid from './mid.js'
import STTop from './top.js'
import STHouse from './house.js'
import STGarage from './garage.js'

export default {
  symbol: 'Building',
  geometry: function () {
    var geometry = new THREE.BoxGeometry(1, 1, 1);

    return geometry;
  },
  color: COLOR.CEMENT,
  position: function () {
    var position = this.worldPosition.clone();

    return position.clone();
  },
  scale: function () {

    if (this.computed.scale) {
      return this.computed.scale.clone();
    }

    var rand = THREE.Math.randInt(-2, 2);
    var scale = new THREE.Vector3(5, 5, 4 + (40 * Math.pow(this.worldDensity, 3.0)) + rand);

    this.computed.scale = scale;

    return scale.clone();
  },
  successors: function () {
    var scale = this.scale();
    var type = (scale.z > 17) ? 'skyscraper' : 'house';

    if (type == 'skyscraper') {

      var base = new Shape(STBase, this);
      var mid = new Shape(STMid, this);
      var top = new Shape(STTop, this);

      return [ base, mid, top ];

    } else {

      var house = new Shape(STHouse, this);
      var garage = new Shape(STGarage, this);

      return [ house, garage ];

    }
  }
};