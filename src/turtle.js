const THREE = require('three')

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

function noise_gen1(pos) {
  var result =  (Math.sin(pos + 12.9898) * 43758.5453) % 1;
  
  // Map [-1, 1] to [0, 1]
  result /= 2;
  result += 0.5;

  return result;
}

  
var stateStack = [];
export default class Turtle {
    
    constructor(scene, grammar, angle) {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
        this.scene = scene;

        if (angle) {
            this.angle = angle;
        }

        // Start by adding rules for '[' and ']' then more!
        // Make sure to implement the functions for the new rules inside Turtle
        if (!grammar) {
            this.renderGrammar = {
                '+' : this.rotateTurtle.bind(this, 1, 1, -1),
                '-' : this.rotateTurtle.bind(this, -1, -1, 1),
                'F' : this.makeCylinder.bind(this, 2),
                '[' : this.pushState.bind(this),
                ']' : this.popState.bind(this),
                '#' : this.makeBush.bind(this),
                '&' : this.makeHouse.bind(this, 1, 1, 1),
                '*' : this.makeBuilding.bind(this, 2,2,5), 
                '>' : this.moveTurtleWithNoise.bind(this, 2 , -0.2, 0),
                '<' : this.moveTurtleWithNoise.bind(this, 0, -0.2, 2),
            };
        } else {
            this.renderGrammar = grammar;
        }
    }

    // Resets the turtle's position to the origin
    // and its orientation to the Y axis
    // Clears the state stack
    clear() {
        this.state = new TurtleState(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));        
        stateStack = [];
    }

    // A function to help you debug your turtle functions
    // by printing out the turtle's current state.
    printState() {
        console.log(this.state.pos)
        console.log(this.state.dir)
    }

    pushState() {
        stateStack.push(new TurtleState(this.state.pos, this.state.dir));
    }

    popState(){
        var s = stateStack.pop();
        this.state = new TurtleState(s.pos, s.dir);
    }

    // Rotate the turtle's _dir_ vector by each of the 
    // Euler angles indicated by the input.
    rotateTurtle(x, y, z) {
        x = x * this.angle;
        y = 45;
        z = z * this.angle ;
        var e = new THREE.Euler(
                x * 3.14/180,
				y * 3.14/180,
				z * 3.14/180);
        this.state.dir.applyEuler(e);
    }

    // Translate the turtle along the input vector.
    // Does NOT change the turtle's _dir_ vector
    moveTurtle(x, y, z) {
	    var new_vec = new THREE.Vector3(x, y, z);
	    this.state.pos.add(new_vec);
    };

    moveTurtleWithNoise(x, y, z) {
        var r = noise_gen1(this.iter);
        var rx = (noise_gen1(this.state.pos.x) - 0.5) * 3;
        var rz = (noise_gen1(this.state.pos.z) - 0.5) * 3;
        var ry = (noise_gen1(this.state.pos.y) - 0.5) * 3;

        if (r < 0.3) {
           this.moveTurtle(-x + rx, y + ry, z + rz);
        } else if (r < 0.6) {
           this.moveTurtle(x + rx, y + ry, -z + rz);
        } else {
            this.moveTurtle(x + rx, y + ry, z + rz);
        }
    }

    // Translate the turtle along its _dir_ vector by the distance indicated
    moveForward(dist) {
        var newVec = this.state.dir.multiplyScalar(dist);
        this.state.pos.add(newVec);
    };
    
    // Make a cylinder of given length and width starting at turtle pos
    // Moves turtle pos ahead to end of the new cylinder
    makeCylinder(len) {
        var width = 0.3 / (0.5*(this.iter + 1));

        var c = (0.6 - this.iter * 0.1) + 0.2;
        var color = new THREE.Color(c, c - 0.1, c * 0.1);

        var geometry = new THREE.CylinderGeometry(width, width, len);
        var material = new THREE.MeshLambertMaterial( {color: color} );
        material.metalness = 0;
        material.reflectivity = 0;
        material.roughness =  0.6;
        var cylinder = new THREE.Mesh( geometry, material );
        this.scene.add( cylinder );

        //Orient the cylinder to the turtle's current direction
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.dir);
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        cylinder.applyMatrix(mat4);


        //Move the cylinder so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var trans = this.state.pos.add(this.state.dir.multiplyScalar(0.5 * len));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        cylinder.applyMatrix(mat5);

        //Scoot the turtle forward by len units
        this.moveForward(len / 2);
    };

    makeBush() {
        var size = 1.5 - this.iter * 0.2;

        var c = (0.9 - this.iter * 0.1) + 0.001;
        var color = new THREE.Color(c * 0.3, c, c * 0.3);

        var geometry = new THREE.IcosahedronGeometry(size * 2, 0);
        var material = new THREE.MeshPhysicalMaterial( {color: color} );
        material.reflectivity = 0;
        material.metalness = 0;
        var block = new THREE.Mesh( geometry, material );

        block.scale.set(3, 0.5, 3);

        this.scene.add( block );

        //Move the bush so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var trans = this.state.pos.add(this.state.dir.multiplyScalar(0.5 * size));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        block.applyMatrix(mat5);

        //Scoot the turtle forward by len units
        this.moveForward(size/2);
    }

    makeHouse(len, width, height) {
        var c = this.iter * 0.05;
        var color = new THREE.Color(1,1,1);
        var geometry = new THREE.CubeGeometry(width, height, len);

        var material = new THREE.MeshLambertMaterial( {color: color} );
        var block = new THREE.Mesh( geometry, material );
        this.scene.add( block );


        var roofColor = new THREE.Color(0.5, 0.4,0.4);
        var geo2 = new THREE.ConeGeometry(width/1.2, 1, 10);
        var mat2 = new THREE.MeshLambertMaterial({color: roofColor})
        var roof = new THREE.Mesh(geo2, mat2);
        this.scene.add(roof);

        var offset = height+(1.5 - this.iter * 0.2);

        //Move the house so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        mat5.makeTranslation(this.state.pos.x, this.state.pos.y + offset, this.state.pos.z);
        block.applyMatrix(mat5);

        mat5 = new THREE.Matrix4();
        mat5.makeTranslation(this.state.pos.x, this.state.pos.y + height + offset, this.state.pos.z);
        roof.applyMatrix(mat5);

        //Scoot the turtle forward by len units
        this.moveForward(len/2);
    }

     makeBuilding(len, width, height) {

        var scale = 3 / this.iter + (noise_gen1(this.state.pos.y + this.iter)+ 0.01) / 2;
        
        height *= scale;
        if (len > 1.8) { 
            len *= scale / (noise_gen1(this.state.pos.x) + 0.8);
           width = len;
        }

        var c = this.iter * 0.2 + noise_gen1(this.state.pos.x) / 4;
        var color = new THREE.Color(0.2 + c/2, 0.3 +c/2, 0.31 + c);

        var geometry = new THREE.CubeGeometry(width, height, len);
        var material = new THREE.MeshLambertMaterial( {color: color} );
        material.metalness = 1;
        material.reflectivity = 1;

        var block = new THREE.Mesh( geometry, material );
        this.scene.add( block );

        //Move the buildind so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        mat5.makeTranslation(this.state.pos.x, this.state.pos.y + height/2, this.state.pos.z);
        block.applyMatrix(mat5);

        //Scoot the turtle forward by len units
        this.moveForward(len/2);
    }
    
    // Call the function to which the input symbol is bound.
    // Look in the Turtle's constructor for examples of how to bind 
    // functions to grammar symbols.
    renderSymbol(symbolNode) {
        var func = this.renderGrammar[symbolNode.symbol];
        if (func) { 
            func();
        } 
    };

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(linkedList) {
        var currentNode;
        for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) {
            this.iter = currentNode.iteration;
            this.renderSymbol(currentNode);
        }
    }
}