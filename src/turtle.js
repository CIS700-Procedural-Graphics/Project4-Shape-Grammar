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
                '+' : this.rotateTurtle.bind(this, 25, 0, 0),
                '-' : this.rotateTurtle.bind(this, -25, 0, 0),
                'F' : this.makeCylinder.bind(this, 2, 0.1), // move forward 1 step

                // the ones i added
                'X' : this.doNothing(), // does nothing just to control curve
                'A' : this.rotateTurtle.bind(this, 0, -5, 35),
                'B' : this.rotateTurtle.bind(this, 0, 5, -35),
                'C' : this.drawFlower.bind(this, 1, 0.4),//this.makeCylinder.bind(this, 2, 0.5),//this.drawFlower.bind(this), //this.drawFlower(),
                // the ones required to implement
                '[' : this.saveCurrState.bind(this),
                ']' : this.goToPrevState.bind(this)
            };
        } else {
            this.renderGrammar = grammar;
        }

        this.color = {
            r : 30,
            g : 60,
            b : 240
        }
    }

    doNothing() {
        // NOTHING
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

    drawFlower(len, width) {
        var geometry = new THREE.SphereGeometry(width, 32, 32 );//new THREE.CylinderGeometry(width, width, len);
        // var material = new THREE.MeshBasicMaterial( {color: 0x00cccc} );

        var complColors = new THREE.Vector3(0, 0, 0);
        complColors = this.calcColorCompl(this.color.r, this.color.g, this.color.b);
        console.log("hex val of COMPL COLOR is : " + fullRGBToHex(complColors.x, complColors.y, complColors.z));
        var material = new THREE.MeshBasicMaterial( {color: fullRGBToHex(complColors.x, complColors.y, complColors.z)} );
        //var material = new THREE.MeshBasicMaterial( {color: fullRGBToHex(this.color.r, this.color.g, this.color.b)} );
        var sphere = new THREE.Mesh( geometry, material );
        this.scene.add( sphere );

        //Orient the cylinder to the turtle's current direction
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(1,0,0), this.state.dir);
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        sphere.applyMatrix(mat4);


        //Move the cylinder so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();

        // prevSavedStates.push(new TurtleState(new THREE.Vector3(this.state.dir.multiplyScalar(len/2.0)),
        //                                    new THREE.Vector3( this.state.dir.multiplyScalar(0.5 * len))
        //                                    ) ); //-HB

        var trans = this.state.pos.add(this.state.dir.multiplyScalar(len / 2.25));

        mat5.makeTranslation(trans.x, trans.y, trans.z);
        sphere.applyMatrix(mat5);

        //Scoot the turtle forward by len units
        this.moveForward(len/2 );
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

        // prevSavedStates.push(new TurtleState(new THREE.Vector3(this.state.dir.multiplyScalar(len/2.0)),
        //                                    new THREE.Vector3( this.state.dir.multiplyScalar(0.5 * len))
        //                                    ) ); //-HB

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