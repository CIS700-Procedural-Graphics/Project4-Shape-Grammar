const THREE = require('three')
var scale_factor = 3;
var building_Material = new THREE.ShaderMaterial({
  uniforms:
  {
    shapeColor:
    {
        type: "v3",
        value: new THREE.Color(0xB266FF) // violet
    },
    lightVec:
    {
        type: "v3",
        value: new THREE.Vector3( 10, 10, 10 )
    }
  },
  vertexShader: require('./shaders/buildings-vert.glsl'),
  fragmentShader: require('./shaders/buildings-frag.glsl')
});


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
      var axis = Math.random() * 2.0 - 0.01;
      axis = Math.floor(axis);

      this.subDivideBuilding( shapeList, index, axis);
      // this.subDivideBuilding( shapeList, index, Math.abs(axis-1));
      // this.subDivideBuilding( shapeList, index + 1, Math.abs(axis-1));
    }

    subDivideBuilding(shapeList, index, axis) //axis should be x or z
    {
        var shape1 = new Shape(shapeList[index].type, shapeList[index].mesh);
        var shape2 = new Shape(shapeList[index].type, shapeList[index].mesh);

        shape1.type = shapeList[index].type;
        shape1.pos = shapeList[index].pos.clone();
        shape1.scale = shapeList[index].scale.clone();
        shape1.color = (new THREE.Color(Math.random(), Math.random(), Math.random())).getHex();
        shape1.mesh = new THREE.Mesh( shapeList[index].mesh.geometry.clone(), new THREE.MeshBasicMaterial( { color: shape1.color } ));

        shape2.type = shapeList[index].type;
        shape2.pos = shapeList[index].pos.clone();
        shape2.scale = shapeList[index].scale.clone();
        shape2.color = (new THREE.Color(Math.random(), Math.random(), Math.random())).getHex();
        shape2.mesh = shapeList[index].mesh.clone();

        var pos = shapeList[index].pos;
        var scale = shapeList[index].scale;

        if(axis == 0 && scale.x>1.5)
        {
          var half_axis = scale.x * 0.5;
          shape1.scale.setX(scale.x*0.4);
          shape2.scale.setX(scale.x*0.4);
          shape1.pos.setX(pos.x - half_axis*0.5);// - 0.5 * Math.random());
          shape2.pos.setX(pos.x + half_axis*0.5);// + 0.5);// * Math.random());
        }
        if(axis == 1 && scale.z>1.5)
        {
          var half_axis = scale.z * 0.5;
          shape1.scale.setZ(scale.z*0.4);
          shape2.scale.setZ(scale.z*0.4);
          shape1.pos.setZ(pos.z - half_axis*0.5);// - 0.5);// * Math.random());
          shape2.pos.setZ(pos.z + half_axis*0.5);// + 0.5);// * Math.random());
        }

        //randomly scale the shape
        this.scaleBuilding(shape1, 1);
        this.scaleBuilding(shape2, 1);

        shapeList.splice(index, 1); //deletion of current building
        shapeList.splice(index, 0, shape1, shape2);//add new buildings
    }

    scaleBuilding(shape, axis) //axis should be x or z
    {
      if(axis == 0)
      {
        var temp = 1 + Math.random() * scale_factor;
        shape.pos.setX(shape.pos.x - (shape.scale.x - temp)/2.0);
        shape.scale.x = temp;
      }
      else if(axis == 1)
      {
        var temp = 1 + Math.random() * scale_factor;
        shape.pos.setY(shape.pos.y - (shape.scale.y - temp)/2.0);
        shape.scale.y = temp;
      }
      else if(axis == 2)
      {
        var temp = 1 + Math.random() * scale_factor;
        shape.pos.setZ(shape.pos.z - (shape.scale.z - temp)/2.0);
        shape.scale.z = temp;
      }
    }

    addWindows(shape) //shape should be a floor
    {

    }

    addRoof(shape, scene, mesh) //shape should be a building
    {
      // var geometry = new THREE.ConeGeometry( 5, 20, 32 );
      // var roof = new THREE.Mesh( geometry, building_Material );
      var roof = mesh.clone();
      var pos = shape.pos;
      roof.scale.set(shape.scale.x *0.7, 1, shape.scale.z*0.7);
      roof.position.set(pos.x, pos.y+ shape.scale.y/2.0 , pos.z);
      scene.add( roof );
    }

    addDoor(shape) //shape should be a ground floor
    {

    }

    addBalcony(shape) //shape should be a floor that is not the ground floor
    {
      // var geometry = new THREE.ConeGeometry( 5, 20, 32 );
      // var roof = new THREE.Mesh( geometry, building_Material );
      // var pos = shape.pos;
      // roof.scale.set(shape.scale.x *0.1, 0.2, shape.scale.z*0.1);
      // roof.position.set(pos.x, pos.y+ shape.scale.y/2.0 + 0.35*shape.scale.y, pos.z);
      // scene.add( roof );
    }

    replaceShape(shapeList, index) //inefficient, ask a TA about the other way
    {
      if(this.type == 0) this.createbuilding(shapeList, index);
      // else if ()
    }
}
