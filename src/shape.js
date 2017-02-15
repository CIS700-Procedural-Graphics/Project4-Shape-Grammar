const THREE = require('three')
var scale_factor = 30;

export default class Shape
{
    constructor( typeid, _mesh)
    {
      this.type = typeid;
      this.name = "undefined";
      this.pos = new THREE.Vector3( 0, 0, 0 );
      this.scale = new THREE.Vector3( 1, 1, 1 );
      this.color = new THREE.Color(0xB266FF); //default is violet
      this.mesh = _mesh.clone();
    }

    printState()
    {
        console.log("Type: " + this.type);
        console.log("Name: " + this.name);
        console.log("Position: " + this.pos);
        console.log("scale_x: " + this.scale);
    }

    createbuilding(shapeList, index)
    {
      if(Math.random()> 0.5)
      {
        this.subDivideBuilding( shapeList, index, 'x');
      }
      else
      {
        this.subDivideBuilding( shapeList, index, 'z');
      }
      // this.subDivideBuilding( shapeList, index, 'x');
      // this.scaleBuilding( shapeList, index, 'x');
    }

    subDivideBuilding(shapeList, index, axis) //axis should be x or z
    {
      var shape1 = new Shape(shapeList[index].type, shapeList[index].mesh);
      var shape2 = new Shape(shapeList[index].type, shapeList[index].mesh);

      shape1.type = shapeList[index].type;
      shape1.pos = shapeList[index].pos.clone();
      shape1.scale = shapeList[index].scale.clone();
      shape1.color = (new THREE.Color(Math.random(), Math.random(), Math.random())).getHex();
      shape1.mesh = shapeList[index].mesh.clone();

      shape2.type = shapeList[index].type;
      shape2.pos = shapeList[index].pos.clone();
      shape2.scale = shapeList[index].scale.clone();
      shape2.color = (new THREE.Color(Math.random(), Math.random(), Math.random())).getHex();
      shape2.mesh = shapeList[index].mesh.clone();

      var pos = shapeList[index].pos;
      var scale = shapeList[index].scale;

      if(axis == 'x')
      {
        var half_axis = pos.x - scale.x/2.0;
        shape1.scale.setX(scale.x/2.1);
        shape2.scale.setX(scale.x/2.1);
        shape1.pos.setX(pos.x - half_axis/2.0 + 0.5 * Math.random());
        shape2.pos.setX(pos.x + half_axis/2.0 - 0.5 * Math.random());
      }
      else
      {
        var half_axis = pos.z - scale.z/2.0;
        shape1.scale.setZ(scale.z/2.1);
        shape2.scale.setZ(scale.z/2.1);
        shape1.pos.setZ(pos.z - half_axis/2.0 + 0.5 * Math.random());
        shape2.pos.setZ(pos.z + half_axis/2.0 - 0.5 * Math.random());
      }

      //randomly scale the shape
      this.scaleBuilding(shape1, 'y');
      this.scaleBuilding(shape2, 'y');

      shapeList.splice(index, 1); //deletion of current building
      shapeList.splice(index, 0, shape1, shape2);//add new buildings
    }

    scaleBuilding(shape, axis) //axis should be x or z
    {
      if(axis == 'x')
      {
        var temp = (0.25 + Math.random())*scale_factor;
        shape.pos.setX(shape.pos.x - (shape.scale.x - temp)/2.0);
        shape.scale.x = temp;
      }
      else if(axis == 'y')
      {
        var temp = (0.25 + Math.random())*scale_factor;
        shape.pos.setY(shape.pos.y - (shape.scale.y - temp)/2.0);
        shape.scale.y = temp;
      }
      else if(axis == 'z')
      {
        var temp = (0.25 + Math.random())*scale_factor;
        shape.pos.setZ(shape.pos.z - (shape.scale.z - temp)/2.0);
        shape.scale.z = temp;
      }
    }

    addFloors(shape, floorHeight) //shape should be a building
    {
      var numFloors = shape.scale.y / floorHeight;
      //no point wasting draw calls by actually subdividing the building so create
      //so extrude
      // beveled floor boundary
      var thickness = 0.05;
      var floorShape = new Shape();
      var temp_pos = shape.pos;
      temp_pos.y = shape.pos.y - shape.scale.y/2.0 + floorHeight - thickness;
    }

    addWindows(shape) //shape should be a floor
    {

    }

    addRoof(shape) //shape should be a building
    {

    }

    addDoor(shape) //shape should be a ground floor
    {

    }

    addBalcony(shape) //shape should be a floor that is not the ground floor
    {

    }

    replaceShape(shapeList, index) //inefficient, ask a TA about the other way
    {
      if(this.type == 0) this.createbuilding(shapeList, index);
      // else if ()
    }
}
