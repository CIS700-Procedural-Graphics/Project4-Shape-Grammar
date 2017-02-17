const THREE = require('three')
const OBJLoader = require('three-obj-loader')(THREE)

// A class used to encapsulate the state of a turtle at a given moment.
// The Turtle class contains one TurtleState member variable.
// You are free to add features to this state class,
// such as color or whimiscality
var TurtleState = function(pos, dir) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        dir: new THREE.Vector3(dir.x, dir.y, dir.z)
    }
}
  
//NODE CLASS
var Node = function(){
    var node = {};

    node.name;
    node.geometry;
    node.position;  //this is the position of the center of the geometry
    node.scale;
    node.w;         //width
    node.h;         //height
    node.d;         //depth
    node.grammar;
    node.tower = false; //default no building is not a tower
    
    //array of tower geom
    //node.towertops = [];
    
    return node;
};


//load obj
var baseMaterial = new THREE.MeshLambertMaterial({ color: 0x888888, side: THREE.DoubleSide });
var objLoader = new THREE.OBJLoader();
var global_obj;

objLoader.load('/geo/fruit.obj', function(obj) {
global_obj = obj.children[0].geometry;
//var new_fm = new THREE.Mesh(global_obj, leafMaterial);
//new_fm.name = "fruit";
//scene.add(new_fm);
});


export default class Turtle {
    
    constructor(scene, renderer) {
        this.scene = scene;
        this.NodeArr = [];
        this.first = true;
        this.renderer = renderer;
    }

    init()
    {   
        //Adding base plane
        var geometry = new THREE.PlaneGeometry( 250, 250, 20, 20);
        var material3 = new THREE.MeshLambertMaterial( {color: 0xe3e0e0, side: THREE.DoubleSide} );
        
        var plane = new THREE.Mesh( geometry, material3 ); 
        plane.rotateX(90 * 3.14 / 180);
        plane.name = "base";
        plane.position.set(0,-10.1,0);
        //plane.recieveShadow = true;
        
        //MODIFYING THE BASE PLANE 
        //TERRAIN CREATION
        plane.geometry.verticesNeedUpdate = true;
        plane.geometry.normalsNeedUpdate = true;
        
        
        //console.log(plane.geometry.vertices[1].z);
        
        //FRONT LEFT BUMP/HILL
        plane.geometry.vertices[2].z -= 10;        
        plane.geometry.vertices[3].z -= 11;        
        plane.geometry.vertices[4].z -= 15;        
        plane.geometry.vertices[5].z -= 13;
        
        //console.log(plane.geometry.vertices[1].z);
        
        //BACK LEFT BUMP/HILL
        plane.geometry.vertices[300].z -= 17;
        plane.geometry.vertices[299].z -= 20;
        plane.geometry.vertices[298].z -= 18;
        plane.geometry.vertices[301].z -= 16;
        plane.geometry.vertices[320].z -= 16;
        
        //BACK RIGHT BUMP/HILL
        plane.geometry.vertices[410].z -= 18;
        plane.geometry.vertices[409].z -= 25;
        plane.geometry.vertices[411].z -= 20;
        plane.geometry.vertices[310].z -= 19;
        plane.geometry.vertices[408].z -= 16;
        
        //console.log(plane.geometry.vertices[98].z);
        
        //FRONT RIGHT LAKE
        plane.geometry.vertices[100].z += 10;
        plane.geometry.vertices[101].z += 10;
        plane.geometry.vertices[120].z += 10;
        plane.geometry.vertices[120].z += 10;
        plane.geometry.vertices[119].z += 10;
        plane.geometry.vertices[99].z += 10; 
        
        //console.log(plane.geometry.vertices[98].z);
        
        //LAKE PLANE
        var geometry = new THREE.PlaneGeometry( 50, 50, 2, 2);
        var material = new THREE.MeshPhongMaterial( {color: 0x75aaff, side: THREE.DoubleSide} );
        var Wplane = new THREE.Mesh( geometry, material ); 
        Wplane.rotateX(90 * 3.14 / 180);
        Wplane.name = "water";
        Wplane.position.set(70,-12.0,70);
        
        //RANDOM BUMPYNESS FOR TERRAIN
        for(var i = 0; i < 400; i++)
        {   
            var rand = Math.random() * 10;
            
            if(rand < 5)                
                plane.geometry.vertices[i].z += Math.random(); 
            else
                plane.geometry.vertices[i].z -= Math.random(); 
        }
        
        //RE-COMPUTING THE BASE NORMALS AND VERTEX NORMALS
        plane.geometry.computeFaceNormals();
        plane.geometry.computeVertexNormals();
        
        this.scene.add( plane ); 
        this.scene.add( Wplane );
        
        //randomly creating a bunch of cubes in the scene
        for(var i = 0; i < 100; i++)
        {
            var pos_x = Math.floor((Math.random() * 200) % 200) - 100;
            var pos_z = Math.floor((Math.random() * 200) % 200) - 100;
            
            if(!((pos_x >= 45 && pos_x <= 100 && pos_z >= 45 && pos_z <=100) || (pos_x >= -85 && pos_x <= -20 && pos_z >= -75 && pos_z <= -25)))
            {   
                var position = new THREE.Vector3(pos_x, 0, pos_z);
                this.createCube(position, 20, 20, 20);
            }
        }
        
        //displaying the geometry to the scene
        this.AddGeomToScene();
        
            //TEST
//        var pos = new THREE.Vector3(0,0,0);
//        this.createCube(pos, 20, 20, 20, false);
//        this.CreateTower(this.NodeArr[this.NodeArr.length - 1], 10);
//        this.AddGeomToScene();
        
    };
    
    RunGeneration()
    {
            for(var j = 0; j < this.NodeArr.length; j++)
            {
                
                ///For geometries that are close to the centre (0,0,0) tower probablity increases for the first iteration
                if(this.first == true)
                {
                    if((this.NodeArr[j].position.x > -30 && this.NodeArr[j].position.x < 30) &&                 (this.NodeArr[j].position.z > -30 && this.NodeArr[j].position.z < 30))
                    {
                            var TowerProb = Math.floor((Math.random() * 20) % 12);
                            this.CreateTower(this.NodeArr[j], TowerProb);
                    }
                }
                    
                //Prob of division along x, y or z axis
                var sx = false; 
                var sy = false;
                var sz = false;
                var range = Math.floor((Math.random() * 20) % 12);
            
                if(range >= 0 && range <=3)
                    sx = true;
                else if(range >= 4 && range <= 6)
                    sy = true;
                else
                    sz = true;
                
                this.SubDivideNode(this.NodeArr[j], sx, sy, sz);
            }
            this.first = false;
            this.AddGeomToScene();
        
            console.log(this.NodeArr.length);
    };
    
    addNode()
    {
        //creating a cube
        var width = 10;
        var height = 10; 
        var depth = 10;
        var geometry = new THREE.BoxGeometry( width, height, depth );
        var material = new THREE.MeshLambertMaterial( {color: 0xe0dee0} );
        var cube = new THREE.Mesh( geometry, material );
        this.scene.add(cube);
        
        //creating a new node
        var node = new Node;
        node.name = "cube";
        
        node.geometry = cube;
        node.w = cube.geometry.parameters.width;
        node.h = cube.geometry.parameters.height;
        node.d = cube.geometry.parameters.depth;
        node.scale = cube.scale;
        node.position = cube.position;
        //adding the node to node array
        this.NodeArr.push(node);
        
        this.SubDivideNode(node);
    };
       
    CreateTower(node, TowerProb)
    {
        if(!node.tower){
        var ratio = node.w / node.h;
        //debugger;    
        var bigenough = true;
//        if(node.w >= 5 && node.d >= 5)
//        {
//            bigenough = true;
//        }
            
            
        if((ratio >= 1 && ratio < 1.1))
        {
            //There is only 100% chance the building will be a tower (Changable)
            var chance = Math.random() * 10;
            //debugger;
            if(chance >=0 && chance <= 9)
            {
                if(bigenough)
                {
                    console.log("Reached In!");
                    node.tower = true;
                
                    //scale the building down by 3.5
                    var val = Math.random();
                    var factor = 3.5;
                    node.geometry.scale.x = node.scale.x / factor;
                    node.geometry.scale.z = node.scale.z / factor;
                    node.w = node.w / factor;
                    node.d = node.d / factor;
                    node.scale = node.geometry.scale;
                    
                    //create new geom to go on top of the base of the tower
//                  var TowerProb = (Math.random() * 10); 
                    
                    if( TowerProb >= 0 && TowerProb <= 2  )
                    {
                        console.log("TOWER TYPE 1");
                        
                        //creating new cube TOP LEVEL 1
                        var width1 = node.w - 0.9;
                        var depth1 = node.d - 0.9;
                        var height1 = node.h - 3;
                        var position1 = new THREE.Vector3(node.position.x, node.position.y + height1,node.position.z);
                    
                        this.createCube(position1, width1, height1, depth1, true);
                    
                        //creating new cube TOP LEVEL 2
                        var width2 = node.w - 1.2;
                        var depth2 = node.d - 1.2;
                        var height2 = node.h - 6;
                        var position2 = new THREE.Vector3(node.position.x, node.position.y + height1 + height2,node.position.z);
                    
                        this.createCube(position2, width2, height2, depth2, true);
                    
                        //creating new cube TOP LEVEL 3
                        var width3 = node.w - 1.5;
                        var depth3 = node.d - 1.5;
                        var height3 = node.h - 9;
                        var position3 = new THREE.Vector3(node.position.x, node.position.y + height1 + height2 + height3,node.position.z);
                    
                        this.createCube(position3, width3, height3, depth3, true);
                        
                        //Creating the TERRACE LEVEL DETAILS
                        var spokeprob = Math.random() * 10;
                        if(spokeprob < 5)
                        {
                            //SPOKE 1
                            var width4 = node.w / 10;
                            var depth4 = node.d / 10;
                            var height4 = node.h - 2;
                            var position4 = new THREE.Vector3(node.position.x + 1, node.position.y + height1 + height2 + height3 + 3, node.position.z);
                        
                            this.createCube(position4, width4, height4, depth4, true);
                        
                            //SPOKE 2
                            var width4 = node.w / 10;
                            var depth4 = node.d / 10;
                            var height4 = node.h - 6;
                            var position4 = new THREE.Vector3(node.position.x, node.position.y + height1 + height2 + height3 + 3, node.position.z);
                        
                            this.createCube(position4, width4, height4, depth4, true);
                        }
                        else
                        {
                            //SPOKE 1
                            var width4 = node.w / 9;
                            var depth4 = node.d / 9;
                            var height4 = node.h - 2;
                            var position4 = new THREE.Vector3(node.position.x + 1, node.position.y + height1 + height2 + height3 + 3, node.position.z);
                        
                            this.createCube(position4, width4, height4, depth4, true);   
                        }
                        
                    }
                    else if( TowerProb >= 3 && TowerProb <= 5  )
                    {   
                        console.log("TOWER TYPE 2");
                        
                        //creating new cube TOP LEVEL 1
                        var width1 = node.w - 0.9;
                        var depth1 = node.d - 0.9;
                        var height1 = node.h + 3;
                        var position1 = new THREE.Vector3(node.position.x, node.position.y + height1 - 2,node.position.z);
                    
                        this.createCube(position1, width1, height1, depth1, true);
                    
                        //creating new cube TOP LEVEL 2
                        var width2 = node.w - 1.2;
                        var depth2 = node.d - 1.2;
                        var height2 = node.h + 6;
                        var position2 = new THREE.Vector3(node.position.x, node.position.y + height1 + height2 - 4,node.position.z);
                    
                        this.createCube(position2, width2, height2, depth2, true);
                        
                        //Creating TERRACE LEVEL DETAILS
                        //TOP LEFT CYLINDER
                        var positionC1 = new THREE.Vector3(node.position.x - (node.w / 2) + 1, node.position.y + height1 + height2 + 10, node.position.z - (node.d / 2) + 1);
                            
                        this.createCylinder(positionC1, 6, 0.1, 0.1, 30, true);
                        
                        //TOP RIGHT CYLINDER
                        var positionC2 = new THREE.Vector3(node.position.x + (node.w / 2) - 1, node.position.y + height1 + height2 + 10, node.position.z - (node.d / 2) + 1);
                            
                        this.createCylinder(positionC2, 6, 0.1, 0.1, 0.1, 30, true);
                            
                        //FRONT LEFT CYLINDER
                        var positionC3 = new THREE.Vector3(node.position.x - (node.w / 2) + 1, node.position.y + height1 + height2 + 10, node.position.z + (node.d / 2) - 1);
                            
                        this.createCylinder(positionC3, 6, 0.1, 0.1, 0.1, 30, true);
                            
                        //FRONT RIGHT CYLINDER
                        var positionC4 = new THREE.Vector3(node.position.x + (node.w / 2) - 1, node.position.y + height1 + height2 + 10, node.position.z + (node.d / 2) - 1);
                            
                        this.createCylinder(positionC4, 6, 0.1, 0.1, 0.1, 30, true);
                    
                    }
                    else if( TowerProb >= 6 && TowerProb <= 8 )
                    {
                        console.log("TOWER TYPE 3");
                        
                        //Rotating the base level
                        node.geometry.rotateY(Math.random() * 5 * Math.PI / 180);
                        
                        //creating new cube TOP LEVEL 1
                        var radiustop1 = node.w - 3;
                        var radiusbottom1 = node.w - 3;
                        var segments1 = 30;
                        var height1 = node.h + 3;
                        var position1 = new THREE.Vector3(node.position.x, node.position.y + height1 - 2,node.position.z);
                    
                        this.createCylinder(position1, height1, radiustop1, radiusbottom1, segments1, true);
                    
                        //creating new cube TOP LEVEL 2
                        var radiustop2 = node.w - 4;
                        var radiusbottom2 = node.w - 4;
                        var segments2 = 30;
                        var height2 = node.h + 6;
                        var position2 = new THREE.Vector3(node.position.x, node.position.y + height1 + height2 - 4,node.position.z);
                    
                        this.createCylinder(position2, height2, radiustop2, radiusbottom2, segments2, true);
                        
                        //Creating TERRACE LEVEL DETAILS
                        var probtopdetail = Math.random() * 10;
                        if(probtopdetail < 5)
                        {    
                            //TOP DETAIL 1
                            var positionc1 = new THREE.Vector3(node.position.x, node.position.y + node.h + height1 + height2 - 9, node.position.z);
                        
                            this.createCone(positionc1, 5, radiustop2, true);
                        
                            //TOP DETAIL 2
                            var positionc2 = new THREE.Vector3(node.position.x, node.position.y + node.h + height1 + height2 - 7, node.position.z);
                        
                            this.createCone(positionc2, 5, radiustop2 - 1, true);
                        }
                        else
                        {   
                            //TOP DETAIL 1
                            var positionc1 = new THREE.Vector3(node.position.x, node.position.y + node.h + height1 + height2 - 9, node.position.z);
                        
                            this.createCone(positionc1, 5, radiustop2, true);
                        }
                    }
                    else
                    {    
                        console.log("TOWER TYPE 4");
                        
                        //scale the original cube by 1/6
                        node.geometry.scale.y = node.scale.y / 9;
                        var old_height = node.h;
                        node.h = node.h / 9;
                        node.scale = node.geometry.scale;
                        
                        //Re-positioning the cube
                        var offset_temp = (old_height / 2) - (node.h / 2);
                        node.geometry.position.set(node.position.x, node.position.y - offset_temp , node.position.z);
                        node.position = node.geometry.position;
                        
                        //Loop through some value to create a stack of cubes over the original
                        
                        for(var i = 1; i <= 25; i++)
                        {
                            var width  = node.w;
                            var height = node.h;
                            var depth = node.d;
                            var position = new THREE.Vector3(node.position.x, node.position.y + (node.h * i), node.position.z);
                            
                            //create new node
                            this.createCube(position, width, height, depth, true);
                            
                            //rotate the top most geometry by some degreees
                            this.NodeArr[this.NodeArr.length - 1].geometry.rotateY(i * 3 * Math.PI / 180);
                            
                        }
                        
                        
                    }
                    
                }
                
            }
        }
        }
    };
    
    createCone(position, height, radius, tower)
    {
        
        var geometry = new THREE.ConeGeometry( radius, height, 32 );
        //var material = new THREE.MeshLambertMaterial( {color: 0xe0dee0} );
        //var material = new THREE.MeshPhongMaterial( {color: 0xe0dee0} );
        
        var loader = new THREE.TextureLoader();
        var material2;
        // load a resource
        loader.load( 'images/bt2.jpg',function ( texture )
            {
		      // do something with the texture
		      material2 = new THREE.MeshBasicMaterial( {map: texture} );
	        }
                   );
        
        var cone = new THREE.Mesh( geometry, material2 );
        cone.position.set(position.x, position.y, position.z);
        //this.scene.add( cone );
        
        //creating a new node
        var node = new Node;
        node.name = "cone";
        
        node.geometry = cone;
        node.w = cone.geometry.parameters.width;
        node.h = cone.geometry.parameters.height;
        node.d = cone.geometry.parameters.depth
        node.scale = cone.scale;
        node.position = cone.position;
        node.tower = tower;
        
        //adding the node to node array
        this.NodeArr.push(node);
        
    };
    
    createCylinder(position, height, radiustop, radiusbottom, segments, tower)
    {
        var geometry = new THREE.CylinderGeometry( radiustop, radiusbottom, height, segments);
        //var material = new THREE.MeshLambertMaterial( {color: 0xe0dee0} );
        //var material = new THREE.MeshPhongMaterial( {color: 0xe0dee0} );
        
        var loader = new THREE.TextureLoader();
        var material1;
        // load a resource
        loader.load( 'images/bt2.jpg',function ( texture )
            {
		      // do something with the texture
		      material1 = new THREE.MeshBasicMaterial( {map: texture} );
	        }
                   );
        
        var cylinder = new THREE.Mesh( geometry, material1 );
        cylinder.position.set(position.x, position.y, position.z);
        //this.scene.add( cylinder );
        
        //creating a new node
        var node = new Node;
        node.name = "cylinder";
        
        node.geometry = cylinder;
        node.w = cylinder.geometry.parameters.width;
        node.h = cylinder.geometry.parameters.height;
        node.d = cylinder.geometry.parameters.depth
        node.scale = cylinder.scale;
        node.position = cylinder.position;
        node.tower = tower;
        
        //adding the node to node array
        this.NodeArr.push(node);
        
    };
    
    SubDivideNode(node, sx, sy, sz)
    {
        if(!node.tower)
        {
        if(!((node.w <=4 || node.d <=4)))
        {
        if(node.name == "cube")
        {    

            if(sx)
            {
                //scaling the width of the original cube
                node.geometry.scale.x = node.scale.x / 2; //scaling the cube by 1/2 on x
                node.scale = node.geometry.scale; //saving the scale
                node.w = node.w / 2; //saving the new width
                
                //width for the new cube
                var width = node.w - 0.2; 
                
                //height of the new cube created
                var scalefactory = Math.random() + 0.2;
                if(scalefactory < 0.5) 
                    scalefactory = 0.5; 
                var height = node.h * scalefactory;
                
                //depth of the new cube
                var scalefactord = (Math.random());
                if(scalefactord < 0.2)
                    scalefactord = 0.4;
                var depth = node.d * scalefactord;
                
                //scaling the depth of the original cube
                node.geometry.scale.z = node.scale.z * 0.9; //scaling the cube by 0.9 on z
                node.scale = node.geometry.scale; //saving the scale
                node.d = node.d * 0.9; //saving the new depth
                
                //position of the new cube
                if(height > node.h)
                {
                    var offset  = (height - node.h) / 2;
                    var position = new THREE.Vector3(node.geometry.position.x - node.w, node.geometry.position.y + offset, node.geometry.position.z);
                }
                else
                {
                    var offset  = (node.h - height) / 2;
                    var position = new THREE.Vector3(node.geometry.position.x - node.w, node.geometry.position.y - offset, node.geometry.position.z);
                }
                
                //creating the new cube
                this.createCube(position, width, height, depth, false);     
            }
            else if(sy)
            {
                //scaling the height of the originl geometry
                var scalefactory = Math.floor(Math.random() * 10) / 5;
                node.geometry.scale.y = node.scale.y * scalefactory;
                node.scale = node.geometry.scale;
                var height = node.h;
                node.h = node.h * scalefactory;
                
                //re-setting the position
                if(height > node.h)
                {
                    var offset = (height - node.h)/2; 
                    node.geometry.position.set(node.geometry.position.x, node.geometry.position.y - offset, node.geometry.position.z);
                }
                else
                {
                    var offset  = (node.h - height) / 2;
                    node.geometry.position.set(node.geometry.position.x, node.geometry.position.y + offset, node.geometry.position.z);
                }
            
            }
            else if(sz)
            {
                //scaling the depth of the original geometry
                node.geometry.scale.z = node.scale.z / 2; //scaling the cube by 1/2 on z
                node.scale = node.geometry.scale; //saving the scale
                node.d = node.d / 2; //saving the new width
                
                //scaling the width of original geometry
                var randscalex = 0.3 + Math.random();
                if(randscalex < 0.2) randscalex = 0.2;
                node.geometry.scale.x = randscalex;
                node.scale = node.geometry.scale;
                node.w = node.w * randscalex;
                
                //variables for the new cube
                var width = node.w - (Math.random() * 2);
                var height = node.h - ((Math.random() * 10) % 2);
                var depth = node.d - 0.2;
                var offset = (node.h - height) / 2;
                var position = new THREE.Vector3(node.geometry.position.x, node.geometry.position.y - offset, node.geometry.position.z - node.d);
                
                //Creating a new cube
                this.createCube(position, width, height, depth, false);
                
//                //scaling the width of the orignal cube
//                node.geometry.scale.x = node.scale.x * 0.9; //scaling the cube by 0.9 on x
//                node.scale = node.geometry.scale; //saving the scale
//                node.w = node.w * 0.9; //saving the new width
            }
        }
        }
        }
    };
       
    createCube(position, width, height, depth, tower)
    {
        //creates a cube with the given parameters and adds it to the node array
        //creating a cube
        var geometry = new THREE.BoxGeometry( width, height, depth );
        //var material = new THREE.MeshLambertMaterial( {color: 0xe0dee0} );
        //var material = new THREE.MeshPhongMaterial( {color: 0xe0dee0} );
        //var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/bt2.jpg') } );
        var loader = new THREE.TextureLoader();
        var material;
        // load a resource
        loader.load( 'images/bt2.jpg',function ( texture )
            {
		      // do something with the texture
		      material = new THREE.MeshBasicMaterial( {map: texture} );
	        }
                   );
        
        
        var cube = new THREE.Mesh( geometry, material );
        cube.position.set(position.x, position.y, position.z);
        //cube.castShadow = true;
//        if(Math.random() < 0.1)
//            cube.rotation.y = Math.floor(Math.random()*Math.PI*2);
        //this.scene.add(cube);
        
        //creating a new node
        var node = new Node;
        node.name = "cube";
        
        node.geometry = cube;
        node.w = cube.geometry.parameters.width;
        node.h = cube.geometry.parameters.height;
        node.d = cube.geometry.parameters.depth
        node.scale = cube.scale;
        node.position = cube.position;
        node.tower = tower;
        
        //adding the node to node array
        this.NodeArr.push(node);
    };
      
    AddGeomToScene()
    {
        for(var i =0; i < this.NodeArr.length; i++)
            {
                this.scene.add(this.NodeArr[i].geometry);
            }
    };
}