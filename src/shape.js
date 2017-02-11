const THREE = require('three')

exports.shape = {
  building_shape : {value: 0, name: "building"},
  window_shape: {value: 1, name: "window"}
};

var building_Material = new THREE.ShaderMaterial({
  uniforms:
  {
    shapeColor:
    {
        type: "v3",
        value: new THREE.Color(0xB266FF) // violet
    }
  },
  vertexShader: require('./shaders/buildings-vert.glsl'),
  fragmentShader: require('./shaders/buildings-frag.glsl')
});

var cube = new THREE.BoxGeometry( 1, 1, 1 );
// var cube1 = new THREE.Mesh( cube, building_Material );

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
