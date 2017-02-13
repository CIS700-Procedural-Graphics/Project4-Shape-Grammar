const THREE = require('three')
const OBJLoader = require('three-obj-loader')(THREE)

function Rule(prob, str)
{
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.successorString = str; // The string that will replace the char that maps to this Rule
}

export function Node(symbol)
{
	this.symbol = symbol;
	this.age = 0;
  this.mesh = null;
	this.pos = null;
	this.orient = null;
	this.scale = null;
  this.type = '';
  this.div = 0;
}

// var TurtleState = function(pos, dir) {
//     return {
//         pos: new THREE.Vector3(pos.x, pos.y, pos.z),
//         dir: new THREE.Vector3(dir.x, dir.y, dir.z)
//     }
// }

var Material1 = new THREE.MeshLambertMaterial( {color: 0xc6c5c8} ); //whitish lambert
var Material2 = new THREE.MeshPhongMaterial( {color: 0x131315} ); //metal
var Material3 = new THREE.MeshLambertMaterial( {color: 0xc45e61} ); //metal
var objLoader = new THREE.OBJLoader();
// var leafOBJ;
// objLoader.load('models/leaf.obj', function(obj) {
//   leafOBJ = obj.children[0].geometry;
// });

export default class Turtle
{
  constructor(scene) {
      //this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
      this.scene = scene;
      this.nodeList = [];
      this.iterations = 0;
      this.highpop = new THREE.Vector3(Math.random()*5+0, 0, Math.random()*5+0); // high population density point in the city.
  }

  addNode(node) // PUSH A NODE TO THE NODELIST - AT END
  {
    this.nodeList.push(node);
  };

  removeNode(node) // REMOVE A NODE FROM NODELIST - BY NAME
  {
    var pos = this.nodeList.indexOf(node);
    this.removeNodeAt(pos, 1);
  };

  removeNodeAt(pos) // REMOVE A NODE FROM NODELIST - BY POSITION IN ARRAY
  {
    this.nodeList.splice(pos,1);
  };

  // A function to help you debug your turtle functions
  // by printing out the turtle's current state.

  // Rotate the turtle's _dir_ vector by each of the
  // Euler angles indicated by the input.
  // rotateTurtle(x, y, z) {
  //     var e = new THREE.Euler(
  //             x * 3.14/180,
  //     				y * 3.14/180,
  //     				z * 3.14/180);
  //     this.state.dir.applyEuler(e);
  // }

  // Translate the turtle along its _dir_ vector by the distance indicated
  // moveForward(dist) {
  //     var newVec = this.state.dir.multiplyScalar(dist);
  //     this.state.pos.add(newVec);
  // };

  // Make a cylinder of given length and width starting at turtle pos
  // Moves turtle pos ahead to end of the new cylinder
  makeCylinder(nodeCyl) {
      var geometry = new THREE.CylinderGeometry(0.5,0.5,1);
      var cylinder = new THREE.Mesh(geometry, Material2);
      cylinder.position.set(nodeCyl.pos.x,nodeCyl.pos.y,nodeCyl.pos.z);
      cylinder.rotateX(nodeCyl.orient.x);
      cylinder.rotateY(nodeCyl.orient.y);
      cylinder.rotateZ(nodeCyl.orient.z);
      cylinder.scale.set(nodeCyl.scale.x,nodeCyl.scale.y,nodeCyl.scale.z);
      nodeCyl.type = 'cylinder';
      nodeCyl.mesh = cylinder;
      this.scene.add(cylinder);
  };

  makeCube(nodeCube)
  {
    var geometry = new THREE.CubeGeometry(1,1,1);
    var cube = new THREE.Mesh(geometry, Material3);
    cube.position.set(nodeCube.pos.x,nodeCube.pos.y,nodeCube.pos.z);
    cube.rotateX(nodeCube.orient.x);
    cube.rotateY(nodeCube.orient.y);
    cube.rotateZ(nodeCube.orient.z);
    cube.scale.set(nodeCube.scale.x,nodeCube.scale.y,nodeCube.scale.z);
    nodeCube.type = 'cube';
    nodeCube.mesh = cube;
    this.scene.add(cube);
    //console.log(nodeCube);
  };

  makeFancy(nodeCube,floors)
  {
    var geometry = new THREE.CubeGeometry(1,0.1,1);
    var cube = new THREE.Mesh(geometry, Material1);
    //var floors=99;
    for (var i = 0; i < floors; i++)
    {
       var instance = cube.clone();
       instance.position.set(nodeCube.pos.x,i*0.1+0.05,nodeCube.pos.z);
       instance.rotateY(i/floors*180 * 3.14/180);
       if(i%2==1)
        instance.scale.set(0.9,1,0.9);
       this.scene.add(instance);
    }

    cube.position.set(nodeCube.pos.x,nodeCube.pos.y,nodeCube.pos.z);
    cube.rotateX(nodeCube.orient.x);
    cube.rotateY(nodeCube.orient.y);
    cube.rotateZ(nodeCube.orient.z);
    cube.scale.set(nodeCube.scale.x,nodeCube.scale.y,nodeCube.scale.z);
    nodeCube.type = 'fancy1';
    nodeCube.mesh = cube;

    //console.log(nodeCube);
  };

  renderSymbols()
  {
    var size = this.nodeList.length;
    console.log("Initial length: "+this.nodeList.length);
    for(var i=0; i<size; i++)
    {
      //console.log(this.nodeList[i]);
      this.renderSymbol(this.nodeList[i]);
      if(this.nodeList.indexOf(this.nodeList[i])===-1)
      {
        i--;
        size--;
      }
    }
    console.log("Final length: "+this.nodeList.length);
  };

  renderSymbol(symbolNode)
  {
    if (symbolNode.type === 'cube')
    {
      if(symbolNode.div < 4)
        this.subDivCube(symbolNode);
      // if(symbolNode.age===2 && Math.random()>0.5)
      //   symbolNode.age++;
    }
    else if (symbolNode.type === 'cylinder')
    {
      if(symbolNode.div < 5)
        this.subDivCyl(symbolNode);
      // if(symbolNode.age===3 && Math.random()>0.5)
      //   symbolNode.age++;
    }

    symbolNode.age++;
  };

  start() // AXIOM
  {
    var C0 = new Node('C0_0');
    C0.pos = new THREE.Vector3(0,0.5,0);
    C0.scale = new THREE.Vector3(18,1,18);
    C0.orient = new THREE.Vector3(0,0,0);
    this.makeCube(C0);
    this.addNode(C0);

    var C1 = new Node('C1_0');
    C1.pos = new THREE.Vector3(0,0.5,18);
    C1.scale = new THREE.Vector3(18,1,18);
    C1.orient = new THREE.Vector3(0,0,0);
    this.makeCube(C1);
    this.addNode(C1);

    var C2 = new Node('C2_0');
    C2.pos = new THREE.Vector3(18,0.5,18);
    C2.scale = new THREE.Vector3(18,1,18);
    C2.orient = new THREE.Vector3(0,0,0);
    this.makeCube(C2);
    this.addNode(C2);

    var C3 = new Node('C3_0');
    C3.pos = new THREE.Vector3(18,0.5,0);
    C3.scale = new THREE.Vector3(18,1,18);
    C3.orient = new THREE.Vector3(0,0,0);
    this.makeCube(C3);
    this.addNode(C3);

    // FANCY:
    // var F = new Node('F');
    // F.pos = new THREE.Vector3(0,0.5,0);
    // F.scale = new THREE.Vector3(1,1,1);
    // F.orient = new THREE.Vector3(0,0,0);
    // this.makeFancy(F,99);
    // this.addNode(F);

  //  console.log(this.scene);
  };

  subDivCube(symbolNode)
  {
    var divided=false;
    var r0= Math.random();
    for(var i=0; i<3 && (r0>0.4 || symbolNode.div===0); i++)
    {
      var r1= Math.random();
      var innerdivided=false;
      for(var j=0; j<3 && (r1>0.3 || symbolNode.div===0); j++)
      {
        var r2= Math.random();
        var disthighpop = symbolNode.pos.distanceTo(this.highpop);

        if(r2<0.2  && symbolNode.div>0)
          continue;
        else if(r2<0.2  && symbolNode.div===0 && disthighpop<5 && innerdivided===false)
        {
          // var F = new Node('F');
          // F.pos = new THREE.Vector3(symbolNode.pos.x, symbolNode.pos.y, symbolNode.pos.z);
          // F.scale = new THREE.Vector3(1,1,1);
          // F.orient = new THREE.Vector3(0,0,0);
          // F.div = symbolNode.div+1;
          // this.makeFancy(F,99);
          // this.addNode(F);
          // divided=true;
          // innerdivided=true;
          continue;
        }

        var C = new Node(symbolNode.symbol+symbolNode.age+i+j);
        C.pos = new THREE.Vector3(symbolNode.pos.x + (i-1)*symbolNode.scale.x/3,
                                  symbolNode.pos.y,
                                  symbolNode.pos.z + (j-1)*symbolNode.scale.z/3);
        C.orient = new THREE.Vector3(symbolNode.orient.x, symbolNode.orient.y, symbolNode.orient.z);


        //console.log(disthighpop*disthighpop);
        var scalefactor = Math.random() * (1-(disthighpop*disthighpop)/800) + 1;
        C.scale = new THREE.Vector3(symbolNode.scale.x / 3, symbolNode.scale.y * scalefactor, symbolNode.scale.z / 3);
        C.pos.y = C.scale.y/2;
        C.div = symbolNode.div+1;

        if(symbolNode.div==2 && Math.random()>0.8 && disthighpop<5)
        {
          C.scale.y = Math.random()*3+3; // random height between 3 and 6
          C.pos.y = C.scale.y/2;
          this.makeCylinder(C);
        }
        else
          this.makeCube(C);

        if(symbolNode.div>=2 && C.type==='cube' && Math.random()>0.5) // some cubes will not divide
          C.div=4;

        this.addNode(C);

        //innerdivided=true;
        divided=true;
      }
    }

    if(divided===true)
    {
      //symbolNode.div++;
      this.scene.remove(symbolNode.mesh);
      this.removeNode(symbolNode);
    }
  };

  subDivCyl(symbolNode)
  {
    if(Math.random()>0.4)
    {
      var C = new Node(symbolNode.symbol+symbolNode.age+'cyl');
      C.pos = new THREE.Vector3(symbolNode.pos.x, symbolNode.pos.y, symbolNode.pos.z);
      C.orient = new THREE.Vector3(symbolNode.orient.x, symbolNode.orient.y, symbolNode.orient.z);
      //var scalefactor = Math.random() + 0.5;
      // var disthighpop = C.pos.distanceTo(this.highpop);
      // var scalefactor = Math.random() * (20-disthighpop)/10;
      C.scale = new THREE.Vector3(symbolNode.scale.x * 0.75, symbolNode.scale.y + Math.random()/4, symbolNode.scale.z * 0.75);
      C.pos.y = symbolNode.pos.y + symbolNode.scale.y/2 + C.scale.y/2;
      C.div = symbolNode.div+1;
      symbolNode.div=5;
      this.makeCylinder(C);
      this.addNode(C);
      //this.scene.remove(symbolNode.mesh);

      this.removeNode(symbolNode);
    }
  };


}
