const THREE = require('three')

function copyOneStateToNew(s1) {
    return new TurtleState(s1.pos, s1.dir);
}

function rgbOneComponentToHex(rgbCol) {
    var hex = rgbCol.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function fullRGBToHex(r, g, b) {
    return "#" + rgbOneComponentToHex(r) + rgbOneComponentToHex(g) + rgbOneComponentToHex(b);
}

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
        this.state = new TurtleState(new THREE.Vector3(0,2,0), new THREE.Vector3(0,1,0));
        this.scene = scene;

        this.prevSavedStates = [];


        this.tree = 0; // SETTING TURTLE'S CURRENT TREE STATE

        // TODO: Start by adding rules for '[' and ']' then more!
        // Make sure to implement the functions for the new rules inside Turtle
        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                '+' : this.doNothing(),//this.rotateTurtle.bind(this, 25, 0, 0),
                '-' : this.doNothing(),//this.rotateTurtle.bind(this, -25, 0, 0),
                'F' : this.doNothing(),//this.makeCylinder.bind(this, 2, 0.1), // move forward 1 step

                // the ones i added
                'X' : this.findNewStartLocation(), // does nothing just to control curve
                'A' : this.doNothing(),
                'B' : this.buildPillarsOnGlobalLoc.bind(this),
                'C' : this.buildCubeOnGlobalLoc.bind(this),
                // the ones required to implement
                '[' : this.doNothing(),//this.saveCurrState.bind(this),
                ']' : this.doNothing(),//this.goToPrevState.bind(this),
                // ENVIRONMENT CONSTRUCTION
                'D' : this.buildBaseEnvironment.bind(this)
            };
        } else {
            this.renderGrammar = grammar;
        }

        this.color = {
            r : 30,
            g : 60,
            b : 240
        }

        this.globalLoc = {
            x: 0,
            y: 0,
            z: 0
        }

        this.baseHeight = 10;
    }

    doNothing() {
        // NOTHING
    }

    findNewStartLocation() {
        
    }

    buildCubeOnGlobalLoc(){
        var cubeHeight = this.newCubeDim(this.globalLoc.y);
        var cubeShift = cubeHeight/2;
        var geometry = new THREE.BoxGeometry( cubeHeight, cubeHeight, cubeHeight);
        var texture = new THREE.ImageUtils.loadTexture( '/img/5.jpeg' );
        var material = new THREE.MeshLambertMaterial({ color: fullRGBToHex(0, 255, 0)} );
        var cube = new THREE.Mesh( geometry, material );
        console.log("issue is here : 1");
        cube.position.y = this.globalLoc.y + cubeShift;
        console.log("issue is here : 2");
        this.scene.add(cube);


        this.globalLoc.x = cube.position.x;
        var cubeY = cube.position.y;
        this.globalLoc.y = cubeY + cubeShift;
        this.globalLoc.z = cube.position.z;
    }

    buildPillarsOnGlobalLoc(){
        var cubeHeight = this.newCubeDim(this.globalLoc.y);
        var cubeShift = cubeHeight/2;
        var width = cubeHeight/4;
        var geometry = new THREE.BoxGeometry( width, cubeHeight, width);

        var hex1 = fullRGBToHex(255, 255, 0);
        var hex2 = fullRGBToHex(255, 120, 0);
        var hex3 = fullRGBToHex(255, 0, 120);
        var hex4 = fullRGBToHex(0, 255, 120);

        var color1 = fullRGBToHex(0,0,0);
        var color2 = fullRGBToHex(0,0,0);
        var color3 = fullRGBToHex(0,0,0);
        var color4 = fullRGBToHex(0,0,0);

        var arrangement = Math.floor(Math.random()*cubeHeight % 4);
        if (arrangement == 0) {
            color1 = hex1;
            color2 = hex2;
            color3 = hex3;
            color4 = hex4;
        } else if (arrangement == 1) {
            color1 = hex2;
            color2 = hex3;
            color3 = hex4;
            color4 = hex1;
        } else if (arrangement == 2) {
            color1 = hex3;
            color2 = hex4;
            color3 = hex2;
            color4 = hex1;
        } else {
            color1 = hex3;
            color2 = hex4;
            color3 = hex2;
            color4 = hex1;
        }

        var material1 = new THREE.MeshLambertMaterial({ color: color1} );
        var material2 = new THREE.MeshLambertMaterial({ color: color2} );
        var material3 = new THREE.MeshLambertMaterial({ color: color3} );
        var material4 = new THREE.MeshLambertMaterial({ color: color4} );
        var cube1 = new THREE.Mesh( geometry, material1 );
        var cube2 = new THREE.Mesh( geometry, material2 );
        var cube3 = new THREE.Mesh( geometry, material3 );
        var cube4 = new THREE.Mesh( geometry, material4 );
        console.log("issue is here : 1");
        cube1.position.y = this.globalLoc.y + cubeShift;
        cube2.position.y = this.globalLoc.y + cubeShift;
        cube3.position.y = this.globalLoc.y + cubeShift;
        cube4.position.y = this.globalLoc.y + cubeShift;
        console.log("issue is here : 2");
        this.scene.add(cube1);
        this.scene.add(cube2);
        this.scene.add(cube3);
        this.scene.add(cube4);

        this.globalLoc.x = cube1.position.x;
        var cubeY = cube1.position.y;
        this.globalLoc.y = cubeShift + cubeY;
        this.globalLoc.z = cube1.position.z;

        var moveBy = width;
        cube1.position.x -= moveBy;
        cube1.position.z -= moveBy;
        cube2.position.x += moveBy;
        cube2.position.z -= moveBy;
        cube3.position.x -= moveBy;
        cube3.position.z += moveBy;
        cube4.position.x += moveBy;
        cube4.position.z += moveBy;
    }

    buildBaseEnvironment(){
        this.buildLandAndWater();
        this.buildBaseLandMounds();
    }

    newCubeDim(y) {
        if (y > 50) {
            return 2;
        } else if (y > 40) {
            return 4;
        } else if (y > 30) {
            return 8;
        } else if (y > 20) {
            return 16;
        } else {
            return 20;
        }
    }

    buildBaseLandMounds() {
        // dist from 3 chosen locations 
        // loc 1
        // loc 2
        // loc 3
        // for now just 1 loc
        var cubeHeight = 20;
        var cubeShift = cubeHeight/2;
        var width = 200;
        var geometry = new THREE.BoxGeometry( width, cubeHeight, width);
        var texture = new THREE.ImageUtils.loadTexture( '/img/5.jpeg' );
        var material = new THREE.MeshLambertMaterial( {map: texture} );
        var cube = new THREE.Mesh( geometry, material );
        
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,1));
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        cube.applyMatrix(mat4);

        cube.position.y += cubeShift;

        this.scene.add(cube);
        this.globalLoc.x = cube.position.x;
        var cubeY = cube.position.y;
        this.globalLoc.y = cubeShift + cubeY;
        this.globalLoc.z = cube.position.z;
    }

    buildLandAndWater() {
        // WATER
        var geometry = new THREE.PlaneBufferGeometry( 1000, 1000, 10,10 );
        var materialWater = new THREE.MeshLambertMaterial({ color: fullRGBToHex(this.color.r, this.color.g, this.color.b),
                                                            transparent:true,
                                                            opacity: 0.5,
                                                            side: THREE.DoubleSide });
        //new THREE.MeshBasicMaterial( {color: fullRGBToHex(this.color.r, this.color.g, this.color.b), side: THREE.DoubleSide} );
        var planeWater = new THREE.Mesh( geometry, materialWater );
        this.scene.add(planeWater);


        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1));
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        planeWater.applyMatrix(mat4);

        planeWater.position.y = this.baseHeight - 2;

        // GROUND

        var texture, materialGround, planeGround;

        texture = new THREE.ImageUtils.loadTexture( '/img/dirtTerrain.jpeg' );
        texture.wrapS =  THREE.RepeatWrapping; 
        texture.wrapT =  THREE.RepeatWrapping;
        texture.repeat.set( 1, 1 ); 

        // var renderObj = {
        //   vShade: '/src/shaders/environ-vert.glsl',
        //   fShade: '/src/shaders/workingRef-frag_norm.glsl',
        // }

        // var workingMaterial = new THREE.ShaderMaterial({
        //   uniforms: {
        //     image: { // Check the Three.JS documentation for the different allowed types and values
        //       type: "t", 
        //       value: THREE.ImageUtils.loadTexture('/img/5.jpeg')
        //     }
        //   },
        //   vertexShader: require('./shaders/environ-vert.glsl'),
        //   fragmentShader: require('./shaders/workingRef-frag_norm.glsl')
        // });

        var geometryGround = new THREE.PlaneBufferGeometry( 1000, 1000, 10,10 );
        materialGround = new THREE.MeshLambertMaterial({ map : texture });
        planeGround = new THREE.Mesh(geometryGround, materialGround);
        planeGround.material.side =  THREE.DoubleSide;
        //planeGround.position.x = 100;

        planeGround.applyMatrix(mat4);

        // MAKE GROUND PLANE HAVE NOISE VARIATION

        // planeGround.geometry.dynamic = true;
        // console.log("HERE25");
        // for (var i = 0; i < planeGround.geometry.vertices.length; i++) {
        //     var heightAdd = this.findPerlinHeight(planeGround.geometry.vertices[i].position.x,
        //                                           planeGround.geometry.vertices[i].position.z);

        //     console.log("before adding to geometry pos attribute");
        //     planeGround.geometry.vertices[i].position.z += heightAdd;
            
        //     console.log("after adding to geometry pos attribute");
        //     console.log("here1: " + count);
        //     count += 1;
        // }
        //planeGround.geometry.verticesNeedUpdate = true;
        this.scene.add(planeGround);
    }

    makeValBetween0and1(val) {
        if (val < 0) {
            val += 1;
        } else if (val > 1) {
            val -= 1;
        }
    }

    // website reference: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
    finalTestsWithTemps(temp_1, temp_2, temp_color) {
        if (6 * temp_color < 1) {
            return temp_2 + (temp_1 - temp_2) * 6 * temp_color;
        } else if (2 * temp_color < 1) {
            return temp_1;
        } else if (3 * temp_color < 2) {
            return temp_2 + (temp_1 - temp_2) * (0.666 - temp_color) * 6;
        } else {
            return temp_2;
        }
    }


    // website references:
    //      http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
    //      http://serennu.com/colour/rgbtohsl.php
    calcColorCompl(currR, currG, currB) {
        // first converting to HSL

        var divR = currR / 255;
        var divG = currG / 255;
        var divB = currB / 255;

        var max = Math.max(divR, divG, divB);
        var min = Math.min(divR, divG, divB);

        var h = 0;
        var s = 0;
        var l = (max + min) / 2;

        var d = max - min;

        if (max == min) {
            h = 0;
            s = 0;
        } else {
            if (l > 0.5) {
                s = d / (2 - max - min);
            } else {
                s = d / (max + min);
            }
        }

        switch (max) {
            case divR: h = (divG - divB) / d; break;
            case divG: h = (divB - divR) / d + 2; break;
            case divB: h = (divR - divG) / d + 4; break;
        }

        h *= 60; // convert to deg on colored circle
        // keeping within 0 to 360
        if ( h < 0 ) { 
            h += 360;
        }
        // now have HSL values 

        // - find complement now so add 180 to h [rot on the color wheel]
        h += 180;
        // keeping within 0 to 360
        if (h > 360) {
            h -= 360;
        }

        // now convert back to rgb

        // no saturation (S)
        if (s == 0) {
            // then only luminance
            return new THREE.Vector3(l*255, l*255, l*255);
        }

        // otherwise continue with modifications for saturation
        // working with luminance
        var temp_1 = 0;
        if (l < 0.5) {
            temp_1 = l * (1.0 + s);
        } else if (l >= 0.5) {
            temp_1 = l + s - l * s;
        }
        var temp_2 = 2 * l - temp_1;

        // convert hue angle back to 1 (divide by 360)
        h /= 360;

        // temp r g b values based on hue
        var temp_R = h + 0.333;
        var temp_G = h = 0.536;
        var temp_B = h - 0.333;

        // temp colors need to be between 0 and 1
        this.makeValBetween0and1(temp_R);
        this.makeValBetween0and1(temp_G);
        this.makeValBetween0and1(temp_B);

        var working_R = this.finalTestsWithTemps(temp_1, temp_2, temp_R);
        var working_G = this.finalTestsWithTemps(temp_1, temp_2, temp_G);
        var working_B = this.finalTestsWithTemps(temp_1, temp_2, temp_B);

        // multiply by 255 to convert to 8 bit [hex]
        working_R *= 255;
        working_G *= 255;
        working_B *= 255;

        //console.log("IN COLOR: r:" + currR + " g:" + currG+" + b:" + currB);
        //console.log("COMPL COLOR: r:" + working_R + " g:" + working_G+" + b:" + working_B);

        return new THREE.Vector3(Math.floor(working_R), Math.floor(working_G), Math.floor(working_B));
    }

    goToPrevState() {
        var test = this.prevSavedStates.pop();

        if (test != null) {
            this.state = copyOneStateToNew(test); 
        }
    }

    saveCurrState() {
        //this.makeCylinder.bind(this, 1, 0.8);
        this.prevSavedStates.push( new TurtleState( new THREE.Vector3(this.state.pos.x, this.state.pos.y, this.state.pos.z ), 
                                                    new THREE.Vector3(this.state.dir.x, this.state.dir.y, this.state.dir.z ) ));
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
    
    // Make a cylinder of given length and width starting at turtle pos
    // Moves turtle pos ahead to end of the new cylinder
    makeCylinder(len, width) {
        var geometry = new THREE.CylinderGeometry(width, width, len);
        // var material = new THREE.MeshBasicMaterial( {color: 0x00cccc} );
        var material = new THREE.MeshBasicMaterial( {color: fullRGBToHex(this.color.r, this.color.g, this.color.b)} );
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
        this.moveForward(len/2.0);
    };
    
    // Call the function to which the input symbol is bound.
    // Look in the Turtle's constructor for examples of how to bind 
    // functions to grammar symbols.
    renderSymbol(symbolNode) {
        var func = this.renderGrammar[symbolNode.character];
        if (func) {
            func();
        }
    };

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(linkedList) {
        var currentNode;
        for(currentNode = linkedList.head; currentNode != null; currentNode = currentNode.next) {
            this.renderSymbol(currentNode);
        }
    }
}