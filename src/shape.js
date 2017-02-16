const THREE = require('three')
var scale_factor = 4;
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

    addWindows(shape, scene, mesh) //shape should be a floor
    {
      var pos = shape.pos;
      // debugger;
      var windowsize = 2.0; //increases with windowsize
      var numFloors = Math.floor((shape.scale.y*2.0)/windowsize); // -1.0 and 0.5 are the spaceing between the top and b0ttom
      var halffloor = (shape.scale.y/numFloors)*0.5;
      var floormid = new THREE.Vector3(shape.pos.x, shape.pos.y - shape.scale.y*0.5, shape.pos.z);
      var numwindowsx = Math.floor(shape.scale.x/1.0);
      var numwindowsz = Math.floor(shape.scale.z/1.0);

      for(var j=1; j<numFloors; j++) //start from 1 to skip the ground floor
      {
        var floorY = 2*j*halffloor; // starts from ground where y is zero
        // debugger;
        for(var i=0; i<numwindowsx; i++)
        {
          var window = mesh.clone();
          window.rotateY(3.14*0.5);
          var wallx;

          if(shape.pos.x >= -0.001 && shape.pos.x <= 0.001)
          {
            wallx = (floormid.x - (shape.scale.x * 0.5)) + i + 0.5;
            window.scale.set(0.9, 0.9, 0.9);
            window.position.set(wallx, floorY + 0.1 , floormid.z + shape.scale.z/2.0);
            scene.add( window );
          }
          else
          {
            //geometry has subdivided so scale is the entire thing not half
            wallx = (floormid.x - (shape.scale.x * 0.25)) + i + 0.5;
            window.scale.set(0.9, 0.9, 0.9);
            window.position.set(wallx - 1.0 * shape.scale.x * 0.25, floorY + 0.1 , floormid.z + shape.scale.z/2.0); //wallx - 1.0 * shape.scale.x * 0.25 is a trial and error value
            scene.add( window );
          }
        }

        for(var i=0; i<numwindowsx; i++)
        {
          var window = mesh.clone();
          window.rotateY(3.14*1.5);
          var wallx;
          // console.log(shape.pos);
          // console.log(shape.scale);
          // console.log(floormid);
          if(shape.pos.x >= -0.001 && shape.pos.x <= 0.001)
          {
            wallx = (floormid.x - (shape.scale.x * 0.5)) + i + 0.5;
            window.scale.set(0.9, 0.9, 0.9);
            window.position.set(wallx, floorY + 0.1 , floormid.z - shape.scale.z/2.0);
            scene.add( window );
          }
          else
          {
            //geometry has subdivided so scale is the entire thing not half
            wallx = (floormid.x - (shape.scale.x * 0.25)) + i + 0.5;
            window.scale.set(0.9, 0.9, 0.9);
            window.position.set(wallx - 1.0 * shape.scale.x * 0.25, floorY + 0.1 , floormid.z - shape.scale.z/2.0); //wallx - 1.0 * shape.scale.x * 0.25 is a trial and error value
            scene.add( window );
          }
          // console.log(wallx);
        }

        for(var i=0; i<numwindowsz; i++)
        {
          var window = mesh.clone();
          var wallz;
          if(shape.pos.z >= -0.001 && shape.pos.z <= 0.001)
          {
            wallz = (floormid.z - (shape.scale.z * 0.5)) + i + 0.5;
            window.scale.set(0.9, 0.9, 0.9);
            window.position.set(floormid.x - shape.scale.x/2.0, floorY + 0.1 , wallz);
            scene.add( window );
          }
          else
          {
            //geometry has subdivided so scale is the entire thing not half
            wallz = (floormid.z - (shape.scale.z * 0.25)) + i + 0.5;
            window.scale.set(0.9, 0.9, 0.9);
            window.position.set(floormid.x - shape.scale.x/2.0, floorY + 0.1 ,  wallz - 1.0 * shape.scale.z * 0.25); //wallx - 1.0 * shape.scale.x * 0.25 is a trial and error value
            scene.add( window );
          }
        }

        for(var i=0; i<numwindowsz; i++)
        {
          var window = mesh.clone();
          window.rotateY(3.14);
          var wallz;
          if(shape.pos.z >= -0.001 && shape.pos.z <= 0.001)
          {
            wallz = (floormid.z - (shape.scale.z * 0.5)) + i + 0.5;
            window.scale.set(0.9, 0.9, 0.9);
            window.position.set(floormid.x + shape.scale.x/2.0, floorY + 0.1 , wallz);
            scene.add( window );
          }
          else
          {
            //geometry has subdivided so scale is the entire thing not half
            wallz = (floormid.z - (shape.scale.z * 0.25)) + i + 0.5;
            window.scale.set(0.9, 0.9, 0.9);
            window.position.set(floormid.x + shape.scale.x/2.0, floorY + 0.1 ,  wallz - 1.0 * shape.scale.z * 0.25); //wallx - 1.0 * shape.scale.x * 0.25 is a trial and error value
            scene.add( window );
          }
        }
      }
    }

    addRoofcastle(shape, scene, mesh) //shape should be a building
    {
      var roof = mesh.clone();
      var pos = shape.pos;
      roof.scale.set(shape.scale.x *0.7, 1, shape.scale.z*0.7);
      roof.position.set(pos.x, pos.y+ shape.scale.y/2.0 , pos.z);
      scene.add( roof );
    }
    addRoofchimney(shape, scene, mesh) //shape should be a building
    {
      var roof = mesh.clone();
      var pos = shape.pos;
      roof.scale.set(shape.scale.x *1, 1, shape.scale.z*1);
      roof.position.set(pos.x, pos.y+ shape.scale.y/2.0 , pos.z);
      scene.add( roof );
    }

    addDoor(shape, scene, mesh) //shape should be a ground floor
    {
      var pos = shape.pos;
      var scale = shape.scale;
      var door = mesh.clone();
      door.scale.set(0.69, 0.69, 0.69);
      door.rotateY(3.14); // it now faces you, i.e +z

      var p = Math.random(); //to randomly pick a wall
      if(p<0.25)
      {
        //+x
        door.rotateY(3.14*0.5);
        var jitter = -scale.z/2.0  + 0.5 + Math.random()*(scale.z - 0.5);
        door.position.set(pos.x + scale.x/2.0, 0, pos.z + jitter);
      }
      else if(p<0.50)
      {
        //-x
        door.rotateY(3.14*1.5);
        var jitter = -scale.z/2.0  + 0.5 + Math.random()*(scale.z - 0.5);
        door.position.set(pos.x - scale.x/2.0, 0, pos.z + jitter);
      }
      else if(p<0.75)
      {
        //+z
        var jitter = -scale.x/2.0  + 0.5 + Math.random()*(scale.x - 0.5);
        door.position.set(pos.x + jitter, 0, pos.z + scale.z/2.0);
      }
      else
      {
        //-z
        var jitter = -scale.x/2.0  + 0.5 + Math.random()*(scale.x - 0.5);
        door.position.set(pos.x + jitter, 0, pos.z - scale.z/2.0);
      }
      scene.add(door);
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
}
