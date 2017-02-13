const THREE = require('three');
const _ = require('lodash');

var COLOR = {
  RED: 0xff0000,
  GREEN: 0x00ff00,
  BLUE: 0x0000ff,

  CEMENT: 0x627c97,
  WINDOW_OFF: 0x242c38,
  WINDOW_ON: 0xf8e997,
  DOOR: 0xffffff,
  ROOF: 0xc7956c,
  SILO: 0xb2a69e,
  CHIMNEY: 0xd86345,
  ANTENNA: 0xc7c8e1
};

export default class Shape {
  constructor(shape, parent) {
    this.parent = parent;
    this.symbol = shape.symbol;
    this.geometry = shape.geometry;
    this.position = shape.position;
    this.scale = shape.scale;
    this.color = shape.color;
    this.terminal = shape.terminal || false;
    this.computed = {};
    this.successors = shape.successors;
    this.wireframe == shape.wireframe || false;
  }

  set(prop, value) {
    this[prop] = value;
  }

  recompute() {
    this.computed = {};
  }
};

var STBuilding = new Shape({
  symbol: 'Building',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  position: function () {
    var position = this.worldPosition.clone();

    return position;
  },
  scale: function () {

    if (this.computed.scale) {
      return this.computed.scale;
    }

    var rand = THREE.Math.randInt(-2, 2);
    var scale = new THREE.Vector3(5, 5, 4 + (30 * this.worldDensity) + rand);

    this.computed.scale = scale;

    return scale;
  },
  color: COLOR.CEMENT,
  successors: function () {
    var base = new Shape(STBase, this);
    var mid = new Shape(STMid, this);
    var top = new Shape(STTop, this);

    return [ base, mid, top ];
  }
});

var STBase = new Shape({
  symbol: 'Base',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  position: function () {
    var position = this.parent.position();

    return position;
  },
  scale: function () {
    var buildingHeight = this.parent.scale().z;
    var baseHeight = buildingHeight * 0.15;
    var scale = new THREE.Vector3(5, 5, baseHeight);

    return scale;
  },
  color: COLOR.CEMENT,
  successors: function () {
    var base = new Shape(STBase, this.parent);
    var door = new Shape(STDoor, this);

    base.terminal = true;
    door.terminal = true;

    return [ base, door ];
  }
});

var STMid = new Shape({
  symbol: 'Mid',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  position: function () {
    var buildingHeight = this.parent.scale().z;
    var baseHeight = buildingHeight * 0.15;
    var position = this.parent.position();

    position.add(new THREE.Vector3(0, 0, baseHeight));

    return position;
  },
  scale: function () {
    var buildingHeight = this.parent.scale().z;
    var midHeight = buildingHeight * 0.7;
    var scale = new THREE.Vector3(5, 5, midHeight);

    return scale;
  },
  color: COLOR.CEMENT,
  successors: function () {
    var buildingHeight = this.parent.scale().z;
    var midHeight = buildingHeight * 0.7;
    var floors = 10;
    var sides = 4;
    var floorHeight = midHeight / floors;
    var successors = [];

    if (midHeight > 12) {
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

    var mid = new Shape(STMid, this.parent);

    successors.push(mid);

    return successors;
  }
});

var STTop = new Shape({
  symbol: 'Top',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  position: function () {
    var position = this.parent.position();
    var buildingHeight = this.parent.scale().z;
    var baseMidHeight = buildingHeight * 0.85;

    position.add(new THREE.Vector3(0, 0, baseMidHeight));

    return position;
  },
  scale: function () {
    var buildingHeight = this.parent.scale().z;
    var topHeight = buildingHeight * 0.15;
    var scale = new THREE.Vector3(5, 5, topHeight);

    return scale;
  },
  color: COLOR.CEMENT,
  successors: function () {
    var buildingHeight = this.parent.scale().z;
    var midHeight = buildingHeight * 0.7;
    var successor;

    if (midHeight > 12) {
      successor = new Shape(STSilo, this);
    } else {
      successor = new Shape(STRoof, this);
    }

    return [ successor ];
  }
});

var STSilo = new Shape({
  symbol: 'Silo',
  geometry: function () {
    var rand = THREE.Math.randInt(4, 8);
    var geometry = new THREE.CylinderGeometry(1, 1, 1, rand);

    geometry.rotateX(Math.PI / 2);

    return geometry;
  },
  position: function () {
    var position = this.parent.position();

    return position;
  },
  scale: function () {
    var scale = this.parent.scale();

    scale.z = 1;

    return scale.multiply(new THREE.Vector3(0.5, 0.5, 1));
  },
  color: COLOR.SILO,
  successors: function () {
    var successors = [];
    var silo = new Shape(STSilo, this.parent);

    if (THREE.Math.randFloat(0, 1) > 0.5) {
      var antenna = new Shape(STAntenna, this);
      successors.push(antenna);
    }

    successors.push(silo);

    return successors;
  }
});

var STAntenna = new Shape({
  symbol: 'Antenna',
  geometry: function () {
    var geometry = new THREE.CylinderGeometry(1, 1, 1, 32);

    geometry.rotateX(Math.PI / 2);

    return geometry;
  },
  position: function () {
    var position = this.parent.position();

    position.x += THREE.Math.randInt(-0.5, 0.5);
    position.y += THREE.Math.randInt(-1, 1);

    return position;
  },
  scale: function () {
    var rand = THREE.Math.randInt(2, 4);
    var scale = new THREE.Vector3(0.1, 0.1, rand);

    return scale;
  },
  color: COLOR.ANTENNA,
  terminal: true,
  successors: function() {
    return [];
  }
});

var STRoof = new Shape({
  symbol: 'Roof',
  geometry: function () {
    var shape = new THREE.Shape();

    var vertices = [
      new THREE.Vector2(-0.5, 0), new THREE.Vector2(0, 0.5), new THREE.Vector2(0.5, 0)
    ];

    shape.fromPoints(vertices);

    var geometry = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      amount: 1,
      bevelEnabled: false
    });

    geometry.rotateX(Math.PI / 2);

    return geometry;
  },
  position: function () {
    var position = this.parent.position();

    position.add(new THREE.Vector3(0, 2, -2));

    return position;
  },
  scale: function () {
    var scale = this.parent.scale();

    scale.z = 3;

    return scale.multiply(new THREE.Vector3(1, 0.8, 1));
  },
  color: COLOR.ROOF,
  successors: function () {
    var roof = new Shape(STRoof, this.parent);
    var chimney = new Shape(STChimney, this);

    return [ roof, chimney ];
  }
});

var STChimney = new Shape({
  symbol: 'Chimney',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  position: function () {
    var position = this.parent.position();

    position.x += THREE.Math.randInt(-0.5, 0.5);
    position.y += THREE.Math.randInt(-2, -1);

    return position;
  },
  scale: function () {
    var scale = new THREE.Vector3(1, 1, 4);

    return scale;
  },
  color: COLOR.CHIMNEY,
  terminal: true,
  successors: function() {
    return [];
  }
});

var STDoor = new Shape({
  symbol: 'Door',
  geometry: new THREE.BoxGeometry(1, 1, 1),
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
  color: COLOR.DOOR,
  successors: function () {
    return [];
  }
});

var STFloor = new Shape({
  symbol: 'Floor',
  geometry: new THREE.BoxGeometry(1, 1, 1),
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

    return position;
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
      y = 0.5;
    } else {
      x = 0.5;
      y = 5;
    }

    var scale = new THREE.Vector3(x, y, z);

    return scale;
  },
  color: COLOR.CEMENT,
  successors: function () {
    var successors = [];

    for (var i = 0; i < 5; i++) {
      var window = new Shape(STWindow, this);

      window.set('id', i);

      successors.push(window);
    }

    return successors;
  }
});

var STWindow = new Shape({
  symbol: 'Window',
  geometry: new THREE.BoxGeometry(1, 1, 1),
  position: function () {
    var id = this.id;
    var side = this.parent.side;
    var position = this.parent.position();
    var floors = this.parent.floors;
    var midHeight = this.parent.scale().z;
    var floorHeight = midHeight / floors;

    var x = [ -2, -1, 0, 1, 2 ];
    var z = (floorHeight - 0.8) / -2;
    var windowPosition = new THREE.Vector3(x[id], -0.5, z);

    windowPosition.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI * (side / 2));

    position.add(windowPosition);

    return position;
  },
  scale: function () {
    var scale = this.parent.scale();
    var side = this.parent.side;

    if (side % 2 == 0) {
      scale.x = 0.8;
    } else {
      scale.y = 0.8;
    }

    scale.z = 0.8;

    return scale;
  },
  color: function () {
    return THREE.Math.randInt(0, 3) ? COLOR.WINDOW_OFF : COLOR.WINDOW_ON;
  },
  terminal: true,
  successors: function () {
    return [];
  }
});

export function ShapeType() {
  return {
    Building: STBuilding,
    Base: STBase,
    Mid: STMid,
    Top: STTop,
    Door: STDoor,
    Floor: STFloor,
    Silo: STSilo,
    Roof: STRoof,
    Chimney: STChimney,
    Antenna: STAntenna
  }
};