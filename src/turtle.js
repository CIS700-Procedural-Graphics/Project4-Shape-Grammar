//import img from './main.js'

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
	this.steps = 0; // used only for the ruins
	//this.ruins = false; // used only for the ruins
}

// var TurtleState = function(pos, dir) {
//     return {
//         pos: new THREE.Vector3(pos.x, pos.y, pos.z),
//         dir: new THREE.Vector3(dir.x, dir.y, dir.z)
//     }
// }






var Material1 = new THREE.MeshLambertMaterial( {color: 0xf7f7e6} ); //whitish lambert
var Material2 = new THREE.MeshPhongMaterial( {color: 0x131315} ); //metal
var Material3 = new THREE.MeshLambertMaterial( {color: 0xc45e61} ); //metal
//var texture = THREE.ImageUtils.loadTexture('crate.gif');
var Material4;// = new THREE.MeshBasicMaterial({map: texture});
var loader = new THREE.TextureLoader();
loader.load('models/tex3.jpg', function ( texture ) {
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.x = 2;
	texture.repeat.y = 2;
  Material4 = new THREE.MeshPhongMaterial({map: texture, overdraw: 0.5});
});
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
			this.ruinsList = [];
      this.iterations = 0;
      this.highpop = new THREE.Vector3(Math.random()*5+0, 0, Math.random()*5+0); // high population density point in the city.
			this.ruins = false;

			this.img = [];
			this.img1 = [];
			for(var i=0; i<40; i++)
			{
			  this.img[i]=[];
			  this.img1[i]=[];
			}
			this.createTerrain();
	}

	createTerrain() {
		var geometry1 = new THREE.PlaneGeometry( 20*2, 20*2, 32 );
	  var material1 = new THREE.MeshPhongMaterial( {color: 0x5386ba, side: THREE.DoubleSide} );
	  var plane1 = new THREE.Mesh( geometry1, material1 );
	  plane1.position.set(9,-0.01,9);
	  plane1.rotateX(90*3.14/180);
	  this.scene.add( plane1 );

	  var geometry = new THREE.PlaneGeometry( 20*2, 20*2, 39, 39);
	  var material = new THREE.MeshLambertMaterial( {color: 0xb2ae92, wireframe: false ,side: THREE.DoubleSide} );
	  var plane = new THREE.Mesh( geometry, material );
	  // plane.castShadow = true;
	  // plane.receiveShadow = true;
	  plane.position.set(9,0,9);
	  plane.rotateX(90*3.14/180);

	  for(var i=0; i<40; i++)
	  {
	    for(var j=0; j<40; j++)
	    {
	      var r=0;
	      //if(Math.random()<0.4)
	      r -= Math.random()*2;
	      if(i%2===0 && j%2===0 && Math.random()<0.5)
	        r -= Math.random()*4;
	      if(i%4===0 && j%4===0 && Math.random()<0.5)
	        r -= Math.random()*8;
	      if(i%8===0 && j%8===0 && Math.random()<0.5)
	        r -= Math.random()*16;
	      this.img1[i][j]= r;
	    }
	  }

	  for(var i=0+2; i<40-2; i++)
	  {
	    for(var j=0+2; j<40-2; j++)
	    {
	      this.img[i][j]=0;
	      for(var k=-2; k<3; k++)
	      {
	        for(var l=-2; l<3; l++)
	        {
	          this.img[i][j] += this.img1[i+k][j+l]/25;
	        }
	      }
	      plane.geometry.vertices[i*40+j].z=this.img[i][j]+1;
	      //console.log(img[i][j]);
	    }
	  }
	  plane.name="plane";
	  this.scene.add( plane );

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
      var cylinder = new THREE.Mesh(geometry, Material1);
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
		var mat = new THREE.MeshLambertMaterial();
		//mat.copy(Material4);
    var cube = new THREE.Mesh(geometry, Material4);
    cube.position.set(nodeCube.pos.x,nodeCube.pos.y,nodeCube.pos.z);
    cube.rotateX(nodeCube.orient.x);
    cube.rotateY(nodeCube.orient.y);
    cube.rotateZ(nodeCube.orient.z);
    cube.scale.set(nodeCube.scale.x,nodeCube.scale.y,nodeCube.scale.z);
		// mat.map.wrapS = THREE.RepeatWrapping;
		// mat.map.wrapT = THREE.RepeatWrapping;
		// mat.map.repeat.x=nodeCube.scale.x;
		// mat.map.repeat.y=nodeCube.scale.y;
    nodeCube.type = 'cube';
    nodeCube.mesh = cube;
    this.scene.add(cube);
    //console.log(nodeCube);
  };

  makeRuins(nodeR,steps)
  {
		var geometry = new THREE.CubeGeometry(5,5,5);
    var cube = new THREE.Mesh(geometry, Material1);
    //var floors=99;
    for (var i = 0; i < steps; i++)
    {
       var instance = cube.clone();
       instance.position.set(nodeR.pos.x,i*0.1*nodeR.scale.y+nodeR.scale.y/2/steps,nodeR.pos.z);
       instance.scale.set((steps-i+1)*0.1,0.1,(steps-i+1)*0.1);
			 instance.name='ruins_stuff'+i;
			 this.ruinsList.push(instance);
       this.scene.add(instance);
    }

		nodeR.type = 'ruins';
		nodeR.steps = steps;

    // vertical scales of parts:
    // var bot = Math.random() * 0.5;
    // var top = (1-bot)/2;
    // var mid = top;
    //
    // var R_top = new Node('R_TOP');
    // R_top.pos = new THREE.Vector3(pos.x,1-top,pos.z);
    // R_top.scale = new THREE.Vector3(1,top,1);
    // R_top.orient = new THREE.Vector3(0,0,0);
    // var geometry = new THREE.CubeGeometry(1,1,1);
    // var cube = new THREE.Mesh(geometry, Material3);
    // cube.position.set(R_top.pos.x,R_top.pos.y,R_top.pos.z);
    // cube.scale.set(R_top.scale.x,R_top.scale.y,R_top.scale.z);
    // R_top.type = 'ruins_top';
    // R_top.mesh = cube;
    // this.scene.add(cube);
    //
    // var R_bot = new Node('R_BOTTOM');
    // R_bot.pos = new THREE.Vector3(pos.x,0,pos.z);
    // R_bot.scale = new THREE.Vector3(1,bot,1);
    // R_bot.orient = new THREE.Vector3(0,0,0);
    // var geometry = new THREE.CubeGeometry(1,1,1);
    // var cube = new THREE.Mesh(geometry, Material3);
    // cube.position.set(R_bot.pos.x,R_bot.pos.y,R_bot.pos.z);
    // cube.scale.set(R_bot.scale.x,R_bot.scale.y,R_bot.scale.z);
    // R_bot.type = 'ruins_bot';
    // R_bot.mesh = cube;
    // this.scene.add(cube);

    //console.log(nodeCube);
  };

	expandRuins(nodeR)
	{
		console.log(nodeR.symbol);
		console.log(nodeR.steps-nodeR.div-3);
		// CLEAR OLD STUFF FROM THE SCENE
		for (var i = 0; i < this.ruinsList.length; i++)
		{
			var ins=this.ruinsList.pop();
			this.scene.remove(ins);
		}

		//	BOTTOM STEPS
		var geometry = new THREE.CubeGeometry(5,5,5);
		var cube = new THREE.Mesh(geometry, Material1);
		for (var i = 0; i < nodeR.steps-nodeR.div-3; i++)
		{
			 var instance = cube.clone();
			 instance.position.set(nodeR.pos.x,i*0.1*nodeR.scale.y+nodeR.scale.y/20,nodeR.pos.z);
			 instance.scale.set((nodeR.steps-i+1)*0.1,0.1,(nodeR.steps-i+1)*0.1);
			 instance.name='ruins_stuff'+nodeR.symbol+i;
			 this.ruinsList.push(instance);
			 this.scene.add(instance);
		}

		//	PILLARS
		geometry = new THREE.CylinderGeometry(0.1,0.1,(nodeR.div+1));
		var cylinder = new THREE.Mesh(geometry, Material1);
		for (var i = -nodeR.div-1; i <= nodeR.div+1; i++)
		{
			for(var j = -nodeR.div-1; j <= nodeR.div+1; j++)
			{
				if(Math.abs(i)<nodeR.div && Math.abs(j)<nodeR.div+2)
					continue;

				var instance = cylinder.clone();
				instance.position.set(nodeR.pos.x+i*0.5,
															(nodeR.steps-nodeR.div-4)*0.1*nodeR.scale.y+nodeR.scale.y/10+(nodeR.div+1)/2,
														  nodeR.pos.z+j*0.5);
				instance.name='ruins_pillars'+nodeR.symbol+i;
				this.ruinsList.push(instance);
				this.scene.add(instance);
			}
		}

		//	TOP
		geometry = new THREE.CubeGeometry(5,5,5);
		cube = new THREE.Mesh(geometry, Material1);
		for (var i = nodeR.steps-nodeR.div-3; i < nodeR.steps; i++)
		{
			var instance = cube.clone();
			instance.position.set(nodeR.pos.x,
			 											(nodeR.steps-nodeR.div-4)*0.1*nodeR.scale.y+nodeR.scale.y/10+(nodeR.div+1)+(i-(nodeR.steps-nodeR.div-3))*0.05*nodeR.scale.y,
			 											//(nodeR.steps-nodeR.div-4)*0.1*nodeR.scale.y+nodeR.scale.y/10+i*0.05*nodeR.scale.y,
														nodeR.pos.z);
			instance.scale.set((nodeR.steps-i+2)*0.1,0.05,(nodeR.steps-i+2)*0.1);
			instance.name='ruins_stuff'+nodeR.symbol+i;
			this.ruinsList.push(instance);
			this.scene.add(instance);
		}

		nodeR.div++;
	}

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
		//console.log(img);
    var size = this.nodeList.length;
    //console.log("Initial length: "+this.nodeList.length);
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
    //console.log("Final length: "+this.nodeList.length);
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
		else if (symbolNode.type === 'ruins')
    {
			console.log('ruins');
      if(symbolNode.div < 3)
        this.expandRuins(symbolNode);
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

    //RUINS:
    // var R = new Node('R');
    // R.pos = new THREE.Vector3(0,0,0);
    // R.scale = new THREE.Vector3(5,5,5);
    // R.orient = new THREE.Vector3(0,0,0);
   // 	this.makeRuins(R,10);
		// this.addNode(R);

		// var F = new Node('F');
		// F.pos = new THREE.Vector3(0,0,0);
		// F.scale = new THREE.Vector3(1,1,1);
		// F.orient = new THREE.Vector3(0,0,0);
		// //F.div = symbolNode.div+1;
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

        if(r2<0.2  && symbolNode.div>1)
          continue;
        else if(r2<0.1  && symbolNode.div===1 && disthighpop<5 && innerdivided===false)
        {
          var F = new Node('F'+i+j);
          F.pos = new THREE.Vector3(symbolNode.pos.x, symbolNode.pos.y, symbolNode.pos.z);
          F.scale = new THREE.Vector3(1,1,1);
          F.orient = new THREE.Vector3(0,0,0);
          F.div = symbolNode.div+1;
          this.makeFancy(F,99);
          this.addNode(F);
          divided=true;
          innerdivided=true;
          break;
        }
				else if(r2<0.1  && symbolNode.div===1 && disthighpop>20 && innerdivided===false && this.ruins===false)
				{
					//RUINS:
					this.ruins=true;
			    var R = new Node('R');
			    R.pos = new THREE.Vector3(symbolNode.pos.x, symbolNode.pos.y, symbolNode.pos.z);
			    R.scale = new THREE.Vector3(5,5,5);
			    R.orient = new THREE.Vector3(0,0,0);
					 	this.makeRuins(R,10);
					this.addNode(R);
					divided=true;
          innerdivided=true;
          break;
				}

        var C = new Node(symbolNode.symbol+symbolNode.age+i+j);
				//console.log(symbolNode.pos.x);
        C.pos = new THREE.Vector3(symbolNode.pos.x + (i-1)*symbolNode.scale.x/3,
                                  symbolNode.pos.y,//this.scene.getObjectByName("plane").geometry.vertices[symbolNode.pos.x*40+symbolNode.pos.z],
                                  symbolNode.pos.z + (j-1)*symbolNode.scale.z/3);
				// var elev=0;
				// if(C.pos.x>0 && C.pos.z>0)
				// 	elev=this.img[Math.floor(C.pos.x)][Math.floor(C.pos.z)];
				// if(symbolNode.div>=2 && elev<0.0)
				// {
				// 	//divided=true;
				// 	continue;
				// }
				// else
				// {
				// 	symbolNode.pos.y=elev;
				// }
        var rot = Math.random() * 5-2.5;
        var scx =  0.9;
        var scz =  0.9;
        if(symbolNode.div<2)
        {
          rot=0;
          scx= 1;
          scz= 1;
        }
        C.orient = new THREE.Vector3(symbolNode.orient.x, symbolNode.orient.y + rot, symbolNode.orient.z);

        //console.log(disthighpop*disthighpop);
        var scalefactor = Math.random() * (1-(disthighpop*disthighpop)/800) + 1;
        C.scale = new THREE.Vector3(symbolNode.scale.x / 3 * scx, symbolNode.scale.y * scalefactor, symbolNode.scale.z / 3 * scz);
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
