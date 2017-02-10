const THREE = require('three')

var Meshtypes = {
  building_shape : {value: 0, name: "building"},
  window_shape: {value: 1, name: "window"}
};



export default class Shape
{
    constructor(scene, typeid)
    {
      this.type = Meshtypes[typeid];
      this.position = 0.0;
      this.width = 0.0;
      this.length = 0.0;
      this.height = 0.0;
      this.color = new THREE.Color(0xB266FF); //default is violet
      this.mesh = new THREE.Mesh();
    }

    printState()
    {
        console.log("Type: " + this.type.name);
        console.log("Position: " + this.position);
        console.log("Width: " + this.width);
        console.log("Height: " + this.height);
        console.log("Length: " + this.length);
    }
}
