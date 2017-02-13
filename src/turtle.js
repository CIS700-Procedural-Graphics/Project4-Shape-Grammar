const THREE = require('three')
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);

var houseGeo;

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
  
export default class Turtle {
    
    constructor(scene, grammar) {
        this.state = new TurtleState(new THREE.Vector3(0,-5,0), new THREE.Vector3(0,1,0));
        this.scene = scene;
    }

    // Resets the turtle's position to the origin
    // and its orientation to the Y axis
    clear() {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));       
    }

    // A function to help you debug your turtle functions
    // by printing out the turtle's current state.
    printState() {
        console.log(this.state.pos)
        console.log(this.state.dir)
    }

    // Rotate the turtle's _dir_ vector by each of the 
    // Euler angles indicated by the input.
    rotateTurtle(x, y, z) {
        var e = new THREE.Euler(
                x * 3.14/180,
				y * 3.14/180,
				z * 3.14/180);
        this.state.dir.applyEuler(e);
    }

    // Translate the turtle along the input vector.
    // Does NOT change the turtle's _dir_ vector
    moveTurtle(x, y, z) {
	    var new_vec = THREE.Vector3(x, y, z);
	    this.state.pos.add(new_vec);
    };

    // Translate the turtle along its _dir_ vector by the distance indicated
    moveForward(dist) {
        var newVec = this.state.dir.multiplyScalar(dist);
        this.state.pos.add(newVec);
    };

    build(shapeSet, scene)
    {
        var objLoader = new THREE.OBJLoader();
        objLoader.load('house.obj', function(obj){

            // LOOK: This function runs after the obj has finished loading
            houseGeo = obj.children[0].geometry; 
            var material = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );

            var box = new THREE.BoxGeometry( 1, 1, 1 );

            shapeSet.forEach(function(shape)
            {
                if(shape.symbol == 'F')
                {
                    var chimney = new THREE.Mesh(box, shape.material);
                    chimney.position.set(shape.pos.x, shape.pos.y, shape.pos.z);
                    chimney.rotation.set(shape.rot.x, shape.rot.y, shape.rot.z);
                    chimney.scale.set(shape.scale.x, shape.scale.y, shape.scale.z);
                    chimney.castShadows = true;
                    chimney.receiveShadows = true;
                    scene.add(chimney); 
                }
                else if(shape.symbol == 'G')
                {
                    var mat;
                    var rando = Math.random();
                    if(rando < 0.2)
                    {
                        mat = new THREE.MeshBasicMaterial( {color: 0xc9c6c6, side: THREE.DoubleSide} );
                    }
                    else if(rando < 0.4)
                    {
                        mat = new THREE.MeshBasicMaterial( {color: 0x363636, side: THREE.DoubleSide} );
                    }
                    else if(rando < 0.6)
                    {
                        mat = new THREE.MeshBasicMaterial( {color: 0x8a2020, side: THREE.DoubleSide} );
                    }
                    else
                    {
                        mat = new THREE.MeshLambertMaterial( {color: 0x69411d, side: THREE.DoubleSide} );
                    }

                    var door = new THREE.Mesh(box, mat);
                    door.position.set(shape.pos.x, shape.pos.y, shape.pos.z);
                    door.rotation.set(shape.rot.x, shape.rot.y, shape.rot.z);
                    door.scale.set(shape.scale.x, shape.scale.y, shape.scale.z);
                    door.castShadows = true;
                    door.receiveShadows = true;
                    scene.add(door); 
                }
                else
                {
                    var house = new THREE.Mesh(houseGeo, shape.material);
                    house.position.set(shape.pos.x, shape.pos.y, shape.pos.z);
                    house.rotation.set(shape.rot.x, shape.rot.y, shape.rot.z);
                    house.scale.set(shape.scale.x, shape.scale.y, shape.scale.z);
                    house.castShadows = true;
                    house.receiveShadows = true;
                    scene.add(house); 
                }      
            });
        });
    }

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(set) {
        this.build(set, this.scene);   
    }
}