import FLOOR_APT_OBJ from './../assets/floor.obj'
import ROOF_APT_OBJ from './../assets/apartment_roof.obj'
import FLOOR_SKY_OBJ from './../assets/skyscraper_floor.obj'
import ROOF_SKY_OBJ from './../assets/skyscraper_roof.obj'
import PARK_OBJ from './../assets/park.obj'
import TREE_OBJ from './../assets/tree.obj'
import ROAD_OBJ from './../assets/road.obj'

import FLOOR_APT_MTL from './../assets/floor.mtl'
import ROOF_APT_MTL from './../assets/apartment_roof.mtl'
import FLOOR_SKY_MTL from './../assets/skyscraper_floor.mtl'
import ROOF_SKY_MTL from './../assets/skyscraper_roof.mtl'
import PARK_MTL from './../assets/park.mtl'
import TREE_MTL from './../assets/tree.mtl'
import ROAD_MTL from './../assets/road.mtl'

export const Geometry = {
  FLOOR_APT: {
    objFile: FLOOR_APT_OBJ,
    mtlFile: FLOOR_APT_MTL,
    obj: {},
    sizeRatio: 1.7,
  },
  GROUND_FLOOR_APT: {
    objFile: FLOOR_APT_OBJ,
    mtlFile: FLOOR_APT_MTL,
    obj: {},
  },
  ROOF_APT: {
    objFile: ROOF_APT_OBJ,
    mtlFile: ROOF_APT_MTL,
    obj: {}
  },
  FLOOR_SKY: {
    objFile: FLOOR_SKY_OBJ,
    mtlFile: FLOOR_SKY_MTL,
    obj: {},
    sizeRatio: 4,
  },
  GROUND_FLOOR_SKY: {
    objFile: FLOOR_SKY_OBJ,
    mtlFile: FLOOR_SKY_MTL,
    obj: {},
  },
  ROOF_SKY: {
    objFile: ROOF_SKY_OBJ,
    mtlFile: ROOF_SKY_MTL,
    obj: {}
  },
  PARK: {
    objFile: PARK_OBJ,
    mtlFile: PARK_MTL,
    obj: {},
  },
  TREE: {
    objFile: TREE_OBJ,
    mtlFile: TREE_MTL,
    obj:{},
  },
  ROAD: {
    objFile: ROAD_OBJ,
    mtlFile: ROAD_MTL,
    obj: {}
  }
  // STORE_FRONT: { // -> can function as GROUND_FLOOR_APT or GROUND_FLOOR_SKY
  //   path: '', //TODO
  //   obj: {},
  // },

  //TODO: STORE_FRONT
}
