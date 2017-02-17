const THREE = require('three');
const _ = require('lodash');

import STBuilding from './shape_types/building'
import STBase from './shape_types/base'
import STMid from './shape_types/mid'
import STTop from './shape_types/top'
import STHouse from './shape_types/house'
import STGarage from './shape_types/garage'
import STRoof from './shape_types/roof'
import STSilo from './shape_types/silo'
import STDoor from './shape_types/door'
import STChimney from './shape_types/chimney'
import STAntenna from './shape_types/antenna'
import STWindow from './shape_types/window'
import STFloor from './shape_types/floor'
import STDoubleDoor from './shape_types/doubledoor'
import STGarageDoor from './shape_types/garagedoor'

export function ShapeType() {
  return {
    Building: STBuilding,
    Base: STBase,
    Mid: STMid,
    Top: STTop,
    House: STHouse,
    Garage: STGarage,
    Door: STDoor,
    DoubleDoor: STDoubleDoor,
    Floor: STFloor,
    Silo: STSilo,
    Roof: STRoof,
    Chimney: STChimney,
    Antenna: STAntenna,
    GarageDoor: STGarageDoor
  }
};